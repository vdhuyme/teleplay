import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { App } from '@teleplay/core';
import * as schema from './schema';

const pool = mysql.createPool(App.getOrThrow('DATABASE_URL'));
export const db = drizzle(pool, { schema, mode: 'default' });
