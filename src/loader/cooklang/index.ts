import type {Loader, LoaderContext} from "astro/loaders";
import fs from "fs/promises";
import path from "path";
import glob from "fast-glob";
import {RecipeSchema} from "./schema.ts";
import {CooklangParser, quantity_display} from "@cooklang/cooklang";

type CooklangLoaderOptions = {
    srcDir: string;
    extension?: string;
};

type StepItemData =
    | { type: "text"; value: string }
    | { type: "ingredient"; name: string; quantity: string | null }
    | { type: "cookware"; name: string }
    | { type: "timer"; name: string | null; quantity: string | null };

function formatTime(time: number | { prep_time?: number; cook_time?: number } | null | undefined): string | undefined {
    if (time == null) return undefined;
    if (typeof time === 'number') return `${time} min`;
    const parts: string[] = [];
    if (time.prep_time) parts.push(`${time.prep_time} min prep`);
    if (time.cook_time) parts.push(`${time.cook_time} min cook`);
    return parts.length > 0 ? parts.join(', ') : undefined;
}

export const cooklangLoader = ({
    srcDir,
    extension = '.cook',
}: CooklangLoaderOptions): Loader => {
    const fileToIdMap = new Map<string, string>();
    const parser = new CooklangParser();

    return {
        name: "cooklang-loader",
        schema: RecipeSchema,
        load: async (context: LoaderContext) => {
            const {logger, watcher, store, parseData, generateDigest} = context;

            async function syncData(filePath: string) {
                try {
                    const content = await fs.readFile(filePath, "utf-8");
                    const [recipe] = parser.parse(content);

                    const sections = recipe.sections.map(section => ({
                        name: section.name,
                        steps: section.content
                            .filter(c => c.type === "step")
                            .map(c => ({
                                items: (c as Extract<typeof c, { type: "step" }>).value.items.flatMap((item): StepItemData[] => {
                                    if (item.type === "text") {
                                        return [{ type: "text" as const, value: item.value }];
                                    } else if (item.type === "ingredient") {
                                        const ing = recipe.ingredients[item.index];
                                        return [{
                                            type: "ingredient" as const,
                                            name: ing.name,
                                            quantity: ing.quantity ? quantity_display(ing.quantity) : null,
                                        }];
                                    } else if (item.type === "cookware") {
                                        const cw = recipe.cookware[item.index];
                                        return [{ type: "cookware" as const, name: cw.name }];
                                    } else if (item.type === "timer") {
                                        const t = recipe.timers[item.index];
                                        return [{
                                            type: "timer" as const,
                                            name: t.name,
                                            quantity: t.quantity ? quantity_display(t.quantity) : null,
                                        }];
                                    }
                                    return [];
                                }),
                            })),
                    }));

                    const data = {
                        metadata: {
                            title: recipe.title ?? undefined,
                            description: recipe.description ?? undefined,
                            source: recipe.source?.url ?? recipe.source?.name ?? undefined,
                            servings: recipe.servings != null ? String(recipe.servings) : undefined,
                            cookTime: formatTime(recipe.time),
                            notes: (recipe.custom_metadata.get('notes') as string | null) ?? undefined,
                        },
                        ingredients: recipe.ingredients.map(ing => ({
                            name: ing.name,
                            quantity: ing.quantity ? quantity_display(ing.quantity) : null,
                            note: ing.note,
                        })),
                        cookware: recipe.cookware.map(cw => ({ name: cw.name })),
                        sections,
                    };

                    const id = path.relative(srcDir, filePath).replace(extension, "");
                    const parsedData = await parseData({id, data});
                    store.set({id, data: parsedData, digest: generateDigest(content)});
                    fileToIdMap.set(path.resolve(filePath), id);
                } catch (error) {
                    logger.error(`Error processing ${filePath}: ${(error as Error).message}`);
                }
            }

            logger.info(`Loading recipes from ${srcDir}`);
            store.clear();

            try {
                const files = await glob(`${srcDir}/**/*${extension}`);
                for (const file of files) {
                    watcher?.add(file);
                    await syncData(file);
                }
            } catch (error) {
                logger.error(`Failed to load recipes: ${(error as Error).message}`);
            }

            async function onChange(changedPath: string) {
                if (!changedPath.endsWith(extension)) return;
                await syncData(changedPath);
            }

            watcher?.on('change', onChange);
            watcher?.on('add', onChange);
            watcher?.on('unlink', async (deletedPath: string) => {
                const id = fileToIdMap.get(deletedPath);
                if (id) {
                    store.delete(id);
                    fileToIdMap.delete(deletedPath);
                }
            });
        },
    };
};
