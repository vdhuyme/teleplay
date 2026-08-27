import { Context, InlineKeyboard } from "grammy";
import * as apiClient from "../api/api-client";
import { tryCatch, isNil } from "@teleplay/core";
import { SearchResult } from "../type";

export const suggestResults = new Map<string, SearchResult[]>();

interface SubcategoryItem {
  label: string;
  query: string;
}

const CATEGORIES = {
  genre: {
    label: "By Genre",
    subcategories: {
      vpop: { label: "V-Pop", query: "V-Pop hit 2025" },
      ballad: { label: "Ballad", query: "Vietnamese Ballad best" },
      rap: { label: "Rap/Hip-Hop", query: "Rap Viet Hip-Hop best" },
      edm: { label: "EDM", query: "EDM Vietnamese hit" },
      rock: { label: "Rock", query: "Rock Viet best" },
      acoustic: { label: "Acoustic", query: "Acoustic Vietnamese chill" },
    } satisfies Record<string, SubcategoryItem>,
  },
  trending: {
    label: "Trending",
    query: "Vietnam music trending today",
  },
  artist: {
    label: "By Artist",
    subcategories: {
      sontung: { label: "Son Tung M-TP", query: "Son Tung M-TP" },
      dendau: { label: "Den Vau", query: "Den Vau" },
      hinhhai: { label: "Hua Kim Tuyen", query: "Hua Kim Tuyen" },
      erik: { label: "ERIK", query: "ERIK music" },
      hoangthuylinh: { label: "Hoang Thuy Linh", query: "Hoang Thuy Linh" },
    } satisfies Record<string, SubcategoryItem>,
  },
  history: { label: "History" },
} as const;

type CategoryKey = keyof typeof CATEGORIES;

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
    .text("**By Genre**", "sg:genre")
    .text("**Trending**", "sg:trending")
    .row()
    .text("**By Artist**", "sg:artist")
    .text("**History**", "sg:history");

  return keyboard;
}

function buildSubcategoryKeyboard(
  category: "genre" | "artist",
): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  const subcategories = CATEGORIES[category].subcategories;

  const entries = Object.entries(subcategories);
  for (let i = 0; i < entries.length; i += 2) {
    const [key1, sub1] = entries[i];
    keyboard.text(sub1.label, `sgs:${category}:${key1}`);

    if (i + 1 < entries.length) {
      const [, sub2] = entries[i + 1];
      keyboard.text(sub2.label, `sgs:${category}:${entries[i + 1][0]}`);
    }

    keyboard.row();
  }

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
    await ctx.editMessageText("Search error.");
    return;
  }

  if (!results.length) {
    await ctx.editMessageText("No results found.");
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

export async function suggestCommand(ctx: Context) {
  const chatId = ctx.chat?.id;

  if (isNil(chatId)) {
    await ctx.reply("This command only works in groups.");
    return;
  }

  await ctx.reply("Choose a category:", {
    reply_markup: buildMainKeyboard(),
  });
}

export async function suggestCallback(ctx: Context) {
  const callbackData = ctx.callbackQuery?.data;
  if (!callbackData) return;

  const category = callbackData.split(":")[1] as CategoryKey;
  const playerId = getPlayerId(ctx);

  if (!playerId) {
    await ctx.answerCallbackQuery({ text: "Error" });
    return;
  }

  await ctx.answerCallbackQuery();

  if (category === "trending") {
    const requestedBy = getRequestedBy(ctx);
    await ctx.editMessageText("Searching...");
    await searchAndShow(ctx, playerId, CATEGORIES.trending.query, requestedBy);
    return;
  }

  if (category === "history") {
    const [error, history] = await tryCatch(
      apiClient.getGroupHistory(playerId, 10),
    );

    if (error) {
      await ctx.editMessageText("Failed to load history.");
      return;
    }

    if (!history.length) {
      await ctx.editMessageText("No play history yet.");
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

  if (category === "genre" || category === "artist") {
    await ctx.editMessageText(
      `Choose ${CATEGORIES[category].label.toLowerCase()}:`,
      {
        reply_markup: buildSubcategoryKeyboard(category),
      },
    );
    return;
  }
}

export async function suggestSubCallback(ctx: Context) {
  const callbackData = ctx.callbackQuery?.data;
  if (!callbackData) return;

  const [, category, subKey] = callbackData.split(":");
  const playerId = getPlayerId(ctx);

  if (!playerId) {
    await ctx.answerCallbackQuery({ text: "Error" });
    return;
  }

  await ctx.answerCallbackQuery();

  const subcategories =
    category === "genre"
      ? CATEGORIES.genre.subcategories
      : category === "artist"
        ? CATEGORIES.artist.subcategories
        : null;

  if (!subcategories) return;

  const subcategory = subcategories[subKey as keyof typeof subcategories] as
    | SubcategoryItem
    | undefined;
  if (!subcategory) return;

  const requestedBy = getRequestedBy(ctx);

  await ctx.editMessageText("Searching...");
  await searchAndShow(ctx, playerId, subcategory.query, requestedBy);
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
