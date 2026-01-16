// =====================================================
// constants/payment-methods.ts
// Payment method configurations
// =====================================================

import type { PaymentMethod } from '../lib/types';

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
