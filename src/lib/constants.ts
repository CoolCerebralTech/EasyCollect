// src/lib/constants.ts

// Consolidating constants from src/constants directory

// Helper to determine the real URL automatically
const getBaseUrl = () => {
  // If we are in the browser, grab the current address (e.g., https://your-app.vercel.app)
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  // Fallback for build time or environment variables
  return import.meta.env.VITE_APP_URL || 'http://localhost:5173';
};

export const APP_CONFIG = {
  name: 'Contribution Room',
  version: '2.0.0',
  description: 'Contribution tracking for high-trust communities',
  
  // Room settings
  room: {
    titleMinLength: 3,
    titleMaxLength: 100,
    descriptionMaxLength: 500,
    defaultExpiryDays: 30,
    maxExpiryDays: 365,
    minContributors: 1,
    maxContributors: 100,
  },
  
  // Contribution settings
  contribution: {
    nameMinLength: 2,
    nameMaxLength: 100,
    minAmount: 1,
    maxAmount: 10000000, // 10 million
    notesMaxLength: 500,
  },
  
  // PIN settings
  pin: {
    minLength: 4,
    maxLength: 6,
    maxAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes in ms
  },
  
  // Storage settings
  storage: {
    maxRoomsStored: 10,
    version: '1.0.0',
    key: 'ledger_rooms',
  },
  
  // Visual settings
  visualization: {
    minNodeRadius: 20,
    maxNodeRadius: 80,
    nodeSpacing: 100,
    animationDuration: 300,
  },
  
  // Export settings
  export: {
    receiptWidth: 600,
    receiptHeight: 800,
    imageQuality: 0.95,
    pdfPageSize: 'A4',
  },
  
  // URLs
  urls: {
    baseUrl: getBaseUrl(), // ✅ UPDATED: Uses the smart function
    whatsappBase: 'https://wa.me',
    githubRepo: 'https://github.com/CoolCerebralTech/EasyCollect',
  },
} as const;

// =====================================================
// src/constants/colors.ts
// Color scheme for visualizations
// =====================================================

export const COLORS = {
  // Primary palette (Safaricom inspired)
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#00A651', // Main Safaricom green
    600: '#009944',
    700: '#007d37',
    800: '#00632c',
    900: '#004d22',
  },
  
  // Status colors
  status: {
    confirmed: '#10B981', // Green-500
    pledged: '#F59E0B',   // Amber-500
    cancelled: '#EF4444', // Red-500
    active: '#00A651',
    archived: '#6B7280',
    closed: '#374151',
  },
  
  // Payment method colors
  payment: {
    MPESA: '#00A651',
    AIRTEL: '#ED1C24',
    BANK: '#3B82F6',
    CASH: '#10B981',
    OTHER: '#6B7280',
  },
  
  // Steward mode alert (Admin Mode)
  steward: {
    bg: '#FFF7ED',    // Orange-50
    border: '#FB923C', // Orange-400
    text: '#C2410C',   // Orange-700
  },
  
  // Node visualization (D3/Canvas)
  node: {
    empty: '#E5E7EB',
    pending: '#FCD34D',
    confirmed: '#10B981',
    selected: '#8B5CF6',
  },
} as const;

// =====================================================
// constants/currencies.ts
// Currency configurations
// =====================================================

import type { Currency } from '../lib/app.types';

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

// =====================================================
// constants/milestones.ts
// Milestone celebration configurations
// =====================================================

export interface Milestone {
  percentage: number;
  label: string;
  emoji: string;
  color: string;
  message: string;
}

export const MILESTONES: Milestone[] = [
  {
    percentage: 25,
    label: 'Quarter Way',
    emoji: '🌱',
    color: '#10B981',
    message: "We're off to a great start!",
  },
  {
    percentage: 50,
    label: 'Halfway There',
    emoji: '🔥',
    color: '#F59E0B',
    message: "We're halfway to our goal!",
  },
  {
    percentage: 75,
    label: 'Almost There',
    emoji: '⚡',
    color: '#EF4444',
    message: "So close! Let's push to the finish!",
  },
  {
    percentage: 100,
    label: 'Goal Reached',
    emoji: '🎉',
    color: '#8B5CF6',
    message: 'We did it! Goal achieved!',
  },
];

// =====================================================
// constants/payment-methods.ts
// Payment method configurations
// =====================================================

import type { PaymentMethod } from '../lib/app.types';

export interface PaymentMethodConfig {
  id: PaymentMethod;
  name: string;
  icon: string;
  color: string;
  requiresTransactionRef: boolean;
  placeholder: string;
  description: string;
  smsParser?: boolean;
}

export const PAYMENT_METHODS: Record<PaymentMethod, PaymentMethodConfig> = {
  MPESA: {
    id: 'MPESA',
    name: 'M-Pesa',
    icon: '💚',
    color: '#00A651',
    requiresTransactionRef: true,
    placeholder: 'e.g., RGH7K2L9XM',
    description: 'M-Pesa mobile money',
    smsParser: true,
  },
  AIRTEL: {
    id: 'AIRTEL',
    name: 'Airtel Money',
    icon: '🔴',
    color: '#ED1C24',
    requiresTransactionRef: true,
    placeholder: 'e.g., AM123456789',
    description: 'Airtel Money transfer',
    smsParser: false,
  },
  BANK: {
    id: 'BANK',
    name: 'Bank Transfer',
    icon: '🏦',
    color: '#3B82F6',
    requiresTransactionRef: true,
    placeholder: 'e.g., TXN987654321',
    description: 'Bank transfer or deposit',
    smsParser: false,
  },
  CASH: {
    id: 'CASH',
    name: 'Cash',
    icon: '💵',
    color: '#10B981',
    requiresTransactionRef: false,
    placeholder: 'Optional reference',
    description: 'Physical cash payment',
    smsParser: false,
  },
  OTHER: {
    id: 'OTHER',
    name: 'Other',
    icon: '💳',
    color: '#6B7280',
    requiresTransactionRef: false,
    placeholder: 'Optional reference',
    description: 'Other payment method',
    smsParser: false,
  },
};

export const PAYMENT_METHOD_LIST = Object.values(PAYMENT_METHODS);

// =====================================================
// constants/reminder-templates.ts
// WhatsApp reminder message templates
// =====================================================

export interface ReminderScenario {
  id: 'early' | 'urgent' | 'late' | 'milestone' | 'complete';
  name: string;
  triggerDaysBefore?: number;
  template: (params: ReminderParams) => string;
}

export interface ReminderParams {
  recipientName: string;
  roomTitle: string;
  amount?: number;
  currency?: string;
  deadline?: string;
  roomUrl: string;
  daysRemaining?: number;
  currentTotal?: number;
  targetAmount?: number;
  completionPercentage?: number;
}

export const REMINDER_TEMPLATES: ReminderScenario[] = [
  {
    id: 'early',
    name: 'Early Reminder',
    triggerDaysBefore: 7,
    template: (p: ReminderParams) => {
      return `Hi ${p.recipientName}! 👋\n\nJust a gentle reminder about our *${p.roomTitle}* contribution.\n\n${p.amount ? `Your pledged amount: ${p.currency} ${p.amount.toLocaleString()}` : ''}\n${p.deadline ? `⏰ Deadline: ${p.deadline}` : ''}\n\nTrack progress here: ${p.roomUrl}\n\nThank you for being part of this! 🙏`;
    },
  },
  {
    id: 'urgent',
    name: 'Urgent Reminder',
    triggerDaysBefore: 3,
    template: (p: ReminderParams) => {
      return `Hey ${p.recipientName}! ⚡\n\nWe're finalizing contributions for *${p.roomTitle}* soon!\n\n${p.amount ? `Amount due: ${p.currency} ${p.amount.toLocaleString()}` : ''}\n${p.daysRemaining ? `⏳ Only ${p.daysRemaining} days left!` : ''}\n\nPlease contribute at your earliest convenience: ${p.roomUrl}\n\nWe appreciate your support! 💚`;
    },
  },
  {
    id: 'late',
    name: 'Late Reminder',
    triggerDaysBefore: -1,
    template: (p: ReminderParams) => {
      return `Hello ${p.recipientName},\n\nWe noticed we haven't received your contribution for *${p.roomTitle}* yet.\n\n${p.amount ? `Expected amount: ${p.currency} ${p.amount.toLocaleString()}` : ''}\n\nIf you've already contributed, please let us know. Otherwise, you can still contribute here: ${p.roomUrl}\n\nThank you! 🙏`;
    },
  },
  {
    id: 'milestone',
    name: 'Milestone Reached',
    template: (p: ReminderParams) => {
      return `🎉 Great news, ${p.recipientName}!\n\nWe've reached *${p.completionPercentage}%* of our goal for *${p.roomTitle}*!\n\n${p.currentTotal && p.targetAmount ? `${p.currency} ${p.currentTotal.toLocaleString()} / ${p.targetAmount.toLocaleString()}` : ''}\n\nThanks for being part of this achievement! View details: ${p.roomUrl}\n\nLet's keep the momentum going! 💪`;
    },
  },
  {
    id: 'complete',
    name: 'Goal Complete',
    template: (p: ReminderParams) => {
      return `🎊 Amazing news, ${p.recipientName}!\n\nWe've successfully reached our goal for *${p.roomTitle}*! \n\n${p.targetAmount ? `Total collected: ${p.currency} ${p.targetAmount.toLocaleString()} ✓` : ''}\n\nThank you for your contribution and trust. Together we did it! 🙌\n\nView final report: ${p.roomUrl}`;
    },
  },
];
