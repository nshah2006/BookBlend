from __future__ import annotations

import logging
from typing import Any

import httpx

from app.core.config import get_settings
from app.schemas import Book
from app.services.supabase_client import get_supabase_admin_client

logger = logging.getLogger(__name__)

GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes"
FALLBACK_COVER = (
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop"
)

# Categories that indicate non-fiction academic/reference books — exclude these
_EXCLUDED_CATEGORIES = frozenset({
    "literary criticism",
    "language arts & disciplines",
    "study aids",
    "reference",
    "education",
    "business & economics",
    "medical",
    "technology & engineering",
    "mathematics",
    "science",
    "computers",
    "social science",
    "political science",
    "philosophy",
    "religion",
    "psychology",
    "performing arts",
    "art",
    "biography & autobiography",
    "self-help",
    "true crime",
    "travel",
    "cooking",
    "sports & recreation",
    "antiques & collectibles",
    "architecture",
    "games & activities",
    "history",
    "film & video",
    "music",
    "law",
    "literary collections",
    "pets",
    "nature",
    "gardening",
    "health & fitness",
    "foreign language study",
    "index",
    "indexes",
})

_ACADEMIC_DESCRIPTION_SIGNALS = (
    "this study ", "this volume ", "this book argues", "this paper ",
    "this monograph", "the author argues", "scholars have",
    "academic study", "critical analysis", "literary theory",
    "historiography", "this dissertation",
)


def _is_fiction_like(info: dict[str, Any]) -> bool:
    """Return True if a volume's categories suggest it's a readable fiction/narrative book."""
    raw_categories = info.get("categories") or []
    if not raw_categories:
        # No category info — allow it through, rely on query quality
        return True
    cats_lower = [c.lower() for c in raw_categories]
    fiction_keywords = ("fiction", "novel", "romance", "fantasy", "thriller", "mystery",
                        "horror", "science fiction", "poetry", "drama", "young adult",
                        "juvenile fiction", "comics", "graphic novel")
    has_fiction = any(any(kw in cat for kw in fiction_keywords) for cat in cats_lower)
    # Check primary category root against excluded list
    primary_root = cats_lower[0].split("/")[0].strip()
    if primary_root in _EXCLUDED_CATEGORIES:
        return False
    return has_fiction or all(c.split("/")[0].strip() not in _EXCLUDED_CATEGORIES for c in cats_lower)


_ANTHOLOGY_TITLE_KEYWORDS = frozenset({
    "collection", "omnibus", "anthology", "masterpiece", "greatest works",
    "complete works", "complete collection", "box set", "boxset", "bundle",
    "compendium", "treasury", "selected works", "best of", "vol.", "volume i",
    "volume ii", "volume iii", "classic tales", "classics collection",
})


def _parse_volume(item: dict[str, Any]) -> Book | None:
    info = item.get("volumeInfo", {})
    title = (info.get("title") or "").strip()
    authors = info.get("authors") or []
    description = (info.get("description") or "").strip()

    if not title or not authors or not description:
        return None

    # Skip anthologies / multi-author collections
    if len(authors) > 3:
        return None
    title_lower = title.lower()
    if any(kw in title_lower for kw in _ANTHOLOGY_TITLE_KEYWORDS):
        return None

    if not _is_fiction_like(info):
        return None

    # Filter out academic-sounding descriptions
    desc_lower = description.lower()
    if any(signal in desc_lower for signal in _ACADEMIC_DESCRIPTION_SIGNALS):
        return None

    image_links = info.get("imageLinks", {})
    cover = (
        image_links.get("extraLarge")
        or image_links.get("large")
        or image_links.get("medium")
        or image_links.get("small")
        or image_links.get("thumbnail")
        or image_links.get("smallThumbnail")
        or FALLBACK_COVER
    )
    cover = cover.replace("http://", "https://")
    # Upgrade zoom level in Google Books URLs for higher resolution
    if "books.google.com" in cover:
        cover = cover.replace("zoom=1", "zoom=0").replace("zoom=2", "zoom=0")

    raw_categories = info.get("categories") or []
    genres: list[str] = []
    for cat in raw_categories:
        for part in cat.split("/"):
            part = part.strip()
            if part and part not in genres:
                genres.append(part)
    if not genres:
        genres = ["Fiction"]

    rating = float(info.get("averageRating") or 3.5)
    published = (info.get("publishedDate") or "Unknown")[:4]

    return Book(
        id=item["id"],
        title=title,
        author=", ".join(authors),
        description=description[:800],
        coverImage=cover,
        genre=genres[:5],
        rating=round(min(5.0, rating), 1),
        publishedDate=published,
        isFeatured=False,
    )


def search_books(queries: list[str], max_per_query: int = 8) -> list[Book]:
    settings = get_settings()
    params_base: dict[str, Any] = {
        "maxResults": max_per_query,
        "langRestrict": "en",
        "printType": "books",
        "orderBy": "relevance",
    }
    if settings.google_books_api_key:
        params_base["key"] = settings.google_books_api_key

    seen_ids: set[str] = set()
    seen_title_author: set[tuple[str, str]] = set()
    books: list[Book] = []

    with httpx.Client(timeout=15.0, trust_env=not settings.disable_http_proxy) as client:
        for query in queries:
            try:
                # Ensure queries target fiction/novels
                search_query = query
                fiction_terms = ("fiction", "novel", "romance", "fantasy", "thriller",
                                 "mystery", "horror", "drama", "poetry")
                if not any(kw in query.lower() for kw in fiction_terms):
                    search_query = f"{query} novel fiction"
                response = client.get(GOOGLE_BOOKS_API, params={"q": search_query, **params_base})
                response.raise_for_status()
                for item in response.json().get("items") or []:
                    book_id = item.get("id")
                    if not book_id or book_id in seen_ids:
                        continue
                    book = _parse_volume(item)
                    if not book:
                        continue
                    # Deduplicate by (title, author) to avoid different editions of same book
                    title_author_key = (book.title.lower().strip(), book.author.lower().split(",")[0].strip())
                    if title_author_key in seen_title_author:
                        continue
                    seen_ids.add(book_id)
                    seen_title_author.add(title_author_key)
                    books.append(book)
            except Exception as exc:
                logger.warning("Google Books query '%s' failed: %s", query, exc)

    return books


def upsert_books_to_supabase(books: list[Book]) -> None:
    """Persist Google Books results so library/shelf features work."""
    if not books:
        return
    rows = [
        {
            "id": book.id,
            "title": book.title,
            "author": book.author,
            "description": book.description,
            "cover_image": book.cover_image,
            "genre": book.genre,
            "rating": book.rating,
            "published_date": book.published_date,
            "is_featured": False,
        }
        for book in books
    ]
    try:
        get_supabase_admin_client().table("books").upsert(rows, on_conflict="id").execute()
    except Exception as exc:
        logger.warning("Failed to upsert books to Supabase: %s", exc)
