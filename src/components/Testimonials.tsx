import { Star, CheckCircle2, Quote } from 'lucide-react';
import { TESTIMONIALS_DATA } from '../data';

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 sm:py-28 bg-neutral-900 text-white border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
            Real Student Experiences
          </span>
          <h2 id="testimonials-heading" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            Loved by Teachers, Students & Creators Across India & Beyond
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            Discover how educators save hours every week and how students unlock high academic results with Nextclasses.in.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div id="testimonials-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {TESTIMONIALS_DATA.map((t) => (
            <div
              key={t.id}
              id={t.id}
              className="p-8 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between space-y-6 hover:border-neutral-700 transition-all shadow-xl"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-orange-400 text-[11px] font-semibold">
                    {t.courseTaken}
                  </span>
                </div>

                <p className="text-neutral-300 text-sm leading-relaxed italic">
                  "{t.text}"
                </p>
              </div>

              {/* Author Footer */}
              <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-11 h-11 rounded-full object-cover border border-neutral-700"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=ea580c&color=fff`;
                    }}
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-white text-sm">{t.name}</h4>
                      {t.verified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" title="Verified Enrolled Student" />
                      )}
                    </div>
                    <span className="text-xs text-neutral-400 block">{t.role}</span>
                    <span className="text-[11px] text-neutral-500 block">{t.institution}</span>
                  </div>
                </div>

                <div className="hidden sm:block text-right">
                  <span className="text-[10px] text-emerald-400 font-mono font-medium block">
                    Verified Learner
                  </span>
                  <span className="text-[10px] text-neutral-500">Masterclass Graduate</span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
