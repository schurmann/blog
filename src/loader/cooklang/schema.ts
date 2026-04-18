import {z} from "astro/zod";

const TextItemSchema = z.object({
    type: z.literal("text"),
    value: z.string(),
});

const IngredientItemSchema = z.object({
    type: z.literal("ingredient"),
    name: z.string(),
    quantity: z.string().nullable(),
});

const CookwareItemSchema = z.object({
    type: z.literal("cookware"),
    name: z.string(),
});

const TimerItemSchema = z.object({
    type: z.literal("timer"),
    name: z.string().nullable(),
    quantity: z.string().nullable(),
});

const StepItemSchema = z.discriminatedUnion("type", [
    TextItemSchema,
    IngredientItemSchema,
    CookwareItemSchema,
    TimerItemSchema,
]);

const SectionSchema = z.object({
    name: z.string().nullable(),
    steps: z.array(z.object({
        items: z.array(StepItemSchema),
    })),
});

const IngredientSchema = z.object({
    name: z.string(),
    quantity: z.string().nullable(),
    note: z.string().nullable(),
});

export const RecipeSchema = z.object({
    metadata: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        source: z.string().optional(),
        servings: z.string().optional(),
        cookTime: z.string().optional(),
        notes: z.string().optional(),
    }),
    ingredients: z.array(IngredientSchema),
    cookware: z.array(z.object({ name: z.string() })),
    sections: z.array(SectionSchema),
});

export type Recipe = z.infer<typeof RecipeSchema>;
