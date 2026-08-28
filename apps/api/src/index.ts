import { createServer } from 'http';
import { app, logger } from './app';
import { App } from '@teleplay/core';
import { wss } from './realtime';

const httpServer = createServer(app);
wss.attach(httpServer);

const port = Number(App.get('PORT', '10000'));
httpServer.listen(port, () =>
  logger.info(`🚀 HTTP server running on port ${port}`),
);
