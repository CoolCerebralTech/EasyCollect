// =====================================================
// src/utils/token.utils.ts
// Token validation and URL generation
// =====================================================

import { APP_CONFIG } from '../constants/app-config';

export class TokenUtils {
  /**
   * Validate UUID format
   */
  static isValidToken(token: string): boolean {
    if (!token) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(token);
  }

  /**
   * Generate room URL from token
   */
  static generateRoomUrl(token: string, absolute = true): string {
    const path = `/room/${token}`;
    return absolute ? `${APP_CONFIG.urls.baseUrl}${path}` : path;
  }

  /**
   * Extract token from URL
   */
  static extractTokenFromUrl(url: string): string | null {
    const match = url.match(/\/room\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    return match ? match[1] : null;
  }

  /**
   * Generate shareable URLs for both roles
   */
  static generateShareableUrls(stewardToken: string, viewerToken: string) {
    return {
      steward: this.generateRoomUrl(stewardToken),
      viewer: this.generateRoomUrl(viewerToken),
    };
  }

  /**
   * Obfuscate token for display (show only first/last 4 chars)
   */
  static obfuscateToken(token: string): string {
    if (!token || token.length < 12) return token;
    return `${token.slice(0, 4)}...${token.slice(-4)}`;
  }
}