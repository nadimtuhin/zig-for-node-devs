import type { APIRoute } from 'astro';
import { chaptersData } from '../data/chapters';

type ChangeFreq = 'weekly' | 'monthly';

interface SitemapEntry {
  path: string;
  changefreq: ChangeFreq;
  priority: string;
}

const guidePaths = [
  '/roadmap',
  '/comptime',
  '/memory',
  '/c-interop',
  '/build-system',
  '/microservice',
  '/docker',
  '/leetcode',
  '/philosophy',
  '/pitfalls',
  '/troubleshooting',
  '/interviews',
  '/cheatsheet',
];

const entries: SitemapEntry[] = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/chapters', changefreq: 'weekly', priority: '0.9' },
  ...guidePaths.map((path) => ({ path, changefreq: 'monthly' as const, priority: '0.8' })),
  ...Object.keys(chaptersData).map((key) => ({
    path: `/chapter/${key}`,
    changefreq: 'monthly' as const,
    priority: '0.7',
  })),
];

export const GET: APIRoute = ({ site }) => {
  const origin = (site?.href ?? 'https://zig-for-node-devs.vercel.app/').replace(/\/$/, '');
  const lastmod = new Date().toISOString().slice(0, 10);

  const urls = entries
    .map(
      ({ path, changefreq, priority }) => `  <url>
    <loc>${origin}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
