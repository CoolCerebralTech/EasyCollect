// =====================================================
// components/features/StatisticsDashboard.tsx
// Comprehensive statistics display
// =====================================================

import React from 'react';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';
import { FormatUtils } from '../../utils/format.utils';
import { DateService } from '../../services/date.service';
import type { RoomAnalytics } from '../../services/analytics.service';
import type { Currency } from '../../lib/types';

export interface StatisticsDashboardProps {
  analytics: RoomAnalytics;
  currency: Currency;
}

export const StatisticsDashboard: React.FC<StatisticsDashboardProps> = ({
  analytics,
  currency,
}) => {
  const stats = [
    {
      label: 'Total Collected',
      value: FormatUtils.formatCurrency(analytics.totalCollected, currency),
      icon: '💰',
      color: 'text-green-600',
    },
    {
      label: 'Contributors',
      value: analytics.contributorCount.toString(),
      icon: '👥',
      color: 'text-blue-600',
    },
    {
      label: 'Average Contribution',
      value: FormatUtils.formatCurrency(analytics.averageContribution, currency),
      icon: '📊',
      color: 'text-purple-600',
    },
    {
      label: 'Largest Contribution',
      value: FormatUtils.formatCurrency(analytics.largestContribution, currency),
      icon: '🏆',
      color: 'text-yellow-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} hover>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
              <span className="text-4xl">{stat.icon}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Completion Progress */}
      {analytics.completionPercentage !== null && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Goal Progress
          </h3>
          <ProgressBar
            value={analytics.completionPercentage}
            max={100}
            showPercentage
            size="lg"
            color={analytics.completionPercentage >= 100 ? 'green' : 'blue'}
          />
          {analytics.remainingAmount !== null && analytics.remainingAmount > 0 && (
            <p className="text-sm text-gray-600 mt-3">
              {FormatUtils.formatCurrency(analytics.remainingAmount, currency)} remaining
            </p>
          )}
          {analytics.projectedCompletion && analytics.completionPercentage < 100 && (
            <p className="text-sm text-gray-600 mt-2">
              Projected completion: {DateService.formatDate(analytics.projectedCompletion, 'short')}
            </p>
          )}
        </Card>
      )}

      {/* Payment Method Breakdown */}
      {analytics.paymentMethods.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Payment Methods
          </h3>
          <div className="space-y-3">
            {analytics.paymentMethods.map((method) => (
              <div key={method.method} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="neutral">{method.method}</Badge>
                  <span className="text-sm text-gray-600">
                    {method.count} contribution{method.count !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {FormatUtils.formatCurrency(method.total, currency)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {method.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Top Contributors */}
      {analytics.topContributors.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Contributors
          </h3>
          <div className="space-y-3">
            {analytics.topContributors.slice(0, 5).map((contributor, index) => (
              <div key={contributor.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{contributor.name}</p>
                    <p className="text-xs text-gray-500">
                      {contributor.contributionCount} contribution{contributor.contributionCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-gray-900">
                  {FormatUtils.formatCurrency(contributor.totalContributed, currency)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};