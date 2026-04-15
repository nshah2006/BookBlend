from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


ShelfStatus = Literal["reading", "wishlist", "completed"]


class ApiModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)


class Book(ApiModel):
    id: str
    title: str
    author: str
    description: str
    cover_image: str = Field(alias="coverImage")
    genre: list[str]
    rating: float
    published_date: str = Field(alias="publishedDate")
    is_featured: bool = Field(default=False, alias="isFeatured")


class PublicUser(ApiModel):
    id: str
    email: str
    display_name: str = Field(alias="displayName")
    avatar_url: str = Field(alias="avatarUrl")
    created_at: str = Field(alias="createdAt")


class AuthResponse(ApiModel):
    token: str
    user: PublicUser


class MeResponse(ApiModel):
    user: PublicUser


class SignupInput(ApiModel):
    email: str
    password: str = Field(min_length=8)
    display_name: str = Field(alias="displayName", min_length=2, max_length=40)


class LoginInput(ApiModel):
    email: str
    password: str = Field(min_length=8)


class BooksResponse(ApiModel):
    books: list[Book]
    genres: list[str]


class RecommendationInput(ApiModel):
    mood: str = Field(min_length=2)
    pacing: int = Field(ge=0, le=100)
    depth: int = Field(ge=0, le=100)


class RecommendationResult(ApiModel):
    book: Book
    score: int
    reason: str


class RecommendationRequestMeta(ApiModel):
    id: str
    mood: str
    pacing: int
    depth: int
    created_at: str = Field(alias="createdAt")


class RecommendationsResponse(ApiModel):
    request: RecommendationRequestMeta
    recommendations: list[RecommendationResult]


class OracleChatInput(ApiModel):
    message: str = Field(min_length=4, max_length=2000)
    history: list[str] = Field(default_factory=list)


class OracleChatResponse(ApiModel):
    reply: str
    inferred_input: RecommendationInput = Field(alias="inferredInput")
    recommendations: list[RecommendationResult]


class LibraryItem(ApiModel):
    user_id: str = Field(alias="userId")
    book_id: str = Field(alias="bookId")
    status: ShelfStatus
    progress_percent: int = Field(alias="progressPercent")
    pages_read: int = Field(alias="pagesRead")
    saved_at: str = Field(alias="savedAt")
    started_at: str | None = Field(alias="startedAt")
    finished_at: str | None = Field(alias="finishedAt")
    book: Book


class LibraryResponse(ApiModel):
    items: list[LibraryItem]


class AddLibraryInput(ApiModel):
    book_id: str = Field(alias="bookId")
    status: ShelfStatus = "reading"


class UpdateLibraryInput(ApiModel):
    status: ShelfStatus | None = None
    progress_percent: int | None = Field(default=None, alias="progressPercent", ge=0, le=100)
    pages_read: int | None = Field(default=None, alias="pagesRead", ge=0)


class SuccessResponse(ApiModel):
    success: bool


class Challenge(ApiModel):
    id: str
    title: str
    desc: str
    reward: str
    progress: int
    is_completed: bool = Field(alias="isCompleted")


class ChallengeSummary(ApiModel):
    total_xp: int = Field(alias="totalXp")
    level: int
    completed_challenges: int = Field(alias="completedChallenges")
    active_challenges: int = Field(alias="activeChallenges")
    completion_rate: int = Field(alias="completionRate")
    next_level_xp: int = Field(alias="nextLevelXp")


class ChallengesResponse(ApiModel):
    summary: ChallengeSummary
    challenges: list[Challenge]


class LeaderboardEntry(ApiModel):
    rank: int
    name: str
    xp: int
    level: int
    is_current_user: bool = Field(default=False, alias="isCurrentUser")


class LeaderboardResponse(ApiModel):
    entries: list[LeaderboardEntry]


class ProfileStats(ApiModel):
    books_read: int = Field(alias="booksRead")
    vibe_score: int = Field(alias="vibeScore")
    day_streak: int = Field(alias="dayStreak")
    quests: int
    total_xp: int = Field(alias="totalXp")
    level: int
    pages_read: int = Field(alias="pagesRead")
    time_spent_hours: float = Field(alias="timeSpentHours")
    reading_accuracy: int = Field(alias="readingAccuracy")


class ProfileHistoryEntry(ApiModel):
    title: str
    author: str
    status: ShelfStatus
    progress_percent: int = Field(alias="progressPercent")
    saved_at: str = Field(alias="savedAt")


class EmotionalDepthEntry(ApiModel):
    label: str
    value: int
    color: str


class ProfileInsight(ApiModel):
    top_genres: list[str] = Field(alias="topGenres")
    emotional_depth: list[EmotionalDepthEntry] = Field(alias="emotionalDepth")
    next_recommendation: RecommendationResult | None = Field(alias="nextRecommendation")


class ProfileResponse(ApiModel):
    user: PublicUser
    stats: ProfileStats
    current_read: Book | None = Field(alias="currentRead")
    badges: list[str]
    history: list[ProfileHistoryEntry]
    saved_books: list[Book] = Field(alias="savedBooks")
    insights: ProfileInsight


class HistoryResponse(ApiModel):
    history: list[ProfileHistoryEntry]


class ApiError(ApiModel):
    error: str
