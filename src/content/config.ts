import {defineCollection, z} from "astro:content";
import {glob} from "astro/loaders";

const schema = z.object({
    title: z.string(),
    pubDate: z.date(),
    description: z.string(),
    heroImage: z.string().optional(),
});

export type Blog = z.infer<typeof schema>;

const blogCollection = defineCollection({
    loader: glob({pattern: '**\/[^_]*.mdx', base: "./src/data/blog"}),
    schema,
});

export const collections = {
    blog: blogCollection,
};
