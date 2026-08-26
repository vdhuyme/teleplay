import { createServer } from "http";
import { app, logger } from "./app";
import { SocketIoServer } from "./realtime/websocket";
import { App } from "./config/env";

const httpServer = createServer(app);

export const sio = new SocketIoServer(httpServer);
sio.onConnection((ws) =>
  ws.on("join", async (playerId: string) => sio.joinRoom(ws.id, playerId)),
);

const port = App.get("API_PORT", 9001);
httpServer.listen(port, () => {
  logger.info(`🚀 HTTP server running on port ${port}`);
});
