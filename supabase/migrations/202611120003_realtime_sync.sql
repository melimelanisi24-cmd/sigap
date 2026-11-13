do $$
declare
  table_name text;
begin
  if not exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) then
    raise exception 'Publication supabase_realtime tidak ditemukan';
  end if;

  foreach table_name in array array[
    'aspiration_attachments',
    'aspiration_responses',
    'aspirations',
    'categories',
    'complaint_attachments',
    'complaint_comment_reports',
    'complaint_comments',
    'complaint_reactions',
    'complaint_responses',
    'complaint_status_history',
    'complaints',
    'notifications',
    'profiles',
    'regions'
  ] loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = table_name
    ) then
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    end if;
  end loop;
end;
$$;

create table if not exists public.public_complaint_events (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null unique,
  operation text not null check (operation in ('insert', 'update', 'delete')),
  changed_at timestamptz not null default now()
);

alter table public.public_complaint_events enable row level security;
drop policy if exists "authenticated users receive public complaint updates"
  on public.public_complaint_events;
create policy "authenticated users receive public complaint updates"
  on public.public_complaint_events
  for select to authenticated using (true);
grant select on public.public_complaint_events to authenticated;

create table if not exists public.catalog_sync_events (
  catalog_name text primary key check (catalog_name in ('categories', 'regions')),
  changed_at timestamptz not null default now()
);

alter table public.catalog_sync_events enable row level security;
drop policy if exists "authenticated users receive catalog updates"
  on public.catalog_sync_events;
create policy "authenticated users receive catalog updates"
  on public.catalog_sync_events
  for select to authenticated using (true);
grant select on public.catalog_sync_events to authenticated;

create or replace function public.publish_catalog_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.catalog_sync_events (catalog_name, changed_at)
  values (tg_table_name, now())
  on conflict (catalog_name) do update
    set changed_at = excluded.changed_at;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists categories_publish_change on public.categories;
create trigger categories_publish_change
after insert or update or delete on public.categories
for each row execute function public.publish_catalog_change();

drop trigger if exists regions_publish_change on public.regions;
create trigger regions_publish_change
after insert or update or delete on public.regions
for each row execute function public.publish_catalog_change();

create or replace function public.publish_public_complaint_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  affected_complaint_id uuid;
  should_publish boolean := false;
begin
  if tg_op = 'DELETE' then
    affected_complaint_id := old.id;
    should_publish := old.is_public;
  else
    affected_complaint_id := new.id;
    should_publish := new.is_public;
    if tg_op = 'UPDATE' then
      should_publish := should_publish or old.is_public;
    end if;
  end if;

  if should_publish then
    insert into public.public_complaint_events (complaint_id, operation, changed_at)
    values (affected_complaint_id, lower(tg_op), now())
    on conflict (complaint_id) do update
      set operation = excluded.operation,
          changed_at = excluded.changed_at;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists complaints_publish_public_change on public.complaints;
create trigger complaints_publish_public_change
after insert or update or delete on public.complaints
for each row execute function public.publish_public_complaint_change();

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'catalog_sync_events',
    'public_complaint_events'
  ] loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = table_name
    ) then
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    end if;
  end loop;
end;
$$;
