import {
  DashboardStats,
  GuestCategory,
  Reservation,
  ReservationStatus,
  ReservationWithTreatment,
  Treatment,
} from '../types';
import { isInCurrentMonth, isInCurrentWeek, isToday } from '../utils/dateUtils';
import { getSupabaseClient, getSupabaseCredentials } from './supabase';

export interface SupabaseReservationRow {
  id: string;
  reservation_code: string;
  mom_name: string;
  child_name: string;
  child_age: string;
  whatsapp: string;
  guest_category: string;
  reservation_date: string;
  reservation_time: string;
  treatment_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  treatments?: {
    id: string;
    name: string;
    is_active: boolean;
  } | null;
}

export interface SupabaseTreatmentRow {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Initial fallback seeds (used when Supabase is not yet configured or initial seeding)
const INITIAL_TREATMENTS: Treatment[] = [
  {
    id: 'c56a4180-65aa-42ec-a945-5fd21dec0538',
    name: 'Couple Massage Mom & Kids',
    is_active: true,
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z',
  },
  {
    id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    name: 'Baby Spa & Massage',
    is_active: true,
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z',
  },
  {
    id: '1024045b-6f59-4b2a-9e3f-677a83d73b06',
    name: 'Mom Postpartum Massage',
    is_active: true,
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z',
  },
  {
    id: 'e14251dc-b12e-4bca-876a-73d8e578491c',
    name: 'Baby Hydrotherapy',
    is_active: true,
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z',
  },
  {
    id: 'fd62bf8a-6b21-4d32-9cb8-4db81d68be0b',
    name: 'Kids Bubble Bath & Massage',
    is_active: true,
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z',
  },
];

// Initial reservations are empty for production data input
const INITIAL_RESERVATIONS: ReservationWithTreatment[] = [];

// Local fallback store keys
const LOCAL_STORE_RESERVATIONS = 'aurora_reservations_v2';
const LOCAL_STORE_TREATMENTS = 'aurora_treatments_v2';

function getLocalTreatments(): Treatment[] {
  if (typeof window === 'undefined') return INITIAL_TREATMENTS;
  const raw = localStorage.getItem(LOCAL_STORE_TREATMENTS);
  if (!raw) {
    localStorage.setItem(LOCAL_STORE_TREATMENTS, JSON.stringify(INITIAL_TREATMENTS));
    return INITIAL_TREATMENTS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_TREATMENTS;
  }
}

function saveLocalTreatments(treatments: Treatment[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORE_TREATMENTS, JSON.stringify(treatments));
  }
}

function getLocalReservations(): ReservationWithTreatment[] {
  if (typeof window === 'undefined') return [];
  // Clean up any legacy dummy cache keys from previous versions
  try {
    localStorage.removeItem('aurora_supabase_cache_res_v1');
    localStorage.removeItem('aurora_reservations_v1');
  } catch {
    // Ignore storage errors in restricted contexts
  }

  const raw = localStorage.getItem(LOCAL_STORE_RESERVATIONS);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Ensure no residual dummy items remain
    const clean = parsed.filter(
      (r: ReservationWithTreatment) =>
        r &&
        !r.id?.startsWith('a0eebc99') &&
        !r.id?.startsWith('b0eebc99') &&
        !r.id?.startsWith('c0eebc99') &&
        !r.id?.startsWith('d0eebc99') &&
        !r.id?.startsWith('e0eebc99') &&
        !r.id?.startsWith('f0eebc99') &&
        !r.id?.startsWith('01eebc99') &&
        r.mom_name !== 'Kachi' &&
        r.mom_name !== 'Sarah' &&
        r.mom_name !== 'Alya' &&
        r.mom_name !== 'Amanda' &&
        r.mom_name !== 'Nabila' &&
        r.mom_name !== 'Jessica' &&
        r.mom_name !== 'Rania'
    );
    return clean;
  } catch {
    return [];
  }
}

function saveLocalReservations(res: ReservationWithTreatment[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORE_RESERVATIONS, JSON.stringify(res));
  }
}

// Format time from Supabase (e.g., '14:00:00' -> '14:00')
function formatTimeHHmm(timeStr: string): string {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return timeStr;
}

/**
 * Service Layer for Supabase CRUD
 */
export const reservationService = {
  /**
   * Check connection status
   */
  async checkConnection(): Promise<{ isConnected: boolean; error?: string }> {
    const client = getSupabaseClient();
    if (!client) {
      return {
        isConnected: false,
        error: 'Supabase credentials not configured in environment.',
      };
    }

    try {
      const { error } = await client.from('treatments').select('id').limit(1);
      if (error) {
        return { isConnected: false, error: error.message };
      }
      return { isConnected: true };
    } catch {
      return {
        isConnected: false,
        error: 'Unable to connect to the database. Please try again.',
      };
    }
  },

  /**
   * Fetch all treatments from Supabase
   */
  async getTreatments(): Promise<Treatment[]> {
    const client = getSupabaseClient();

    if (!client) {
      return getLocalTreatments();
    }

    try {
      const { data, error } = await client
        .from('treatments')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('Supabase getTreatments error, falling back to local cache:', error.message);
        return getLocalTreatments();
      }

      const treatments: Treatment[] = (data || []).map((t: SupabaseTreatmentRow) => ({
        id: t.id,
        name: t.name,
        is_active: t.is_active,
        created_at: t.created_at,
        updated_at: t.updated_at,
      }));

      // Cache locally for offline resilience
      saveLocalTreatments(treatments);
      return treatments;
    } catch (err) {
      console.warn('Network error in getTreatments:', err);
      return getLocalTreatments();
    }
  },

  /**
   * Create new treatment in Supabase
   */
  async createTreatment(name: string): Promise<Treatment> {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error('Nama treatment tidak boleh kosong.');
    }

    const client = getSupabaseClient();

    if (!client) {
      const local = getLocalTreatments();
      const newTrt: Treatment = {
        id: crypto.randomUUID(),
        name: trimmed,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      local.push(newTrt);
      saveLocalTreatments(local);
      return newTrt;
    }

    try {
      const { data, error } = await client
        .from('treatments')
        .insert({
          name: trimmed,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        throw new Error('Unable to connect to the database. Please try again.');
      }

      return {
        id: data.id,
        name: data.name,
        is_active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (err) {
      throw new Error('Unable to connect to the database. Please try again.');
    }
  },

  /**
   * Find existing treatment by name (case-insensitive) or create a new one
   */
  async getOrCreateTreatmentByName(name: string): Promise<Treatment> {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error('Nama treatment tidak boleh kosong.');
    }

    const treatments = await this.getTreatments();
    const existing = treatments.find(
      (t) => t.name.trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (existing) {
      return existing;
    }

    return this.createTreatment(trimmed);
  },

  /**
   * Update treatment in Supabase
   */
  async updateTreatment(id: string, name: string): Promise<Treatment> {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error('Nama treatment tidak boleh kosong.');
    }

    const client = getSupabaseClient();

    if (!client) {
      const local = getLocalTreatments();
      const idx = local.findIndex((t) => t.id === id);
      if (idx === -1) throw new Error('Treatment tidak ditemukan.');
      local[idx] = {
        ...local[idx],
        name: trimmed,
        updated_at: new Date().toISOString(),
      };
      saveLocalTreatments(local);
      return local[idx];
    }

    try {
      const { data, error } = await client
        .from('treatments')
        .update({
          name: trimmed,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error('Unable to connect to the database. Please try again.');
      }

      return {
        id: data.id,
        name: data.name,
        is_active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (err) {
      throw new Error('Unable to connect to the database. Please try again.');
    }
  },

  /**
   * Toggle treatment is_active in Supabase
   */
  async toggleTreatmentActive(id: string, currentActive: boolean): Promise<Treatment> {
    const client = getSupabaseClient();

    if (!client) {
      const local = getLocalTreatments();
      const idx = local.findIndex((t) => t.id === id);
      if (idx === -1) throw new Error('Treatment tidak ditemukan.');
      local[idx] = {
        ...local[idx],
        is_active: !currentActive,
        updated_at: new Date().toISOString(),
      };
      saveLocalTreatments(local);
      return local[idx];
    }

    try {
      const { data, error } = await client
        .from('treatments')
        .update({
          is_active: !currentActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error('Unable to connect to the database. Please try again.');
      }

      return {
        id: data.id,
        name: data.name,
        is_active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch {
      throw new Error('Unable to connect to the database. Please try again.');
    }
  },

  /**
   * Delete treatment (only if not used in reservations)
   */
  async deleteTreatment(id: string): Promise<{ success: boolean; error?: string }> {
    const client = getSupabaseClient();

    if (!client) {
      const localRes = getLocalReservations();
      const isUsed = localRes.some((r) => r.treatment_id === id);
      if (isUsed) {
        return {
          success: false,
          error:
            'Treatment tidak dapat dihapus karena sudah pernah digunakan dalam reservasi. Gunakan opsi Nonaktifkan (Inactive).',
        };
      }
      const localTrt = getLocalTreatments().filter((t) => t.id !== id);
      saveLocalTreatments(localTrt);
      return { success: true };
    }

    try {
      // Check relationship first
      const { count, error: countErr } = await client
        .from('reservations')
        .select('id', { count: 'exact', head: true })
        .eq('treatment_id', id);

      if (countErr) {
        return {
          success: false,
          error: 'Unable to connect to the database. Please try again.',
        };
      }

      if (count && count > 0) {
        return {
          success: false,
          error:
            'Treatment tidak dapat dihapus karena sudah pernah digunakan dalam reservasi. Gunakan opsi Nonaktifkan (Inactive).',
        };
      }

      const { error } = await client.from('treatments').delete().eq('id', id);
      if (error) {
        return {
          success: false,
          error: 'Unable to connect to the database. Please try again.',
        };
      }

      return { success: true };
    } catch {
      return {
        success: false,
        error: 'Unable to connect to the database. Please try again.',
      };
    }
  },

  /**
   * Fetch all reservations from Supabase with joined treatments table
   */
  async getReservations(): Promise<ReservationWithTreatment[]> {
    const client = getSupabaseClient();

    if (!client) {
      return getLocalReservations();
    }

    try {
      const { data, error } = await client
        .from('reservations')
        .select(`
          id,
          reservation_code,
          mom_name,
          child_name,
          child_age,
          whatsapp,
          guest_category,
          reservation_date,
          reservation_time,
          treatment_id,
          status,
          created_at,
          updated_at,
          treatments (
            id,
            name,
            is_active
          )
        `)
        .order('reservation_date', { ascending: true })
        .order('reservation_time', { ascending: true });

      if (error) {
        console.warn('Supabase getReservations error, using local fallback:', error.message);
        return getLocalReservations();
      }

      const list: ReservationWithTreatment[] = (data || []).map((row: any) => ({
        id: row.id,
        reservation_code: row.reservation_code,
        mom_name: row.mom_name,
        child_name: row.child_name,
        child_age: row.child_age,
        whatsapp: row.whatsapp,
        guest_category: row.guest_category as GuestCategory,
        reservation_date: row.reservation_date,
        reservation_time: formatTimeHHmm(row.reservation_time),
        treatment_id: row.treatment_id,
        treatment_name: row.treatments?.name || 'Treatment Dihapus',
        status: row.status as ReservationStatus,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));

      // Cache locally
      saveLocalReservations(list);
      return list;
    } catch (err) {
      console.warn('Network error in getReservations:', err);
      return getLocalReservations();
    }
  },

  /**
   * Fetch single reservation by ID
   */
  async getReservationById(id: string): Promise<ReservationWithTreatment | null> {
    const list = await this.getReservations();
    return list.find((r) => r.id === id) || null;
  },

  /**
   * Generate next unique reservation code for given date
   */
  async generateReservationCode(dateStr: string): Promise<string> {
    const compactDate = dateStr.replace(/-/g, '');
    const prefix = `RES-${compactDate}-`;

    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('reservations')
          .select('reservation_code')
          .like('reservation_code', `${prefix}%`);

        if (!error && data) {
          let maxNum = 0;
          for (const item of data) {
            const parts = item.reservation_code.split('-');
            if (parts.length === 3) {
              const num = parseInt(parts[2], 10);
              if (!isNaN(num) && num > maxNum) maxNum = num;
            }
          }
          const next = String(maxNum + 1).padStart(3, '0');
          return `${prefix}${next}`;
        }
      } catch {
        // Fallback below
      }
    }

    // Local fallback code generation
    const local = getLocalReservations().filter((r) =>
      r.reservation_code.startsWith(prefix)
    );
    let maxNum = 0;
    for (const r of local) {
      const parts = r.reservation_code.split('-');
      if (parts.length === 3) {
        const num = parseInt(parts[2], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    }
    const next = String(maxNum + 1).padStart(3, '0');
    return `${prefix}${next}`;
  },

  /**
   * Create new reservation in Supabase
   */
  async createReservation(
    input: Omit<Reservation, 'id' | 'reservation_code' | 'created_at' | 'updated_at'>
  ): Promise<ReservationWithTreatment> {
    const code = await this.generateReservationCode(input.reservation_date);
    const client = getSupabaseClient();

    if (!client) {
      const local = getLocalReservations();
      const treatments = getLocalTreatments();
      const trt = treatments.find((t) => t.id === input.treatment_id);

      const newRes: ReservationWithTreatment = {
        ...input,
        id: crypto.randomUUID(),
        reservation_code: code,
        treatment_name: trt?.name || 'Treatment',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      local.push(newRes);
      saveLocalReservations(local);
      return newRes;
    }

    try {
      const { data, error } = await client
        .from('reservations')
        .insert({
          reservation_code: code,
          mom_name: input.mom_name,
          child_name: input.child_name,
          child_age: input.child_age,
          whatsapp: input.whatsapp,
          guest_category: input.guest_category,
          reservation_date: input.reservation_date,
          reservation_time: input.reservation_time,
          treatment_id: input.treatment_id,
          status: input.status,
        })
        .select(`
          id,
          reservation_code,
          mom_name,
          child_name,
          child_age,
          whatsapp,
          guest_category,
          reservation_date,
          reservation_time,
          treatment_id,
          status,
          created_at,
          updated_at,
          treatments (
            id,
            name,
            is_active
          )
        `)
        .single();

      if (error) {
        console.error('Supabase insert reservation error:', error);
        throw new Error('Unable to connect to the database. Please try again.');
      }

      return {
        id: data.id,
        reservation_code: data.reservation_code,
        mom_name: data.mom_name,
        child_name: data.child_name,
        child_age: data.child_age,
        whatsapp: data.whatsapp,
        guest_category: data.guest_category as GuestCategory,
        reservation_date: data.reservation_date,
        reservation_time: formatTimeHHmm(data.reservation_time),
        treatment_id: data.treatment_id,
        treatment_name: (data as any).treatments?.name || 'Treatment',
        status: data.status as ReservationStatus,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch {
      throw new Error('Unable to connect to the database. Please try again.');
    }
  },

  /**
   * Update existing reservation in Supabase
   */
  async updateReservation(
    id: string,
    updates: Partial<Omit<Reservation, 'id' | 'reservation_code' | 'created_at'>>
  ): Promise<ReservationWithTreatment> {
    const client = getSupabaseClient();

    if (!client) {
      const local = getLocalReservations();
      const idx = local.findIndex((r) => r.id === id);
      if (idx === -1) throw new Error('Reservasi tidak ditemukan.');

      const treatments = getLocalTreatments();
      const trtId = updates.treatment_id || local[idx].treatment_id;
      const trt = treatments.find((t) => t.id === trtId);

      local[idx] = {
        ...local[idx],
        ...updates,
        treatment_name: trt?.name || local[idx].treatment_name,
        updated_at: new Date().toISOString(),
      };
      saveLocalReservations(local);
      return local[idx];
    }

    try {
      const { data, error } = await client
        .from('reservations')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(`
          id,
          reservation_code,
          mom_name,
          child_name,
          child_age,
          whatsapp,
          guest_category,
          reservation_date,
          reservation_time,
          treatment_id,
          status,
          created_at,
          updated_at,
          treatments (
            id,
            name,
            is_active
          )
        `)
        .single();

      if (error) {
        throw new Error('Unable to connect to the database. Please try again.');
      }

      return {
        id: data.id,
        reservation_code: data.reservation_code,
        mom_name: data.mom_name,
        child_name: data.child_name,
        child_age: data.child_age,
        whatsapp: data.whatsapp,
        guest_category: data.guest_category as GuestCategory,
        reservation_date: data.reservation_date,
        reservation_time: formatTimeHHmm(data.reservation_time),
        treatment_id: data.treatment_id,
        treatment_name: (data as any).treatments?.name || 'Treatment',
        status: data.status as ReservationStatus,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch {
      throw new Error('Unable to connect to the database. Please try again.');
    }
  },

  /**
   * Delete reservation in Supabase
   */
  async deleteReservation(id: string): Promise<boolean> {
    const client = getSupabaseClient();

    if (!client) {
      const local = getLocalReservations();
      const filtered = local.filter((r) => r.id !== id);
      saveLocalReservations(filtered);
      return true;
    }

    try {
      const { error } = await client.from('reservations').delete().eq('id', id);
      if (error) {
        throw new Error('Unable to connect to the database. Please try again.');
      }
      return true;
    } catch {
      throw new Error('Unable to connect to the database. Please try again.');
    }
  },

  /**
   * Clear all reservations (wipes dummy/test reservations from both storage and Supabase)
   */
  async clearAllReservations(): Promise<boolean> {
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('reservations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (err) {
        console.warn('Supabase clear reservations warning:', err);
      }
    }
    saveLocalReservations([]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(LOCAL_STORE_RESERVATIONS);
        localStorage.removeItem('aurora_supabase_cache_res_v1');
        localStorage.removeItem('aurora_reservations_v1');
      } catch {
        // Ignore
      }
    }
    return true;
  },

  /**
   * Get Dashboard statistics computed from live reservations
   */
  getDashboardStatistics(
    reservations: ReservationWithTreatment[],
    refDate: Date = new Date()
  ): DashboardStats {
    let todayCount = 0;
    let thisWeekCount = 0;
    let thisMonthCount = 0;

    for (const r of reservations) {
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
  },

  /**
   * Subscribe to Supabase Realtime changes on reservations
   */
  subscribeToRealtime(onChange: () => void): () => void {
    const client = getSupabaseClient();
    if (!client) return () => {};

    try {
      const channel = client
        .channel('public:reservations_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'reservations' },
          () => {
            onChange();
          }
        )
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    } catch {
      return () => {};
    }
  },
};
