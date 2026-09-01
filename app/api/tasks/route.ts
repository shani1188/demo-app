import { createClient } from "@/lib/supabase/server";
import { apiError } from "@/lib/http";
import { parseTask, taskStatuses } from "@/lib/tasks";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiError(401, "UNAUTHENTICATED", "Authentication is required.");
  const status = new URL(request.url).searchParams.get("status");
  let query = supabase.from("tasks").select("*, task_comments(*)").order("created_at", { ascending: false });
  if (status && taskStatuses.includes(status as (typeof taskStatuses)[number])) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) return apiError(500, "TASK_LIST_FAILED", "Tasks could not be loaded.");
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiError(401, "UNAUTHENTICATED", "Authentication is required.");
  const body = await request.json().catch(() => null);
  const parsed = parseTask(body);
  if (!parsed.success) return apiError(422, "VALIDATION_FAILED", "Task input is invalid.", parsed.error.flatten());
  const { data, error } = await supabase.from("tasks").insert({ ...parsed.data, user_id: user.id }).select().single();
  if (error) return apiError(500, "TASK_CREATE_FAILED", "Task could not be created.");
  return NextResponse.json({ data: { ...data, task_comments: [] } }, { status: 201 });
}
