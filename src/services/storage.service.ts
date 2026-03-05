// =====================================================
// services/storage.service.ts
// Enhanced storage with localStorage and IndexedDB support
// =====================================================

import { APP_CONFIG } from '../lib/constants';
import type { RoomStatus } from '../lib/types';

// =====================================================
// Types
// =====================================================
export interface StoredRoom {
  roomId: string;
  title: string;
  stewardToken: string;
  role: 'steward';
  lastAccessed: string;
  status: RoomStatus;
  description?: string;
  targetAmount?: number;
  currency?: string;
}

export interface StorageState {
  rooms: StoredRoom[];
  version: string;
}

export interface PINAttempt {
  token: string;
  attempts: number;
  lastAttempt: number;
  lockedUntil?: number;
}

// =====================================================
// LocalStorage Service
// =====================================================
export class LocalStorageService {
  private static readonly STORAGE_KEY = APP_CONFIG.storage.key;
  private static readonly VERSION = APP_CONFIG.storage.version;
  private static readonly PIN_ATTEMPTS_KEY = 'ledger_pin_attempts';

  /**
   * Save room to localStorage
   */
  static saveRoom(room: StoredRoom): void {
    try {
      const existing = this.getRooms();
      
      // Remove if already exists (update scenario)
      const filtered = existing.filter(r => r.roomId !== room.roomId);
      
      // Add new/updated room at the beginning
      filtered.unshift({
        ...room,
        lastAccessed: new Date().toISOString(),
      });

      // Keep only the maximum allowed rooms
      const toStore = filtered.slice(0, APP_CONFIG.storage.maxRoomsStored);

      this.saveToStorage({
        version: this.VERSION,
        rooms: toStore,
      });
    } catch (error) {
      console.error('[LocalStorage] Failed to save room:', error);
    }
  }

  /**
   * Get all saved rooms
   */
  static getRooms(): StoredRoom[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const parsed: StorageState = JSON.parse(stored);
      
      // Version check
      if (parsed.version !== this.VERSION) {
        console.warn('[LocalStorage] Version mismatch, clearing storage');
        this.clearAll();
        return [];
      }

      return parsed.rooms || [];
    } catch (error) {
      console.error('[LocalStorage] Failed to retrieve rooms:', error);
      return [];
    }
  }

  /**
   * Get a specific room by ID
   */
  static getRoom(roomId: string): StoredRoom | null {
    const rooms = this.getRooms();
    return rooms.find(r => r.roomId === roomId) || null;
  }

  /**
   * Remove a room from storage
   */
  static removeRoom(roomId: string): void {
    try {
      const existing = this.getRooms();
      const filtered = existing.filter(r => r.roomId !== roomId);

      this.saveToStorage({
        version: this.VERSION,
        rooms: filtered,
      });
    } catch (error) {
      console.error('[LocalStorage] Failed to remove room:', error);
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
      console.error('[LocalStorage] Failed to update room access time:', error);
    }
  }

  /**
   * Update room status
   */
  static updateRoomStatus(roomId: string, status: RoomStatus): void {
    try {
      const rooms = this.getRooms();
      const room = rooms.find(r => r.roomId === roomId);
      
      if (room) {
        room.status = status;
        this.saveRoom(room);
      }
    } catch (error) {
      console.error('[LocalStorage] Failed to update room status:', error);
    }
  }

  /**
   * Clear all stored rooms
   */
  static clearAll(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('[LocalStorage] Failed to clear storage:', error);
    }
  }

  /**
   * Get storage usage info
   */
  static getStorageInfo(): {
    roomCount: number;
    estimatedSize: number;
  } {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return {
        roomCount: this.getRooms().length,
        estimatedSize: stored ? stored.length : 0,
      };
    } catch {
      return { roomCount: 0, estimatedSize: 0 };
    }
  }

  /**
   * Private: Save to localStorage
   */
  private static saveToStorage(state: StorageState): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
  }

  // =====================================================
  // PIN Attempt Tracking (Rate Limiting)
  // =====================================================

  /**
   * Record a PIN attempt
   */
  static recordPINAttempt(token: string, success: boolean): void {
    try {
      const attempts = this.getPINAttempts();
      const existing = attempts.find(a => a.token === token);

      if (success) {
        // Clear attempts on success
        const filtered = attempts.filter(a => a.token !== token);
        this.savePINAttempts(filtered);
        return;
      }

      const now = Date.now();

      if (existing) {
        existing.attempts += 1;
        existing.lastAttempt = now;

        // Lock if exceeded max attempts
        if (existing.attempts >= APP_CONFIG.pin.maxAttempts) {
          existing.lockedUntil = now + APP_CONFIG.pin.lockoutDuration;
        }
      } else {
        attempts.push({
          token,
          attempts: 1,
          lastAttempt: now,
        });
      }

      this.savePINAttempts(attempts);
    } catch (error) {
      console.error('[LocalStorage] Failed to record PIN attempt:', error);
    }
  }

  /**
   * Check if token is locked due to too many attempts
   */
  static isPINLocked(token: string): { locked: boolean; remainingTime?: number } {
    try {
      const attempts = this.getPINAttempts();
      const record = attempts.find(a => a.token === token);

      if (!record || !record.lockedUntil) {
        return { locked: false };
      }

      const now = Date.now();

      if (now < record.lockedUntil) {
        const remainingTime = Math.ceil((record.lockedUntil - now) / 1000);
        return { locked: true, remainingTime };
      }

      // Lock expired, clear it
      record.attempts = 0;
      record.lockedUntil = undefined;
      this.savePINAttempts(attempts);

      return { locked: false };
    } catch {
      return { locked: false };
    }
  }

  /**
   * Get remaining PIN attempts
   */
  static getRemainingAttempts(token: string): number {
    try {
      const attempts = this.getPINAttempts();
      const record = attempts.find(a => a.token === token);

      if (!record) {
        return APP_CONFIG.pin.maxAttempts;
      }

      return Math.max(0, APP_CONFIG.pin.maxAttempts - record.attempts);
    } catch {
      return APP_CONFIG.pin.maxAttempts;
    }
  }

  /**
   * Private: Get PIN attempts
   */
  private static getPINAttempts(): PINAttempt[] {
    try {
      const stored = localStorage.getItem(this.PIN_ATTEMPTS_KEY);
      if (!stored) return [];

      const attempts: PINAttempt[] = JSON.parse(stored);

      // Clean up old attempts (older than 24 hours)
      const now = Date.now();
      const oneDayAgo = now - 24 * 60 * 60 * 1000;
      
      return attempts.filter(a => a.lastAttempt > oneDayAgo);
    } catch {
      return [];
    }
  }

  /**
   * Private: Save PIN attempts
   */
  private static savePINAttempts(attempts: PINAttempt[]): void {
    try {
      localStorage.setItem(this.PIN_ATTEMPTS_KEY, JSON.stringify(attempts));
    } catch (error) {
      console.error('[LocalStorage] Failed to save PIN attempts:', error);
    }
  }
}

// =====================================================
// IndexedDB Service (For larger data like receipts)
// =====================================================
export class IndexedDBService {
  private static readonly DB_NAME = 'LedgerDB';
  private static readonly DB_VERSION = 1;
  private static readonly RECEIPT_STORE = 'receipts';

  private static db: IDBDatabase | null = null;

  /**
   * Initialize IndexedDB
   */
  static async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error('[IndexedDB] Failed to open database');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains(this.RECEIPT_STORE)) {
          db.createObjectStore(this.RECEIPT_STORE, { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * Save receipt blob to IndexedDB
   */
  static async saveReceipt(
    contributionId: string,
    blob: Blob
  ): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.RECEIPT_STORE], 'readwrite');
      const store = transaction.objectStore(this.RECEIPT_STORE);

      const receipt = {
        id: contributionId,
        blob,
        createdAt: new Date().toISOString(),
      };

      const request = store.put(receipt);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get receipt blob from IndexedDB
   */
  static async getReceipt(contributionId: string): Promise<Blob | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.RECEIPT_STORE], 'readonly');
      const store = transaction.objectStore(this.RECEIPT_STORE);
      const request = store.get(contributionId);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.blob : null);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete receipt from IndexedDB
   */
  static async deleteReceipt(contributionId: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.RECEIPT_STORE], 'readwrite');
      const store = transaction.objectStore(this.RECEIPT_STORE);
      const request = store.delete(contributionId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all receipts
   */
  static async clearAllReceipts(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.RECEIPT_STORE], 'readwrite');
      const store = transaction.objectStore(this.RECEIPT_STORE);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// =====================================================
// Unified Storage Service (Combines both)
// =====================================================
export class StorageService {
  static localStorage = LocalStorageService;
  static indexedDB = IndexedDBService;

  /**
   * Initialize all storage systems
   */
  static async init(): Promise<void> {
    try {
      await IndexedDBService.init();
    } catch {
      console.warn('[Storage] IndexedDB initialization failed, falling back to localStorage only');
    }
  }

  /**
   * Check if storage is available
   */
  static isAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get total storage usage estimate
   */
  static getUsageEstimate(): {
    localStorage: number;
    total: number;
  } {
    const localInfo = LocalStorageService.getStorageInfo();

    return {
      localStorage: localInfo.estimatedSize,
      total: localInfo.estimatedSize, // Could add IndexedDB size here
    };
  }
}
