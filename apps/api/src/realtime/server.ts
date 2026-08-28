import { SocketIoServer } from './websocket';
import { subscribeToPlayer } from './handlers';

export const wss = new SocketIoServer();

void subscribeToPlayer(wss);
