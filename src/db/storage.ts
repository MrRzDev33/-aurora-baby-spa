import {
  DashboardStats,
  GuestCategory,
  Reservation,
  ReservationStatus,
  ReservationWithTreatment,
  Treatment,
} from '../types';
import { isInCurrentMonth, isInCurrentWeek, isToday } from '../utils/dateUtils';

const STORAGE_KEY_TREATMENTS = 'aurora_treatments_v1';
const STORAGE_KEY_RESERVATIONS = 'aurora_reservations_v1';
const DB_CHANGE_EVENT = 'aurora_db_change';

const INITIAL_TREATMENTS: Treatment[] = [
  {
    id: 'trt-001',
    name: 'Couple Massage Mom & Kids',
    is_active: true,
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z',
  },
  {
    id: 'trt-002',
    name: 'Baby Spa & Massage',
    is_active: true,
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z',
  },
  {
    id: 'trt-003',
    name: 'Mom Postpartum Massage',
    is_active: true,
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z',
  },
  {
    id: 'trt-004',
    name: 'Baby Hydrotherapy',
    is_active: true,
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z',
  },
  {
    id: 'trt-005',
    name: 'Kids Bubble Bath & Massage',
    is_active: true,
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z',
  },
  {
    id: 'trt-006',
    name: 'Pregnancy Relaxing Massage',
    is_active: true,
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z',
  },
];

const INITIAL_RESERVATIONS: Reservation[] = [
  // Required dummy reservation for Kachi on Friday, 9 October 2026
  {
    id: 'res-001',
    reservation_code: 'RES-20261009-001',
    mom_name: 'Kachi',
    child_name: 'Kiran dan Kinar',
    child_age: '4+ months',
    whatsapp: '+62812-9744-3286',
    guest_category: 'Trial',
    reservation_date: '2026-10-09',
    reservation_time: '14:00',
    treatment_id: 'trt-001',
    status: 'Confirmed',
    created_at: '2026-10-01T10:00:00.000Z',
    updated_at: '2026-10-01T10:00:00.000Z',
  },
  // Second reservation on 9 October 2026
  {
    id: 'res-002',
    reservation_code: 'RES-20261009-002',
    mom_name: 'Sarah',
    child_name: 'Baby El',
    child_age: '6 months',
    whatsapp: '+62813-8822-1920',
    guest_category: 'Pelanggan',
    reservation_date: '2026-10-09',
    reservation_time: '15:00',
    treatment_id: 'trt-002',
    status: 'Confirmed',
    created_at: '2026-10-01T11:15:00.000Z',
    updated_at: '2026-10-01T11:15:00.000Z',
  },
  // Third reservation on 9 October 2026 (shows "3 Reservations")
  {
    id: 'res-003',
    reservation_code: 'RES-20261009-003',
    mom_name: 'Alya',
    child_name: 'Baby Kenzo',
    child_age: '8 months',
    whatsapp: '+62811-2345-6789',
    guest_category: 'Influencer',
    reservation_date: '2026-10-09',
    reservation_time: '16:30',
    treatment_id: 'trt-003',
    status: 'Confirmed',
    created_at: '2026-10-01T14:30:00.000Z',
    updated_at: '2026-10-01T14:30:00.000Z',
  },
  // Today's reservations (2026-10-02)
  {
    id: 'res-004',
    reservation_code: 'RES-20261002-001',
    mom_name: 'Amanda',
    child_name: 'Baby Sean',
    child_age: '5 months',
    whatsapp: '+62817-5555-8910',
    guest_category: 'Pelanggan',
    reservation_date: '2026-10-02',
    reservation_time: '10:00',
    treatment_id: 'trt-002',
    status: 'Completed',
    created_at: '2026-10-01T08:00:00.000Z',
    updated_at: '2026-10-02T11:00:00.000Z',
  },
  {
    id: 'res-005',
    reservation_code: 'RES-20261002-002',
    mom_name: 'Nabila',
    child_name: 'Arka',
    child_age: '1 year',
    whatsapp: '+62819-0123-4567',
    guest_category: 'Trial',
    reservation_date: '2026-10-02',
    reservation_time: '13:30',
    treatment_id: 'trt-001',
    status: 'In Treatment',
    created_at: '2026-10-01T09:00:00.000Z',
    updated_at: '2026-10-02T13:30:00.000Z',
  },
  {
    id: 'res-006',
    reservation_code: 'RES-20261002-003',
    mom_name: 'Jessica',
    child_name: 'Baby Chloe',
    child_age: '3 months',
    whatsapp: '+62852-7711-2233',
    guest_category: 'Pelanggan',
    reservation_date: '2026-10-02',
    reservation_time: '15:00',
    treatment_id: 'trt-004',
    status: 'Confirmed',
    created_at: '2026-10-01T15:00:00.000Z',
    updated_at: '2026-10-01T15:00:00.000Z',
  },
  {
    id: 'res-007',
    reservation_code: 'RES-20261002-004',
    mom_name: 'Rania',
    child_name: 'Mika & Alif',
    child_age: '2 years & 4 years',
    whatsapp: '+62812-4433-2211',
    guest_category: 'Pelanggan',
    reservation_date: '2026-10-02',
    reservation_time: '16:30',
    treatment_id: 'trt-005',
    status: 'Pending',
    created_at: '2026-10-02T08:30:00.000Z',
    updated_at: '2026-10-02T08:30:00.000Z',
  },
  // Weekend reservation (2026-10-03)
  {
    id: 'res-008',
    reservation_code: 'RES-20261003-001',
    mom_name: 'Clara',
    child_name: 'Baby Lucas',
    child_age: '7 months',
    whatsapp: '+62813-9090-1122',
    guest_category: 'Trial',
    reservation_date: '2026-10-03',
    reservation_time: '11:00',
    treatment_id: 'trt-002',
    status: 'Confirmed',
    created_at: '2026-10-01T14:00:00.000Z',
    updated_at: '2026-10-01T14:00:00.000Z',
  },
  {
    id: 'res-009',
    reservation_code: 'RES-20261003-002',
    mom_name: 'Dinda',
    child_name: 'Baby Rayan',
    child_age: '5 months',
    whatsapp: '+62818-6789-0123',
    guest_category: 'Influencer',
    reservation_date: '2026-10-03',
    reservation_time: '14:00',
    treatment_id: 'trt-001',
    status: 'Confirmed',
    created_at: '2026-10-02T10:00:00.000Z',
    updated_at: '2026-10-02T10:00:00.000Z',
  },
  // Next week reservations
  {
    id: 'res-010',
    reservation_code: 'RES-20261005-001',
    mom_name: 'Fiona',
    child_name: 'Baby Maya',
    child_age: '9 months',
    whatsapp: '+62877-3344-5566',
    guest_category: 'Pelanggan',
    reservation_date: '2026-10-05',
    reservation_time: '10:30',
    treatment_id: 'trt-003',
    status: 'Confirmed',
    created_at: '2026-10-01T12:00:00.000Z',
    updated_at: '2026-10-01T12:00:00.000Z',
  },
  {
    id: 'res-011',
    reservation_code: 'RES-20261007-001',
    mom_name: 'Giselle',
    child_name: 'Oliver',
    child_age: '1.5 years',
    whatsapp: '+62812-9988-7766',
    guest_category: 'Trial',
    reservation_date: '2026-10-07',
    reservation_time: '13:00',
    treatment_id: 'trt-005',
    status: 'Pending',
    created_at: '2026-10-02T09:15:00.000Z',
    updated_at: '2026-10-02T09:15:00.000Z',
  },
  {
    id: 'res-012',
    reservation_code: 'RES-20261012-001',
    mom_name: 'Helena',
    child_name: 'Baby Zoe',
    child_age: '4 months',
    whatsapp: '+62811-4567-8901',
    guest_category: 'Pelanggan',
    reservation_date: '2026-10-12',
    reservation_time: '15:00',
    treatment_id: 'trt-002',
    status: 'Confirmed',
    created_at: '2026-10-02T11:00:00.000Z',
    updated_at: '2026-10-02T11:00:00.000Z',
  },
];

class DatabaseService {
  private notifyListeners() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(DB_CHANGE_EVENT));
    }
  }

  // ===================== TREATMENTS =====================

  public getTreatments(): Treatment[] {
    if (typeof window === 'undefined') return INITIAL_TREATMENTS;
    const stored = localStorage.getItem(STORAGE_KEY_TREATMENTS);
    if (!stored) {
      this.saveTreatments(INITIAL_TREATMENTS);
      return INITIAL_TREATMENTS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_TREATMENTS;
    }
  }

  public getActiveTreatments(): Treatment[] {
    return this.getTreatments().filter((t) => t.is_active);
  }

  private saveTreatments(treatments: Treatment[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_TREATMENTS, JSON.stringify(treatments));
      this.notifyListeners();
    }
  }

  public addTreatment(name: string): Treatment {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error('Treatment name cannot be empty');
    }
    const treatments = this.getTreatments();
    const newTreatment: Treatment = {
      id: `trt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: trimmed,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    treatments.push(newTreatment);
    this.saveTreatments(treatments);
    return newTreatment;
  }

  public updateTreatment(id: string, name: string): Treatment {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error('Treatment name cannot be empty');
    }
    const treatments = this.getTreatments();
    const index = treatments.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error('Treatment not found');
    }
    treatments[index] = {
      ...treatments[index],
      name: trimmed,
      updated_at: new Date().toISOString(),
    };
    this.saveTreatments(treatments);
    return treatments[index];
  }

  public toggleTreatmentActive(id: string): Treatment {
    const treatments = this.getTreatments();
    const index = treatments.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error('Treatment not found');
    }
    treatments[index] = {
      ...treatments[index],
      is_active: !treatments[index].is_active,
      updated_at: new Date().toISOString(),
    };
    this.saveTreatments(treatments);
    return treatments[index];
  }

  public deleteTreatment(id: string): { success: boolean; error?: string } {
    // Check if any reservation is using this treatment
    const reservations = this.getRawReservations();
    const isUsed = reservations.some((r) => r.treatment_id === id);
    if (isUsed) {
      return {
        success: false,
        error:
          'Treatment tidak dapat dihapus karena sudah pernah digunakan dalam reservasi. Gunakan opsi Nonaktifkan (Inactive).',
      };
    }

    const treatments = this.getTreatments();
    const filtered = treatments.filter((t) => t.id !== id);
    this.saveTreatments(filtered);
    return { success: true };
  }

  // ===================== RESERVATIONS =====================

  private getRawReservations(): Reservation[] {
    if (typeof window === 'undefined') return INITIAL_RESERVATIONS;
    const stored = localStorage.getItem(STORAGE_KEY_RESERVATIONS);
    if (!stored) {
      this.saveReservations(INITIAL_RESERVATIONS);
      return INITIAL_RESERVATIONS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_RESERVATIONS;
    }
  }

  private saveReservations(reservations: Reservation[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_RESERVATIONS, JSON.stringify(reservations));
      this.notifyListeners();
    }
  }

  public getReservations(): ReservationWithTreatment[] {
    const raw = this.getRawReservations();
    const treatments = this.getTreatments();
    const treatmentMap = new Map(treatments.map((t) => [t.id, t.name]));

    return raw.map((r) => ({
      ...r,
      treatment_name: treatmentMap.get(r.treatment_id) || 'Treatment Dihapus',
    }));
  }

  public getReservationById(id: string): ReservationWithTreatment | null {
    const list = this.getReservations();
    return list.find((r) => r.id === id) || null;
  }

  /**
   * Generates public reservation code: RES-YYYYMMDD-001
   */
  private generateReservationCode(dateStr: string): string {
    const compactDate = dateStr.replace(/-/g, '');
    const prefix = `RES-${compactDate}-`;
    const existing = this.getRawReservations().filter((r) =>
      r.reservation_code.startsWith(prefix)
    );

    let maxNum = 0;
    for (const r of existing) {
      const parts = r.reservation_code.split('-');
      if (parts.length === 3) {
        const num = parseInt(parts[2], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }

    const nextNum = String(maxNum + 1).padStart(3, '0');
    return `${prefix}${nextNum}`;
  }

  public addReservation(
    input: Omit<Reservation, 'id' | 'reservation_code' | 'created_at' | 'updated_at'>
  ): ReservationWithTreatment {
    const reservations = this.getRawReservations();
    const code = this.generateReservationCode(input.reservation_date);
    const id = `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newReservation: Reservation = {
      ...input,
      id,
      reservation_code: code,
      created_at: now,
      updated_at: now,
    };

    reservations.push(newReservation);
    this.saveReservations(reservations);

    const full = this.getReservationById(id);
    if (!full) {
      throw new Error('Failed to retrieve newly created reservation');
    }
    return full;
  }

  public updateReservation(
    id: string,
    updates: Partial<Omit<Reservation, 'id' | 'reservation_code' | 'created_at'>>
  ): ReservationWithTreatment {
    const reservations = this.getRawReservations();
    const index = reservations.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error('Reservation not found');
    }

    reservations[index] = {
      ...reservations[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.saveReservations(reservations);
    const full = this.getReservationById(id);
    if (!full) {
      throw new Error('Failed to retrieve updated reservation');
    }
    return full;
  }

  public deleteReservation(id: string): boolean {
    const reservations = this.getRawReservations();
    const initialLen = reservations.length;
    const filtered = reservations.filter((r) => r.id !== id);
    if (filtered.length === initialLen) return false;
    this.saveReservations(filtered);
    return true;
  }

  // ===================== DASHBOARD METRICS =====================

  public getDashboardStats(refDate: Date = new Date()): DashboardStats {
    const list = this.getRawReservations();
    let todayCount = 0;
    let thisWeekCount = 0;
    let thisMonthCount = 0;

    for (const r of list) {
      if (isToday(r.reservation_date)) {
        todayCount++;
      }
      if (isInCurrentWeek(r.reservation_date, refDate)) {
        thisWeekCount++;
      }
      if (isInCurrentMonth(r.reservation_date, refDate)) {
        thisMonthCount++;
      }
    }

    return {
      todayCount,
      thisWeekCount,
      thisMonthCount,
    };
  }

  public getUpcomingReservations(limit: number = 5): ReservationWithTreatment[] {
    const list = this.getReservations();
    const todayStr = new Date().toISOString().split('T')[0];

    // Filter today or future, sort chronologically (date, then time)
    const upcoming = list
      .filter((r) => r.reservation_date >= todayStr)
      .sort((a, b) => {
        if (a.reservation_date !== b.reservation_date) {
          return a.reservation_date.localeCompare(b.reservation_date);
        }
        return a.reservation_time.localeCompare(b.reservation_time);
      });

    return upcoming.slice(0, limit);
  }

  // Reset helper
  public resetToDefault(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_TREATMENTS, JSON.stringify(INITIAL_TREATMENTS));
      localStorage.setItem(STORAGE_KEY_RESERVATIONS, JSON.stringify(INITIAL_RESERVATIONS));
      this.notifyListeners();
    }
  }

  public subscribe(callback: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    window.addEventListener(DB_CHANGE_EVENT, callback);
    return () => {
      window.removeEventListener(DB_CHANGE_EVENT, callback);
    };
  }
}

export const dbService = new DatabaseService();
