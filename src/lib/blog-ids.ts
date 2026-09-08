import { type CollectionEntry } from "astro:content";

/**
 * Astro content collections store post id as the file's relative path
 * including the .md extension. Example: "es/intro-terraform.md".
 * This helper extracts a clean URL slug usable in routing — i.e. the
 * filename without any directory prefix or file extension.
 */
export function slugifyPostId(post: Pick<CollectionEntry<"blog">, "id">): string {
    // Take everything after the last "/", then strip any extension.
    const lastSegment = post.id.split("/").pop() ?? post.id;
    return lastSegment.replace(/\.[^.]+$/, "");
}
