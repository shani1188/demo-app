import { z } from "zod";

export const commentSchema = z.object({
  body: z.string().trim().min(1, "Comment is required").max(2000, "Comment must be 2000 characters or fewer")
});

export function parseComment(input: unknown) {
  return commentSchema.safeParse(input);
}
