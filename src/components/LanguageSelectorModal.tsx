import { Languages, Check, X, Sparkles, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LanguageSelectorModal({ isOpen, onClose }: LanguageSelectorModalProps) {
  const { currentLanguage, allLanguages, setLanguageByCode } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Select Course Language</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  Major Indian Languages
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Browse course titles, descriptions, and curriculum in your mother tongue
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Languages Grid */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allLanguages.map((lang) => {
              const isSelected = currentLanguage.code === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLanguageByCode(lang.code);
                    onClose();
                  }}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all text-left group cursor-pointer ${
                    isSelected
                      ? 'bg-orange-500/15 border-orange-500 text-white shadow-lg shadow-orange-500/10'
                      : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/60 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl select-none" role="img" aria-label={lang.name}>
                      {lang.flag}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-white tracking-wide">
                          {lang.nativeName}
                        </span>
                        {lang.code !== 'en' && (
                          <span className="text-xs text-neutral-400">
                            ({lang.name})
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        {lang.region}
                      </div>
                    </div>
                  </div>

                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-orange-500 text-neutral-950 flex items-center justify-center shadow">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-neutral-700 group-hover:border-neutral-500 flex items-center justify-center transition-colors">
                      <div className="w-2 h-2 rounded-full bg-transparent group-hover:bg-neutral-500 transition-colors" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Notice */}
          <div className="mt-5 p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-start gap-3 text-xs text-neutral-400">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              Switching language updates all course catalog cards, titles, syllabi, badges, and learning descriptions with 0 ms latency. Live classes are conducted in bilingual English + regional languages.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800 bg-neutral-950/60 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-neutral-500" />
            <span>Active: <strong className="text-orange-400">{currentLanguage.nativeName} ({currentLanguage.name})</strong></span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
