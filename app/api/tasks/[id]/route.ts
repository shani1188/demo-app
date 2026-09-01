import { createClient } from "@/lib/supabase/server";
import { apiError } from "@/lib/http";
import { parseTask } from "@/lib/tasks";
import { NextResponse } from "next/server";
import { z } from "zod";

const idSchema = z.string().uuid();

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!idSchema.safeParse(id).success) return apiError(400, "INVALID_ID", "Task id must be a UUID.");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiError(401, "UNAUTHENTICATED", "Authentication is required.");
  const parsed = parseTask(await request.json().catch(() => null), true);
  if (!parsed.success) return apiError(422, "VALIDATION_FAILED", "Task input is invalid.", parsed.error.flatten());
  const { data, error } = await supabase.from("tasks").update(parsed.data).eq("id", id).select().maybeSingle();
  if (error) return apiError(500, "TASK_UPDATE_FAILED", "Task could not be updated.");
  if (!data) return apiError(404, "NOT_FOUND", "Task was not found.");
  return NextResponse.json({ data });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!idSchema.safeParse(id).success) return apiError(400, "INVALID_ID", "Task id must be a UUID.");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiError(401, "UNAUTHENTICATED", "Authentication is required.");
  const { data, error } = await supabase.from("tasks").delete().eq("id", id).select("id").maybeSingle();
  if (error) return apiError(500, "TASK_DELETE_FAILED", "Task could not be deleted.");
  if (!data) return apiError(404, "NOT_FOUND", "Task was not found.");
  return new NextResponse(null, { status: 204 });
}

