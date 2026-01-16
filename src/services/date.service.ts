// =====================================================
// services/date.service.ts
// Date parsing, formatting, and timezone handling
// =====================================================

export class DateService {
  /**
   * Format date for display (localized)
   */
  static formatDate(date: string | Date, format: 'short' | 'long' | 'relative' = 'short'): string {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (format === 'relative') {
      return this.getRelativeTime(d);
    }

    if (format === 'long') {
      return d.toLocaleDateString('en-KE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    // Short format (default)
    return d.toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Get relative time string (e.g., "2 hours ago", "in 3 days")
   */
  static getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffSec = Math.floor(Math.abs(diffMs) / 1000);
    const isPast = diffMs < 0;

    if (diffSec < 60) {
      return 'just now';
    }

    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) {
      return isPast ? `${diffMin} min ago` : `in ${diffMin} min`;
    }

    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) {
      return isPast ? `${diffHour}h ago` : `in ${diffHour}h`;
    }

    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) {
      return isPast ? `${diffDay}d ago` : `in ${diffDay}d`;
    }

    const diffWeek = Math.floor(diffDay / 7);
    if (diffWeek < 4) {
      return isPast ? `${diffWeek}w ago` : `in ${diffWeek}w`;
    }

    return this.formatDate(date, 'short');
  }

  /**
   * Calculate days until deadline
   */
  static getDaysUntil(deadline: string | Date): number {
    const d = typeof deadline === 'string' ? new Date(deadline) : deadline;
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if date is past
   */
  static isPast(date: string | Date): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.getTime() < Date.now();
  }

  /**
   * Check if deadline is approaching (within X days)
   */
  static isApproaching(deadline: string | Date, withinDays: number): boolean {
    const daysUntil = this.getDaysUntil(deadline);
    return daysUntil > 0 && daysUntil <= withinDays;
  }

  /**
   * Parse M-Pesa date format (DD/MM/YY)
   */
  static parseMpesaDate(dateStr: string): Date | null {
    const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
    if (!match) return null;

    const [, day, month, year] = match;
    const fullYear = year.length === 2 ? `20${year}` : year;

    return new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
  }

  /**
   * Parse M-Pesa time format (H:MM AM/PM)
   */
  static parseMpesaTime(timeStr: string): { hours: number; minutes: number } | null {
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return null;

    const [, hours, minutes, period] = match;
    let h = parseInt(hours, 10);

    if (period.toUpperCase() === 'PM' && h !== 12) {
      h += 12;
    } else if (period.toUpperCase() === 'AM' && h === 12) {
      h = 0;
    }

    return { hours: h, minutes: parseInt(minutes, 10) };
  }

  /**
   * Combine M-Pesa date and time into full Date object
   */
  static parseMpesaDateTime(dateStr: string, timeStr: string): Date | null {
    const date = this.parseMpesaDate(dateStr);
    const time = this.parseMpesaTime(timeStr);

    if (!date || !time) return null;

    date.setHours(time.hours, time.minutes, 0, 0);
    return date;
  }

  /**
   * Format date for input field (YYYY-MM-DD)
   */
  static toInputFormat(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get date range string
   */
  static getDateRangeString(start: Date, end: Date): string {
    const startStr = this.formatDate(start, 'short');
    const endStr = this.formatDate(end, 'short');
    return `${startStr} - ${endStr}`;
  }
}