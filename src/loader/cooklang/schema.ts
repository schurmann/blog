import {z} from "astro/zod";

const IngredientSchema = z.object({
    type: z.literal("ingredient"),
    name: z.string(),
    quantity: z.union([z.string(), z.number()]),
    units: z.string(),
    step: z.number().optional(),
})

const CookwareSchema = z.object({
    type: z.literal("cookware"),
    name: z.string(),
    quantity: z.union([z.string(), z.number()]),
    step: z.number().optional(),
})

const TimerSchema = z.object({
    type: z.literal("timer"),
    name: z.string().optional(),
    quantity: z.union([z.string(), z.number()]),
    units: z.string(),
})

const TextSchema = z.object({
    type: z.literal("text"),
    value: z.string(),
})

const ItemSchema = z.object({
    name: z.string(),
    synonym: z.string().optional(),
})

export const RecipeSchema = z.object({
    ingredients: z.array(IngredientSchema),
    cookwares: z.array(CookwareSchema),
    metadata: z.record(z.string(), z.string()),
    steps: z.array(z.array(z.union([IngredientSchema, CookwareSchema, TimerSchema, TextSchema]))),
    shoppingList: z.record(z.string(), z.array(ItemSchema)),
});

export type Recipe = z.infer<typeof RecipeSchema>;
