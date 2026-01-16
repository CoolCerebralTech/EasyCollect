// =====================================================
// src/hooks/useAnalytics.ts
// Hook for room analytics (Derived State)
// =====================================================

import { useMemo } from 'react';
import { AnalyticsService, type RoomAnalytics } from '../services/analytics.service';
import type { RoomDetails } from '../lib/types';

export const useAnalytics = (roomDetails: RoomDetails | null): RoomAnalytics | null => {
  return useMemo(() => {
    if (!roomDetails) return null;
    return AnalyticsService.calculateRoomAnalytics(roomDetails);
  }, [roomDetails]);
};