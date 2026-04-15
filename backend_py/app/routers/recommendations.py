from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.deps import AuthContext, get_optional_auth_context
from app.schemas import (
    OracleChatInput,
    OracleChatResponse,
    RecommendationInput,
    RecommendationRequestMeta,
    RecommendationsResponse,
)
from app.services.domain import build_ai_recommendations, create_recommendation_request
from app.services.ollama_service import parse_oracle_prompt

router = APIRouter(tags=["recommendations"])


@router.post("/recommendations", response_model=RecommendationsResponse, status_code=status.HTTP_201_CREATED)
def create_recommendations(
    payload: RecommendationInput,
    auth: Annotated[AuthContext | None, Depends(get_optional_auth_context)],
) -> RecommendationsResponse:
    recommendations = build_ai_recommendations(payload)
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


@router.post("/oracle/chat", response_model=OracleChatResponse)
def oracle_chat(payload: OracleChatInput) -> OracleChatResponse:
    parsed = parse_oracle_prompt(payload.message, payload.history)
    inferred_input = RecommendationInput(
        mood=parsed["mood"],
        pacing=parsed["pacing"],
        depth=parsed["depth"],
    )
    recommendations = build_ai_recommendations(inferred_input)

    if recommendations:
        top = recommendations[:3]
        book_summary = ", ".join(f"{item.book.title} by {item.book.author}" for item in top)
        reply = (
            f"{parsed['analysis']} Based on that, your strongest matches are {book_summary}. "
            "I ranked these by mood alignment, pacing, emotional depth, and rating."
        )
    else:
        reply = (
            f"{parsed['analysis']} I could not fetch matching books right now, "
            "but try refining your mood, pace, or depth preferences."
        )

    return OracleChatResponse(
        reply=reply,
        inferredInput=inferred_input,
        recommendations=recommendations,
    )
