-- Türk Tudun: üye ve site verisi için Supabase Postgres
-- Supabase SQL Editor'da veya: supabase db push

create extension if not exists "pgcrypto";

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  lineage_key text not null unique,
  rank text not null default '',
  full_name text not null,
  sector text not null default '',
  brand text not null default '',
  materials text not null default '',
  location text not null default '',
  contact text not null default '',
  digital_contact text not null default '',
  reference text not null default '',
  source text not null default 'supabase',
  approval_status text not null default 'approved'
    check (approval_status in ('approved', 'pending', 'rejected')),
  is_excluded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_members_list on public.members (is_excluded, approval_status);
create index if not exists idx_members_name on public.members (full_name);

create table if not exists public.membership_applications (
  id uuid primary key default gen_random_uuid(),
  payload jsonb not null,
  submitted_at timestamptz not null default now()
);

create index if not exists idx_membership_apps_submitted on public.membership_applications (submitted_at desc);

create table if not exists public.site_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

create table if not exists public.home_content (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.analytics_counters (
  category text not null,
  field text not null,
  value bigint not null default 0,
  primary key (category, field)
);

create or replace function public.analytics_increment(
  p_category text,
  p_field text,
  p_delta bigint default 1
)
returns void
language plpgsql
as $$
begin
  insert into public.analytics_counters (category, field, value)
  values (p_category, p_field, p_delta)
  on conflict (category, field)
  do update set value = public.analytics_counters.value + excluded.value;
end;
$$;

-- RLS kullanılmıyor: Next.js API/route’ları yalnızca sunucuda SUPABASE_SERVICE_ROLE_KEY ile erişir.
