// =====================================================
// components/features/ContributionTimeline.tsx
// Timeline view of all contributions
// =====================================================

import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { FormatUtils } from '../../utils/format.utils';
import { DateService } from '../../services/date.service';
import { PAYMENT_METHODS } from '../../constants/payment-methods';
import type { Contribution, Currency } from '../../lib/types';

export interface ContributionTimelineProps {
  contributions: Contribution[];
  currency: Currency;
  onContributionClick?: (contribution: Contribution) => void;
  showActions?: boolean;
}

export const ContributionTimeline: React.FC<ContributionTimelineProps> = ({
  contributions,
  currency,
  onContributionClick,
}) => {
  if (contributions.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          title="No contributions yet"
          description="Contributions will appear here as they come in"
        />
      </Card>
    );
  }

  // Sort by date (newest first)
  const sortedContributions = [...contributions].sort((a, b) => {
    const dateA = a.confirmed_at ? new Date(a.confirmed_at).getTime() : 0;
    const dateB = b.confirmed_at ? new Date(b.confirmed_at).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <Card padding="none">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900">
          Contribution Timeline
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {contributions.length} contribution{contributions.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {sortedContributions.map((contribution) => {
          const paymentMethod = PAYMENT_METHODS[contribution.payment_method];

          return (
            <div
              key={contribution.id}
              className={`p-6 hover:bg-gray-50 transition-colors ${
                onContributionClick ? 'cursor-pointer' : ''
              }`}
              onClick={() => onContributionClick && onContributionClick(contribution)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{paymentMethod.icon}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {contribution.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {contribution.confirmed_at
                          ? DateService.formatDate(contribution.confirmed_at, 'relative')
                          : 'Pending'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    <Badge variant={contribution.status === 'confirmed' ? 'success' : 'warning'}>
                      {contribution.status}
                    </Badge>
                    {contribution.transaction_ref && (
                      <span className="text-xs font-mono text-gray-500">
                        {contribution.transaction_ref}
                      </span>
                    )}
                  </div>

                  {contribution.notes && (
                    <p className="text-sm text-gray-600 mt-2">
                      {contribution.notes}
                    </p>
                  )}
                </div>

                <div className="text-right ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {FormatUtils.formatCurrency(contribution.amount, currency)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {paymentMethod.name}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};