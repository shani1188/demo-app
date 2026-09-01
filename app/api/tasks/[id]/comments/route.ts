import { parseComment } from "@/lib/comments";
import { apiError } from "@/lib/http";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const idSchema = z.string().uuid();

async function context(id: string) {
  if (!idSchema.safeParse(id).success) return { error: apiError(400, "INVALID_ID", "Task id must be a UUID.") };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: apiError(401, "UNAUTHENTICATED", "Authentication is required.") };
  const { data: task } = await supabase.from("tasks").select("id").eq("id", id).maybeSingle();
  if (!task) return { error: apiError(404, "NOT_FOUND", "Task was not found.") };
  return { supabase, user };
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const resolved = await context(id);
  if (resolved.error) return resolved.error;
  const { data, error } = await resolved.supabase.from("task_comments").select("*").eq("task_id", id).order("created_at", { ascending: true });
  if (error) return apiError(500, "COMMENT_LIST_FAILED", "Comments could not be loaded.");
  return NextResponse.json({ data });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const resolved = await context(id);
  if (resolved.error) return resolved.error;
  const parsed = parseComment(await request.json().catch(() => null));
  if (!parsed.success) return apiError(422, "VALIDATION_FAILED", "Comment is invalid.", parsed.error.flatten());
  const { data, error } = await resolved.supabase.from("task_comments").insert({ task_id: id, user_id: resolved.user.id, body: parsed.data.body }).select().single();
  if (error) return apiError(500, "COMMENT_CREATE_FAILED", "Comment could not be added.");
  return NextResponse.json({ data }, { status: 201 });
}
