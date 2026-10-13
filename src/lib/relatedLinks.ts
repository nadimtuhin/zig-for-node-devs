import { escapeHtml } from '../utils/highlight';
import type { RelatedLink, RelatedLinks } from '../data/topicClusters';

function renderGroup(title: string, links: RelatedLink[]): string {
  if (links.length === 0) return '';
  const items = links
    .map(({ href, label }) => `<li><a href="${escapeHtml(href)}">${escapeHtml(label)}</a></li>`)
    .join('');
  return `<div class="related-links-group"><h3 class="related-links-group-title">${title}</h3><ul class="related-links-list">${items}</ul></div>`;
}

/** Shared by the server render and the in-browser chapter switcher, so both emit identical anchors. */
export function renderRelatedLinks({ guides, chapters }: RelatedLinks): string {
  return renderGroup('Architecture guides', guides) + renderGroup('Related lessons', chapters);
}
