// =====================================================
// pages/CreateRoomPage.tsx
// =====================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoomCreationWizard } from '../components/features/RoomCreationWizard';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { CopyButton } from '../components/ui/CopyButton';
import { db } from '../services/db.service';
import { LocalStorageService } from '../services/storage.service';
import { TokenUtils } from '../utils/token.utils';
import { useToast } from '../components/ui/Toast';
import type { CreateRoomDTO, CreateRoomResponse } from '../lib/types';

export const CreateRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [createdRoom, setCreatedRoom] = useState<CreateRoomResponse | null>(null);
  // 1. FIX: Store title separately since API doesn't return it
  const [roomTitle, setRoomTitle] = useState<string>(''); 
  const [hasSavedAdminKey, setHasSavedAdminKey] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateRoom = async (data: CreateRoomDTO) => {
    setIsSubmitting(true);
    try {
      const result = await db.rooms.createRoom(data);

      if (result.success) {
        const roomData = result.data;
        
        // Save to localStorage
        LocalStorageService.saveRoom({
          roomId: roomData.room_id,
          title: data.title,
          stewardToken: roomData.steward_token,
          role: 'steward',
          lastAccessed: new Date().toISOString(),
          status: 'active',
          description: data.description,
          targetAmount: data.targetAmount,
          currency: data.currency,
        });

        setCreatedRoom(roomData);
        setRoomTitle(data.title); // 2. FIX: Save the title here
        
        showToast({
          type: 'success',
          message: 'Group ledger created successfully! 🎉',
        });
      } else {
        showToast({
          type: 'error',
          message: result.error.message || 'Failed to create room.',
        });
      }
    } catch {
      showToast({
        type: 'error',
        message: 'An unexpected error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    if (createdRoom && hasSavedAdminKey) {
      navigate(`/room/${createdRoom.steward_token}`);
    }
  };

  const handleWhatsAppShare = () => {
    if (!createdRoom) return;
    
    const viewerUrl = TokenUtils.generateRoomUrl(createdRoom.viewer_token);
    // 3. FIX: Use roomTitle state instead of createdRoom.title
    const message = `*${roomTitle}*
    
Hi all 👋 Here is the link to track our contributions. 

It shows who has paid and our total progress:
👇
${viewerUrl}

_Note: Payments are still sent to the treasurer via M-Pesa as usual._`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center text-slate-500 hover:text-slate-800 transition-colors mb-6 text-sm font-medium"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Set up your group ledger
          </h1>
          <p className="text-lg text-slate-600">
            Takes less than a minute. No account required.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200 border border-slate-100 p-6 sm:p-10">
          {/* 4. FIX: This prop is now accepted by the component below */}
          <RoomCreationWizard
            onSubmit={handleCreateRoom}
            onCancel={() => navigate('/')}
            isSubmitting={isSubmitting}
          />
        </div>
        
        <p className="text-center text-xs text-slate-400 mt-8">
          By creating a room, you agree that Chama Ledger is a tracking tool only and does not handle actual funds.
        </p>
      </div>

      {createdRoom && (
        <Modal
          isOpen={!!createdRoom}
          onClose={() => {}}
          title=""
          size="lg"
          closeOnOutsideClick={false}
        >
          <div className="space-y-8 px-2">
            <div className="text-center pb-2">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <span className="text-4xl">🎉</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                Your Ledger is Ready!
              </h2>
              <p className="text-slate-600">
                You are the admin (Steward). These are your keys.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-200 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-wider">
                For You Only
              </div>
              
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-amber-100 rounded-lg text-2xl">👑</div>
                <div>
                  <h3 className="font-bold text-amber-900 text-lg">
                    Admin Link (Steward)
                  </h3>
                  <p className="text-sm text-amber-800 opacity-90 leading-relaxed">
                    This link lets you add payments. <strong className="underline">Do not</strong> share this in the WhatsApp group.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={TokenUtils.generateRoomUrl(createdRoom.steward_token)}
                    readOnly
                    className="w-full pl-4 pr-10 py-3 border-2 border-amber-300 rounded-lg font-mono text-xs sm:text-sm bg-white text-slate-600 focus:outline-none focus:border-amber-500"
                    onClick={(e) => e.currentTarget.select()}
                  />
                </div>
                {/* 5. FIX: Variant prop is now accepted by component below */}
                <CopyButton
                  text={TokenUtils.generateRoomUrl(createdRoom.steward_token)}
                  label="Copy Admin Link"
                  variant="warning"
                  className="sm:w-auto w-full"
                />
              </div>

              <div className="mt-5 flex items-start gap-3 p-3 bg-white/50 rounded-lg border border-amber-100 cursor-pointer" onClick={() => setHasSavedAdminKey(!hasSavedAdminKey)}>
                <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${hasSavedAdminKey ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-slate-300'}`}>
                  {hasSavedAdminKey && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <label className="text-sm text-slate-700 select-none cursor-pointer font-medium">
                  I have saved this Admin Link securely.
                </label>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-green-200 text-green-800 text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-wider">
                Share This
              </div>

              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-green-100 rounded-lg text-2xl">📢</div>
                <div>
                  <h3 className="font-bold text-green-900 text-lg">
                    Public View Link
                  </h3>
                  <p className="text-sm text-green-800 opacity-90">
                    Share this with your members. They can see the list, but they can't edit it.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleWhatsAppShare}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg transform active:scale-95"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Share to WhatsApp Group
                </button>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={TokenUtils.generateRoomUrl(createdRoom.viewer_token)}
                    readOnly
                    className="flex-1 px-4 py-2 border border-green-200 rounded-lg text-xs bg-white text-gray-500"
                    onClick={(e) => e.currentTarget.select()}
                  />
                  <CopyButton
                    text={TokenUtils.generateRoomUrl(createdRoom.viewer_token)}
                    label="Copy"
                    className="bg-white border border-green-200 text-green-700 hover:bg-green-50"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col items-center gap-4">
              <Button
                onClick={handleContinue}
                fullWidth
                size="lg"
                disabled={!hasSavedAdminKey}
                className={`font-bold py-4 text-lg transition-all ${
                  hasSavedAdminKey 
                    ? 'shadow-xl shadow-slate-200 transform hover:-translate-y-1' 
                    : 'opacity-50 cursor-not-allowed grayscale'
                }`}
              >
                {hasSavedAdminKey ? 'Go to Dashboard →' : 'Save Admin Link to Continue'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};