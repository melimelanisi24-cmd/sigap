alter table public.profiles drop constraint if exists profiles_role_check;
update public.profiles set role = 'kepala_desa' where role = 'perangkat_desa';
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('warga', 'admin', 'kepala_desa', 'super_admin'));

alter table public.aspirations disable trigger aspirations_notify_status_change;
alter table public.aspirations drop constraint if exists aspirations_status_check;
update public.aspirations
set status = case status
  when 'ditinjau' then 'dipertimbangkan'
  when 'diproses' then 'ditindaklanjuti'
  when 'diterima' then 'dipertimbangkan'
  when 'ditolak' then 'tidak_dapat_direalisasikan'
  else status
end;
alter table public.aspirations
  add constraint aspirations_status_check
  check (status in ('baru', 'diterima', 'dipertimbangkan', 'ditindaklanjuti', 'selesai', 'tidak_dapat_direalisasikan'));
alter table public.aspirations enable trigger aspirations_notify_status_change;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  icon text not null default '📋',
  color text not null default 'bg-gray-50 text-gray-700 border-gray-200',
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.categories (name, icon, color) values
  ('Infrastruktur', '🏗️', 'bg-orange-50 text-orange-700 border-orange-200'),
  ('Kebersihan', '🧹', 'bg-emerald-50 text-emerald-700 border-emerald-200'),
  ('Keamanan', '🛡️', 'bg-red-50 text-red-700 border-red-200'),
  ('Pelayanan Publik', '🏛️', 'bg-blue-50 text-blue-700 border-blue-200'),
  ('Lingkungan', '🌿', 'bg-teal-50 text-teal-700 border-teal-200'),
  ('Kesehatan', '🏥', 'bg-rose-50 text-rose-700 border-rose-200'),
  ('Pendidikan', '📚', 'bg-amber-50 text-amber-700 border-amber-200'),
  ('Sosial', '👥', 'bg-purple-50 text-purple-700 border-purple-200'),
  ('Lainnya', '📋', 'bg-gray-50 text-gray-700 border-gray-200')
on conflict (name) do nothing;

create table if not exists public.complaint_status_history (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  changed_by uuid references public.profiles(id) on delete set null,
  old_status text,
  new_status text not null,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists complaint_status_history_complaint_created_idx
  on public.complaint_status_history(complaint_id, created_at);

create table if not exists public.complaint_responses (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  admin_id uuid not null references public.profiles(id) on delete restrict,
  response text not null check (char_length(trim(response)) between 1 and 5000),
  created_at timestamptz not null default now()
);
create index if not exists complaint_responses_complaint_created_idx
  on public.complaint_responses(complaint_id, created_at);

create table if not exists public.aspiration_responses (
  id uuid primary key default gen_random_uuid(),
  aspiration_id uuid not null references public.aspirations(id) on delete cascade,
  admin_id uuid not null references public.profiles(id) on delete restrict,
  response text not null check (char_length(trim(response)) between 1 and 5000),
  created_at timestamptz not null default now()
);
create index if not exists aspiration_responses_aspiration_created_idx
  on public.aspiration_responses(aspiration_id, created_at);

create or replace function public.prevent_profile_role_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null and new.role is distinct from old.role then
    raise exception 'Role hanya dapat diubah melalui prosedur administrasi tepercaya';
  end if;
  return new;
end;
$$;

create or replace function public.prevent_district_scope_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select auth.uid()) = old.id
    and old.role = 'kepala_desa'
    and new.district_code is distinct from old.district_code then
    raise exception 'Wilayah tugas kepala desa hanya dapat diubah oleh administrator tepercaya';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_change on public.profiles;
create trigger profiles_prevent_role_change
before update of role on public.profiles
for each row execute function public.prevent_profile_role_change();

drop trigger if exists profiles_prevent_district_scope_change on public.profiles;
create trigger profiles_prevent_district_scope_change
before update of district_code on public.profiles
for each row execute function public.prevent_district_scope_change();

create or replace function public.can_manage_district(target_district_code text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and (
        p.role in ('admin', 'super_admin')
        or (
          p.role = 'kepala_desa'
          and target_district_code is not null
          and p.district_code = target_district_code
        )
      )
  )
$$;

drop policy if exists "profiles are readable by owner or staff" on public.profiles;
create policy "profiles are readable by owner or staff" on public.profiles
for select to authenticated
using (
  id = (select auth.uid())
  or (select public.current_profile_role()) in ('admin', 'super_admin')
  or (
    (select public.current_profile_role()) = 'kepala_desa'
    and district_code = (select public.current_profile_district_code())
  )
);

drop policy if exists "admins manage regions" on public.regions;
create policy "admins manage regions" on public.regions
for all to authenticated
using ((select public.current_profile_role()) in ('admin', 'super_admin'))
with check ((select public.current_profile_role()) in ('admin', 'super_admin'));

alter table public.categories enable row level security;
alter table public.complaint_status_history enable row level security;
alter table public.complaint_responses enable row level security;
alter table public.aspiration_responses enable row level security;

drop policy if exists "active categories are readable" on public.categories;
create policy "active categories are readable" on public.categories
for select to anon, authenticated using (is_active);

drop policy if exists "admins read all categories" on public.categories;
create policy "admins read all categories" on public.categories
for select to authenticated
using ((select public.current_profile_role()) in ('admin', 'super_admin'));

drop policy if exists "admins manage categories" on public.categories;
create policy "admins manage categories" on public.categories
for all to authenticated
using ((select public.current_profile_role()) in ('admin', 'super_admin'))
with check ((select public.current_profile_role()) in ('admin', 'super_admin'));

drop policy if exists "status history visible to owner or staff" on public.complaint_status_history;
create policy "status history visible to owner or staff" on public.complaint_status_history
for select to authenticated
using (
  exists (
    select 1 from public.complaints c
    where c.id = complaint_id
      and (c.user_id = (select auth.uid()) or public.can_manage_district(c.district_code))
  )
);

drop policy if exists "official responses visible to owner or staff" on public.complaint_responses;
create policy "official responses visible to owner or staff" on public.complaint_responses
for select to authenticated
using (
  exists (
    select 1 from public.complaints c
    where c.id = complaint_id
      and (c.user_id = (select auth.uid()) or public.can_manage_district(c.district_code))
  )
);

drop policy if exists "staff add official responses" on public.complaint_responses;
create policy "staff add official responses" on public.complaint_responses
for insert to authenticated
with check (
  admin_id = (select auth.uid())
  and (select public.current_profile_role()) in ('admin', 'kepala_desa', 'super_admin')
  and exists (
    select 1 from public.complaints c
    where c.id = complaint_id and public.can_manage_district(c.district_code)
  )
);

drop policy if exists "aspiration responses visible to owner or staff" on public.aspiration_responses;
create policy "aspiration responses visible to owner or staff" on public.aspiration_responses
for select to authenticated
using (
  exists (
    select 1 from public.aspirations a
    where a.id = aspiration_id
      and (a.user_id = (select auth.uid()) or public.can_manage_district(a.district_code))
  )
);

drop policy if exists "staff add official aspiration responses" on public.aspiration_responses;
create policy "staff add official aspiration responses" on public.aspiration_responses
for insert to authenticated
with check (
  admin_id = (select auth.uid())
  and (select public.current_profile_role()) in ('admin', 'kepala_desa', 'super_admin')
  and exists (
    select 1 from public.aspirations a
    where a.id = aspiration_id and public.can_manage_district(a.district_code)
  )
);

create or replace function public.record_complaint_status_history()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.complaint_status_history (complaint_id, changed_by, old_status, new_status, note)
    values (new.id, new.user_id, null, new.status, 'Pengaduan dibuat.');
  elsif new.status is distinct from old.status then
    insert into public.complaint_status_history (complaint_id, changed_by, old_status, new_status, note)
    values (new.id, (select auth.uid()), old.status, new.status, new.staff_note);
  end if;
  return new;
end;
$$;

drop trigger if exists complaints_record_status_history on public.complaints;
create trigger complaints_record_status_history
after insert or update of status on public.complaints
for each row execute function public.record_complaint_status_history();

insert into public.complaint_status_history (complaint_id, changed_by, old_status, new_status, note, created_at)
select c.id, c.user_id, null, c.status, 'Status awal saat sistem riwayat diaktifkan.', c.created_at
from public.complaints c
where not exists (
  select 1 from public.complaint_status_history h where h.complaint_id = c.id
);

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at before update on public.categories
for each row execute function public.set_updated_at();

create or replace function public.get_admin_dashboard_stats()
returns table (
  total_complaints bigint,
  new_complaints bigint,
  processing_complaints bigint,
  completed_complaints bigint,
  total_aspirations bigint,
  total_residents bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor_role text;
  actor_district text;
begin
  select p.role, p.district_code into actor_role, actor_district
  from public.profiles p
  where p.id = (select auth.uid());
  if actor_role is null or actor_role not in ('admin', 'kepala_desa', 'super_admin') then
    raise exception 'Akses statistik hanya untuk pengelola';
  end if;

  return query
  select
    count(c.id),
    count(c.id) filter (where c.status = 'baru'),
    count(c.id) filter (where c.status = 'diproses'),
    count(c.id) filter (where c.status = 'selesai'),
    (select count(a.id) from public.aspirations a
      where actor_role in ('admin', 'super_admin') or a.district_code = actor_district),
    (select count(p.id) from public.profiles p
      where p.role = 'warga'
        and (actor_role in ('admin', 'super_admin') or p.district_code = actor_district))
  from public.complaints c
  where actor_role in ('admin', 'super_admin') or c.district_code = actor_district;
end;
$$;

grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant select on public.complaint_status_history to authenticated;
grant select, insert on public.complaint_responses to authenticated;
grant select, insert on public.aspiration_responses to authenticated;
grant execute on function public.prevent_profile_role_change() to authenticated;
grant execute on function public.prevent_district_scope_change() to authenticated;
grant execute on function public.record_complaint_status_history() to authenticated;
grant execute on function public.can_manage_district(text) to anon, authenticated;
grant execute on function public.get_admin_dashboard_stats() to authenticated;

-- Promote a user only from a trusted SQL session after confirming their Auth UUID:
-- update public.profiles set role = 'admin' where id = '<AUTH_USER_UUID>';
