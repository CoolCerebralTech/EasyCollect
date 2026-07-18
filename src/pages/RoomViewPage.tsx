// =====================================================
// pages/RoomViewPage.tsx
// Main room view (handles both steward and viewer)
// =====================================================

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContributions } from '../hooks/useContributions';
import { useAnalytics } from '../hooks/useAnalytics';
import { useRoom } from '../hooks/useRoom';
import { useContributionSearch, type ContributionFilters } from '../hooks/useContributionSearch';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
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

// ✅ Define the Tab type explicitly
type ViewTab = 'visual' | 'timeline' | 'stats';

export const RoomViewPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  // Custom hook usage
  const { room, loading, error, refetch, isOrganizer, canEdit } = useRoom(token || null);
  const contributionsHook = useContributions(token || '');
  
  // Local state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showContributionForm, setShowContributionForm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // ✅ Use the type here
  const [activeTab, setActiveTab] = useState<ViewTab>('visual');
  const [filters, setFilters] = useState<ContributionFilters>({});

  // Analytics
  const analytics = useAnalytics(room);

  // Search logic
  const {
    filteredContributions,
    stats: searchStats,
    isSearching,
    resultsCount,
    isFiltered,
  } = useContributionSearch(room?.contributions || [], filters);

  // ✅ Define tabs with strict types to fix the "any" error
  const tabs: { id: ViewTab; label: string; icon: string }[] = [
    { id: 'visual', label: 'Overview', icon: '🎨' },
    { id: 'timeline', label: 'List', icon: '📋' },
    { id: 'stats', label: 'Analytics', icon: '📊' },
  ];

  // --- LOADING STATE ---
  if (loading) {
    return <LoadingOverlay message="Loading room details..." />;
  }

  // --- ERROR STATE ---
  if (error || !room) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4 grayscale opacity-50">🏚️</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Room Not Found</h2>
          <p className="text-slate-600 mb-6">
            {error || 'This link is invalid or has been removed.'}
          </p>
          <Button onClick={() => navigate('/')} variant="secondary">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  // --- PIN GATE (Organizer Only) ---
  if (isOrganizer && !isAuthenticated) {
    return <PINGate token={token!} onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  // Derived Data
  const deadlineStatus = room.room.expires_at
    ? NotificationService.getDeadlineStatus(room.room.expires_at)
    : null;
    
  const displayContributions = isFiltered ? filteredContributions : room.contributions;
  const hasContributions = room.contributions.length > 0;

  // Handlers
  const handleAddContribution = async (contribution: AddContributionDTO) => {
    const success = await contributionsHook.addContribution(contribution);
    if (success) {
      setShowContributionForm(false);
      refetch();
    }
    return success;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* --- HEADER SECTION --- */}
      <div className={`${isOrganizer ? 'bg-amber-600' : 'bg-green-700'} text-white shadow-lg transition-colors duration-300`}>
        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            
            {/* Title & Stats */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                <h1 className="text-xl sm:text-3xl font-bold tracking-tight break-words">{room.room.title}</h1>
                <Badge variant={room.room.status === 'active' ? 'success' : 'neutral'} className="shadow-sm">
                  {room.room.status}
                </Badge>
                {isOrganizer && (
                  <span className="bg-amber-800/40 border border-amber-400/30 text-amber-50 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                    👑 Admin
                  </span>
                )}
              </div>
              
              {room.room.description && (
                <p className="text-white/80 text-sm sm:text-base mb-4 max-w-2xl leading-relaxed">
                  {room.room.description}
                </p>
              )}

              {/* Quick Stats Grid - horizontal scroll on mobile */}
              <div className="flex flex-wrap gap-2 sm:gap-4 mt-4 overflow-x-auto -mx-1 px-1 pb-1">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-2 border border-white/10 shrink-0">
                  <div className="text-xs text-white/60 uppercase tracking-wider font-semibold">Total Raised</div>
                  <div className="text-lg sm:text-xl font-bold font-mono">
                    {FormatUtils.formatCurrency(room.room.total_collected, room.room.currency)}
                  </div>
                </div>
                
                {room.room.target_amount && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-2 border border-white/10 shrink-0">
                    <div className="text-xs text-white/60 uppercase tracking-wider font-semibold">Target</div>
                    <div className="text-lg sm:text-xl font-bold font-mono">
                      {FormatUtils.formatCurrency(room.room.target_amount, room.room.currency)}
                    </div>
                  </div>
                )}

                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-2 border border-white/10 shrink-0">
                  <div className="text-xs text-white/60 uppercase tracking-wider font-semibold">Contributors</div>
                  <div className="text-lg sm:text-xl font-bold font-mono flex items-center gap-2">
                    {room.room.contributor_count} <span className="text-sm font-normal opacity-60">people</span>
                  </div>
                </div>
              </div>

              {deadlineStatus && (
                <div className="mt-4 inline-flex">
                   <Badge variant={deadlineStatus.status === 'urgent' ? 'danger' : 'warning'}>
                    ⏰ {deadlineStatus.message}
                  </Badge>
                </div>
              )}
            </div>

            {/* Header Actions (Desktop) */}
            <div className="hidden md:flex flex-col gap-2 min-w-[140px]">
               <Button 
                variant="secondary" 
                onClick={() => setShowShareModal(true)}
                className="bg-white/90 hover:bg-white text-slate-800 border-none shadow-md"
              >
                🔗 Share Link
              </Button>
              {canEdit && (
                <Button 
                  onClick={() => setShowContributionForm(true)}
                  className="bg-slate-900 hover:bg-slate-800 text-white shadow-md border-none"
                >
                  ➕ Add Payment
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- TAB NAVIGATION --- */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex gap-4 sm:gap-6 h-full overflow-x-auto no-scrollbar">
              {/* ✅ Mapped using the typed 'tabs' array */}
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`h-full flex items-center gap-2 text-sm font-medium border-b-2 transition-all px-1 whitespace-nowrap ${
                    activeTab === tab.id 
                      ? (isOrganizer 
                          ? 'border-amber-600 text-amber-700' 
                          : 'border-green-600 text-green-700')
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
            
            {/* Mobile Actions (Visible on small screens) */}
            <div className="md:hidden flex gap-2">
               {canEdit ? (
                 <button 
                  onClick={() => setShowContributionForm(true)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm active:scale-90 transition-transform ${isOrganizer ? 'bg-amber-600' : 'bg-slate-900'}`}
                  aria-label="Add payment"
                 >
                   ➕
                 </button>
               ) : (
                 <button 
                  onClick={() => setShowShareModal(true)}
                  className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shadow-sm active:scale-90 transition-transform"
                  aria-label="Share link"
                 >
                   🔗
                 </button>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        
        {/* Empty State Handler */}
        {!hasContributions && (
          <div className="bg-white rounded-xl p-10 text-center border-2 border-dashed border-slate-200">
            <div className="text-6xl mb-4 opacity-50">🍃</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No contributions yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-6">
              This group is fresh! Share the link with your members, or add the first payment to get started.
            </p>
            {canEdit ? (
              <Button onClick={() => setShowContributionForm(true)} size="lg">
                Add First Contribution
              </Button>
            ) : (
              <Button variant="secondary" onClick={() => setShowShareModal(true)}>
                Share Group Link
              </Button>
            )}
          </div>
        )}

        {/* Search Bar (Only visible if data exists) */}
        {hasContributions && (activeTab === 'timeline' || room.contributions.length > 5) && (
          <ContributionSearch
            filters={filters}
            onFiltersChange={setFilters}
            resultsCount={resultsCount}
            totalCount={room.contributions.length}
            isSearching={isSearching}
          />
        )}

        {/* Filter Results Alert */}
        {isFiltered && (
          <Alert type="info">
            Found {resultsCount} result{resultsCount !== 1 ? 's' : ''}
            {searchStats.confirmedCount > 0 && (
              <span className="font-mono ml-2 font-bold">
                (Total: {FormatUtils.formatCurrency(searchStats.confirmedTotal, room.room.currency)})
              </span>
            )}
          </Alert>
        )}

        {/* TABS CONTENT */}
        {hasContributions && (
          <>
            <div className={activeTab === 'visual' ? 'block' : 'hidden'}>
              <VisualContributionMap
                contributions={displayContributions}
                targetAmount={room.room.target_amount}
                currency={room.room.currency}
              />
            </div>

            <div className={activeTab === 'timeline' ? 'block' : 'hidden'}>
              <ContributionTimeline
                contributions={displayContributions}
                currency={room.room.currency}
              />
            </div>

            <div className={activeTab === 'stats' ? 'block' : 'hidden'}>
              {analytics && (
                <StatisticsDashboard
                  analytics={analytics}
                  currency={room.room.currency}
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* --- MODALS --- */}
      
      {/* Add Contribution Modal */}
      {showContributionForm && canEdit && (
        <Modal
          isOpen={showContributionForm}
          onClose={() => setShowContributionForm(false)}
          title="Record Payment"
          size="lg"
        >
          <ContributionForm
            onSubmit={handleAddContribution}
            currency={room.room.currency}
            onCancel={() => setShowContributionForm(false)}
          />
        </Modal>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareRoomModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          roomDetails={room}
          viewerToken={room.room.contributor_token || ''}
        />
      )}
      {/* --- STICKY MOBILE BOTTOM BAR (organizers only) --- */}
      {canEdit && (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex gap-3">
            <Button
              onClick={() => setShowContributionForm(true)}
              size="lg"
              fullWidth
              className="font-semibold min-h-[48px] shadow-md"
            >
              ➕ Add Payment
            </Button>
            <button
              onClick={() => setShowShareModal(true)}
              className="px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center min-w-[48px] min-h-[48px] active:scale-95 transition-transform"
              aria-label="Share link"
            >
              🔗
            </button>
          </div>
        </div>
      )}
    </div>
  );
};