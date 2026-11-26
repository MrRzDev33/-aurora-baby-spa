import { JembolRecord, JembolType, VisitRecord } from '../types';
import { getSupabaseClient } from './supabase';

const LOCAL_STORE_JEMBOL = 'aurora_jembol_records_v1';
const LOCAL_STORE_VISIT = 'aurora_visit_records_v1';

let jembolTableMissingFlag = false;
let visitTableMissingFlag = false;

function isMissingTableError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const msg = (error.message || '').toLowerCase();
  return (
    error.code === '42P01' ||
    error.code === 'PGRST205' ||
    msg.includes('does not exist') ||
    msg.includes('could not find the table')
  );
}

function getLocalJembol(): JembolRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORE_JEMBOL);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalJembol(items: JembolRecord[]): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORE_JEMBOL, JSON.stringify(items));
    } catch {
      // Ignore storage errors
    }
  }
}

function getLocalVisit(): VisitRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORE_VISIT);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalVisit(items: VisitRecord[]): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORE_VISIT, JSON.stringify(items));
    } catch {
      // Ignore storage errors
    }
  }
}

function normalizeJembolRow(row: any): JembolRecord {
  return {
    id: row.id,
    jembol_type: (row.jembol_type === 'Trial Treatment' ? 'Trial Treatment' : 'Visit Aja') as JembolType,
    tanggal: row.tanggal || '',
    nama: row.nama || '',
    no_hp: row.no_hp || '',
    alamat: row.alamat || '',
    treatment: row.treatment || '',
    kesan_pesan: row.kesan_pesan || '',
    tau_dari_mana: row.tau_dari_mana || '',
    keterangan: row.keterangan || '',
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function normalizeVisitRow(row: any): VisitRecord {
  return {
    id: row.id,
    tanggal: row.tanggal || '',
    nama: row.nama || '',
    no_hp: row.no_hp || '',
    alamat: row.alamat || '',
    treatment: row.treatment || '',
    kesan_pesan: row.kesan_pesan || '',
    tau_dari_mana: row.tau_dari_mana || '',
    keterangan: row.keterangan || '',
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export const jembolVisitService = {
  getMissingTablesStatus(): { jembolTableMissing: boolean; visitTableMissing: boolean } {
    return {
      jembolTableMissing: jembolTableMissingFlag,
      visitTableMissing: visitTableMissingFlag,
    };
  },

  // ==================== JEMBOL RECORDS ====================
  async getJembolRecords(): Promise<JembolRecord[]> {
    const client = getSupabaseClient();
    if (!client) {
      return getLocalJembol();
    }

    try {
      const res: { data: any[] | null; error: any } = await client
        .from('jembol_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (res.error) {
        if (isMissingTableError(res.error)) {
          jembolTableMissingFlag = true;
        }
        return getLocalJembol();
      }

      jembolTableMissingFlag = false;
      const list = (res.data || []).map(normalizeJembolRow);
      saveLocalJembol(list);
      return list;
    } catch {
      return getLocalJembol();
    }
  },

  async createJembolRecord(
    input: Omit<JembolRecord, 'id' | 'created_at' | 'updated_at'>
  ): Promise<JembolRecord> {
    const client = getSupabaseClient();
    const now = new Date().toISOString();

    if (!client) {
      const local = getLocalJembol();
      const created: JembolRecord = {
        ...input,
        id: crypto.randomUUID(),
        created_at: now,
        updated_at: now,
      };
      const next = [created, ...local];
      saveLocalJembol(next);
      return created;
    }

    try {
      const payload: Record<string, any> = {
        jembol_type: input.jembol_type,
        tanggal: input.tanggal ? input.tanggal : null,
        nama: input.nama || '',
        no_hp: input.no_hp || '',
        alamat: input.alamat || '',
        treatment: input.treatment || '',
        kesan_pesan: input.kesan_pesan || '',
        tau_dari_mana: input.tau_dari_mana || '',
        keterangan: input.keterangan || '',
      };

      const res: { data: any; error: any } = await client
        .from('jembol_records')
        .insert(payload)
        .select('*')
        .single();

      if (res.error || !res.data) {
        if (isMissingTableError(res.error)) {
          jembolTableMissingFlag = true;
          const local = getLocalJembol();
          const created: JembolRecord = {
            ...input,
            id: crypto.randomUUID(),
            created_at: now,
            updated_at: now,
          };
          saveLocalJembol([created, ...local]);
          return created;
        }
        throw new Error('Gagal menyimpan data jembol ke database.');
      }

      jembolTableMissingFlag = false;
      return normalizeJembolRow(res.data);
    } catch (err) {
      if (jembolTableMissingFlag) {
        const local = getLocalJembol();
        const created: JembolRecord = {
          ...input,
          id: crypto.randomUUID(),
          created_at: now,
          updated_at: now,
        };
        saveLocalJembol([created, ...local]);
        return created;
      }
      throw err instanceof Error ? err : new Error('Gagal menyimpan data jembol.');
    }
  },

  async updateJembolRecord(
    id: string,
    updates: Partial<Omit<JembolRecord, 'id' | 'created_at'>>
  ): Promise<JembolRecord> {
    const client = getSupabaseClient();
    const now = new Date().toISOString();

    if (!client || jembolTableMissingFlag) {
      const local = getLocalJembol();
      const idx = local.findIndex((item) => item.id === id);
      if (idx === -1) throw new Error('Data jembol tidak ditemukan.');
      local[idx] = { ...local[idx], ...updates, updated_at: now };
      saveLocalJembol(local);
      return local[idx];
    }

    const payload: Record<string, any> = {
      ...updates,
      updated_at: now,
    };
    if (updates.tanggal !== undefined) {
      payload.tanggal = updates.tanggal ? updates.tanggal : null;
    }

    const res: { data: any; error: any } = await client
      .from('jembol_records')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (res.error || !res.data) {
      throw new Error('Gagal memperbarui data jembol.');
    }

    return normalizeJembolRow(res.data);
  },

  async deleteJembolRecord(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client || jembolTableMissingFlag) {
      const filtered = getLocalJembol().filter((item) => item.id !== id);
      saveLocalJembol(filtered);
      return true;
    }

    const { error } = await client.from('jembol_records').delete().eq('id', id);
    if (error) {
      throw new Error('Gagal menghapus data jembol.');
    }
    return true;
  },

  // ==================== VISIT RECORDS ====================
  async getVisitRecords(): Promise<VisitRecord[]> {
    const client = getSupabaseClient();
    if (!client) {
      return getLocalVisit();
    }

    try {
      const res: { data: any[] | null; error: any } = await client
        .from('visit_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (res.error) {
        if (isMissingTableError(res.error)) {
          visitTableMissingFlag = true;
        }
        return getLocalVisit();
      }

      visitTableMissingFlag = false;
      const list = (res.data || []).map(normalizeVisitRow);
      saveLocalVisit(list);
      return list;
    } catch {
      return getLocalVisit();
    }
  },

  async createVisitRecord(
    input: Omit<VisitRecord, 'id' | 'created_at' | 'updated_at'>
  ): Promise<VisitRecord> {
    const client = getSupabaseClient();
    const now = new Date().toISOString();

    if (!client) {
      const local = getLocalVisit();
      const created: VisitRecord = {
        ...input,
        id: crypto.randomUUID(),
        created_at: now,
        updated_at: now,
      };
      saveLocalVisit([created, ...local]);
      return created;
    }

    try {
      const payload: Record<string, any> = {
        tanggal: input.tanggal ? input.tanggal : null,
        nama: input.nama || '',
        no_hp: input.no_hp || '',
        alamat: input.alamat || '',
        treatment: input.treatment || '',
        kesan_pesan: input.kesan_pesan || '',
        tau_dari_mana: input.tau_dari_mana || '',
        keterangan: input.keterangan || '',
      };

      const res: { data: any; error: any } = await client
        .from('visit_records')
        .insert(payload)
        .select('*')
        .single();

      if (res.error || !res.data) {
        if (isMissingTableError(res.error)) {
          visitTableMissingFlag = true;
          const local = getLocalVisit();
          const created: VisitRecord = {
            ...input,
            id: crypto.randomUUID(),
            created_at: now,
            updated_at: now,
          };
          saveLocalVisit([created, ...local]);
          return created;
        }
        throw new Error('Gagal menyimpan data visit ke database.');
      }

      visitTableMissingFlag = false;
      return normalizeVisitRow(res.data);
    } catch (err) {
      if (visitTableMissingFlag) {
        const local = getLocalVisit();
        const created: VisitRecord = {
          ...input,
          id: crypto.randomUUID(),
          created_at: now,
          updated_at: now,
        };
        saveLocalVisit([created, ...local]);
        return created;
      }
      throw err instanceof Error ? err : new Error('Gagal menyimpan data visit.');
    }
  },

  async updateVisitRecord(
    id: string,
    updates: Partial<Omit<VisitRecord, 'id' | 'created_at'>>
  ): Promise<VisitRecord> {
    const client = getSupabaseClient();
    const now = new Date().toISOString();

    if (!client || visitTableMissingFlag) {
      const local = getLocalVisit();
      const idx = local.findIndex((item) => item.id === id);
      if (idx === -1) throw new Error('Data visit tidak ditemukan.');
      local[idx] = { ...local[idx], ...updates, updated_at: now };
      saveLocalVisit(local);
      return local[idx];
    }

    const payload: Record<string, any> = {
      ...updates,
      updated_at: now,
    };
    if (updates.tanggal !== undefined) {
      payload.tanggal = updates.tanggal ? updates.tanggal : null;
    }

    const res: { data: any; error: any } = await client
      .from('visit_records')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (res.error || !res.data) {
      throw new Error('Gagal memperbarui data visit.');
    }

    return normalizeVisitRow(res.data);
  },

  async deleteVisitRecord(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client || visitTableMissingFlag) {
      const filtered = getLocalVisit().filter((item) => item.id !== id);
      saveLocalVisit(filtered);
      return true;
    }

    const { error } = await client.from('visit_records').delete().eq('id', id);
    if (error) {
      throw new Error('Gagal menghapus data visit.');
    }
    return true;
  },

  subscribeToRealtime(onChange: () => void): () => void {
    const client = getSupabaseClient();
    if (!client) return () => {};

    try {
      const channel = client
        .channel('public:jembol_visit_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'jembol_records' },
          () => onChange()
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'visit_records' },
          () => onChange()
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
