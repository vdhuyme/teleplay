import { bot } from './bot';
import { errorHandler } from './middlewares';

bot.catch(errorHandler);

bot.start({
  onStart: (botInfo) => {
    console.info(
      `🤖 Bot ${[botInfo.first_name, botInfo.last_name].filter(Boolean).join(' ')} is running!`,
    );
  },
});
