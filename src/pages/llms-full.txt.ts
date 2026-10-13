import type { APIRoute } from 'astro';
import { chaptersData } from '../data/chapters';

const SITE = 'https://zig-for-node-devs.vercel.app';

function renderChapter(key: string): string {
  const chapter = chaptersData[key];
  return `### ${chapter.num}. ${chapter.title}

URL: ${SITE}/chapter/${key}

${chapter.desc}

Node.js / TypeScript:

\`\`\`ts
${chapter.nodeCode}
\`\`\`

Zig:

\`\`\`zig
${chapter.code}
\`\`\`

Why it differs: ${chapter.why}
`;
}

export const GET: APIRoute = () => {
  const sections: string[] = [];
  let currentPart = '';
  for (const key of Object.keys(chaptersData)) {
    const { part } = chaptersData[key];
    if (part !== currentPart) {
      currentPart = part;
      sections.push(`## ${part}\n`);
    }
    sections.push(renderChapter(key));
  }

  const body = `# Zig for Node.js Devs: full lesson text

> All ${Object.keys(chaptersData).length} lessons of the Zig for Node.js Devs book, each with a JS/TS snippet, the equivalent Zig program, and the mental-model difference. Index: ${SITE}/llms.txt

${sections.join('\n')}`;

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
