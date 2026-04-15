import { createClient, createAdminClient } from "@/lib/supabase/server";
import { mapBook, buildRecommendations, nowIso } from "@/lib/domain";
import type { DbBook, RecommendationInput } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as RecommendationInput;
  const { mood, pacing, depth } = body;

  if (!mood) {
    return NextResponse.json({ error: "Mood is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const adminClient = await createAdminClient();

  // Get current user (optional)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch all books
  const { data: booksData, error: booksError } = await adminClient
    .from("books")
    .select("*");

  if (booksError) {
    return NextResponse.json({ error: booksError.message }, { status: 500 });
  }

  const books = (booksData as DbBook[]).map(mapBook);
  const recommendations = buildRecommendations(books, { mood, pacing, depth });

  // Store the request
  const { data: requestRow, error: requestError } = await adminClient
    .from("recommendation_requests")
    .insert({
      user_id: user?.id ?? null,
      mood,
      pacing,
      depth,
      created_at: nowIso(),
    })
    .select()
    .single();

  if (requestError) {
    return NextResponse.json({ error: requestError.message }, { status: 500 });
  }

  // Store the results
  if (recommendations.length > 0) {
    const resultRows = recommendations.map((rec, index) => ({
      request_id: requestRow.id,
      book_id: rec.book.id,
      score: rec.score,
      reason: rec.reason,
      rank: index + 1,
    }));

    await adminClient.from("recommendation_results").insert(resultRows);
  }

  return NextResponse.json({
    request: {
      id: requestRow.id,
      mood,
      pacing,
      depth,
      createdAt: requestRow.created_at,
    },
    recommendations,
  });
}
