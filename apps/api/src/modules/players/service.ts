import { db, queueItems, playHistory, groups } from "../../database/index";
import { eq, and, asc, desc } from "drizzle-orm";
import { Youtube } from "@teleplay/youtube";
import { NoVideoFoundError } from "./error";
import { PLAYER_STATUS } from "../groups";
import { sio } from "../..";
import { isNil } from "../../utils/ts-utils";
import { SOCKET_EVENTS } from "./constants";

const ytb = new Youtube();

async function getMaxPosition(groupId: number): Promise<number> {
  const result = await db
    .select({ position: queueItems.position })
    .from(queueItems)
    .where(eq(queueItems.groupId, groupId))
    .orderBy(desc(queueItems.position))
    .limit(1);

  return result[0]?.position ?? 0;
}

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
  const results = await ytb.search(query);
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
        position: 0,
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
          position: 0,
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
      position: 0,
      requestedBy: requestedBy ?? null,
    });

    return video;
  }

  const maxPosition = await getMaxPosition(groupId);
  await db.insert(queueItems).values({
    groupId,
    videoId: video.videoId,
    title: video.title,
    thumbnail: video.thumbnail,
    duration: video.duration,
    position: maxPosition + 1,
    requestedBy: requestedBy ?? null,
  });

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

  sio.broadcastToRoom(String(groupId), SOCKET_EVENTS.PAUSE, { type: SOCKET_EVENTS.PAUSE });
}

export async function resume(groupId: number) {
  await db
    .insert(groups)
    .values({ id: groupId, status: PLAYER_STATUS.PLAYING })
    .onDuplicateKeyUpdate({ set: { status: PLAYER_STATUS.PLAYING } });

  sio.broadcastToRoom(String(groupId), SOCKET_EVENTS.RESUME, { type: SOCKET_EVENTS.RESUME });
}

export async function stop(groupId: number) {
  await db
    .insert(groups)
    .values({ id: groupId, status: PLAYER_STATUS.STOPPED })
    .onDuplicateKeyUpdate({ set: { status: PLAYER_STATUS.STOPPED } });

  sio.broadcastToRoom(String(groupId), SOCKET_EVENTS.STOP, { type: SOCKET_EVENTS.STOP });
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
      title: state.title || "Unknown",
      requestedBy: state.requestedBy,
    });
  }

  const currentItem = await db
    .select()
    .from(queueItems)
    .where(and(eq(queueItems.groupId, groupId), eq(queueItems.position, 0)))
    .limit(1);

  if (currentItem.length > 0) {
    await db.delete(queueItems).where(eq(queueItems.id, currentItem[0].id));
  }

  const nextItem = await db
    .select()
    .from(queueItems)
    .where(eq(queueItems.groupId, groupId))
    .orderBy(asc(queueItems.position))
    .limit(1);

  if (nextItem.length === 0) {
    await db
      .insert(groups)
      .values({ id: groupId, status: PLAYER_STATUS.IDLE })
      .onDuplicateKeyUpdate({ set: { status: PLAYER_STATUS.IDLE } });

    sio.broadcastToRoom(String(groupId), SOCKET_EVENTS.STOP, { type: SOCKET_EVENTS.STOP });

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
      position: 0,
      requestedBy: next.requestedBy,
    })
    .onDuplicateKeyUpdate({
      set: {
        status: PLAYER_STATUS.PLAYING,
        videoId: next.videoId,
        title: next.title,
        thumbnail: next.thumbnail,
        duration: next.duration,
        position: 0,
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
    position: 0,
    requestedBy: next.requestedBy,
  });
}

export async function videoEnded(groupId: number) {
  const state = await getState(groupId);

  if (state?.videoId) {
    await db.insert(playHistory).values({
      groupId,
      videoId: state.videoId,
      title: state.title ?? "Unknown",
      requestedBy: state.requestedBy,
    });
  }

  const nextItem = await db
    .select()
    .from(queueItems)
    .where(eq(queueItems.groupId, groupId))
    .orderBy(asc(queueItems.position))
    .limit(1);

  if (nextItem.length === 0) {
    await db
      .insert(groups)
      .values({ id: groupId, status: PLAYER_STATUS.IDLE })
      .onDuplicateKeyUpdate({ set: { status: PLAYER_STATUS.IDLE } });

    sio.broadcastToRoom(String(groupId), SOCKET_EVENTS.STOP, { type: SOCKET_EVENTS.STOP });

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
      position: 0,
      requestedBy: next.requestedBy,
    })
    .onDuplicateKeyUpdate({
      set: {
        status: PLAYER_STATUS.PLAYING,
        videoId: next.videoId,
        title: next.title,
        thumbnail: next.thumbnail,
        duration: next.duration,
        position: 0,
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
    position: 0,
    requestedBy: next.requestedBy,
  });
}

export async function setVolume(groupId: number, volume: number) {
  await db
    .insert(groups)
    .values({ id: groupId, volume })
    .onDuplicateKeyUpdate({ set: { volume } });

  sio.broadcastToRoom(String(groupId), SOCKET_EVENTS.VOLUME, { type: SOCKET_EVENTS.VOLUME, volume });
}

export async function getQueue(groupId: number) {
  return db
    .select()
    .from(queueItems)
    .where(eq(queueItems.groupId, groupId))
    .orderBy(asc(queueItems.position));
}

export async function addToQueue(
  groupId: number,
  query: string,
  requestedBy?: string,
  groupName?: string,
) {
  const results = await ytb.search(query);
  const video = results[0];
  if (!video) {
    throw new NoVideoFoundError(query);
  }

  const maxPosition = await getMaxPosition(groupId);
  await db.insert(queueItems).values({
    groupId,
    videoId: video.videoId,
    title: video.title,
    thumbnail: video.thumbnail,
    duration: video.duration,
    position: maxPosition + 1,
    requestedBy: requestedBy ?? null,
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
