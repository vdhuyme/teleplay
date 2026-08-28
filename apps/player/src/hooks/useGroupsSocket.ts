'use client';

import { useEffect } from 'react';
import { useSocketContext } from '../contexts/SocketContext';
import { SOCKET_EVENTS } from '../socket/events';
import type { GroupsUpdatedPayload } from '../socket/types';

export function useGroupsSocket(onGroupsUpdated: (groupId: number) => void) {
  const { socket } = useSocketContext();

  useEffect(() => {
    if (!socket) return;

    const handleGroupsUpdated = (data: GroupsUpdatedPayload) => {
      onGroupsUpdated(data.groupId);
    };

    socket.on(SOCKET_EVENTS.GROUPS_UPDATED, handleGroupsUpdated);

    return () => {
      socket.off(SOCKET_EVENTS.GROUPS_UPDATED, handleGroupsUpdated);
    };
  }, [socket, onGroupsUpdated]);
}
