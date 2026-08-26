import {
  mysqlTable,
  varchar,
  timestamp,
  index,
  bigint,
} from "drizzle-orm/mysql-core";

export const playHistory = mysqlTable(
  "play_history",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    groupId: bigint("group_id", { mode: "number" }).notNull(),
    videoId: varchar("video_id", { length: 32 }).notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    requestedBy: varchar("requested_by", { length: 255 }),
    playedAt: timestamp("played_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("group_played_at_idx").on(table.groupId, table.playedAt)],
);
