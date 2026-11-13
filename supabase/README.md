# Supabase setup

1. Apply `migrations/202611120001_initial_schema.sql` in the Supabase SQL Editor.
2. Apply `migrations/202611120002_roles_and_admin.sql`.
3. Apply `migrations/202611120003_realtime_sync.sql` to enable cross-session updates.
4. Import the verified administrative-region master data into `public.regions`.
5. Configure the Vite environment variables and restart the dev server.
6. To assign an administrator, copy the target user's UUID from Supabase Auth and use `scripts/promote_user_to_admin.sql` in a trusted SQL Editor session. Replace the placeholder UUID before running it.

Public registration does not accept a role. The database creates new profiles with the `warga` role, and authenticated users cannot change their own role. The SQL promotion script must never be exposed through the frontend.

There are no built-in demo accounts. Create real accounts through registration
and promote a real account to staff only through the trusted SQL procedure above.
All application records are stored in Supabase; complaint discussion, reports,
and support reactions are also persisted there. Realtime subscriptions refresh
shared records when they change.
