import { z } from "zod";

const fields = {
  title: z.string().trim().min(1, "Title is required").max(120, "Title must be 120 characters or fewer"),
  description: z.string().trim().max(1000, "Description must be 1000 characters or fewer"),
  status: z.enum(["todo", "in_progress", "done"]),
  priority: z.enum(["low", "medium", "high"])
};

export const taskSchema = z.object({ title: fields.title, description: fields.description.default(""), status: fields.status.default("todo"), priority: fields.priority.default("medium") });

export const taskPatchSchema = z.object({ title: fields.title.optional(), description: fields.description.optional(), status: fields.status.optional(), priority: fields.priority.optional() }).refine((value) => Object.keys(value).length > 0, {
  message: "At least one field is required"
});

export type TaskInput = z.infer<typeof taskSchema>;

export function parseTask(input: unknown, partial = false) {
  return partial ? taskPatchSchema.safeParse(input) : taskSchema.safeParse(input);
}
