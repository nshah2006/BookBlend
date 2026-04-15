import { createClient, createAdminClient } from "@/lib/supabase/server";
import { buildChallenges, buildProfileStats, buildLeaderboard } from "@/lib/domain";
import type { DbLibraryItem, DbProfile, DbRecommendationRequest } from "@/lib/types";
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

  // Fetch all profiles
  const { data: profilesData } = await adminClient.from("profiles").select("*");

  const profiles = (profilesData || []) as DbProfile[];

  // Build stats for each profile
  const profileStats = await Promise.all(
    profiles.map(async (profile) => {
      const { data: libraryData } = await adminClient
        .from("library_items")
        .select("*")
        .eq("user_id", profile.id);

      const { data: requestsData } = await adminClient
        .from("recommendation_requests")
        .select("*")
        .eq("user_id", profile.id);

      const libraryRows = (libraryData || []) as DbLibraryItem[];
      const requestRows = (requestsData || []) as DbRecommendationRequest[];

      const challenges = buildChallenges(libraryRows, requestRows);
      const stats = buildProfileStats(libraryRows, requestRows, challenges);

      return { profile, stats };
    })
  );

  const entries = buildLeaderboard(profileStats, user.id);

  return NextResponse.json({ entries });
}
