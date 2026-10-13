import type { APIRoute } from 'astro';
import { HOME_CARD } from '../lib/ogCards';
import { ogPngResponse } from '../lib/renderOgPng';

export const GET: APIRoute = () => ogPngResponse(HOME_CARD);
