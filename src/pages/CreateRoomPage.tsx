// =====================================================
// pages/CreateRoomPage.tsx
// Room creation page
// =====================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoomCreationWizard } from '../components/features/RoomCreationWizard';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { CopyButton } from '../components/ui/CopyButton';
import { Alert } from '../components/ui/Alert';
import { db } from '../lib/database.service';
import { LocalStorageService } from '../services/storage.service';
import { TokenUtils } from '../utils/token.utils';
import { useToast } from '../components/ui/Toast';
import type { CreateRoomDTO, CreateRoomResponse } from '../lib/types';

export const CreateRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [createdRoom, setCreatedRoom] = useState<CreateRoomResponse | null>(null);
  const [hasSavedStewardLink, setHasSavedStewardLink] = useState(false);

  const handleCreateRoom = async (data: CreateRoomDTO) => {
    const result = await db.rooms.createRoom(data);

    if (result.success) {
      const roomData = result.data;

      // Save steward access locally for quick resume
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
        message: 'Room created successfully',
      });
    } else {
      showToast({
        type: 'error',
        message: result.error?.message || 'Failed to create room',
      });
    }
  };

  const handleContinue = () => {
    if (!createdRoom) return;
    navigate(`/room/${createdRoom.steward_token}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center text-gray-600 hover:text-green-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </button>

        {/* Wizard */}
        <RoomCreationWizard
          onSubmit={handleCreateRoom}
          onCancel={() => navigate('/')}
        />
      </div>

      {/* Success Modal */}
      {createdRoom && (
        <Modal
          isOpen
          onClose={() => {}}
          title="Room created successfully"
          size="lg"
          closeOnOutsideClick={false}
        >
          <div className="space-y-6">
            <Alert type="warning" title="Keep these links safe">
              These links control access to your room.  
              The <strong>steward link allows editing contributions</strong> and should be kept private.
            </Alert>

            {/* Steward Link */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <label className="block text-sm font-bold text-yellow-900 mb-2">
                👑 Steward Link (Private)
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={TokenUtils.generateRoomUrl(createdRoom.steward_token)}
                  readOnly
                  className="flex-1 px-4 py-3 border border-yellow-300 rounded-lg font-mono text-sm bg-white text-gray-700"
                  onClick={(e) => e.currentTarget.select()}
                />
                <CopyButton
                  text={TokenUtils.generateRoomUrl(createdRoom.steward_token)}
                  label="Copy"
                  successMessage="Steward link copied"
                  className="border-yellow-300 hover:bg-yellow-100"
                />
              </div>

              <p className="mt-2 text-xs text-yellow-800">
                ⚠️ Anyone with this link can <strong>edit contributions and amounts</strong>.  
                Share it only with trusted stewards.
              </p>

              <div className="flex items-start gap-3 mt-4">
                <input
                  id="confirm-save"
                  type="checkbox"
                  checked={hasSavedStewardLink}
                  onChange={(e) => setHasSavedStewardLink(e.target.checked)}
                  className="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded"
                />
                <label htmlFor="confirm-save" className="text-sm text-gray-700">
                  I have saved the <strong>steward link</strong> somewhere safe
                </label>
              </div>
            </div>

            {/* Viewer Link */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <label className="block text-sm font-bold text-green-900 mb-2">
                👀 Viewer Link (Share with the Group)
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={TokenUtils.generateRoomUrl(createdRoom.viewer_token)}
                  readOnly
                  className="flex-1 px-4 py-3 border border-green-300 rounded-lg font-mono text-sm bg-white text-gray-700"
                  onClick={(e) => e.currentTarget.select()}
                />
                <CopyButton
                  text={TokenUtils.generateRoomUrl(createdRoom.viewer_token)}
                  label="Copy"
                  successMessage="Viewer link copied"
                  className="border-green-300 hover:bg-green-100"
                />
              </div>

              <p className="mt-2 text-xs text-green-800">
                Share this link on WhatsApp so everyone can view contribution progress.
              </p>
            </div>

            {/* Continue */}
            <Button
              onClick={handleContinue}
              fullWidth
              size="lg"
              className="mt-4"
              disabled={!hasSavedStewardLink}
            >
              Enter Room Dashboard →
            </Button>

            {!hasSavedStewardLink && (
              <p className="text-xs text-center text-gray-500 mt-2">
                Please confirm you’ve saved the steward link before continuing
              </p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
