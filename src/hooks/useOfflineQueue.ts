// =====================================================
// src/hooks/useOfflineQueue.ts
// Queue operations when offline and sync when back online
// =====================================================

import { useState, useEffect, useCallback, useRef } from 'react';

interface QueuedOperation<T = unknown> {
  id: string;
  type: string;
  payload: T;
  timestamp: number;
  retryCount: number;
}

const STORAGE_KEY = 'ledger_offline_queue';
const MAX_RETRIES = 3;

export const useOfflineQueue = () => {
  // 1. Lazy Initialization
  const [queue, setQueue] = useState<QueuedOperation[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      return [];
    }
  });

  // Queue ref for immediate access - FIXED: Moved to useEffect
  const queueRef = useRef<QueuedOperation[]>([]);
  useEffect(() => {
    queueRef.current = queue;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }, [queue]);

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isProcessing, setIsProcessing] = useState(false);

  // Processing lock refs
  const isProcessingRef = useRef(false);
  
  // Process queue function (stable)
  const processQueue = useCallback(async () => {
    // Early exit conditions
    if (isProcessingRef.current || queueRef.current.length === 0 || !navigator.onLine) {
      return;
    }

    // Set processing lock
    isProcessingRef.current = true;
    setIsProcessing(true);

    const currentQueue = [...queueRef.current];
    const processedIds: string[] = [];
    const failedOps: QueuedOperation[] = [];

    // Process each operation
    for (const operation of currentQueue) {
      try {
        // Replace with your actual API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        processedIds.push(operation.id);
      } catch (error) {
        console.error(`Failed to process operation ${operation.id}:`, error);
        if (operation.retryCount < MAX_RETRIES) {
          failedOps.push({ ...operation, retryCount: operation.retryCount + 1 });
        }
      }
    }

    // Update queue state
    setQueue((prev) => {
      const remaining = prev.filter((op) => !processedIds.includes(op.id));
      return [...remaining, ...failedOps];
    });

    // Release lock
    isProcessingRef.current = false;
    setIsProcessing(false);
  }, []);

  // 2. Network Status Effect - FIXED: No ref updates during render
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Schedule processing after current render cycle
      requestIdleCallback(() => {
        processQueue();
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [processQueue]);

  // 3. Auto-process when queue changes and online - FIXED: No ref reads during render
  useEffect(() => {
    if (isOnline && queue.length > 0 && !isProcessing) {
      const timeoutId = setTimeout(() => {
        processQueue();
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [isOnline, queue.length, isProcessing, processQueue]);

  // 4. Add to Queue
  const addToQueue = useCallback(<T,>(type: string, payload: T): string => {
    const operation: QueuedOperation<T> = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
    };

    setQueue((prev) => [...prev, operation]);

    // Process immediately if online (using state, not ref)
    if (navigator.onLine && !isProcessing) {
      setTimeout(processQueue, 0);
    }

    return operation.id;
  }, [isProcessing, processQueue]);

  // 5. Utility functions
  const clearQueue = useCallback(() => {
    setQueue([]);
    setIsProcessing(false);
    isProcessingRef.current = false;
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    setQueue((prev) => prev.filter((op) => op.id !== id));
  }, []);

  return {
    queue,
    queueSize: queue.length,
    isOnline,
    isProcessing,
    addToQueue,
    processQueue,
    clearQueue,
    removeFromQueue,
  };
};
