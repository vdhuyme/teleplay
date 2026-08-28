import { Context, InlineKeyboard } from 'grammy';
import { SearchResult } from '../type';
import * as apiClient from '../api/api-client';
import { tryCatch } from '@teleplay/core';
import { isNil } from '@teleplay/core';

export const searchResults = new Map<string, SearchResult[]>();

export async function searchCommand(ctx: Context) {
  const messageText = ctx.message?.text;
  if (!messageText) return;

  const query = messageText.replace('/search', '').trim();

  if (!query) {
    await ctx.reply(
      'Please provide a search query. Example: /search Em của ngày hôm qua',
      {
        parse_mode: 'Markdown',
      },
    );

    return;
  }

  const chatId = ctx.chat?.id;

  if (isNil(chatId)) {
    await ctx.reply('This command only works in groups.', {
      parse_mode: 'Markdown',
    });

    return;
  }

  const playerId = String(chatId);
  const requestedBy =
    [ctx.from?.first_name, ctx.from?.last_name].filter(Boolean).join(' ') ||
    ctx.from?.username;

  await ctx.reply('Searching...', { parse_mode: 'Markdown' });

  const [error, results] = await tryCatch(apiClient.search(playerId, query));
  if (error) {
    await ctx.reply(`Error: ${error.message}`, { parse_mode: 'Markdown' });

    return;
  }

  if (!results.data.length) {
    await ctx.reply('No results found.', { parse_mode: 'Markdown' });

    return;
  }

  searchResults.set(
    playerId,
    results.data.map((video) => ({
      ...video,
      requestedBy,
    })),
  );

  const keyboard = new InlineKeyboard();

  results.data.forEach((video, index) => {
    const title =
      video.title.length > 40
        ? `${video.title.substring(0, 37)}...`
        : video.title;

    keyboard.text(`${index + 1}. ${title}`, `sp:${playerId}:${index}`).row();
  });

  await ctx.reply('Select a song to play:', {
    parse_mode: 'Markdown',
    reply_markup: keyboard,
  });
}
