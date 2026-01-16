// =====================================================
// pages/HomePage.tsx
// Landing page with room history
// =====================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DateService } from '../services/date.service';
import { FormatUtils } from '../utils/format.utils';
import type { Currency } from '../lib/types';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { rooms, removeRoom } = useLocalStorage();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleRemoveRoom = (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Using window.confirm is simple and robust
    if (window.confirm('Remove this room from history? (The room will still exist on the server)')) {
      setDeletingId(roomId);
      setTimeout(() => {
        removeRoom(roomId);
        setDeletingId(null);
      }, 300);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center animate-fade-in-up">
            <div className="text-6xl mb-6 filter drop-shadow-md">💚</div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
              The Ledger
            </h1>
            <p className="text-xl sm:text-2xl text-green-100 mb-8 max-w-2xl mx-auto font-light">
              Track contributions for Chamas, Harambees, and community groups with trust and transparency.
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate('/create')}
              className="text-green-700 font-bold shadow-xl hover:scale-105 transition-transform"
            >
              Create New Room
            </Button>
          </div>
        </div>
      </div>

      {/* Rooms Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your Active Rooms
          </h2>
          <p className="text-gray-600">
            Resume managing your contribution rooms
          </p>
        </div>

        {rooms.length === 0 ? (
          <Card>
            <EmptyState
              icon={
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              }
              title="No rooms yet"
              description="Create your first contribution room to get started"
              action={
                <Button onClick={() => navigate('/create')}>
                  Create Your First Room
                </Button>
              }
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <Card
                key={room.roomId}
                hover
                className={`cursor-pointer transition-all duration-300 relative group ${
                  deletingId === room.roomId ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                }`}
                onClick={() => navigate(`/room/${room.stewardToken}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 pr-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 leading-snug">
                      {FormatUtils.truncate(room.title, 50)}
                    </h3>
                    {room.description && (
                      <p className="text-sm text-gray-600">
                        {FormatUtils.truncate(room.description, 80)}
                      </p>
                    )}
                  </div>
                  
                  <button
                    onClick={(e) => handleRemoveRoom(room.roomId, e)}
                    className="absolute top-4 right-4 p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                    title="Remove from history"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <Badge variant={room.status === 'active' ? 'success' : 'neutral'}>
                    {room.status}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {DateService.formatDate(room.lastAccessed, 'relative')}
                  </span>
                </div>

                {room.targetAmount && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Target</p>
                    <p className="text-lg font-bold text-gray-900">
                      {FormatUtils.formatCurrency(
                        room.targetAmount, 
                        (room.currency as Currency) || 'KES' // Cast here to fix TS error
                      )}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose The Ledger?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl hover:bg-green-50 transition-colors">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Secure & Private
              </h3>
              <p className="text-gray-600">
                No accounts needed. Access controlled by secure tokens and PINs.
              </p>
            </div>
            <div className="text-center p-6 rounded-xl hover:bg-green-50 transition-colors">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Smart Features
              </h3>
              <p className="text-gray-600">
                Smart M-Pesa confirmation workflow, WhatsApp reminders, and visual tracking.
              </p>
            </div>
            <div className="text-center p-6 rounded-xl hover:bg-green-50 transition-colors">
              <div className="text-5xl mb-4">📱</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Mobile First
              </h3>
              <p className="text-gray-600">
                Designed for phones. Works perfectly on any device, anywhere.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};