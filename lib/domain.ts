import type {
  Book,
  Challenge,
  DbBook,
  DbLibraryItem,
  DbProfile,
  DbRecommendationRequest,
  LeaderboardEntry,
  ProfileInsight,
  ProfileStats,
  PublicUser,
  RecommendationInput,
  RecommendationResult,
} from "./types";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400";

export function nowIso(): string {
  return new Date().toISOString();
}

export function mapBook(row: DbBook): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    description: row.description,
    coverImage: row.cover_image,
    genre: row.genre || [],
    rating: Number(row.rating),
    publishedDate: row.published_date,
    isFeatured: Boolean(row.is_featured),
  };
}

export function toPublicUser(profile: DbProfile): PublicUser {
  return {
    id: profile.id,
    email: profile.email,
    displayName: profile.display_name,
    avatarUrl: profile.avatar_url || DEFAULT_AVATAR,
    createdAt: profile.created_at,
  };
}

export function scoreBook(book: Book, input: RecommendationInput): RecommendationResult {
  const moodWeights: Record<string, string[]> = {
    energetic: ["Adventure", "Magic", "Fantasy"],
    melancholic: ["Historical Fantasy", "Folklore", "Magical Realism"],
    curious: ["Mythology", "Fiction", "Retellings"],
    romantic: ["Romance", "Fantasy", "Magical Realism"],
    intense: ["Magic", "Fantasy", "Adventure"],
    peaceful: ["Folklore", "Historical Fantasy", "Magical Realism"],
  };

  const preferredGenres = moodWeights[input.mood.toLowerCase()] || ["Fantasy"];
  const genreMatches = book.genre.filter((g) => preferredGenres.includes(g)).length;
  const pacingBias = input.pacing >= 70 ? 8 : input.pacing <= 30 ? 4 : 6;
  const depthBias = input.depth >= 70 ? 10 : input.depth <= 30 ? 4 : 7;
  const featuredBias = book.isFeatured ? 3 : 0;

  const score = Math.min(
    99,
    Math.round(book.rating * 14 + genreMatches * 10 + pacingBias + depthBias + featuredBias)
  );

  const pacingText =
    input.pacing >= 70
      ? "fast-moving energy"
      : input.pacing <= 30
      ? "gentle pacing"
      : "balanced pacing";
  const depthText =
    input.depth >= 70
      ? "strong emotional depth"
      : input.depth <= 30
      ? "lighter emotional lift"
      : "resonant emotional range";

  return {
    book,
    score,
    reason: `Strong ${preferredGenres[0].toLowerCase()} alignment with ${pacingText} and ${depthText}.`,
  };
}

export function buildRecommendations(
  books: Book[],
  input: RecommendationInput
): RecommendationResult[] {
  return books
    .map((book) => scoreBook(book, input))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

export function buildChallenges(
  libraryRows: DbLibraryItem[],
  requestRows: DbRecommendationRequest[]
): Challenge[] {
  const completedCount = libraryRows.filter((r) => r.status === "completed").length;
  const distinctMoods = new Set(requestRows.map((r) => r.mood.toLowerCase())).size;
  const highestDepth = Math.max(...requestRows.map((r) => r.depth), 0);

  return [
    {
      id: "midnight-reader",
      title: "The Midnight Reader",
      desc: "Complete an intense thriller between 10 PM and 4 AM.",
      reward: "Lunar Reader Badge",
      progress: Math.min(100, completedCount * 32 + 1),
      isCompleted: completedCount >= 3,
    },
    {
      id: "vibe-explorer",
      title: "Vibe Explorer",
      desc: "Finish books in 3 different mood categories this month.",
      reward: "Mood Master Title",
      progress: Math.min(100, Math.round((distinctMoods / 3) * 100)),
      isCompleted: distinctMoods >= 3,
    },
    {
      id: "social-sanctuary",
      title: "Social Sanctuary",
      desc: "Discuss a vibe-matched book with a friend in a Circle.",
      reward: "Social Scroll Badge",
      progress: libraryRows.length > 2 ? 30 : 0,
      isCompleted: false,
    },
    {
      id: "deep-diver",
      title: "The Deep Diver",
      desc: "Complete a book with an emotional depth score over 80%.",
      reward: "Deep Sea Reader Badge",
      progress:
        highestDepth >= 80 && completedCount > 0 ? 100 : Math.min(100, highestDepth),
      isCompleted: highestDepth >= 80 && completedCount > 0,
    },
  ];
}

function isoDateKey(isoTimestamp: string | null): string | null {
  if (!isoTimestamp) return null;
  return isoTimestamp.slice(0, 10);
}

function calculateDayStreak(activityDates: Set<string>): number {
  if (activityDates.size === 0) return 0;
  const today = new Date();
  let streak = 0;

  while (true) {
    const date = new Date(today);
    date.setDate(date.getDate() - streak);
    const dayKey = date.toISOString().slice(0, 10);
    if (!activityDates.has(dayKey)) break;
    streak++;
  }

  return streak;
}

export function buildProfileStats(
  libraryRows: DbLibraryItem[],
  requestRows: DbRecommendationRequest[],
  challenges: Challenge[]
): ProfileStats {
  const completed = libraryRows.filter((r) => r.status === "completed");
  const reading = libraryRows.filter((r) => r.status === "reading");
  const pagesRead = libraryRows.reduce((sum, r) => sum + r.pages_read, 0);
  const moodCount = new Set(requestRows.map((r) => r.mood.toLowerCase())).size;
  const completedChallenges = challenges.filter((c) => c.isCompleted).length;

  const activityDates = new Set<string>();
  for (const row of libraryRows) {
    for (const key of ["saved_at", "started_at", "finished_at"] as const) {
      const value = isoDateKey(row[key]);
      if (value) activityDates.add(value);
    }
  }
  for (const row of requestRows) {
    const value = isoDateKey(row.created_at);
    if (value) activityDates.add(value);
  }

  const totalXp =
    completed.length * 250 + reading.length * 90 + completedChallenges * 125 + moodCount * 40;
  const level = Math.max(1, Math.floor(totalXp / 120) + 1);
  const completionRatio = libraryRows.length > 0 ? completed.length / libraryRows.length : 0;
  const vibeScore = Math.min(
    99,
    55 + Math.round(completionRatio * 25) + Math.min(18, moodCount * 4)
  );
  const dayStreak = calculateDayStreak(activityDates);
  const readingAccuracy = Math.min(98, 62 + Math.round(completionRatio * 28) + Math.min(8, dayStreak));

  return {
    booksRead: completed.length,
    vibeScore,
    dayStreak,
    quests: completedChallenges,
    totalXp,
    level,
    pagesRead,
    timeSpentHours: Math.round((pagesRead / 38) * 10) / 10,
    readingAccuracy,
  };
}

export function buildChallengeSummary(stats: ProfileStats, challenges: Challenge[]) {
  const completed = challenges.filter((c) => c.isCompleted).length;
  const total = challenges.length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    totalXp: stats.totalXp,
    level: stats.level,
    completedChallenges: completed,
    activeChallenges: Math.max(0, total - completed),
    completionRate,
    nextLevelXp: stats.level * 120,
  };
}

export function buildInsights(
  libraryRows: DbLibraryItem[],
  requestRows: DbRecommendationRequest[],
  booksMap: Map<string, Book>,
  nextRecommendation: RecommendationResult | null
): ProfileInsight {
  const genreCount: Record<string, number> = {};
  for (const row of libraryRows) {
    const book = booksMap.get(row.book_id);
    if (!book) continue;
    for (const genre of book.genre) {
      genreCount[genre] = (genreCount[genre] || 0) + 1;
    }
  }

  const topGenres = Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([genre]) => genre);

  const averageDepth =
    requestRows.length > 0
      ? requestRows.reduce((sum, r) => sum + r.depth, 0) / requestRows.length
      : 65;
  const averagePacing =
    requestRows.length > 0
      ? requestRows.reduce((sum, r) => sum + r.pacing, 0) / requestRows.length
      : 58;

  return {
    topGenres,
    emotionalDepth: [
      { label: "Deep & Philosophical", value: Math.round(averageDepth), color: "bg-primary" },
      { label: "Fast & Dynamic", value: Math.round(averagePacing), color: "bg-secondary" },
      {
        label: "Light & Whimsical",
        value: Math.max(20, Math.round(100 - averageDepth / 1.4)),
        color: "bg-emerald-400",
      },
    ],
    nextRecommendation,
  };
}

export function buildLeaderboard(
  profiles: Array<{ profile: DbProfile; stats: ProfileStats }>,
  currentUserId: string
): LeaderboardEntry[] {
  const entries = profiles.map(({ profile, stats }) => ({
    rank: 0,
    name: profile.display_name,
    xp: stats.totalXp,
    level: stats.level,
    isCurrentUser: profile.id === currentUserId,
  }));

  entries.sort((a, b) => b.xp - a.xp || b.level - a.level);
  entries.slice(0, 10).forEach((entry, index) => {
    entry.rank = index + 1;
  });

  return entries.slice(0, 10);
}
