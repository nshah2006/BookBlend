from dataclasses import dataclass
from typing import Annotated

from fastapi import Header, HTTPException, status

from app.services.supabase_client import get_supabase_admin_client


@dataclass
class AuthContext:
    token: str
    user_id: str
    email: str


def parse_bearer_token(
    authorization: Annotated[str | None, Header()] = None,
) -> str | None:
    if not authorization:
        return None
    if not authorization.startswith("Bearer "):
        return None
    return authorization[7:].strip()


def get_current_auth_context(
    authorization: Annotated[str | None, Header()] = None,
) -> AuthContext:
    token = parse_bearer_token(authorization)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )

    try:
        user_response = get_supabase_admin_client().auth.get_user(token)
        user = user_response.user
    except Exception as exc:
        text = str(exc).lower()
        if (
            "nodename nor servname provided" in text
            or "name or service not known" in text
            or "temporary failure in name resolution" in text
            or "connection refused" in text
            or "timed out" in text
        ):
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Authentication service is currently unavailable.",
            ) from exc
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        ) from exc

    if not user or not user.id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )

    return AuthContext(token=token, user_id=user.id, email=user.email or "")


def get_optional_auth_context(
    authorization: Annotated[str | None, Header()] = None,
) -> AuthContext | None:
    token = parse_bearer_token(authorization)
    if not token:
        return None

    try:
        user_response = get_supabase_admin_client().auth.get_user(token)
        user = user_response.user
    except Exception:
        return None

    if not user or not user.id:
        return None

    return AuthContext(token=token, user_id=user.id, email=user.email or "")
