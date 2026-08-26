import { Server as HttpServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";

export class SocketIoServer {
  private sio: SocketServer;

  constructor(server: HttpServer) {
    this.sio = new SocketServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      },
    });
  }

  broadcast<TPayload = unknown>(event: string, data: TPayload): void {
    this.sio.emit(event, data);
  }

  broadcastToRoom<TPayload = unknown>(
    room: string,
    event: string,
    data: TPayload,
  ): void {
    this.sio.to(room).emit(event, data);
  }

  broadcastToNamespace<TPayload = unknown>(
    namespace: string,
    event: string,
    data: TPayload,
  ): void {
    this.sio.of(namespace).emit(event, data);
  }

  emitToClient<TPayload = unknown>(
    clientId: string,
    event: string,
    data: TPayload,
  ): void {
    this.sio.to(clientId).emit(event, data);
  }

  async joinRoom(clientId: string, room: string): Promise<void> {
    const socket = this.sio.sockets.sockets.get(clientId);
    if (socket) {
      socket.join(room);
    }
  }

  async leaveRoom(clientId: string, room: string): Promise<void> {
    const socket = this.sio.sockets.sockets.get(clientId);
    if (socket) {
      socket.leave(room);
    }
  }

  getConnectedClientsCount(): number {
    return this.sio.engine.clientsCount;
  }

  async getClientsInRoom(room: string): Promise<string[]> {
    const sockets = await this.sio.in(room).fetchSockets();
    return sockets.map((s) => s.id);
  }

  onConnection(handler: (socket: Socket) => void): void {
    this.sio.on("connection", handler);
  }
}
