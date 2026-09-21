import { ArrowRight, Sparkles, CheckCircle2, Play, Users, Star, ShieldCheck, Zap, Phone } from 'lucide-react';
import { Course } from '../types';

interface HeroProps {
  flagshipCourse: Course;
  onExploreCourses: () => void;
  onExploreProducts: () => void;
  onSelectCourse: (course: Course) => void;
  onOpenStudentPortal: () => void;
  onAddToCart: (item: any) => void;
  onOpenVoiceReceptionist?: () => void;
}

export default function Hero({
  flagshipCourse,
  onExploreCourses,
  onExploreProducts,
  onSelectCourse,
  onOpenStudentPortal,
  onAddToCart,
  onOpenVoiceReceptionist,
}: HeroProps) {
  return (
    <section id="hero" className="relative bg-neutral-950 text-white overflow-hidden py-16 sm:py-24 border-b border-neutral-800">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-orange-600/10 via-amber-600/5 to-transparent blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Core Value Proposition */}
          <div className="lg:col-span-7 space-y-7 text-left">
            
            {/* Top Micro-badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-orange-500/30 bg-orange-950/40 text-orange-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>India's Practical AI Academy & Digital Hub</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1
                id="hero-title"
                className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]"
              >
                Learn Artificial Intelligence in the{' '}
                <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
                  simplest, most practical
                </span>{' '}
                way.
              </h1>

              <p
                id="hero-subtitle"
                className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-2xl"
              >
                No coding background required. Self-paced masterclasses in All Indian Languages & English and high-impact digital tools for <strong>Teachers</strong>, <strong>Students</strong>, <strong>Designers</strong>, and <strong>Business Owners</strong>.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                id="hero-courses-cta"
                type="button"
                onClick={onExploreCourses}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-neutral-950 font-bold text-sm sm:text-base hover:from-orange-400 hover:to-amber-400 transition-all shadow-lg shadow-orange-500/20 cursor-pointer"
              >
                <span>Explore AI Courses</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-products-cta"
                type="button"
                onClick={onExploreProducts}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-neutral-700 bg-neutral-900/80 text-neutral-200 font-semibold text-sm sm:text-base hover:bg-neutral-800 hover:text-white transition-all cursor-pointer"
              >
                <span>Buy AI Digital Products</span>
              </button>

              <button
                id="hero-demo-cta"
                type="button"
                onClick={onOpenStudentPortal}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold text-xs sm:text-sm hover:bg-amber-500/20 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-amber-300" />
                <span>Test Drive Student Portal</span>
              </button>

              {onOpenVoiceReceptionist && (
                <button
                  id="hero-voice-receptionist-cta"
                  type="button"
                  onClick={onOpenVoiceReceptionist}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold text-xs sm:text-sm hover:bg-emerald-900 transition-all cursor-pointer active:scale-95 shadow-md shadow-emerald-950/50"
                  title="Talk to Priya • AI Voice Receptionist (Indian Accent)"
                >
                  <Phone className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>Call Priya (AI Voice)</span>
                </button>
              )}
            </div>

            {/* Trust and Credibility stats */}
            <div id="hero-metrics" className="pt-6 border-t border-neutral-800 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-left">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">15,000+</div>
                <div className="text-xs text-neutral-400 mt-0.5">Learners Empowered</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight flex items-center gap-1">
                  4.96 <Star className="w-4 h-4 fill-amber-400 text-amber-400 inline" />
                </div>
                <div className="text-xs text-neutral-400 mt-0.5">Average Rating</div>
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-black text-white tracking-tight leading-tight">All Indian Languages</div>
                <div className="text-xs text-neutral-400 mt-0.5">& English Delivery</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">100%</div>
                <div className="text-xs text-neutral-400 mt-0.5">Practical & No-Code</div>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Flagship Cohort Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 p-1 shadow-2xl overflow-hidden group">
              
              {/* Highlight Ribbon */}
              <div className="flex items-center justify-between px-5 py-3 bg-neutral-900/90 border-b border-neutral-800 text-xs">
                <span className="flex items-center gap-1.5 font-bold text-orange-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  100% Self-Paced • Instant Access
                </span>
                <span className="font-mono text-neutral-400 text-[11px]">Start Immediately</span>
              </div>

              {/* Course Media Preview */}
              <div
                onClick={() => onSelectCourse(flagshipCourse)}
                className="relative aspect-16/9 overflow-hidden bg-neutral-800 cursor-pointer group/thumb"
                title="Click to watch official YouTube masterclass and syllabus preview"
              >
                <img
                  src={flagshipCourse.thumbnail}
                  alt={flagshipCourse.title}
                  className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.triedFallback) {
                      target.dataset.triedFallback = 'true';
                      target.src = '/courses/google-ai-studio-gemini.svg';
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent" />
                
                {/* Central Play Badge */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-13 h-13 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-2xl backdrop-blur-sm group-hover/thumb:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </div>
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/85 backdrop-blur-md text-[11px] font-bold text-red-400 border border-red-500/40">
                  <Play className="w-3 h-3 fill-current" />
                  <span>YouTube Masterclass</span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                  <span className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-md text-amber-300 font-bold border border-amber-500/30">
                    {flagshipCourse.badge || 'Bestseller'}
                  </span>
                  <span className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-md text-neutral-300 font-medium">
                    {flagshipCourse.duration}
                  </span>
                </div>
              </div>

              {/* Details and Enrollment Box */}
              <div className="p-6 space-y-4 text-left">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
                    Flagship Masterclass
                  </span>
                  <h3 className="text-xl font-bold text-white tracking-tight mt-1">
                    {flagshipCourse.title}
                  </h3>
                  <p className="text-xs text-neutral-300 mt-2 line-clamp-2 leading-relaxed">
                    {flagshipCourse.subtitle}
                  </p>
                </div>

                {/* Quick key bullets */}
                <ul className="space-y-1.5 text-xs text-neutral-300">
                  {flagshipCourse.highlights.slice(0, 3).map((h, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="line-clamp-1">{h}</span>
                    </li>
                  ))}
                </ul>

                {/* Price & Action */}
                <div className="pt-4 border-t border-neutral-800 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-white">₹{flagshipCourse.price}</span>
                      <span className="text-sm line-through text-neutral-500">₹{flagshipCourse.originalPrice}</span>
                      {flagshipCourse.originalPrice && flagshipCourse.originalPrice > flagshipCourse.price && (
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
                          {Math.round(((flagshipCourse.originalPrice - flagshipCourse.price) / flagshipCourse.originalPrice) * 100)}% OFF
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-neutral-400 block mt-0.5">Inclusive of GST & All Resources</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectCourse(flagshipCourse)}
                      className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-neutral-800 text-neutral-200 text-xs font-medium hover:bg-neutral-700 transition-colors cursor-pointer"
                      title="Watch YouTube video preview & view curriculum"
                    >
                      <Play className="w-3 h-3 text-red-500 fill-red-500" />
                      <span>Demo & Syllabus</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onAddToCart({
                        id: flagshipCourse.id,
                        itemType: 'course',
                        title: flagshipCourse.title,
                        price: flagshipCourse.price,
                        originalPrice: flagshipCourse.originalPrice,
                        thumbnail: flagshipCourse.thumbnail,
                        format: flagshipCourse.format,
                        category: flagshipCourse.category,
                      })}
                      className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-neutral-950 font-bold text-xs hover:opacity-90 transition-opacity shadow-md cursor-pointer"
                    >
                      Enroll Now
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
