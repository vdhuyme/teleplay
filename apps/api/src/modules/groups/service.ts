import { db, queueItems, playHistory, groups } from "../../database/index";
import { eq, desc, asc } from "drizzle-orm";
import { GroupNotFoundError } from "./error";

export async function get(groupId: number) {
  const result = await db.query.groups.findFirst({
    where: eq(groups.id, groupId),
    with: {
      queueItems: true,
      playHistory: {
        orderBy: [desc(playHistory.playedAt)],
        limit: 1,
      },
    },
  });

  if (!result) {
    throw new GroupNotFoundError(groupId);
  }

  return result;
}

export async function list() {
  return await db.query.groups.findMany({
    with: {
      queueItems: true,
      playHistory: {
        orderBy: [desc(playHistory.playedAt)],
        limit: 1,
      },
    },
  });
}

export async function queue(groupId: number) {
  return db
    .select()
    .from(queueItems)
    .where(eq(queueItems.groupId, groupId))
    .orderBy(desc(queueItems.votes), asc(queueItems.id));
}

export async function history(groupId: number, limit = 20) {
  return db
    .select()
    .from(playHistory)
    .where(eq(playHistory.groupId, groupId))
    .orderBy(desc(playHistory.playedAt))
    .limit(limit);
}

export async function remove(groupId: number): Promise<void> {
  await db.delete(groups).where(eq(groups.id, groupId));
}
