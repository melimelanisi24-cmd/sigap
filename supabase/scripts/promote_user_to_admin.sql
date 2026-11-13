-- Replace the UUID below with the target user's auth.users.id.
-- Run only from a trusted Supabase SQL Editor session; never expose this as a public UI action.
update public.profiles
set role = 'admin'
where id = '00000000-0000-0000-0000-000000000000';

select id, full_name, role
from public.profiles
where id = '00000000-0000-0000-0000-000000000000';
