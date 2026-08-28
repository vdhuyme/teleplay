import { httpClient } from '@teleplay/core';

export const http = httpClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000',
});
