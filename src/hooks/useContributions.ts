// =====================================================
// hooks/useContributions.ts
// Hook for managing contributions
// =====================================================

import { useState } from 'react';
import { db } from '../lib/database.service';
import type { AddContributionDTO, UpdateContributionDTO } from '../lib/types';
import { useToast } from '../components/ui/Toast';

export const useContributions = (stewardToken: string) => {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const addContribution = async (contribution: AddContributionDTO) => {
    setLoading(true);
    const result = await db.contributions.addContribution(stewardToken, contribution);
    setLoading(false);

    if (result.success) {
      showToast({
        type: 'success',
        message: 'Contribution added successfully!',
      });
      return true;
    } else {
      showToast({
        type: 'error',
        message: result.error.message,
      });
      return false;
    }
  };

  const updateContribution = async (update: UpdateContributionDTO) => {
    setLoading(true);
    const result = await db.contributions.updateContribution(stewardToken, update);
    setLoading(false);

    if (result.success) {
      showToast({
        type: 'success',
        message: 'Contribution updated successfully!',
      });
      return true;
    } else {
      showToast({
        type: 'error',
        message: result.error.message,
      });
      return false;
    }
  };

  const deleteContribution = async (contributionId: string) => {
    setLoading(true);
    const result = await db.contributions.deleteContribution(stewardToken, contributionId);
    setLoading(false);

    if (result.success) {
      showToast({
        type: 'success',
        message: 'Contribution deleted successfully!',
      });
      return true;
    } else {
      showToast({
        type: 'error',
        message: result.error.message,
      });
      return false;
    }
  };

  return {
    loading,
    addContribution,
    updateContribution,
    deleteContribution,
  };
};
