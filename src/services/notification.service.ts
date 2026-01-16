// =====================================================
// services/notification.service.ts
// Reminder scheduling and deadline tracking
// =====================================================

import { DateService } from './date.service';
import type { RoomDetails } from '../lib/types';

export interface ReminderInfo {
  shouldRemind: boolean;
  scenario: 'early' | 'urgent' | 'late' | null;
  daysRemaining: number;
  message: string;
}

export class NotificationService {
  /**
   * Determine if reminder should be sent
   */
  static shouldSendReminder(
    deadline: string | null,
    lastReminderSent?: Date
  ): ReminderInfo {
    if (!deadline) {
      return {
        shouldRemind: false,
        scenario: null,
        daysRemaining: 0,
        message: '',
      };
    }

    const daysRemaining = DateService.getDaysUntil(deadline);

    // Don't spam - check if reminder was sent recently
    if (lastReminderSent) {
      const hoursSinceLastReminder = 
        (Date.now() - lastReminderSent.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastReminder < 24) {
        return {
          shouldRemind: false,
          scenario: null,
          daysRemaining,
          message: 'Reminder sent recently',
        };
      }
    }

    // Determine scenario
    let scenario: 'early' | 'urgent' | 'late' | null = null;
    let shouldRemind = false;

    if (daysRemaining > 7) {
      // More than a week away
      scenario = 'early';
      shouldRemind = daysRemaining % 7 === 0; // Remind weekly
    } else if (daysRemaining > 0 && daysRemaining <= 3) {
      // 1-3 days remaining
      scenario = 'urgent';
      shouldRemind = true;
    } else if (daysRemaining <= 0) {
      // Past deadline
      scenario = 'late';
      shouldRemind = true;
    }

    return {
      shouldRemind,
      scenario,
      daysRemaining,
      message: this.getScenarioMessage(scenario, daysRemaining),
    };
  }

  /**
   * Get human-readable scenario message
   */
  private static getScenarioMessage(
    scenario: 'early' | 'urgent' | 'late' | null,
    daysRemaining: number
  ): string {
    if (scenario === 'early') {
      return `${daysRemaining} days until deadline - early reminder`;
    }
    if (scenario === 'urgent') {
      return `Only ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left!`;
    }
    if (scenario === 'late') {
      const daysLate = Math.abs(daysRemaining);
      return `${daysLate} day${daysLate === 1 ? '' : 's'} past deadline`;
    }
    return '';
  }

  /**
   * Check if milestone reached
   */
  static checkMilestone(
    currentAmount: number,
    targetAmount: number,
    previousAmount: number
  ): { reached: boolean; percentage: number } | null {
    if (!targetAmount || targetAmount === 0) return null;

    const currentPercentage = (currentAmount / targetAmount) * 100;
    const previousPercentage = (previousAmount / targetAmount) * 100;

    const milestones = [25, 50, 75, 100];

    for (const milestone of milestones) {
      if (currentPercentage >= milestone && previousPercentage < milestone) {
        return { reached: true, percentage: milestone };
      }
    }

    return null;
  }

  /**
   * Get deadline status
   */
  static getDeadlineStatus(deadline: string | null): {
    status: 'safe' | 'approaching' | 'urgent' | 'expired';
    color: string;
    message: string;
  } {
    if (!deadline) {
      return {
        status: 'safe',
        color: '#10B981',
        message: 'No deadline set',
      };
    }

    const daysRemaining = DateService.getDaysUntil(deadline);

    if (daysRemaining < 0) {
      return {
        status: 'expired',
        color: '#EF4444',
        message: 'Deadline passed',
      };
    }

    if (daysRemaining <= 3) {
      return {
        status: 'urgent',
        color: '#F59E0B',
        message: `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left`,
      };
    }

    if (daysRemaining <= 7) {
      return {
        status: 'approaching',
        color: '#F59E0B',
        message: `${daysRemaining} days remaining`,
      };
    }

    return {
      status: 'safe',
      color: '#10B981',
      message: `${daysRemaining} days remaining`,
    };
  }

  /**
   * Get contributors who haven't paid yet
   */
  static getUnpaidContributors(roomDetails: RoomDetails): Array<{
    name: string;
    amount: number;
  }> {
    return roomDetails.contributions
      .filter(c => c.status === 'pledged')
      .map(c => ({
        name: c.name,
        amount: c.amount,
      }));
  }

  /**
   * Calculate reminder priority
   */
  static getReminderPriority(daysRemaining: number): 'low' | 'medium' | 'high' {
    if (daysRemaining <= 0) return 'high';
    if (daysRemaining <= 3) return 'high';
    if (daysRemaining <= 7) return 'medium';
    return 'low';
  }
}