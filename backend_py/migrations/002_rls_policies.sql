alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.library_items enable row level security;
alter table public.recommendation_requests enable row level security;
alter table public.recommendation_results enable row level security;
alter table public.challenge_templates enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
for select using (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
for update using (auth.uid() = id);

drop policy if exists books_public_read on public.books;
create policy books_public_read on public.books
for select using (true);

drop policy if exists library_items_own_all on public.library_items;
create policy library_items_own_all on public.library_items
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists recommendation_requests_insert_self_or_anon on public.recommendation_requests;
create policy recommendation_requests_insert_self_or_anon on public.recommendation_requests
for insert
with check (user_id is null or auth.uid() = user_id);

drop policy if exists recommendation_requests_select_own on public.recommendation_requests;
create policy recommendation_requests_select_own on public.recommendation_requests
for select using (user_id is null or auth.uid() = user_id);

drop policy if exists recommendation_results_select_own_requests on public.recommendation_results;
create policy recommendation_results_select_own_requests on public.recommendation_results
for select using (
  exists (
    select 1
    from public.recommendation_requests rr
    where rr.id = recommendation_results.request_id
      and (rr.user_id is null or rr.user_id = auth.uid())
  )
);

drop policy if exists challenge_templates_public_read on public.challenge_templates;
create policy challenge_templates_public_read on public.challenge_templates
for select using (true);
