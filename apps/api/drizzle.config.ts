import { App } from '@teleplay/core';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/database/schema/*',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: { url: App.getOrThrow('DATABASE_URL') },
});
