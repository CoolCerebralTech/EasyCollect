// =====================================================
// components/features/PINGate.tsx
// PIN authentication gate for organizer access
// =====================================================

import React, { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Alert } from '../ui/Alert';
import { usePINGate } from '../../hooks/usePINGate';

export interface PINGateProps {
  token: string;
  onAuthenticated: () => void;
}

export const PINGate: React.FC<PINGateProps> = ({ token, onAuthenticated }) => {
  const [pin, setPin] = useState('');
  const {
    isAuthenticated,
    isLocked,
    remainingAttempts,
    lockoutTime,
    validating,
    error,
    validatePIN,
  } = usePINGate(token);

  useEffect(() => {
    if (isAuthenticated) {
      onAuthenticated();
    }
  }, [isAuthenticated, onAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await validatePIN(pin);
  };

  if (isLocked && lockoutTime) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Account Locked
            </h2>
            <p className="text-gray-600 mb-6">
              Too many incorrect PIN attempts. Please try again in {lockoutTime} seconds.
            </p>
            <Alert type="error">
              For security reasons, access has been temporarily restricted.
            </Alert>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="inline-block p-4 bg-orange-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Organizer Access
          </h2>
          <p className="text-gray-600">
            Enter your 4-6 digit PIN to manage this room
          </p>
        </div>

        {error && (
          <Alert type="error" className="mb-4">
            {error}
          </Alert>
        )}

        {remainingAttempts < 5 && !error && (
          <Alert type="warning" className="mb-4">
            {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter PIN"
            className="text-center text-2xl tracking-widest"
            autoFocus
          />

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={validating}
            disabled={pin.length < 4 || pin.length > 6}
          >
            Unlock
          </Button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            🔐 Your PIN is encrypted and never stored in plain text
          </p>
        </div>
      </Card>
    </div>
  );
};
