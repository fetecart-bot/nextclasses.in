import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Copy,
  Check,
  Download,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  Send,
  Building,
} from 'lucide-react';
import { COURSES_DATA } from '../data';

interface DirectUPIQRCodeCardProps {
  amount?: number;
  orderId?: string;
  courseId?: string;
  courseTitle?: string;
  onOpenVerificationModal?: () => void;
  showConfirmationInput?: boolean;
}

export const DirectUPIQRCodeCard: React.FC<DirectUPIQRCodeCardProps> = ({
  amount,
  orderId,
  courseId: propCourseId = 'course-aissee-sainik',
  courseTitle: propCourseTitle,
  onOpenVerificationModal,
  showConfirmationInput = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [dynamicQrUrl, setDynamicQrUrl] = useState<string | null>(null);

  const currentCourse = COURSES_DATA.find((c) => c.id === propCourseId) || COURSES_DATA[2];
  const payableAmount = amount !== undefined ? amount : currentCourse.price;
  const upiId = '8281644058@hdfc';
  const payeeName = 'Nextclasses Academy';
  const effectiveOrderId = orderId || `NC-${Date.now().toString().slice(-6)}`;

  // Construct NPCI standard UPI deep link for Google Pay, PhonePe, Paytm, BHIM
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${payableAmount}&cu=INR&tn=${encodeURIComponent(`Nextclasses ${effectiveOrderId}`)}`;

  // Generate crisp QR code client-side
  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(upiDeepLink, {
      width: 480,
      margin: 1.5,
      color: {
        dark: themeMode === 'dark' ? '#ffffff' : '#000000',
        light: themeMode === 'dark' ? '#0b101b' : '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => {
        if (isMounted) setDynamicQrUrl(url);
      })
      .catch(() => {
        if (isMounted) setDynamicQrUrl(null);
      });

    return () => {
      isMounted = false;
    };
  }, [upiDeepLink, themeMode]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQr = () => {
    const link = document.createElement('a');
    link.href = dynamicQrUrl || (themeMode === 'dark' ? '/biju-pb-upi-qr.svg' : '/biju-pb-upi-qr-light.svg');
    link.download = `nextclasses-hdfc-upi-qr-rs${payableAmount}.png`;
    link.click();
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-3xl bg-[#101726] border border-orange-500/40 shadow-2xl p-4 sm:p-5 text-white text-center space-y-3.5 font-sans">
      
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1f293b]">
        <div className="flex items-center gap-2 text-left">
          <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
            <QrCode className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold block">
              Official HDFC Bank UPI
            </span>
            <span className="text-xs font-semibold text-neutral-200">
              Direct Bank Settlement (0% Extra Fee)
            </span>
          </div>
        </div>

        {/* Dark / Light QR Toggle */}
        <div className="flex items-center bg-[#192233] p-0.5 rounded-lg border border-[#243147] text-[11px]">
          <button
            type="button"
            onClick={() => setThemeMode('dark')}
            className={`px-2 py-0.5 rounded cursor-pointer ${themeMode === 'dark' ? 'bg-orange-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'}`}
          >
            Dark
          </button>
          <button
            type="button"
            onClick={() => setThemeMode('light')}
            className={`px-2 py-0.5 rounded cursor-pointer ${themeMode === 'light' ? 'bg-white text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'}`}
          >
            Light
          </button>
        </div>
      </div>

      {/* Title & Amount Display */}
      <div>
        <h3 className="text-lg sm:text-xl font-extrabold tracking-wide text-white">
          Scan QR Code to Pay
        </h3>
        <div className="mt-1.5 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 font-extrabold text-sm">
          <span>Amount:</span>
          <span className="text-base text-white">₹{payableAmount.toLocaleString('en-IN')}</span>
          <span className="text-[11px] text-neutral-300 font-medium truncate max-w-[180px]">
            • {propCourseTitle || currentCourse.title}
          </span>
        </div>
      </div>

      {/* QR Code Container */}
      <div className="relative mx-auto w-56 h-56 sm:w-60 sm:h-60 rounded-2xl bg-[#0b101b] border-2 border-orange-500/40 shadow-inner flex items-center justify-center overflow-hidden p-2 group">
        {dynamicQrUrl ? (
          <img
            src={dynamicQrUrl}
            alt="UPI QR Code - Nextclasses.in"
            className="w-full h-full object-contain rounded-xl"
            referrerPolicy="no-referrer"
          />
        ) : (
          <img
            src={themeMode === 'dark' ? '/biju-pb-upi-qr.svg' : '/biju-pb-upi-qr-light.svg'}
            alt="Nextclasses.in Official UPI QR"
            className="w-full h-full object-contain rounded-xl"
            referrerPolicy="no-referrer"
          />
        )}

        {/* Hover overlay to download QR */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-xl">
          <button
            type="button"
            onClick={handleDownloadQr}
            className="px-3 py-1.5 rounded-lg bg-white/90 text-neutral-900 font-bold text-xs flex items-center gap-1.5 hover:bg-white shadow cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save QR</span>
          </button>
        </div>
      </div>

      {/* UPI ID Info Box */}
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#161f30] border border-[#223049] text-xs">
        <div className="text-left font-mono truncate mr-2">
          <span className="text-[10px] text-neutral-400 block">UPI ID / VPA</span>
          <span className="font-bold text-orange-400 text-sm">{upiId}</span>
          <span className="text-[10px] text-neutral-500 block truncate">Nextclasses.in Official (HDFC Bank)</span>
        </div>
        <button
          type="button"
          onClick={handleCopyUpi}
          className="shrink-0 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-orange-500/20 cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Direct Mobile UPI Intent Apps */}
      <div className="space-y-1.5 pt-0.5">
        <span className="text-[11px] text-neutral-400 flex items-center justify-center gap-1.5">
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Mobile user? Tap to pay directly in your app:</span>
        </span>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { name: 'GPay', color: 'hover:border-blue-500/50 hover:bg-blue-950/40 text-blue-300' },
            { name: 'PhonePe', color: 'hover:border-purple-500/50 hover:bg-purple-950/40 text-purple-300' },
            { name: 'Paytm', color: 'hover:border-sky-500/50 hover:bg-sky-950/40 text-sky-300' },
            { name: 'BHIM', color: 'hover:border-emerald-500/50 hover:bg-emerald-950/40 text-emerald-300' },
          ].map((app) => (
            <a
              key={app.name}
              href={upiDeepLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`py-1.5 px-1.5 rounded-xl bg-[#18202e] border border-[#273347] font-bold text-[11px] text-center transition-all flex items-center justify-center gap-1 cursor-pointer ${app.color}`}
            >
              <span>{app.name}</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
          ))}
        </div>
      </div>

      {/* STEP-BY-STEP PAYMENT VERIFICATION INSTRUCTIONS */}
      {showConfirmationInput && (
        <div className="pt-3 border-t border-[#1f293b] space-y-3 text-left">
          <div className="p-3 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-2 text-xs">
            <span className="font-bold text-white flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-orange-400" />
              <span>How Direct UPI Verification Works:</span>
            </span>
            <div className="space-y-1.5 text-[11px] text-neutral-300">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">1</span>
                <span>Scan the QR code above or pay to <strong className="font-mono text-orange-400">8281644058@hdfc</strong> using any UPI app.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">2</span>
                <span>Note down the <strong>12-digit UPI Reference / UTR Number</strong> from your payment receipt.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">3</span>
                <span>Click the button below to submit your details for <strong>Admin Bank Verification</strong>.</span>
              </div>
            </div>
          </div>

          {onOpenVerificationModal && (
            <button
              type="button"
              onClick={onOpenVerificationModal}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>I Have Paid — Submit Verification Details</span>
            </button>
          )}

          <div className="p-2.5 rounded-xl bg-orange-500/5 border border-orange-500/20 text-[10px] text-neutral-400 leading-relaxed">
            <span className="text-orange-400 font-bold block mb-0.5">🛡️ Anti-Fraud Protected:</span>
            To safeguard course materials and certificates, our administration reconciles bank credits before generating student login credentials. Credentials are dispatched to your WhatsApp & Email once verified.
          </div>
        </div>
      )}
    </div>
  );
};
