// =====================================================
// pages/HomePage.tsx
// Landing page - Trust-first, Kenyan, Simple
// =====================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DateService } from '../services/date.service';
import { FormatUtils } from '../utils/format.utils';
import type { Currency } from '../lib/types';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { rooms, removeRoom } = useLocalStorage();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const handleRemoveRoom = (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Remove this room from history? (The room will still exist on the server)')) {
      setDeletingId(roomId);
      setTimeout(() => {
        removeRoom(roomId);
        setDeletingId(null);
      }, 300);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-16 sm:py-20">
          <div className="text-center">
            {/* Logo/Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-green-50 rounded-2xl">
              <span className="text-5xl">💚</span>
            </div>

            {/* App Name */}
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
              Chama Ledger
            </h1>
            <p className="text-lg text-gray-500 mb-8">
              A simple contribution tracker
            </p>

            {/* Main Headline */}
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 max-w-3xl mx-auto leading-tight">
              The easiest way to manage your Chama or committee
            </h2>

            {/* Subheadline */}
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Stop scrolling through WhatsApp to check M-Pesa messages. Share one link and let everyone see the progress.
            </p>

            {/* Trust Line - VERY VISIBLE */}
            <div className="inline-flex items-center gap-2 bg-green-50 border-2 border-green-200 px-6 py-3 rounded-full mb-8">
              <span className="text-2xl">🛡️</span>
              <p className="text-base font-semibold text-green-900">
                Your money stays in M-Pesa. We do not hold money or ask for PINs.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={() => navigate('/create')}
                className="min-w-[200px] shadow-lg"
              >
                Create a Group (Free)
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => setShowHowItWorks(!showHowItWorks)}
                className="min-w-[200px]"
              >
                See How It Works
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Banner */}
      <div className="bg-green-50 border-y border-green-100">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-3">
            <span className="text-xl">🛡️</span>
            <p className="text-sm sm:text-base text-green-900 font-medium text-center">
              Transparency tool, not a bank. We only track contributions — payments stay with M-Pesa or your bank.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How it works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <Card className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💸</span>
              </div>
              <div className="text-4xl font-bold text-green-600 mb-2">1</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                People pay as usual
              </h3>
              <p className="text-gray-600">
                Members send money via M-Pesa or bank — nothing changes.
              </p>
            </Card>

            {/* Step 2 */}
            <Card className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📝</span>
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-2">2</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Treasurer records payments
              </h3>
              <p className="text-gray-600">
                Copy & paste M-Pesa messages or enter amounts manually.
              </p>
            </Card>

            {/* Step 3 */}
            <Card className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👀</span>
              </div>
              <div className="text-4xl font-bold text-purple-600 mb-2">3</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Everyone sees the same progress
              </h3>
              <p className="text-gray-600">
                One shared link shows who has paid and who hasn't.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Visual Infographic */}
      <div className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            From WhatsApp chaos to clarity
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Before */}
            <div className="text-center">
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-4 min-h-[200px] flex items-center justify-center">
                <div className="space-y-2 text-left w-full">
                  <div className="bg-white p-3 rounded-lg shadow-sm text-xs">
                    <p className="text-gray-500">John: I sent 500</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm text-xs">
                    <p className="text-gray-500">Mary: Did you get mine?</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm text-xs">
                    <p className="text-gray-500">Peter: Who sent this 500?</p>
                  </div>
                  <p className="text-4xl text-center">😵</p>
                </div>
              </div>
              <p className="text-lg font-semibold text-gray-900">The Problem</p>
              <p className="text-sm text-gray-600">"Who sent this 500?"</p>
            </div>

            {/* Action */}
            <div className="text-center">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-4 min-h-[200px] flex flex-col items-center justify-center">
                <div className="w-full bg-white rounded-lg p-4 mb-3 shadow-sm">
                  <p className="text-xs text-gray-500 mb-2">Paste M-Pesa SMS:</p>
                  <p className="text-xs font-mono bg-gray-100 p-2 rounded">
                    RGH7K2L9XM Confirmed...
                  </p>
                </div>
                <div className="text-3xl">⬇️</div>
                <div className="w-full bg-green-50 rounded-lg p-3 mt-3">
                  <p className="text-xs font-semibold">✓ John Kamau - KSh 5,000</p>
                </div>
              </div>
              <p className="text-lg font-semibold text-gray-900">The Action</p>
              <p className="text-sm text-gray-600">Paste M-Pesa messages. Chama Ledger fills the details.</p>
            </div>

            {/* After */}
            <div className="text-center">
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-4 min-h-[200px] flex flex-col items-center justify-center">
                <div className="w-full">
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Goal Progress</p>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div className="bg-green-600 h-4 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">75% complete</p>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>✓ John</span>
                      <span className="font-semibold">KSh 5,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>✓ Mary</span>
                      <span className="font-semibold">KSh 5,000</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>⏳ Peter</span>
                      <span>Pending</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-lg font-semibold text-gray-900">The Result</p>
              <p className="text-sm text-gray-600">Everyone sees progress instantly.</p>
            </div>
          </div>
        </div>
      </div>

      {/* What This App Is NOT */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            What Chama Ledger does NOT do
          </h2>

          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <div className="flex items-start gap-3 bg-white p-4 rounded-lg border border-gray-200">
              <span className="text-2xl">❌</span>
              <div>
                <p className="font-semibold text-gray-900">We do not hold money</p>
                <p className="text-sm text-gray-600">Payments stay with M-Pesa/banks</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-4 rounded-lg border border-gray-200">
              <span className="text-2xl">❌</span>
              <div>
                <p className="font-semibold text-gray-900">We do not access M-Pesa</p>
                <p className="text-sm text-gray-600">No connection to your account</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-4 rounded-lg border border-gray-200">
              <span className="text-2xl">❌</span>
              <div>
                <p className="font-semibold text-gray-900">We do not read your SMS</p>
                <p className="text-sm text-gray-600">You copy & paste manually</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-4 rounded-lg border border-gray-200">
              <span className="text-2xl">❌</span>
              <div>
                <p className="font-semibold text-gray-900">We do not need logins</p>
                <p className="text-sm text-gray-600">No passwords or accounts</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border-2 border-green-200 p-6 rounded-xl text-center">
            <p className="text-xl font-semibold text-green-900">
              ✅ We only show what the treasurer records — transparently.
            </p>
          </div>
        </div>
      </div>

      {/* Who It's For */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Built for everyday groups
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
            <div className="p-4">
              <div className="text-4xl mb-2">👥</div>
              <p className="text-sm font-semibold text-gray-700">Chamas</p>
            </div>
            <div className="p-4">
              <div className="text-4xl mb-2">💒</div>
              <p className="text-sm font-semibold text-gray-700">Wedding committees</p>
            </div>
            <div className="p-4">
              <div className="text-4xl mb-2">🕊️</div>
              <p className="text-sm font-semibold text-gray-700">Funeral fundraisers</p>
            </div>
            <div className="p-4">
              <div className="text-4xl mb-2">🏢</div>
              <p className="text-sm font-semibold text-gray-700">Office collections</p>
            </div>
            <div className="p-4">
              <div className="text-4xl mb-2">🤝</div>
              <p className="text-sm font-semibold text-gray-700">Friends pooling</p>
            </div>
          </div>

          <p className="text-xl text-gray-600">
            If your group uses WhatsApp to collect money, this is for you.
          </p>
        </div>
      </div>

      {/* Social Proof */}
      <div className="bg-green-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-lg text-green-900 font-medium">
            Used by small groups across Kenya to track contributions clearly.
          </p>
        </div>
      </div>

      {/* Your Rooms (if any) */}
      {rooms.length > 0 && (
        <div className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Your Active Rooms
              </h2>
              <p className="text-gray-600">
                Resume managing your contribution rooms
              </p>
            </div>

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

                  <div className="flex items-center justify-between">
                    <Badge variant={room.status === 'active' ? 'success' : 'neutral'}>
                      {room.status}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {DateService.formatDate(room.lastAccessed, 'relative')}
                    </span>
                  </div>

                  {room.targetAmount && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500">Target</p>
                      <p className="text-lg font-bold text-gray-900">
                        {FormatUtils.formatCurrency(room.targetAmount, (room.currency as Currency) || 'KES')}
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Final CTA */}
      <div className="bg-green-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Start tracking contributions in under 1 minute
          </h2>
          <p className="text-xl text-green-100 mb-8">
            No signup. No downloads.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate('/create')}
            className="text-green-700 font-bold min-w-[250px] shadow-xl"
          >
            Create a Group
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-3">🛡️ Trust & Safety</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Payments stay with M-Pesa & banks</li>
                <li>• We never ask for PINs</li>
                <li>• No access to your accounts</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-3">💚 Chama Ledger</h3>
              <p className="text-sm text-gray-400">
                A shared link that shows who has paid — nothing more.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-3">🇰🇪 Built in Kenya</h3>
              <p className="text-sm text-gray-400">
                Made for Kenyan communities, with love.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-sm text-gray-500">
              © 2025 Chama Ledger. Simple contribution tracking for everyday groups.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};