import { getCollection, type CollectionEntry } from "astro:content";

export type ProjectEntry = CollectionEntry<"projects">;
export type Lang = "es" | "en";

/**
 * Returns all projects for the given language, sorted by `order` ASC
 * and then by title for stable ordering when orders tie.
 */
export async function getAllProjects(lang: Lang): Promise<ProjectEntry[]> {
    const projects = await getCollection(
        "projects",
        ({ data }) => data.lang === lang,
    );
    return projects.sort((a, b) => {
        if (a.data.order !== b.data.order) {
            return a.data.order - b.data.order;
        }
        return a.data.title.localeCompare(b.data.title);
    });
}

/**
 * Returns only projects flagged with featured: true.
 */
export async function getFeaturedProjects(
    lang: Lang,
): Promise<ProjectEntry[]> {
    const projects = await getAllProjects(lang);
    return projects.filter((p) => p.data.featured);
}

/**
 * Returns the slug for a project entry. Astro generates `id` as the
 * file's relative path (e.g. "es/cloud-infrastructure-automation.md"),
 * so we strip the language directory and the .md extension.
 */
export function slugifyProjectId(
    project: Pick<ProjectEntry, "id">,
): string {
    const lastSegment = project.id.split("/").pop() ?? project.id;
    return lastSegment.replace(/\.[^.]+$/, "");
}

/**
 * Given a project and the full list (same lang), returns the next
 * project in sequence — wrapping around so the last project's "next"
 * is the first. Used to render the in-page next/prev nav.
 */
export function getNextProject(
    project: ProjectEntry,
    all: ProjectEntry[],
): ProjectEntry | null {
    if (all.length < 2) return null;
    const idx = all.findIndex((p) => p.id === project.id);
    if (idx === -1) return null;
    return all[(idx + 1) % all.length];
}

/**
 * Inverse of getNextProject — previous in the cyclic order.
 */
export function getPrevProject(
    project: ProjectEntry,
    all: ProjectEntry[],
): ProjectEntry | null {
    if (all.length < 2) return null;
    const idx = all.findIndex((p) => p.id === project.id);
    if (idx === -1) return null;
    return all[(idx - 1 + all.length) % all.length];
}
