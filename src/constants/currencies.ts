// =====================================================
// constants/currencies.ts
// Currency configurations
// =====================================================

import type { Currency } from '../lib/types';

export interface CurrencyConfig {
  code: Currency;
  name: string;
  symbol: string;
  symbolPosition: 'before' | 'after';
  decimalPlaces: number;
  thousandsSeparator: string;
  decimalSeparator: string;
  flag: string;
  countries: string[];
}

export const CURRENCIES: Record<Currency, CurrencyConfig> = {
  KES: {
    code: 'KES',
    name: 'Kenyan Shilling',
    symbol: 'KSh',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    flag: '🇰🇪',
    countries: ['Kenya'],
  },
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    flag: '🇺🇸',
    countries: ['United States', 'International'],
  },
  UGX: {
    code: 'UGX',
    name: 'Ugandan Shilling',
    symbol: 'USh',
    symbolPosition: 'before',
    decimalPlaces: 0,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    flag: '🇺🇬',
    countries: ['Uganda'],
  },
  TZS: {
    code: 'TZS',
    name: 'Tanzanian Shilling',
    symbol: 'TSh',
    symbolPosition: 'before',
    decimalPlaces: 0,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    flag: '🇹🇿',
    countries: ['Tanzania'],
  },
};

export const CURRENCY_LIST = Object.values(CURRENCIES);

// Exchange rates (relative to USD, update periodically)
export const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  KES: 129.5,
  UGX: 3700,
  TZS: 2520,
};
