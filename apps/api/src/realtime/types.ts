import { wss } from './server';

export abstract class SocketEvent {
  abstract readonly name: string;

  toRoom(groupId: number | string): void {
    wss.broadcastToRoom(String(groupId), this.name, this.toPayload());
  }

  broadcast(): void {
    wss.broadcast(this.name, this.toPayload());
  }

  protected toPayload(): Record<string, unknown> {
    const payload: Record<string, unknown> = { type: this.name };
    for (const key of Object.keys(this)) {
      if (key !== 'name') payload[key] = (this as Record<string, unknown>)[key];
    }
    return payload;
  }
}
