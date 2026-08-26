import { Context } from "grammy";

export async function startCommand(ctx: Context) {
  await ctx.reply(
    "Welcome to Teleplay!\n\n" +
      "I'm a music remote control bot for your Telegram group.\n\n" +
      "Use /help to see available commands."
  );
}
