// =====================================================
// components/features/ContributionSearch.tsx
// Advanced search and filter for contributions
// =====================================================

import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Select, type SelectOption } from '../ui/Select';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { PAYMENT_METHODS } from '../../lib/constants';
import type { ContributionFilters } from '../../hooks/useContributionSearch';

export interface ContributionSearchProps {
  filters: ContributionFilters;
  onFiltersChange: (filters: ContributionFilters) => void;
  resultsCount: number;
  totalCount: number;
  isSearching?: boolean;
}

export const ContributionSearch: React.FC<ContributionSearchProps> = ({
  filters,
  onFiltersChange,
  resultsCount,
  totalCount,
  isSearching = false,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const statusOptions: SelectOption[] = [
    { value: 'all', label: 'All Status' },
    { value: 'confirmed', label: '✓ Confirmed' },
    { value: 'pledged', label: '⏳ Pledged' },
  ];

  const paymentMethodOptions: SelectOption[] = [
    { value: 'all', label: 'All Methods' },
    ...Object.values(PAYMENT_METHODS).map(pm => ({
      value: pm.id,
      label: `${pm.icon} ${pm.name}`,
    })),
  ];

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, searchTerm: value });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value as 'confirmed' | 'pledged' | 'all',
    });
  };

  const handlePaymentMethodChange = (value: string) => {
    onFiltersChange({ ...filters, paymentMethod: value });
  };

  const handleAmountRangeChange = (min: number, max: number) => {
    if (min === 0 && max === 0) {
      const { ...rest } = filters;
      onFiltersChange(rest);
    } else {
      onFiltersChange({
        ...filters,
        amountRange: { min, max },
      });
    }
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters =
    (filters.searchTerm && filters.searchTerm.trim() !== '') ||
    (filters.status && filters.status !== 'all') ||
    (filters.paymentMethod && filters.paymentMethod !== 'all') ||
    !!filters.dateRange ||
    !!filters.amountRange;

  return (
    <Card>
      <div className="space-y-4">
        {/* Quick Search */}
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by name or transaction reference..."
              value={filters.searchTerm || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              icon={
                isSearching ? (
                  <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )
              }
            />
          </div>
          <Button
            variant="ghost"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Hide Filters' : 'Advanced Filters'}
          </Button>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <Select
              label="Status"
              options={statusOptions}
              value={filters.status || 'all'}
              onChange={handleStatusChange}
            />

            <Select
              label="Payment Method"
              options={paymentMethodOptions}
              value={filters.paymentMethod || 'all'}
              onChange={handlePaymentMethodChange}
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount Range
              </label>
              <div className="flex gap-3 items-center">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.amountRange?.min || ''}
                  onChange={(e) =>
                    handleAmountRangeChange(
                      parseFloat(e.target.value) || 0,
                      filters.amountRange?.max || 0
                    )
                  }
                />
                <span className="text-gray-500">to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.amountRange?.max || ''}
                  onChange={(e) =>
                    handleAmountRangeChange(
                      filters.amountRange?.min || 0,
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <Badge variant="info">
              {resultsCount} of {totalCount} contributions
            </Badge>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};