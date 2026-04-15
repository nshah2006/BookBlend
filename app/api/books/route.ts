import { createAdminClient } from "@/lib/supabase/server";
import { mapBook } from "@/lib/domain";
import type { DbBook } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search") || "";
  const genre = searchParams.get("genre") || "";
  const featured = searchParams.get("featured") === "true";

  const supabase = await createAdminClient();

  let query = supabase.from("books").select("*");

  if (search) {
    const needle = `%${search.toLowerCase()}%`;
    query = query.or(
      `title.ilike.${needle},author.ilike.${needle},description.ilike.${needle}`
    );
  }

  if (genre) {
    query = query.contains("genre", [genre]);
  }

  if (featured) {
    query = query.eq("is_featured", true);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const books = (data as DbBook[]).map(mapBook);

  // Extract unique genres from all books
  const allGenres = new Set<string>();
  for (const book of books) {
    for (const g of book.genre) {
      allGenres.add(g);
    }
  }

  return NextResponse.json({
    books,
    genres: Array.from(allGenres).sort(),
  });
}
