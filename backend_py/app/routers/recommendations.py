import json
from typing import Annotated, Generator

from fastapi import APIRouter, Depends, status
from fastapi.responses import StreamingResponse

from app.deps import AuthContext, get_optional_auth_context
from app.schemas import (
    OracleChatInput,
    OracleChatResponse,
    RecommendationInput,
    RecommendationRequestMeta,
    RecommendationsResponse,
)
from app.services.domain import build_ai_recommendations, create_recommendation_request
from app.services.ollama_service import parse_oracle_prompt, stream_oracle_reply

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
    book_context = ", ".join(
        f"{r.book.title} by {r.book.author}" for r in recommendations[:3]
    )
    reply = "".join(stream_oracle_reply(payload.message, payload.history, book_context))
    return OracleChatResponse(
        reply=reply,
        inferredInput=inferred_input,
        recommendations=recommendations,
    )


@router.post("/oracle/chat/stream")
def oracle_chat_stream(payload: OracleChatInput) -> StreamingResponse:
    def event_stream() -> Generator[str, None, None]:
        parsed = parse_oracle_prompt(payload.message, payload.history)
        inferred_input = RecommendationInput(
            mood=parsed["mood"],
            pacing=parsed["pacing"],
            depth=parsed["depth"],
        )
        recommendations = build_ai_recommendations(inferred_input)
        book_context = ", ".join(
            f"{r.book.title} by {r.book.author}" for r in recommendations[:3]
        )

        for token in stream_oracle_reply(payload.message, payload.history, book_context):
            yield f"data: {json.dumps({'content': token})}\n\n"

        recs_data = [r.model_dump(by_alias=True) for r in recommendations]
        yield f"data: {json.dumps({'done': True, 'recommendations': recs_data})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
