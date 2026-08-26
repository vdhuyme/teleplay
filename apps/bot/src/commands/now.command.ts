import { Context } from "grammy";
import * as apiClient from "../api/api-client";
import {
  formatNowPlaying,
  formatNowPlayingKeyboard,
} from "../utils/player.formatter";
import { tryCatch } from "../utils/try-catch";

export async function nowCommand(ctx: Context) {
  const chatId = ctx.chat?.id;

  if (!chatId) {
    await ctx.reply("This command only works in groups.");
    return;
  }

  const playerId = String(chatId);

  const [error, state] = await tryCatch(apiClient.getState(playerId));

  if (error) {
    await ctx.reply(`Error: ${error.message}`);
    return;
  }

  const text = formatNowPlaying(state);
  const keyboard = formatNowPlayingKeyboard(playerId);

  await ctx.reply(text, {
    reply_markup: keyboard,
  });
}
