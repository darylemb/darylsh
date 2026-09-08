import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string(),
        pubDate: z.date(),
        lang: z.enum(['en', 'es']),
        tags: z.array(z.string()).optional(),
    }),
});

const projects = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string(),
        lang: z.enum(['en', 'es']),
        pubDate: z.date(),
        // Display order on /[lang]/projects (lower = first). Equal values
        // fall back to lexical title order.
        order: z.number().int().nonnegative().default(99),
        // Tech tags shown as pills on the card. Each card must show 3+ tags.
        tags: z
            .array(
                z.object({
                    name: z.string(),
                    // Icon path under /public; optional (defaults to none).
                    icon: z.string().optional(),
                }),
            )
            .min(3, { message: 'Each project must declare at least 3 tags' }),
        // Featured projects appear on the homepage projects section.
        featured: z.boolean().default(false),
        // Optional links to repo / live demo / case study.
        repo: z.string().url().optional(),
        demo: z.string().url().optional(),
    }),
});

export const collections = { blog, projects };
