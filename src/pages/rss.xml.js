import rss from '@astrojs/rss';
import {getCollection} from 'astro:content';
import {SITE_DESCRIPTION, SITE_TITLE} from '../config';

export async function get(context) {
    const entries = await getCollection('blog');
    return rss({
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
        site: context.site,
        items: entries.map((entry) => ({
            title: entry.data.title,
            pubDate: entry.data.pubDate,
            description: entry.data.description,
            link: `/blog/${entry.slug}`,
        }))
    });
}
