import type { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';

export class SocketIoServer {
  private wss: SocketServer;

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

  broadcast<TPayload = unknown>(event: string, data: TPayload): void {
    this.wss.emit(event, data);
  }

  broadcastToRoom<TPayload = unknown>(
    room: string,
    event: string,
    data: TPayload,
  ): void {
    this.wss.to(room).emit(event, data);
  }

  broadcastToNamespace<TPayload = unknown>(
    namespace: string,
    event: string,
    data: TPayload,
  ): void {
    this.wss.of(namespace).emit(event, data);
  }

  emitToClient<TPayload = unknown>(
    clientId: string,
    event: string,
    data: TPayload,
  ): void {
    this.wss.to(clientId).emit(event, data);
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

  onConnection(handler: (socket: Socket) => void): void {
    this.wss.on('connection', handler);
  }
}
