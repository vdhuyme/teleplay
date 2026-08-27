import { Context } from "grammy";
import * as apiClient from "../api/api-client";
import { formatQueue } from "../utils/player.formatter";
import { tryCatch } from "@teleplay/core";

export async function queueCommand(ctx: Context) {
  const chatId = ctx.chat?.id;

  if (!chatId) {
    await ctx.reply("This command only works in groups.", {
      parse_mode: "Markdown",
    });
    return;
  }

  const playerId = String(chatId);

  const [error, result] = await tryCatch(
    Promise.all([apiClient.getState(playerId), apiClient.getQueue(playerId)]),
  );

  if (error) {
    await ctx.reply(`Error: ${error.message}`, { parse_mode: "Markdown" });
    return;
  }

  const [state, queue] = result;

  await ctx.reply(formatQueue(state, queue), { parse_mode: "Markdown" });
}
