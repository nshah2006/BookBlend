-- BookBlend: initial schema for Supabase (Postgres)
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).

-- ============================================================
-- 1. profiles
-- ============================================================
-- Stores public user data. The id matches the Supabase auth.users UUID.
-- domain.py: fetch_profile, upsert_profile (on_conflict="id"), to_public_user, build_leaderboard
create table if not exists public.profiles (
    id          uuid primary key,
    email       text not null,
    display_name text not null default 'BookBlend Reader',
    avatar_url  text not null default '',
    created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- ============================================================
-- 2. books
-- ============================================================
-- Static catalog. IDs are short text strings ("1", "2", …) matching the
-- Express seed data. genre is a JSONB array so PostgREST .contains() works.
-- domain.py: get_books (ilike, contains, eq), get_book_or_404, fetch_books_map (.in_)
create table if not exists public.books (
    id             text primary key,
    title          text not null,
    author         text not null,
    description    text not null default '',
    cover_image    text not null default '',
    genre          jsonb not null default '[]'::jsonb,
    rating         numeric(3,1) not null default 0.0,
    published_date text not null default '',
    is_featured    boolean not null default false
);

alter table public.books enable row level security;

-- ============================================================
-- 3. library_items
-- ============================================================
-- Per-user book shelf entries. Composite unique on (user_id, book_id)
-- so upsert_library_item's on_conflict="user_id,book_id" works.
-- domain.py: fetch_library_rows, upsert_library_item, update_library_item, delete_library_item
create table if not exists public.library_items (
    user_id          uuid not null references public.profiles(id) on delete cascade,
    book_id          text not null references public.books(id) on delete cascade,
    status           text not null default 'reading'
                     check (status in ('reading', 'wishlist', 'completed')),
    progress_percent integer not null default 0
                     check (progress_percent between 0 and 100),
    pages_read       integer not null default 0
                     check (pages_read >= 0),
    saved_at         timestamptz not null default now(),
    started_at       timestamptz,
    finished_at      timestamptz,

    primary key (user_id, book_id)
);

alter table public.library_items enable row level security;

-- ============================================================
-- 4. recommendation_requests
-- ============================================================
-- One row per vibe-check submission. user_id is nullable because
-- unauthenticated visitors can also generate recommendations.
-- domain.py: create_recommendation_request (insert), fetch_requests_rows (.eq user_id)
-- Reads: id, user_id, mood, pacing, depth, created_at
create table if not exists public.recommendation_requests (
    id         uuid primary key default gen_random_uuid(),
    user_id    uuid references public.profiles(id) on delete set null,
    mood       text not null,
    pacing     integer not null check (pacing between 0 and 100),
    depth      integer not null check (depth between 0 and 100),
    created_at timestamptz not null default now()
);

alter table public.recommendation_requests enable row level security;

-- ============================================================
-- 5. recommendation_results
-- ============================================================
-- Scored book results linked to a request. One row per recommended book.
-- domain.py: create_recommendation_request (bulk insert), build_insights (.eq request_id, .order rank)
-- Reads: id, request_id, book_id, score, reason, rank
create table if not exists public.recommendation_results (
    id         uuid primary key default gen_random_uuid(),
    request_id uuid not null references public.recommendation_requests(id) on delete cascade,
    book_id    text not null references public.books(id) on delete cascade,
    score      integer not null default 0,
    reason     text not null default '',
    rank       integer not null default 1
);

alter table public.recommendation_results enable row level security;

-- ============================================================
-- Indexes for common query patterns
-- ============================================================
create index if not exists idx_library_items_user_id
    on public.library_items (user_id);

create index if not exists idx_recommendation_requests_user_id
    on public.recommendation_requests (user_id);

create index if not exists idx_recommendation_results_request_id
    on public.recommendation_results (request_id);

create index if not exists idx_recommendation_results_request_rank
    on public.recommendation_results (request_id, rank);

create index if not exists idx_books_is_featured
    on public.books (is_featured) where is_featured = true;
