import { Context } from "grammy";
import * as apiClient from "../api/api-client";
import { tryCatch } from "@teleplay/core";

export async function clearCommand(ctx: Context) {
  const chatId = ctx.chat?.id;

  if (!chatId) {
    await ctx.reply("This command only works in groups.", {
      parse_mode: "Markdown",
    });
    return;
  }

  const [error] = await tryCatch(apiClient.clearQueue(String(chatId)));

  if (error) {
    await ctx.reply(`Error: ${error.message}`, { parse_mode: "Markdown" });
    return;
  }

  await ctx.reply("Queue cleared", { parse_mode: "Markdown" });
}
