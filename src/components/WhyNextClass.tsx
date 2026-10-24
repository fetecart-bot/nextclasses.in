import { useLanguage } from '../context/LanguageContext';
import { Sparkles, Check, Globe, Code2, Users, Award, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function WhyNextClass() {
  const { t: translateUI } = useLanguage();

  const pillars = [
    { id: 'pillar-clarity', icon: Sparkles, title: 'Understand before memorising', description: 'Use clear explanations, worked examples and practice to build understanding step by step.', highlight: 'Practical learning' },
    { id: 'pillar-subjects', icon: Award, title: 'Choose the right class', description: 'Select CBSE Classes 5–12 and review the offered subjects before joining.', highlight: 'Class-wise tuition' },
    { id: 'pillar-language', icon: Globe, title: 'Language support', description: 'Use the available language controls and ask support about the language you need.', highlight: 'Learning support' },
    { id: 'pillar-support', icon: Users, title: 'Talk to course support', description: 'Ask about the syllabus, access or monthly tuition through our published WhatsApp support number.', highlight: '+91 8792134951' },
    { id: 'pillar-price', icon: ShieldCheck, title: 'Clear monthly tuition prices', description: 'Classes 5–7: ₹200; Classes 8–9: ₹300; Classes 10–12: ₹400 per month, including all offered subjects after the introductory trial.', highlight: 'Optional renewal' },
    { id: 'pillar-check', icon: HeartHandshake, title: 'Check your learning', description: 'Practise questions, review mistakes and check important AI explanations against your textbook.', highlight: 'Understand and practise' },
  ];

  return (
    <section id="about-us" className="py-20 sm:py-28 bg-neutral-950 text-white border-b border-neutral-800 scroll-mt-16">
      {/* Anchor alias for #why-us compatibility */}
      <div id="why-us" className="sr-only" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl space-y-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-400">{translateUI("The Nextclasses.in Advantage")}</span>
          <h2 id="why-heading" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">{translateUI("Learning support that is easy to understand.")}</h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">{translateUI("Choose a suitable course, explore its learning approach, and ask us about access before joining.")}</p>
        </div>

        {/* 6-Grid Pillars */}
        <div id="why-pillars-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                id={pillar.id}
                className="p-8 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4 hover:border-neutral-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-orange-400">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 text-[11px] font-semibold">
                      {pillar.highlight}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white tracking-tight">{pillar.title}</h3>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">{pillar.description}</p>
                </div>

                <div className="pt-4 border-t border-neutral-800/60 flex items-center gap-2 text-xs text-emerald-400 font-medium">
                  <Check className="w-3.5 h-3.5" />
                  <span>{translateUI("Guaranteed in every course")}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
