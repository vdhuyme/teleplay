export const SOCKET_EVENTS = {
  STATE_SYNC: 'STATE_SYNC',
  PLAY: 'PLAY',
  PAUSE: 'PAUSE',
  RESUME: 'RESUME',
  STOP: 'STOP',
  QUEUE_UPDATED: 'QUEUE_UPDATED',
  VOLUME: 'VOLUME',
  GROUPS_UPDATED: 'GROUPS_UPDATED',
} as const;

export const SOCKET_REQUESTS = {
  JOIN_PLAYER: 'joinPlayer',
  LEAVE_PLAYER: 'leavePlayer',
} as const;

export type SocketEventName = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
export type SocketRequestName =
  (typeof SOCKET_REQUESTS)[keyof typeof SOCKET_REQUESTS];
