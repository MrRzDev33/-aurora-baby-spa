import { AlertCircle, Calendar, Clock, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
  GuestCategory,
  Reservation,
  ReservationStatus,
  ReservationWithTreatment,
  Treatment,
} from '../../types';
import {
  formatFullIndonesianDate,
  getCurrentDateString,
  isValidPhoneNumber,
} from '../../utils/dateUtils';
import { reservationService } from '../../services/reservationService';
import { AuroraLogo } from '../ui/AuroraLogo';

interface ReservationFormModalProps {
  isOpen: boolean;
  initialData?: ReservationWithTreatment | null;
  defaultDate?: string;
  activeTreatments: Treatment[];
  onClose: () => void;
  onSubmit: (
    data: Omit<Reservation, 'id' | 'reservation_code' | 'created_at' | 'updated_at'>
  ) => Promise<void> | void;
}

interface FormErrors {
  mom_name?: string;
  child_name?: string;
  child_age?: string;
  whatsapp?: string;
  guest_category?: string;
  reservation_date?: string;
  reservation_time?: string;
  treatment_name?: string;
  treatment_id?: string;
  status?: string;
  general?: string;
}

export const ReservationFormModal: React.FC<ReservationFormModalProps> = ({
  isOpen,
  initialData,
  defaultDate,
  activeTreatments,
  onClose,
  onSubmit,
}) => {
  const isEditing = !!initialData;

  const [momName, setMomName] = useState('');
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [guestCategory, setGuestCategory] = useState<GuestCategory>('Trial');
  const [reservationDate, setReservationDate] = useState('');
  const [reservationTime, setReservationTime] = useState('10:00');
  const [treatmentId, setTreatmentId] = useState('');
  const [treatmentName, setTreatmentName] = useState('');
  const [status, setStatus] = useState<ReservationStatus>('Pending');

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset or populate fields whenever modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setMomName(initialData.mom_name);
        setChildName(initialData.child_name);
        setChildAge(initialData.child_age);
        setWhatsapp(initialData.whatsapp);
        setGuestCategory(initialData.guest_category);
        setReservationDate(initialData.reservation_date);
        setReservationTime(initialData.reservation_time);
        setTreatmentId(initialData.treatment_id);
        setTreatmentName(initialData.treatment_name || '');
        setStatus(initialData.status);
      } else {
        setMomName('');
        setChildName('');
        setChildAge('');
        setWhatsapp('');
        setGuestCategory('Trial');
        setReservationDate(defaultDate || getCurrentDateString());
        setReservationTime('14:00');
        setTreatmentId('');
        setTreatmentName('');
        setStatus('Pending');
      }
      setErrors({});
    }
  }, [isOpen, initialData, defaultDate, activeTreatments]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: FormErrors = {};

    if (!momName.trim()) {
      errs.mom_name = 'Nama Moms wajib diisi.';
    }

    if (!childName.trim()) {
      errs.child_name = 'Nama Anak wajib diisi.';
    }

    if (!childAge.trim()) {
      errs.child_age = 'Usia Anak wajib diisi.';
    }

    if (!whatsapp.trim()) {
      errs.whatsapp = 'Nomor WhatsApp wajib diisi.';
    } else if (!isValidPhoneNumber(whatsapp)) {
      errs.whatsapp = 'Format nomor WhatsApp tidak valid. (Contoh: +62812-9744-3286)';
    }

    if (!guestCategory) {
      errs.guest_category = 'Kategori Tamu wajib dipilih.';
    }

    if (!reservationDate) {
      errs.reservation_date = 'Hari & Tanggal wajib ditentukan.';
    }

    if (!reservationTime) {
      errs.reservation_time = 'Jam Kedatangan wajib dipilih.';
    }

    if (!treatmentName.trim()) {
      errs.treatment_name = 'Pilihan Treatment wajib diisi.';
    }

    if (!status) {
      errs.status = 'Status wajib dipilih.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    try {
      const trimmedTreatment = treatmentName.trim();
      let targetTreatmentId = treatmentId;

      const existingMatch = activeTreatments.find(
        (t) => t.name.trim().toLowerCase() === trimmedTreatment.toLowerCase()
      );

      if (existingMatch) {
        targetTreatmentId = existingMatch.id;
      } else {
        const trt = await reservationService.getOrCreateTreatmentByName(trimmedTreatment);
        targetTreatmentId = trt.id;
      }

      await onSubmit({
        mom_name: momName.trim(),
        child_name: childName.trim(),
        child_age: childAge.trim(),
        whatsapp: whatsapp.trim(),
        guest_category: guestCategory,
        reservation_date: reservationDate,
        reservation_time: reservationTime,
        treatment_id: targetTreatmentId,
        status: status,
      });
    } catch {
      // Keep form intact! Do not reset fields.
      setErrors({
        general: 'Unable to connect to the database. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-2xs overflow-y-auto">
      <div
        className="bg-white rounded-2xl border border-[#E4EBF0] shadow-xl w-full max-w-xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reservation-form-title"
      >
        {/* Header with Aurora Logo */}
        <div className="px-6 py-5 border-b border-[#E4EBF0] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <AuroraLogo size="sm" />
            <div>
              <h3
                id="reservation-form-title"
                className="text-base font-bold text-[#223749] tracking-tight"
              >
                {isEditing ? 'Edit Reservation' : 'New Reservation'}
              </h3>
              <p className="text-xs text-[#647b8e]">
                {isEditing
                  ? `Mengubah data ${initialData?.reservation_code}`
                  : 'Lengkapi formulir reservasi perawatan spa'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#f4fafc] border border-transparent hover:border-[#E4EBF0] flex items-center justify-center text-[#647b8e] hover:text-[#223749] transition-colors"
            aria-label="Tutup formulir"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[72vh] overflow-y-auto">
            {errors.general && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.general}</span>
              </div>
            )}

            {/* 1. Nama Moms */}
            <div>
              <label className="block text-xs font-semibold text-[#223749] mb-1">
                Nama Moms <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={momName}
                onChange={(e) => setMomName(e.target.value)}
                placeholder="Contoh: Kachi"
                className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-sm text-[#223749] placeholder:text-[#9AA7B4] focus:outline-hidden focus:border-[#4eafde] focus:ring-2 focus:ring-[#4eafde]/20 transition-all ${
                  errors.mom_name ? 'border-red-400' : 'border-[#E4EBF0]'
                }`}
              />
              {errors.mom_name && (
                <p className="text-red-500 text-xs mt-1">{errors.mom_name}</p>
              )}
            </div>

            {/* 2. Nama Anak & 3. Usia Anak (Row) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#223749] mb-1">
                  Nama Anak <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="Contoh: Kiran dan Kinar"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-sm text-[#223749] placeholder:text-[#9AA7B4] focus:outline-hidden focus:border-[#4eafde] focus:ring-2 focus:ring-[#4eafde]/20 transition-all ${
                    errors.child_name ? 'border-red-400' : 'border-[#E4EBF0]'
                  }`}
                />
                {errors.child_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.child_name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#223749] mb-1">
                  Usia Anak <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={childAge}
                  onChange={(e) => setChildAge(e.target.value)}
                  placeholder="Contoh: 4+ months"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-sm text-[#223749] placeholder:text-[#9AA7B4] focus:outline-hidden focus:border-[#4eafde] focus:ring-2 focus:ring-[#4eafde]/20 transition-all ${
                    errors.child_age ? 'border-red-400' : 'border-[#E4EBF0]'
                  }`}
                />
                {errors.child_age && (
                  <p className="text-red-500 text-xs mt-1">{errors.child_age}</p>
                )}
              </div>
            </div>

            {/* 4. No. WhatsApp & 5. Kategori Tamu (Row) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#223749] mb-1">
                  No. WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Contoh: +62812-9744-3286"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-sm text-[#223749] placeholder:text-[#9AA7B4] focus:outline-hidden focus:border-[#4eafde] focus:ring-2 focus:ring-[#4eafde]/20 transition-all ${
                    errors.whatsapp ? 'border-red-400' : 'border-[#E4EBF0]'
                  }`}
                />
                {errors.whatsapp && (
                  <p className="text-red-500 text-xs mt-1">{errors.whatsapp}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#223749] mb-1">
                  Kategori Tamu <span className="text-red-500">*</span>
                </label>
                <select
                  value={guestCategory}
                  onChange={(e) => setGuestCategory(e.target.value as GuestCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4EBF0] bg-white text-sm text-[#223749] focus:outline-hidden focus:border-[#4eafde] focus:ring-2 focus:ring-[#4eafde]/20 transition-all"
                >
                  <option value="Trial">Trial</option>
                  <option value="Pelanggan">Pelanggan</option>
                  <option value="Influencer">Influencer</option>
                </select>
                {errors.guest_category && (
                  <p className="text-red-500 text-xs mt-1">{errors.guest_category}</p>
                )}
              </div>
            </div>

            {/* 6. Hari & Tanggal & 7. Jam Kedatangan (Row) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#223749] mb-1">
                  Hari &amp; Tanggal <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={reservationDate}
                    onChange={(e) => setReservationDate(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-sm text-[#223749] focus:outline-hidden focus:border-[#4eafde] focus:ring-2 focus:ring-[#4eafde]/20 transition-all ${
                      errors.reservation_date ? 'border-red-400' : 'border-[#E4EBF0]'
                    }`}
                  />
                </div>
                {reservationDate && (
                  <p className="text-[11px] text-[#647b8e] mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#4eafde]" />
                    <span>{formatFullIndonesianDate(reservationDate)}</span>
                  </p>
                )}
                {errors.reservation_date && (
                  <p className="text-red-500 text-xs mt-1">{errors.reservation_date}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#223749] mb-1">
                  Jam Kedatangan (24-Jam) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={reservationTime}
                    onChange={(e) => setReservationTime(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-sm text-[#223749] focus:outline-hidden focus:border-[#4eafde] focus:ring-2 focus:ring-[#4eafde]/20 transition-all ${
                      errors.reservation_time ? 'border-red-400' : 'border-[#E4EBF0]'
                    }`}
                  />
                </div>
                <p className="text-[11px] text-[#647b8e] mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#4eafde]" />
                  <span>Waktu kedatangan di outlet Aurora Spa</span>
                </p>
                {errors.reservation_time && (
                  <p className="text-red-500 text-xs mt-1">{errors.reservation_time}</p>
                )}
              </div>
            </div>

            {/* 8. Pilihan Treatment (Input teks diketik langsung) */}
            <div>
              <label className="block text-xs font-semibold text-[#223749] mb-1">
                Pilihan Treatment <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={treatmentName}
                  onChange={(e) => {
                    setTreatmentName(e.target.value);
                    if (errors.treatment_name) {
                      setErrors((prev) => ({ ...prev, treatment_name: undefined }));
                    }
                  }}
                  placeholder="Ketik nama treatment (contoh: Baby Swim, Kids Massage, dll.)"
                  list="treatment-options-list"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-sm text-[#223749] placeholder:text-[#9AA7B4] focus:outline-hidden focus:border-[#4eafde] focus:ring-2 focus:ring-[#4eafde]/20 transition-all ${
                    errors.treatment_name ? 'border-red-400' : 'border-[#E4EBF0]'
                  }`}
                />
                <datalist id="treatment-options-list">
                  {activeTreatments.map((t) => (
                    <option key={t.id} value={t.name} />
                  ))}
                </datalist>
              </div>
              <p className="text-[11px] text-[#647b8e] mt-1">
                Ketik nama treatment secara langsung atau klik salah satu saran cepat berikut.
              </p>
              {errors.treatment_name && (
                <p className="text-red-500 text-xs mt-1">{errors.treatment_name}</p>
              )}

              {/* Saran Cepat Treatment */}
              {activeTreatments.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-[#8699a8] mr-0.5">Saran cepat:</span>
                  {activeTreatments.map((t) => {
                    const isSelected =
                      treatmentName.trim().toLowerCase() === t.name.trim().toLowerCase();
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setTreatmentName(t.name);
                          setTreatmentId(t.id);
                          if (errors.treatment_name) {
                            setErrors((prev) => ({ ...prev, treatment_name: undefined }));
                          }
                        }}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-[#4eafde] text-white border-[#4eafde] font-medium shadow-2xs'
                            : 'bg-[#f4fafc] hover:bg-[#e8f5fb] text-[#16567d] border-[#4eafde]/30 hover:border-[#4eafde]'
                        }`}
                      >
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 9. Status */}
            <div>
              <label className="block text-xs font-semibold text-[#223749] mb-1">
                Status Reservasi <span className="text-red-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ReservationStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4EBF0] bg-white text-sm text-[#223749] focus:outline-hidden focus:border-[#4eafde] focus:ring-2 focus:ring-[#4eafde]/20 transition-all"
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Checked-in">Checked-in</option>
                <option value="In Treatment">In Treatment</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Rescheduled">Rescheduled</option>
                <option value="No Show">No Show</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-[#E4EBF0] bg-[#FAFDFE] flex items-center justify-end gap-3">
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
                  ? 'bg-[#4eafde]/60 text-white cursor-not-allowed'
                  : 'bg-[#4eafde] hover:bg-[#3ea0cf] text-white'
              }`}
            >
              {isSubmitting
                ? isEditing
                  ? 'Updating reservation...'
                  : 'Saving reservation...'
                : isEditing
                ? 'Simpan Perubahan'
                : 'Buat Reservasi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
