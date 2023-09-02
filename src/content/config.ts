import {defineCollection, z} from "astro:content";

const blogCollection = defineCollection({
    type: "content",
    schema: z.object({
        title: z.string(),
        pubDate: z.date(),
        description: z.string(),
    })
});

const recipeCollection = defineCollection({
    type: "content",
    schema: ({image}) =>
        z.object({
            title: z.string(),
            pubDate: z.date(),
            cover: image(),
            coverAlt: z.string(),
        })
});
export const collections = {
    blog: blogCollection,
    recipe: recipeCollection,
};