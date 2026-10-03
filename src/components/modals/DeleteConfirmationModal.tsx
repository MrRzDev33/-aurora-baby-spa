import { AlertTriangle, X } from 'lucide-react';
import React from 'react';
import { ReservationWithTreatment } from '../../types';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  reservation: ReservationWithTreatment | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  reservation,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !reservation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-2xs">
      <div
        className="bg-white rounded-2xl border border-[#E4EBF0] shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        <div className="p-6">
          <div className="flex items-center justify-between pb-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-200">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <button
              onClick={onClose}
              className="text-[#71808F] hover:text-[#263746] p-1"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3
            id="delete-dialog-title"
            className="text-base font-bold text-[#263746] mt-2"
          >
            Delete this reservation?
          </h3>

          <p className="text-xs text-[#71808F] mt-2 leading-relaxed">
            Reservasi untuk <span className="font-semibold text-[#263746]">{reservation.mom_name}</span> ({reservation.child_name}) pada{' '}
            <span className="font-semibold text-[#263746]">{reservation.reservation_date}</span> ({reservation.reservation_time}) akan dihapus secara permanen dari sistem.
          </p>
        </div>

        <div className="p-4 border-t border-[#E4EBF0] bg-[#FAFDFE] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#E4EBF0] text-xs font-semibold text-[#71808F] hover:bg-white hover:text-[#263746] transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
