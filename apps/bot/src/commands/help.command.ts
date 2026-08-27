import { Context } from 'grammy';
import { formatHelp } from '../utils/player.formatter';

export async function helpCommand(ctx: Context) {
  await ctx.reply(formatHelp(), { parse_mode: 'Markdown' });
}
