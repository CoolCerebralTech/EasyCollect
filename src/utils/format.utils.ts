// =====================================================
// src/utils/format.utils.ts
// Number, text, and data formatting utilities
// =====================================================

import type { Currency } from '../lib/types';
import { CURRENCIES } from '../lib/constants';

export class FormatUtils {
  /**
   * Format currency amount with proper symbol and separators
   */
  static formatCurrency(amount: number, currency: Currency = 'KES'): string {
    const config = CURRENCIES[currency] || CURRENCIES.KES;
    
    // Round based on decimal places
    const rounded = config.decimalPlaces === 0 
      ? Math.round(amount)
      : Math.round(amount * Math.pow(10, config.decimalPlaces)) / Math.pow(10, config.decimalPlaces);
    
    // Format number with separators
    const parts = rounded.toFixed(config.decimalPlaces).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, config.thousandsSeparator);
    const formatted = parts.join(config.decimalSeparator);
    
    // Add symbol
    return config.symbolPosition === 'before'
      ? `${config.symbol} ${formatted}`
      : `${formatted} ${config.symbol}`;
  }

  /**
   * Format large numbers with K, M suffixes
   */
  static formatCompactNumber(num: number): string {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toFixed(0);
  }

  /**
   * Format percentage
   */
  static formatPercentage(value: number, decimals = 1): string {
    if (!value && value !== 0) return '0%';
    return `${value.toFixed(decimals)}%`;
  }

  /**
   * Format phone number (Kenyan format)
   */
  static formatPhoneNumber(phone: string): string {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    
    // Format as +254 XXX XXX XXX
    if (cleaned.length === 12 && cleaned.startsWith('254')) {
      return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
    }
    
    // Format as 0XXX XXX XXX
    if (cleaned.length === 10 && cleaned.startsWith('0')) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    
    return phone; 
  }

  /**
   * Truncate text with ellipsis
   */
  static truncate(text: string, maxLength: number): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength - 3)}...`;
  }

  /**
   * Capitalize first letter
   */
  static capitalize(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  /**
   * Convert to title case
   */
  static toTitleCase(text: string): string {
    if (!text) return '';
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Sanitize input (remove dangerous characters)
   */
  static sanitize(input: string): string {
    if (!input) return '';
    return input.replace(/[<>]/g, '').trim();
  }

  /**
   * Sanitize for CSV export (prevent Excel formula injection)
   */
  static sanitizeForCSV(input: string): string {
    if (!input) return '';
    const str = String(input);
    if (/^[=+\-@]/.test(str)) {
      return `'${str}`;
    }
    return str;
  }

  /**
   * Generate initials from name
   */
  static getInitials(name: string): string {
    if (!name) return '??';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }
    return words.slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }
}