import { getCollection, type CollectionEntry } from "astro:content";

export type BlogEntry = CollectionEntry<"blog">;
export type Lang = "es" | "en";

/**
 * Returns all blog posts for the given language, sorted by pubDate DESC.
 * The Astro collection's frontmatter.lang field is the canonical lang tag,
 * which ensures posts are properly isolated per language even when stored
 * in shared subdirectories.
 */
export async function getAllPosts(lang: Lang): Promise<BlogEntry[]> {
    const posts = await getCollection("blog", ({ data }) => data.lang === lang);
    return posts.sort(
        (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
    );
}

/**
 * Returns all unique tags used by posts in the given language,
 * alphabetically sorted. Empty array if no posts have tags.
 */
export async function getAllTagsForLang(lang: Lang): Promise<string[]> {
    const posts = await getAllPosts(lang);
    const tagSet = new Set<string>();
    for (const post of posts) {
        post.data.tags?.forEach((t) => tagSet.add(t));
    }
    return Array.from(tagSet).sort();
}

/**
 * Filters posts to those containing the given tag.
 * Returns all posts unchanged when tag is null or undefined.
 * Case-sensitive matching: "Terraform" != "terraform".
 */
export function filterPostsByTag(
    posts: BlogEntry[],
    tag?: string | null,
): BlogEntry[] {
    if (!tag) return posts;
    return posts.filter((p) => p.data.tags?.includes(tag));
}

/**
 * Counts how many posts use each tag (for the tags index page).
 * Returns a {tag: count} map. Always returns sorted-by-name keys.
 */
export async function getTagCounts(
    lang: Lang,
): Promise<Record<string, number>> {
    const posts = await getAllPosts(lang);
    const counts: Record<string, number> = {};
    for (const post of posts) {
        for (const tag of post.data.tags ?? []) {
            counts[tag] = (counts[tag] ?? 0) + 1;
        }
    }
    return counts;
}
