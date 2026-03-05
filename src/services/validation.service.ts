// =====================================================
// services/validation.service.ts
// Comprehensive validation for all inputs
// =====================================================

import { APP_CONFIG } from '../lib/constants';
import type { PaymentMethod, Currency } from '../lib/types';
import { PAYMENT_METHODS } from '../lib/constants';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export class ValidationService {
  /**
   * Validate room title
   */
  static validateTitle(title: string): ValidationResult {
    if (!title || title.trim().length === 0) {
      return { isValid: false, error: 'Title is required' };
    }

    const trimmed = title.trim();

    if (trimmed.length < APP_CONFIG.room.titleMinLength) {
      return {
        isValid: false,
        error: `Title must be at least ${APP_CONFIG.room.titleMinLength} characters`,
      };
    }

    if (trimmed.length > APP_CONFIG.room.titleMaxLength) {
      return {
        isValid: false,
        error: `Title must not exceed ${APP_CONFIG.room.titleMaxLength} characters`,
      };
    }

    // Check for invalid characters
    if (/<|>|script/i.test(trimmed)) {
      return { isValid: false, error: 'Title contains invalid characters' };
    }

    return { isValid: true };
  }

  /**
   * Validate description
   */
  static validateDescription(description: string): ValidationResult {
    if (!description || description.trim().length === 0) {
      return { isValid: true }; // Optional field
    }

    if (description.length > APP_CONFIG.room.descriptionMaxLength) {
      return {
        isValid: false,
        error: `Description must not exceed ${APP_CONFIG.room.descriptionMaxLength} characters`,
      };
    }

    return { isValid: true };
  }

  /**
   * Validate target amount
   */
  static validateTargetAmount(amount: number | null | undefined): ValidationResult {
    if (amount === null || amount === undefined) {
      return { isValid: true }; // Optional field
    }

    if (amount <= 0) {
      return { isValid: false, error: 'Target amount must be greater than zero' };
    }

    if (amount > APP_CONFIG.contribution.maxAmount) {
      return {
        isValid: false,
        error: `Target amount cannot exceed ${APP_CONFIG.contribution.maxAmount}`,
      };
    }

    return { isValid: true };
  }

  /**
   * Validate PIN
   */
  static validatePIN(pin: string): ValidationResult {
    if (!pin) {
      return { isValid: false, error: 'PIN is required' };
    }

    if (!/^\d+$/.test(pin)) {
      return { isValid: false, error: 'PIN must contain only numbers' };
    }

    if (pin.length < APP_CONFIG.pin.minLength || pin.length > APP_CONFIG.pin.maxLength) {
      return {
        isValid: false,
        error: `PIN must be ${APP_CONFIG.pin.minLength}-${APP_CONFIG.pin.maxLength} digits`,
      };
    }

    // Check for weak PINs
    if (/^(\d)\1+$/.test(pin)) {
      return { isValid: false, error: 'PIN is too weak (all same digits)' };
    }

    if (pin === '1234' || pin === '0000') {
      return { isValid: false, error: 'PIN is too common. Choose a different one.' };
    }

    return { isValid: true };
  }

  /**
   * Validate contributor name
   */
  static validateName(name: string): ValidationResult {
    if (!name || name.trim().length === 0) {
      return { isValid: false, error: 'Name is required' };
    }

    const trimmed = name.trim();

    if (trimmed.length < APP_CONFIG.contribution.nameMinLength) {
      return {
        isValid: false,
        error: `Name must be at least ${APP_CONFIG.contribution.nameMinLength} characters`,
      };
    }

    if (trimmed.length > APP_CONFIG.contribution.nameMaxLength) {
      return {
        isValid: false,
        error: `Name must not exceed ${APP_CONFIG.contribution.nameMaxLength} characters`,
      };
    }

    // Check for invalid characters
    if (/<|>|script/i.test(trimmed)) {
      return { isValid: false, error: 'Name contains invalid characters' };
    }

    return { isValid: true };
  }

  /**
   * Validate contribution amount
   */
  static validateAmount(amount: number): ValidationResult {
    if (amount <= 0) {
      return { isValid: false, error: 'Amount must be greater than zero' };
    }

    if (amount < APP_CONFIG.contribution.minAmount) {
      return {
        isValid: false,
        error: `Amount must be at least ${APP_CONFIG.contribution.minAmount}`,
      };
    }

    if (amount > APP_CONFIG.contribution.maxAmount) {
      return {
        isValid: false,
        error: `Amount cannot exceed ${APP_CONFIG.contribution.maxAmount}`,
      };
    }

    return { isValid: true };
  }

  /**
   * Validate transaction reference
   */
  static validateTransactionRef(
    ref: string | undefined,
    paymentMethod: PaymentMethod
  ): ValidationResult {
    const methodConfig = PAYMENT_METHODS[paymentMethod];

    if (methodConfig.requiresTransactionRef && (!ref || ref.trim().length === 0)) {
      return {
        isValid: false,
        error: `Transaction reference is required for ${methodConfig.name}`,
      };
    }

    if (ref && ref.length > 50) {
      return {
        isValid: false,
        error: 'Transaction reference is too long',
      };
    }

    // M-Pesa specific validation (10 character alphanumeric code)
    if (paymentMethod === 'MPESA' && ref) {
      if (!/^[A-Z0-9]{10}$/i.test(ref)) {
        return {
          isValid: false,
          error: 'M-Pesa code must be 10 alphanumeric characters',
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Validate phone number (Kenyan format)
   */
  static validatePhoneNumber(phone: string | undefined): ValidationResult {
    if (!phone || phone.trim().length === 0) {
      return { isValid: true }; // Optional field
    }

    const cleaned = phone.replace(/\D/g, '');

    // Kenyan numbers: 254XXXXXXXXX (12 digits) or 0XXXXXXXXX (10 digits)
    if (cleaned.length === 10 && cleaned.startsWith('0')) {
      return { isValid: true };
    }

    if (cleaned.length === 12 && cleaned.startsWith('254')) {
      return { isValid: true };
    }

    return {
      isValid: false,
      error: 'Invalid phone number format. Use 0XXXXXXXXX or 254XXXXXXXXX',
    };
  }

  /**
   * Validate notes
   */
  static validateNotes(notes: string | undefined): ValidationResult {
    if (!notes || notes.trim().length === 0) {
      return { isValid: true }; // Optional field
    }

    if (notes.length > APP_CONFIG.contribution.notesMaxLength) {
      return {
        isValid: false,
        error: `Notes must not exceed ${APP_CONFIG.contribution.notesMaxLength} characters`,
      };
    }

    return { isValid: true };
  }

  /**
   * Validate currency
   */
  static validateCurrency(currency: string): currency is Currency {
    return ['KES', 'USD', 'UGX', 'TZS'].includes(currency);
  }

  /**
   * Validate payment method
   */
  static validatePaymentMethod(method: string): method is PaymentMethod {
    return ['MPESA', 'CASH', 'BANK', 'AIRTEL', 'OTHER'].includes(method);
  }
}