import { db, queueItems, playHistory, groups } from '../database/index';
import { eq, and, asc, desc, sql } from 'drizzle-orm';
import { Youtube } from '@teleplay/youtube';
import { NoVideoFoundError } from './error';
import { sio } from '..';
import { isNil } from '@teleplay/core';
import { SOCKET_EVENTS } from '../realtime/event';
import { App } from '@teleplay/core';
import { PLAYER_STATUS } from '../groups';

const youtubeClient = new Youtube(App.getOrThrow('YOUTUBE_API_KEY'));
export const search = (query: string) => youtubeClient.search(query);
export const getTrending = () => youtubeClient.trending();
export const getCategories = () => youtubeClient.categories();

export async function getState(groupId: number) {
  return db.query.groups.findFirst({
    where: eq(groups.id, groupId),
  });
}

export async function play(
  groupId: number,
  query: string,
  requestedBy?: string,
  groupName?: string,
) {
  const results = await search(query);
  const video = results[0];
  if (!video) {
    throw new NoVideoFoundError(query);
  }

  const state = await getState(groupId);

  if (
    isNil(state) ||
    state.status === PLAYER_STATUS.IDLE ||
    state.status === PLAYER_STATUS.STOPPED
  ) {
    await db
      .insert(groups)
      .values({
        id: groupId,
        status: PLAYER_STATUS.PLAYING,
        videoId: video.videoId,
        title: video.title,
        thumbnail: video.thumbnail,
        duration: video.duration,
        requestedBy: requestedBy ?? null,
        name: groupName ?? null,
      })
      .onDuplicateKeyUpdate({
        set: {
          status: PLAYER_STATUS.PLAYING,
          videoId: video.videoId,
          title: video.title,
          thumbnail: video.thumbnail,
          duration: video.duration,
          requestedBy: requestedBy ?? null,
          name: groupName ?? null,
        },
      });

    sio.broadcastToRoom(String(groupId), SOCKET_EVENTS.PLAY, {
      type: SOCKET_EVENTS.PLAY,
      videoId: video.videoId,
      title: video.title,
      thumbnail: video.thumbnail,
      duration: video.duration,
      requestedBy: requestedBy ?? null,
    });

    sio.broadcast(SOCKET_EVENTS.GROUPS_UPDATED, { groupId });

    return video;
  }

  const existing = await db
    .select({ id: queueItems.id })
    .from(queueItems)
    .where(
      and(
        eq(queueItems.groupId, groupId),
        eq(queueItems.videoId, video.videoId),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(queueItems)
      .set({ votes: sql`${queueItems.votes} + 1` })
      .where(eq(queueItems.id, existing[0].id));
  } else {
    await db.insert(queueItems).values({
      groupId,
      videoId: video.videoId,
      title: video.title,
      thumbnail: video.thumbnail,
      duration: video.duration,
      requestedBy: requestedBy ?? null,
      votes: 1,
    });
  }

  sio.broadcastToRoom(String(groupId), SOCKET_EVENTS.QUEUE_UPDATED, {
    type: SOCKET_EVENTS.QUEUE_UPDATED,
  });

  return video;
}

export async function pause(groupId: number) {
  await db
    .insert(groups)
    .values({ id: groupId, status: PLAYER_STATUS.PAUSED })
    .onDuplicateKeyUpdate({ set: { status: PLAYER_STATUS.PAUSED } });

  sio.broadcastToRoom(String(groupId), SOCKET_EVENTS.PAUSE, {
    type: SOCKET_EVENTS.PAUSE,
  });
}

export async function resume(groupId: number) {
  await db
    .insert(groups)
    .values({ id: groupId, status: PLAYER_STATUS.PLAYING })
    .onDuplicateKeyUpdate({ set: { status: PLAYER_STATUS.PLAYING } });

  sio.broadcastToRoom(String(groupId), SOCKET_EVENTS.RESUME, {
    type: SOCKET_EVENTS.RESUME,
  });
}

export async function stop(groupId: number) {
  await db
    .insert(groups)
    .values({ id: groupId, status: PLAYER_STATUS.STOPPED })
    .onDuplicateKeyUpdate({ set: { status: PLAYER_STATUS.STOPPED } });

  sio.broadcastToRoom(String(groupId), SOCKET_EVENTS.STOP, {
    type: SOCKET_EVENTS.STOP,
  });
}

export async function skip(groupId: number) {
  const state = await getState(groupId);

  if (
    state?.videoId &&
    (state.status === PLAYER_STATUS.PLAYING ||
      state.status === PLAYER_STATUS.PAUSED)
  ) {
    await db.insert(playHistory).values({
      groupId,
      videoId: state.videoId,
      title: state.title || 'Unknown',
      requestedBy: state.requestedBy,
    });
  }

  const nextItem = await db
    .select()
    .from(queueItems)
    .where(eq(queueItems.groupId, groupId))
    .orderBy(desc(queueItems.votes), asc(queueItems.id))
    .limit(1);

  if (nextItem.length === 0) {
    await db
      .insert(groups)
      .values({ id: groupId, status: PLAYER_STATUS.IDLE })
      .onDuplicateKeyUpdate({ set: { status: PLAYER_STATUS.IDLE } });

    sio.broadcastToRoom(String(groupId), SOCKET_EVENTS.STOP, {
      type: SOCKET_EVENTS.STOP,
    });

    return;
  }

  const next = nextItem[0];
  await db
    .insert(groups)
    .values({
      id: groupId,
      status: PLAYER_STATUS.PLAYING,
      videoId: next.videoId,
      title: next.title,
      thumbnail: next.thumbnail,
      duration: next.duration,
      requestedBy: next.requestedBy,
    })
    .onDuplicateKeyUpdate({
      set: {
        status: PLAYER_STATUS.PLAYING,
        videoId: next.videoId,
        title: next.title,
        thumbnail: next.thumbnail,
        duration: next.duration,
        requestedBy: next.requestedBy,
      },
    });

  await db.delete(queueItems).where(eq(queueItems.id, next.id));

  sio.broadcastToRoom(String(groupId), SOCKET_EVENTS.PLAY, {
    type: SOCKET_EVENTS.PLAY,
    videoId: next.videoId,
    title: next.title,
    thumbnail: next.thumbnail,
    duration: next.duration,
    requestedBy: next.requestedBy,
  });
}

export async function videoEnded(groupId: number) {
  const state = await getState(groupId);

  if (state?.videoId) {
    await db.insert(playHistory).values({
      groupId,
      videoId: state.videoId,
      title: state.title ?? 'Unknown',
      requestedBy: state.requestedBy,
    });
  }

  const nextItem = await db
    .select()
    .from(queueItems)
    .where(eq(queueItems.groupId, groupId))
    .orderBy(desc(queueItems.votes), asc(queueItems.id))
    .limit(1);

  if (nextItem.length === 0) {
    await db
      .insert(groups)
      .values({ id: groupId, status: PLAYER_STATUS.IDLE })
      .onDuplicateKeyUpdate({ set: { status: PLAYER_STATUS.IDLE } });

    sio.broadcastToRoom(String(groupId), SOCKET_EVENTS.STOP, {
      type: SOCKET_EVENTS.STOP,
    });

    return;
  }

  const next = nextItem[0];
  await db
    .insert(groups)
    .values({
      id: groupId,
      status: PLAYER_STATUS.PLAYING,
      videoId: next.videoId,
      title: next.title,
      thumbnail: next.thumbnail,
      duration: next.duration,
      requestedBy: next.requestedBy,
    })
    .onDuplicateKeyUpdate({
      set: {
        status: PLAYER_STATUS.PLAYING,
        videoId: next.videoId,
        title: next.title,
        thumbnail: next.thumbnail,
        duration: next.duration,
        requestedBy: next.requestedBy,
      },
    });

  await db.delete(queueItems).where(eq(queueItems.id, next.id));

  sio.broadcastToRoom(String(groupId), SOCKET_EVENTS.PLAY, {
    type: SOCKET_EVENTS.PLAY,
    videoId: next.videoId,
    title: next.title,
    thumbnail: next.thumbnail,
    duration: next.duration,
    requestedBy: next.requestedBy,
  });
}

export async function playFromQueue(groupId: number, itemId: number) {
  const items = await db
    .select()
    .from(queueItems)
    .where(and(eq(queueItems.id, itemId), eq(queueItems.groupId, groupId)))
    .limit(1);

  if (items.length === 0) return;

  const item = items[0];

  const state = await getState(groupId);
  if (state?.videoId && state.status !== PLAYER_STATUS.IDLE) {
    await db.insert(playHistory).values({
      groupId,
      videoId: state.videoId,
      title: state.title ?? 'Unknown',
      requestedBy: state.requestedBy,
    });
  }

  await db
    .insert(groups)
    .values({
      id: groupId,
      status: PLAYER_STATUS.PLAYING,
      videoId: item.videoId,
      title: item.title,
      thumbnail: item.thumbnail,
      duration: item.duration,
      requestedBy: item.requestedBy,
    })
    .onDuplicateKeyUpdate({
      set: {
        status: PLAYER_STATUS.PLAYING,
        videoId: item.videoId,
        title: item.title,
        thumbnail: item.thumbnail,
        duration: item.duration,
        requestedBy: item.requestedBy,
      },
    });

  await db.delete(queueItems).where(eq(queueItems.id, itemId));

  sio.broadcastToRoom(String(groupId), SOCKET_EVENTS.PLAY, {
    type: SOCKET_EVENTS.PLAY,
    videoId: item.videoId,
    title: item.title,
    thumbnail: item.thumbnail,
    duration: item.duration,
    requestedBy: item.requestedBy,
  });
}

export async function setVolume(groupId: number, volume: number) {
  await db
    .insert(groups)
    .values({ id: groupId, volume })
    .onDuplicateKeyUpdate({ set: { volume } });

  sio.broadcastToRoom(String(groupId), SOCKET_EVENTS.VOLUME, {
    type: SOCKET_EVENTS.VOLUME,
    volume,
  });
}

export async function getQueue(groupId: number) {
  return db
    .select()
    .from(queueItems)
    .where(eq(queueItems.groupId, groupId))
    .orderBy(desc(queueItems.votes), asc(queueItems.id));
}

export async function addToQueue(
  groupId: number,
  query: string,
  requestedBy?: string,
  groupName?: string,
) {
  const results = await search(query);
  const video = results[0];
  if (!video) {
    throw new NoVideoFoundError(query);
  }

  await db.insert(queueItems).values({
    groupId,
    videoId: video.videoId,
    title: video.title,
    thumbnail: video.thumbnail,
    duration: video.duration,
    requestedBy: requestedBy ?? null,
    votes: 1,
  });

  await db
    .insert(groups)
    .values({ id: groupId, name: groupName ?? null })
    .onDuplicateKeyUpdate({ set: { name: groupName ?? null } });

  sio.broadcastToRoom(String(groupId), SOCKET_EVENTS.QUEUE_UPDATED, {
    type: SOCKET_EVENTS.QUEUE_UPDATED,
  });

  return video;
}

export async function removeFromQueue(groupId: number, itemId: number) {
  await db
    .delete(queueItems)
    .where(and(eq(queueItems.id, itemId), eq(queueItems.groupId, groupId)));

  sio.broadcastToRoom(String(groupId), SOCKET_EVENTS.QUEUE_UPDATED, {
    type: SOCKET_EVENTS.QUEUE_UPDATED,
  });
}

export async function clearQueue(groupId: number) {
  await db.delete(queueItems).where(eq(queueItems.groupId, groupId));

  sio.broadcastToRoom(String(groupId), SOCKET_EVENTS.QUEUE_UPDATED, {
    type: SOCKET_EVENTS.QUEUE_UPDATED,
  });
}
