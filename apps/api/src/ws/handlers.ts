import type { Socket as SocketIoSocket } from 'socket.io';
import type { SocketIoServer } from './websocket';
import { logger } from '../app';

interface JoinParams {
  wss: SocketIoServer;
  ws: SocketIoSocket;
  playerId: string;
}

interface LeaveParams {
  wss: SocketIoServer;
  ws: SocketIoSocket;
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
    ws.on('join', (playerId: string) => handleJoin({ wss, ws, playerId }));
    ws.on('leave', (playerId: string) => handleLeave({ wss, ws, playerId }));
  });
}
