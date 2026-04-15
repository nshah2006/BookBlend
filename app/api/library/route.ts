import { createClient, createAdminClient } from "@/lib/supabase/server";
import { mapBook, nowIso } from "@/lib/domain";
import type { DbBook, DbLibraryItem, LibraryItem } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

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
  const { data: libraryData, error: libraryError } = await adminClient
    .from("library_items")
    .select("*")
    .eq("user_id", user.id);

  if (libraryError) {
    return NextResponse.json({ error: libraryError.message }, { status: 500 });
  }

  const libraryItems = libraryData as DbLibraryItem[];

  // Fetch books for library items
  const bookIds = libraryItems.map((item) => item.book_id);
  let booksMap = new Map<string, DbBook>();

  if (bookIds.length > 0) {
    const { data: booksData } = await adminClient
      .from("books")
      .select("*")
      .in("id", bookIds);

    if (booksData) {
      for (const book of booksData as DbBook[]) {
        booksMap.set(book.id, book);
      }
    }
  }

  const items: LibraryItem[] = libraryItems.map((item) => ({
    userId: item.user_id,
    bookId: item.book_id,
    status: item.status,
    progressPercent: item.progress_percent,
    pagesRead: item.pages_read,
    savedAt: item.saved_at,
    startedAt: item.started_at,
    finishedAt: item.finished_at,
    book: mapBook(booksMap.get(item.book_id)!),
  }));

  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { bookId, status = "reading" } = body;

  if (!bookId) {
    return NextResponse.json({ error: "bookId is required" }, { status: 400 });
  }

  const adminClient = await createAdminClient();
  const timestamp = nowIso();

  // Check if item exists
  const { data: existing } = await adminClient
    .from("library_items")
    .select("*")
    .eq("user_id", user.id)
    .eq("book_id", bookId)
    .single();

  const payload = {
    user_id: user.id,
    book_id: bookId,
    status,
    progress_percent: existing?.progress_percent ?? (status === "completed" ? 100 : 0),
    pages_read: existing?.pages_read ?? 0,
    saved_at: existing?.saved_at ?? timestamp,
    started_at: existing?.started_at ?? (status === "wishlist" ? null : timestamp),
    finished_at: existing?.finished_at ?? (status === "completed" ? timestamp : null),
  };

  const { error } = await adminClient
    .from("library_items")
    .upsert(payload, { onConflict: "user_id,book_id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
