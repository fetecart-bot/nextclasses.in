import { useLanguage } from '../context/LanguageContext';

export default function LanguageSwitch() {
  const { currentLanguage, setLanguageByCode } = useLanguage();
  return <div role="group" aria-label="Page language" className="inline-flex items-center gap-1 rounded-xl border border-neutral-700 bg-neutral-950 p-1 text-xs">
    <button type="button" aria-pressed={currentLanguage.code === 'en'} onClick={() => setLanguageByCode('en')} className={`px-2 py-1 rounded-lg ${currentLanguage.code === 'en' ? 'bg-orange-500 text-black font-bold' : 'text-neutral-300'}`}>English</button>
    <button type="button" aria-pressed={currentLanguage.code === 'hi'} onClick={() => setLanguageByCode('hi')} className={`px-2 py-1 rounded-lg ${currentLanguage.code === 'hi' ? 'bg-orange-500 text-black font-bold' : 'text-neutral-300'}`}>हिन्दी</button>
  </div>;
}
