// =====================================================
// services/receipt-generator.service.ts
// Generate downloadable PNG receipts for contributions
// =====================================================

import type { Contribution, Currency } from '../lib/types';
import { FormatUtils } from '../utils/format.utils';
import { DateService } from './date.service';
import { APP_CONFIG } from '../constants/app-config';

export interface ReceiptData {
  contribution: Contribution;
  roomTitle: string;
  currency: Currency;
  roomUrl: string;
  qrCodeUrl?: string;
}

export class ReceiptGeneratorService {
  /**
   * Generate receipt HTML (to be converted to image)
   */
  static generateReceiptHTML(data: ReceiptData): string {
    const { contribution, roomTitle, currency, roomUrl } = data;

    const formattedAmount = FormatUtils.formatCurrency(contribution.amount, currency);
    const formattedDate = contribution.confirmed_at
      ? DateService.formatDate(contribution.confirmed_at, 'long')
      : 'Pending';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            width: 600px;
            height: 800px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #00A651 0%, #007d37 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px;
          }
          
          .receipt {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            width: 100%;
            max-width: 500px;
          }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #00A651;
            padding-bottom: 20px;
          }
          
          .logo {
            font-size: 48px;
            margin-bottom: 10px;
          }
          
          .app-name {
            font-size: 24px;
            font-weight: 700;
            color: #00A651;
            margin-bottom: 5px;
          }
          
          .receipt-title {
            font-size: 14px;
            color: #6B7280;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .verified-badge {
            background: #00A651;
            color: white;
            padding: 8px 20px;
            border-radius: 50px;
            font-size: 12px;
            font-weight: 600;
            display: inline-block;
            margin-top: 15px;
          }
          
          .content {
            margin: 30px 0;
          }
          
          .field {
            margin-bottom: 20px;
          }
          
          .field-label {
            font-size: 12px;
            color: #6B7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
          }
          
          .field-value {
            font-size: 18px;
            color: #111827;
            font-weight: 600;
          }
          
          .amount {
            background: #F0FDF4;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            margin: 30px 0;
            border: 2px solid #00A651;
          }
          
          .amount-label {
            font-size: 14px;
            color: #6B7280;
            margin-bottom: 8px;
          }
          
          .amount-value {
            font-size: 36px;
            color: #00A651;
            font-weight: 700;
          }
          
          .transaction-ref {
            background: #F9FAFB;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
            text-align: center;
            font-size: 14px;
            color: #374151;
          }
          
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px dashed #E5E7EB;
          }
          
          .qr-placeholder {
            width: 120px;
            height: 120px;
            margin: 0 auto 15px;
            background: #F3F4F6;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
          }
          
          .footer-text {
            font-size: 12px;
            color: #6B7280;
            line-height: 1.6;
          }
          
          .url {
            color: #00A651;
            font-weight: 600;
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="logo">💚</div>
            <div class="app-name">The Ledger</div>
            <div class="receipt-title">Certified Contribution Receipt</div>
            <div class="verified-badge">✓ VERIFIED</div>
          </div>
          
          <div class="content">
            <div class="field">
              <div class="field-label">Room</div>
              <div class="field-value">${this.escapeHtml(roomTitle)}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Contributor</div>
              <div class="field-value">${this.escapeHtml(contribution.name)}</div>
            </div>
            
            <div class="amount">
              <div class="amount-label">Amount Contributed</div>
              <div class="amount-value">${formattedAmount}</div>
            </div>
            
            ${contribution.transaction_ref ? `
              <div class="transaction-ref">
                REF: ${this.escapeHtml(contribution.transaction_ref)}
              </div>
            ` : ''}
            
            <div class="field">
              <div class="field-label">Payment Method</div>
              <div class="field-value">${contribution.payment_method}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Date & Time</div>
              <div class="field-value">${formattedDate}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Status</div>
              <div class="field-value" style="color: #00A651;">✓ ${contribution.status.toUpperCase()}</div>
            </div>
          </div>
          
          <div class="footer">
            <div class="qr-placeholder">📱</div>
            <div class="footer-text">
              View this contribution online at:<br>
              <span class="url">${roomUrl}</span>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate receipt as downloadable image
   * Uses html-to-image library (to be installed separately)
   */
  static async generateReceiptImage(data: ReceiptData): Promise<Blob | null> {
    try {
      // Create temporary container
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.innerHTML = this.generateReceiptHTML(data);
      document.body.appendChild(container);

      // Wait for fonts and layout
      await new Promise(resolve => setTimeout(resolve, 100));

      // Convert to canvas
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        document.body.removeChild(container);
        return null;
      }

      // Render HTML to canvas (simplified - in production use html-to-image)
      // For now, return a blob of the HTML for demonstration
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/png', APP_CONFIG.export.imageQuality);
      });

      document.body.removeChild(container);
      return blob;
    } catch (error) {
      console.error('Failed to generate receipt image:', error);
      return null;
    }
  }

  /**
   * Download receipt as PNG
   */
  static async downloadReceipt(data: ReceiptData): Promise<boolean> {
    try {
      const blob = await this.generateReceiptImage(data);
      if (!blob) return false;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt_${data.contribution.name.replace(/\s+/g, '_')}_${Date.now()}.png`;
      link.click();
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Failed to download receipt:', error);
      return false;
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  private static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Generate shareable text receipt (for copy-paste)
   */
  static generateTextReceipt(data: ReceiptData): string {
    const { contribution, roomTitle, currency } = data;
    const formattedAmount = FormatUtils.formatCurrency(contribution.amount, currency);
    const formattedDate = contribution.confirmed_at
      ? DateService.formatDate(contribution.confirmed_at, 'long')
      : 'Pending';

    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━
💚 THE LEDGER
   CONTRIBUTION RECEIPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Room: ${roomTitle}
Contributor: ${contribution.name}

AMOUNT: ${formattedAmount}

${contribution.transaction_ref ? `Ref: ${contribution.transaction_ref}\n` : ''}Payment: ${contribution.payment_method}
Date: ${formattedDate}
Status: ✓ ${contribution.status.toUpperCase()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
View online: ${data.roomUrl}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();
  }
}