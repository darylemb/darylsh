import { describe, it, expect } from "vitest";
import type { CollectionEntry } from "astro:content";
import {
    slugifyProjectId,
    getNextProject,
    getPrevProject,
} from "./projects";

type ProjectEntry = CollectionEntry<"projects">;

const mock = (
    id: string,
    overrides: Partial<ProjectEntry["data"]> = {},
): ProjectEntry =>
    ({
        id,
        slug: id.replace(/^[^/]+\//, "").replace(/\.md$/, ""),
        body: "",
        collection: "projects",
        data: {
            title: overrides.title ?? "Untitled",
            description: overrides.description ?? "",
            pubDate: overrides.pubDate ?? new Date("2026-09-01"),
            lang: overrides.lang ?? "es",
            order: overrides.order ?? 99,
            tags: overrides.tags ?? [],
            featured: overrides.featured ?? false,
        },
    }) as ProjectEntry;

describe("slugifyProjectId", () => {
    it("strips language dir prefix and .md", () => {
        expect(slugifyProjectId(mock("es/k8s-management.md"))).toBe(
            "k8s-management",
        );
    });

    it("strips any extension", () => {
        expect(slugifyProjectId(mock("en/k8s.mdx"))).toBe("k8s");
    });

    it("extracts filename from multi-segment paths", () => {
        expect(slugifyProjectId(mock("en/sub/cat/post.md"))).toBe("post");
    });
});

describe("getNextProject / getPrevProject", () => {
    const list = [
        mock("es/a.md", { order: 1, title: "Alpha" }),
        mock("es/b.md", { order: 2, title: "Bravo" }),
        mock("es/c.md", { order: 3, title: "Charlie" }),
    ];

    it("returns the next project in order", () => {
        expect(getNextProject(list[0], list)?.data.title).toBe("Bravo");
    });

    it("wraps around when on the last project", () => {
        expect(getNextProject(list[2], list)?.data.title).toBe("Alpha");
    });

    it("returns the previous project in order", () => {
        expect(getPrevProject(list[1], list)?.data.title).toBe("Alpha");
    });

    it("wraps backwards from the first", () => {
        expect(getPrevProject(list[0], list)?.data.title).toBe("Charlie");
    });

    it("returns null when only one project exists", () => {
        const solo = [mock("es/lonely.md")];
        expect(getNextProject(solo[0], solo)).toBeNull();
        expect(getPrevProject(solo[0], solo)).toBeNull();
    });

    it("returns null when the project is not in the list", () => {
        const stranger = mock("es/ghost.md");
        expect(getNextProject(stranger, list)).toBeNull();
    });
});
