import { InlineKeyboard } from "grammy";
import { PLAYER_STATUS, PlayerState, QueueItem } from "../type";

export function formatNowPlaying(state: PlayerState | null) {
  if (!state || state.status === PLAYER_STATUS.IDLE || !state.videoId) {
    return "_Nothing is playing._";
  }

  const lines = [`*Now Playing*`, ``, `*${state.title || "Unknown"}*`];

  if (state.requestedBy) {
    lines.push(``, `Requested by _${state.requestedBy}_`);
  }

  return lines.join("\n");
}

export function formatNowPlayingKeyboard(playerId: string) {
  return new InlineKeyboard()
    .text("Pause", `pause:${playerId}`)
    .text("Skip", `skip:${playerId}`)
    .row()
    .text("Queue", `queue:${playerId}`)
    .text("Stop", `stop:${playerId}`);
}

export function formatQueue(state: PlayerState | null, queue: QueueItem[]) {
  const lines = [`*Queue*`];

  if (
    state &&
    (state.status === PLAYER_STATUS.PLAYING ||
      state.status === PLAYER_STATUS.PAUSED)
  ) {
    lines.push(``, `*Now Playing*`, `> ${state.title ?? "Unknown"}`);
  }

  if (queue.length > 0) {
    lines.push(``, `*Up Next*`);

    queue.forEach((item, index) => {
      const requestedBy = item.requestedBy ? ` _${item.requestedBy}_` : "";
      lines.push(`${index + 1}. ${item.title}${requestedBy}`);
    });
  } else if (
    !state ||
    state.status === PLAYER_STATUS.IDLE ||
    state.status === PLAYER_STATUS.STOPPED
  ) {
    lines.push(``, `_Queue is empty._`);
  }

  return lines.join("\n");
}

export function formatHelp() {
  return [
    `*Available Commands*`,
    ``,
    `*Playback*`,
    `  /play \\- Play a song`,
    `  /search \\- Search and select`,
    `  /pause \\- Pause playback`,
    `  /resume \\- Resume playback`,
    `  /skip \\- Skip to next song`,
    `  /stop \\- Stop playback`,
    ``,
    `*Queue*`,
    `  /queue \\- View the queue`,
    `  /clear \\- Clear the queue`,
    ``,
    `*Other*`,
    `  /now \\- View current song`,
    `  /volume \\- Set volume 0\\-100`,
    `  /help \\- Show this help`,
  ].join("\n");
}
