import { Calendar, Check, Clock, Copy, StickyNote, Trash2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { isNotesColumnMissing } from '../../services/reservationService';
import { ReservationWithTreatment } from '../../types';
import { formatShortDate } from '../../utils/dateUtils';
import { CategoryBadge } from '../ui/StatusBadge';

interface NotePopupModalProps {
  isOpen: boolean;
  reservation: ReservationWithTreatment | null;
  onClose: () => void;
  onSaveNote: (reservationId: string, noteText: string) => Promise<void>;
}

const NOTES_SQL_SNIPPET =
  "ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';";

export const NotePopupModal: React.FC<NotePopupModalProps> = ({
  isOpen,
  reservation,
  onClose,
  onSaveNote,
}) => {
  const [noteText, setNoteText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (isOpen && reservation) {
      setNoteText(reservation.notes || '');
      setErrorMsg('');
      setCopiedSql(false);
    }
  }, [isOpen, reservation]);

  if (!isOpen || !reservation) return null;

  const missingCloudCol = isNotesColumnMissing();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');
    try {
      await onSaveNote(reservation.id, noteText.trim());
      onClose();
    } catch {
      setErrorMsg('Gagal menyimpan catatan. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearNote = async () => {
    setIsSaving(true);
    setErrorMsg('');
    try {
      await onSaveNote(reservation.id, '');
      setNoteText('');
      onClose();
    } catch {
      setErrorMsg('Gagal menghapus catatan. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(NOTES_SQL_SNIPPET);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/35 backdrop-blur-2xs"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-2xl sm:rounded-2xl border border-[#E4EBF0] shadow-2xl w-full sm:max-w-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-popup-title"
      >
        {/* Mobile drag handle visual indicator */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#DCE6EE]" />
        </div>

        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E4EBF0] flex items-start justify-between gap-3 bg-[#FAFDFE]">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center shrink-0">
              <StickyNote className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  id="note-popup-title"
                  className="text-sm sm:text-base font-bold text-[#223749] truncate"
                >
                  Note · {reservation.mom_name}
                </h3>
                <CategoryBadge category={reservation.guest_category} />
              </div>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-[#647b8e] mt-1">
                <span>Anak: {reservation.child_name}</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <Calendar className="w-3 h-3 text-[#4eafde]" />
                  {formatShortDate(reservation.reservation_date)}
                </span>
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <Clock className="w-3 h-3 text-[#4eafde]" />
                  {reservation.reservation_time}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-white border border-transparent hover:border-[#E4EBF0] flex items-center justify-center text-[#647b8e] hover:text-[#223749] shrink-0 transition-colors"
            aria-label="Tutup pop-up note"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave}>
          <div className="p-5 space-y-3">
            <div className="text-xs text-[#647b8e]">
              Treatment: <span className="font-semibold text-[#223749]">{reservation.treatment_name}</span>
            </div>

            <div>
              <label
                htmlFor="popup-note-textarea"
                className="block text-xs font-semibold text-[#223749] mb-1.5"
              >
                Catatan Reservasi
              </label>
              <textarea
                id="popup-note-textarea"
                rows={4}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Tulis catatan khusus di sini (misal: alergi minyak tertentu, permintaan terapis, jam datang fleksibel, dll.)..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4EBF0] bg-white text-sm text-[#223749] placeholder:text-[#9AA7B4] focus:outline-hidden focus:border-[#4eafde] focus:ring-2 focus:ring-[#4eafde]/20 transition-all resize-none"
                autoFocus
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-red-600 font-medium">{errorMsg}</p>
            )}

            {missingCloudCol && (
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 space-y-2">
                <p className="leading-relaxed">
                  Kolom <code className="font-mono font-semibold">notes</code> belum ada di tabel Supabase Anda. Catatan tetap tersimpan di perangkat ini, namun jalankan SQL berikut di Supabase SQL Editor agar catatan sinkron ke semua HP/browser:
                </p>
                <div className="flex items-center justify-between gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-amber-200">
                  <code className="text-[10px] font-mono text-slate-700 truncate">
                    {NOTES_SQL_SNIPPET}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-[10px] transition-colors"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Disalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Salin SQL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions - Mobile friendly touch height (>=44px) */}
          <div className="px-5 py-4 border-t border-[#E4EBF0] bg-[#FAFDFE] flex items-center justify-between gap-2">
            {reservation.notes ? (
              <button
                type="button"
                onClick={handleClearNote}
                disabled={isSaving}
                className="min-h-[44px] px-3.5 py-2 rounded-xl border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-[#E4EBF0] text-xs font-semibold text-[#647b8e] hover:bg-white hover:text-[#223749] transition-colors"
              >
                Tutup
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-[#4eafde] hover:bg-[#3ea0cf] text-white text-xs font-bold transition-colors shadow-xs disabled:opacity-60"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Catatan'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
