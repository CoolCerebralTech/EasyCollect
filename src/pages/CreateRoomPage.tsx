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
import type { CreateRoomDTO, CreateRoomResponse } from '../lib/types'; // Fixed Import

export const CreateRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [createdRoom, setCreatedRoom] = useState<CreateRoomResponse | null>(null);

  const handleCreateRoom = async (data: CreateRoomDTO) => {
    // 1. Call Backend
    const result = await db.rooms.createRoom(data);

    if (result.success) {
      const roomData = result.data;
      
      // 2. Save "Steward" access to LocalStorage automatically
      // This ensures if they close the tab, they can find it on HomePage
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

      // 3. Show Success State
      setCreatedRoom(roomData);
      
      showToast({
        type: 'success',
        message: 'Room created successfully!',
      });
    } else {
      showToast({
        type: 'error',
        message: result.error?.message || 'Failed to create room',
      });
    }
  };

  const handleContinue = () => {
    if (createdRoom) {
      navigate(`/room/${createdRoom.steward_token}`);
    }
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

      {/* Success Modal (The "Golden Ticket" Moment) */}
      {createdRoom && (
        <Modal
          isOpen={!!createdRoom}
          onClose={() => {}} // Prevent closing by clicking outside
          title="🎉 Room Created Successfully!"
          size="lg"
          closeOnOutsideClick={false}
        >
          <div className="space-y-6">
            <Alert type="warning" title="Important: Save These Links">
              These links are the keys to your room. They will <strong>only be shown once</strong>.
            </Alert>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <label className="block text-sm font-bold text-yellow-900 mb-2">
                👑 Steward Link (For You)
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
                  successMessage="Steward link copied!"
                  className="border-yellow-300 hover:bg-yellow-100"
                />
              </div>
              <p className="mt-2 text-xs text-yellow-800">
                ⚠️ <strong>Do not share this link.</strong> It allows editing contributions.
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <label className="block text-sm font-bold text-green-900 mb-2">
                👀 Viewer Link (For the Group)
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
                  successMessage="Viewer link copied!"
                  className="border-green-300 hover:bg-green-100"
                />
              </div>
              <p className="mt-2 text-xs text-green-800">
                Share this link on WhatsApp so everyone can see the progress.
              </p>
            </div>

            <Button onClick={handleContinue} fullWidth size="lg" className="mt-4">
              Enter Room Dashboard →
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};