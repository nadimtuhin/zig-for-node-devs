import { escapeHtml } from '../utils/highlight';

const INLINE_CODE = /`([^`]+)`/g;

/** "Use `[]const u8` here" -> "Use []const u8 here", for meta tags and search snippets. */
export function stripInlineMarkdown(text: string): string {
  return text.replace(INLINE_CODE, '$1').replace(/\s+/g, ' ').trim();
}

/** "Use `[]const u8` here" -> "Use <code>[]const u8</code> here", with all other text HTML-escaped. */
export function renderInlineCode(text: string): string {
  return escapeHtml(text).replace(INLINE_CODE, '<code>$1</code>');
}

/** Blank-line separated paragraphs -> <p> elements with inline code rendered. */
export function renderParagraphs(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${renderInlineCode(paragraph.trim())}</p>`)
    .join('');
}

/** Walkthrough steps -> <li> elements with inline code rendered. */
export function renderListItems(items: string[]): string {
  return items.map((item) => `<li>${renderInlineCode(item)}</li>`).join('');
}
