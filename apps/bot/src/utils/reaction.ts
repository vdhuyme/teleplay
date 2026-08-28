import { Context } from 'grammy';
import { tryCatch } from '@teleplay/core';

const reactionEmojis = [
  '👍',
  '🔥',
  '🎉',
  '🤩',
  '⚡',
  '😎',
  '💯',
  '🤣',
  '🥰',
  '👏',
  '🏆',
  '🤝',
  '🫡',
  '🤗',
  '😍',
] as const;

export async function reactRandom(ctx: Context): Promise<void> {
  const emoji =
    reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
  await tryCatch(ctx.react(emoji));
}
