import { createServer } from 'http';
import { bot } from './bot';
import { App } from '@teleplay/core';

const port = Number(App.get('PORT', '10000'));
const httpServer = createServer();
httpServer.listen(port, () =>
  console.log(`🩺 Health check server listening on port ${port}`),
);

bot.start({
  onStart: () => {
    console.log('🤖 Bot is running!');
  },
});
