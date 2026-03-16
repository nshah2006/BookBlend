from typing import Annotated

from fastapi import APIRouter, Depends

from app.deps import AuthContext, get_current_auth_context
from app.schemas import ChallengesResponse, LeaderboardResponse
from app.services.domain import (
    build_challenge_summary,
    build_challenges,
    build_leaderboard,
    build_profile_stats,
    fetch_requests_rows,
    fetch_library_rows,
)

router = APIRouter(tags=["challenges"])


@router.get("/me/challenges", response_model=ChallengesResponse)
def get_challenges(auth: Annotated[AuthContext, Depends(get_current_auth_context)]) -> ChallengesResponse:
    library_rows = fetch_library_rows(auth.user_id)
    request_rows = fetch_requests_rows(auth.user_id)
    challenges = build_challenges(library_rows, request_rows)
    stats = build_profile_stats(library_rows, request_rows, challenges)
    summary = build_challenge_summary(stats, challenges)
    return ChallengesResponse(summary=summary, challenges=challenges)


@router.get("/leaderboard", response_model=LeaderboardResponse)
def get_leaderboard(
    auth: Annotated[AuthContext, Depends(get_current_auth_context)],
) -> LeaderboardResponse:
    return LeaderboardResponse(entries=build_leaderboard(auth.user_id))
