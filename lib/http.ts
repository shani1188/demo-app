import { NextResponse } from "next/server";

export const apiError = (status: number, code: string, message: string, details?: unknown) =>
  NextResponse.json({ error: { code, message, ...(details ? { details } : {}) } }, { status });

