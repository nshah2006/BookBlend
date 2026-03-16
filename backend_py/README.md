# BookBlend FastAPI Backend

Parallel-cutover Python backend for BookBlend using FastAPI + Supabase.

## Quick Start

1. Copy `.env.example` to `.env` and fill in Supabase values.
2. Create a virtual environment and install dependencies:
   - `python3 -m venv .venv`
   - `source .venv/bin/activate`
   - `pip install -r requirements.txt`
3. Run:
   - `uvicorn app.main:app --reload --port 8000`

## Project Layout

- `app/main.py`: app factory and middleware.
- `app/core/`: settings and shared configuration.
- `app/routers/`: route modules.
- `app/services/`: Supabase access and domain services.
- `migrations/`: SQL schema, RLS, and seed scripts.

## Migration Goal

This service is built to match the existing frontend API contracts in
`frontend/src/app/lib/api.ts` while replacing the Express backend.
