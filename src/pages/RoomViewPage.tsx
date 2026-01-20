// =====================================================
// pages/RoomViewPage.tsx
// Main room view (handles both steward and viewer)
// =====================================================

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useContributions } from '../hooks/useContributions';
import { useAnalytics } from '../hooks/useAnalytics';
import { useRoom } from '../hooks/useRoom';
import { useContributionSearch, type ContributionFilters } from '../hooks/useContributionSearch';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { PINGate } from '../components/features/PINGate';
import { ContributionForm } from '../components/features/ContributionForm';
import { VisualContributionMap } from '../components/features/VisualContributionMap';
import { ContributionTimeline } from '../components/features/ContributionTimeline';
import { StatisticsDashboard } from '../components/features/StatisticsDashboard';
import { ShareRoomModal } from '../components/features/ShareRoomModal';
import { ContributionSearch } from '../components/features/ContributionSearch';
import { OfflineIndicator } from '../components/features/OfflineIndicator';
import { FormatUtils } from '../utils/format.utils';
import { NotificationService } from '../services/notification.service';
import type { AddContributionDTO } from '../lib/types';

export const RoomViewPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { room, loading, error, refetch, isSteward, canEdit } = useRoom(token || null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showContributionForm, setShowContributionForm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'timeline' | 'stats'>('visual');
  const [filters, setFilters] = useState<ContributionFilters>({});

  const contributionsHook = useContributions(token || '');
  const analytics = useAnalytics(room);

  // Search and filter contributions
  const {
    filteredContributions,
    stats: searchStats,
    isSearching,
    resultsCount,
    isFiltered,
  } = useContributionSearch(room?.contributions || [], filters);

  if (loading) {
    return <LoadingOverlay message="Loading room..." />;
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Room Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || 'This room does not exist or the link is invalid.'}
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Go to Home
          </Button>
        </Card>
      </div>
    );
  }

  // Steward needs PIN authentication
  if (isSteward && !isAuthenticated) {
    return <PINGate token={token!} onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  const deadlineStatus = room.room.expires_at
    ? NotificationService.getDeadlineStatus(room.room.expires_at)
    : null;

  const handleAddContribution = async (contribution: AddContributionDTO) => {
    const success = await contributionsHook.addContribution(contribution);
    if (success) {
      setShowContributionForm(false);
      refetch();
    }
    return success;
  };

  // Determine which contributions to show based on filters
  const displayContributions = isFiltered ? filteredContributions : room.contributions;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Offline Indicator */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <OfflineIndicator />
      </div>

      {/* Header */}
      <div className={`${isSteward ? 'bg-gradient-to-r from-orange-600 to-orange-700' : 'bg-gradient-to-r from-green-600 to-green-700'} text-white`}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{room.room.title}</h1>
                <Badge variant={room.room.status === 'active' ? 'success' : 'neutral'}>
                  {room.room.status}
                </Badge>
              </div>
              {room.room.description && (
                <p className="text-green-100 mb-4">{room.room.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm">
                <span>💚 {room.room.contributor_count} contributors</span>
                {room.room.target_amount && (
                  <span>
                    🎯 {FormatUtils.formatCurrency(room.room.total_collected, room.room.currency)} / {FormatUtils.formatCurrency(room.room.target_amount, room.room.currency)}
                  </span>
                )}
              </div>
              {deadlineStatus && (
                <div className="mt-3">
                  <Badge variant={deadlineStatus.status === 'urgent' ? 'danger' : 'warning'}>
                    ⏰ {deadlineStatus.message}
                  </Badge>
                </div>
              )}
            </div>
            {isSteward && (
              <div className="ml-4">
                <Badge variant="warning" size="lg">
                  🔐 Steward Mode
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              <Button
                variant={activeTab === 'visual' ? 'primary' : 'ghost'}
                onClick={() => setActiveTab('visual')}
              >
                🎨 Visual
              </Button>
              <Button
                variant={activeTab === 'timeline' ? 'primary' : 'ghost'}
                onClick={() => setActiveTab('timeline')}
              >
                📋 Timeline
              </Button>
              <Button
                variant={activeTab === 'stats' ? 'primary' : 'ghost'}
                onClick={() => setActiveTab('stats')}
              >
                📊 Statistics
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setShowShareModal(true)}>
                Share
              </Button>
              {canEdit && (
                <Button onClick={() => setShowContributionForm(true)}>
                  Add Contribution
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Search/Filter - Only show for timeline view or when there are many contributions */}
        {(activeTab === 'timeline' || room.contributions.length > 10) && (
          <ContributionSearch
            filters={filters}
            onFiltersChange={setFilters}
            resultsCount={resultsCount}
            totalCount={room.contributions.length}
            isSearching={isSearching}
          />
        )}

        {/* Show filtered results message */}
        {isFiltered && (
          <Alert type="info">
            Showing {resultsCount} of {room.contributions.length} contributions
            {searchStats.confirmedCount > 0 && (
              <span className="ml-2">
                • {FormatUtils.formatCurrency(searchStats.confirmedTotal, room.room.currency)} confirmed
              </span>
            )}
          </Alert>
        )}

        {activeTab === 'visual' && (
          <VisualContributionMap
            contributions={displayContributions}
            targetAmount={room.room.target_amount}
            currency={room.room.currency}
          />
        )}

        {activeTab === 'timeline' && (
          <ContributionTimeline
            contributions={displayContributions}
            currency={room.room.currency}
          />
        )}

        {activeTab === 'stats' && analytics && (
          <StatisticsDashboard
            analytics={analytics}
            currency={room.room.currency}
          />
        )}
      </div>

      {/* Modals */}
      {showContributionForm && canEdit && (
        <Modal
          isOpen={showContributionForm}
          onClose={() => setShowContributionForm(false)}
          title="Add Contribution"
          size="lg"
        >
          <ContributionForm
            onSubmit={handleAddContribution}
            currency={room.room.currency}
            onCancel={() => setShowContributionForm(false)}
          />
        </Modal>
      )}

      {showShareModal && (
        <ShareRoomModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          roomDetails={room}
          viewerToken={room.room.viewer_token || token || ''}
        />
      )}
    </div>
  );
};