// =====================================================
// pages/HomePage.tsx
// Landing page — for ANY group collecting money.
// Not "chama software." For friends, trips, rent, gifts, events, everything.
// =====================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DateService } from '../services/date.service';
import { FormatUtils } from '../utils/format.utils';
import type { Currency } from '../lib/types';

const USE_CASES = [
  { emoji: '🎂', label: 'Birthday gift' },
  { emoji: '🚗', label: 'Road trip' },
  { emoji: '🏠', label: 'House rent' },
  { emoji: '🏖', label: 'Airbnb weekend' },
  { emoji: '🎓', label: 'Graduation' },
  { emoji: '⚽', label: 'Football tournament' },
  { emoji: '🎮', label: 'Gaming event' },
  { emoji: '💼', label: 'Office farewell' },
  { emoji: '⛽', label: 'Fuel contribution' },
  { emoji: '💍', label: 'Wedding gift' },
  { emoji: '❤️', label: 'Funeral support' },
  { emoji: '🎉', label: 'Party tickets' },
  { emoji: '📚', label: 'Campus event' },
  { emoji: '👨‍👩‍👧', label: 'Family fundraiser' },
];

const FAMILIAR_QUOTES = [
  '"I already paid."',
  '"Who\'s collecting?"',
  '"Check above."',
  '"How much do we have?"',
  '"What\'s the till number?"',
  '"I\'ll send later."',
  '"Can you confirm mine?"',
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { rooms, removeRoom } = useLocalStorage();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleRemoveRoom = (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      window.confirm(
        'Remove this group from your phone?\n\nOthers can still open it with the link.'
      )
    ) {
      setDeletingId(roomId);
      setTimeout(() => {
        removeRoom(roomId);
        setDeletingId(null);
      }, 300);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased">
      {/* ─────────────────────────────────────────────────
          1. HERO — broad positioning, not chama-only
      ───────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-32 -right-24 w-[34rem] h-[34rem] bg-gradient-to-br from-emerald-100 via-teal-50 to-transparent rounded-full blur-3xl opacity-70" />
          <div className="absolute top-40 -left-32 w-[28rem] h-[28rem] bg-gradient-to-tr from-lime-100 via-emerald-50 to-transparent rounded-full blur-3xl opacity-60" />
        </div>

        <div className="max-w-6xl mx-auto px-4 pt-12 pb-16 sm:pt-16 sm:pb-20 relative">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: broad pain → shortcut */}
            <div className="text-left z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs sm:text-sm font-semibold mb-5">
                <span aria-hidden>🇰🇪</span>
                <span>For any group collecting money</span>
              </div>

              <h1 className="text-[2rem] sm:text-5xl lg:text-[3.5rem] font-extrabold text-slate-900 tracking-tight mb-4 sm:mb-5 leading-[1.08]">
                Collect money without the{' '}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  WhatsApp chaos
                </span>
                .
              </h1>

              <p className="text-base sm:text-lg text-slate-600 mb-6 sm:mb-8 leading-relaxed max-w-lg">
                Birthdays, trips, rent, events, gifts, welfare, chamas — if people are
                paying one person, everyone deserves one shared payment list.
              </p>

              {/* The one-liner that includes every use case */}
              <p className="text-sm sm:text-base font-semibold text-slate-900 mb-6 sm:mb-7 max-w-lg">
                If one person is collecting money, this is for you.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/create')}
                  className="shadow-xl shadow-emerald-200/60 hover:shadow-emerald-300/60 transition-all hover:-translate-y-0.5 text-base sm:text-lg px-7 sm:px-8 py-6"
                >
                  Get My Group Link →
                </Button>
                <button
                  onClick={() =>
                    document
                      .getElementById('collecting-for')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className="px-7 sm:px-8 py-6 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors text-base sm:text-lg"
                >
                  See use cases ↓
                </button>
              </div>
            </div>

            {/* Right: WhatsApp → Shared list transformation (trip-themed) */}
            <div className="relative z-10">
              {/* WhatsApp "before" card */}
              <div className="bg-[#075E54] rounded-2xl p-4 sm:p-5 shadow-xl mb-4 max-w-sm mx-auto lg:ml-auto lg:mr-0">
                <div className="text-white/90 text-xs font-semibold mb-3 px-1">
                  Weekend Trip · 11:47 PM
                </div>
                <div className="space-y-2">
                  <div className="bg-white rounded-lg rounded-tl-none px-3 py-2 text-sm text-slate-800 max-w-[85%]">
                    <span className="font-semibold text-emerald-700">Kevin:</span> Nililipa jana.
                  </div>
                  <div className="bg-white rounded-lg rounded-tl-none px-3 py-2 text-sm text-slate-800 max-w-[85%] ml-auto">
                    <span className="font-semibold text-emerald-700">Brian:</span> Check hapo juu.
                  </div>
                  <div className="bg-white rounded-lg rounded-tl-none px-3 py-2 text-sm text-slate-800 max-w-[85%]">
                    <span className="font-semibold text-emerald-700">Aisha:</span> Ni nani hajalipa?
                  </div>
                  <div className="bg-white rounded-lg rounded-tl-none px-3 py-2 text-sm text-slate-800 max-w-[85%] ml-auto">
                    <span className="font-semibold text-emerald-700">Organizer:</span> 😩
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-emerald-600 text-xl font-bold animate-bounce">
                  ↓
                </div>
              </div>

              {/* Shared list "after" card — trip themed */}
              <div className="bg-white rounded-2xl shadow-xl max-w-sm mx-auto lg:ml-auto lg:mr-0 overflow-hidden">
                <div className="bg-gradient-to-br from-emerald-600 to-teal-600 px-5 py-4 text-white">
                  <div className="text-xs opacity-80">Weekend Trip</div>
                  <div className="font-bold text-lg">Total: KES 18,500</div>
                </div>
                <div className="p-4 space-y-2.5">
                  <div className="flex justify-between items-center py-2 px-3 bg-emerald-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-800">✓ Kevin</span>
                    <span className="text-sm font-bold text-emerald-600">KES 1,500</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 bg-emerald-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-800">✓ Brian</span>
                    <span className="text-sm font-bold text-emerald-600">KES 3,000</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 bg-emerald-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-800">✓ Aisha</span>
                    <span className="text-sm font-bold text-emerald-600">KES 2,000</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-lg opacity-70">
                    <span className="text-sm font-medium text-slate-500">○ Joy</span>
                    <span className="text-sm font-bold text-slate-400">Pending</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────
          2. "COLLECTING FOR..." — use-case grid (modern cards)
      ───────────────────────────────────────────────── */}
      <div id="collecting-for" className="bg-slate-50 py-16 sm:py-20 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              Collecting money for...?
            </h2>
            <p className="text-slate-500 text-sm sm:text-base">
              If one person is collecting, there's a link for that.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {USE_CASES.map((uc, i) => (
              <div
                key={i}
                className="group bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-emerald-200 transition-all duration-200 cursor-default"
              >
                <div className="text-3xl sm:text-4xl mb-2 group-hover:scale-110 transition-transform duration-200">
                  {uc.emoji}
                </div>
                <div className="text-sm sm:text-base font-semibold text-slate-700">
                  {uc.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────
          3. "EVERY GROUP" — emotional mirror (broader)
      ───────────────────────────────────────────────── */}
      <div className="bg-white py-16 sm:py-20 border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-3">
            Every group has one person saying...
          </h2>
          <p className="text-center text-slate-500 mb-10 text-sm sm:text-base">
            You've been in this chat. We all have.
          </p>
          <div className="space-y-3 sm:space-y-4 mb-10">
            {FAMILIAR_QUOTES.map((quote, i) => (
              <div
                key={i}
                className="flex items-center gap-3 sm:gap-4 bg-slate-50 rounded-xl px-4 sm:px-5 py-3.5 border border-slate-100"
              >
                <span className="text-lg sm:text-xl text-slate-400 flex-shrink-0">💬</span>
                <span className="text-base sm:text-lg text-slate-700 font-medium italic">
                  {quote}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-3 sm:gap-4 bg-slate-50 rounded-xl px-4 sm:px-5 py-3.5 border border-slate-100">
              <span className="text-lg sm:text-xl text-slate-400 flex-shrink-0">😩</span>
              <span className="text-base sm:text-lg text-slate-700 font-medium">
                &mdash; the organizer
              </span>
            </div>
          </div>
          <p className="text-center text-xl sm:text-2xl font-bold text-slate-900">
            Every group eventually becomes a payment group.
          </p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────
          4. HOW IT WORKS — paste-don't-type is the star
      ───────────────────────────────────────────────── */}
      <div id="how-it-works" className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              It takes less than a minute
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              No app download. No sign-up for your members.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 relative">
            <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-emerald-200 via-emerald-300 to-emerald-200 z-0" />

            <div className="relative z-10 text-center">
              <div className="w-20 h-20 bg-white border-4 border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
                <span className="text-3xl">💸</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                1. Collect as usual
              </h3>
              <p className="text-sm text-slate-500 px-2 sm:px-4">
                People send to your M-Pesa or Airtel Money. Nothing changes for them.
              </p>
            </div>

            <div className="relative z-10 text-center">
              <div className="w-20 h-20 bg-white border-4 border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg ring-4 ring-emerald-100/50">
                <span className="text-3xl">📋</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                2. Don't type — paste
              </h3>
              <p className="text-sm text-slate-500 px-2 sm:px-4">
                Copy the M-Pesa SMS, paste it here. We pull out the name, amount, and
                transaction code automatically.
              </p>
            </div>

            <div className="relative z-10 text-center">
              <div className="w-20 h-20 bg-white border-4 border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
                <span className="text-3xl">🔗</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                3. Send the link
              </h3>
              <p className="text-sm text-slate-500 px-2 sm:px-4">
                Share to the group chat. Everyone sees the updated list — no more DMs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────
          5. HISTORY (only if user has saved rooms)
      ───────────────────────────────────────────────── */}
      {rooms.length > 0 && (
        <div className="bg-white py-10 sm:py-12 border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-5 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">Your groups</h2>
              <span className="text-xs sm:text-sm text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                Saved on this phone
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {rooms.map((room) => (
                <div
                  key={room.roomId}
                  onClick={() => navigate(`/room/${room.organizerToken}`)}
                  className={`
                    group relative bg-white rounded-xl p-5 border border-slate-200 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer
                    ${deletingId === room.roomId ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
                  `}
                >
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant={room.status === 'active' ? 'success' : 'neutral'}>
                      {room.status}
                    </Badge>
                    <button
                      onClick={(e) => handleRemoveRoom(room.roomId, e)}
                      className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                      title="Remove from this phone"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-1 truncate">
                    {room.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 h-10 mb-4">
                    {room.description || 'No description'}
                  </p>
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                        Target
                      </p>
                      <p className="font-mono font-medium text-slate-700">
                        {room.targetAmount
                          ? FormatUtils.formatCurrency(
                              room.targetAmount,
                              (room.currency as Currency) || 'KES'
                            )
                          : 'No limit'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                        Last opened
                      </p>
                      <p className="text-xs text-slate-600">
                        {DateService.formatDate(room.lastAccessed, 'relative')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────
          6. FINAL CTA — coordination, not "treasurer"
      ───────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 py-16 sm:py-20 text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden>
          <div className="absolute -top-20 left-1/4 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute -bottom-20 right-1/4 w-72 h-72 bg-lime-200 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4 sm:mb-5 tracking-tight">
            Spend less time tracking payments.
          </h2>
          <p className="text-emerald-50 text-base sm:text-lg mb-8 max-w-xl mx-auto">
            More time enjoying the event. One link. Zero confusion.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate('/create')}
            className="bg-white text-emerald-700 hover:bg-emerald-50 text-lg px-10 py-4 shadow-2xl shadow-emerald-900/30"
          >
            Get My Group Link →
          </Button>
          <p className="mt-4 text-sm text-emerald-100/80">
            Free to use · No sign-up · Ready in 60 seconds
          </p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────
          FOOTER
      ───────────────────────────────────────────────── */}
      <footer className="bg-white py-10 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <div className="font-bold text-slate-900 text-lg mb-0.5">
              EasyCollect 💚
            </div>
            <p className="text-sm text-slate-500">
              The easiest way to track group contributions.
            </p>
          </div>
          <div className="flex gap-5 text-sm text-slate-500">
            <a href="#" className="hover:text-emerald-600 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-emerald-600 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-emerald-600 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
