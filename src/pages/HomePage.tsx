// =====================================================
// pages/HomePage.tsx
// Landing page - Trust-first, Kenyan, Simple
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
    // OLD SCARY MESSAGE:
    // if (window.confirm('Remove this room from history? (The room will still exist on the server)')) {
    
    // NEW TRUSTWORTHY MESSAGE:
    if (window.confirm('Remove this group from your local dashboard? \n\nNOTE: This only clears it from this phone. Other members can still access the group using the link.')) {
      setDeletingId(roomId);
      setTimeout(() => {
        removeRoom(roomId);
        setDeletingId(null);
      }, 300);
    }
    };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* 1. HERO SECTION - The "Aha!" Moment */}
      <div className="bg-white border-b border-gray-200 relative overflow-hidden">
        
        {/* Decorative background blob */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-green-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-4 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left: Text & CTA */}
            <div className="text-left z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-semibold mb-6">
                <span>🇰🇪</span>
                <span>Simple. Secure. Kenyan.</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-[1.1]">
                Track <span className="text-green-600">Chama Money</span> without the chaos.
              </h1>
              
              <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
                Stop scrolling through WhatsApp to find M-Pesa messages. Create a <strong>shared link</strong> where everyone can see who has paid and who is pending.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/create')}
                  className="shadow-xl shadow-green-200 hover:shadow-green-300 transition-all transform hover:-translate-y-1 text-lg px-8 py-6"
                >
                  Create Free Ledger
                </Button>
                <button 
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-6 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  See how it works ↓
                </button>
              </div>

              {/* Trust Statement */}
              <div className="mt-8 flex items-center gap-3 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="text-green-500">🛡️</span> No bank login needed
                </span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span className="flex items-center gap-1">
                  <span className="text-green-500">🔒</span> Money stays in M-Pesa
                </span>
              </div>
            </div>

            {/* Right: The Visual Metaphor (Phone Mockup) */}
            <div className="relative z-10 hidden lg:block">
              <div className="relative mx-auto border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[500px] w-[280px] shadow-2xl">
                <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg"></div>
                <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
                <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
                <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
                <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white flex flex-col">
                  {/* Mockup Header */}
                  <div className="bg-green-600 p-4 text-white pt-8">
                    <div className="text-xs opacity-80 mb-1">Family Gathering</div>
                    <div className="font-bold text-lg">Target: KES 50,000</div>
                    <div className="w-full bg-green-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-white h-full w-[65%]"></div>
                    </div>
                  </div>
                  {/* Mockup List */}
                  <div className="p-4 space-y-3 bg-slate-50 flex-1">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border-l-4 border-green-500">
                      <div className="text-xs">
                        <div className="font-bold text-slate-800">John Kamau</div>
                        <div className="text-slate-400">Paid today</div>
                      </div>
                      <div className="font-bold text-green-600">+1,000</div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border-l-4 border-green-500">
                      <div className="text-xs">
                        <div className="font-bold text-slate-800">Sarah O.</div>
                        <div className="text-slate-400">Paid yesterday</div>
                      </div>
                      <div className="font-bold text-green-600">+5,000</div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border-l-4 border-slate-200 opacity-60">
                      <div className="text-xs">
                        <div className="font-bold text-slate-800">Peter M.</div>
                        <div className="text-slate-400">Pending...</div>
                      </div>
                      <div className="font-bold text-slate-400">0</div>
                    </div>
                  </div>
                  {/* Mockup Floating Button */}
                  <div className="absolute bottom-6 right-6 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center shadow-lg text-white text-2xl font-bold">+</div>
                </div>
              </div>
              
              {/* Floating Badge on Mockup */}
              <div className="absolute top-20 -left-12 bg-white p-3 rounded-lg shadow-xl border border-green-100 flex items-center gap-3 animate-bounce-slow">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl">🚀</div>
                <div>
                  <div className="text-xs text-slate-500">Share via</div>
                  <div className="font-bold text-slate-800">WhatsApp Link</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. HISTORY SECTION (Only if exists) */}
      {rooms.length > 0 && (
        <div className="bg-slate-50 py-12 border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">Your Active Rooms</h2>
              <span className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                Saved on this device
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {rooms.map((room) => (
                <div
                  key={room.roomId}
                  onClick={() => navigate(`/room/${room.stewardToken}`)}
                  className={`
                    group relative bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-green-300 transition-all cursor-pointer
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
                      title="Remove from history"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  
                  <h3 className="font-bold text-slate-900 text-lg mb-1 truncate">{room.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 h-10 mb-4">{room.description || 'No description'}</p>
                  
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Target</p>
                      <p className="font-mono font-medium text-slate-700">
                        {room.targetAmount 
                          ? FormatUtils.formatCurrency(room.targetAmount, (room.currency as Currency) || 'KES') 
                          : 'No Limit'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Last Open</p>
                      <p className="text-xs text-slate-600">{DateService.formatDate(room.lastAccessed, 'relative')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. HOW IT WORKS */}
      <div id="how-it-works" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">It's as easy as 1-2-3</h2>
            <p className="text-slate-600">No complicated setup. No app download required for members.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-green-200 via-green-200 to-slate-200 z-0"></div>

            {/* Step 1 */}
            <div className="relative z-10 text-center">
              <div className="w-24 h-24 bg-white border-4 border-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <span className="text-4xl">💸</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">1. Collect Money</h3>
              <p className="text-sm text-slate-500 px-4">
                Members send money to your M-Pesa or Bank account just like they always do.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 text-center">
              <div className="w-24 h-24 bg-white border-4 border-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-4xl">✍️</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">2. Record It</h3>
              <p className="text-sm text-slate-500 px-4">
                Copy the M-Pesa SMS and paste it into Chama Ledger. We extract the name and amount.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 text-center">
              <div className="w-24 h-24 bg-white border-4 border-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <span className="text-4xl">🔗</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">3. Share Link</h3>
              <p className="text-sm text-slate-500 px-4">
                Send the "View-Only" link to the WhatsApp group. Everyone sees the updated list instantly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. THE TRUST GRID */}
      <div className="bg-slate-900 text-slate-300 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Why Kenyans trust us</h2>
            <p className="text-slate-400">We solve the transparency problem without touching the money.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <div className="text-3xl mb-4">🛑</div>
              <h4 className="text-white font-bold mb-2">No Money Handling</h4>
              <p className="text-sm leading-relaxed">Payments happen outside our app (M-Pesa/Bank). We just keep the score.</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <div className="text-3xl mb-4">📱</div>
              <h4 className="text-white font-bold mb-2">No App Needed</h4>
              <p className="text-sm leading-relaxed">Your members don't need to download anything. They just click the link.</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <div className="text-3xl mb-4">🔒</div>
              <h4 className="text-white font-bold mb-2">Private & Secure</h4>
              <p className="text-sm leading-relaxed">Only people with the link can view. Only you (the steward) can edit.</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <div className="text-3xl mb-4">⚡</div>
              <h4 className="text-white font-bold mb-2">Works Offline</h4>
              <p className="text-sm leading-relaxed">Slow internet? No problem. The app loads fast and saves data locally.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. FINAL CTA */}
      <div className="bg-green-600 py-20 text-center px-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
          Ready to organize your group?
        </h2>
        <p className="text-green-100 text-lg mb-8 max-w-xl mx-auto">
          Perfect for Weddings, Funeral arrangements, Office parties, and Chamas.
        </p>
        <Button
          size="lg"
          variant="secondary"
          onClick={() => navigate('/create')}
          className="bg-white text-green-700 hover:bg-green-50 text-lg px-10 py-4 shadow-xl"
        >
          Start a New Ledger
        </Button>
        <p className="mt-4 text-sm text-green-200 opacity-80">Free to use. No hidden fees.</p>
      </div>

      {/* FOOTER */}
      <footer className="bg-white py-12 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <div className="font-bold text-slate-900 text-xl mb-1">Chama Ledger 💚</div>
            <p className="text-sm text-slate-500">Built for Kenyan communities.</p>
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-green-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-green-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-green-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};