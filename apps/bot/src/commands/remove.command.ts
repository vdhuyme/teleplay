import { Context } from 'grammy';
import * as apiClient from '../api/api-client';
import { tryCatch } from '@teleplay/core';

export async function removeCommand(ctx: Context) {
  const messageText = ctx.message?.text;
  if (!messageText) return;

  const arg = messageText.replace('/remove', '').trim();
  const position = parseInt(arg, 10);

  if (!arg || isNaN(position) || position < 1) {
    await ctx.reply('Usage: /remove <number>\\nExample: /remove 3', {
      parse_mode: 'Markdown',
    });
    return;
  }

  const chatId = ctx.chat?.id;

  if (!chatId) {
    await ctx.reply('This command only works in groups.', {
      parse_mode: 'Markdown',
    });
    return;
  }

  const playerId = String(chatId);

  const [fetchError, queue] = await tryCatch(apiClient.getQueue(playerId));

  if (fetchError) {
    await ctx.reply(`Error: ${fetchError.message}`, { parse_mode: 'Markdown' });
    return;
  }

  const item = queue.data[position - 1];

  if (!item) {
    await ctx.reply(`No item at position ${position}.`, {
      parse_mode: 'Markdown',
    });
    return;
  }

  const [error] = await tryCatch(apiClient.removeFromQueue(playerId, item.id));

  if (error) {
    await ctx.reply(`Error: ${error.message}`, { parse_mode: 'Markdown' });
    return;
  }

  await ctx.reply(`Removed: ${item.title}`, { parse_mode: 'Markdown' });
}
