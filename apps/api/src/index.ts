import { createServer } from 'http';
import { app, logger } from './app';
import { SocketIoServer } from './realtime/websocket';
import { App } from '@teleplay/core';

const httpServer = createServer(app);

export const sio = new SocketIoServer(httpServer);
sio.onConnection((ws) =>
  ws.on('join', async (playerId: string) => sio.joinRoom(ws.id, playerId)),
);

const port = App.isDevelopment() ? Number(App.get('API_PORT', '8000')) : 10000;
httpServer.listen(port, '0.0.0.0', () => {
  logger.info(`🚀 HTTP server running on port ${port}`);
});
