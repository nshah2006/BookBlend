from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.deps import AuthContext, get_current_auth_context
from app.schemas import AddLibraryInput, LibraryItem, LibraryResponse, SuccessResponse, UpdateLibraryInput
from app.services.domain import (
    delete_library_item,
    get_book_or_404,
    get_user_library_with_books,
    update_library_item,
    upsert_library_item,
)

router = APIRouter(tags=["library"])


@router.get("/me/library", response_model=LibraryResponse)
def get_library(auth: Annotated[AuthContext, Depends(get_current_auth_context)]) -> LibraryResponse:
    library_rows, books_map = get_user_library_with_books(auth.user_id)
    items: list[LibraryItem] = []
    for row in library_rows:
        book = books_map.get(str(row["book_id"]))
        if not book:
            continue
        items.append(
            LibraryItem(
                userId=row["user_id"],
                bookId=row["book_id"],
                status=row["status"],
                progressPercent=row["progress_percent"],
                pagesRead=row["pages_read"],
                savedAt=row["saved_at"],
                startedAt=row["started_at"],
                finishedAt=row["finished_at"],
                book=book,
            )
        )
    return LibraryResponse(items=items)


@router.post("/me/library", response_model=SuccessResponse, status_code=status.HTTP_201_CREATED)
def add_library_item(
    payload: AddLibraryInput,
    auth: Annotated[AuthContext, Depends(get_current_auth_context)],
) -> SuccessResponse:
    try:
        get_book_or_404(payload.book_id)
    except HTTPException:
        raise
    upsert_library_item(auth.user_id, payload.book_id, payload.status)
    return SuccessResponse(success=True)


@router.patch("/me/library/{book_id}", response_model=SuccessResponse)
def patch_library_item(
    book_id: str,
    payload: UpdateLibraryInput,
    auth: Annotated[AuthContext, Depends(get_current_auth_context)],
) -> SuccessResponse:
    update_payload = payload.model_dump(exclude_none=True)
    update_library_item(auth.user_id, book_id, update_payload)
    return SuccessResponse(success=True)


@router.delete("/me/library/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_library_item(
    book_id: str,
    auth: Annotated[AuthContext, Depends(get_current_auth_context)],
) -> Response:
    delete_library_item(auth.user_id, book_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
