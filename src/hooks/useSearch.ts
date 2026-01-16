// =====================================================
// hooks/useSearch.ts
// Smart search/filter hook for contributions
// =====================================================

import { useMemo } from 'react';
import { useDebounce } from './useDebounce';
import type { RoomContribution } from '../lib/types';

export interface SearchOptions {
  searchTerm: string;
  searchFields?: Array<'name' | 'transaction_ref' | 'phone_number'>;
  caseSensitive?: boolean;
}

export const useSearch = (
  contributions: RoomContribution[],
  searchTerm: string,
  searchFields: Array<'name' | 'transaction_ref'> = ['name', 'transaction_ref']
) => {
  // Debounce search term to avoid excessive filtering
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredContributions = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return contributions;
    }

    const lowerSearchTerm = debouncedSearchTerm.toLowerCase();

    return contributions.filter((contribution) => {
      return searchFields.some((field) => {
        const value = contribution[field];
        if (!value) return false;
        return value.toString().toLowerCase().includes(lowerSearchTerm);
      });
    });
  }, [contributions, debouncedSearchTerm, searchFields]);

  return {
    filteredContributions,
    isSearching: searchTerm !== debouncedSearchTerm,
    resultsCount: filteredContributions.length,
    hasResults: filteredContributions.length > 0,
  };
};
