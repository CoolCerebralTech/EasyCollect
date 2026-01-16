// =====================================================
// hooks/useOptimisticUpdate.ts
// Optimistic UI updates with rollback on failure
// =====================================================

import { useState, useCallback } from 'react';
import { useToast } from '../components/ui/Toast';

interface OptimisticState<T> {
  data: T;
  isPending: boolean;
  error: Error | null;
}

export const useOptimisticUpdate = <T,>(initialData: T) => {
  const [state, setState] = useState<OptimisticState<T>>({
    data: initialData,
    isPending: false,
    error: null,
  });
  const { showToast } = useToast();

  const update = useCallback(
    async (
      optimisticData: T,
      asyncFn: () => Promise<T>,
      options?: {
        onSuccess?: (data: T) => void;
        onError?: (error: Error) => void;
        successMessage?: string;
        errorMessage?: string;
      }
    ) => {
      // Store original data for rollback
      const originalData = state.data;

      // Apply optimistic update immediately
      setState({
        data: optimisticData,
        isPending: true,
        error: null,
      });

      try {
        // Execute async operation
        const result = await asyncFn();

        // Update with real data
        setState({
          data: result,
          isPending: false,
          error: null,
        });

        if (options?.successMessage) {
          showToast({
            type: 'success',
            message: options.successMessage,
          });
        }

        options?.onSuccess?.(result);
      } catch (error) {
        // Rollback to original data on error
        setState({
          data: originalData,
          isPending: false,
          error: error as Error,
        });

        if (options?.errorMessage) {
          showToast({
            type: 'error',
            message: options.errorMessage,
          });
        }

        options?.onError?.(error as Error);
      }
    },
    [state.data, showToast]
  );

  const reset = useCallback(() => {
    setState({
      data: initialData,
      isPending: false,
      error: null,
    });
  }, [initialData]);

  return {
    data: state.data,
    isPending: state.isPending,
    error: state.error,
    update,
    reset,
  };
};