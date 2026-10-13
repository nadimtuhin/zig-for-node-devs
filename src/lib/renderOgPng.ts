import { Resvg } from '@resvg/resvg-js';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderOgSvg, type OgCard } from './ogCards';

// Bundled so the build renders identically on machines without IBM Plex installed (e.g. Vercel).
// Resolved from the project root because Astro relocates this module into a build chunk.
const FONT_FILES = ['IBMPlexSans-Bold.ttf', 'IBMPlexSans-Regular.ttf'].map((file) =>
  resolve('src/assets/fonts', file),
);
// resvg silently skips unreadable font files, which would ship text-less cards.
for (const file of FONT_FILES) {
  if (!existsSync(file)) throw new Error(`OG card font missing: ${file}`);
}

export function ogPngResponse(card: OgCard): Response {
  const png = new Resvg(renderOgSvg(card), {
    font: { fontFiles: FONT_FILES, loadSystemFonts: false, defaultFontFamily: 'IBM Plex Sans' },
  })
    .render()
    .asPng();
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
}
