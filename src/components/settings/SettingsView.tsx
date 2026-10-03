import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Database,
  Edit2,
  ExternalLink,
  Info,
  Plus,
  RefreshCw,
  RotateCcw,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Trash2,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { getSupabaseCredentials, saveSupabaseCredentials } from '../../services/supabase';
import { ReservationWithTreatment, Treatment } from '../../types';

interface SettingsViewProps {
  treatments: Treatment[];
  reservations: ReservationWithTreatment[];
  onAddTreatment: (name: string) => Promise<Treatment>;
  onUpdateTreatment: (id: string, name: string) => Promise<Treatment>;
  onToggleTreatmentActive: (id: string, currentActive: boolean) => Promise<Treatment>;
  onDeleteTreatment: (id: string) => Promise<{ success: boolean; error?: string }>;
  onClearAllReservations?: () => Promise<boolean | void>;
  onResetData: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
  connectionStatus: {
    isConfigured: boolean;
    isConnected: boolean;
    error?: string;
  };
  onRefreshData: () => Promise<void>;
  onCheckConnection: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  treatments,
  reservations,
  onAddTreatment,
  onUpdateTreatment,
  onToggleTreatmentActive,
  onDeleteTreatment,
  onClearAllReservations,
  onResetData,
  onShowToast,
  connectionStatus,
  onRefreshData,
  onCheckConnection,
}) => {
  // Clear reservations state
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  // New treatment state
  const [newTreatmentName, setNewTreatmentName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Edit treatment state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Supabase Configuration State
  const creds = getSupabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(creds.url);
  const [supabaseKey, setSupabaseKey] = useState(creds.anonKey);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Calculate reservation count per treatment
  const usageCountMap = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const r of reservations) {
      map.set(r.treatment_id, (map.get(r.treatment_id) || 0) + 1);
    }
    return map;
  }, [reservations]);

  const handleCreateTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTreatmentName.trim()) {
      onShowToast('Nama treatment tidak boleh kosong.', 'error');
      return;
    }
    try {
      await onAddTreatment(newTreatmentName.trim());
      setNewTreatmentName('');
      setIsAdding(false);
      onShowToast('Treatment baru berhasil ditambahkan.');
    } catch {
      onShowToast('Unable to connect to the database. Please try again.', 'error');
    }
  };

  const handleStartEdit = (t: Treatment) => {
    setEditingId(t.id);
    setEditingName(t.name);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingName.trim()) {
      onShowToast('Nama treatment tidak boleh kosong.', 'error');
      return;
    }
    try {
      await onUpdateTreatment(id, editingName.trim());
      setEditingId(null);
      setEditingName('');
      onShowToast('Nama treatment berhasil diperbarui.');
    } catch {
      onShowToast('Unable to connect to the database. Please try again.', 'error');
    }
  };

  const handleDelete = async (t: Treatment) => {
    const count = usageCountMap.get(t.id) || 0;
    if (count > 0) {
      onShowToast(
        `Treatment "${t.name}" sudah digunakan pada ${count} reservasi. Silakan nonaktifkan (Inactive) saja.`,
        'error'
      );
      return;
    }

    if (confirm(`Hapus treatment "${t.name}" secara permanen?`)) {
      const res = await onDeleteTreatment(t.id);
      if (res.success) {
        onShowToast('Treatment berhasil dihapus.');
      } else {
        onShowToast(res.error || 'Unable to connect to the database. Please try again.', 'error');
      }
    }
  };

  const handleConfirmClearAll = async () => {
    if (!onClearAllReservations) return;
    setIsClearing(true);
    try {
      await onClearAllReservations();
      setShowClearConfirmModal(false);
      onShowToast('Seluruh data reservasi dummy berhasil dihapus. Database bersih!');
    } catch {
      onShowToast('Gagal mengosongkan data reservasi. Silakan coba lagi.', 'error');
    } finally {
      setIsClearing(false);
    }
  };

  const handleSaveSupabaseConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTestingConnection(true);
    try {
      saveSupabaseCredentials(supabaseUrl, supabaseKey);
      await onCheckConnection();
      await onRefreshData();
      onShowToast('Konfigurasi Supabase berhasil disimpan.');
    } catch {
      onShowToast('Unable to connect to the database. Please try again.', 'error');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const sqlSchemaText = `-- AURORA MOM & BABY SPA — SUPABASE DATABASE SCHEMA
CREATE TABLE IF NOT EXISTS public.treatments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_code TEXT UNIQUE NOT NULL,
    mom_name TEXT NOT NULL,
    child_name TEXT NOT NULL,
    child_age TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    guest_category TEXT NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    treatment_id UUID NOT NULL REFERENCES public.treatments(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reservations_date ON public.reservations (reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_datetime ON public.reservations (reservation_date, reservation_time);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations (status);
CREATE INDEX IF NOT EXISTS idx_reservations_guest_category ON public.reservations (guest_category);
CREATE INDEX IF NOT EXISTS idx_reservations_treatment_id ON public.reservations (treatment_id);
CREATE INDEX IF NOT EXISTS idx_reservations_mom_name ON public.reservations (mom_name);
CREATE INDEX IF NOT EXISTS idx_reservations_whatsapp ON public.reservations (whatsapp);

ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read treatments" ON public.treatments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public insert treatments" ON public.treatments FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public update treatments" ON public.treatments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete treatments" ON public.treatments FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "Allow public read reservations" ON public.reservations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public insert reservations" ON public.reservations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public update reservations" ON public.reservations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete reservations" ON public.reservations FOR DELETE TO anon, authenticated USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchemaText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
    onShowToast('Script SQL schema berhasil disalin ke clipboard.');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#263746] tracking-tight">
          Settings
        </h2>
        <p className="text-sm text-[#71808F] mt-0.5">
          Konfigurasi sistem, manajemen katalog treatment, dan integrasi backend Supabase
        </p>
      </div>

      {/* Section 0: Supabase Backend Connection */}
      <div className="bg-white rounded-2xl border border-[#E4EBF0] shadow-xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4EBF0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e8f5fb] text-[#16567d] flex items-center justify-center border border-[#4eafde]/40 shrink-0">
              <Database className="w-5 h-5 text-[#4eafde]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#223749]">
                Supabase Database Connection
              </h3>
              <p className="text-xs text-[#647b8e] mt-0.5">
                Basis data utama dan persisten untuk seluruh data reservasi &amp; treatment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {connectionStatus.isConnected ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Connected to Supabase
              </span>
            ) : connectionStatus.isConfigured ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Connecting / Retrying...
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#f4fafc] text-[#16567d] border border-[#4eafde]/40">
                <span className="w-2 h-2 rounded-full bg-[#4eafde]" />
                Supabase Ready (Active Cache)
              </span>
            )}
          </div>
        </div>

        {/* Supabase credentials form */}
        <form onSubmit={handleSaveSupabaseConfig} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#223749] mb-1">
                Supabase Project URL
              </label>
              <input
                type="url"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://your-project-id.supabase.co"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4EBF0] bg-white text-xs sm:text-sm text-[#223749] placeholder:text-[#9AA7B4] focus:outline-hidden focus:border-[#4eafde]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#223749] mb-1">
                Supabase Anon Key (Public Key)
              </label>
              <input
                type="password"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4EBF0] bg-white text-xs sm:text-sm text-[#223749] placeholder:text-[#9AA7B4] focus:outline-hidden focus:border-[#4eafde]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSqlModal(true)}
                className="px-3 py-2 rounded-xl border border-[#E4EBF0] text-xs font-semibold text-[#245D87] hover:bg-[#F5FAFD] transition-colors flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Lihat SQL Schema Supabase</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  setIsTestingConnection(true);
                  await onCheckConnection();
                  await onRefreshData();
                  setIsTestingConnection(false);
                  onShowToast('Koneksi Supabase diperiksa.');
                }}
                disabled={isTestingConnection}
                className="px-3.5 py-2 rounded-xl border border-[#E4EBF0] text-xs font-semibold text-[#71808F] hover:bg-[#F5FAFD] hover:text-[#263746] transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTestingConnection ? 'animate-spin' : ''}`} />
                <span>Tes Koneksi</span>
              </button>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#4eafde] hover:bg-[#3ea0cf] text-white text-xs font-bold transition-colors shadow-xs"
              >
                Simpan &amp; Hubungkan
              </button>
            </div>
          </div>
        </form>

        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#f4fafc] border border-[#E4EBF0] text-xs text-[#647b8e]">
          <Info className="w-4 h-4 text-[#4eafde] shrink-0 mt-0.5" />
          <span>
            Data tersimpan di Supabase secara persisten menggunakan tabel <code>reservations</code> dan <code>treatments</code> dengan Row Level Security (RLS) dan Supabase Realtime diaktifkan.
          </span>
        </div>
      </div>

      {/* Section 1: Treatment Management */}
      <div className="bg-white rounded-2xl border border-[#E4EBF0] shadow-xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4EBF0]">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#223749]">
              Treatment Management
            </h3>
            <p className="text-xs text-[#647b8e] mt-0.5">
              Kelola menu perawatan spa yang tersimpan di Supabase
            </p>
          </div>

          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="px-3.5 py-2 rounded-xl bg-[#4eafde] hover:bg-[#3ea0cf] text-white font-semibold text-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Treatment</span>
            </button>
          )}
        </div>

        {/* Add Treatment Inline Form */}
        {isAdding && (
          <form
            onSubmit={handleCreateTreatment}
            className="p-4 rounded-xl bg-[#f4fafc] border border-[#4eafde]/50 flex flex-col sm:flex-row items-center gap-3 animate-in fade-in duration-150"
          >
            <input
              type="text"
              value={newTreatmentName}
              onChange={(e) => setNewTreatmentName(e.target.value)}
              placeholder="Masukkan nama treatment baru (contoh: Kids Bubble Bath & Massage)..."
              autoFocus
              className="flex-1 w-full px-3.5 py-2.5 rounded-xl border border-[#E4EBF0] bg-white text-sm text-[#223749] focus:outline-hidden focus:border-[#4eafde]"
            />
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#4eafde] hover:bg-[#3ea0cf] text-white text-xs font-bold transition-colors shadow-xs"
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setNewTreatmentName('');
                }}
                className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-[#E4EBF0] text-[#71808F]"
                aria-label="Batal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Treatment List Table */}
        <div className="divide-y divide-[#E4EBF0] border border-[#E4EBF0] rounded-xl overflow-hidden">
          {treatments.map((t) => {
            const usageCount = usageCountMap.get(t.id) || 0;
            const isEditingThis = editingId === t.id;

            return (
              <div
                key={t.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAFCFE] transition-colors"
              >
                {/* Left: Name or Edit input */}
                <div className="flex-1">
                  {isEditingThis ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-[#4eafde] text-sm text-[#223749] focus:outline-hidden w-full max-w-md"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(t.id)}
                        className="p-1.5 rounded-lg bg-[#4eafde] text-white hover:bg-[#3ea0cf]"
                        title="Simpan"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 rounded-lg border border-[#E4EBF0] text-[#647b8e] hover:bg-white"
                        title="Batal"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5">
                      <span className="font-semibold text-sm text-[#223749]">
                        {t.name}
                      </span>
                      {usageCount > 0 && (
                        <span className="text-[11px] text-[#647b8e] bg-[#f4fafc] px-2 py-0.5 rounded-md border border-[#E4EBF0]">
                          {usageCount} reservasi
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Right: Active/Inactive toggle & Actions */}
                <div className="flex items-center gap-4 self-end sm:self-auto">
                  {/* Status indicator button */}
                  <button
                    onClick={async () => {
                      try {
                        await onToggleTreatmentActive(t.id, t.is_active);
                        onShowToast(`Status treatment "${t.name}" diperbarui.`);
                      } catch {
                        onShowToast('Unable to connect to the database. Please try again.', 'error');
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                      t.is_active
                        ? 'bg-[#e8f5fb] text-[#16567d] border-[#4eafde]/50 hover:bg-[#d8eef8]'
                        : 'bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB] hover:bg-[#E5E7EB]'
                    }`}
                    title="Klik untuk ubah status Active/Inactive di Supabase"
                  >
                    {t.is_active ? (
                      <>
                        <ToggleRight className="w-4 h-4 text-[#4eafde]" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4 text-[#9CA3AF]" />
                        <span>Inactive</span>
                      </>
                    )}
                  </button>

                  {/* Edit Name Button */}
                  {!isEditingThis && (
                    <button
                      onClick={() => handleStartEdit(t)}
                      className="p-1.5 rounded-lg border border-[#E4EBF0] text-[#71808F] hover:text-[#263746] hover:bg-[#F5FAFD] transition-colors"
                      title="Edit Nama Treatment"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(t)}
                    className="p-1.5 rounded-lg border border-[#E4EBF0] text-[#71808F] hover:text-red-600 hover:bg-red-50 transition-colors"
                    title={
                      usageCount > 0
                        ? 'Treatment sudah digunakan dalam reservasi (nonaktifkan saja)'
                        : 'Hapus Treatment'
                    }
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#F5FAFD] border border-[#E4EBF0] text-xs text-[#71808F]">
          <Info className="w-4 h-4 text-[#3575A3] shrink-0 mt-0.5" />
          <span>
            Treatment yang sudah pernah tercatat dalam reservasi tidak dapat dihapus permanen untuk menjaga integritas foreign key di Supabase. Anda dapat menonaktifkannya menjadi <strong>Inactive</strong> agar tidak muncul di pilihan reservasi baru.
          </span>
        </div>
      </div>

      {/* Section 2: Guest Categories (Fixed MVP) */}
      <div className="bg-white rounded-2xl border border-[#E4EBF0] shadow-xs p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#263746]">
            Guest Categories
          </h3>
          <p className="text-xs text-[#71808F] mt-0.5">
            Kategori tamu bawaan sistem untuk klasifikasi pelanggan Aurora Spa (Fixed MVP)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-xl border border-[#E4EBF0] bg-[#FAFDFE]">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#e8f5fb] text-[#16567d] border border-[#4eafde]/40 inline-block mb-2">
              Trial
            </span>
            <p className="text-xs text-[#647b8e]">
              Kunjungan pertama kali atau tamu yang mencoba layanan spa.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[#E4EBF0] bg-[#FAFDFE]">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#F8FAFC] text-[#334155] border border-[#E2E8F0] inline-block mb-2">
              Pelanggan
            </span>
            <p className="text-xs text-[#647b8e]">
              Pelanggan tetap atau member reguler Aurora Mom &amp; Baby Spa.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[#E4EBF0] bg-[#FAFDFE]">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#FAF5FF] text-[#6B21A8] border border-[#E9D5FF] inline-block mb-2">
              Influencer
            </span>
            <p className="text-xs text-[#647b8e]">
              Kerja sama endorsement, KOL, atau publikasi media.
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Data & Reservasi Management */}
      <div className="bg-white rounded-2xl border border-[#E4EBF0] shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4EBF0]">
          <div>
            <h3 className="text-base font-bold text-[#223749]">
              Manajemen Data Reservasi
            </h3>
            <p className="text-xs text-[#647b8e] mt-0.5">
              Status penyimpanan dan pembersihan data reservasi spa
            </p>
          </div>

          <button
            onClick={() => setShowClearConfirmModal(true)}
            disabled={reservations.length === 0}
            className={`px-3.5 py-2 rounded-xl border font-semibold text-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto ${
              reservations.length === 0
                ? 'border-[#E4EBF0] bg-[#f4fafc] text-[#9AA7B4] cursor-not-allowed'
                : 'border-red-200 bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer shadow-xs'
            }`}
            title={reservations.length === 0 ? 'Data reservasi sudah bersih (0 reservasi)' : 'Hapus semua data reservasi'}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Semua Data Reservasi</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#f4fafc] border border-[#E4EBF0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e8f5fb] text-[#16567d] border border-[#4eafde]/30 flex items-center justify-center font-bold text-sm">
              {reservations.length}
            </div>
            <div>
              <p className="text-xs font-semibold text-[#223749]">
                {reservations.length === 0
                  ? 'Database Bersih (0 Reservasi)'
                  : `${reservations.length} Reservasi Tersimpan`}
              </p>
              <p className="text-[11px] text-[#647b8e] mt-0.5">
                {reservations.length === 0
                  ? 'Data dummy telah dihapus. Sistem dalam kondisi bersih dan siap menerima reservasi nyata.'
                  : 'Seluruh data dapat dikosongkan kapan saja jika ingin memulai dari awal.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Siap Menerima Input Baru
            </span>
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus Seluruh Reservasi */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl border border-[#E4EBF0] shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6">
              <div className="flex items-center justify-between pb-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-200">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <button
                  onClick={() => setShowClearConfirmModal(false)}
                  className="text-[#647b8e] hover:text-[#223749] p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 className="text-base font-bold text-[#223749] mt-2">
                Hapus Seluruh Data Reservasi?
              </h3>
              <p className="text-xs text-[#647b8e] mt-2 leading-relaxed">
                Tindakan ini akan menghapus seluruh data reservasi ({reservations.length} item) yang tersimpan di sistem dan database Supabase. Pilihan menu treatment tidak akan dihapus.
              </p>
            </div>

            <div className="p-4 border-t border-[#E4EBF0] bg-[#FAFDFE] flex items-center justify-end gap-3">
              <button
                onClick={() => setShowClearConfirmModal(false)}
                disabled={isClearing}
                className="px-4 py-2 rounded-xl border border-[#E4EBF0] text-xs font-semibold text-[#647b8e] hover:bg-white hover:text-[#223749] transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmClearAll}
                disabled={isClearing}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5"
              >
                {isClearing ? 'Menghapus...' : 'Ya, Hapus Semua'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SQL Schema Preview Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl border border-[#E4EBF0] shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-[#E4EBF0] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#223749]">
                  Supabase SQL Schema Script
                </h3>
                <p className="text-xs text-[#647b8e] mt-0.5">
                  Salin dan jalankan script ini di menu <strong>SQL Editor</strong> di dashboard Supabase Anda
                </p>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-[#f4fafc] flex items-center justify-center text-[#647b8e]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto">
              <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed">
                {sqlSchemaText}
              </pre>
            </div>

            <div className="p-4 border-t border-[#E4EBF0] bg-[#FAFDFE] flex items-center justify-between">
              <span className="text-xs text-[#647b8e]">
                Tersedia juga di file <code>/supabase/schema.sql</code>
              </span>
              <button
                onClick={handleCopySql}
                className="px-4 py-2 rounded-xl bg-[#4eafde] hover:bg-[#3ea0cf] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                {copiedSql ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Semua SQL</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
