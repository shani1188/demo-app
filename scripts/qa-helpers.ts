import { createClient } from "@supabase/supabase-js";
import { serverEnv } from "../lib/env";

export const runId = (process.env.QA_RUN_ID ?? "local").replace(/[^a-zA-Z0-9-]/g, "-").slice(0, 40);
export const qaEmail = (index: number) => `qa+${runId}-${index}@example.test`;
export const admin = () => { const env = serverEnv(); return createClient(env.supabaseUrl, env.serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } }); };

