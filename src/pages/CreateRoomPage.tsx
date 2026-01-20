// =====================================================
// pages/CreateRoomPage.tsx
// Room creation page - "The Golden Ticket" moment
// =====================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoomCreationWizard } from '../components/features/RoomCreationWizard';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { CopyButton } from '../components/ui/CopyButton';
import { db } from '../lib/database.service';
import { LocalStorageService } from '../services/storage.service';
import { TokenUtils } from '../utils/token.utils';
import { useToast } from '../components/ui/Toast';
import type { CreateRoomDTO, CreateRoomResponse } from '../lib/types';

export const CreateRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [createdRoom, setCreatedRoom] = useState<CreateRoomResponse | null>(null);
  const [hasSavedAdminKey, setHasSavedAdminKey] = useState(false);

  const handleCreateRoom = async (data: CreateRoomDTO) => {
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
      
      showToast({
        type: 'success',
        message: 'Group ledger created successfully',
      });
    } else {
      showToast({
        type: 'error',
        message: result.error.message,
      });
    }
  };

  const handleContinue = () => {
    if (createdRoom) {
      navigate(`/room/${createdRoom.steward_token}`);
    }
  };

  const handleWhatsAppShare = () => {
    if (!createdRoom) return;
    
    const viewerUrl = TokenUtils.generateRoomUrl(createdRoom.viewer_token);
    const message = `Hi 👋 This is our group contribution link. It shows who has paid and the total progress.

${viewerUrl}

Payments are still via M-Pesa as usual.`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Set up your group ledger
          </h1>
          <p className="text-gray-600">
            This takes less than a minute. You can share the group link immediately after.
          </p>
        </div>

        {/* Wizard Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <RoomCreationWizard
            onSubmit={handleCreateRoom}
            onCancel={() => navigate('/')}
          />
        </div>
      </div>

      {/* Success Modal - "The Keys to Your Ledger" */}
      {createdRoom && (
        <Modal
          isOpen={!!createdRoom}
          onClose={() => {}}
          title=""
          size="lg"
          closeOnOutsideClick={false}
        >
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center pb-4 border-b border-gray-200">
              <div className="text-5xl mb-3">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Your Ledger is Ready
              </h2>
              <p className="text-gray-600">
                These links are the keys to your group. Save them carefully.
              </p>
            </div>

            {/* Admin/Treasurer Key */}
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🔐</span>
                <div>
                  <h3 className="font-bold text-amber-900 text-lg">
                    Admin / Treasurer Key
                  </h3>
                  <p className="text-sm text-amber-800 font-semibold">
                    Do NOT Share
                  </p>
                </div>
              </div>

              <p className="text-sm text-amber-900 mb-4">
                Allows you to add or update contributions.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={TokenUtils.generateRoomUrl(createdRoom.steward_token)}
                  readOnly
                  className="flex-1 px-4 py-3 border-2 border-amber-300 rounded-lg font-mono text-xs bg-white text-gray-700"
                  onClick={(e) => e.currentTarget.select()}
                />
                <CopyButton
                  text={TokenUtils.generateRoomUrl(createdRoom.steward_token)}
                  label="Copy Key"
                  successMessage="Admin key copied!"
                />
              </div>

              <div className="flex items-start gap-3 mt-4 bg-white/60 p-3 rounded-lg">
                <input
                  id="confirm-save"
                  type="checkbox"
                  checked={hasSavedAdminKey}
                  onChange={(e) => setHasSavedAdminKey(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-amber-600 border-amber-400 rounded focus:ring-amber-500"
                />
                <label htmlFor="confirm-save" className="text-sm text-amber-900">
                  I have saved this key somewhere safe (WhatsApp Saved Messages, Notes, etc.)
                </label>
              </div>
            </div>

            {/* Public Group Link */}
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">👀</span>
                <div>
                  <h3 className="font-bold text-green-900 text-lg">
                    Public Group Link
                  </h3>
                  <p className="text-sm text-green-800 font-semibold">
                    Share to WhatsApp
                  </p>
                </div>
              </div>

              <p className="text-sm text-green-900 mb-4">
                Anyone with this link can view progress.
              </p>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={TokenUtils.generateRoomUrl(createdRoom.viewer_token)}
                  readOnly
                  className="flex-1 px-4 py-3 border-2 border-green-300 rounded-lg font-mono text-xs bg-white text-gray-700"
                  onClick={(e) => e.currentTarget.select()}
                />
                <CopyButton
                  text={TokenUtils.generateRoomUrl(createdRoom.viewer_token)}
                  label="Copy Link"
                  successMessage="Group link copied!"
                />
              </div>

              {/* WhatsApp Share Button */}
              <button
                onClick={handleWhatsAppShare}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Share via WhatsApp
              </button>
            </div>

            {/* Security Reassurance */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🛡️</span>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Chama Ledger cannot:
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Access your phone</li>
                    <li>• Read your messages</li>
                    <li>• Touch your money</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-3 italic">
                    It only shows what the treasurer records.
                  </p>
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <Button
              onClick={handleContinue}
              fullWidth
              size="lg"
              disabled={!hasSavedAdminKey}
              className="font-semibold"
            >
              Enter Group Dashboard →
            </Button>

            {!hasSavedAdminKey && (
              <p className="text-xs text-center text-gray-500">
                Please confirm you've saved the admin key before continuing
              </p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};