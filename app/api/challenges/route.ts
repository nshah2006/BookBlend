import { createClient, createAdminClient } from "@/lib/supabase/server";
import { buildChallenges, buildProfileStats, buildChallengeSummary } from "@/lib/domain";
import type { DbLibraryItem, DbRecommendationRequest } from "@/lib/types";
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

  // Fetch library items
  const { data: libraryData } = await adminClient
    .from("library_items")
    .select("*")
    .eq("user_id", user.id);

  // Fetch recommendation requests
  const { data: requestsData } = await adminClient
    .from("recommendation_requests")
    .select("*")
    .eq("user_id", user.id);

  const libraryRows = (libraryData || []) as DbLibraryItem[];
  const requestRows = (requestsData || []) as DbRecommendationRequest[];

  const challenges = buildChallenges(libraryRows, requestRows);
  const stats = buildProfileStats(libraryRows, requestRows, challenges);
  const summary = buildChallengeSummary(stats, challenges);

  return NextResponse.json({
    summary,
    challenges,
  });
}
