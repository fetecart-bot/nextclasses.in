import { useState, useEffect } from 'react';
import { Sparkles, Tag, ArrowRight, X, Clock } from 'lucide-react';

interface AnnouncementBannerProps {
  onPromoApply?: (code: string) => void;
}

export default function AnnouncementBanner({ onPromoApply }: AnnouncementBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isVisible) return null;

  const handleCopyCode = () => {
    navigator.clipboard?.writeText('AIFUTURE');
    setCopied(true);
    if (onPromoApply) onPromoApply('AIFUTURE');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div
      id="top-announcement-banner"
      className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white text-xs font-medium px-4 py-2.5 relative z-50 border-b border-orange-500/30 shadow-inner"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        {/* Left message */}
        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
          <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider backdrop-blur-xs">
            <Sparkles className="w-3 h-3 text-amber-200" />
            Launch Special
          </span>
          <span className="font-semibold text-white">
            Flat 40% OFF all AI Courses & Digital Products with code
          </span>
          <button
            type="button"
            onClick={handleCopyCode}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white text-neutral-900 font-mono font-bold hover:bg-amber-100 transition-colors cursor-pointer"
            title="Click to copy coupon code"
          >
            <Tag className="w-3 h-3 text-orange-600" />
            AIFUTURE
            <span className="text-[10px] text-orange-600 ml-0.5">
              {copied ? '(Copied!)' : '(Click to copy)'}
            </span>
          </button>
        </div>

        {/* Right timer and close */}
        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5 font-mono text-amber-100 bg-black/20 px-2 py-0.5 rounded">
            <Clock className="w-3 h-3" />
            <span>Offer ends in: </span>
            <span className="font-bold text-white">
              {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/20 rounded transition-colors text-white/80 hover:text-white"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
