import { Context, InlineKeyboard } from "grammy";
import { SearchResult } from "../type";
import { tryCatch } from "@teleplay/core";
import { Youtube } from "@teleplay/youtube";
import { isNil } from "@teleplay/core";

const ytb = new Youtube();
export const searchResults = new Map<string, SearchResult[]>();

export async function searchCommand(ctx: Context) {
  const messageText = ctx.message?.text;
  if (!messageText) return;

  const query = messageText.replace("/search", "").trim();

  if (!query) {
    await ctx.reply(
      "Please provide a search query. Example: /search Em của ngày hôm qua",
    );

    return;
  }

  const chatId = ctx.chat?.id;

  if (isNil(chatId)) {
    await ctx.reply("This command only works in groups.");

    return;
  }

  const playerId = String(chatId);
  const requestedBy =
    [ctx.from?.first_name, ctx.from?.last_name].filter(Boolean).join(" ") ||
    ctx.from?.username;

  await ctx.reply("Searching...");

  const [error, results] = await tryCatch(ytb.search(query));
  if (error) {
    await ctx.reply(`Error: ${error.message}`);

    return;
  }

  if (!results.length) {
    await ctx.reply("No results found.");

    return;
  }

  searchResults.set(
    playerId,
    results.map((video) => ({
      ...video,
      requestedBy,
    })),
  );

  const keyboard = new InlineKeyboard();

  results.forEach((video, index) => {
    const title =
      video.title.length > 40
        ? `${video.title.substring(0, 37)}...`
        : video.title;

    keyboard.text(`${index + 1}. ${title}`, `sp:${playerId}:${index}`).row();
  });

  await ctx.reply("Select a song to play:", {
    reply_markup: keyboard,
  });
}
