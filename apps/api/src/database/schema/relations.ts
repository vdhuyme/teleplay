import { relations } from "drizzle-orm";
import { groups } from "./groups";
import { queueItems } from "./queue-items";
import { playHistory } from "./play-history";

export const groupsRelations = relations(groups, ({ many }) => ({
  queueItems: many(queueItems),
  playHistory: many(playHistory),
}));

export const queueItemsRelations = relations(queueItems, ({ one }) => ({
  group: one(groups, {
    fields: [queueItems.groupId],
    references: [groups.id],
  }),
}));

export const playHistoryRelations = relations(playHistory, ({ one }) => ({
  group: one(groups, {
    fields: [playHistory.groupId],
    references: [groups.id],
  }),
}));
