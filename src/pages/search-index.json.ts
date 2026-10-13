import type { APIRoute } from 'astro';
import { chaptersData } from '../data/chapters';
import { guideSchemas } from '../data/guideSchemas';
import { guides, type GuideSlug } from '../data/topicClusters';
import { stripInlineMarkdown } from '../lib/inlineMarkdown';
import type { SearchEntry } from '../lib/siteSearch';

// Fetched by the Cmd+K palette on first open, so pages don't carry the index inline.
export const GET: APIRoute = () => {
  const lessons: SearchEntry[] = Object.entries(chaptersData).map(([key, chapter]) => ({
    kind: 'lesson',
    href: `/chapter/${key}`,
    title: stripInlineMarkdown(chapter.title),
    label: chapter.num,
    summary: stripInlineMarkdown(chapter.desc),
  }));

  const guideEntries: SearchEntry[] = (Object.keys(guides) as GuideSlug[]).map((slug) => ({
    kind: 'guide',
    href: guides[slug].href,
    title: guides[slug].label,
    label: 'Guide',
    summary: guideSchemas[slug].description,
  }));

  return new Response(JSON.stringify([...guideEntries, ...lessons]), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
