import { createClient, createAdminClient } from "@/lib/supabase/server";
import {
  mapBook,
  toPublicUser,
  buildChallenges,
  buildProfileStats,
  buildInsights,
} from "@/lib/domain";
import type {
  DbBook,
  DbLibraryItem,
  DbProfile,
  DbRecommendationRequest,
  Book,
  RecommendationResult,
} from "@/lib/types";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = await createAdminClient();

  // Fetch profile
  const { data: profileData } = await adminClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profileData) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const profile = profileData as DbProfile;

  // Fetch library items
  const { data: libraryData } = await adminClient
    .from("library_items")
    .select("*")
    .eq("user_id", user.id);

  const libraryRows = (libraryData || []) as DbLibraryItem[];

  // Fetch books for library
  const bookIds = libraryRows.map((item) => item.book_id);
  const booksMap = new Map<string, Book>();

  if (bookIds.length > 0) {
    const { data: booksData } = await adminClient
      .from("books")
      .select("*")
      .in("id", bookIds);

    if (booksData) {
      for (const book of booksData as DbBook[]) {
        booksMap.set(book.id, mapBook(book));
      }
    }
  }

  // Fetch recommendation requests
  const { data: requestsData } = await adminClient
    .from("recommendation_requests")
    .select("*")
    .eq("user_id", user.id);

  const requestRows = (requestsData || []) as DbRecommendationRequest[];

  // Get latest recommendation
  let nextRecommendation: RecommendationResult | null = null;
  if (requestRows.length > 0) {
    const latestRequest = requestRows.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];

    const { data: resultData } = await adminClient
      .from("recommendation_results")
      .select("*")
      .eq("request_id", latestRequest.id)
      .order("rank")
      .limit(1)
      .single();

    if (resultData) {
      let book = booksMap.get(resultData.book_id);
      if (!book) {
        const { data: bookData } = await adminClient
          .from("books")
          .select("*")
          .eq("id", resultData.book_id)
          .single();

        if (bookData) {
          book = mapBook(bookData as DbBook);
        }
      }

      if (book) {
        nextRecommendation = {
          book,
          score: resultData.score,
          reason: resultData.reason,
        };
      }
    }
  }

  const challenges = buildChallenges(libraryRows, requestRows);
  const stats = buildProfileStats(libraryRows, requestRows, challenges);
  const insights = buildInsights(libraryRows, requestRows, booksMap, nextRecommendation);

  // Find current read
  const currentReadItem = libraryRows.find((item) => item.status === "reading");
  const currentRead = currentReadItem ? booksMap.get(currentReadItem.book_id) || null : null;

  // Build history
  const history = libraryRows.map((item) => {
    const book = booksMap.get(item.book_id);
    return {
      title: book?.title || "Unknown",
      author: book?.author || "Unknown",
      status: item.status,
      progressPercent: item.progress_percent,
      savedAt: item.saved_at,
    };
  });

  // Saved books (wishlist)
  const savedBooks = libraryRows
    .filter((item) => item.status === "wishlist")
    .map((item) => booksMap.get(item.book_id))
    .filter(Boolean) as Book[];

  // Generate badges based on stats
  const badges: string[] = [];
  if (stats.booksRead >= 1) badges.push("First Read");
  if (stats.booksRead >= 5) badges.push("Avid Reader");
  if (stats.dayStreak >= 7) badges.push("Week Warrior");
  if (stats.quests >= 1) badges.push("Quest Starter");

  return NextResponse.json({
    user: toPublicUser(profile),
    stats,
    currentRead,
    badges,
    history,
    savedBooks,
    insights,
  });
}
