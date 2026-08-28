import { Context } from 'grammy';
import * as apiClient from '../api/api-client';
import { tryCatch } from '@teleplay/core';
import { isNil } from '@teleplay/core';

export async function playCommand(ctx: Context) {
  const messageText = ctx.message?.text;
  if (!messageText) return;

  const query = messageText.replace('/play', '').trim();

  if (!query) {
    await ctx.reply(
      "Please provide a song name. Example: /play We don't talk anymore - Charlie Puth",
      { parse_mode: 'Markdown' },
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

  const requestedBy =
    [ctx.from?.first_name, ctx.from?.last_name].filter(Boolean).join(' ') ||
    ctx.from?.username;
  const groupName = ctx.chat?.title;

  await ctx.reply('Searching for your song...', { parse_mode: 'Markdown' });

  const [error, result] = await tryCatch(
    apiClient.play(String(chatId), {
      query,
      requestedBy,
      groupName,
    }),
  );

  if (error) {
    await ctx.reply(`Error: ${error.message}`, { parse_mode: 'Markdown' });
    return;
  }

  await ctx.reply(`Added: ${result.data.title}`, { parse_mode: 'Markdown' });
}
