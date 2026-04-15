import { createClient, createAdminClient } from "@/lib/supabase/server";
import { nowIso } from "@/lib/domain";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const { bookId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = await createAdminClient();

  // Fetch existing item
  const { data: existing, error: fetchError } = await adminClient
    .from("library_items")
    .select("*")
    .eq("user_id", user.id)
    .eq("book_id", bookId)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Library item not found" }, { status: 404 });
  }

  const body = await request.json();
  const nextStatus = body.status ?? existing.status;
  let nextProgress = body.progressPercent ?? existing.progress_percent;
  const nextPages = body.pagesRead ?? existing.pages_read;
  let startedAt = existing.started_at;
  let finishedAt = existing.finished_at;

  if (nextStatus === "completed") {
    nextProgress = 100;
    finishedAt = finishedAt || nowIso();
  } else if (nextStatus === "reading") {
    startedAt = startedAt || nowIso();
    finishedAt = null;
  }

  const { error: updateError } = await adminClient
    .from("library_items")
    .update({
      status: nextStatus,
      progress_percent: nextProgress,
      pages_read: nextPages,
      started_at: startedAt,
      finished_at: finishedAt,
    })
    .eq("user_id", user.id)
    .eq("book_id", bookId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const { bookId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = await createAdminClient();

  const { error } = await adminClient
    .from("library_items")
    .delete()
    .eq("user_id", user.id)
    .eq("book_id", bookId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
