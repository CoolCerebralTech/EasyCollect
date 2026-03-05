// =====================================================
// src/hooks/useRoom.ts
// Hook for managing room data and operations
// =====================================================

import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/db.service';
import type { RoomDetails } from '../lib/types';
import { LocalStorageService } from '../services/storage.service';

export const useRoom = (token: string | null) => {
  const [room, setRoom] = useState<RoomDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoom = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await db.rooms.getRoomDetails(token);

      if (result.success) {
        setRoom(result.data);
        // Save to history if steward
        if (result.data.role === 'steward') {
          LocalStorageService.touchRoom(result.data.room.id);
        }
      } else {
        setError(result.error?.message || 'Failed to load room');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Only run on mount or token change
  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  return {
    room,
    loading,
    error,
    refetch: fetchRoom,
    isViewer: room?.role === 'viewer',
    isSteward: room?.role === 'steward',
    canEdit: room?.can_edit || false,
  };
};