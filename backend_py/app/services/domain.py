from __future__ import annotations

from uuid import uuid4
from datetime import date, datetime, timezone
from typing import Any

from fastapi import HTTPException, status

from app.schemas import (
    Book,
    Challenge,
    ChallengeSummary,
    LeaderboardEntry,
    ProfileHistoryEntry,
    ProfileInsight,
    ProfileStats,
    PublicUser,
    RecommendationInput,
    RecommendationResult,
)
from app.services.supabase_client import get_supabase_admin_client

DEFAULT_AVATAR = (
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
    "?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400"
)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _rows(response: Any) -> list[dict[str, Any]]:
    return list(response.data or [])


def _one_or_none(response: Any) -> dict[str, Any] | None:
    rows = _rows(response)
    return rows[0] if rows else None


def map_book(row: dict[str, Any]) -> Book:
    return Book(
        id=str(row["id"]),
        title=row["title"],
        author=row["author"],
        description=row["description"],
        coverImage=row["cover_image"],
        genre=row.get("genre", []),
        rating=float(row["rating"]),
        publishedDate=row["published_date"],
        isFeatured=bool(row.get("is_featured", False)),
    )


def fetch_profile(user_id: str) -> dict[str, Any] | None:
    response = (
        get_supabase_admin_client()
        .table("profiles")
        .select("*")
        .eq("id", user_id)
        .limit(1)
        .execute()
    )
    return _one_or_none(response)


def upsert_profile(
    user_id: str,
    email: str,
    display_name: str | None = None,
    avatar_url: str | None = None,
) -> dict[str, Any]:
    current = fetch_profile(user_id)
    payload = {
        "id": user_id,
        "email": email.lower(),
        "display_name": display_name or (current["display_name"] if current else "BookBlend Reader"),
        "avatar_url": avatar_url or (current["avatar_url"] if current else DEFAULT_AVATAR),
        "created_at": current["created_at"] if current else now_iso(),
    }
    response = (
        get_supabase_admin_client()
        .table("profiles")
        .upsert(payload, on_conflict="id")
        .execute()
    )
    row = _one_or_none(response)
    if not row:
        row = fetch_profile(user_id)
    if not row:
        raise HTTPException(status_code=500, detail="Unable to upsert profile.")
    return row


def to_public_user(profile: dict[str, Any]) -> PublicUser:
    return PublicUser(
        id=profile["id"],
        email=profile["email"],
        displayName=profile["display_name"],
        avatarUrl=profile["avatar_url"],
        createdAt=profile["created_at"],
    )


def get_books(search: str = "", genre: str = "", featured: bool = False) -> list[Book]:
    try:
        query = get_supabase_admin_client().table("books").select("*")
        if search:
            needle = f"%{search.lower()}%"
            query = query.or_(
                f"title.ilike.{needle},author.ilike.{needle},description.ilike.{needle}"
            )
        if genre:
            query = query.contains("genre", [genre])
        if featured:
            query = query.eq("is_featured", True)
        rows = _rows(query.execute())
    except Exception:
        return []
    return [map_book(row) for row in rows]


def get_book_or_404(book_id: str) -> Book:
    response = (
        get_supabase_admin_client()
        .table("books")
        .select("*")
        .eq("id", book_id)
        .limit(1)
        .execute()
    )
    row = _one_or_none(response)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found.")
    return map_book(row)


def score_book(book: Book, input_data: RecommendationInput) -> RecommendationResult:
    mood_weights: dict[str, list[str]] = {
        "energetic": ["Adventure", "Action", "Fantasy", "Thriller"],
        "melancholic": ["Literary Fiction", "Historical Fiction", "Drama"],
        "melancholy": ["Literary Fiction", "Historical Fiction", "Drama"],
        "contemplative": ["Literary Fiction", "Philosophy", "Fiction"],
        "curious": ["Mystery", "Science Fiction", "Speculative Fiction", "Fiction"],
        "romantic": ["Romance", "Drama", "Fiction"],
        "intense": ["Thriller", "Suspense", "Horror", "Adventure"],
        "peaceful": ["Fiction", "Slice of Life", "Contemporary"],
        "whimsical": ["Fantasy", "Magical Realism", "Fairy Tales"],
        "nostalgic": ["Historical Fiction", "Coming of Age", "Literary Fiction"],
        "tense": ["Thriller", "Mystery", "Suspense", "Psychological Fiction"],
    }
    preferred_genres = mood_weights.get(input_data.mood.lower(), ["Fiction", "Contemporary"])
    genre_matches = sum(1 for item in book.genre if item in preferred_genres)
    pacing_bias = 8 if input_data.pacing >= 70 else 4 if input_data.pacing <= 30 else 6
    depth_bias = 10 if input_data.depth >= 70 else 4 if input_data.depth <= 30 else 7
    featured_bias = 3 if book.is_featured else 0
    score = min(
        99,
        round(book.rating * 14 + genre_matches * 10 + pacing_bias + depth_bias + featured_bias),
    )
    pacing_text = (
        "fast-moving energy"
        if input_data.pacing >= 70
        else "gentle pacing"
        if input_data.pacing <= 30
        else "balanced pacing"
    )
    depth_text = (
        "strong emotional depth"
        if input_data.depth >= 70
        else "lighter emotional lift"
        if input_data.depth <= 30
        else "resonant emotional range"
    )

    genre_label = preferred_genres[0].lower() if preferred_genres else "fiction"
    return RecommendationResult(
        book=book,
        score=score,
        reason=(
            f"Matches your {input_data.mood} mood with {pacing_text} and {depth_text}."
            if not genre_matches
            else f"Strong {genre_label} match with {pacing_text} and {depth_text}."
        ),
    )


def build_recommendations(books: list[Book], input_data: RecommendationInput) -> list[RecommendationResult]:
    return sorted(
        [score_book(book, input_data) for book in books],
        key=lambda entry: entry.score,
        reverse=True,
    )[:4]


def build_ai_recommendations(input_data: RecommendationInput) -> list[RecommendationResult]:
    """
    AI-powered recommendations:
    1. Ollama analyzes mood → generates search queries
    2. Google Books API fetches real books for those queries
    3. Books are upserted to Supabase so shelf/library features work
    4. Local scorer ranks results; Ollama's analysis prefixes each reason
    Falls back to Supabase-seeded books if either service is unavailable.
    """
    from app.services.google_books import search_books, upsert_books_to_supabase
    from app.services.ollama_service import analyze_mood

    analysis = analyze_mood(input_data.mood, input_data.pacing, input_data.depth)
    queries: list[str] = analysis.get("queries") or [f"{input_data.mood} fiction"]
    mood_summary: str = analysis.get("analysis", "")

    books = search_books(queries)
    upsert_books_to_supabase(books)

    # Pad with Supabase-seeded books if Google Books returned fewer than 4 unique results
    if len(books) < 4:
        seeded_books = get_books()
        seen_title_authors = {(b.title.lower(), b.author.lower().split(",")[0].strip()) for b in books}
        for b in seeded_books:
            key = (b.title.lower(), b.author.lower().split(",")[0].strip())
            if key not in seen_title_authors and len(books) < 8:
                seen_title_authors.add(key)
                books.append(b)

    if not books:
        return []

    results = sorted(
        [score_book(book, input_data) for book in books],
        key=lambda entry: entry.score,
        reverse=True,
    )[:4]

    if mood_summary:
        for result in results:
            result.reason = f"{mood_summary} {result.reason}"

    return results


def create_recommendation_request(
    input_data: RecommendationInput,
    recommendations: list[RecommendationResult],
    user_id: str | None,
) -> dict[str, Any]:
    request_payload = {
        "user_id": user_id,
        "mood": input_data.mood,
        "pacing": input_data.pacing,
        "depth": input_data.depth,
    }
    try:
        request_row = _one_or_none(
            get_supabase_admin_client()
            .table("recommendation_requests")
            .insert(request_payload)
            .execute()
        )
    except Exception:
        request_row = None

    if not request_row:
        return {
            "id": str(uuid4()),
            "mood": input_data.mood,
            "pacing": input_data.pacing,
            "depth": input_data.depth,
            "created_at": now_iso(),
        }

    rows = [
        {
            "request_id": request_row["id"],
            "book_id": rec.book.id,
            "score": rec.score,
            "reason": rec.reason,
            "rank": index + 1,
        }
        for index, rec in enumerate(recommendations)
    ]
    if rows:
        try:
            get_supabase_admin_client().table("recommendation_results").insert(rows).execute()
        except Exception:
            pass
    return request_row


def fetch_library_rows(user_id: str) -> list[dict[str, Any]]:
    return _rows(
        get_supabase_admin_client()
        .table("library_items")
        .select("*")
        .eq("user_id", user_id)
        .execute()
    )


def fetch_requests_rows(user_id: str) -> list[dict[str, Any]]:
    return _rows(
        get_supabase_admin_client()
        .table("recommendation_requests")
        .select("*")
        .eq("user_id", user_id)
        .execute()
    )


def fetch_books_map(book_ids: list[str]) -> dict[str, Book]:
    unique_ids = sorted(set(book_ids))
    if not unique_ids:
        return {}
    rows = _rows(
        get_supabase_admin_client()
        .table("books")
        .select("*")
        .in_("id", unique_ids)
        .execute()
    )
    return {str(row["id"]): map_book(row) for row in rows}


def upsert_library_item(user_id: str, book_id: str, status_value: str) -> None:
    timestamp = now_iso()
    existing = _one_or_none(
        get_supabase_admin_client()
        .table("library_items")
        .select("*")
        .eq("user_id", user_id)
        .eq("book_id", book_id)
        .limit(1)
        .execute()
    )
    if existing:
        payload = {
            "user_id": user_id,
            "book_id": book_id,
            "status": status_value,
            "progress_percent": existing["progress_percent"],
            "pages_read": existing["pages_read"],
            "saved_at": existing["saved_at"],
            "started_at": existing["started_at"] or (None if status_value == "wishlist" else timestamp),
            "finished_at": existing["finished_at"] or (timestamp if status_value == "completed" else None),
        }
    else:
        payload = {
            "user_id": user_id,
            "book_id": book_id,
            "status": status_value,
            "progress_percent": 100 if status_value == "completed" else 0,
            "pages_read": 0,
            "saved_at": timestamp,
            "started_at": None if status_value == "wishlist" else timestamp,
            "finished_at": timestamp if status_value == "completed" else None,
        }
    get_supabase_admin_client().table("library_items").upsert(
        payload, on_conflict="user_id,book_id"
    ).execute()


def update_library_item(user_id: str, book_id: str, payload: dict[str, Any]) -> None:
    row = _one_or_none(
        get_supabase_admin_client()
        .table("library_items")
        .select("*")
        .eq("user_id", user_id)
        .eq("book_id", book_id)
        .limit(1)
        .execute()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Library item not found.")

    next_status = payload.get("status") or row["status"]
    next_progress = payload.get("progress_percent", row["progress_percent"])
    next_pages = payload.get("pages_read", row["pages_read"])
    started_at = row["started_at"]
    finished_at = row["finished_at"]
    if next_status == "completed":
        next_progress = 100
        finished_at = finished_at or now_iso()
    elif next_status == "reading":
        started_at = started_at or now_iso()
        finished_at = None

    get_supabase_admin_client().table("library_items").update(
        {
            "status": next_status,
            "progress_percent": next_progress,
            "pages_read": next_pages,
            "started_at": started_at,
            "finished_at": finished_at,
        }
    ).eq("user_id", user_id).eq("book_id", book_id).execute()


def delete_library_item(user_id: str, book_id: str) -> None:
    get_supabase_admin_client().table("library_items").delete().eq("user_id", user_id).eq(
        "book_id", book_id
    ).execute()


def _iso_date_key(iso_timestamp: str | None) -> str | None:
    if not iso_timestamp:
        return None
    return iso_timestamp[:10]


def _calculate_day_streak(activity_dates: set[str]) -> int:
    if not activity_dates:
        return 0
    today = date.today()
    streak = 0
    while True:
        day_key = date.fromordinal(today.toordinal() - streak).isoformat()
        if day_key not in activity_dates:
            break
        streak += 1
    return streak


def build_challenges(library_rows: list[dict[str, Any]], request_rows: list[dict[str, Any]]) -> list[Challenge]:
    completed_count = sum(1 for row in library_rows if row["status"] == "completed")
    distinct_moods = len({str(row["mood"]).lower() for row in request_rows})
    highest_depth = max([int(row["depth"]) for row in request_rows], default=0)
    return [
        Challenge(
            id="midnight-reader",
            title="The Midnight Reader",
            desc="Complete an intense thriller between 10 PM and 4 AM.",
            reward="Lunar Reader Badge",
            progress=min(100, completed_count * 32 + 1),
            isCompleted=completed_count >= 3,
        ),
        Challenge(
            id="vibe-explorer",
            title="Vibe Explorer",
            desc="Finish books in 3 different mood categories this month.",
            reward="Mood Master Title",
            progress=min(100, round((distinct_moods / 3) * 100)),
            isCompleted=distinct_moods >= 3,
        ),
        Challenge(
            id="social-sanctuary",
            title="Social Sanctuary",
            desc="Discuss a vibe-matched book with a friend in a Circle.",
            reward="Social Scroll Badge",
            progress=30 if len(library_rows) > 2 else 0,
            isCompleted=False,
        ),
        Challenge(
            id="deep-diver",
            title="The Deep Diver",
            desc="Complete a book with an emotional depth score over 80%.",
            reward="Deep Sea Reader Badge",
            progress=100 if highest_depth >= 80 and completed_count > 0 else min(100, highest_depth),
            isCompleted=highest_depth >= 80 and completed_count > 0,
        ),
    ]


def build_profile_stats(
    library_rows: list[dict[str, Any]],
    request_rows: list[dict[str, Any]],
    challenges: list[Challenge],
) -> ProfileStats:
    completed = [row for row in library_rows if row["status"] == "completed"]
    reading = [row for row in library_rows if row["status"] == "reading"]
    pages_read = int(sum(int(row["pages_read"]) for row in library_rows))
    mood_count = len({str(row["mood"]).lower() for row in request_rows})
    completed_challenges = sum(1 for challenge in challenges if challenge.is_completed)

    activity_dates: set[str] = set()
    for row in library_rows:
        for key in ("saved_at", "started_at", "finished_at"):
            value = _iso_date_key(row.get(key))
            if value:
                activity_dates.add(value)
    for row in request_rows:
        value = _iso_date_key(row.get("created_at"))
        if value:
            activity_dates.add(value)

    total_xp = len(completed) * 250 + len(reading) * 90 + completed_challenges * 125 + mood_count * 40
    level = max(1, total_xp // 120 + 1)
    completion_ratio = (len(completed) / len(library_rows)) if library_rows else 0
    vibe_score = min(99, 55 + round(completion_ratio * 25) + min(18, mood_count * 4))
    day_streak = _calculate_day_streak(activity_dates)
    reading_accuracy = min(98, 62 + round(completion_ratio * 28) + min(8, day_streak))

    return ProfileStats(
        booksRead=len(completed),
        vibeScore=vibe_score,
        dayStreak=day_streak,
        quests=completed_challenges,
        totalXp=total_xp,
        level=level,
        pagesRead=pages_read,
        timeSpentHours=round(pages_read / 38, 1),
        readingAccuracy=reading_accuracy,
    )


def build_challenge_summary(stats: ProfileStats, challenges: list[Challenge]) -> ChallengeSummary:
    completed = sum(1 for challenge in challenges if challenge.is_completed)
    total = len(challenges)
    completion_rate = round((completed / total) * 100) if total else 0
    return ChallengeSummary(
        totalXp=stats.total_xp,
        level=stats.level,
        completedChallenges=completed,
        activeChallenges=max(0, total - completed),
        completionRate=completion_rate,
        nextLevelXp=stats.level * 120,
    )


def build_history(library_rows: list[dict[str, Any]], books_map: dict[str, Book]) -> list[ProfileHistoryEntry]:
    history: list[ProfileHistoryEntry] = []
    for row in library_rows:
        book = books_map.get(str(row["book_id"]))
        if not book:
            continue
        history.append(
            ProfileHistoryEntry(
                title=book.title,
                author=book.author,
                status=row["status"],
                progressPercent=int(row["progress_percent"]),
                savedAt=row["saved_at"],
            )
        )
    return history


def build_insights(
    library_rows: list[dict[str, Any]],
    request_rows: list[dict[str, Any]],
    books_map: dict[str, Book],
) -> ProfileInsight:
    genre_count: dict[str, int] = {}
    for row in library_rows:
        book = books_map.get(str(row["book_id"]))
        if not book:
            continue
        for genre in book.genre:
            genre_count[genre] = genre_count.get(genre, 0) + 1

    top_genres = [genre for genre, _ in sorted(genre_count.items(), key=lambda item: item[1], reverse=True)[:6]]
    sorted_requests = sorted(request_rows, key=lambda row: str(row["created_at"]), reverse=True)
    latest_request = sorted_requests[0] if sorted_requests else None

    average_depth = (
        sum(int(row["depth"]) for row in request_rows) / len(request_rows) if request_rows else 65
    )
    average_pacing = (
        sum(int(row["pacing"]) for row in request_rows) / len(request_rows) if request_rows else 58
    )

    next_recommendation: RecommendationResult | None = None
    if latest_request:
        result_row = _one_or_none(
            get_supabase_admin_client()
            .table("recommendation_results")
            .select("*")
            .eq("request_id", latest_request["id"])
            .order("rank")
            .limit(1)
            .execute()
        )
        if result_row:
            book = books_map.get(str(result_row["book_id"])) or get_book_or_404(str(result_row["book_id"]))
            next_recommendation = RecommendationResult(
                book=book,
                score=int(result_row["score"]),
                reason=result_row["reason"],
            )

    return ProfileInsight(
        topGenres=top_genres,
        emotionalDepth=[
            {"label": "Deep & Philosophical", "value": round(average_depth), "color": "bg-primary"},
            {"label": "Fast & Dynamic", "value": round(average_pacing), "color": "bg-secondary"},
            {
                "label": "Light & Whimsical",
                "value": max(20, round(100 - average_depth / 1.4)),
                "color": "bg-emerald-400",
            },
        ],
        nextRecommendation=next_recommendation,
    )


def get_user_library_with_books(user_id: str) -> tuple[list[dict[str, Any]], dict[str, Book]]:
    library_rows = fetch_library_rows(user_id)
    books_map = fetch_books_map([str(row["book_id"]) for row in library_rows])
    return library_rows, books_map


def build_leaderboard(current_user_id: str) -> list[LeaderboardEntry]:
    profile_rows = _rows(get_supabase_admin_client().table("profiles").select("*").execute())
    entries: list[LeaderboardEntry] = []
    for profile in profile_rows:
        user_id = profile["id"]
        library_rows = fetch_library_rows(user_id)
        request_rows = fetch_requests_rows(user_id)
        challenges = build_challenges(library_rows, request_rows)
        stats = build_profile_stats(library_rows, request_rows, challenges)
        entries.append(
            LeaderboardEntry(
                rank=0,
                name=profile["display_name"],
                xp=stats.total_xp,
                level=stats.level,
                isCurrentUser=user_id == current_user_id,
            )
        )
    entries.sort(key=lambda item: (item.xp, item.level), reverse=True)
    for index, entry in enumerate(entries[:10]):
        entry.rank = index + 1
    return entries[:10]
