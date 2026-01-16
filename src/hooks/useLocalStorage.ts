// =====================================================
// src/hooks/useLocalStorage.ts
// Hook for accessing localStorage rooms
// =====================================================

import { useState, useEffect, useCallback } from 'react';
import { LocalStorageService, type StoredRoom } from '../services/storage.service';

export const useLocalStorage = () => {
  // ✅ FIXED: Lazy initialization loads data on mount
  const [rooms, setRooms] = useState<StoredRoom[]>(() => {
    try {
      return LocalStorageService.getRooms();
    } catch (error) {
      console.error('Failed to load rooms from storage:', error);
      return [];
    }
  });

  // ✅ FIXED: Pure subscription effect - NO synchronous setState
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const updatedRooms = LocalStorageService.getRooms();
        setRooms(updatedRooms);
      } catch (error) {
        console.error('Failed to sync rooms from storage:', error);
      }
    };

    // Listen for storage events across tabs
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Empty deps - pure external sync

  const saveRoom = useCallback((room: StoredRoom) => {
    LocalStorageService.saveRoom(room);
    // State syncs via storage event or lazy init
  }, []);

  const removeRoom = useCallback((roomId: string) => {
    LocalStorageService.removeRoom(roomId);
    // State syncs via storage event
  }, []);

  const clearAll = useCallback(() => {
    LocalStorageService.clearAll();
    // State syncs via storage event or lazy init
  }, []);

  const refresh = useCallback(() => {
    try {
      const updatedRooms = LocalStorageService.getRooms();
      setRooms(updatedRooms);
    } catch (error) {
      console.error('Failed to refresh rooms:', error);
    }
  }, []);

  return {
    rooms,
    saveRoom,
    removeRoom,
    clearAll,
    refresh,
  };
};
