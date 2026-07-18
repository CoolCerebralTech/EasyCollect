// =====================================================
// src/hooks/useRoom.ts
// Hook for managing room data and operations
// =====================================================

import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/db.service';
import type { RoomDetails } from '../lib/types';
import { LocalStorageService } from '../services/storage.service';
import { useAsyncAction } from './useAsyncAction';

export const useRoom = (token: string | null) => {
  const [room, setRoom] = useState<RoomDetails | null>(null);
  const { execute, loading, error } = useAsyncAction();

  const fetchRoom = useCallback(async () => {
    if (!token) {
      setRoom(null);
      return;
    }

    // db.rooms.getRoomDetails already returns an ApiResponse<RoomDetails>.
    // We throw on failure so useAsyncAction picks up the message.
    const response = await db.rooms.getRoomDetails(token);
    if (!response.success) {
      throw new Error(response.error.message || 'Failed to load room');
    }

    const data = response.data;
    setRoom(data);

    // Save to history if organizer
    if (data.role === 'organizer') {
      LocalStorageService.touchRoom(data.room.id);
    }

    return data;
  }, [token]);

  useEffect(() => {
    if (!token) {
      setRoom(null);
      return;
    }

    // Fire-and-forget: useAsyncAction handles loading/error/toast state.
    // fetchRoom already calls setRoom internally on success.
    execute(fetchRoom, {
      errorMessage: 'Failed to load room',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, fetchRoom]);

  const refetch = useCallback(() => {
    return execute(fetchRoom, {
      errorMessage: 'Failed to reload room',
    });
  }, [execute, fetchRoom]);

  // Derived values for consumers
  const isOrganizer = room?.role === 'organizer';
  const canEdit = isOrganizer;

  return {
    room,
    loading,
    error,
    refetch,
    isOrganizer,
    canEdit,
  };
};
