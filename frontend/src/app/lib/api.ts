import type {
  AuthResponse,
  BooksResponse,
  ChallengesResponse,
  LeaderboardResponse,
  LibraryResponse,
  ProfileResponse,
  RecommendationInput,
  OracleChatResponse,
  RecommendationsResponse,
} from "../types/api";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const AUTH_TOKEN_KEY = "bookblend.authToken";
const RECOMMENDATION_KEY = "bookblend.latestRecommendations";

function getHeaders(): HeadersInit {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...getHeaders(),
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

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export async function signup(email: string, password: string, displayName: string) {
  const response = await request<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, displayName }),
  });

  setAuthToken(response.token);
  return response;
}

export async function login(email: string, password: string) {
  const response = await request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  setAuthToken(response.token);
  return response;
}

export async function logout() {
  try {
    await request<void>("/auth/logout", { method: "POST" });
  } finally {
    clearAuthToken();
  }
}

export async function getMe() {
  return request<{ user: AuthResponse["user"] }>("/me");
}

export async function getBooks(searchQuery = "", genre = "", featured = false) {
  const params = new URLSearchParams();
  if (searchQuery) {
    params.set("search", searchQuery);
  }
  if (genre) {
    params.set("genre", genre);
  }
  if (featured) {
    params.set("featured", "true");
  }

  const query = params.toString();
  return request<BooksResponse>(`/books${query ? `?${query}` : ""}`);
}

export async function createRecommendation(input: RecommendationInput) {
  const response = await request<RecommendationsResponse>("/recommendations", {
    method: "POST",
    body: JSON.stringify(input),
  });
  sessionStorage.setItem(RECOMMENDATION_KEY, JSON.stringify(response));
  return response;
}

export async function oracleChat(message: string, history: string[] = []) {
  return request<OracleChatResponse>("/oracle/chat", {
    method: "POST",
    body: JSON.stringify({ message, history }),
  });
}

export function getLatestRecommendation(): RecommendationsResponse | null {
  const raw = sessionStorage.getItem(RECOMMENDATION_KEY);
  return raw ? (JSON.parse(raw) as RecommendationsResponse) : null;
}

export async function getLibrary() {
  return request<LibraryResponse>("/me/library");
}

export async function addBookToLibrary(bookId: string, status: "reading" | "wishlist" | "completed" = "reading") {
  return request<{ success: boolean }>("/me/library", {
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
  },
) {
  return request<{ success: boolean }>(`/me/library/${bookId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteLibraryItem(bookId: string) {
  return request<void>(`/me/library/${bookId}`, {
    method: "DELETE",
  });
}

export async function getProfile() {
  return request<ProfileResponse>("/me/profile");
}

export async function getChallenges() {
  return request<ChallengesResponse>("/me/challenges");
}

export async function getLeaderboard() {
  return request<LeaderboardResponse>("/leaderboard");
}
