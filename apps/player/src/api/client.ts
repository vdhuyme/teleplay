import { createHttpClient } from '@teleplay/core';

export const http = createHttpClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000',
});
