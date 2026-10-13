import type { APIRoute } from 'astro';
import { chaptersData } from '../data/chapters';
import { renderListItems, renderParagraphs } from '../lib/inlineMarkdown';

// The in-browser lesson viewer switches chapters without a page load, so it needs the same
// pre-rendered HTML that LessonDetail.astro produces on the server.
export const GET: APIRoute = () => {
  const clientChapters = Object.fromEntries(
    Object.entries(chaptersData).map(([key, chapter]) => [
      key,
      {
        ...chapter,
        whyHtml: renderParagraphs(chapter.why),
        walkthroughHtml: renderListItems(chapter.walkthrough),
      },
    ]),
  );

  return new Response(`window.chaptersData = ${JSON.stringify(clientChapters, null, 2)};\n`, {
    headers: { 'Content-Type': 'text/javascript; charset=utf-8' },
  });
};
