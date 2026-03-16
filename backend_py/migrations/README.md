# Supabase Migration Order

Run these SQL files in order using Supabase SQL editor or migration tooling:

1. `001_initial_schema.sql`
2. `002_rls_policies.sql`
3. `003_seed_books_and_challenges.sql`

Notes:
- Backend endpoints use the service role key, so server-side calls can bypass RLS as needed.
- Policies are still defined so direct client access remains protected and owner-scoped.
