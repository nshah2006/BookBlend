from functools import lru_cache

from supabase import Client, create_client

from app.core import get_settings


def _build_client(key: str) -> Client:
    settings = get_settings()
    if not settings.supabase_url or not key:
        raise RuntimeError("SUPABASE_URL and Supabase keys must be configured.")
    return create_client(settings.supabase_url, key)


@lru_cache
def get_supabase_public_client() -> Client:
    settings = get_settings()
    return _build_client(settings.supabase_anon_key)


@lru_cache
def get_supabase_admin_client() -> Client:
    settings = get_settings()
    return _build_client(settings.supabase_service_role_key)
