// =====================================================
// src/types/index.ts
// THE LEDGER: TypeScript Type Definitions
// Matches Supabase Database Schema 1:1
// =====================================================

// =====================================================
// Database Enums
// =====================================================
export type RoomStatus = 'active' | 'archived' | 'closed';
export type ContributionStatus = 'confirmed' | 'pledged' | 'cancelled';
export type PaymentMethod = 'MPESA' | 'CASH' | 'BANK' | 'AIRTEL' | 'OTHER';
export type Currency = 'KES' | 'USD' | 'UGX' | 'TZS';
export type ActivityAction = 
  | 'room_created' 
  | 'contribution_added' 
  | 'contribution_updated' 
  | 'contribution_deleted' 
  | 'room_archived' 
  | 'settings_changed';
export type ActorType = 'steward' | 'system';
export type RoomRole = 'steward' | 'viewer';

// =====================================================
// Room Settings Interface
// =====================================================
export interface RoomSettings {
  allow_pledges: boolean;
  allow_anonymous: boolean;
  show_amounts_to_viewers: boolean;
  enable_milestones: boolean;
  reminder_days_before: number;
}

// =====================================================
// Database Tables (Raw Schema)
// =====================================================
export interface Room {
  id: string;
  title: string;
  description: string | null;
  target_amount: number | null;
  currency: Currency;
  // ✅ Added optional tokens because get_room_details RPC returns them
  steward_token?: string; 
  viewer_token?: string; 
  pin_hash?: string; // Usually hidden from client
  status: RoomStatus;
  created_at: string;
  expires_at: string | null;
  settings: RoomSettings;
  total_collected: number;
  total_pledged: number;
  contributor_count: number;
  last_contribution_at: string | null;
}

export interface Contribution {
  id: string;
  room_id: string;
  name: string;
  phone_number: string | null;
  amount: number;
  payment_method: PaymentMethod;
  transaction_ref: string | null;
  status: ContributionStatus;
  confirmed_at: string | null;
  notes: string | null;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoomActivityLog {
  id: string;
  room_id: string;
  action: ActivityAction;
  details: Record<string, unknown> | null;
  actor_type: ActorType;
  created_at: string;
}

// =====================================================
// RPC Function Parameters
// =====================================================
export interface CreateRoomParams {
  p_title: string;
  p_description?: string;
  p_target_amount?: number;
  p_currency: Currency;
  p_pin: string;
  p_expires_in_days?: number;
  p_settings?: Partial<RoomSettings>;
}

export interface ValidateStewardAccessParams {
  p_token: string;
  p_pin: string;
}

export interface GetRoomDetailsParams {
  p_token: string;
}

export interface AddContributionParams {
  p_steward_token: string;
  p_name: string;
  p_amount: number;
  p_payment_method: PaymentMethod;
  p_transaction_ref?: string;
  p_status?: ContributionStatus;
  p_notes?: string;
  p_is_anonymous?: boolean;
  p_phone_number?: string;
}

export interface UpdateContributionParams {
  p_steward_token: string;
  p_contribution_id: string;
  p_name?: string;
  p_amount?: number;
  p_payment_method?: PaymentMethod;
  p_transaction_ref?: string;
  p_status?: ContributionStatus;
  p_notes?: string;
}

export interface DeleteContributionParams {
  p_steward_token: string;
  p_contribution_id: string;
}

export interface ArchiveRoomParams {
  p_steward_token: string;
}

export interface GetRoomStatisticsParams {
  p_token: string;
}

// =====================================================
// RPC Function Return Types
// =====================================================
export interface CreateRoomResponse {
  room_id: string;
  steward_token: string;
  viewer_token: string;
  steward_url: string;
  viewer_url: string;
}

export interface ValidateStewardAccessResponse {
  access_granted: boolean;
  room_id: string;
  role: 'steward';
}

export interface RoomDetails {
  room: Room; // Using the Room interface directly
  contributions: RoomContribution[];
  role: RoomRole;
  can_edit: boolean;
}

// Simplified contribution type returned by get_room_details
export interface RoomContribution {
  id: string;
  name: string;
  amount: number;
  payment_method: PaymentMethod;
  transaction_ref: string | null;
  status: ContributionStatus;
  confirmed_at: string | null;
  notes: string | null;
  created_at: string;
  // ✅ Adding missing fields as optional to satisfy TypeScript casting
  room_id?: string;
  phone_number?: string | null;
  is_anonymous?: boolean;
  updated_at?: string;
}

export interface ContributionResponse {
  success: boolean;
  contribution_id?: string;
}

export interface DailyContribution {
  date: string;
  count: number;
  total: number;
}

export interface PaymentBreakdown {
  payment_method: PaymentMethod;
  count: number;
  total: number;
}

export interface RoomStatistics {
  daily_trend: DailyContribution[];
  payment_methods: PaymentBreakdown[];
  average_contribution: number | null;
  largest_contribution: number | null;
  completion_percentage: number | null;
}

// =====================================================
// Client-Side DTOs (Data Transfer Objects)
// =====================================================
export interface CreateRoomDTO {
  title: string;
  description?: string;
  targetAmount?: number;
  currency: Currency;
  pin: string;
  expiresInDays?: number;
  settings?: Partial<RoomSettings>;
}

export interface AddContributionDTO {
  name: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  status?: ContributionStatus;
  notes?: string;
  isAnonymous?: boolean;
  phoneNumber?: string;
}

export interface UpdateContributionDTO {
  contributionId: string;
  name?: string;
  amount?: number;
  paymentMethod?: PaymentMethod;
  transactionRef?: string;
  status?: ContributionStatus;
  notes?: string;
}

// =====================================================
// M-Pesa SMS Parsing Types
// =====================================================
export interface MPesaTransaction {
  code: string;
  amount: number;
  sender: string;
  date: string;
  time: string;
}

export interface ParsedSMS {
  success: boolean;
  transaction?: MPesaTransaction;
  error?: string;
}

// =====================================================
// Local Storage Types
// =====================================================
export interface StoredRoom {
  roomId: string;
  title: string;
  stewardToken: string;
  role: 'steward';
  lastAccessed: string;
  status: RoomStatus;
  description?: string; // Optional
  targetAmount?: number; // Optional
  currency?: string; // Optional
}

export interface LocalStorageState {
  rooms: StoredRoom[];
  version: string;
}

// =====================================================
// UI State Types
// =====================================================
export interface ContributionNode {
  id: string;
  name: string;
  amount: number;
  status: ContributionStatus;
  position?: { x: number; y: number };
  radius?: number;
}

export interface MilestoneEvent {
  percentage: number;
  reached: boolean;
  label: string;
  color: string;
}

// =====================================================
// Error Types
// =====================================================
export class LedgerError extends Error {
  public code: string;
  public details?: unknown;

  constructor(message: string, code: string, details?: unknown) {
    super(message);
    this.name = 'LedgerError';
    this.code = code;
    this.details = details;
  }
}

export interface ErrorResponse {
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
}

// =====================================================
// Utility Types
// =====================================================
export type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: ErrorResponse['error'] };

export interface LoadingState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// =====================================================
// WhatsApp Deep Link Types
// =====================================================
export interface ReminderTemplate {
  scenario: 'early' | 'urgent' | 'late';
  message: string;
}

export interface WhatsAppMessageParams {
  recipientName: string;
  roomTitle: string;
  amount?: number;
  deadline?: string;
  roomUrl: string;
}