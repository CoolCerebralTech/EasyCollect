// =====================================================
// hooks/useContributions.ts
// Hook for managing contributions
// =====================================================

import { db } from '../services/db.service';
import type { AddContributionDTO, UpdateContributionDTO } from '../lib/app.types';
import { useAsyncAction } from './useAsyncAction'; // Import the new hook

export const useContributions = (stewardToken: string) => {
  const { execute, loading } = useAsyncAction();

  const addContribution = async (contribution: AddContributionDTO) => {
    const success = await execute(
      () => db.contributions.addContribution(stewardToken, contribution),
      {
        successMessage: 'Contribution added successfully!',
        errorMessage: 'Failed to add contribution', // Generic message, specific error will be shown by useAsyncAction
      }
    );
    return success !== undefined; // Return true if successful, false if error (as execute returns undefined on error)
  };

  const updateContribution = async (update: UpdateContributionDTO) => {
    const success = await execute(
      () => db.contributions.updateContribution(stewardToken, update),
      {
        successMessage: 'Contribution updated successfully!',
        errorMessage: 'Failed to update contribution',
      }
    );
    return success !== undefined;
  };

  const deleteContribution = async (contributionId: string) => {
    const success = await execute(
      () => db.contributions.deleteContribution(stewardToken, contributionId),
      {
        successMessage: 'Contribution deleted successfully!',
        errorMessage: 'Failed to delete contribution',
      }
    );
    return success !== undefined;
  };

  return {
    loading,
    addContribution,
    updateContribution,
    deleteContribution,
  };
};
