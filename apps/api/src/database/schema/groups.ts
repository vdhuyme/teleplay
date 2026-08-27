import {
  mysqlTable,
  varchar,
  int,
  bigint,
  timestamp,
  mysqlEnum,
} from 'drizzle-orm/mysql-core';

export const groups = mysqlTable('groups', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }),
  status: mysqlEnum('status', ['idle', 'playing', 'paused', 'stopped'])
    .default('idle')
    .notNull(),
  videoId: varchar('video_id', { length: 32 }),
  title: varchar('title', { length: 500 }),
  thumbnail: varchar('thumbnail', { length: 1000 }),
  duration: int('duration', { unsigned: true }),
  position: int('position', { unsigned: true }).default(0).notNull(),
  volume: int('volume', { unsigned: true }).default(80).notNull(),
  requestedBy: varchar('requested_by', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});
