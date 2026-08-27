export interface PlayRequest {
  query: string;
  requestedBy?: string;
  groupName?: string;
}

export interface VolumeRequest {
  volume: number;
}

export interface SearchResult {
  videoId: string;
  title: string;
  thumbnail: string;
  duration: number;
}

export const PLAYER_STATUS = {
  IDLE: 'idle',
  PLAYING: 'playing',
  PAUSED: 'paused',
  STOPPED: 'stopped',
} as const;
export type PlayerStatus = (typeof PLAYER_STATUS)[keyof typeof PLAYER_STATUS];

export interface PlayerState {
  playerId: string;
  groupName: string | null;
  status: PlayerStatus;
  videoId: string | null;
  title: string | null;
  thumbnail: string | null;
  duration: number | null;
  position: number;
  volume: number;
  requestedBy: string | null;
  updatedAt: Date;
}

export interface QueueItem {
  id: number;
  playerId: string;
  videoId: string;
  title: string;
  thumbnail: string | null;
  duration: number | null;
  votes: number;
  requestedBy: string | null;
  createdAt: Date;
}
