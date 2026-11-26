import { AlertCircle, Footprints, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Treatment, VisitRecord } from '../../types';
import { getCurrentDateString } from '../../utils/dateUtils';
import { AuroraLogo } from '../ui/AuroraLogo';

interface VisitFormModalProps {
  isOpen: boolean;
  initialData?: VisitRecord | null;
  activeTreatments: Treatment[];
  onClose: () => void;
  onSubmit: (
    data: Omit<VisitRecord, 'id' | 'created_at' | 'updated_at'>
  ) => Promise<void> | void;
}

const SOURCE_SUGGESTIONS = [
  'Instagram',
  'TikTok',
  'Teman / Keluarga',
  'Google Maps',
  'Lewat Outlet',
];

export const VisitFormModal: React.FC<VisitFormModalProps> = ({
  isOpen,
  initialData,
  activeTreatments,
  onClose,
  onSubmit,
}) => {
  const isEditing = !!initialData;

  const [tanggal, setTanggal] = useState('');
  const [nama, setNama] = useState('');
  const [noHp, setNoHp] = useState('');
  const [alamat, setAlamat] = useState('');
  const [treatment, setTreatment] = useState('');
  const [kesanPesan, setKesanPesan] = useState('');
  const [tauDariMana, setTauDariMana] = useState('');
  const [keterangan, setKeterangan] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTanggal(initialData.tanggal || '');
        setNama(initialData.nama || '');
        setNoHp(initialData.no_hp || '');
        setAlamat(initialData.alamat || '');
        setTreatment(initialData.treatment || '');
        setKesanPesan(initialData.kesan_pesan || '');
        setTauDariMana(initialData.tau_dari_mana || '');
        setKeterangan(initialData.keterangan || '');
      } else {
        setTanggal(getCurrentDateString());
        setNama('');
        setNoHp('');
        setAlamat('');
        setTreatment('');
        setKesanPesan('');
        setTauDariMana('');
        setKeterangan('');
      }
      setErrorMsg('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Hanya Nama atau Tanggal yang wajib (minimal salah satu terisi), lainnya opsional
    if (!nama.trim() && !tanggal.trim()) {
      setErrorMsg('Minimal isi Nama atau Tanggal terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await onSubmit({
        tanggal: tanggal.trim(),
        nama: nama.trim(),
        no_hp: noHp.trim(),
        alamat: alamat.trim(),
        treatment: treatment.trim(),
        kesan_pesan: kesanPesan.trim(),
        tau_dari_mana: tauDariMana.trim(),
        keterangan: keterangan.trim(),
      });
    } catch {
      setErrorMsg('Gagal menyimpan data visit. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/30 backdrop-blur-2xs overflow-y-auto">
      <div
        className="bg-white rounded-2xl border border-[#E4EBF0] shadow-xl w-full max-w-xl my-4 sm:my-8 overflow-hidden animate-popup-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="visit-form-title"
      >
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-[#E4EBF0] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <AuroraLogo size="sm" />
            <div>
              <h3
                id="visit-form-title"
                className="text-base font-bold text-[#223749] tracking-tight flex items-center gap-1.5"
              >
                <Footprints className="w-4 h-4 text-[#0D9488]" />
                <span>{isEditing ? 'Edit Data Visit' : 'Input Data Visit'}</span>
              </h3>
              <p className="text-xs text-[#647b8e]">
                Hanya Nama atau Tanggal yang wajib — kolom lainnya opsional
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#f4fafc] border border-transparent hover:border-[#E4EBF0] flex items-center justify-center text-[#647b8e] hover:text-[#223749]"
            aria-label="Tutup formulir"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-4 sm:p-6 space-y-4 max-h-[72vh] overflow-y-auto">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Tanggal & Nama */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#223749] mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4EBF0] bg-white text-sm text-[#223749] focus:outline-hidden focus:border-[#0D9488]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#223749] mb-1">
                  Nama
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Ibu Dinda"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4EBF0] bg-white text-sm text-[#223749] placeholder:text-[#9AA7B4] focus:outline-hidden focus:border-[#0D9488]"
                />
              </div>
            </div>

            {/* No HP & Treatment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#223749] mb-1">
                  No. HP <span className="text-[#8699a8] font-normal">(Opsional)</span>
                </label>
                <input
                  type="tel"
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  placeholder="Contoh: 0812-xxxx-xxxx"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4EBF0] bg-white text-sm text-[#223749] placeholder:text-[#9AA7B4] focus:outline-hidden focus:border-[#0D9488]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#223749] mb-1">
                  Treatment <span className="text-[#8699a8] font-normal">(Opsional)</span>
                </label>
                <input
                  type="text"
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  placeholder="Ketik nama treatment..."
                  list="visit-treatment-list"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4EBF0] bg-white text-sm text-[#223749] placeholder:text-[#9AA7B4] focus:outline-hidden focus:border-[#0D9488]"
                />
                <datalist id="visit-treatment-list">
                  {activeTreatments.map((t) => (
                    <option key={t.id} value={t.name} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Alamat */}
            <div>
              <label className="block text-xs font-semibold text-[#223749] mb-1">
                Alamat <span className="text-[#8699a8] font-normal">(Opsional)</span>
              </label>
              <textarea
                rows={2}
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                placeholder="Masukkan alamat lengkap atau area..."
                className="w-full px-3.5 py-2 rounded-xl border border-[#E4EBF0] bg-white text-sm text-[#223749] placeholder:text-[#9AA7B4] focus:outline-hidden focus:border-[#0D9488] resize-none"
              />
            </div>

            {/* Tau Dari Mana */}
            <div>
              <label className="block text-xs font-semibold text-[#223749] mb-1">
                Tau Dari Mana <span className="text-[#8699a8] font-normal">(Opsional)</span>
              </label>
              <input
                type="text"
                value={tauDariMana}
                onChange={(e) => setTauDariMana(e.target.value)}
                placeholder="Contoh: Instagram, TikTok, Teman..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4EBF0] bg-white text-sm text-[#223749] placeholder:text-[#9AA7B4] focus:outline-hidden focus:border-[#0D9488]"
              />
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {SOURCE_SUGGESTIONS.map((src) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setTauDariMana(src)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                      tauDariMana === src
                        ? 'bg-[#0D9488] text-white border-[#0D9488] font-semibold'
                        : 'bg-[#F0FDFA] text-[#0F766E] border-[#99F6E4] hover:bg-[#CCFBF1]'
                    }`}
                  >
                    {src}
                  </button>
                ))}
              </div>
            </div>

            {/* Kesan & Pesan */}
            <div>
              <label className="block text-xs font-semibold text-[#223749] mb-1">
                Kesan &amp; Pesan <span className="text-[#8699a8] font-normal">(Opsional)</span>
              </label>
              <textarea
                rows={2}
                value={kesanPesan}
                onChange={(e) => setKesanPesan(e.target.value)}
                placeholder="Tulis kesan dan pesan dari tamu..."
                className="w-full px-3.5 py-2 rounded-xl border border-[#E4EBF0] bg-white text-sm text-[#223749] placeholder:text-[#9AA7B4] focus:outline-hidden focus:border-[#0D9488] resize-none"
              />
            </div>

            {/* Keterangan */}
            <div>
              <label className="block text-xs font-semibold text-[#223749] mb-1">
                Keterangan <span className="text-[#8699a8] font-normal">(Opsional)</span>
              </label>
              <textarea
                rows={2}
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Catatan atau keterangan tambahan..."
                className="w-full px-3.5 py-2 rounded-xl border border-[#E4EBF0] bg-white text-sm text-[#223749] placeholder:text-[#9AA7B4] focus:outline-hidden focus:border-[#0D9488] resize-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 border-t border-[#E4EBF0] bg-[#FAFDFE] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#E4EBF0] text-xs font-semibold text-[#647b8e] hover:bg-white hover:text-[#223749] transition-colors"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-xs ${
                isSubmitting
                  ? 'bg-[#0D9488]/60 text-white cursor-not-allowed'
                  : 'bg-[#0D9488] hover:bg-[#0F766E] text-white'
              }`}
            >
              {isSubmitting
                ? 'Menyimpan...'
                : isEditing
                ? 'Simpan Perubahan'
                : 'Simpan Data Visit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
