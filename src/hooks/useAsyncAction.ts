// =====================================================
// hooks/useAsyncAction.ts
// Generic hook for handling async actions with loading and toast feedback
// =====================================================

import { useCallback, useState } from 'react';
import { useToast } from '../components/ui/Toast';
import { LedgerError } from '../lib/app.types'; // Assuming LedgerError is in app.types

export const useAsyncAction = <TArgs extends any[], TResult = any>() => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const execute = useCallback(
    async (
      action: (...args: TArgs) => Promise<TResult>,
      options?: {
        successMessage?: string;
        errorMessage?: string;
        onSuccess?: (result: TResult) => void;
        onError?: (error: string) => void;
      },
      ...args: TArgs
    ): Promise<TResult | undefined> => {
      setLoading(true);
      setError(null);
      try {
        const result = await action(...args);
        if (options?.successMessage) {
          showToast({ type: 'success', message: options.successMessage });
        }
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const errorMessage = (err instanceof LedgerError || err instanceof Error)
          ? err.message
          : 'An unexpected error occurred';
        setError(errorMessage);
        if (options?.errorMessage) {
          showToast({ type: 'error', message: options.errorMessage });
        } else {
          showToast({ type: 'error', message: errorMessage });
        }
        options?.onError?.(errorMessage);
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  return {
    execute,
    loading,
    error,
  };
};
