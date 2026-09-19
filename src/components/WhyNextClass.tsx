import { Sparkles, Check, Globe, Code2, Users, Award, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function WhyNextClass() {
  const pillars = [
    {
      id: 'pillar-jargon-free',
      icon: Sparkles,
      title: '100% Practical & Zero Jargon',
      description:
        'No confusing algorithms or intimidating math. We teach you how to think, prompt, and orchestrate generative AI models to solve real everyday tasks.',
      highlight: 'No coding required',
    },
    {
      id: 'pillar-multilingual',
      icon: Globe,
      title: 'All Indian Languages & English',
      description:
        'Learning in your natural conversational flow ensures total clarity. Ask doubts and access instructions in all Indian languages or English without hesitation.',
      highlight: 'Native Comfort',
    },
    {
      id: 'pillar-curriculum',
      icon: Award,
      title: 'Domain-Specific Programs',
      description:
        'We do not teach generic AI overviews. Teachers get SCERT/CBSE lesson planning; students get thesis research and exam revision; designers get photorealistic poster prompts.',
      highlight: 'Tailored Frameworks',
    },
    {
      id: 'pillar-community',
      icon: Users,
      title: 'VIP WhatsApp Community & Prompt Hub',
      description:
        'You never learn in isolation. Every enrolled learner gets access to our curated WhatsApp community for prompt sharing, workflow templates, and peer networking.',
      highlight: '10k+ Peer Network',
    },
    {
      id: 'pillar-lifetime',
      icon: ShieldCheck,
      title: 'Lifetime Dashboard & Updates',
      description:
        'AI evolves every month. As new capabilities launch (like Claude 3.7 or GPT-5), your student dashboard gets free updated modules and fresh prompt sheets.',
      highlight: 'Continuous Evolution',
    },
    {
      id: 'pillar-certification',
      icon: HeartHandshake,
      title: 'Verified Certificate of Mastery',
      description:
        'Receive an official certificate with a unique QR code verification link to present to schools, college departments, or add to LinkedIn.',
      highlight: 'Official Credential',
    },
  ];

  return (
    <section id="about-us" className="py-20 sm:py-28 bg-neutral-950 text-white border-b border-neutral-800 scroll-mt-16">
      {/* Anchor alias for #why-us compatibility */}
      <div id="why-us" className="sr-only" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl space-y-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
            The NextClass Advantage
          </span>
          <h2 id="why-heading" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            Why thousands of learners trust NextClass AI for their journey.
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            Most online tutorials are either too academic or overly superficial. We bridge the gap with hands-on, contextual learning that creates immediate productivity.
          </p>
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
                  <span>Guaranteed in every course</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
