import { Context } from 'grammy';
import { App, isNil } from '@teleplay/core';

export async function shareCommand(ctx: Context) {
  const chatId = ctx.chat?.id;

  if (isNil(chatId)) {
    await ctx.reply('This command only works in groups.', {
      parse_mode: 'Markdown',
    });
    return;
  }

  const clientUrl = App.get('CLIENT_URL');

  if (!clientUrl) {
    await ctx.reply('Player URL is not configured.', {
      parse_mode: 'Markdown',
    });
    return;
  }

  const playerLink = `${clientUrl}/players/${chatId}`;

  await ctx.reply(
    `*Access Player*\n\n[Click here to open player](${playerLink})`,
    {
      parse_mode: 'Markdown',
    },
  );
}
