import type { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from './types';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export class SocketIoServer {
  private wss: SocketServer<ClientToServerEvents, ServerToClientEvents>;

  constructor() {
    this.wss = new SocketServer({
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      },
    });
  }

  attach(httpServer: HttpServer): void {
    this.wss.attach(httpServer);
  }

  broadcast<E extends keyof ServerToClientEvents>(
    event: E,
    ...args: Parameters<ServerToClientEvents[E]>
  ): void {
    this.wss.emit(event, ...args);
  }

  broadcastToRoom<E extends keyof ServerToClientEvents>(
    room: string,
    event: E,
    ...args: Parameters<ServerToClientEvents[E]>
  ): void {
    this.wss.to(room).emit(event, ...args);
  }

  broadcastToNamespace<E extends keyof ServerToClientEvents>(
    namespace: string,
    event: E,
    ...args: Parameters<ServerToClientEvents[E]>
  ): void {
    this.wss.of(namespace).emit(event, ...args);
  }

  emitToClient<E extends keyof ServerToClientEvents>(
    clientId: string,
    event: E,
    ...args: Parameters<ServerToClientEvents[E]>
  ): void {
    this.wss.to(clientId).emit(event, ...args);
  }

  async joinRoom(clientId: string, room: string): Promise<void> {
    const socket = this.wss.sockets.sockets.get(clientId);
    if (socket) {
      socket.join(room);
    }
  }

  async leaveRoom(clientId: string, room: string): Promise<void> {
    const socket = this.wss.sockets.sockets.get(clientId);
    if (socket) {
      socket.leave(room);
    }
  }

  getConnectedClientsCount(): number {
    return this.wss.engine.clientsCount;
  }

  async getClientsInRoom(room: string): Promise<string[]> {
    const sockets = await this.wss.in(room).fetchSockets();
    return sockets.map((s) => s.id);
  }

  onConnection(handler: (socket: TypedSocket) => void): void {
    this.wss.on('connection', handler);
  }
}
