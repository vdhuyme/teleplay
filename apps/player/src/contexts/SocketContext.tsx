'use client';

import { App } from '@/utils/env';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  connected: false,
});

export function useSocketContext() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socketUrl = App.get('SOCKET_URL') ?? App.get('API_URL') ?? '';
    const socketPath = App.get('SOCKET_PATH') ?? '/socket.io';

    const socket = io(socketUrl, {
      path: socketPath,
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', (err) =>
      console.error('Socket connect_error:', err.message),
    );

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
}
