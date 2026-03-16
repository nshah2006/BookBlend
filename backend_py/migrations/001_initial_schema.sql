create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  display_name text not null,
  avatar_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.books (
  id text primary key,
  title text not null,
  author text not null,
  description text not null,
  cover_image text not null,
  genre jsonb not null default '[]'::jsonb,
  rating numeric(2, 1) not null default 0,
  published_date text not null,
  is_featured boolean not null default false
);

create table if not exists public.library_items (
  user_id uuid not null references public.profiles (id) on delete cascade,
  book_id text not null references public.books (id) on delete cascade,
  status text not null check (status in ('reading', 'wishlist', 'completed')),
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  pages_read integer not null default 0 check (pages_read >= 0),
  saved_at timestamptz not null default now(),
  started_at timestamptz null,
  finished_at timestamptz null,
  primary key (user_id, book_id)
);

create table if not exists public.recommendation_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references public.profiles (id) on delete set null,
  mood text not null,
  pacing integer not null check (pacing between 0 and 100),
  depth integer not null check (depth between 0 and 100),
  created_at timestamptz not null default now()
);

create table if not exists public.recommendation_results (
  id bigint generated always as identity primary key,
  request_id uuid not null references public.recommendation_requests (id) on delete cascade,
  book_id text not null references public.books (id) on delete cascade,
  score integer not null,
  reason text not null,
  rank integer not null check (rank > 0),
  unique (request_id, rank)
);

create table if not exists public.challenge_templates (
  id text primary key,
  title text not null,
  description text not null,
  reward text not null
);

create index if not exists idx_library_items_user on public.library_items (user_id);
create index if not exists idx_library_items_book on public.library_items (book_id);
create index if not exists idx_recommendation_requests_user on public.recommendation_requests (user_id);
create index if not exists idx_recommendation_requests_created_at on public.recommendation_requests (created_at desc);
