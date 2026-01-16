// =====================================================
// components/ui/LoadingOverlay.tsx
// Full-screen loading overlay
// =====================================================

import { Spinner } from "./Spinner";

export interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Loading...',
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-white bg-opacity-90 flex items-center justify-center">
      <div className="text-center">
        <Spinner size="xl" />
        <p className="mt-4 text-lg text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );
};