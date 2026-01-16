// =====================================================
// src/hooks/usePINGate.ts
// Hook for managing PIN authentication
// =====================================================

import { useCallback, useEffect, useState } from 'react';
import { db } from '../lib/database.service';
import { LocalStorageService } from '../services/storage.service';

export const usePINGate = (token: string) => {
  // Helper: Read current status from LocalStorage
  const getStorageStatus = useCallback(() => {
    if (!token) return { locked: false, time: null, attempts: 5 };
    
    const lockStatus = LocalStorageService.isPINLocked(token);
    const attempts = LocalStorageService.getRemainingAttempts(token);
    
    return {
      locked: lockStatus.locked,
      time: lockStatus.remainingTime || null,
      attempts: attempts
    };
  }, [token]);

  // 1. Lazy Initialization (Fixes the setState error)
  // We read storage immediately when the component mounts
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLocked, setIsLocked] = useState(() => getStorageStatus().locked);
  const [remainingAttempts, setRemainingAttempts] = useState(() => getStorageStatus().attempts);
  const [lockoutTime, setLockoutTime] = useState<number | null>(() => getStorageStatus().time);
  
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2. Refresher function (for updates after failed attempts)
  const refreshStatus = useCallback(() => {
    const status = getStorageStatus();
    setIsLocked(status.locked);
    setLockoutTime(status.time);
    setRemainingAttempts(status.attempts);
  }, [getStorageStatus]);

  // 3. Countdown timer for lockout
  useEffect(() => {
    let timer: number;
    
    // Only run if we are actually locked and have time remaining
    if (isLocked && lockoutTime && lockoutTime > 0) {
      timer = window.setInterval(() => {
        setLockoutTime((prev) => {
          if (prev && prev <= 1) {
            // Time is up! Refresh status to unlock
            refreshStatus();
            return null;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLocked, lockoutTime, refreshStatus]);

  const validatePIN = async (pin: string): Promise<boolean> => {
    setValidating(true);
    setError(null);

    // Double check lock status before calling API
    const currentStatus = getStorageStatus();
    if (currentStatus.locked) {
      refreshStatus(); // Sync UI with reality
      setError(`Too many attempts. Try again in ${currentStatus.time} seconds.`);
      setValidating(false);
      return false;
    }

    try {
      const result = await db.rooms.validateStewardAccess(token, pin);

      if (result.success) {
        setIsAuthenticated(true);
        LocalStorageService.recordPINAttempt(token, true);
        setValidating(false);
        return true;
      } else {
        // Handle failure
        LocalStorageService.recordPINAttempt(token, false);
        refreshStatus(); // Update attempts/lock status immediately
        setError(result.error?.message || 'Invalid PIN');
        setValidating(false);
        return false;
      }
    } catch {
      setError('Connection failed');
      setValidating(false);
      return false;
    }
  };

  return {
    isAuthenticated,
    isLocked,
    remainingAttempts,
    lockoutTime,
    validating,
    error,
    validatePIN,
  };
};