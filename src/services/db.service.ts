// =====================================================
// THE LEDGER: Database Service Layer
// Complete abstraction over Supabase RPC functions
// =====================================================

import { supabase, isSupabaseConfigured } from './supabase.service';
import { LocalStorageService } from './storage.service';
import {
  type CreateRoomDTO,
  type CreateRoomResponse,
  type ValidateOrganizerAccessResponse,
  type RoomDetails,
  type AddContributionDTO,
  type UpdateContributionDTO,
  type ContributionResponse,
  type RoomStatistics,
  type Room,
  type RoomContribution,
  type Contribution,
  type ContributionStatus,
  type PaymentMethod,
  type ApiResponse,
  LedgerError,
} from '../lib/types';

// =====================================================
// On-device fallback (no Supabase configured)
// The Ledger philosophy: no accounts, no backend, just the phone.
// These helpers persist everything to localStorage — the same place
// the Home page already reads your saved rooms from. No new "database";
// just the browser cache the user already trusts.
// =====================================================
const LOCAL_ROOMS_KEY = 'ledger_local_rooms';
const LOCAL_CONTRIBS_KEY = 'ledger_local_contribs';

const uid = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

const readLocal = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeLocal = (key: string, val: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('[Ledger] localStorage write failed', e);
  }
};

// Local-mode room record — extends StoredRoom with the bits the room page needs.
interface LocalRoom {
  roomId: string;
  title: string;
  description?: string;
  targetAmount?: number;
  currency: string;
  organizerToken: string;
  contributorToken: string;
  pin: string; // demo only — kept on device, never sent anywhere
  status: 'active' | 'archived' | 'closed';
  createdAt: string;
  expiresAt: string | null;
  lastAccessed: string;
}

const localDb = {
  async createRoom(data: CreateRoomDTO): Promise<ApiResponse<CreateRoomResponse>> {
    const roomId = uid();
    const organizerToken = uid();
    const contributorToken = uid();
    const now = new Date().toISOString();
    const room: LocalRoom = {
      roomId,
      title: data.title,
      description: data.description,
      targetAmount: data.targetAmount,
      currency: data.currency,
      organizerToken,
      contributorToken,
      pin: data.pin,
      status: 'active',
      createdAt: now,
      expiresAt: data.expiresInDays
        ? new Date(Date.now() + data.expiresInDays * 86400000).toISOString()
        : null,
      lastAccessed: now,
    };
    const rooms = readLocal<LocalRoom[]>(LOCAL_ROOMS_KEY, []);
    rooms.push(room);
    writeLocal(LOCAL_ROOMS_KEY, rooms);

    // Also register in the Home page's saved-rooms list so it shows up there.
    LocalStorageService.saveRoom({
      roomId,
      title: data.title,
      organizerToken,
      role: 'organizer',
      lastAccessed: now,
      status: 'active',
      description: data.description,
      targetAmount: data.targetAmount,
      currency: data.currency,
    });

    return {
      success: true,
      data: {
        room_id: roomId,
        organizer_token: organizerToken,
        contributor_token: contributorToken,
        organizer_url: `/room/${organizerToken}`,
        contributor_url: `/room/${contributorToken}`,
      },
    };
  },

  async validateOrganizerAccess(
    token: string,
    pin: string
  ): Promise<ApiResponse<ValidateOrganizerAccessResponse>> {
    const rooms = readLocal<LocalRoom[]>(LOCAL_ROOMS_KEY, []);
    const room = rooms.find(
      (r) => r.organizerToken === token || r.contributorToken === token
    );
    if (!room) return { success: false, error: { message: 'Invalid link', code: 'NOT_FOUND' } };
    if (room.organizerToken !== token)
      return { success: false, error: { message: 'This link is view-only', code: 'VIEW_ONLY' } };
    if (room.pin !== pin)
      return { success: false, error: { message: 'Invalid PIN', code: 'BAD_PIN' } };
    return {
      success: true,
      data: { access_granted: true, room_id: room.roomId, role: 'organizer' },
    };
  },

  async getRoomDetails(token: string): Promise<ApiResponse<RoomDetails>> {
    const rooms = readLocal<LocalRoom[]>(LOCAL_ROOMS_KEY, []);
    const room = rooms.find(
      (r) => r.organizerToken === token || r.contributorToken === token
    );
    if (!room) return { success: false, error: { message: 'Room not found', code: 'NOT_FOUND' } };

    const all = readLocal<Contribution[]>(LOCAL_CONTRIBS_KEY, []);
    const contribs = all
      .filter((c) => c.room_id === room.roomId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const isOrganizer = room.organizerToken === token;
    const total = contribs.reduce((s, c) => s + c.amount, 0);

    const roomForClient: Room = {
      id: room.roomId,
      title: room.title,
      description: room.description ?? null,
      target_amount: room.targetAmount ?? null,
      currency: room.currency as Room['currency'],
      organizer_token: isOrganizer ? room.organizerToken : undefined,
      contributor_token: room.contributorToken,
      pin_hash: undefined,
      status: room.status,
      created_at: room.createdAt,
      expires_at: room.expiresAt,
      settings: {
        allow_pledges: true,
        allow_anonymous: false,
        show_amounts_to_viewers: true,
        enable_milestones: true,
        reminder_days_before: 3,
      },
      total_collected: total,
      total_pledged: 0,
      contributor_count: contribs.length,
      last_contribution_at: contribs[0]?.created_at ?? null,
    };
    const roomContributions: RoomContribution[] = contribs.map((c) => ({
      id: c.id,
      name: c.name,
      amount: c.amount,
      payment_method: c.payment_method,
      transaction_ref: c.transaction_ref,
      status: c.status,
      confirmed_at: c.confirmed_at,
      notes: c.notes,
      created_at: c.created_at,
    }));
    return {
      success: true,
      data: {
        room: roomForClient,
        contributions: roomContributions,
        role: isOrganizer ? 'organizer' : 'contributor',
        can_edit: isOrganizer,
      },
    };
  },

  async getRoomStatistics(token: string): Promise<ApiResponse<RoomStatistics>> {
    const details = await this.getRoomDetails(token);
    if (!details.success)
      return { success: false, error: { message: 'Room not found', code: 'NOT_FOUND' } };
    const contribs = details.data.contributions;
    const total = contribs.reduce((s, c) => s + c.amount, 0);
    const avg = contribs.length ? total / contribs.length : null;
    const largest = contribs.reduce((m, c) => Math.max(m, c.amount), 0) || null;
    const days: Record<string, { count: number; total: number }> = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days[d.toISOString().split('T')[0]] = { count: 0, total: 0 };
    }
    contribs.forEach((c) => {
      const k = c.created_at.split('T')[0];
      if (days[k]) {
        days[k].count++;
        days[k].total += c.amount;
      }
    });
    const methods: Record<string, { count: number; total: number }> = {};
    contribs.forEach((c) => {
      const m = c.payment_method;
      if (!methods[m]) methods[m] = { count: 0, total: 0 };
      methods[m].count++;
      methods[m].total += c.amount;
    });
    const target = details.data.room.target_amount;
    const completion = target ? Math.min(100, (total / target) * 100) : null;
    return {
      success: true,
      data: {
        daily_trend: Object.entries(days).map(([date, v]) => ({ date, ...v })),
        payment_methods: Object.entries(methods).map(([payment_method, v]) => ({
          payment_method: payment_method as PaymentMethod,
          ...v,
        })),
        average_contribution: avg,
        largest_contribution: largest,
        completion_percentage: completion,
      },
    };
  },

  async addContribution(
    organizerToken: string,
    c: AddContributionDTO
  ): Promise<ApiResponse<ContributionResponse>> {
    const rooms = readLocal<LocalRoom[]>(LOCAL_ROOMS_KEY, []);
    const room = rooms.find((r) => r.organizerToken === organizerToken);
    if (!room) return { success: false, error: { message: 'Room not found', code: 'NOT_FOUND' } };
    const now = new Date().toISOString();
    const contrib: Contribution = {
      id: uid(),
      room_id: room.roomId,
      name: c.name,
      phone_number: c.phoneNumber ?? null,
      amount: c.amount,
      payment_method: c.paymentMethod,
      transaction_ref: c.transactionRef ?? null,
      status: (c.status as ContributionStatus) ?? 'confirmed',
      confirmed_at: now,
      notes: c.notes ?? null,
      is_anonymous: c.isAnonymous ?? false,
      created_at: now,
      updated_at: now,
    };
    const all = readLocal<Contribution[]>(LOCAL_CONTRIBS_KEY, []);
    all.push(contrib);
    writeLocal(LOCAL_CONTRIBS_KEY, all);
    return { success: true, data: { success: true, contribution_id: contrib.id } };
  },

  async updateContribution(
    organizerToken: string,
    u: UpdateContributionDTO
  ): Promise<ApiResponse<ContributionResponse>> {
    const rooms = readLocal<LocalRoom[]>(LOCAL_ROOMS_KEY, []);
    const all = readLocal<Contribution[]>(LOCAL_CONTRIBS_KEY, []);
    const idx = all.findIndex((c) => c.id === u.contributionId);
    if (idx === -1)
      return { success: false, error: { message: 'Contribution not found', code: 'NOT_FOUND' } };
    const room = rooms.find(
      (r) => r.organizerToken === organizerToken && r.roomId === all[idx].room_id
    );
    if (!room)
      return { success: false, error: { message: 'Not authorized', code: 'FORBIDDEN' } };
    if (u.amount !== undefined) all[idx].amount = u.amount;
    if (u.name !== undefined) all[idx].name = u.name;
    if (u.paymentMethod !== undefined) all[idx].payment_method = u.paymentMethod;
    if (u.transactionRef !== undefined) all[idx].transaction_ref = u.transactionRef;
    if (u.status !== undefined) all[idx].status = u.status;
    if (u.notes !== undefined) all[idx].notes = u.notes;
    all[idx].updated_at = new Date().toISOString();
    writeLocal(LOCAL_CONTRIBS_KEY, all);
    return { success: true, data: { success: true, contribution_id: all[idx].id } };
  },

  async deleteContribution(
    organizerToken: string,
    contributionId: string
  ): Promise<ApiResponse<ContributionResponse>> {
    const rooms = readLocal<LocalRoom[]>(LOCAL_ROOMS_KEY, []);
    const all = readLocal<Contribution[]>(LOCAL_CONTRIBS_KEY, []);
    const contrib = all.find((c) => c.id === contributionId);
    if (!contrib)
      return { success: false, error: { message: 'Contribution not found', code: 'NOT_FOUND' } };
    const room = rooms.find(
      (r) => r.organizerToken === organizerToken && r.roomId === contrib.room_id
    );
    if (!room)
      return { success: false, error: { message: 'Not authorized', code: 'FORBIDDEN' } };
    writeLocal(
      LOCAL_CONTRIBS_KEY,
      all.filter((c) => c.id !== contributionId)
    );
    return { success: true, data: { success: true } };
  },
};

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
    // On-device mode: no Supabase configured → persist to localStorage only.
    if (!isSupabaseConfigured) return localDb.createRoom(data);
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

      const { data: result, error } = await supabase!.rpc('create_room', {
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
   * Validate organizer access with PIN
   * Must be called before allowing edit operations
   */
  static async validateOrganizerAccess(
    token: string,
    pin: string
  ): Promise<ApiResponse<ValidateOrganizerAccessResponse>> {
    if (!isSupabaseConfigured) return localDb.validateOrganizerAccess(token, pin);
    try {
      const { data, error } = await supabase!.rpc('validate_organizer_access', {
        p_token: token,
        p_pin: pin,
      });

      if (error) handleError(error, 'validateOrganizerAccess');

      return {
        success: true,
        data: data as ValidateOrganizerAccessResponse,
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
   * Get complete room details (works for both organizer and contributor tokens)
   * Returns different data based on role
   */
  static async getRoomDetails(token: string): Promise<ApiResponse<RoomDetails>> {
    if (!isSupabaseConfigured) return localDb.getRoomDetails(token);
    try {
      const { data, error } = await supabase!.rpc('get_room_details', {
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
   * Archive a room (organizer only)
   * Makes the room read-only
   */
  static async archiveRoom(organizerToken: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const { data, error } = await supabase!.rpc('archive_room', {
        p_organizer_token: organizerToken,
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
    if (!isSupabaseConfigured) return localDb.getRoomStatistics(token);
    try {
      const { data, error } = await supabase!.rpc('get_room_statistics', {
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
   * Add a new contribution (organizer only)
   */
  static async addContribution(
    organizerToken: string,
    contribution: AddContributionDTO
  ): Promise<ApiResponse<ContributionResponse>> {
    if (!isSupabaseConfigured) return localDb.addContribution(organizerToken, contribution);
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

      const { data, error } = await supabase!.rpc('add_contribution', {
        p_organizer_token: organizerToken,
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
   * Update an existing contribution (organizer only)
   */
  static async updateContribution(
    organizerToken: string,
    update: UpdateContributionDTO
  ): Promise<ApiResponse<ContributionResponse>> {
    if (!isSupabaseConfigured) return localDb.updateContribution(organizerToken, update);
    try {
      // Validate amount if provided
      if (update.amount !== undefined && update.amount <= 0) {
        throw new LedgerError(
          'Amount must be greater than zero',
          'INVALID_AMOUNT'
        );
      }

      const { data, error } = await supabase!.rpc('update_contribution', {
        p_organizer_token: organizerToken,
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
   * Delete a contribution (organizer only)
   */
  static async deleteContribution(
    organizerToken: string,
    contributionId: string
  ): Promise<ApiResponse<ContributionResponse>> {
    if (!isSupabaseConfigured) return localDb.deleteContribution(organizerToken, contributionId);
    try {
      const { data, error } = await supabase!.rpc('delete_contribution', {
        p_organizer_token: organizerToken,
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
    organizerToken: string;
    status: string;
  }): void {
    try {
      const existing = this.getRooms();
      
      // Remove if already exists (update scenario)
      const filtered = existing.filter(r => r.roomId !== room.roomId);
      
      // Add new/updated room
      filtered.unshift({
        ...room,
        role: 'organizer' as const,
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
    organizerToken: string;
    role: 'organizer';
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