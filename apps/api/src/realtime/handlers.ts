import type { SocketIoServer } from './websocket';

export function subscribeToPlayer(wss: SocketIoServer): void {
  wss.onConnection((ws) =>
    ws.on('join', async (playerId: string) => wss.joinRoom(ws.id, playerId)),
  );
}
