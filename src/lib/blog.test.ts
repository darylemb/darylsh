import { describe, it, expect } from "vitest";
import type { CollectionEntry } from "astro:content";
import { filterPostsByTag } from "./blog";

type BlogEntry = CollectionEntry<"blog">;

const mockPost = (overrides: Partial<BlogEntry["data"]> = {}): BlogEntry =>
    ({
        id: "es/" + (overrides.title ?? "post") + ".md",
        slug: (overrides.title ?? "post").toLowerCase(),
        body: "",
        collection: "blog",
        data: {
            title: overrides.title ?? "Untitled",
            description: overrides.description ?? "desc",
            pubDate: overrides.pubDate ?? new Date("2026-09-01"),
            lang: overrides.lang ?? "es",
            tags: overrides.tags,
        },
    }) as BlogEntry;

describe("filterPostsByTag", () => {
    it("returns all posts when tag is null", () => {
        const posts = [
            mockPost({ tags: ["kubernetes"] }),
            mockPost({ tags: ["terraform"] }),
        ];
        expect(filterPostsByTag(posts, null)).toHaveLength(2);
    });

    it("returns all posts when tag is undefined", () => {
        const posts = [
            mockPost({ tags: ["kubernetes"] }),
            mockPost({ tags: ["terraform"] }),
        ];
        expect(filterPostsByTag(posts)).toHaveLength(2);
    });

    it("filters posts by exact tag match", () => {
        const posts = [
            mockPost({ tags: ["kubernetes", "aws"] }),
            mockPost({ tags: ["aws"] }),
        ];
        const filtered = filterPostsByTag(posts, "aws");
        expect(filtered).toHaveLength(2);
        for (const p of filtered) {
            expect(p.data.tags).toContain("aws");
        }
    });

    it("excludes posts without the matching tag", () => {
        const posts = [
            mockPost({ tags: ["kubernetes"] }),
            mockPost({ tags: ["aws"] }),
        ];
        const filtered = filterPostsByTag(posts, "aws");
        expect(filtered).toHaveLength(1);
        expect(filtered[0].data.tags).toEqual(["aws"]);
    });

    it("returns empty array when no posts match", () => {
        const posts = [mockPost({ tags: ["kubernetes"] })];
        expect(filterPostsByTag(posts, "nope")).toHaveLength(0);
    });

    it("excludes posts with no tags field", () => {
        const posts = [
            mockPost({ tags: undefined }),
            mockPost({ tags: ["terraform"] }),
        ];
        expect(filterPostsByTag(posts, "terraform")).toHaveLength(1);
    });

    it("treats tags as case-sensitive (no fuzzy match)", () => {
        const posts = [mockPost({ tags: ["Terraform"] })];
        expect(filterPostsByTag(posts, "terraform")).toHaveLength(0);
        expect(filterPostsByTag(posts, "Terraform")).toHaveLength(1);
    });
});
