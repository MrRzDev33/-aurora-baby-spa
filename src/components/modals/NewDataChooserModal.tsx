import { CalendarPlus, Footprints, Sparkles, X } from 'lucide-react';
import React from 'react';
import { AuroraLogo } from '../ui/AuroraLogo';

interface NewDataChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChooseReservation: () => void;
  onChooseJembol: () => void;
  onChooseVisit: () => void;
}

export const NewDataChooserModal: React.FC<NewDataChooserModalProps> = ({
  isOpen,
  onClose,
  onChooseReservation,
  onChooseJembol,
  onChooseVisit,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/35 backdrop-blur-2xs"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-3xl sm:rounded-2xl border border-[#E4EBF0] shadow-2xl w-full sm:max-w-md overflow-hidden animate-popup-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-data-chooser-title"
      >
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-[#E4EBF0] flex items-center justify-between bg-[#FAFDFE]">
          <div className="flex items-center gap-2.5">
            <AuroraLogo size="sm" />
            <div>
              <h3
                id="new-data-chooser-title"
                className="text-base font-bold text-[#223749] tracking-tight"
              >
                New Data
              </h3>
              <p className="text-xs text-[#647b8e]">
                Pilih jenis data yang ingin ditambahkan
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white border border-transparent hover:border-[#E4EBF0] flex items-center justify-center text-[#647b8e] hover:text-[#223749] transition-colors"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Choices */}
        <div className="p-4 sm:p-5 space-y-3 pb-7 sm:pb-5">
          {/* 1. Data Reservasi */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onChooseReservation();
            }}
            className="w-full p-4 rounded-2xl border-2 border-[#BAE6FD] bg-[#F0F9FF]/70 hover:bg-[#E0F2FE] hover:border-[#0EA5E9] transition-all text-left flex items-center gap-3.5 group active:scale-[0.99]"
          >
            <div className="w-11 h-11 rounded-xl bg-[#0EA5E9] text-white flex items-center justify-center shrink-0 shadow-xs">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-[#0C4A6E] group-hover:text-[#0369A1]">
                Data Reservasi
              </div>
              <p className="text-xs text-[#4E6273] mt-0.5">
                Jadwal treatment Moms &amp; Anak (Trial, Pelanggan, Influencer)
              </p>
            </div>
            <span className="text-xs font-bold text-[#0EA5E9] shrink-0">&rarr;</span>
          </button>

          {/* 2. Data Jembol */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onChooseJembol();
            }}
            className="w-full p-4 rounded-2xl border-2 border-[#FDE68A] bg-[#FFFBEB]/80 hover:bg-[#FEF3C7] hover:border-[#D97706] transition-all text-left flex items-center gap-3.5 group active:scale-[0.99]"
          >
            <div className="w-11 h-11 rounded-xl bg-[#D97706] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-[#78350F] group-hover:text-[#92400E]">
                Data Jembol
              </div>
              <p className="text-xs text-[#6B5335] mt-0.5">
                Visit Aja, Trial Treatment, atau Ambil Voucher (tanpa visit)
              </p>
            </div>
            <span className="text-xs font-bold text-[#D97706] shrink-0">&rarr;</span>
          </button>

          {/* 3. Data Visit */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onChooseVisit();
            }}
            className="w-full p-4 rounded-2xl border-2 border-[#99F6E4] bg-[#F0FDFA]/80 hover:bg-[#CCFBF1] hover:border-[#0D9488] transition-all text-left flex items-center gap-3.5 group active:scale-[0.99]"
          >
            <div className="w-11 h-11 rounded-xl bg-[#0D9488] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Footprints className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-[#134E4A] group-hover:text-[#0F766E]">
                Data Visit
              </div>
              <p className="text-xs text-[#3B6B66] mt-0.5">
                Pencatatan data kunjungan tamu &amp; kesan pesan
              </p>
            </div>
            <span className="text-xs font-bold text-[#0D9488] shrink-0">&rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
};
