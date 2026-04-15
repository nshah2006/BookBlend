import type {
  BooksResponse,
  ChallengesResponse,
  LeaderboardResponse,
  LibraryResponse,
  ProfileResponse,
  RecommendationInput,
  RecommendationsResponse,
} from "./types";

const RECOMMENDATION_KEY = "bookblend.latestRecommendations";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(errorBody?.error ?? "Something went wrong.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function getBooks(searchQuery = "", genre = "", featured = false) {
  const params = new URLSearchParams();
  if (searchQuery) params.set("search", searchQuery);
  if (genre) params.set("genre", genre);
  if (featured) params.set("featured", "true");

  const query = params.toString();
  return request<BooksResponse>(`/api/books${query ? `?${query}` : ""}`);
}

export async function createRecommendation(input: RecommendationInput) {
  const response = await request<RecommendationsResponse>("/api/recommendations", {
    method: "POST",
    body: JSON.stringify(input),
  });
  sessionStorage.setItem(RECOMMENDATION_KEY, JSON.stringify(response));
  return response;
}

export function getLatestRecommendation(): RecommendationsResponse | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(RECOMMENDATION_KEY);
  return raw ? (JSON.parse(raw) as RecommendationsResponse) : null;
}

export async function getLibrary() {
  return request<LibraryResponse>("/api/library");
}

export async function addBookToLibrary(
  bookId: string,
  status: "reading" | "wishlist" | "completed" = "reading"
) {
  return request<{ success: boolean }>("/api/library", {
    method: "POST",
    body: JSON.stringify({ bookId, status }),
  });
}

export async function updateLibraryItem(
  bookId: string,
  payload: {
    status?: "reading" | "wishlist" | "completed";
    progressPercent?: number;
    pagesRead?: number;
  }
) {
  return request<{ success: boolean }>(`/api/library/${bookId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteLibraryItem(bookId: string) {
  return request<void>(`/api/library/${bookId}`, {
    method: "DELETE",
  });
}

export async function getProfile() {
  return request<ProfileResponse>("/api/profile");
}

export async function getChallenges() {
  return request<ChallengesResponse>("/api/challenges");
}

export async function getLeaderboard() {
  return request<LeaderboardResponse>("/api/leaderboard");
}
