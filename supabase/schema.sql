create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  role text not null default 'reader' check (role in ('reader', 'editor', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('editor', 'admin')
  );
$$;

create table if not exists public.pmn_versions (
  id uuid primary key default gen_random_uuid(),
  version_label text not null,
  release_date date not null,
  subtitle text not null default '',
  summary text not null default '',
  changelog text not null default '',
  pdf_url text not null default '',
  is_published boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists pmn_versions_version_label_idx
on public.pmn_versions (version_label);

create table if not exists public.pmn_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  actor_label text not null default 'unknown',
  action text not null,
  entity_type text not null default 'system',
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.pmn_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  manuscript_version text not null default 'v97',
  section_id text not null,
  note_text text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, manuscript_version, section_id)
);

create table if not exists public.pmn_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  manuscript_version text not null default 'v97',
  section_id text not null,
  label text not null default '',
  created_at timestamptz not null default now(),
  unique (user_id, manuscript_version, section_id)
);

create table if not exists public.pmn_reading_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  manuscript_version text not null default 'v97',
  part_code text,
  section_id text,
  completion_percent integer check (completion_percent between 0 and 100),
  last_read_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, manuscript_version)
);

create table if not exists public.pmn_sections (
  id uuid primary key default gen_random_uuid(),
  manuscript_version text not null default 'v97',
  part_code text not null,
  section_id text not null,
  title text not null,
  summary text not null default '',
  body_text text not null default '',
  body_html text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (manuscript_version, section_id)
);

create table if not exists public.pmn_glossary_terms (
  id uuid primary key default gen_random_uuid(),
  manuscript_version text not null default 'v97',
  term text not null,
  category text not null default 'Glossary',
  definition text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (manuscript_version, term)
);

create table if not exists public.pmn_section_relations (
  id uuid primary key default gen_random_uuid(),
  manuscript_version text not null default 'v97',
  from_section_id text not null,
  to_section_id text not null,
  relation_type text not null default 'related',
  weight numeric(6,3) not null default 1.0,
  created_at timestamptz not null default now(),
  unique (manuscript_version, from_section_id, to_section_id, relation_type)
);

alter table public.profiles enable row level security;
alter table public.pmn_versions enable row level security;
alter table public.pmn_audit_logs enable row level security;
alter table public.pmn_notes enable row level security;
alter table public.pmn_bookmarks enable row level security;
alter table public.pmn_reading_progress enable row level security;
alter table public.pmn_sections enable row level security;
alter table public.pmn_glossary_terms enable row level security;
alter table public.pmn_section_relations enable row level security;

drop policy if exists "Public can read published versions" on public.pmn_versions;
create policy "Public can read published versions"
on public.pmn_versions
for select
to anon, authenticated
using (is_published = true or public.is_admin());

drop policy if exists "Editors manage versions" on public.pmn_versions;
create policy "Editors manage versions"
on public.pmn_versions
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Editors read audit logs" on public.pmn_audit_logs;
create policy "Editors read audit logs"
on public.pmn_audit_logs
for select
to authenticated
using (public.is_admin());

drop policy if exists "Editors write audit logs" on public.pmn_audit_logs;
create policy "Editors write audit logs"
on public.pmn_audit_logs
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Users manage own notes" on public.pmn_notes;
create policy "Users manage own notes"
on public.pmn_notes
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users manage own bookmarks" on public.pmn_bookmarks;
create policy "Users manage own bookmarks"
on public.pmn_bookmarks
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users manage own progress" on public.pmn_reading_progress;
create policy "Users manage own progress"
on public.pmn_reading_progress
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Public can read sections" on public.pmn_sections;
create policy "Public can read sections"
on public.pmn_sections
for select
to anon, authenticated
using (true);

drop policy if exists "Editors manage sections" on public.pmn_sections;
create policy "Editors manage sections"
on public.pmn_sections
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read glossary" on public.pmn_glossary_terms;
create policy "Public can read glossary"
on public.pmn_glossary_terms
for select
to anon, authenticated
using (true);

drop policy if exists "Editors manage glossary" on public.pmn_glossary_terms;
create policy "Editors manage glossary"
on public.pmn_glossary_terms
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read section relations" on public.pmn_section_relations;
create policy "Public can read section relations"
on public.pmn_section_relations
for select
to anon, authenticated
using (true);

drop policy if exists "Editors manage section relations" on public.pmn_section_relations;
create policy "Editors manage section relations"
on public.pmn_section_relations
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
