// =====================================================
// services/analytics.service.ts
// Statistics calculation and trend analysis
// =====================================================

import type { RoomDetails, RoomContribution, Currency } from '../lib/types';
import { DateService } from './date.service';
import { FormatUtils } from '../utils/format.utils';

export interface ContributionTrend {
  date: string;
  count: number;
  total: number;
}

export interface PaymentMethodStats {
  method: string;
  count: number;
  total: number;
  percentage: number;
}

export interface ContributorStats {
  name: string;
  totalContributed: number;
  contributionCount: number;
  averageContribution: number;
  lastContribution: Date;
}

export interface RoomAnalytics {
  totalCollected: number;
  totalPledged: number;
  contributorCount: number;
  averageContribution: number;
  largestContribution: number;
  smallestContribution: number;
  completionPercentage: number | null;
  dailyTrend: ContributionTrend[];
  paymentMethods: PaymentMethodStats[];
  topContributors: ContributorStats[];
  contributionVelocity: number; // Contributions per day
  projectedCompletion: Date | null;
  remainingAmount: number | null;
}

export class AnalyticsService {
  /**
   * Calculate comprehensive room analytics
   */
  static calculateRoomAnalytics(roomDetails: RoomDetails): RoomAnalytics {
    const { room, contributions } = roomDetails;
    const confirmedContributions = contributions.filter(c => c.status === 'confirmed');

    // Basic stats
    const totalCollected = room.total_collected;
    const totalPledged = room.total_pledged;
    const contributorCount = room.contributor_count;

    // Contribution amounts
    const amounts = confirmedContributions.map(c => c.amount);
    const averageContribution = amounts.length > 0
      ? amounts.reduce((sum, a) => sum + a, 0) / amounts.length
      : 0;
    const largestContribution = amounts.length > 0 ? Math.max(...amounts) : 0;
    const smallestContribution = amounts.length > 0 ? Math.min(...amounts) : 0;

    // Completion percentage
    const completionPercentage = room.target_amount
      ? (totalCollected / room.target_amount) * 100
      : null;

    // Daily trend
    const dailyTrend = this.calculateDailyTrend(confirmedContributions);

    // Payment method breakdown
    const paymentMethods = this.calculatePaymentMethodStats(confirmedContributions, totalCollected);

    // Top contributors
    const topContributors = this.calculateTopContributors(confirmedContributions);

    // Velocity and projection
    const contributionVelocity = this.calculateVelocity(confirmedContributions, new Date(room.created_at));
    const projectedCompletion = room.target_amount && contributionVelocity > 0
      ? this.projectCompletionDate(totalCollected, room.target_amount, contributionVelocity)
      : null;

    const remainingAmount = room.target_amount
      ? Math.max(0, room.target_amount - totalCollected)
      : null;

    return {
      totalCollected,
      totalPledged,
      contributorCount,
      averageContribution,
      largestContribution,
      smallestContribution,
      completionPercentage,
      dailyTrend,
      paymentMethods,
      topContributors,
      contributionVelocity,
      projectedCompletion,
      remainingAmount,
    };
  }

  /**
   * Calculate daily contribution trend (last 30 days)
   */
  private static calculateDailyTrend(contributions: RoomContribution[]): ContributionTrend[] {
    const trendMap = new Map<string, { count: number; total: number }>();

    contributions.forEach(c => {
      if (!c.confirmed_at) return;
      
      const date = new Date(c.confirmed_at);
      const dateKey = DateService.toInputFormat(date);

      const existing = trendMap.get(dateKey) || { count: 0, total: 0 };
      trendMap.set(dateKey, {
        count: existing.count + 1,
        total: existing.total + c.amount,
      });
    });

    // Convert to array and sort by date
    return Array.from(trendMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 30);
  }

  /**
   * Calculate payment method statistics
   */
  private static calculatePaymentMethodStats(
    contributions: RoomContribution[],
    totalAmount: number
  ): PaymentMethodStats[] {
    const methodMap = new Map<string, { count: number; total: number }>();

    contributions.forEach(c => {
      const existing = methodMap.get(c.payment_method) || { count: 0, total: 0 };
      methodMap.set(c.payment_method, {
        count: existing.count + 1,
        total: existing.total + c.amount,
      });
    });

    return Array.from(methodMap.entries())
      .map(([method, data]) => ({
        method,
        ...data,
        percentage: totalAmount > 0 ? (data.total / totalAmount) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }

  /**
   * Calculate top contributors
   */
  private static calculateTopContributors(contributions: RoomContribution[]): ContributorStats[] {
    const contributorMap = new Map<string, {
      total: number;
      count: number;
      lastDate: Date;
    }>();

    contributions.forEach(c => {
      const existing = contributorMap.get(c.name) || {
        total: 0,
        count: 0,
        lastDate: new Date(0),
      };

      const contributionDate = c.confirmed_at ? new Date(c.confirmed_at) : new Date();

      contributorMap.set(c.name, {
        total: existing.total + c.amount,
        count: existing.count + 1,
        lastDate: contributionDate > existing.lastDate ? contributionDate : existing.lastDate,
      });
    });

    return Array.from(contributorMap.entries())
      .map(([name, data]) => ({
        name,
        totalContributed: data.total,
        contributionCount: data.count,
        averageContribution: data.total / data.count,
        lastContribution: data.lastDate,
      }))
      .sort((a, b) => b.totalContributed - a.totalContributed)
      .slice(0, 10);
  }

  /**
   * Calculate contribution velocity (amount per day)
   */
  private static calculateVelocity(contributions: RoomContribution[], startDate: Date): number {
    if (contributions.length === 0) return 0;

    const totalAmount = contributions.reduce((sum, c) => sum + c.amount, 0);
    const daysSinceStart = Math.max(1, (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    return totalAmount / daysSinceStart;
  }

  /**
   * Project completion date based on current velocity
   */
  private static projectCompletionDate(
    currentAmount: number,
    targetAmount: number,
    velocity: number
  ): Date | null {
    if (velocity <= 0 || currentAmount >= targetAmount) return null;

    const remainingAmount = targetAmount - currentAmount;
    const daysToCompletion = remainingAmount / velocity;

    const projectedDate = new Date();
    projectedDate.setDate(projectedDate.getDate() + Math.ceil(daysToCompletion));

    return projectedDate;
  }

  /**
   * Generate text summary
   */
  static generateSummary(analytics: RoomAnalytics, currency: Currency): string {
    const lines: string[] = [];

    lines.push('📊 CONTRIBUTION SUMMARY');
    lines.push('');
    lines.push(`Total Collected: ${FormatUtils.formatCurrency(analytics.totalCollected, currency)}`);
    
    if (analytics.totalPledged > 0) {
      lines.push(`Total Pledged: ${FormatUtils.formatCurrency(analytics.totalPledged, currency)}`);
    }

    lines.push(`Contributors: ${analytics.contributorCount}`);
    lines.push(`Average: ${FormatUtils.formatCurrency(analytics.averageContribution, currency)}`);

    if (analytics.completionPercentage !== null) {
      lines.push(`Completion: ${analytics.completionPercentage.toFixed(1)}%`);
    }

    if (analytics.remainingAmount !== null && analytics.remainingAmount > 0) {
      lines.push(`Remaining: ${FormatUtils.formatCurrency(analytics.remainingAmount, currency)}`);
    }

    if (analytics.projectedCompletion) {
      lines.push(`Projected Completion: ${DateService.formatDate(analytics.projectedCompletion, 'short')}`);
    }

    return lines.join('\n');
  }
}