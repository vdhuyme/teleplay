import { Context } from "grammy";
import * as apiClient from "../api/api-client";
import { tryCatch } from "../utils/try-catch";

export async function volumeCommand(ctx: Context) {
  const messageText = ctx.message?.text;
  if (!messageText) return;

  const volumeStr = messageText.replace("/volume", "").trim();

  if (!volumeStr) {
    await ctx.reply("Please provide a volume level. Example: /volume 80");
    return;
  }

  const volume = Number(volumeStr);

  if (!Number.isInteger(volume) || volume < 0 || volume > 100) {
    await ctx.reply("Volume must be a number between 0 and 100.");
    return;
  }

  const chatId = ctx.chat?.id;

  if (!chatId) {
    await ctx.reply("This command only works in groups.");
    return;
  }

  const [error] = await tryCatch(
    apiClient.setVolume(String(chatId), { volume }),
  );

  if (error) {
    await ctx.reply(`Error: ${error.message}`);
    return;
  }

  await ctx.reply(`Volume set to ${volume}`);
}
