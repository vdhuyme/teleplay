import { db, queueItems, playHistory, groups } from '../database/index';
import { eq, desc, asc, count } from 'drizzle-orm';
import { GroupNotFoundError } from './errors';
import { Paginated } from '../constants';

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

export async function list(
  page = 1,
  limit = 10,
): Promise<Paginated<typeof groups.$inferSelect>> {
  const offset = (page - 1) * limit;

  const [items, countResult] = await Promise.all([
    db.query.groups.findMany({
      with: {
        queueItems: true,
        playHistory: {
          orderBy: [desc(playHistory.playedAt)],
          limit: 1,
        },
      },
      limit,
      offset,
    }),
    db.select({ count: count() }).from(groups),
  ]);

  return {
    items,
    total: countResult[0].count,
    page,
    limit,
  };
}

export async function queue(groupId: number) {
  return db
    .select()
    .from(queueItems)
    .where(eq(queueItems.groupId, groupId))
    .orderBy(desc(queueItems.votes), asc(queueItems.id));
}

export async function history(
  groupId: number,
  page = 1,
  limit = 20,
): Promise<Paginated<typeof playHistory.$inferSelect>> {
  const offset = (page - 1) * limit;

  const [items, countResult] = await Promise.all([
    db
      .select()
      .from(playHistory)
      .where(eq(playHistory.groupId, groupId))
      .orderBy(desc(playHistory.playedAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(playHistory)
      .where(eq(playHistory.groupId, groupId)),
  ]);

  return {
    items,
    total: countResult[0].count,
    page,
    limit,
  };
}

export async function remove(groupId: number): Promise<void> {
  await db.delete(groups).where(eq(groups.id, groupId));
}
