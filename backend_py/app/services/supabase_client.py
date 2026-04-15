from functools import lru_cache
import os
from urllib.parse import urlparse

from supabase import Client, create_client

from app.core import get_settings


def _ensure_no_proxy_for_host(url: str) -> None:
    host = urlparse(url).hostname
    if not host:
        return
    for env_key in ("NO_PROXY", "no_proxy"):
        current = os.getenv(env_key, "")
        entries = [entry.strip() for entry in current.split(",") if entry.strip()]
        if host not in entries:
            entries.append(host)
            os.environ[env_key] = ",".join(entries)


def _build_client(key: str) -> Client:
    settings = get_settings()
    if not settings.supabase_url or not key:
        raise RuntimeError("SUPABASE_URL and Supabase keys must be configured.")
    if settings.disable_http_proxy:
        _ensure_no_proxy_for_host(settings.supabase_url)
    return create_client(settings.supabase_url, key)


@lru_cache
def get_supabase_public_client() -> Client:
    settings = get_settings()
    return _build_client(settings.supabase_anon_key)


@lru_cache
def get_supabase_admin_client() -> Client:
    settings = get_settings()
    return _build_client(settings.supabase_service_role_key)
