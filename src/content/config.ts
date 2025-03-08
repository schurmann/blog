import {defineCollection, z} from "astro:content";
import {glob} from "astro/loaders";
import {cooklangLoader} from "../loader/cooklang";

const blogSchema = z.object({
    title: z.string(),
    pubDate: z.date(),
    description: z.string(),
    heroImage: z.string().optional(),
});

export type Blog = z.infer<typeof blogSchema>;

const blogCollection = defineCollection({
    loader: glob({pattern: '**\/[^_]*.mdx', base: "./src/data/blog"}),
    schema: blogSchema,
});

const recipeCollection = defineCollection({
    loader: cooklangLoader({
        srcDir: "src/recipes",
    }),
});

export const collections = {
    blog: blogCollection,
    recipe: recipeCollection,
};
