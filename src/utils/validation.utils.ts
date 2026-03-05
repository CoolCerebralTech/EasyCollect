// =====================================================
// src/utils/validation.utils.ts
// General-purpose validation utilities
// =====================================================

export class ValidationUtils {
  /**
   * Checks if a string contains potentially invalid characters (e.g., for XSS prevention).
   * This is a basic check for common script/tag injection patterns.
   */
  static hasInvalidCharacters(text: string): boolean {
    // Regex checks for <, >, or the word 'script' (case-insensitive)
    return /<|>|script/i.test(text);
  }
}
