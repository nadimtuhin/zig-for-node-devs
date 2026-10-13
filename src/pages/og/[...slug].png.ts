import type { APIRoute, GetStaticPaths } from 'astro';
import { OG_CARDS, ogSlugFor, type OgCard } from '../../lib/ogCards';
import { ogPngResponse } from '../../lib/renderOgPng';

export const getStaticPaths: GetStaticPaths = () =>
  OG_CARDS.map((card) => ({ params: { slug: ogSlugFor(card.pagePath) }, props: { card } }));

export const GET: APIRoute = ({ props }) => ogPngResponse((props as { card: OgCard }).card);
