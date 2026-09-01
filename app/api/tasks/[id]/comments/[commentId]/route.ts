import { apiError } from "@/lib/http";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const idSchema = z.string().uuid();

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string; commentId: string }> }) {
  const { id, commentId } = await params;
  if (!idSchema.safeParse(id).success || !idSchema.safeParse(commentId).success) return apiError(400, "INVALID_ID", "Task and comment ids must be UUIDs.");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiError(401, "UNAUTHENTICATED", "Authentication is required.");
  const { data, error } = await supabase.from("task_comments").delete().eq("id", commentId).eq("task_id", id).select("id").maybeSingle();
  if (error) return apiError(500, "COMMENT_DELETE_FAILED", "Comment could not be deleted.");
  if (!data) return apiError(404, "NOT_FOUND", "Comment was not found.");
  return new NextResponse(null, { status: 204 });
}
