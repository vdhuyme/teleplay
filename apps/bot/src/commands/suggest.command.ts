import { Context, InlineKeyboard } from "grammy";
import * as apiClient from "../api/api-client";
import { tryCatch, isNil } from "@teleplay/core";
import { SearchResult } from "../type";

export const suggestResults = new Map<string, SearchResult[]>();

function getPlayerId(ctx: Context): string | null {
  const chatId = ctx.chat?.id;
  if (isNil(chatId)) return null;
  return String(chatId);
}

function getRequestedBy(ctx: Context): string {
  return (
    [ctx.from?.first_name, ctx.from?.last_name].filter(Boolean).join(" ") ||
    ctx.from?.username ||
    "Unknown"
  );
}

function buildResultsKeyboard(
  playerId: string,
  results: SearchResult[],
): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  results.forEach((video, index) => {
    const title =
      video.title.length > 40
        ? `${video.title.substring(0, 37)}...`
        : video.title;

    keyboard.text(`${index + 1}. ${title}`, `sgp:${playerId}:${index}`).row();
  });

  keyboard.text("Back", `sgback:${playerId}`).row();

  return keyboard;
}

function buildMainKeyboard(): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  keyboard
    .text("By Genre", "sg:genre")
    .text("Trending", "sg:trending")
    .row()
    .text("History", "sg:history");

  return keyboard;
}

function buildCategoriesKeyboard(
  categories: { id: string; title: string }[],
): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  categories.forEach((category) => {
    keyboard.text(category.title, `sgc:${category.id}`).row();
  });

  keyboard.text("Back", "sgmain");

  return keyboard;
}

async function searchAndShow(
  ctx: Context,
  playerId: string,
  query: string,
  requestedBy: string,
) {
  const [error, results] = await tryCatch(apiClient.search(playerId, query));

  if (error) {
    await ctx.editMessageText("Search error.", {
      parse_mode: "Markdown",
    });
    return;
  }

  if (!results.length) {
    await ctx.editMessageText("No results found.", {
      parse_mode: "Markdown",
    });
    return;
  }

  suggestResults.set(
    playerId,
    results.map((video) => ({ ...video, requestedBy })),
  );

  await ctx.editMessageText(`Results for "*${query}*"`, {
    parse_mode: "Markdown",
    reply_markup: buildResultsKeyboard(playerId, results),
  });
}

async function showTrending(ctx: Context, playerId: string) {
  const [error, results] = await tryCatch(apiClient.getTrending());

  if (error) {
    await ctx.editMessageText("Failed to load trending.", {
      parse_mode: "Markdown",
    });
    return;
  }

  if (!results.length) {
    await ctx.editMessageText("No trending videos found.", {
      parse_mode: "Markdown",
    });
    return;
  }

  const requestedBy = getRequestedBy(ctx);

  suggestResults.set(
    playerId,
    results.map((video) => ({ ...video, requestedBy })),
  );

  await ctx.editMessageText("*Trending Now*", {
    parse_mode: "Markdown",
    reply_markup: buildResultsKeyboard(playerId, results),
  });
}

export async function suggestCommand(ctx: Context) {
  const chatId = ctx.chat?.id;

  if (isNil(chatId)) {
    await ctx.reply("This command only works in groups.", {
      parse_mode: "Markdown",
    });
    return;
  }

  await ctx.reply("Choose a category:", {
    parse_mode: "Markdown",
    reply_markup: buildMainKeyboard(),
  });
}

export async function suggestCallback(ctx: Context) {
  const callbackData = ctx.callbackQuery?.data;
  if (!callbackData) return;

  const category = callbackData.split(":")[1];
  const playerId = getPlayerId(ctx);

  if (!playerId) {
    await ctx.answerCallbackQuery({ text: "Error" });
    return;
  }

  await ctx.answerCallbackQuery();

  if (category === "trending") {
    await ctx.editMessageText("Loading trending...", {
      parse_mode: "Markdown",
    });
    await showTrending(ctx, playerId);
    return;
  }

  if (category === "history") {
    const [error, history] = await tryCatch(
      apiClient.getGroupHistory(playerId, 10),
    );

    if (error) {
      await ctx.editMessageText("Failed to load history.", {
        parse_mode: "Markdown",
      });
      return;
    }

    if (!history.length) {
      await ctx.editMessageText("No play history yet.", {
        parse_mode: "Markdown",
      });
      return;
    }

    const results: SearchResult[] = history.map((item) => ({
      videoId: item.videoId,
      title: item.title,
      thumbnail: "",
      duration: 0,
    }));

    suggestResults.set(playerId, results);

    const keyboard = new InlineKeyboard();
    results.forEach((video, index) => {
      const title =
        video.title.length > 40
          ? `${video.title.substring(0, 37)}...`
          : video.title;

      keyboard.text(`${index + 1}. ${title}`, `sgp:${playerId}:${index}`).row();
    });
    keyboard.text("Back", `sgback:${playerId}`).row();

    await ctx.editMessageText("*Play History*", {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    });
    return;
  }

  if (category === "genre") {
    const [error, categories] = await tryCatch(apiClient.getCategories());

    if (error || !categories?.length) {
      await ctx.editMessageText("Failed to load categories.", {
        parse_mode: "Markdown",
      });
      return;
    }

    await ctx.editMessageText("Choose a genre:", {
      parse_mode: "Markdown",
      reply_markup: buildCategoriesKeyboard(categories),
    });
    return;
  }
}

export async function suggestCategoryCallback(ctx: Context) {
  const callbackData = ctx.callbackQuery?.data;
  if (!callbackData) return;

  const [, categoryId] = callbackData.split(":");
  const playerId = getPlayerId(ctx);

  if (!playerId || !categoryId) {
    await ctx.answerCallbackQuery({ text: "Error" });
    return;
  }

  await ctx.answerCallbackQuery();

  const [error, categories] = await tryCatch(apiClient.getCategories());
  const category = categories?.find((c) => c.id === categoryId);

  if (error || !category) {
    await ctx.editMessageText("Failed to load category.", {
      parse_mode: "Markdown",
    });
    return;
  }

  const requestedBy = getRequestedBy(ctx);
  const query = `${category.title} music`;

  await ctx.editMessageText("Searching...", {
    parse_mode: "Markdown",
  });
  await searchAndShow(ctx, playerId, query, requestedBy);
}

export async function suggestPlayCallback(ctx: Context) {
  const callbackData = ctx.callbackQuery?.data;
  if (!callbackData) return;

  const parts = callbackData.split(":");
  const playerId = parts[1];
  const index = parts[2] ? parseInt(parts[2], 10) : -1;

  const results = suggestResults.get(playerId);

  if (!results || index < 0 || index >= results.length) {
    await ctx.answerCallbackQuery({
      text: "Results expired or invalid selection",
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

  suggestResults.delete(playerId);
  await ctx.answerCallbackQuery({ text: `Playing: ${video.title}` });
  await ctx.editMessageText(`Playing: *${video.title}*`, {
    parse_mode: "Markdown",
  });
}

export async function suggestBackCallback(ctx: Context) {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText("Choose a category:", {
    reply_markup: buildMainKeyboard(),
  });
}
