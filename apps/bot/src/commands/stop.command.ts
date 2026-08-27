import { Context } from "grammy";
import * as apiClient from "../api/api-client";
import { tryCatch } from "@teleplay/core";

export async function stopCommand(ctx: Context) {
  const chatId = ctx.chat?.id;

  if (!chatId) {
    await ctx.reply("This command only works in groups.");
    return;
  }

  const [error] = await tryCatch(apiClient.stop(String(chatId)));

  if (error) {
    await ctx.reply(`Error: ${error.message}`);
    return;
  }

  await ctx.reply("Stopped");
}
