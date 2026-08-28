import { Bot, Context } from 'grammy';
import { App } from '@teleplay/core';
import { reactRandom } from './utils/reaction';
import { playCallback } from './utils/player.callback';
import {
  suggestCommand,
  suggestCallback,
  suggestCategoryCallback,
  suggestPlayCallback,
  suggestBackCallback,
} from './commands/suggest.command';
import {
  clearCommand,
  helpCommand,
  nowCommand,
  pauseCommand,
  playCommand,
  queueCommand,
  resumeCommand,
  searchCommand,
  skipCommand,
  startCommand,
  stopCommand,
  volumeCommand,
  removeCommand,
  playFromQueueCommand,
} from './commands';

const bot = new Bot(App.getOrThrow('TELEGRAM_BOT_TOKEN'));

bot.use(async (ctx: Context, next) => {
  if (ctx.message?.text?.startsWith('/')) {
    await reactRandom(ctx);
  }
  await next();
});

bot.command('start', startCommand);
bot.command('help', helpCommand);
bot.command('play', playCommand);
bot.command('search', searchCommand);
bot.command('pause', pauseCommand);
bot.command('resume', resumeCommand);
bot.command('skip', skipCommand);
bot.command('stop', stopCommand);
bot.command('queue', queueCommand);
bot.command('now', nowCommand);
bot.command('volume', volumeCommand);
bot.command('clear', clearCommand);
bot.command('suggest', suggestCommand);
bot.command('remove', removeCommand);
bot.command('playfromqueue', playFromQueueCommand);

bot.callbackQuery(/^pause:-?\d+$/, playCallback);
bot.callbackQuery(/^skip:-?\d+$/, playCallback);
bot.callbackQuery(/^stop:-?\d+$/, playCallback);
bot.callbackQuery(/^queue:-?\d+$/, playCallback);
bot.callbackQuery(/^sp:/, playCallback);
bot.callbackQuery(/^sg:/, suggestCallback);
bot.callbackQuery(/^sgc:/, suggestCategoryCallback);
bot.callbackQuery(/^sgp:/, suggestPlayCallback);
bot.callbackQuery(/^sgback:/, suggestBackCallback);
bot.callbackQuery('sgmain', suggestBackCallback);

bot.api.setMyCommands([
  { command: 'play', description: 'Play a song' },
  { command: 'search', description: 'Search and select a song' },
  { command: 'suggest', description: 'Suggest songs by genre/trend/artist' },
  { command: 'pause', description: 'Pause playback' },
  { command: 'resume', description: 'Resume playback' },
  { command: 'skip', description: 'Skip to next song' },
  { command: 'stop', description: 'Stop playback' },
  { command: 'queue', description: 'View the queue' },
  { command: 'now', description: 'View current song' },
  { command: 'volume', description: 'Set volume 0-100' },
  { command: 'clear', description: 'Clear the queue' },
  { command: 'remove', description: 'Remove a song from queue by number' },
  { command: 'playfromqueue', description: 'Play a specific song from queue' },
  { command: 'help', description: 'Show help' },
]);

export { bot };
