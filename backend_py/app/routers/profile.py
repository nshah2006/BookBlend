from typing import Annotated

from fastapi import APIRouter, Depends

from app.deps import AuthContext, get_current_auth_context
from app.schemas import HistoryResponse, ProfileInsight, ProfileResponse, ProfileStats
from app.services.domain import (
    build_challenges,
    build_history,
    build_insights,
    build_profile_stats,
    fetch_requests_rows,
    fetch_profile,
    get_user_library_with_books,
    to_public_user,
    upsert_profile,
)

router = APIRouter(tags=["profile"])


def _load_user_data(user_id: str) -> tuple[list[dict], dict, list[dict]]:
    library_rows, books_map = get_user_library_with_books(user_id)
    request_rows = fetch_requests_rows(user_id)
    return library_rows, books_map, request_rows


@router.get("/me/profile", response_model=ProfileResponse)
def get_profile(auth: Annotated[AuthContext, Depends(get_current_auth_context)]) -> ProfileResponse:
    profile = fetch_profile(auth.user_id) or upsert_profile(auth.user_id, auth.email)
    library_rows, books_map, request_rows = _load_user_data(auth.user_id)
    challenges = build_challenges(library_rows, request_rows)
    stats = build_profile_stats(library_rows, request_rows, challenges)
    history = build_history(library_rows, books_map)
    insights = build_insights(library_rows, request_rows, books_map)

    current_read_row = next(
        iter(
            sorted(
                [row for row in library_rows if row["status"] == "reading"],
                key=lambda row: int(row["progress_percent"]),
                reverse=True,
            )
        ),
        None,
    )
    current_read = books_map.get(str(current_read_row["book_id"])) if current_read_row else None
    saved_books = [
        books_map[str(row["book_id"])]
        for row in library_rows
        if row["status"] == "wishlist" and str(row["book_id"]) in books_map
    ]

    return ProfileResponse(
        user=to_public_user(profile),
        stats=stats,
        currentRead=current_read,
        badges=["Master Voyager", "Aesthetic Reader"],
        history=history,
        savedBooks=saved_books,
        insights=insights,
    )


@router.get("/me/stats", response_model=ProfileStats)
def get_stats(auth: Annotated[AuthContext, Depends(get_current_auth_context)]) -> ProfileStats:
    library_rows, _books_map, request_rows = _load_user_data(auth.user_id)
    challenges = build_challenges(library_rows, request_rows)
    return build_profile_stats(library_rows, request_rows, challenges)


@router.get("/me/history", response_model=HistoryResponse)
def get_history(auth: Annotated[AuthContext, Depends(get_current_auth_context)]) -> HistoryResponse:
    library_rows, books_map, _request_rows = _load_user_data(auth.user_id)
    return HistoryResponse(history=build_history(library_rows, books_map))


@router.get("/me/insights", response_model=ProfileInsight)
def get_insights(auth: Annotated[AuthContext, Depends(get_current_auth_context)]):
    library_rows, books_map, request_rows = _load_user_data(auth.user_id)
    return build_insights(library_rows, request_rows, books_map)
