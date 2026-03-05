// =====================================================
// services/whatsapp.service.ts
// WhatsApp deep link generation and message formatting
// =====================================================

import { APP_CONFIG } from '../lib/constants';
import { REMINDER_TEMPLATES, type ReminderParams } from '../lib/constants';
import type { Currency } from '../lib/app.types';

export class WhatsAppService {
  /**
   * Generate WhatsApp deep link with pre-filled message
   */
  static generateDeepLink(phoneNumber: string | null, message: string): string {
    const encodedMessage = encodeURIComponent(message);
    
    if (phoneNumber) {
      // Clean phone number (remove non-digits)
      const cleaned = phoneNumber.replace(/\D/g, '');
      return `${APP_CONFIG.urls.whatsappBase}/${cleaned}?text=${encodedMessage}`;
    }

    // No specific recipient - open WhatsApp with message
    return `${APP_CONFIG.urls.whatsappBase}?text=${encodedMessage}`;
  }

  /**
   * Generate reminder message based on scenario
   */
  static generateReminderMessage(
    scenario: 'early' | 'urgent' | 'late',
    params: ReminderParams
  ): string {
    const template = REMINDER_TEMPLATES.find(t => t.id === scenario);
    return template ? template.template(params) : '';
  }

  /**
   * Generate milestone celebration message
   */
  static generateMilestoneMessage(params: ReminderParams): string {
    const template = REMINDER_TEMPLATES.find(t => t.id === 'milestone');
    return template ? template.template(params) : '';
  }

  /**
   * Generate completion message
   */
  static generateCompletionMessage(params: ReminderParams): string {
    const template = REMINDER_TEMPLATES.find(t => t.id === 'complete');
    return template ? template.template(params) : '';
  }

  /**
   * Open WhatsApp with message
   */
  static openWhatsApp(phoneNumber: string | null, message: string): void {
    const link = this.generateDeepLink(phoneNumber, message);
    window.open(link, '_blank');
  }

  /**
   * Generate contribution request message
   */
  static generateContributionRequest(
    roomTitle: string,
    amount: number,
    currency: Currency,
    deadline: string,
    roomUrl: string
  ): string {
    return `Hi! 👋

You're invited to contribute to *${roomTitle}*.

Amount: ${currency} ${amount.toLocaleString()}
Deadline: ${deadline}

View details and contribute here: ${roomUrl}

Thank you! 🙏`;
  }

  /**
   * Generate thank you message
   */
  static generateThankYouMessage(
    name: string,
    roomTitle: string,
    amount: number,
    currency: Currency
  ): string {
    return `Thank you, ${name}! 🎉

Your contribution of ${currency} ${amount.toLocaleString()} for *${roomTitle}* has been confirmed.

Your support means a lot to us! 💚`;
  }

  /**
   * Share room link
   */
  static generateShareMessage(roomTitle: string, roomUrl: string, description?: string): string {
    return `📊 *${roomTitle}*

${description ? `${description}\n\n` : ''}Join and track contributions here: ${roomUrl}

Powered by The Ledger 💚`;
  }
}
