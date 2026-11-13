create extension if not exists pgcrypto;

create table if not exists public.regions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  type text not null check (type in ('province', 'regency', 'district', 'village')),
  parent_code text references public.regions(code) on update cascade on delete restrict,
  created_at timestamptz not null default now(),
  unique (code, type),
  check (
    (type = 'province' and parent_code is null)
    or (type <> 'province' and parent_code is not null)
  )
);

create index if not exists regions_parent_code_idx on public.regions(parent_code);
create index if not exists regions_type_name_idx on public.regions(type, name);

create or replace function public.validate_region_parent()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  expected_parent_type text;
  actual_parent_type text;
begin
  if new.type = 'province' then
    return new;
  end if;

  expected_parent_type := case new.type
    when 'regency' then 'province'
    when 'district' then 'regency'
    when 'village' then 'district'
  end;

  select r.type into actual_parent_type
  from public.regions r
  where r.code = new.parent_code;

  if actual_parent_type is distinct from expected_parent_type then
    raise exception 'Parent wilayah untuk tipe % harus bertipe %', new.type, expected_parent_type;
  end if;
  return new;
end;
$$;

drop trigger if exists regions_validate_parent on public.regions;
create trigger regions_validate_parent before insert or update on public.regions
for each row execute function public.validate_region_parent();

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  nik text,
  role text not null default 'warga'
    check (role in ('warga', 'admin', 'perangkat_desa', 'kepala_desa')),
  province_code text references public.regions(code) on update cascade on delete set null,
  regency_code text references public.regions(code) on update cascade on delete set null,
  district_code text references public.regions(code) on update cascade on delete set null,
  village_code text references public.regions(code) on update cascade on delete set null,
  kampung text,
  rw text,
  rt text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  complaint_code text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  title text not null,
  description text not null,
  status text not null default 'baru'
    check (status in ('baru', 'diverifikasi', 'diproses', 'selesai', 'ditolak')),
  province_code text references public.regions(code) on update cascade on delete set null,
  regency_code text references public.regions(code) on update cascade on delete set null,
  district_code text references public.regions(code) on update cascade on delete set null,
  village_code text references public.regions(code) on update cascade on delete set null,
  kampung text,
  rw text,
  rt text,
  location_detail text,
  is_public boolean not null default true,
  assigned_unit text,
  staff_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists complaints_user_created_idx on public.complaints(user_id, created_at desc);
create index if not exists complaints_public_region_idx
  on public.complaints(is_public, village_code, district_code, created_at desc);

create table if not exists public.complaint_attachments (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null unique,
  file_name text not null,
  content_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.complaint_comments (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_comment_id uuid references public.complaint_comments(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 280),
  display_name text not null default 'Warga',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists complaint_comments_complaint_created_idx
  on public.complaint_comments(complaint_id, created_at);

create table if not exists public.complaint_reactions (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction_type text not null default 'support',
  created_at timestamptz not null default now(),
  unique (complaint_id, user_id, reaction_type)
);

create table if not exists public.aspirations (
  id uuid primary key default gen_random_uuid(),
  aspiration_code text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  status text not null default 'baru'
    check (status in ('baru', 'ditinjau', 'diproses', 'diterima', 'selesai', 'ditolak')),
  province_code text references public.regions(code) on update cascade on delete set null,
  regency_code text references public.regions(code) on update cascade on delete set null,
  district_code text references public.regions(code) on update cascade on delete set null,
  village_code text references public.regions(code) on update cascade on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists aspirations_user_created_idx on public.aspirations(user_id, created_at desc);

create table if not exists public.complaint_comment_reports (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.complaint_comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (comment_id, user_id)
);

create table if not exists public.aspiration_attachments (
  id uuid primary key default gen_random_uuid(),
  aspiration_id uuid not null references public.aspirations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null unique,
  file_name text not null,
  content_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  related_complaint_id uuid references public.complaints(id) on delete set null,
  related_aspiration_id uuid references public.aspirations(id) on delete set null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx on public.notifications(user_id, created_at desc);

create or replace view public.public_complaints as
select
  c.id,
  c.complaint_code,
  c.category,
  c.title,
  c.description,
  c.status,
  c.province_code,
  c.regency_code,
  c.district_code,
  c.village_code,
  c.created_at,
  c.updated_at,
  c.assigned_unit,
  c.staff_note
from public.complaints c
where c.is_public;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists complaints_set_updated_at on public.complaints;
create trigger complaints_set_updated_at before update on public.complaints
for each row execute function public.set_updated_at();

drop trigger if exists complaint_comments_set_updated_at on public.complaint_comments;
create trigger complaint_comments_set_updated_at before update on public.complaint_comments
for each row execute function public.set_updated_at();

drop trigger if exists aspirations_set_updated_at on public.aspirations;
create trigger aspirations_set_updated_at before update on public.aspirations
for each row execute function public.set_updated_at();

create or replace function public.set_submission_code()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  prefix text;
begin
  prefix := case when tg_table_name = 'complaints' then 'SGP' else 'ASP' end;
  if tg_table_name = 'complaints' and new.complaint_code is null then
    new.complaint_code := prefix || '-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(new.id::text, '-', ''), 1, 8));
  elsif tg_table_name = 'aspirations' and new.aspiration_code is null then
    new.aspiration_code := prefix || '-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(new.id::text, '-', ''), 1, 8));
  end if;
  return new;
end;
$$;

drop trigger if exists complaints_set_code on public.complaints;
create trigger complaints_set_code before insert on public.complaints
for each row execute function public.set_submission_code();

drop trigger if exists aspirations_set_code on public.aspirations;
create trigger aspirations_set_code before insert on public.aspirations
for each row execute function public.set_submission_code();

create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.role from public.profiles p where p.id = (select auth.uid())
$$;

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
        p.role = 'admin'
        or (
          p.role in ('perangkat_desa', 'kepala_desa')
          and target_district_code is not null
          and p.district_code = target_district_code
        )
      )
  )
$$;

create or replace function public.is_public_complaint(target_complaint_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.complaints c
    where c.id = target_complaint_id and c.is_public
  )
$$;

create or replace function public.notify_complaint_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    insert into public.notifications (user_id, type, title, message, related_complaint_id)
    values (
      new.user_id,
      'complaint_status',
      'Status pengaduan diperbarui',
      'Pengaduan ' || new.complaint_code || ' berubah menjadi ' || new.status || '.',
      new.id
    );
  end if;
  return new;
end;
$$;

drop trigger if exists complaints_notify_status_change on public.complaints;
create trigger complaints_notify_status_change after update on public.complaints
for each row execute function public.notify_complaint_status_change();

create or replace function public.notify_new_complaint_comment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  complaint_owner uuid;
begin
  select user_id into complaint_owner
  from public.complaints where id = new.complaint_id;
  if complaint_owner is not null and complaint_owner <> new.user_id then
    insert into public.notifications (user_id, type, title, message, related_complaint_id)
    values (complaint_owner, 'complaint_comment', 'Komentar baru pada pengaduan', 'Pengaduan Anda menerima komentar baru.', new.complaint_id);
  end if;
  return new;
end;
$$;

drop trigger if exists complaint_comments_notify_owner on public.complaint_comments;
create trigger complaint_comments_notify_owner after insert on public.complaint_comments
for each row execute function public.notify_new_complaint_comment();

create or replace function public.notify_aspiration_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    insert into public.notifications (user_id, type, title, message, related_aspiration_id)
    values (
      new.user_id,
      'aspiration_status',
      'Status aspirasi diperbarui',
      'Aspirasi ' || new.aspiration_code || ' berubah menjadi ' || new.status || '.',
      new.id
    );
  end if;
  return new;
end;
$$;

drop trigger if exists aspirations_notify_status_change on public.aspirations;
create trigger aspirations_notify_status_change after update on public.aspirations
for each row execute function public.notify_aspiration_status_change();

create or replace function public.current_profile_district_code()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.district_code from public.profiles p where p.id = (select auth.uid())
$$;

create or replace function public.validate_record_region_hierarchy()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  province_parent text;
  regency_parent text;
  district_parent text;
begin
  if new.province_code is not null then
    perform 1 from public.regions where code = new.province_code and type = 'province';
    if not found then raise exception 'Kode provinsi tidak valid'; end if;
  end if;
  if new.regency_code is not null then
    select parent_code into province_parent from public.regions
    where code = new.regency_code and type = 'regency';
    if not found or (new.province_code is not null and province_parent <> new.province_code) then
      raise exception 'Kabupaten/kota tidak sesuai dengan provinsi';
    end if;
  end if;
  if new.district_code is not null then
    select parent_code into regency_parent from public.regions
    where code = new.district_code and type = 'district';
    if not found or (new.regency_code is not null and regency_parent <> new.regency_code) then
      raise exception 'Kecamatan tidak sesuai dengan kabupaten/kota';
    end if;
  end if;
  if new.village_code is not null then
    select parent_code into district_parent from public.regions
    where code = new.village_code and type = 'village';
    if not found or (new.district_code is not null and district_parent <> new.district_code) then
      raise exception 'Desa/kelurahan tidak sesuai dengan kecamatan';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_validate_region_hierarchy on public.profiles;
create trigger profiles_validate_region_hierarchy before insert or update on public.profiles
for each row execute function public.validate_record_region_hierarchy();

drop trigger if exists complaints_validate_region_hierarchy on public.complaints;
create trigger complaints_validate_region_hierarchy before insert or update on public.complaints
for each row execute function public.validate_record_region_hierarchy();

drop trigger if exists aspirations_validate_region_hierarchy on public.aspirations;
create trigger aspirations_validate_region_hierarchy before insert or update on public.aspirations
for each row execute function public.validate_record_region_hierarchy();

create or replace function public.set_comment_display_name()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select coalesce(nullif(p.full_name, ''), 'Warga')
  into new.display_name
  from public.profiles p
  where p.id = new.user_id;
  new.display_name := coalesce(new.display_name, 'Warga');
  return new;
end;
$$;

drop trigger if exists complaint_comments_set_display_name on public.complaint_comments;
create trigger complaint_comments_set_display_name before insert on public.complaint_comments
for each row execute function public.set_comment_display_name();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id, full_name, email, phone, nik,
    province_code, regency_code, district_code, village_code, rw, rt
  )
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    new.email,
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    nullif(new.raw_user_meta_data ->> 'nik', ''),
    nullif(new.raw_user_meta_data ->> 'province_code', ''),
    nullif(new.raw_user_meta_data ->> 'regency_code', ''),
    nullif(new.raw_user_meta_data ->> 'district_code', ''),
    nullif(new.raw_user_meta_data ->> 'village_code', ''),
    nullif(new.raw_user_meta_data ->> 'rw', ''),
    nullif(new.raw_user_meta_data ->> 'rt', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.regions enable row level security;
alter table public.profiles enable row level security;
alter table public.complaints enable row level security;
alter table public.complaint_attachments enable row level security;
alter table public.complaint_comments enable row level security;
alter table public.complaint_reactions enable row level security;
alter table public.aspirations enable row level security;
alter table public.aspiration_attachments enable row level security;
alter table public.notifications enable row level security;
alter table public.complaint_comment_reports enable row level security;

drop policy if exists "regions are readable by everyone" on public.regions;
create policy "regions are readable by everyone" on public.regions
for select to anon, authenticated using (true);

drop policy if exists "admins manage regions" on public.regions;
create policy "admins manage regions" on public.regions
for all to authenticated
using ((select public.current_profile_role()) = 'admin')
with check ((select public.current_profile_role()) = 'admin');

drop policy if exists "profiles are readable by owner or staff" on public.profiles;
create policy "profiles are readable by owner or staff" on public.profiles
for select to authenticated
using (
  id = (select auth.uid())
  or (select public.current_profile_role()) = 'admin'
  or (
    (select public.current_profile_role()) in ('perangkat_desa', 'kepala_desa')
    and district_code = (select public.current_profile_district_code())
  )
);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile" on public.profiles
for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()) and role = (select public.current_profile_role()));

drop policy if exists "complaints visible to owner or public" on public.complaints;
drop policy if exists "complaints visible to owner or assigned staff" on public.complaints;
create policy "complaints visible to owner or assigned staff" on public.complaints
for select to anon, authenticated
using (user_id = (select auth.uid()) or (select public.can_manage_district(district_code)));

drop policy if exists "users create own complaints" on public.complaints;
create policy "users create own complaints" on public.complaints
for insert to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "staff update assigned complaints" on public.complaints;
create policy "staff update assigned complaints" on public.complaints
for update to authenticated
using ((select public.can_manage_district(district_code)))
with check ((select public.can_manage_district(district_code)));

drop policy if exists "users delete own new complaints" on public.complaints;
create policy "users delete own new complaints" on public.complaints
for delete to authenticated
using (user_id = (select auth.uid()) and status = 'baru');

drop policy if exists "attachments visible with complaint" on public.complaint_attachments;
create policy "attachments visible with complaint" on public.complaint_attachments
for select to authenticated
using (
  user_id = (select auth.uid())
  or public.is_public_complaint(complaint_id)
  or exists (
    select 1 from public.complaints c
    where c.id = complaint_id and public.can_manage_district(c.district_code)
  )
);

drop policy if exists "users add own complaint attachments" on public.complaint_attachments;
create policy "users add own complaint attachments" on public.complaint_attachments
for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.complaints c
    where c.id = complaint_id and c.user_id = (select auth.uid())
  )
);

drop policy if exists "users delete own complaint attachments" on public.complaint_attachments;
create policy "users delete own complaint attachments" on public.complaint_attachments
for delete to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "comments visible on public complaints" on public.complaint_comments;
create policy "comments visible on public complaints" on public.complaint_comments
for select to authenticated
using (
  user_id = (select auth.uid())
  or public.is_public_complaint(complaint_id)
  or exists (
    select 1 from public.complaints c
    where c.id = complaint_id and public.can_manage_district(c.district_code)
  )
);

drop policy if exists "users comment on public complaints" on public.complaint_comments;
create policy "users comment on public complaints" on public.complaint_comments
for insert to authenticated
with check (
  user_id = (select auth.uid())
  and public.is_public_complaint(complaint_id)
  and (
    parent_comment_id is null
    or exists (
      select 1 from public.complaint_comments parent
      where parent.id = parent_comment_id and parent.complaint_id = complaint_id
    )
  )
);

drop policy if exists "users update own comments" on public.complaint_comments;
create policy "users update own comments" on public.complaint_comments
for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "users delete own comments" on public.complaint_comments;
create policy "users delete own comments" on public.complaint_comments
for delete to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "users read own comment reports" on public.complaint_comment_reports;
create policy "users read own comment reports" on public.complaint_comment_reports
for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "users report comments once" on public.complaint_comment_reports;
create policy "users report comments once" on public.complaint_comment_reports
for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.complaint_comments comment
    where comment.id = public.complaint_comment_reports.comment_id
      and public.is_public_complaint(comment.complaint_id)
  )
);

drop policy if exists "reactions visible on public complaints" on public.complaint_reactions;
create policy "reactions visible on public complaints" on public.complaint_reactions
for select to authenticated
using (
  user_id = (select auth.uid())
  or public.is_public_complaint(complaint_id)
);

drop policy if exists "users react to public complaints" on public.complaint_reactions;
create policy "users react to public complaints" on public.complaint_reactions
for insert to authenticated
with check (
  user_id = (select auth.uid())
  and public.is_public_complaint(complaint_id)
);

drop policy if exists "users remove own reactions" on public.complaint_reactions;
create policy "users remove own reactions" on public.complaint_reactions
for delete to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "aspirations visible to owner or staff" on public.aspirations;
create policy "aspirations visible to owner or staff" on public.aspirations
for select to authenticated
using (
  user_id = (select auth.uid())
  or (select public.can_manage_district(district_code))
);

drop policy if exists "users create own aspirations" on public.aspirations;
create policy "users create own aspirations" on public.aspirations
for insert to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "staff update assigned aspirations" on public.aspirations;
create policy "staff update assigned aspirations" on public.aspirations
for update to authenticated
using ((select public.can_manage_district(district_code)))
with check ((select public.can_manage_district(district_code)));

drop policy if exists "users delete own new aspirations" on public.aspirations;
create policy "users delete own new aspirations" on public.aspirations
for delete to authenticated
using (user_id = (select auth.uid()) and status = 'baru');

drop policy if exists "aspiration attachments visible with aspiration" on public.aspiration_attachments;
create policy "aspiration attachments visible with aspiration" on public.aspiration_attachments
for select to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1 from public.aspirations a
    where a.id = aspiration_id and public.can_manage_district(a.district_code)
  )
);

drop policy if exists "users add own aspiration attachments" on public.aspiration_attachments;
create policy "users add own aspiration attachments" on public.aspiration_attachments
for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.aspirations a
    where a.id = aspiration_id and a.user_id = (select auth.uid())
  )
);

drop policy if exists "users delete own aspiration attachments" on public.aspiration_attachments;
create policy "users delete own aspiration attachments" on public.aspiration_attachments
for delete to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "users read own notifications" on public.notifications;
create policy "users read own notifications" on public.notifications
for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "users mark own notifications read" on public.notifications;
create policy "users mark own notifications read" on public.notifications
for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'complaint-attachments',
  'complaint-attachments',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'aspiration-attachments',
  'aspiration-attachments',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "users upload own attachment paths" on storage.objects;
create policy "users upload own attachment paths" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'complaint-attachments'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "users read authorized attachment paths" on storage.objects;
create policy "users read authorized attachment paths" on storage.objects
for select to authenticated
using (
  bucket_id = 'complaint-attachments'
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or exists (
      select 1 from public.complaint_attachments a
      where a.storage_path = name and public.is_public_complaint(a.complaint_id)
    )
    or exists (
      select 1 from public.complaint_attachments a
      join public.complaints c on c.id = a.complaint_id
      where a.storage_path = name and public.can_manage_district(c.district_code)
    )
  )
);

drop policy if exists "users delete own attachment paths" on storage.objects;
create policy "users delete own attachment paths" on storage.objects
for delete to authenticated
using (
  bucket_id = 'complaint-attachments'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "users upload own aspiration attachment paths" on storage.objects;
create policy "users upload own aspiration attachment paths" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'aspiration-attachments'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "users read own aspiration attachment paths" on storage.objects;
create policy "users read own aspiration attachment paths" on storage.objects
for select to authenticated
using (
  bucket_id = 'aspiration-attachments'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "users delete own aspiration attachment paths" on storage.objects;
create policy "users delete own aspiration attachment paths" on storage.objects
for delete to authenticated
using (
  bucket_id = 'aspiration-attachments'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

grant select on public.regions to anon, authenticated;
grant select on public.public_complaints to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update on public.complaints to authenticated;
grant select, insert, update, delete on public.complaint_attachments to authenticated;
grant select, insert, update, delete on public.complaint_comments to authenticated;
grant select, insert, delete on public.complaint_reactions to authenticated;
grant select, insert on public.complaint_comment_reports to authenticated;
grant select, insert, update on public.aspirations to authenticated;
grant select, insert, update, delete on public.aspiration_attachments to authenticated;
grant select, update on public.notifications to authenticated;

grant execute on function public.current_profile_role() to authenticated;
grant execute on function public.current_profile_district_code() to authenticated;
grant execute on function public.can_manage_district(text) to anon, authenticated;
grant execute on function public.is_public_complaint(uuid) to anon, authenticated;
