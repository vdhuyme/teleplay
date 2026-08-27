import {
  mysqlTable,
  varchar,
  int,
  bigint,
  timestamp,
  index,
} from "drizzle-orm/mysql-core";

export const queueItems = mysqlTable(
  "queue_items",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    groupId: bigint("group_id", { mode: "number" }).notNull(),
    videoId: varchar("video_id", { length: 32 }).notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    thumbnail: varchar("thumbnail", { length: 1000 }),
    duration: int("duration", { unsigned: true }),
    votes: bigint("votes", { mode: "number", unsigned: true })
      .default(1)
      .notNull(),
    requestedBy: varchar("requested_by", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("group_votes_idx").on(table.groupId, table.votes)],
);

