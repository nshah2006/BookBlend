from fastapi import APIRouter, Query

from app.schemas import Book, BooksResponse
from app.services.domain import get_book_or_404, get_books

router = APIRouter(tags=["books"])


@router.get("/books", response_model=BooksResponse)
def list_books(
    search: str = Query(default=""),
    genre: str = Query(default=""),
    featured: bool = Query(default=False),
) -> BooksResponse:
    books = get_books(search=search, genre=genre, featured=featured)
    genres = sorted({item for book in books for item in book.genre})
    return BooksResponse(books=books, genres=genres)


@router.get("/books/{book_id}", response_model=Book)
def get_book(book_id: str) -> Book:
    return get_book_or_404(book_id)
