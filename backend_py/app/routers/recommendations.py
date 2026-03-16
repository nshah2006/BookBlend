from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.deps import AuthContext, get_optional_auth_context
from app.schemas import RecommendationRequestMeta, RecommendationInput, RecommendationsResponse
from app.services.domain import build_recommendations, create_recommendation_request, get_books

router = APIRouter(tags=["recommendations"])


@router.post("/recommendations", response_model=RecommendationsResponse, status_code=status.HTTP_201_CREATED)
def create_recommendations(
    payload: RecommendationInput,
    auth: Annotated[AuthContext | None, Depends(get_optional_auth_context)],
) -> RecommendationsResponse:
    books = get_books()
    recommendations = build_recommendations(books, payload)
    request_row = create_recommendation_request(payload, recommendations, auth.user_id if auth else None)
    return RecommendationsResponse(
        request=RecommendationRequestMeta(
            id=request_row["id"],
            mood=request_row["mood"],
            pacing=request_row["pacing"],
            depth=request_row["depth"],
            createdAt=request_row["created_at"],
        ),
        recommendations=recommendations,
    )
