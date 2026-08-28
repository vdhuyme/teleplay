import { SOCKET_EVENTS } from './events';

export type PlayerStatus = 'idle' | 'playing' | 'paused' | 'stopped';

export interface PlayerState {
  status: PlayerStatus;
  videoId: string | null;
  title: string | null;
  thumbnail: string | null;
  duration: number | null;
  position: number;
  volume: number;
  requestedBy: string | null;
}

export interface StateSyncEvent {
  type: typeof SOCKET_EVENTS.STATE_SYNC;
  state: PlayerState;
}

export interface PlayEvent {
  type: typeof SOCKET_EVENTS.PLAY;
  videoId: string;
  title: string;
  thumbnail: string | null;
  duration: number | null;
  requestedBy: string | null;
}

export interface PauseEvent {
  type: typeof SOCKET_EVENTS.PAUSE;
}

export interface ResumeEvent {
  type: typeof SOCKET_EVENTS.RESUME;
}

export interface StopEvent {
  type: typeof SOCKET_EVENTS.STOP;
}

export interface VolumeEvent {
  type: typeof SOCKET_EVENTS.VOLUME;
  volume: number;
}

export interface PositionEvent {
  type: typeof SOCKET_EVENTS.POSITION;
  position: number;
}

export interface QueueUpdatedEvent {
  type: typeof SOCKET_EVENTS.QUEUE_UPDATED;
}

export type SocketEvent =
  | StateSyncEvent
  | PlayEvent
  | PauseEvent
  | ResumeEvent
  | StopEvent
  | VolumeEvent
  | PositionEvent
  | QueueUpdatedEvent;

export interface GroupsUpdatedPayload {
  groupId: number;
}
