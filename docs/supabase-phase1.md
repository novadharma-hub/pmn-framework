# Supabase Phase 1

This repo now includes the first migration scaffold for moving PMN from browser-only storage to a real backend.

## What is ready

- Environment template in [`/.env.example`](/C:/Users/Ali%20Ikhsan/Downloads/pmn-framework/.env.example)
- Supabase client scaffold in [`/src/lib/supabase.js`](/C:/Users/Ali%20Ikhsan/Downloads/pmn-framework/src/lib/supabase.js)
- Backend data helpers in [`/src/lib/pmn-backend.js`](/C:/Users/Ali%20Ikhsan/Downloads/pmn-framework/src/lib/pmn-backend.js)
- SQL schema with RLS in [`/supabase/schema.sql`](/C:/Users/Ali%20Ikhsan/Downloads/pmn-framework/supabase/schema.sql)

## What still needs to happen in Supabase

1. Create a Supabase project.
2. Open the SQL editor and run [`/supabase/schema.sql`](/C:/Users/Ali%20Ikhsan/Downloads/pmn-framework/supabase/schema.sql).
3. Create the first admin user with normal sign-up.
4. In the SQL editor, promote that user:

```sql
update public.profiles
set role = 'admin'
where username = 'your-username';
```

5. Copy project values into local `.env`:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Planned frontend migration order

1. Replace local admin login with Supabase Auth.
2. Replace version CRUD with `pmn_versions`.
3. Mirror notes, bookmarks, and reading progress into Supabase.
4. Keep local fallback only as an emergency/dev mode.
5. Later, ingest PMN sections/glossary/relations for backend retrieval.

## Important note

The current React app is still running in local mode today. The new files are a migration scaffold, not the final switch-over yet. That is intentional: it lets us stage the backend safely instead of breaking the current reader/admin flow in one jump.
