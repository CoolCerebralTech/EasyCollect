// =====================================================
// src/hooks/useRoom.ts
// Hook for managing room data and operations
// =====================================================

import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/db.service';
import type { RoomDetails } from '../lib/app.types'; // Updated import
import { LocalStorageService } from '../services/storage.service';
import { useAsyncAction } from './useAsyncAction'; // Import the new hook

export const useRoom = (token: string | null) => {
  const [room, setRoom] = useState<RoomDetails | null>(null);
  const { execute, loading, error, setError } = useAsyncAction<[string], RoomDetails>();

  const fetchRoom = useCallback(async () => {
    if (!token) {
      // If no token, we are not loading a room. Clear any previous errors.
      setRoom(null);
      setError(null);
      return; // Exit if no token to fetch
    }

    const fetchedRoom = await execute(
      () => db.rooms.getRoomDetails(token),
      {
        errorMessage: 'Failed to load room',
        onSuccess: (result) => {
          setRoom(result.data);
          // Save to history if organizer
          if (result.data.role === 'organizer') {
            LocalStorageService.touchRoom(result.data.room.id);
          }
        },
      }
    );
    
    // If fetchedRoom is undefined (due to error), room state remains unchanged or set to null by onError
    // If fetchedRoom.success is false, then error would be set by useAsyncAction.
    // We only update room if successfully fetched and result.data is present
    if (fetchedRoom?.success) {
      setRoom(fetchedRoom.data);
    } else if (fetchedRoom?.error) {
      // Error is handled by useAsyncAction's toast
      setRoom(null); // Clear room on error
    } else {
      setRoom(null); // Also clear room if no data/success from execute (e.g., token was null, but should be handled above)
    }
  }, [token, execute, setError]);

  // Only run on mount or token change
  useEffect(() => {
    // Ensure loading is true while fetching
    // if (token) setLoading(true); // Handled by useAsyncAction now
    fetchRoom();
  }, [fetchRoom, token]);

  return {
    room,
    loading,
    error,
    refetch: fetchRoom,
    isContributor: room?.role === 'contributor',
    isOrganizer: room?.role === 'organizer',
    canEdit: room?.can_edit || false,
  };
};