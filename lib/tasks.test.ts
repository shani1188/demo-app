import { describe, expect, it } from "vitest";
import { parseTask } from "./tasks";

describe("task validation", () => {
  it("accepts every supported task status", () => {
    for (const status of ["open", "in_progress", "pending", "canceled", "completed"]) {
      expect(parseTask({ title: "Release", description: "QA it", status, priority: "high" }).success).toBe(true);
    }
  });
  it("rejects an empty title", () => expect(parseTask({ title: "   " }).success).toBe(false));
  it("rejects an overlong title", () => expect(parseTask({ title: "x".repeat(121) }).success).toBe(false));
  it("rejects legacy task statuses", () => expect(parseTask({ title: "Release", status: "todo" }).success).toBe(false));
  it("requires at least one patch field", () => expect(parseTask({}, true).success).toBe(false));
});
