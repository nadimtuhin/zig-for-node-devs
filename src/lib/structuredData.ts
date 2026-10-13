export const SITE_ORIGIN = 'https://zig-for-node-devs.vercel.app';

export interface Breadcrumb { name: string; item: string }
export interface FaqEntry { question: string; answer: string }
export interface CodeSnippet { language: string; sample: string }
export interface ArticleMeta {
  datePublished?: string;
  dateModified?: string;
  author?: string;
  wordCount?: number;
  keywords?: string[];
}

export interface PageSchemaInput {
  title: string;
  description: string;
  canonicalUrl: string;
  imageUrl: string;
  breadcrumbs: Breadcrumb[];
  article?: ArticleMeta;
  faq?: FaqEntry[];
  codeSnippet?: CodeSnippet;
  isPart?: string;
  chapterNum?: number;
}

const AUTHOR = {
  '@type': 'Person',
  '@id': `${SITE_ORIGIN}/#author`,
  name: 'Nadim Tuhin',
  url: 'https://github.com/nadimtuhin',
  sameAs: 'https://github.com/nadimtuhin',
};

const COURSE_ID = `${SITE_ORIGIN}/#course`;
const EDUCATIONAL_LEVEL = 'Intermediate to Advanced Systems Engineering';
const TEACHES = [
  'Zig programming language',
  'Manual memory management',
  'comptime metaprogramming',
  'Systems architecture for JavaScript and Node.js developers',
];

// Answers are read by machines, so inline-code backticks from the lesson markdown are noise.
const toPlainText = (markdown: string) => markdown.replace(/`/g, '');

function authorFor(name?: string) {
  return !name || name === AUTHOR.name ? AUTHOR : { '@type': 'Person', name };
}

function buildArticle(input: PageSchemaInput) {
  const { article = {}, codeSnippet } = input;
  return {
    '@type': ['TechArticle', 'LearningResource'],
    '@id': `${input.canonicalUrl}#article`,
    headline: input.title,
    name: input.title,
    description: input.description,
    url: input.canonicalUrl,
    mainEntityOfPage: input.canonicalUrl,
    image: [input.imageUrl],
    inLanguage: 'en-US',
    author: authorFor(article.author),
    publisher: AUTHOR,
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    wordCount: article.wordCount,
    keywords: article.keywords?.join(', '),
    educationalLevel: EDUCATIONAL_LEVEL,
    teaches: TEACHES,
    learningResourceType: input.chapterNum ? 'Lesson' : 'Guide',
    articleSection: input.isPart,
    position: input.chapterNum,
    isPartOf: { '@id': COURSE_ID },
    hasPart: codeSnippet && {
      '@type': 'SoftwareSourceCode',
      programmingLanguage: codeSnippet.language,
      text: codeSnippet.sample,
    },
  };
}

function buildFaq(input: PageSchemaInput, faq: FaqEntry[]) {
  return {
    '@type': 'FAQPage',
    '@id': `${input.canonicalUrl}#faq`,
    mainEntity: faq.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: toPlainText(answer) },
    })),
  };
}

export function buildPageSchema(input: PageSchemaInput) {
  const graph: object[] = [
    {
      '@type': 'WebSite',
      '@id': `${SITE_ORIGIN}/#website`,
      url: SITE_ORIGIN,
      name: 'Zig for Node.js Developers Masterclass Studio',
      description: 'Interactive Zig systems learning platform and Rosetta Stone for Node.js and TypeScript developers.',
      inLanguage: 'en-US',
      publisher: AUTHOR,
    },
    {
      '@type': 'Course',
      '@id': COURSE_ID,
      name: 'Zig for Node.js & TypeScript Developers',
      description: 'Comprehensive transition guide from single-threaded V8 JavaScript to explicit memory management, comptime metaprogramming, and bare-metal systems programming in Zig.',
      url: SITE_ORIGIN,
      educationalLevel: EDUCATIONAL_LEVEL,
      teaches: TEACHES,
      inLanguage: 'en-US',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD', category: 'Free' },
      hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'Online', courseWorkload: 'PT40H' },
      author: AUTHOR,
      provider: AUTHOR,
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${input.canonicalUrl}#breadcrumbs`,
      itemListElement: input.breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.item,
      })),
    },
  ];

  if (input.article) graph.push(buildArticle(input));
  if (input.faq?.length) graph.push(buildFaq(input, input.faq));

  return { '@context': 'https://schema.org', '@graph': graph };
}

// JSON.stringify drops undefined fields; escaping "<" keeps code samples from closing the <script> tag.
export function serializeJsonLd(schema: object): string {
  return JSON.stringify(schema).replace(/</g, '\\u003c');
}
