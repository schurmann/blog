import {defineCollection, z} from "astro:content";
const blogCollection = defineCollection({
    schema: z.object({
        title: z.string(),
        pubDate: z.date(),
        description: z.string(),
        heroImage: z.string().optional(),
    })
});
export const collections = {
    blog: blogCollection,
};