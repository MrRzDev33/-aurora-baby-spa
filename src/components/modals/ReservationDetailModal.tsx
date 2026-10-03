import {
  Calendar,
  Clock,
  Edit2,
  ExternalLink,
  MessageSquare,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react';
import React from 'react';
import { ReservationWithTreatment } from '../../types';
import {
  formatFullIndonesianDate,
  getWhatsAppLink,
} from '../../utils/dateUtils';
import { AuroraLogo } from '../ui/AuroraLogo';
import { CategoryBadge, StatusBadge } from '../ui/StatusBadge';

interface ReservationDetailModalProps {
  reservation: ReservationWithTreatment | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (reservation: ReservationWithTreatment) => void;
  onDelete: (reservation: ReservationWithTreatment) => void;
}

export const ReservationDetailModal: React.FC<ReservationDetailModalProps> = ({
  reservation,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!isOpen || !reservation) return null;

  const waLink = getWhatsAppLink(reservation.whatsapp);
  const formattedDate = formatFullIndonesianDate(reservation.reservation_date);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-2xs">
      <div
        className="bg-white rounded-2xl border border-[#E4EBF0] shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reservation-detail-title"
      >
        {/* Modal Header with Aurora Logo */}
        <div className="px-6 py-5 border-b border-[#E4EBF0] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <AuroraLogo size="sm" />
            <div>
              <h3
                id="reservation-detail-title"
                className="text-base font-bold text-[#223749] tracking-tight"
              >
                Reservation Detail
              </h3>
              <span className="text-xs font-mono text-[#647b8e] tabular-nums">
                {reservation.reservation_code}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#f4fafc] border border-transparent hover:border-[#E4EBF0] flex items-center justify-center text-[#647b8e] hover:text-[#223749] transition-colors"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Information Grid */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Top Status & Category Banner */}
          <div className="p-4 rounded-xl bg-[#f4fafc] border border-[#d8eaf5] flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#647b8e]">
                Kategori Tamu
              </span>
              <div className="mt-1">
                <CategoryBadge category={reservation.guest_category} />
              </div>
            </div>

            <div className="text-right">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#647b8e]">
                Status
              </span>
              <div className="mt-1">
                <StatusBadge status={reservation.status} />
              </div>
            </div>
          </div>

          {/* Details List */}
          <div className="space-y-4 text-sm divide-y divide-[#E4EBF0]/70">
            {/* Nama Moms */}
            <div className="pt-2 flex items-start justify-between gap-4">
              <div className="flex items-center gap-2 text-[#647b8e] shrink-0">
                <User className="w-4 h-4 text-[#4eafde]" />
                <span className="font-medium text-xs">Nama Moms</span>
              </div>
              <span className="font-bold text-[#223749] text-right">
                {reservation.mom_name}
              </span>
            </div>

            {/* Nama Anak */}
            <div className="pt-3 flex items-start justify-between gap-4">
              <div className="flex items-center gap-2 text-[#647b8e] shrink-0">
                <Users className="w-4 h-4 text-[#4eafde]" />
                <span className="font-medium text-xs">Nama Anak</span>
              </div>
              <span className="font-semibold text-[#223749] text-right">
                {reservation.child_name}
              </span>
            </div>

            {/* Usia Anak */}
            <div className="pt-3 flex items-start justify-between gap-4">
              <span className="font-medium text-xs text-[#647b8e]">Usia Anak</span>
              <span className="font-semibold text-[#223749] text-right">
                {reservation.child_age}
              </span>
            </div>

            {/* No WhatsApp */}
            <div className="pt-3 flex items-start justify-between gap-4">
              <div className="flex items-center gap-2 text-[#647b8e] shrink-0">
                <MessageSquare className="w-4 h-4 text-[#25D366]" />
                <span className="font-medium text-xs">No. WhatsApp</span>
              </div>
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-[#16567d] hover:text-[#4eafde] hover:underline flex items-center gap-1.5 tabular-nums text-right"
                title="Buka obrolan WhatsApp"
              >
                <span>{reservation.whatsapp}</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#4eafde]" />
              </a>
            </div>

            {/* Hari & Tanggal */}
            <div className="pt-3 flex items-start justify-between gap-4">
              <div className="flex items-center gap-2 text-[#647b8e] shrink-0">
                <Calendar className="w-4 h-4 text-[#4eafde]" />
                <span className="font-medium text-xs">Hari &amp; Tanggal</span>
              </div>
              <span className="font-semibold text-[#223749] text-right">
                {formattedDate}
              </span>
            </div>

            {/* Jam Kedatangan */}
            <div className="pt-3 flex items-start justify-between gap-4">
              <div className="flex items-center gap-2 text-[#647b8e] shrink-0">
                <Clock className="w-4 h-4 text-[#4eafde]" />
                <span className="font-medium text-xs">Jam Kedatangan</span>
              </div>
              <span className="font-bold text-[#16567d] bg-[#e8f5fb] px-2.5 py-0.5 rounded-md tabular-nums border border-[#4eafde]/40">
                {reservation.reservation_time} WIB
              </span>
            </div>

            {/* Pilihan Treatment */}
            <div className="pt-3 flex items-start justify-between gap-4">
              <span className="font-medium text-xs text-[#647b8e] shrink-0">
                Pilihan Treatment
              </span>
              <span className="font-bold text-[#223749] text-right">
                {reservation.treatment_name}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-5 border-t border-[#E4EBF0] bg-[#FAFDFE] flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => onDelete(reservation)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-1.5 border border-red-200"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E4EBF0] text-xs font-semibold text-[#647b8e] hover:bg-white hover:text-[#223749] transition-colors"
            >
              Close
            </button>

            <button
              onClick={() => onEdit(reservation)}
              className="px-4 py-2 rounded-xl bg-[#4eafde] hover:bg-[#3ea0cf] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
