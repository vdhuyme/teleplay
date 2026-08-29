import { tryCatch } from '@teleplay/core';
import { bot } from './bot';
import { errorHandler } from './middlewares';

bot.catch(errorHandler);

bot.start({
  onStart: async (botInfo) => {
    const [err] = await tryCatch(
      bot.api.setMyCommands([
        { command: 'play', description: 'Play a song' },
        { command: 'search', description: 'Search and select a song' },
        {
          command: 'suggest',
          description: 'Suggest songs by genre/trend/artist',
        },
        { command: 'pause', description: 'Pause playback' },
        { command: 'resume', description: 'Resume playback' },
        { command: 'skip', description: 'Skip to next song' },
        { command: 'stop', description: 'Stop playback' },
        { command: 'queue', description: 'View the queue' },
        { command: 'now', description: 'View current song' },
        { command: 'volume', description: 'Set volume 0-100' },
        { command: 'clear', description: 'Clear the queue' },
        {
          command: 'remove',
          description: 'Remove a song from queue by number',
        },
        {
          command: 'playfromqueue',
          description: 'Play a specific song from queue',
        },
        { command: 'help', description: 'Show help' },
      ]),
    );

    if (err) {
      console.error('Failed to set bot commands: ', err.message);
    }

    console.info(
      `🤖 Bot ${[botInfo.first_name, botInfo.last_name].filter(Boolean).join(' ')} is running!`,
    );
  },
});
