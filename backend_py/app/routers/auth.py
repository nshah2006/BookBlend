from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.deps import AuthContext, get_current_auth_context
from app.schemas import AuthResponse, LoginInput, MeResponse, SignupInput
from app.services.domain import DEFAULT_AVATAR, fetch_profile, to_public_user, upsert_profile
from app.services.supabase_client import get_supabase_admin_client, get_supabase_public_client

router = APIRouter(tags=["auth"])


def _extract_error_message(exc: Exception, fallback: str) -> str:
    message = str(exc).strip()
    return message or fallback


def _resolve_profile(user_id: str, email: str, display_name: str | None = None) -> dict[str, Any]:
    profile = fetch_profile(user_id)
    if profile:
        return profile
    return upsert_profile(
        user_id=user_id,
        email=email,
        display_name=display_name,
        avatar_url=DEFAULT_AVATAR,
    )


@router.post("/auth/signup", response_model=AuthResponse)
def signup(payload: SignupInput) -> AuthResponse:
    try:
        result = get_supabase_public_client().auth.sign_up(
            {
                "email": payload.email.lower(),
                "password": payload.password,
                "options": {"data": {"display_name": payload.display_name}},
            }
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=_extract_error_message(exc, "An account with that email already exists."),
        ) from exc

    user = result.user
    if not user or not user.id:
        raise HTTPException(status_code=400, detail="Invalid signup payload.")

    session = result.session
    if not session or not session.access_token:
        try:
            login_result = get_supabase_public_client().auth.sign_in_with_password(
                {"email": payload.email.lower(), "password": payload.password}
            )
            session = login_result.session
        except Exception as exc:
            raise HTTPException(status_code=400, detail=_extract_error_message(exc, "Unable to sign in.")) from exc

    if not session or not session.access_token:
        raise HTTPException(
            status_code=400,
            detail="Signup succeeded but no session was returned. Check email confirmation settings.",
        )

    profile = _resolve_profile(user.id, payload.email.lower(), payload.display_name)
    return AuthResponse(token=session.access_token, user=to_public_user(profile))


@router.post("/auth/login", response_model=AuthResponse)
def login(payload: LoginInput) -> AuthResponse:
    try:
        result = get_supabase_public_client().auth.sign_in_with_password(
            {"email": payload.email.lower(), "password": payload.password}
        )
    except Exception as exc:
        raise HTTPException(status_code=401, detail=_extract_error_message(exc, "Incorrect email or password.")) from exc

    user = result.user
    session = result.session
    if not user or not user.id or not session or not session.access_token:
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

    profile = _resolve_profile(user.id, payload.email.lower(), user.user_metadata.get("display_name"))
    return AuthResponse(token=session.access_token, user=to_public_user(profile))


@router.post("/auth/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(auth: Annotated[AuthContext, Depends(get_current_auth_context)]) -> Response:
    try:
        get_supabase_admin_client().auth.admin.sign_out(auth.user_id)
    except Exception:
        # Token clearing on frontend still effectively logs out this app.
        pass
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/me", response_model=MeResponse)
def me(auth: Annotated[AuthContext, Depends(get_current_auth_context)]) -> MeResponse:
    profile = _resolve_profile(auth.user_id, auth.email)
    return MeResponse(user=to_public_user(profile))
