import type { APIRoute } from 'astro';
import { chapterInsights } from '../data/chapterInsights';
import { renderInlineCode } from '../lib/inlineMarkdown';

// Generated from chapterInsights.ts so the client copy can never drift from the source,
// with inline `code` pre-rendered to match LessonDetail.astro.
export const GET: APIRoute = () => {
  const clientInsights = Object.fromEntries(
    Object.entries(chapterInsights).map(([key, insight]) => [
      key,
      {
        mentalModelHtml: renderInlineCode(insight.mentalModel),
        footgunHtml: renderInlineCode(insight.footgun),
      },
    ]),
  );

  return new Response(`window.chapterInsights = ${JSON.stringify(clientInsights, null, 2)};\n`, {
    headers: { 'Content-Type': 'text/javascript; charset=utf-8' },
  });
};
