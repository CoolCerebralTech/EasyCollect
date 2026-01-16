// =====================================================
// hooks/useContributionSearch.ts
// Advanced search specifically for contributions
// =====================================================

import { useMemo } from 'react';
import { useDebounce } from './useDebounce';
import type { RoomContribution } from '../lib/types';

export interface ContributionFilters {
  searchTerm?: string;
  status?: 'confirmed' | 'pledged' | 'all';
  paymentMethod?: string | 'all';
  dateRange?: {
    start: Date;
    end: Date;
  };
  amountRange?: {
    min: number;
    max: number;
  };
}

export const useContributionSearch = (
  contributions: RoomContribution[],
  filters: ContributionFilters = {}
) => {
  const debouncedSearchTerm = useDebounce(filters.searchTerm || '', 300);

  const filteredContributions = useMemo(() => {
    let results = [...contributions];

    // Text search
    if (debouncedSearchTerm.trim()) {
      const lowerSearch = debouncedSearchTerm.toLowerCase();
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(lowerSearch) ||
          c.transaction_ref?.toLowerCase().includes(lowerSearch)
      );
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      results = results.filter((c) => c.status === filters.status);
    }

    // Payment method filter
    if (filters.paymentMethod && filters.paymentMethod !== 'all') {
      results = results.filter((c) => c.payment_method === filters.paymentMethod);
    }

    // Date range filter
    if (filters.dateRange) {
      results = results.filter((c) => {
        if (!c.confirmed_at) return false;
        const date = new Date(c.confirmed_at);
        return date >= filters.dateRange!.start && date <= filters.dateRange!.end;
      });
    }

    // Amount range filter
    if (filters.amountRange) {
      results = results.filter(
        (c) =>
          c.amount >= filters.amountRange!.min &&
          c.amount <= filters.amountRange!.max
      );
    }

    return results;
  }, [contributions, debouncedSearchTerm, filters]);

  // Calculate summary statistics
  const stats = useMemo(() => {
    const total = filteredContributions.reduce((sum, c) => sum + c.amount, 0);
    const confirmed = filteredContributions.filter((c) => c.status === 'confirmed');
    const pledged = filteredContributions.filter((c) => c.status === 'pledged');

    return {
      total,
      count: filteredContributions.length,
      confirmedCount: confirmed.length,
      pledgedCount: pledged.length,
      confirmedTotal: confirmed.reduce((sum, c) => sum + c.amount, 0),
      pledgedTotal: pledged.reduce((sum, c) => sum + c.amount, 0),
    };
  }, [filteredContributions]);

  return {
    filteredContributions,
    stats,
    isSearching: (filters.searchTerm || '') !== debouncedSearchTerm,
    resultsCount: filteredContributions.length,
    hasResults: filteredContributions.length > 0,
    isEmpty: contributions.length === 0,
    isFiltered:
      debouncedSearchTerm.trim() !== '' ||
      (filters.status && filters.status !== 'all') ||
      (filters.paymentMethod && filters.paymentMethod !== 'all') ||
      !!filters.dateRange ||
      !!filters.amountRange,
  };
};