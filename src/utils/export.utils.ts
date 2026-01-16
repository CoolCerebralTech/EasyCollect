// =====================================================
// src/utils/export.utils.ts
// CSV and PDF export utilities
// =====================================================

import type { Contribution, RoomDetails } from '../lib/types';
import { FormatUtils } from './format.utils';

export class ExportUtils {
  /**
   * Export contributions to CSV
   */
  static exportToCSV(
    contributions: Contribution[],
    roomTitle: string
  ): void {
    const headers = [
      'Name',
      'Amount',
      'Payment Method',
      'Transaction Ref',
      'Status',
      'Date',
      'Notes',
    ];

    const rows = contributions.map(c => [
      // CSV injection protection: prefix with single quote if starts with =,+,-,@
      FormatUtils.sanitizeForCSV(c.name),
      c.amount.toString(),
      c.payment_method,
      FormatUtils.sanitizeForCSV(c.transaction_ref || ''),
      c.status,
      c.confirmed_at ? new Date(c.confirmed_at).toLocaleDateString() : '',
      FormatUtils.sanitizeForCSV(c.notes || ''),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${roomTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_contributions.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Generate text summary for export
   */
  static generateTextSummary(roomDetails: RoomDetails): string {
    const { room, contributions } = roomDetails;
    
    const lines = [
      `===== ${room.title.toUpperCase()} =====`,
      '',
      `Description: ${room.description || 'N/A'}`,
      `Target: ${room.target_amount ? FormatUtils.formatCurrency(room.target_amount, room.currency) : 'Open'}`,
      `Total Collected: ${FormatUtils.formatCurrency(room.total_collected, room.currency)}`,
      `Contributors: ${room.contributor_count}`,
      `Status: ${room.status.toUpperCase()}`,
      `Created: ${new Date(room.created_at).toLocaleDateString()}`,
      '',
      '===== CONTRIBUTIONS =====',
      '',
    ];

    contributions.forEach((c, i) => {
      lines.push(`${i + 1}. ${c.name}`);
      lines.push(`   Amount: ${FormatUtils.formatCurrency(c.amount, room.currency)}`);
      lines.push(`   Method: ${c.payment_method}`);
      if (c.transaction_ref) {
        lines.push(`   Ref: ${c.transaction_ref}`);
      }
      lines.push(`   Status: ${c.status}`);
      lines.push(`   Date: ${c.confirmed_at ? new Date(c.confirmed_at).toLocaleDateString() : 'Pending'}`);
      lines.push('');
    });

    return lines.join('\n');
  }

  /**
   * Copy text to clipboard
   */
  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  /**
   * Download text as file
   */
  static downloadTextFile(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}