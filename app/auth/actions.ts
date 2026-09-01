"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const value = (data: FormData, key: string) => String(data.get(key) ?? "").trim();
const messageUrl = (path: string, type: "error" | "success", message: string) =>
  `${path}?${type}=${encodeURIComponent(message)}`;

export async function login(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: value(formData, "email"), password: value(formData, "password") });
  if (error) redirect(messageUrl("/login", "error", "Email or password is incorrect."));
  redirect("/tasks");
}

export async function signup(formData: FormData) {
  const password = value(formData, "password");
  if (password.length < 10) redirect(messageUrl("/signup", "error", "Password must be at least 10 characters."));
  const origin = (await headers()).get("origin") ?? "http://localhost:3000";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: value(formData, "email"), password,
    options: { emailRedirectTo: `${origin}/auth/callback?next=/tasks` }
  });
  if (error) redirect(messageUrl("/signup", "error", error.message));
  if (data.session) redirect("/tasks");
  redirect(messageUrl("/login", "success", "Check your email to verify your account."));
}

export async function requestPasswordReset(formData: FormData) {
  const origin = (await headers()).get("origin") ?? "http://localhost:3000";
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(value(formData, "email"), { redirectTo: `${origin}/auth/callback?next=/reset-password` });
  redirect(messageUrl("/forgot-password", "success", "If an account exists, a reset link has been sent."));
}

export async function updatePassword(formData: FormData) {
  const password = value(formData, "password");
  if (password.length < 10) redirect(messageUrl("/reset-password", "error", "Password must be at least 10 characters."));
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect(messageUrl("/reset-password", "error", "The reset link is invalid or expired."));
  redirect(messageUrl("/login", "success", "Password updated. Sign in with your new password."));
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

