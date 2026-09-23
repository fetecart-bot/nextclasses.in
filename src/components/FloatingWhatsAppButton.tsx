import React, { useState } from 'react';
import { MessageCircle, X, Send, CheckCircle2, ChevronRight } from 'lucide-react';

interface FloatingWhatsAppButtonProps {
  phone?: string;
}

export const FloatingWhatsAppButton: React.FC<FloatingWhatsAppButtonProps> = ({
  phone = '8281644058',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const formattedPhone = '+91 82816 44058';

  const quickPrompts = [
    {
      title: 'Course Inquiries & Fees',
      desc: 'Get syllabus, pricing & regional batch timings',
      msg: 'Hi Nextclasses.in Team, I want to inquire about course details, fees, and upcoming batches.',
    },
    {
      title: 'Order Access & Weekly Drops',
      desc: 'Verify enrollment or receive study packs',
      msg: 'Hi Nextclasses.in Support, I need assistance with my order access and weekly study materials.',
    },
    {
      title: 'Languages & Public Speaking',
      desc: 'English, French, German & Stage Mastery',
      msg: 'Hi Nextclasses.in, I would like more information on the Languages & Public Speaking programs.',
    },
    {
      title: 'Direct Academic Counselor',
      desc: 'Talk to an academic mentor on WhatsApp',
      msg: 'Hi Nextclasses.in, I would like to speak directly with an academic mentor.',
    },
  ];

  const handleOpenWhatsApp = (customText?: string) => {
    const text = customText || 'Hi Nextclasses.in Team, I have a question regarding courses and study materials.';
    const url = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end print:hidden">
      {/* Pop-up Chat Card */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl shadow-black/80 overflow-hidden text-white animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-emerald-600 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-black text-sm">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-300 border-2 border-emerald-600" />
              </div>
              <div>
                <div className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  <span>Nextclasses.in WhatsApp</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                </div>
                <div className="text-[11px] text-emerald-100 font-mono font-medium">
                  {formattedPhone} • Typically replies instantly
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close WhatsApp card"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3 bg-[#0b141a] text-neutral-200">
            <div className="p-3 rounded-xl bg-[#111b21] border border-[#202c33] text-xs leading-relaxed space-y-1">
              <p className="text-[#e9edef] font-medium">
                👋 Welcome to <strong className="text-emerald-400">Nextclasses.in</strong>!
              </p>
              <p className="text-[#8696a0] text-[11px]">
                If automated WhatsApp notifications are delayed or you prefer direct human support, tap below to chat with our counselors right away.
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 px-1">
                Frequently Asked Inquiries
              </span>
              {quickPrompts.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => handleOpenWhatsApp(item.msg)}
                  className="w-full p-2.5 rounded-xl bg-[#111b21] hover:bg-[#202c33] border border-[#202c33] hover:border-emerald-500/40 text-left transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-neutral-400 truncate">
                      {item.desc}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-emerald-400 shrink-0 transition-colors" />
                </button>
              ))}
            </div>

            {/* Direct 1-tap button */}
            <button
              type="button"
              onClick={() => handleOpenWhatsApp()}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Start WhatsApp Chat ({formattedPhone})</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <div className="flex items-center gap-2">
        <button
          id="floating-whatsapp-btn"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-950/60 hover:shadow-emerald-600/30 transition-all duration-200 cursor-pointer border border-emerald-400/30"
          aria-label="Contact on WhatsApp"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
          </span>
          <MessageCircle className="w-5 h-5 text-white" />
          <span className="text-xs font-bold tracking-tight">
            WhatsApp Support
          </span>
        </button>
      </div>
    </div>
  );
};
