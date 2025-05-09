import {defineConfig} from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from "@tailwindcss/vite";
import {h} from 'hastscript'

import remarkToc from "remark-toc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";

const AnchorLinkIcon = h(
    'svg',
    {
        width: '0.75em',
        height: '0.75em',
        viewBox: '0 0 16 16',
        xlmns: 'http://www.w3.org/2000/svg',
    },
    h('path', {
        fillRule: 'evenodd',
        d: 'M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z',
    })
);

export default defineConfig({
    site: 'https://schurmann.dev',
    integrations: [
        mdx({
            remarkPlugins: [remarkToc],
            rehypePlugins: [
                [rehypeSlug],
                [
                    rehypeAutolinkHeadings,
                    {
                        behavior: 'append',
                        content: () => [
                            h(
                                `span`,
                                {
                                    ariaHidden: 'true',
                                    'class': 'anchor'
                                },
                                AnchorLinkIcon
                            ),
                        ],
                    },
                ],
            ],
        }),
        sitemap(),
    ],
    output: "static",
    vite: {
        plugins: [tailwindcss()],
        server: {
            watch: {
                ignored: ['demos/**']
            }
        }
    }
});
