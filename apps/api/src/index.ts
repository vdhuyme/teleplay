import { createServer } from 'http';
import { app, logger } from './app';
import { App } from '@teleplay/core';
import { SocketIoServer } from './realtime';

const httpServer = createServer(app);

export const sio = new SocketIoServer(httpServer);
sio.onConnection((ws) =>
  ws.on('join', async (playerId: string) => sio.joinRoom(ws.id, playerId)),
);

const port = Number(App.get('PORT', '10000'));
httpServer.listen(port, () =>
  logger.info(`🚀 HTTP server running on port ${port}`),
);
