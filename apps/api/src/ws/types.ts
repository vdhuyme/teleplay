import { wss } from './server';

export interface ClientToServerEvents {
  joinPlayer: (playerId: string) => void;
  leavePlayer: (playerId: string) => void;
}

export interface ServerToClientEvents {
  STATE_SYNC: (state: Record<string, unknown>) => void;
  PLAY: (data: Record<string, unknown>) => void;
  PAUSE: () => void;
  RESUME: () => void;
  STOP: () => void;
  VOLUME: (data: { volume: number }) => void;
  QUEUE_UPDATED: () => void;
}

export abstract class SocketEvent {
  abstract readonly name: string;

  toRoom(groupId: number | string): void {
    wss.broadcastToRoom(
      String(groupId),
      this.name as keyof ServerToClientEvents,
      this.toPayload(),
    );
  }

  broadcast(): void {
    wss.broadcast(this.name as keyof ServerToClientEvents, this.toPayload());
  }

  protected toPayload(): Record<string, unknown> {
    const payload: Record<string, unknown> = { type: this.name };
    for (const key of Object.keys(this)) {
      if (key !== 'name') payload[key] = (this as Record<string, unknown>)[key];
    }
    return payload;
  }
}
