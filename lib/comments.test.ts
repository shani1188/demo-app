import { describe, expect, it } from "vitest";
import { parseComment } from "./comments";

describe("comment validation", () => {
  it("accepts a useful comment", () => expect(parseComment({ body: "Please verify the acceptance criteria." }).success).toBe(true));
  it("rejects a blank comment", () => expect(parseComment({ body: "   " }).success).toBe(false));
  it("rejects a comment over 2000 characters", () => expect(parseComment({ body: "x".repeat(2001) }).success).toBe(false));
});
