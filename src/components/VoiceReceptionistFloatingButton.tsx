import React from 'react';
import { Phone, Sparkles, Volume2 } from 'lucide-react';

interface VoiceReceptionistFloatingButtonProps {
  onOpenVoiceModal: () => void;
  isOpen?: boolean;
}

export const VoiceReceptionistFloatingButton: React.FC<VoiceReceptionistFloatingButtonProps> = ({
  onOpenVoiceModal,
  isOpen,
}) => {
  if (isOpen) return null;

  return (
    <div
      id="voice-receptionist-floating-wrapper"
      className="fixed bottom-24 right-4 sm:right-6 z-40 flex items-center gap-2 group"
    >
      {/* Pill Badge */}
      <button
        id="voice-receptionist-pill-badge"
        onClick={onOpenVoiceModal}
        className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/95 hover:bg-slate-800 text-slate-200 hover:text-white border border-emerald-500/40 shadow-xl shadow-slate-950/60 transition-all transform hover:-translate-x-1 backdrop-blur-md"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-semibold tracking-wide">
          Talk to <span className="text-emerald-400 font-bold">Priya</span> • Voice AI
        </span>
        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono tracking-wider">
          മലയാളം • Multilingual
        </span>
      </button>

      {/* Circular Floating Call Button */}
      <div className="relative">
        <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 opacity-75 blur-sm animate-pulse group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
        <button
          id="voice-receptionist-floating-btn"
          onClick={onOpenVoiceModal}
          className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-2xl shadow-emerald-950/80 flex items-center justify-center transition-all transform active:scale-95 group-hover:scale-105 border-2 border-emerald-300/40"
          aria-label="Open AI Voice Receptionist with Indian Accent"
          title="Talk to Priya • AI Voice Receptionist (Indian Accent)"
        >
          <Phone className="w-6 h-6 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-teal-400 border-2 border-slate-900 items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-slate-900" />
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};
