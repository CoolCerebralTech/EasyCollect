// =====================================================
// components/features/OfflineIndicator.tsx
// Shows when user is offline with queue status
// =====================================================

import { useOfflineQueue } from '../../hooks/useOfflineQueue';
import { Alert } from '../ui/Alert';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, queueSize, isProcessing } = useOfflineQueue();

  if (isOnline && queueSize === 0) {
    return null;
  }

  if (!isOnline) {
    return (
      <Alert type="warning" className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <strong>You're offline</strong>
            <p className="text-sm mt-1">
              Changes will be saved and synced when you're back online.
            </p>
          </div>
          <div className="text-2xl">📡</div>
        </div>
      </Alert>
    );
  }

  if (queueSize > 0) {
    return (
      <Alert type="info" className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <strong>Syncing changes...</strong>
            <p className="text-sm mt-1">
              {queueSize} pending operation{queueSize !== 1 ? 's' : ''}
            </p>
          </div>
          {isProcessing && (
            <svg className="animate-spin w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
        </div>
      </Alert>
    );
  }

  return null;
};