// =====================================================
// pages/HomePage.tsx
// Landing — thumb-stopping, modern, visual proof.
// Overlapping WhatsApp chaos → clean dashboard reveal.
// Bento use-case grid. iOS notification pain section.
// Phone mockup how-it-works with paste visual.
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
    if (window.confirm('Remove this group from your phone?\n\nOthers can still open it with the link.')) {
      setDeletingId(roomId);
      setTimeout(() => { removeRoom(roomId); setDeletingId(null); }, 300);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased text-slate-900">
      {/* ═══════════════════════════════════════════════════
          1. HERO — overlapping WhatsApp chaos → clean dashboard
      ═══════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-white border-b border-slate-100">
        {/* Soft gradient mesh */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-40 -right-32 w-[40rem] h-[40rem] bg-gradient-to-br from-emerald-100 via-teal-50 to-transparent rounded-full blur-3xl opacity-80" />
          <div className="absolute top-60 -left-40 w-[32rem] h-[32rem] bg-gradient-to-tr from-lime-100 via-emerald-50 to-transparent rounded-full blur-3xl opacity-60" />
        </div>

        <div className="max-w-6xl mx-auto px-4 pt-10 pb-16 sm:pt-14 sm:pb-20 relative">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
            {/* Left: headline + CTA */}
            <div className="text-left z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs sm:text-sm font-semibold mb-5">
                <span aria-hidden>🇰🇪</span>
                <span>For any group collecting money</span>
              </div>

              <h1 className="text-[2.1rem] leading-[1.1] sm:text-5xl lg:text-[3.6rem] font-extrabold tracking-tight mb-4 sm:mb-6">
                Collect money without the{' '}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                    WhatsApp chaos
                  </span>
                  {/* Hand-drawn underline accent */}
                  <svg className="absolute -bottom-1 left-0 w-full" height="8" viewBox="0 0 200 8" preserveAspectRatio="none" aria-hidden>
                    <path d="M2 5 Q 50 1 100 5 T 198 3" stroke="#10b981" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.5" />
                  </svg>
                </span>
                .
              </h1>

              <p className="text-base sm:text-lg text-slate-600 mb-5 sm:mb-6 leading-relaxed max-w-lg">
                Birthdays, trips, rent, events, gifts, welfare, chamas — if people are paying
                one person, everyone deserves one shared payment list.
              </p>

              <p className="text-sm sm:text-base font-bold text-slate-900 mb-6 sm:mb-8 max-w-lg">
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
                  onClick={() => document.getElementById('collecting-for')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-7 sm:px-8 py-6 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors text-base sm:text-lg"
                >
                  See use cases ↓
                </button>
              </div>
            </div>

            {/* Right: overlapping WhatsApp chaos bubbles → clean dashboard */}
            <div className="relative z-10 h-[420px] sm:h-[480px] lg:h-[500px]">
              {/* Chaos bubbles — overlapping, slightly rotated, popping in */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                <div className="animate-bubblePop" style={{ animationDelay: '0s' }}>
                  <div className="bg-white rounded-2xl rounded-tl-sm shadow-lg px-4 py-2.5 text-sm text-slate-800 max-w-[80%] border border-slate-100 -rotate-2">
                    <span className="font-semibold text-emerald-700">Kevin:</span> Nililipa jana 📱
                  </div>
                </div>
                <div className="animate-bubblePop ml-12 sm:ml-20" style={{ animationDelay: '0.15s' }}>
                  <div className="bg-white rounded-2xl rounded-tr-sm shadow-lg px-4 py-2.5 text-sm text-slate-800 max-w-[80%] border border-slate-100 rotate-1">
                    <span className="font-semibold text-emerald-700">Brian:</span> Check hapo juu 👆
                  </div>
                </div>
                <div className="animate-bubblePop -mr-8 sm:-mr-4" style={{ animationDelay: '0.3s' }}>
                  <div className="bg-white rounded-2xl rounded-tl-sm shadow-lg px-4 py-2.5 text-sm text-slate-800 max-w-[80%] border border-slate-100 -rotate-1">
                    <span className="font-semibold text-emerald-700">Aisha:</span> Ni nani hajalipa? 🤔
                  </div>
                </div>
                <div className="animate-bubblePop ml-16 sm:ml-24" style={{ animationDelay: '0.45s' }}>
                  <div className="bg-white rounded-2xl rounded-tr-sm shadow-lg px-4 py-2.5 text-sm text-slate-800 max-w-[80%] border border-slate-100 rotate-2">
                    <span className="font-semibold text-emerald-700">Joy:</span> What's the till number? 📲
                  </div>
                </div>
                <div className="animate-bubblePop" style={{ animationDelay: '0.6s' }}>
                  <div className="bg-white rounded-2xl rounded-tl-sm shadow-lg px-4 py-3 text-base text-slate-800 max-w-[80%] border border-slate-100 -rotate-2">
                    <span className="font-semibold text-emerald-700">Organizer:</span> 😩
                  </div>
                </div>

                {/* Arrow */}
                <div className="animate-bubblePop mt-1" style={{ animationDelay: '0.8s' }}>
                  <div className="w-9 h-9 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-emerald-600 text-lg font-bold">
                    ↓
                  </div>
                </div>
              </div>

              {/* Clean dashboard card — revealed below */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-xs animate-bubblePop" style={{ animationDelay: '1s' }}>
                <div className="bg-white rounded-2xl shadow-2xl shadow-emerald-900/10 overflow-hidden border border-slate-100">
                  <div className="bg-gradient-to-br from-emerald-600 to-teal-600 px-5 py-3.5 text-white">
                    <div className="text-xs opacity-80">Weekend Trip</div>
                    <div className="font-bold text-lg">Total: KES 18,500</div>
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex justify-between items-center py-1.5 px-3 bg-emerald-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-800">✓ Kevin</span>
                      <span className="text-sm font-bold text-emerald-600">KES 1,500</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 px-3 bg-emerald-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-800">✓ Brian</span>
                      <span className="text-sm font-bold text-emerald-600">KES 3,000</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 px-3 bg-slate-50 rounded-lg opacity-70">
                      <span className="text-sm font-medium text-slate-500">○ Joy</span>
                      <span className="text-sm font-bold text-slate-400">Pending</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          2. BENTO GRID — crypto-dashboard style, large→small
      ═══════════════════════════════════════════════════ */}
      <div id="collecting-for" className="py-16 sm:py-24 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
              Collecting money for...?
            </h2>
            <p className="text-slate-500 text-sm sm:text-base">
              If one person is collecting, there's a link for that.
            </p>
          </div>

          {/* Tier 1: Two large feature cards (3+3 cols) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
            {/* Road trips — hero gradient */}
            <div className="group relative h-48 sm:h-56 rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 p-6 sm:p-8 shadow-lg shadow-emerald-200/40 hover:shadow-xl hover:shadow-emerald-300/40 hover:-translate-y-1 transition-all duration-300 cursor-default">
              <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur text-white text-[10px] font-bold tracking-wide opacity-80">POPULAR</div>
              <div className="text-5xl sm:text-6xl mb-auto group-hover:scale-110 transition-transform duration-300">🚗</div>
              <div className="mt-4">
                <div className="text-xl sm:text-2xl font-bold text-white">Road trips</div>
                <div className="text-sm text-emerald-50/80 mt-1">Fuel, Airbnb, food — one link for everyone</div>
              </div>
            </div>

            {/* Weddings — hero warm gradient */}
            <div className="group relative h-48 sm:h-56 rounded-3xl overflow-hidden bg-gradient-to-br from-amber-400 to-orange-500 p-6 sm:p-8 shadow-lg shadow-amber-200/40 hover:shadow-xl hover:shadow-amber-300/40 hover:-translate-y-1 transition-all duration-300 cursor-default">
              <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur text-white text-[10px] font-bold tracking-wide opacity-80">POPULAR</div>
              <div className="text-5xl sm:text-6xl mb-auto group-hover:scale-110 transition-transform duration-300">💍</div>
              <div className="mt-4">
                <div className="text-xl sm:text-2xl font-bold text-white">Weddings & Harambees</div>
                <div className="text-sm text-amber-50/80 mt-1">Welfare, family support, contributions</div>
              </div>
            </div>
          </div>

          {/* Tier 2: Medium cards (2+2+2 cols on desktop, 6-col grid) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-3 sm:mb-4">
            {/* Birthday */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-2 group h-32 sm:h-36 bg-white rounded-3xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-emerald-200 border border-slate-100 transition-all duration-300 cursor-default flex flex-col justify-between">
              <div className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-300">🎂</div>
              <div>
                <div className="text-base sm:text-lg font-bold text-slate-900">Birthday gifts</div>
                <div className="text-xs text-slate-400 mt-0.5">Chip in for the surprise</div>
              </div>
            </div>

            {/* House rent */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-2 group h-32 sm:h-36 bg-white rounded-3xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-emerald-200 border border-slate-100 transition-all duration-300 cursor-default flex flex-col justify-between">
              <div className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-300">🏠</div>
              <div>
                <div className="text-base sm:text-lg font-bold text-slate-900">House rent</div>
                <div className="text-xs text-slate-400 mt-0.5">Roommates, shared bills</div>
              </div>
            </div>

            {/* Graduation */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-2 group h-32 sm:h-36 bg-white rounded-3xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-emerald-200 border border-slate-100 transition-all duration-300 cursor-default flex flex-col justify-between">
              <div className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-300">🎓</div>
              <div>
                <div className="text-base sm:text-lg font-bold text-slate-900">Graduation</div>
                <div className="text-xs text-slate-400 mt-0.5">Class gifts, ceremonies</div>
              </div>
            </div>
          </div>

          {/* Tier 3: Small accent cards (6-col grid, 2 cols each on lg) */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4 mb-3 sm:mb-4">
            {[
              { emoji: '⚽', label: 'Football', sub: 'Tournaments & pools' },
              { emoji: '🎮', label: 'Gaming', sub: 'Events & prizes' },
              { emoji: '🏖', label: 'Airbnb', sub: 'Group weekends' },
              { emoji: '💼', label: 'Office', sub: 'Farewell gifts' },
              { emoji: '⛽', label: 'Fuel', sub: 'Car pooling' },
              { emoji: '📚', label: 'Campus', sub: 'Events & trips' },
            ].map((uc, i) => (
              <div key={i} className="col-span-1 sm:col-span-2 lg:col-span-1 group h-24 sm:h-28 bg-white rounded-2xl p-3 sm:p-4 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-emerald-200 border border-slate-100 transition-all duration-300 cursor-default flex flex-col justify-between">
                <div className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform duration-300">{uc.emoji}</div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900">{uc.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">{uc.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Tier 4: Mini pills — the long tail */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5 mt-6 sm:mt-8">
            {[
              { emoji: '🎉', label: 'Party tickets' },
              { emoji: '❤️', label: 'Funeral support' },
              { emoji: '👨‍👩‍👧', label: 'Family fundraiser' },
              { emoji: '🛫', label: 'Vacation' },
              { emoji: '🎫', label: 'Concert tickets' },
              { emoji: '☕', label: 'Coffee runs' },
              { emoji: '🛒', label: 'Group buys' },
              { emoji: '🎵', label: 'Studio sessions' },
            ].map((uc, i) => (
              <div key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 hover:-translate-y-0.5 transition-all duration-200 cursor-default">
                <span className="text-sm sm:text-base">{uc.emoji}</span>
                <span className="text-xs sm:text-sm font-semibold text-slate-600">{uc.label}</span>
              </div>
            ))}
          </div>

          {/* "If it exists, we track it" anchor */}
          <p className="text-center text-sm text-slate-500 mt-6 sm:mt-8 font-medium">
            ...and anything else where one person collects and everyone wants to know who paid.
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          3. PAIN SECTION — iOS notification stack (stressful)
      ═══════════════════════════════════════════════════ */}
      <div className="bg-white py-16 sm:py-24 border-y border-slate-100 relative overflow-hidden">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-2 tracking-tight">
            Every group has one person saying...
          </h2>
          <p className="text-center text-slate-500 mb-10 sm:mb-12 text-sm sm:text-base">
            You've been in this chat. We all have.
          </p>

          {/* iOS-style notification stack — overlapping, slightly askew */}
          <div className="relative space-y-1 mb-12 sm:mb-16 max-w-sm mx-auto">
            {[
              { name: 'Kevin', msg: "I already paid.", time: '11:32 PM' },
              { name: 'Brian', msg: "Who's collecting?", time: '11:35 PM' },
              { name: 'Aisha', msg: "Check above ↑", time: '11:36 PM' },
              { name: 'Joy', msg: "What's the till number?", time: '11:38 PM' },
              { name: 'Kevin', msg: "I'll send later", time: '11:40 PM' },
              { name: 'Brian', msg: "Can you confirm mine?", time: '11:42 PM' },
            ].map((n, i) => (
              <div
                key={i}
                className={`animate-notifSlide relative bg-white/95 backdrop-blur rounded-2xl shadow-md border border-slate-100 px-4 py-3 flex items-start gap-3 ${i % 2 === 0 ? 'rotate-[-0.8deg]' : 'rotate-[0.6deg]'} ${i > 0 ? '-mt-2' : ''}`}
                style={{ animationDelay: `${i * 0.12}s`, zIndex: 10 - i }}
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700 flex-shrink-0">
                  {n.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">{n.name}</span>
                    <span className="text-[10px] text-slate-400">{n.time}</span>
                  </div>
                  <p className="text-sm text-slate-600 truncate">{n.msg}</p>
                </div>
                {/* Fake "WhatsApp" label */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <div className="w-5 h-5 rounded bg-[#25D366] flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.4C8.7 21.5 10.3 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2z"/></svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resolution */}
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
              Every group eventually becomes a payment group.
            </p>
            <p className="text-base sm:text-lg text-emerald-600 font-semibold">
              Bring order to the chaos.
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          4. HOW IT WORKS — phone mockup + paste visual
      ═══════════════════════════════════════════════════ */}
      <div id="how-it-works" className="py-16 sm:py-24 bg-gradient-to-b from-[#F8FAFC] to-emerald-50/40">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
              Less than a minute. Zero typing.
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              No app download. No sign-up for your members.
            </p>
          </div>

          {/* Three phone mockups */}
          <div className="grid md:grid-cols-3 gap-8 sm:gap-6">
            {/* Phone 1: M-Pesa SMS */}
            <div className="flex flex-col items-center">
              <div className="relative w-[200px] h-[380px] rounded-[2.2rem] bg-slate-900 border-[10px] border-slate-900 shadow-2xl shadow-slate-300 overflow-hidden">
                <div className="rounded-[1.5rem] overflow-hidden h-full bg-slate-50 flex flex-col">
                  {/* SMS header */}
                  <div className="bg-slate-100 px-4 py-3 flex items-center gap-2 border-b border-slate-200">
                    <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">M</div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">M-PESA</div>
                      <div className="text-[10px] text-slate-400">Safaricom</div>
                    </div>
                  </div>
                  {/* SMS body */}
                  <div className="p-4 flex-1 flex flex-col justify-center">
                    <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm border border-slate-100 max-w-[90%]">
                      <div className="text-[11px] text-slate-500 mb-1">Confirmed. KES1,500.00 sent to 0712 345 678 — Mary Wanjiku on 18/7/26 at 2:45 PM. New M-PESA balance KES3,200.</div>
                      <div className="text-[10px] text-slate-400 mt-2 border-t border-slate-100 pt-1">Copy SMS</div>
                    </div>
                  </div>
                  {/* Home indicator */}
                  <div className="flex justify-center pb-2"><div className="w-16 h-1 rounded-full bg-slate-300"></div></div>
                </div>
              </div>
              <div className="mt-5 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">STEP 1</div>
                <h3 className="text-base font-bold text-slate-900">Copy the M-Pesa SMS</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-[180px]">Just like you always do.</p>
              </div>
            </div>

            {/* Phone 2: Paste into EasyCollect */}
            <div className="flex flex-col items-center">
              <div className="relative w-[200px] h-[380px] rounded-[2.2rem] bg-slate-900 border-[10px] border-slate-900 shadow-2xl shadow-emerald-200/40 overflow-hidden">
                <div className="rounded-[1.5rem] overflow-hidden h-full bg-white flex flex-col">
                  {/* App header */}
                  <div className="bg-gradient-to-br from-emerald-600 to-teal-600 px-4 py-3 text-white">
                    <div className="text-[10px] opacity-80">Weekend Trip</div>
                    <div className="text-sm font-bold">Add Payment</div>
                  </div>
                  {/* Paste box */}
                  <div className="p-4 flex-1 flex flex-col justify-center gap-3">
                    <div className="bg-slate-50 rounded-xl p-3 border-2 border-dashed border-emerald-300">
                      <div className="text-[10px] text-slate-400 mb-1">Paste M-Pesa SMS here</div>
                      <div className="text-[10px] text-slate-600 font-mono leading-relaxed">Confirmed. KES1,500.00 sent to...</div>
                    </div>
                    {/* Auto-filled */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-3 py-2 bg-emerald-50 rounded-lg">
                        <span className="text-[10px] text-slate-500">Name</span>
                        <span className="text-xs font-bold text-slate-900">Mary Wanjiku</span>
                      </div>
                      <div className="flex justify-between items-center px-3 py-2 bg-emerald-50 rounded-lg">
                        <span className="text-[10px] text-slate-500">Amount</span>
                        <span className="text-xs font-bold text-emerald-600">KES 1,500</span>
                      </div>
                      <div className="flex justify-between items-center px-3 py-2 bg-emerald-50 rounded-lg">
                        <span className="text-[10px] font-bold text-slate-500">+ Mary</span>
                        <span className="text-xs text-emerald-600 font-bold">✓ Added</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center pb-2"><div className="w-16 h-1 rounded-full bg-slate-300"></div></div>
                </div>
              </div>
              <div className="mt-5 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold mb-2 ring-2 ring-emerald-200">STEP 2 — the magic</div>
                <h3 className="text-base font-bold text-slate-900">Don't type — paste</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-[180px]">We extract name, amount, and code automatically.</p>
              </div>
            </div>

            {/* Phone 3: Shared list */}
            <div className="flex flex-col items-center">
              <div className="relative w-[200px] h-[380px] rounded-[2.2rem] bg-slate-900 border-[10px] border-slate-900 shadow-2xl shadow-emerald-200/40 overflow-hidden">
                <div className="rounded-[1.5rem] overflow-hidden h-full bg-slate-50 flex flex-col">
                  <div className="bg-gradient-to-br from-emerald-600 to-teal-600 px-4 py-3 text-white">
                    <div className="text-[10px] opacity-80">Weekend Trip</div>
                    <div className="text-sm font-bold">Total: KES 18,500</div>
                    <div className="w-full bg-black/20 h-1 rounded-full mt-1 overflow-hidden">
                      <div className="bg-white h-full w-[80%] rounded-full"></div>
                    </div>
                  </div>
                  <div className="p-3 space-y-2 flex-1">
                    <div className="flex justify-between items-center py-1.5 px-3 bg-white rounded-lg shadow-sm border-l-3 border-emerald-500">
                      <span className="text-xs font-semibold text-slate-800">✓ Kevin</span>
                      <span className="text-xs font-bold text-emerald-600">KES 1,500</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 px-3 bg-white rounded-lg shadow-sm border-l-3 border-emerald-500">
                      <span className="text-xs font-semibold text-slate-800">✓ Brian</span>
                      <span className="text-xs font-bold text-emerald-600">KES 3,000</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 px-3 bg-white rounded-lg shadow-sm border-l-3 border-emerald-500">
                      <span className="text-xs font-semibold text-slate-800">✓ Mary</span>
                      <span className="text-xs font-bold text-emerald-600">KES 1,500</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 px-3 bg-white rounded-lg shadow-sm border-l-3 border-slate-200 opacity-60">
                      <span className="text-xs font-semibold text-slate-500">○ Joy</span>
                      <span className="text-xs font-bold text-slate-400">Pending</span>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <div className="bg-emerald-600 text-white text-xs font-bold text-center py-2 rounded-xl">Share Link 📤</div>
                  </div>
                </div>
              </div>
              <div className="mt-5 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">STEP 3</div>
                <h3 className="text-base font-bold text-slate-900">Send the link</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-[180px]">Everyone sees the same list — no more DMs.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          5. HISTORY (only if user has saved rooms)
      ═══════════════════════════════════════════════════ */}
      {rooms.length > 0 && (
        <div className="bg-white py-10 sm:py-12 border-b border-slate-100">
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
                    group relative bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer
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
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Target</p>
                      <p className="font-mono font-medium text-slate-700">
                        {room.targetAmount ? FormatUtils.formatCurrency(room.targetAmount, (room.currency as Currency) || 'KES') : 'No limit'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Last opened</p>
                      <p className="text-xs text-slate-600">{DateService.formatDate(room.lastAccessed, 'relative')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          6. FINAL CTA
      ═══════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 py-16 sm:py-24 text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden>
          <div className="absolute -top-20 left-1/4 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute -bottom-20 right-1/4 w-72 h-72 bg-lime-200 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4 sm:mb-5 tracking-tight">
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

      {/* ═══════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════ */}
      <footer className="bg-white py-10 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <div className="font-bold text-slate-900 text-lg mb-0.5">EasyCollect 💚</div>
            <p className="text-sm text-slate-500">The easiest way to track group contributions.</p>
          </div>
          <div className="flex gap-5 text-sm text-slate-500">
            <a href="#" className="hover:text-emerald-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
