// =====================================================
// src/utils/color.utils.ts
// Color generation and manipulation for visualizations
// =====================================================

import { COLORS } from '../lib/constants';

export class ColorUtils {
  /**
   * Generate color based on amount (gradient from low to high)
   * Uses a basic logarithmic approach to handle outliers (e.g., one huge donation)
   */
  static getAmountColor(amount: number, min: number, max: number): string {
    if (max === min) return COLORS.primary[500];
    
    // Prevent division by zero and handle single value cases
    const safeMax = max === min ? max + 1 : max;
    const safeMin = min;

    // Linear interpolation for simplicity (can switch to log if needed later)
    const ratio = (amount - safeMin) / (safeMax - safeMin);
    
    if (ratio < 0.2) return COLORS.primary[300]; // Low
    if (ratio < 0.5) return COLORS.primary[400]; // Medium-Low
    if (ratio < 0.8) return COLORS.primary[500]; // Medium-High
    return COLORS.primary[600]; // High
  }

  /**
   * Get status color
   */
  static getStatusColor(status: 'confirmed' | 'pledged' | 'cancelled'): string {
    return COLORS.status[status] || COLORS.status.confirmed; // Fallback
  }

  /**
   * Get payment method color
   */
  static getPaymentColor(method: string): string {
    return COLORS.payment[method as keyof typeof COLORS.payment] || COLORS.payment.OTHER;
  }

  /**
   * Convert hex to RGB
   */
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  }

  /**
   * Generate rgba from hex with opacity
   */
  static hexToRgba(hex: string, opacity: number): string {
    const rgb = this.hexToRgb(hex);
    return rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})` : hex;
  }

  /**
   * Generate random pastel color
   */
  static generatePastelColor(): string {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 80%)`;
  }

  /**
   * Get contrasting text color (black or white) for background
   */
  static getContrastColor(hexColor: string): string {
    const rgb = this.hexToRgb(hexColor);
    if (!rgb) return '#000000';
    
    // Calculate luminance
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }
}