import { describe, expect, it } from "vitest";
import { parseTask } from "./tasks";

describe("task validation", () => {
  it("accepts a valid task", () => expect(parseTask({ title: "Release", description: "QA it", status: "todo", priority: "high" }).success).toBe(true));
  it("rejects an empty title", () => expect(parseTask({ title: "   " }).success).toBe(false));
  it("rejects an overlong title", () => expect(parseTask({ title: "x".repeat(121) }).success).toBe(false));
  it("requires at least one patch field", () => expect(parseTask({}, true).success).toBe(false));
});

