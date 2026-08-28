import { SocketEvent } from './types';

const SOCKET_EVENTS = {
  PLAY: 'PLAY',
  PAUSE: 'PAUSE',
  RESUME: 'RESUME',
  STOP: 'STOP',
  POSITION: 'POSITION',
  QUEUE_UPDATED: 'QUEUE_UPDATED',
  VOLUME: 'VOLUME',
  GROUPS_UPDATED: 'GROUPS_UPDATED',
} as const;

export class PlayEvent extends SocketEvent {
  readonly name = SOCKET_EVENTS.PLAY;
  constructor(
    public readonly videoId: string,
    public readonly title: string,
    public readonly thumbnail: string | null,
    public readonly duration: number | null,
    public readonly requestedBy: string | null,
  ) {
    super();
  }
}

export class PauseEvent extends SocketEvent {
  readonly name = SOCKET_EVENTS.PAUSE;
}

export class ResumeEvent extends SocketEvent {
  readonly name = SOCKET_EVENTS.RESUME;
}

export class StopEvent extends SocketEvent {
  readonly name = SOCKET_EVENTS.STOP;
}

export class QueueUpdatedEvent extends SocketEvent {
  readonly name = SOCKET_EVENTS.QUEUE_UPDATED;
}

export class VolumeEvent extends SocketEvent {
  readonly name = SOCKET_EVENTS.VOLUME;
  constructor(public readonly volume: number) {
    super();
  }
}

export class PositionEvent extends SocketEvent {
  readonly name = SOCKET_EVENTS.POSITION;
  constructor(public readonly position: number) {
    super();
  }
}

export class GroupsUpdatedEvent extends SocketEvent {
  readonly name = SOCKET_EVENTS.GROUPS_UPDATED;
  constructor(public readonly groupId: number) {
    super();
  }
}
