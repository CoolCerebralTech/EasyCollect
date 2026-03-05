// =====================================================
// services/currency.service.ts
// Currency conversion and formatting
// =====================================================

import { CURRENCIES, EXCHANGE_RATES } from '../lib/constants';
import type { Currency } from '../lib/app.types';
import { FormatUtils } from '../utils/format.utils';

export class CurrencyService {
  /**
   * Convert amount from one currency to another
   */
  static convert(amount: number, from: Currency, to: Currency): number {
    if (from === to) return amount;

    // Convert to USD first, then to target currency
    const amountInUSD = amount / EXCHANGE_RATES[from];
    const converted = amountInUSD * EXCHANGE_RATES[to];

    return Math.round(converted * 100) / 100;
  }

  /**
   * Get currency configuration
   */
  static getCurrencyConfig(currency: Currency) {
    return CURRENCIES[currency];
  }

  /**
   * Format amount with currency
   */
  static format(amount: number, currency: Currency): string {
    return FormatUtils.formatCurrency(amount, currency);
  }

  /**
   * Parse amount string to number (handles commas, decimals)
   */
  static parseAmount(amountStr: string): number | null {
    // Remove currency symbols and spaces
    const cleaned = amountStr
      .replace(/[^\d.,]/g, '')
      .replace(/,/g, '');

    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }

  /**
   * Get all available currencies
   */
  static getAllCurrencies() {
    return Object.values(CURRENCIES);
  }

  /**
   * Get exchange rate between two currencies
   */
  static getExchangeRate(from: Currency, to: Currency): number {
    if (from === to) return 1;
    return EXCHANGE_RATES[to] / EXCHANGE_RATES[from];
  }

  /**
   * Format with conversion hint
   */
  static formatWithConversion(
    amount: number,
    primaryCurrency: Currency,
    secondaryCurrency?: Currency
  ): string {
    const formatted = this.format(amount, primaryCurrency);

    if (!secondaryCurrency || primaryCurrency === secondaryCurrency) {
      return formatted;
    }

    const converted = this.convert(amount, primaryCurrency, secondaryCurrency);
    const convertedFormatted = this.format(converted, secondaryCurrency);

    return `${formatted} (≈ ${convertedFormatted})`;
  }
}
