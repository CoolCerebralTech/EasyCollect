// =====================================================
// src/services/mpesa-parser.service.ts
// Enhanced M-Pesa SMS parsing with multiple format support
// =====================================================

import { DateService } from './date.service';

export interface ParsedMpesaTransaction {
  code: string;
  amount: number;
  sender: string;
  date: Date;
  rawDate: string;
  rawTime: string;
}

export interface MpesaParseResult {
  success: boolean;
  transaction?: ParsedMpesaTransaction;
  error?: string;
  confidence: 'high' | 'medium' | 'low';
}

export class MpesaParserService {
  // Multiple M-Pesa SMS formats
  // Note: These regex patterns are complex.
  // Group 1: Code
  // Group 2: Amount (Standard) or Date (Newer)
  private static readonly PATTERNS = [
    // Format 1: Standard "Confirmed"
    // e.g. "RGH7K2L9XM Confirmed. Ksh500.00 sent to JOHN DOE on 15/1/25 at 10:30 AM"
    // Groups: 1=Code, 2=Amount, 3=Sender, 4=Date, 5=Time
    /([A-Z0-9]{10})\s+Confirmed\.?\s*(?:You have received|Ksh|KES)?\s*(?:Ksh|KES)?\s*([0-9,]+(?:\.\d{2})?)\s+(?:from|sent to)\s+(.+?)\s+on\s+(\d{1,2}\/\d{1,2}\/\d{2,4})\s+at\s+(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))/i,
    
    // Format 2: Newer M-Pesa format / Business
    // e.g. "RGH7K2L9XM confirmed on 15/1/25 at 10:30 PM. You have received Ksh500.00 from JOHN DOE"
    // Groups: 1=Code, 2=Date, 3=Time, 4=Amount, 5=Sender
    /([A-Z0-9]{10})\s+confirmed\.?\s+(?:on\s+)?(\d{1,2}\/\d{1,2}\/\d{2,4})\s+at\s+(\d{1,2}:\d{2}\s*(?:AM|PM))\s+You have received\s+(?:Ksh|KES)?\s*([0-9,]+(?:\.\d{2})?)\s+from\s+(.+?)(?:\s+New|$)/i,
    
    // Format 3: Simplified / Copied Text
    // e.g. "RGH7K2L9XM Ksh 500 from JOHN DOE"
    // Groups: 1=Code, 2=Amount, 3=Sender
    /([A-Z0-9]{10}).*?(?:Ksh|KES)\s*([0-9,]+(?:\.\d{2})?)\s+from\s+([A-Z\s]+)/i,
  ];

  /**
   * Parse M-Pesa SMS with multiple format support
   */
  static parseSMS(smsText: string): MpesaParseResult {
    const cleaned = smsText.trim();

    // Try each pattern
    for (let i = 0; i < this.PATTERNS.length; i++) {
      const pattern = this.PATTERNS[i];
      const match = cleaned.match(pattern);

      if (match) {
        try {
          const result = this.extractFromMatch(match, i);
          if (result) {
            return {
              success: true,
              transaction: result,
              confidence: i === 0 ? 'high' : i === 1 ? 'medium' : 'low',
            };
          }
        } catch (e) {
          console.warn(`Pattern ${i} failed despite match`, e);
          continue; // Try next pattern
        }
      }
    }

    return {
      success: false,
      error: 'Could not parse M-Pesa SMS. Please enter details manually.',
      confidence: 'low',
    };
  }

  /**
   * Extract transaction details from regex match
   */
  private static extractFromMatch(
    match: RegExpMatchArray,
    patternIndex: number
  ): ParsedMpesaTransaction | null {
    try {
      let code: string = '';
      let amount: number = 0;
      let sender: string = '';
      let rawDate: string = '';
      let rawTime: string = '';

      if (patternIndex === 0) {
        // Standard format
        // 1=Code, 2=Amount, 3=Sender, 4=Date, 5=Time
        code = match[1];
        const amountStr = match[2];
        sender = match[3];
        rawDate = match[4];
        rawTime = match[5];
        amount = parseFloat(amountStr.replace(/,/g, ''));
      } else if (patternIndex === 1) {
        // Newer format
        // 1=Code, 2=Date, 3=Time, 4=Amount, 5=Sender
        code = match[1];
        rawDate = match[2];
        rawTime = match[3];
        const amountStr = match[4];
        sender = match[5];
        amount = parseFloat(amountStr.replace(/,/g, ''));
      } else {
        // Simplified format
        code = match[1];
        const amountStr = match[2];
        sender = match[3];
        amount = parseFloat(amountStr.replace(/,/g, ''));
        // Fallback date/time for simplified format
        const now = new Date();
        rawDate = now.toLocaleDateString('en-GB'); // DD/MM/YYYY
        rawTime = now.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
      }

      // Validate extracted data
      if (!code || !amount || !sender) {
        return null;
      }

      if (isNaN(amount) || amount <= 0) {
        return null;
      }

      // Parse date
      let date: Date | null = null;
      
      if (patternIndex < 2) {
         // Uses strict parsing for real SMS formats
         date = DateService.parseMpesaDateTime(rawDate, rawTime);
      } else {
         // Uses current time for simplified fallback
         date = new Date();
      }

      if (!date) {
        return null;
      }

      return {
        code: code.trim().toUpperCase(),
        amount,
        sender: this.cleanSenderName(sender),
        date,
        rawDate,
        rawTime,
      };
    } catch (e) {
      console.error('Error extracting data from match', e);
      return null;
    }
  }

  /**
   * Clean sender name (remove extra whitespace, numbers)
   */
  private static cleanSenderName(name: string): string {
    return name
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\d+$/, '') // Remove trailing phone numbers sometimes attached
      .replace(/New M-PESA balance.*/i, '') // Remove balance text if caught
      .trim();
  }

  /**
   * Validate M-Pesa transaction code format
   */
  static validateCode(code: string): boolean {
    if (!code) return false;
    return /^[A-Z0-9]{10}$/i.test(code);
  }

  /**
   * Extract just the amount (quick parse)
   */
  static extractAmount(smsText: string): number | null {
    const result = this.parseSMS(smsText);
    return result.success && result.transaction ? result.transaction.amount : null;
  }

  /**
   * Check if text looks like M-Pesa SMS
   */
  static looksLikeMpesaSMS(text: string): boolean {
    if (!text) return false;
    const keywords = ['confirmed', 'mpesa', 'ksh', 'received', 'from'];
    const lowerText = text.toLowerCase();
    // Must contain at least 2 keywords to be considered
    const matchCount = keywords.filter(k => lowerText.includes(k)).length;
    return matchCount >= 2;
  }

  /**
   * Generate example SMS for testing
   */
  static generateExampleSMS(): string {
    const codes = ['RGH7K2L9XM', 'SDK8J3M4PQ', 'TYU9L1K5WN'];
    const names = ['John Kamau', 'Mary Wanjiku', 'Peter Omondi'];
    const code = codes[Math.floor(Math.random() * codes.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    const amount = (Math.random() * 10000 + 100).toFixed(2);
    
    const now = new Date();
    const date = now.toLocaleDateString('en-GB'); // DD/MM/YYYY
    const time = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });

    return `${code} Confirmed. Ksh${amount} sent to ${name} on ${date} at ${time}. New M-PESA balance is Ksh15,234.50`;
  }
}