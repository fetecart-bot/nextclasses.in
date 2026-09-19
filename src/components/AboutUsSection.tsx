import { Award, Users, BookOpen, Target, Sparkles, MapPin, Phone, Mail, Globe, CheckCircle2, ShieldCheck } from 'lucide-react';

interface AboutUsSectionProps {
  onOpenPolicyModal?: (tab: 'about' | 'terms' | 'privacy' | 'refund' | 'shipping' | 'pricing') => void;
  onExploreCourses?: () => void;
}

export default function AboutUsSection({ onOpenPolicyModal, onExploreCourses }: AboutUsSectionProps) {
  const highlights = [
    {
      title: 'Our Mission',
      description:
        'To demystify Generative Artificial Intelligence and modern productivity platforms for students, teachers, competitive exam aspirants, and working professionals across India through practical, zero-jargon, bilingual coaching.',
      icon: Target,
      color: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    },
    {
      title: 'Who We Are',
      description:
        'Operated under Fetecart Store, NextClass AI is an agile EdTech initiative founded in Thrissur, Kerala. We build hands-on curriculums covering Claude AI, ChatGPT, Automation (n8n), Languages, and Exam Readiness.',
      icon: Users,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    },
    {
      title: 'Practical, Not Academic',
      description:
        'We teach workflows that yield instant results: teachers creating lesson plans in seconds, students mastering research papers, and professionals automating 10+ hours of repetitive weekly chores.',
      icon: Award,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    },
    {
      title: 'Bilingual & Native Comfort',
      description:
        'AI should not have language barriers. We deliver interactive live sessions and pre-recorded portal courses in conversational Malayalam, Hindi, Tamil, and English with dedicated mentor Q&A.',
      icon: Globe,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    },
  ];

  return (
    <section id="about-us" className="py-20 sm:py-28 bg-neutral-900 text-white border-b border-neutral-800 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>About NextClass AI & Fetecart Store</span>
            </div>
            <h2 id="about-us-title" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Empowering India with Real, Practical AI Skills.
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
              Bridging the gap between rapid technological breakthroughs and real-world everyday productivity for classrooms, exam halls, and modern offices.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenPolicyModal?.('about')}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs font-semibold border border-neutral-700 transition-colors cursor-pointer"
            >
              Read Company Story →
            </button>
            {onExploreCourses && (
              <button
                type="button"
                onClick={onExploreCourses}
                className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-neutral-950 font-bold text-xs shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
              >
                Browse Our Programs
              </button>
            )}
          </div>
        </div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight">{item.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Company Overview & Registered Details Box */}
        <div className="p-8 rounded-3xl bg-neutral-950 border border-neutral-800 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Registered Indian Business & Verified EdTech Publisher</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white">
                NextClass AI by Fetecart Store
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                NextClass AI was conceived with a straightforward belief: <em>Artificial intelligence shouldn't be reserved for high-end developers and Silicon Valley engineers</em>. From school teachers in Thrissur to university researchers and competitive exam candidates, everyone deserves straightforward, hands-on instruction to leverage AI safely and productively.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-neutral-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Curated & Tested AI Frameworks</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100% Self-Paced with Lifetime Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Official Verified Course Certificates</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>RBI Compliant Payments via Razorpay</span>
                </div>
              </div>
            </div>

            {/* Quick Contact & Office Box */}
            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3.5 text-xs">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider border-b border-neutral-800 pb-2">
                Merchant & Office Information
              </h4>
              
              <div className="flex items-start gap-2.5 text-neutral-300">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold">Fetecart Store</strong>
                  <span>Pattukulangara, Puduruthi,<br />Thrissur, Kerala, India - 680623</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-neutral-300">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-neutral-500 block">Phone & WhatsApp:</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <a href="tel:8281644058" className="text-white hover:text-orange-400 font-mono font-medium">
                      +91 82816 44058
                    </a>
                    <a
                      href="https://wa.me/918281644058?text=Hi%20Fetecart%20NextClass%20Support"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-semibold hover:bg-emerald-900 border border-emerald-800 transition-colors"
                    >
                      Chat on WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-neutral-300">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-neutral-500 block">Official Support Email:</span>
                  <a href="mailto:fetecart@gmail.com" className="text-white hover:text-cyan-400">
                    fetecart@gmail.com
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
