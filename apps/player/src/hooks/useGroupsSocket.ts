'use client';

import { useEffect } from 'react';
import { useSocketContext } from '../contexts/SocketContext';

export function useGroupsSocket(onGroupsUpdated: () => void) {
  const { socket } = useSocketContext();

  useEffect(() => {
    if (!socket) return;

    socket.on('GROUPS_UPDATED', onGroupsUpdated);

    return () => {
      socket.off('GROUPS_UPDATED', onGroupsUpdated);
    };
  }, [socket, onGroupsUpdated]);
}
