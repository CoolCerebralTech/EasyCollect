// =====================================================
// THE LEDGER: Database Service Layer
// Complete abstraction over Supabase RPC functions
// =====================================================

import { supabase } from './supabase.service';
import {
  type CreateRoomDTO,
  type CreateRoomResponse,
  type ValidateStewardAccessResponse,
  type RoomDetails,
  type AddContributionDTO,
  type UpdateContributionDTO,
  type ContributionResponse,
  type RoomStatistics,
  type ApiResponse,
  LedgerError,
} from '../lib/app.types';

// =====================================================
// Error Handling Utility
// =====================================================
const handleError = (error: unknown, context: string): never => {
  console.error(`[${context}] Error:`, error);

  // Narrow the type before accessing properties
  const message =
    error instanceof Error ? error.message : 'An unknown error occurred';
  const code =
    (error as { code?: string })?.code ?? 'UNKNOWN_ERROR';

  throw new LedgerError(message, code, { context, originalError: error });
};

// =====================================================
// Room Operations
// =====================================================
export class RoomService {
  /**
   * Create a new contribution room
   * Returns tokens that should be stored securely (shown only once)
   */
  static async createRoom(data: CreateRoomDTO): Promise<ApiResponse<CreateRoomResponse>> {
    try {
      // Validate PIN format
      if (!/^\d{4,6}$/.test(data.pin)) {
        throw new LedgerError(
          'PIN must be 4-6 digits',
          'INVALID_PIN_FORMAT'
        );
      }

      // Validate title
      if (data.title.length < 3 || data.title.length > 100) {
        throw new LedgerError(
          'Title must be between 3 and 100 characters',
          'INVALID_TITLE_LENGTH'
        );
      }

      const { data: result, error } = await supabase.rpc('create_room', {
        p_title: data.title,
        p_description: data.description || null,
        p_target_amount: data.targetAmount || null,
        p_currency: data.currency,
        p_pin: data.pin,
        p_expires_in_days: data.expiresInDays || 30,
        p_settings: data.settings ? JSON.stringify(data.settings) : null,
      });

      if (error) handleError(error, 'createRoom');

      return {
        success: true,
        data: result as CreateRoomResponse,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof LedgerError ? error.message : 'Failed to create room',
          code: error instanceof LedgerError ? error.code : 'CREATE_ROOM_ERROR',
          details: error,
        },
      };
    }
  }

  /**
   * Validate steward access with PIN
   * Must be called before allowing edit operations
   */
  static async validateStewardAccess(
    token: string,
    pin: string
  ): Promise<ApiResponse<ValidateStewardAccessResponse>> {
    try {
      const { data, error } = await supabase.rpc('validate_steward_access', {
        p_token: token,
        p_pin: pin,
      });

      if (error) handleError(error, 'validateStewardAccess');

      return {
        success: true,
        data: data as ValidateStewardAccessResponse,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof LedgerError ? error.message : 'Access denied',
          code: error instanceof LedgerError ? error.code : 'ACCESS_DENIED',
          details: error,
        },
      };
    }
  }

  /**
   * Get complete room details (works for both steward and viewer tokens)
   * Returns different data based on role
   */
  static async getRoomDetails(token: string): Promise<ApiResponse<RoomDetails>> {
    try {
      const { data, error } = await supabase.rpc('get_room_details', {
        p_token: token,
      });

      if (error) handleError(error, 'getRoomDetails');

      return {
        success: true,
        data: data as RoomDetails,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof LedgerError ? error.message : 'Failed to fetch room',
          code: error instanceof LedgerError ? error.code : 'FETCH_ROOM_ERROR',
          details: error,
        },
      };
    }
  }

  /**
   * Archive a room (steward only)
   * Makes the room read-only
   */
  static async archiveRoom(stewardToken: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const { data, error } = await supabase.rpc('archive_room', {
        p_steward_token: stewardToken,
      });

      if (error) handleError(error, 'archiveRoom');

      return {
        success: true,
        data: data as { success: boolean },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof LedgerError ? error.message : 'Failed to archive room',
          code: error instanceof LedgerError ? error.code : 'ARCHIVE_ROOM_ERROR',
          details: error,
        },
      };
    }
  }

  /**
   * Get detailed room statistics
   * Includes trends, payment breakdown, averages, etc.
   */
  static async getRoomStatistics(token: string): Promise<ApiResponse<RoomStatistics>> {
    try {
      const { data, error } = await supabase.rpc('get_room_statistics', {
        p_token: token,
      });

      if (error) handleError(error, 'getRoomStatistics');

      return {
        success: true,
        data: data as RoomStatistics,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof LedgerError ? error.message : 'Failed to fetch statistics',
          code: error instanceof LedgerError ? error.code : 'FETCH_STATS_ERROR',
          details: error,
        },
      };
    }
  }
}

// =====================================================
// Contribution Operations
// =====================================================
export class ContributionService {
  /**
   * Add a new contribution (steward only)
   */
  static async addContribution(
    stewardToken: string,
    contribution: AddContributionDTO
  ): Promise<ApiResponse<ContributionResponse>> {
    try {
      // Validate amount
      if (contribution.amount <= 0) {
        throw new LedgerError(
          'Amount must be greater than zero',
          'INVALID_AMOUNT'
        );
      }

      // Validate name
      if (contribution.name.length < 2 || contribution.name.length > 100) {
        throw new LedgerError(
          'Name must be between 2 and 100 characters',
          'INVALID_NAME_LENGTH'
        );
      }

      const { data, error } = await supabase.rpc('add_contribution', {
        p_steward_token: stewardToken,
        p_name: contribution.name,
        p_amount: contribution.amount,
        p_payment_method: contribution.paymentMethod,
        p_transaction_ref: contribution.transactionRef || null,
        p_status: contribution.status || 'confirmed',
        p_notes: contribution.notes || null,
        p_is_anonymous: contribution.isAnonymous || false,
        p_phone_number: contribution.phoneNumber || null,
      });

      if (error) handleError(error, 'addContribution');

      return {
        success: true,
        data: data as ContributionResponse,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof LedgerError ? error.message : 'Failed to add contribution',
          code: error instanceof LedgerError ? error.code : 'ADD_CONTRIBUTION_ERROR',
          details: error,
        },
      };
    }
  }

  /**
   * Update an existing contribution (steward only)
   */
  static async updateContribution(
    stewardToken: string,
    update: UpdateContributionDTO
  ): Promise<ApiResponse<ContributionResponse>> {
    try {
      // Validate amount if provided
      if (update.amount !== undefined && update.amount <= 0) {
        throw new LedgerError(
          'Amount must be greater than zero',
          'INVALID_AMOUNT'
        );
      }

      const { data, error } = await supabase.rpc('update_contribution', {
        p_steward_token: stewardToken,
        p_contribution_id: update.contributionId,
        p_name: update.name || null,
        p_amount: update.amount || null,
        p_payment_method: update.paymentMethod || null,
        p_transaction_ref: update.transactionRef || null,
        p_status: update.status || null,
        p_notes: update.notes || null,
      });

      if (error) handleError(error, 'updateContribution');

      return {
        success: true,
        data: data as ContributionResponse,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof LedgerError ? error.message : 'Failed to update contribution',
          code: error instanceof LedgerError ? error.code : 'UPDATE_CONTRIBUTION_ERROR',
          details: error,
        },
      };
    }
  }

  /**
   * Delete a contribution (steward only)
   */
  static async deleteContribution(
    stewardToken: string,
    contributionId: string
  ): Promise<ApiResponse<ContributionResponse>> {
    try {
      const { data, error } = await supabase.rpc('delete_contribution', {
        p_steward_token: stewardToken,
        p_contribution_id: contributionId,
      });

      if (error) handleError(error, 'deleteContribution');

      return {
        success: true,
        data: data as ContributionResponse,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof LedgerError ? error.message : 'Failed to delete contribution',
          code: error instanceof LedgerError ? error.code : 'DELETE_CONTRIBUTION_ERROR',
          details: error,
        },
      };
    }
  }
}

// =====================================================
// M-Pesa SMS Parser
// =====================================================
export class MPesaParser {
  private static readonly MPESA_REGEX = /([A-Z0-9]{10})\s+Confirmed\.?\s*(?:You have received|Ksh|KES)?\s*(?:Ksh|KES)?\s*([0-9,]+(?:\.\d{2})?)\s+(?:from|sent to)\s+(.+?)\s+on\s+(\d{1,2}\/\d{1,2}\/\d{2,4})\s+at\s+(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))/i;

  /**
   * Parse M-Pesa SMS text
   * Supports multiple formats of M-Pesa confirmation messages
   */
  static parseSMS(smsText: string): {
    success: boolean;
    transaction?: {
      code: string;
      amount: number;
      sender: string;
      date: string;
      time: string;
    };
    error?: string;
  } {
    try {
      const match = smsText.match(this.MPESA_REGEX);

      if (!match) {
        return {
          success: false,
          error: 'Could not parse M-Pesa SMS. Please enter details manually.',
        };
      }

      const [, code, amountStr, sender, date, time] = match;

      // Clean and parse amount
      const amount = parseFloat(amountStr.replace(/,/g, ''));

      if (isNaN(amount) || amount <= 0) {
        return {
          success: false,
          error: 'Invalid amount in SMS',
        };
      }

      return {
        success: true,
        transaction: {
          code: code.trim(),
          amount,
          sender: sender.trim(),
          date: date.trim(),
          time: time.trim(),
        },
      };
    } catch {
      return {
        success: false,
        error: 'Failed to parse SMS',
      };
    }
  }

  /**
   * Extract just the amount from SMS (quick parse)
   */
  static extractAmount(smsText: string): number | null {
    const result = this.parseSMS(smsText);
    return result.success && result.transaction ? result.transaction.amount : null;
  }
}

// =====================================================
// Local Storage Manager
// =====================================================
export class LocalStorageManager {
  private static readonly STORAGE_KEY = 'ledger_rooms';
  private static readonly VERSION = '1.0.0';

  /**
   * Save room to local storage (for stewards to resume)
   */
  static saveRoom(room: {
    roomId: string;
    title: string;
    stewardToken: string;
    status: string;
  }): void {
    try {
      const existing = this.getRooms();
      
      // Remove if already exists (update scenario)
      const filtered = existing.filter(r => r.roomId !== room.roomId);
      
      // Add new/updated room
      filtered.unshift({
        ...room,
        role: 'steward' as const,
        lastAccessed: new Date().toISOString(),
      });

      // Keep only last 10 rooms
      const toStore = filtered.slice(0, 10);

      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify({
          version: this.VERSION,
          rooms: toStore,
        })
      );
    } catch (error) {
      console.error('Failed to save room to localStorage:', error);
    }
  }

  /**
   * Get all saved rooms
   */
  static getRooms(): Array<{
    roomId: string;
    title: string;
    stewardToken: string;
    role: 'steward';
    lastAccessed: string;
    status: string;
  }> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      
      // Version check
      if (parsed.version !== this.VERSION) {
        console.warn('Storage version mismatch, clearing...');
        this.clearAll();
        return [];
      }

      return parsed.rooms || [];
    } catch (error) {
      console.error('Failed to retrieve rooms from localStorage:', error);
      return [];
    }
  }

  /**
   * Remove a room from storage
   */
  static removeRoom(roomId: string): void {
    try {
      const existing = this.getRooms();
      const filtered = existing.filter(r => r.roomId !== roomId);

      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify({
          version: this.VERSION,
          rooms: filtered,
        })
      );
    } catch (error) {
      console.error('Failed to remove room from localStorage:', error);
    }
  }

  /**
   * Clear all stored rooms
   */
  static clearAll(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }

  /**
   * Update room access time
   */
  static touchRoom(roomId: string): void {
    try {
      const rooms = this.getRooms();
      const room = rooms.find(r => r.roomId === roomId);
      
      if (room) {
        this.saveRoom(room);
      }
    } catch (error) {
      console.error('Failed to update room access time:', error);
    }
  }
}

// =====================================================
// Export all services
// =====================================================
export const db = {
  rooms: RoomService,
  contributions: ContributionService,
  parser: MPesaParser,
  storage: LocalStorageManager,
};