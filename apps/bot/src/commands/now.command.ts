import { Context } from 'grammy';
import * as apiClient from '../api/api-client';
import {
  formatNowPlaying,
  formatNowPlayingKeyboard,
} from '../utils/player.formatter';
import { tryCatch } from '@teleplay/core';

export async function nowCommand(ctx: Context) {
  const chatId = ctx.chat?.id;

  if (!chatId) {
    await ctx.reply('This command only works in groups.', {
      parse_mode: 'Markdown',
    });
    return;
  }

  const playerId = String(chatId);

  const [error, state] = await tryCatch(apiClient.getState(playerId));

  if (error) {
    await ctx.reply(`Error: ${error.message}`, { parse_mode: 'Markdown' });
    return;
  }

  const text = formatNowPlaying(state);
  const keyboard = formatNowPlayingKeyboard(playerId);

  await ctx.reply(text, {
    parse_mode: 'Markdown',
    reply_markup: keyboard,
  });
}
