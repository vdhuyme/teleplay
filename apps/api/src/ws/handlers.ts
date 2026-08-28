import type { Socket as SocketIoSocket } from 'socket.io';
import type { SocketIoServer } from './websocket';
import type { ClientToServerEvents, ServerToClientEvents } from './types';
import { logger } from '../app';

interface JoinParams {
  wss: SocketIoServer;
  ws: SocketIoSocket<ClientToServerEvents, ServerToClientEvents>;
  playerId: string;
}

interface LeaveParams {
  wss: SocketIoServer;
  ws: SocketIoSocket<ClientToServerEvents, ServerToClientEvents>;
  playerId: string;
}

async function handleJoin({ wss, ws, playerId }: JoinParams): Promise<void> {
  logger.info(`Client ${ws.id} joining room ${playerId}`);

  await wss.joinRoom(ws.id, playerId);
}

async function handleLeave({ wss, ws, playerId }: LeaveParams): Promise<void> {
  logger.info(`Client ${ws.id} leaving room ${playerId}`);

  await wss.leaveRoom(ws.id, playerId);
}

export function subscribeToPlayer(wss: SocketIoServer): void {
  wss.onConnection((ws) => {
    ws.on('joinPlayer', (playerId: string) =>
      handleJoin({ wss, ws, playerId }),
    );
    ws.on('leavePlayer', (playerId: string) =>
      handleLeave({ wss, ws, playerId }),
    );
  });
}
