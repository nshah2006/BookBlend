export type ShelfStatus = "reading" | "wishlist" | "completed";

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  genre: string[];
  rating: number;
  publishedDate: string;
  isFeatured?: boolean;
}

export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: PublicUser;
}

export interface BooksResponse {
  books: Book[];
  genres: string[];
}

export interface RecommendationInput {
  mood: string;
  pacing: number;
  depth: number;
}

export interface RecommendationResult {
  book: Book;
  score: number;
  reason: string;
}

export interface RecommendationsResponse {
  request: RecommendationInput & {
    id: string;
    createdAt: string;
  };
  recommendations: RecommendationResult[];
}

export interface LibraryItem {
  userId: string;
  bookId: string;
  status: ShelfStatus;
  progressPercent: number;
  pagesRead: number;
  savedAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  book: Book;
}

export interface LibraryResponse {
  items: LibraryItem[];
}

export interface Challenge {
  id: string;
  title: string;
  desc: string;
  reward: string;
  progress: number;
  isCompleted?: boolean;
}

export interface ChallengesResponse {
  summary: {
    totalXp: number;
    level: number;
    completedChallenges: number;
    activeChallenges: number;
    completionRate: number;
    nextLevelXp: number;
  };
  challenges: Challenge[];
}

export interface LeaderboardResponse {
  entries: Array<{
    rank: number;
    name: string;
    xp: number;
    level: number;
    isCurrentUser?: boolean;
  }>;
}

export interface ProfileStats {
  booksRead: number;
  vibeScore: number;
  dayStreak: number;
  quests: number;
  totalXp: number;
  level: number;
  pagesRead: number;
  timeSpentHours: number;
  readingAccuracy: number;
}

export interface ProfileInsight {
  topGenres: string[];
  emotionalDepth: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  nextRecommendation: RecommendationResult | null;
}

export interface ProfileResponse {
  user: PublicUser;
  stats: ProfileStats;
  currentRead: Book | null;
  badges: string[];
  history: Array<{
    title: string;
    author: string;
    status: ShelfStatus;
    progressPercent: number;
    savedAt: string;
  }>;
  savedBooks: Book[];
  insights: ProfileInsight;
}
