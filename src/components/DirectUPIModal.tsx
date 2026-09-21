import React from 'react';
import { X, QrCode, MessageCircle } from 'lucide-react';
import { DirectUPIQRCodeCard } from './DirectUPIQRCodeCard';

interface DirectUPIModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount?: number;
  orderId?: string;
  courseId?: string;
  courseTitle?: string;
  onPaymentConfirmed?: (utrNumber: string) => void;
  onOpenPortal?: () => void;
  onOpenVerificationModal?: () => void;
}

export const DirectUPIModal: React.FC<DirectUPIModalProps> = ({
  isOpen,
  onClose,
  amount,
  orderId,
  courseId,
  courseTitle,
  onPaymentConfirmed,
  onOpenPortal,
  onOpenVerificationModal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-[#0e141f] border border-[#1f293b] shadow-2xl text-white">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 px-6 py-4 bg-[#0e141f]/95 backdrop-blur-md border-b border-[#1f293b] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white leading-tight">Direct UPI QR Enrollment</h2>
              <span className="text-[11px] text-neutral-400">Scan & Pay via GPay, PhonePe, Paytm, or BHIM</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close UPI Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          <DirectUPIQRCodeCard
            amount={amount}
            orderId={orderId}
            courseId={courseId}
            courseTitle={courseTitle}
            onOpenVerificationModal={() => {
              onClose();
              if (onOpenVerificationModal) onOpenVerificationModal();
            }}
            showConfirmationInput={true}
          />

          {/* Assistance block */}
          <div className="p-3.5 rounded-2xl bg-[#141b29] border border-[#222d42] flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-neutral-200 block">Need urgent tutor assistance?</span>
              <span className="text-[11px] text-neutral-400">Official WhatsApp Helpline: +91 82816 44058</span>
            </div>
            <a
              href="https://wa.me/918281644058?text=Hi%20NextClass%20Support,%20I%20have%20enrolled%20via%20UPI%20for%20Sainik%20School%20Entrance%20Exam"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
