import { describe, it, expect } from "vitest";
import { slugifyPostId } from "./blog-ids";

describe("slugifyPostId", () => {
    it("strips language directory prefix and .md extension", () => {
        const post = { id: "es/intro-terraform.md" };
        expect(slugifyPostId(post)).toBe("intro-terraform");
    });

    it("handles paths with multiple segments", () => {
        const post = { id: "en/category/cool-post.md" };
        expect(slugifyPostId(post)).toBe("cool-post");
    });

    it("returns the input unchanged if no extension or prefix", () => {
        const post = { id: "bare-slug" };
        expect(slugifyPostId(post)).toBe("bare-slug");
    });
});
