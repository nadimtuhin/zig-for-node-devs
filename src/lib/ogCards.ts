import { chaptersData } from '../data/chapters';

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const DEFAULT_OG_IMAGE_PATH = '/og-image.png';

const ZIG_AMBER = '#f7a41d';
const LESSON_COUNT = Object.keys(chaptersData).length;
export const OG_TAGLINE = `${LESSON_COUNT} Interactive Lessons & Live Compiler Explorer`;

export interface OgCard {
  /** Page path without trailing slash; '' is the home page. */
  pagePath: string;
  kicker: string;
  title: string;
}

const GUIDE_CARDS: OgCard[] = [
  { pagePath: '/roadmap', kicker: 'Guide · Learning Path', title: 'Zig Developer Roadmap 2026' },
  { pagePath: '/memory', kicker: 'Guide · Memory', title: 'Memory & Allocator Architecture' },
  { pagePath: '/comptime', kicker: 'Guide · Metaprogramming', title: 'Comptime Metaprogramming Mastery' },
  { pagePath: '/build-system', kicker: 'Guide · Tooling', title: 'build.zig vs npm & Package Management' },
  { pagePath: '/c-interop', kicker: 'Guide · Interop', title: 'C Interoperability & Node-API Addons' },
  { pagePath: '/docker', kicker: 'Guide · Deployment', title: 'Production Docker Recipes: Static Binaries on Scratch' },
  { pagePath: '/microservice', kicker: 'Guide · Architecture', title: 'Production Microservice Architecture' },
  { pagePath: '/philosophy', kicker: 'Guide · Mindset', title: 'The Philosophy & Zen of Zig' },
  { pagePath: '/pitfalls', kicker: 'Guide · Footguns', title: 'Top 8 Zig Pitfalls & Footguns' },
  { pagePath: '/troubleshooting', kicker: 'Guide · Debugging', title: 'Diagnostics & Debugging Playbook' },
  { pagePath: '/interviews', kicker: 'Guide · Career', title: 'Senior Systems Interview Q&A' },
  { pagePath: '/cheatsheet', kicker: 'Guide · Reference', title: 'JavaScript to Zig Rosetta Stone Cheatsheet' },
  { pagePath: '/leetcode', kicker: 'Guide · Algorithms', title: 'LeetCode Easy & Classic Algorithms in Zig' },
];

export const HOME_CARD: OgCard = {
  pagePath: '',
  kicker: 'Interactive GitBook · Node.js → Zig',
  title: 'Learn Zig the way a Node.js developer thinks',
};

export const OG_CARDS: OgCard[] = [
  HOME_CARD,
  { pagePath: '/chapters', kicker: 'Curriculum', title: `All ${LESSON_COUNT} Chapters, from Variables to Production` },
  ...GUIDE_CARDS,
  ...Object.entries(chaptersData).map(([key, chapter]) => ({
    pagePath: `/chapter/${key}`,
    kicker: `Chapter ${chapter.num} · ${chapter.part.replace(/^Part \d+:\s*/, '')}`,
    title: chapter.title.replace(/`/g, ''),
  })),
];

/** '/chapter/basic_vars' -> 'chapter/basic_vars', '' -> 'index'. Used as the og/[...slug].png route param. */
export const ogSlugFor = (pagePath: string) => pagePath.replace(/^\//, '') || 'index';

export function ogImagePathFor(pagePath: string): string {
  const hasCard = OG_CARDS.some((card) => card.pagePath === pagePath);
  return hasCard ? `/og/${ogSlugFor(pagePath)}.png` : DEFAULT_OG_IMAGE_PATH;
}

const escapeXml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * SVG has no text layout, so lines are broken greedily on a character budget.
 * Example: wrapWords('Arrays, Slices & Memory Views', 20, 3) -> ['Arrays, Slices &', 'Memory Views']
 */
export function wrapWords(text: string, maxChars: number, maxLines: number): string[] {
  const lines: string[] = [];
  let current = '';
  for (const word of text.split(/\s+/)) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);

  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  kept[maxLines - 1] = `${kept[maxLines - 1].replace(/[\s,.;:&·-]+$/, '')}…`;
  return kept;
}

function titleLayout(title: string) {
  // Bold Plex Sans averages ~0.5em per glyph; the text column is ~1040px wide.
  const fontSize = title.length > 48 ? 60 : 72;
  const lines = wrapWords(title, Math.floor(1040 / (fontSize * 0.5)), 3);
  return { fontSize, lines, lineHeight: Math.round(fontSize * 1.15) };
}

export function renderOgSvg(card: OgCard): string {
  const { fontSize, lines, lineHeight } = titleLayout(card.title);
  const titleTop = 320 - ((lines.length - 1) * lineHeight) / 2;
  const titleTspans = lines
    .map((line, i) => `<tspan x="80" y="${titleTop + i * lineHeight}">${escapeXml(line)}</tspan>`)
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_IMAGE_WIDTH}" height="${OG_IMAGE_HEIGHT}" viewBox="0 0 ${OG_IMAGE_WIDTH} ${OG_IMAGE_HEIGHT}">
  <defs>
    <linearGradient id="glow" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${ZIG_AMBER}" stop-opacity="0.22"/>
      <stop offset="0.55" stop-color="${ZIG_AMBER}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="#0f172a"/>
  <rect width="100%" height="100%" fill="url(#glow)"/>
  <rect x="0" y="0" width="16" height="${OG_IMAGE_HEIGHT}" fill="${ZIG_AMBER}"/>

  <rect x="80" y="64" width="64" height="64" rx="14" fill="${ZIG_AMBER}"/>
  <text x="112" y="110" text-anchor="middle" font-family="IBM Plex Sans" font-weight="700" font-size="44" fill="#0f172a">Z</text>
  <text x="164" y="108" font-family="IBM Plex Sans" font-weight="700" font-size="34" fill="#f8fafc">Zig for Node.js Devs</text>

  <text x="80" y="${titleTop - lineHeight + 4}" font-family="IBM Plex Sans" font-weight="700" font-size="26" letter-spacing="1" fill="${ZIG_AMBER}">${escapeXml(wrapWords(card.kicker.toUpperCase(), 60, 1)[0])}</text>
  <text font-family="IBM Plex Sans" font-weight="700" font-size="${fontSize}" fill="#ffffff">${titleTspans}</text>

  <rect x="80" y="500" width="1040" height="2" fill="#1e293b"/>
  <text x="80" y="556" font-family="IBM Plex Sans" font-weight="400" font-size="28" fill="#cbd5e1">${escapeXml(OG_TAGLINE)}</text>
  <text x="1120" y="106" text-anchor="end" font-family="IBM Plex Sans" font-weight="400" font-size="24" fill="#94a3b8">zig-for-node-devs.vercel.app</text>
</svg>`;
}
