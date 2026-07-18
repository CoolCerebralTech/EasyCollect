// =====================================================
// pages/HomePage.tsx
// Landing page — pain-first, Kenyan, no jargon.
// Sells the end of "Nani amelipa?" — not a "ledger".
// =====================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
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
          1. HERO — Pain first. Swahili hook. No jargon.
      ───────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 relative overflow-hidden">
        {/* Soft gradient mesh */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-32 -right-24 w-[34rem] h-[34rem] bg-gradient-to-br from-emerald-100 via-teal-50 to-transparent rounded-full blur-3xl opacity-70" />
          <div className="absolute top-40 -left-32 w-[28rem] h-[28rem] bg-gradient-to-tr from-lime-100 via-emerald-50 to-transparent rounded-full blur-3xl opacity-60" />
        </div>

        <div className="max-w-6xl mx-auto px-4 pt-12 pb-16 sm:pt-16 sm:pb-20 relative">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: pain → shortcut */}
            <div className="text-left z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs sm:text-sm font-semibold mb-5">
                <span aria-hidden>🇰🇪</span>
                <span>For Chamas, Harambees & Committee Funds</span>
              </div>

              <h1 className="text-[2rem] sm:text-5xl lg:text-[3.5rem] font-extrabold text-slate-900 tracking-tight mb-4 sm:mb-5 leading-[1.08]">
                Stop answering{' '}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  &ldquo;Nani amelipa?&rdquo;
                </span>{' '}
                every day.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 mb-7 sm:mb-8 leading-relaxed max-w-lg">
                Every payment shows up on one shared list. No more scrolling through
                200+ WhatsApp messages. No more <em>&ldquo;I paid yesterday.&rdquo;</em> Just
                send one link to the group.
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
                      .getElementById('how-it-works')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className="px-7 sm:px-8 py-6 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors text-base sm:text-lg"
                >
                  See how it works ↓
                </button>
              </div>
            </div>

            {/* Right: WhatsApp → Shared list transformation */}
            <div className="relative z-10">
              {/* WhatsApp "before" card */}
              <div className="bg-[#075E54] rounded-2xl p-4 sm:p-5 shadow-xl mb-4 max-w-sm mx-auto lg:ml-auto lg:mr-0">
                <div className="text-white/90 text-xs font-semibold mb-3 px-1">
                  WhatsApp group · 11:47 PM
                </div>
                <div className="space-y-2">
                  <div className="bg-white rounded-lg rounded-tl-none px-3 py-2 text-sm text-slate-800 max-w-[85%]">
                    <span className="font-semibold text-emerald-700">John:</span> Nililipa jana.
                  </div>
                  <div className="bg-white rounded-lg rounded-tl-none px-3 py-2 text-sm text-slate-800 max-w-[85%] ml-auto">
                    <span className="font-semibold text-emerald-700">Mary:</span> Check hapo juu.
                  </div>
                  <div className="bg-white rounded-lg rounded-tl-none px-3 py-2 text-sm text-slate-800 max-w-[85%]">
                    <span className="font-semibold text-emerald-700">Brian:</span> Ni nani hajalipa?
                  </div>
                  <div className="bg-white rounded-lg rounded-tl-none px-3 py-2 text-sm text-slate-800 max-w-[85%] ml-auto">
                    <span className="font-semibold text-emerald-700">Treasurer:</span> 😩
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-emerald-600 text-xl font-bold animate-bounce">
                  ↓
                </div>
              </div>

              {/* Shared list "after" card */}
              <div className="bg-white rounded-2xl shadow-xl max-w-sm mx-auto lg:ml-auto lg:mr-0 overflow-hidden">
                <div className="bg-gradient-to-br from-emerald-600 to-teal-600 px-5 py-4 text-white">
                  <div className="text-xs opacity-80">Our Chama</div>
                  <div className="font-bold text-lg">Total: KES 42,000</div>
                </div>
                <div className="p-4 space-y-2.5">
                  <div className="flex justify-between items-center py-2 px-3 bg-emerald-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-800">✓ John</span>
                    <span className="text-sm font-bold text-emerald-600">KES 2,000</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 bg-emerald-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-800">✓ Mary</span>
                    <span className="text-sm font-bold text-emerald-600">KES 5,000</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-lg opacity-70">
                    <span className="text-sm font-medium text-slate-500">○ Brian</span>
                    <span className="text-sm font-bold text-slate-400">Pending</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────
          2. "BUILT FOR" — instant identity match
      ───────────────────────────────────────────────── */}
      <div className="bg-slate-50 py-10 sm:py-12 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-5">
            Built for
          </h2>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2.5 text-base sm:text-lg font-medium text-slate-700">
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-500">✓</span> Chamas
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-500">✓</span> Harambees
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-500">✓</span> Welfare groups
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-500">✓</span> Merry-go-rounds
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-500">✓</span> SACCO committees
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-500">✓</span> Church contributions
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-500">✓</span> School class funds
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-500">✓</span> Family fundraisers
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────
          3. "SOUNDS FAMILIAR?" — emotional mirror
      ───────────────────────────────────────────────── */}
      <div className="bg-white py-16 sm:py-20 border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-3">
            Sounds familiar?
          </h2>
          <p className="text-center text-slate-500 mb-10 text-sm sm:text-base">
            Every Kenyan in a chama has lived this.
          </p>
          <div className="space-y-4 mb-10">
            {[
              '"Who hasn\'t paid?"',
              '"I already sent yesterday."',
              '"Check above."',
              '"How much do we have now?"',
              '"Please resend the till number."',
              '"Can someone confirm my payment?"',
            ].map((quote, i) => (
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
          </div>
          <p className="text-center text-lg sm:text-xl font-semibold text-slate-900">
            That's exactly why we built this.
          </p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────
          4. HOW IT WORKS — paste-don't-type is the hero
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
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-emerald-200 via-emerald-300 to-emerald-200 z-0" />

            {/* Step 1 */}
            <div className="relative z-10 text-center">
              <div className="w-20 h-20 bg-white border-4 border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
                <span className="text-3xl">💸</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                1. Collect as usual
              </h3>
              <p className="text-sm text-slate-500 px-2 sm:px-4">
                Members send to your M-Pesa or Airtel Money. Nothing changes for them.
              </p>
            </div>

            {/* Step 2 — the killer feature */}
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

            {/* Step 3 */}
            <div className="relative z-10 text-center">
              <div className="w-20 h-20 bg-white border-4 border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
                <span className="text-3xl">🔗</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                3. Send the link
              </h3>
              <p className="text-sm text-slate-500 px-2 sm:px-4">
                Share to the WhatsApp group. Everyone sees the updated list — no more DMs.
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
          6. FINAL CTA — identity transformation
      ───────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 py-16 sm:py-20 text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden>
          <div className="absolute -top-20 left-1/4 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute -bottom-20 right-1/4 w-72 h-72 bg-lime-200 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4 sm:mb-5 tracking-tight">
            Be the treasurer everyone trusts.
          </h2>
          <p className="text-emerald-50 text-base sm:text-lg mb-8 max-w-xl mx-auto">
            Spend less time chasing payments and more time running your group.
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
              The Ledger 💚
            </div>
            <p className="text-sm text-slate-500">
              Built for Kenyan groups tired of scrolling.
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
