import {
  Calendar,
  Edit2,
  ExternalLink,
  Footprints,
  MapPin,
  MessageSquare,
  Sparkles,
  Trash2,
  User,
  X,
} from 'lucide-react';
import React from 'react';
import { JembolRecord, VisitRecord } from '../../types';
import { formatFullIndonesianDate, getWhatsAppLink } from '../../utils/dateUtils';
import { AuroraLogo } from '../ui/AuroraLogo';

interface JembolVisitDetailModalProps {
  isOpen: boolean;
  mode: 'jembol' | 'visit';
  jembolData?: JembolRecord | null;
  visitData?: VisitRecord | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const JembolVisitDetailModal: React.FC<JembolVisitDetailModalProps> = ({
  isOpen,
  mode,
  jembolData,
  visitData,
  onClose,
  onEdit,
  onDelete,
}) => {
  const item = mode === 'jembol' ? jembolData : visitData;
  if (!isOpen || !item) return null;

  const isJembol = mode === 'jembol';
  const jembolType = isJembol && jembolData ? jembolData.jembol_type : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-2xs">
      <div
        className="bg-white rounded-2xl border border-[#E4EBF0] shadow-xl w-full max-w-lg overflow-hidden animate-popup-in"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-[#E4EBF0] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <AuroraLogo size="sm" />
            <div>
              <h3 className="text-base font-bold text-[#223749] flex items-center gap-1.5">
                {isJembol ? (
                  <Sparkles className="w-4 h-4 text-[#D97706]" />
                ) : (
                  <Footprints className="w-4 h-4 text-[#0D9488]" />
                )}
                <span>{isJembol ? 'Detail Data Jembol' : 'Detail Data Visit'}</span>
              </h3>
              <p className="text-xs text-[#647b8e]">
                {item.tanggal ? formatFullIndonesianDate(item.tanggal) : 'Tanggal belum diisi'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#f4fafc] border border-transparent hover:border-[#E4EBF0] flex items-center justify-center text-[#647b8e] hover:text-[#223749]"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[72vh] overflow-y-auto text-sm">
          {isJembol && jembolType && (
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between ${
                jembolType === 'Trial Treatment'
                  ? 'bg-[#F0F9FF] border-[#BAE6FD]'
                  : 'bg-[#FFFBEB] border-[#FDE68A]'
              }`}
            >
              <span className="text-xs font-semibold text-[#4E6273]">Jenis Jembol</span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-md text-white ${
                  jembolType === 'Trial Treatment' ? 'bg-[#0EA5E9]' : 'bg-[#D97706]'
                }`}
              >
                {jembolType}
              </span>
            </div>
          )}

          <div className="divide-y divide-[#E4EBF0]/70 space-y-3">
            <div className="pt-1 flex items-start justify-between gap-4">
              <span className="text-xs font-medium text-[#647b8e] flex items-center gap-1.5 shrink-0">
                <User className="w-3.5 h-3.5 text-[#4eafde]" />
                Nama
              </span>
              <span className="font-bold text-[#223749] text-right">
                {item.nama || '-'}
              </span>
            </div>

            <div className="pt-3 flex items-start justify-between gap-4">
              <span className="text-xs font-medium text-[#647b8e] flex items-center gap-1.5 shrink-0">
                <Calendar className="w-3.5 h-3.5 text-[#4eafde]" />
                Tanggal
              </span>
              <span className="font-semibold text-[#223749] text-right">
                {item.tanggal ? formatFullIndonesianDate(item.tanggal) : '-'}
              </span>
            </div>

            <div className="pt-3 flex items-start justify-between gap-4">
              <span className="text-xs font-medium text-[#647b8e] flex items-center gap-1.5 shrink-0">
                <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                No. HP
              </span>
              {item.no_hp ? (
                <a
                  href={getWhatsAppLink(item.no_hp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#16567d] hover:underline flex items-center gap-1 tabular-nums text-right"
                >
                  <span>{item.no_hp}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#4eafde]" />
                </a>
              ) : (
                <span className="text-[#9AA7B4] text-right">-</span>
              )}
            </div>

            <div className="pt-3 flex items-start justify-between gap-4">
              <span className="text-xs font-medium text-[#647b8e] flex items-center gap-1.5 shrink-0">
                <MapPin className="w-3.5 h-3.5 text-[#4eafde]" />
                Alamat
              </span>
              <span className="text-xs sm:text-sm font-medium text-[#223749] text-right whitespace-pre-wrap">
                {item.alamat || '-'}
              </span>
            </div>

            <div className="pt-3 flex items-start justify-between gap-4">
              <span className="text-xs font-medium text-[#647b8e] shrink-0">Treatment</span>
              <span className="font-bold text-[#223749] text-right">
                {item.treatment || '-'}
              </span>
            </div>

            <div className="pt-3 flex items-start justify-between gap-4">
              <span className="text-xs font-medium text-[#647b8e] shrink-0">Tau Dari Mana</span>
              <span className="font-semibold text-[#16567d] text-right">
                {item.tau_dari_mana || '-'}
              </span>
            </div>

            <div className="pt-3 space-y-1.5">
              <span className="block text-xs font-medium text-[#647b8e]">Kesan &amp; Pesan</span>
              <div className="p-3 rounded-xl bg-[#FAFDFE] border border-[#E4EBF0] text-xs text-[#223749] leading-relaxed whitespace-pre-wrap">
                {item.kesan_pesan || <span className="text-[#9AA7B4] italic">Belum ada kesan &amp; pesan.</span>}
              </div>
            </div>

            <div className="pt-3 space-y-1.5">
              <span className="block text-xs font-medium text-[#647b8e]">Keterangan</span>
              <div className="p-3 rounded-xl bg-[#FAFDFE] border border-[#E4EBF0] text-xs text-[#223749] leading-relaxed whitespace-pre-wrap">
                {item.keterangan || <span className="text-[#9AA7B4] italic">Tidak ada keterangan tambahan.</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#E4EBF0] bg-[#FAFDFE] flex items-center justify-between gap-3">
          <button
            onClick={onDelete}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E4EBF0] text-xs font-semibold text-[#647b8e] hover:bg-white hover:text-[#223749]"
            >
              Close
            </button>
            <button
              onClick={onEdit}
              className="px-4 py-2 rounded-xl bg-[#4eafde] hover:bg-[#3ea0cf] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
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
