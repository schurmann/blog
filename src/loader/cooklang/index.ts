import type {Loader, LoaderContext} from "astro/loaders";
import fs from "fs/promises";
import path from "path";
import glob from "fast-glob";
import {RecipeSchema} from "./schema.ts";
import {Recipe} from "@cooklang/cooklang-ts";

type CooklangLoaderOptions = {
    srcDir: string;
    extension?: string;
};

export const cooklangLoader = ({
                                   srcDir,
                                   extension = '.cook',
                               }: CooklangLoaderOptions): Loader => {

    const fileToIdMap = new Map<string, string>();

    return {
        name: "cooklang-loader",
        schema: RecipeSchema,
        load: async (context: LoaderContext) => {
            const {logger, watcher, store, parseData, generateDigest} = context;

            async function syncData(filePath: string) {
                try {
                    const content = await fs.readFile(filePath, "utf-8");
                    const recipe = new Recipe(content);

                    const id = path.relative(srcDir, filePath).replace(extension, "");
                    const data = await parseData({
                        id,
                        data: JSON.parse(JSON.stringify(recipe))
                    });
                    store.set({
                        id,
                        data,
                        digest: generateDigest(content),
                    });
                    const absPath = path.resolve(filePath);
                    fileToIdMap.set(absPath, id)
                } catch (error) {
                    logger.error(`Error processing ${filePath}: ${(error as Error).message}`);
                }
            }

            logger.info(`Loading recipes from ${srcDir}`);

            store.clear()
            try {
                const files = await glob(`${srcDir}/**/*${extension}`);
                for (const file of files) {
                    watcher?.add(file)
                    watcher?.on('change', async (changedPath) => {
                        if (changedPath === file) {
                            await syncData(file);
                        }
                    })
                    await syncData(file)
                }
            } catch (error) {
                logger.error(`Failed to load recipes: ${(error as Error).message}`);
            }

            async function onChange(changedPath: string) {
                if (!changedPath.endsWith(extension)) {
                    return;
                }

                await syncData(changedPath);
            }

            watcher?.on('change', onChange)
            watcher?.on('add', onChange);

            watcher?.on('unlink', async (deletedPath) => {
                const id = fileToIdMap.get(deletedPath);
                if (id) {
                    store.delete(id);
                    fileToIdMap.delete(deletedPath);
                }
            });
        },
    };
}
