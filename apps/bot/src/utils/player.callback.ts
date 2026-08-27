import { Context } from "grammy";
import * as apiClient from "../api/api-client";
import { tryCatch } from "@teleplay/core/utils/try-catch";
import { searchResults } from "../commands/search.command";

const actions = {
  pause: async (ctx: Context, playerId: string) => {
    await apiClient.pause(playerId);
    await ctx.answerCallbackQuery({ text: "Paused" });
  },

  skip: async (ctx: Context, playerId: string) => {
    await apiClient.skip(playerId);
    await ctx.answerCallbackQuery({ text: "Skipped" });
  },

  stop: async (ctx: Context, playerId: string) => {
    await apiClient.stop(playerId);
    await ctx.answerCallbackQuery({ text: "Stopped" });
  },

  queue: async (ctx: Context, playerId: string) => {
    const [queue] = await Promise.all([
      apiClient.getQueue(playerId),
      apiClient.getState(playerId),
    ]);

    await ctx.answerCallbackQuery({
      text: `Queue has ${queue.length} items`,
    });
  },

  sp: async (ctx: Context, playerId: string) => {
    const callbackData = ctx.callbackQuery?.data;
    const parts = callbackData?.split(":");
    const index = parts?.[2] ? parseInt(parts[2], 10) : -1;

    const results = searchResults.get(playerId);

    if (!results || index < 0 || index >= results.length) {
      await ctx.answerCallbackQuery({
        text: "Search results expired or invalid selection",
      });
      return;
    }

    const video = results[index];
    const [error] = await tryCatch(
      apiClient.play(playerId, { query: video.videoId }),
    );

    if (error) {
      await ctx.answerCallbackQuery({ text: "Error playing song" });
      return;
    }

    searchResults.delete(playerId);
    await ctx.answerCallbackQuery({ text: `Playing: ${video.title}` });
    await ctx.editMessageText(`Playing: *${video.title}*`, {
      parse_mode: "Markdown",
    });
  },
} satisfies Record<string, (ctx: Context, playerId: string) => Promise<void>>;

export async function playCallback(ctx: Context) {
  const callbackData = ctx.callbackQuery?.data;

  if (!callbackData) return;

  const [action, playerId] = callbackData.split(":");

  if (!playerId) {
    await ctx.answerCallbackQuery({
      text: "Invalid callback data",
    });

    return;
  }

  const handler = actions[action as keyof typeof actions];

  if (!handler) {
    await ctx.answerCallbackQuery({
      text: "Unknown action",
    });

    return;
  }

  const [error] = await tryCatch(handler(ctx, playerId));

  if (error) {
    await ctx.answerCallbackQuery({
      text: "Error executing action",
    });
  }
}
