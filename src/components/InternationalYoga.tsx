import { CalendarDays, Video, BookOpen, Globe2, ArrowUpRight } from 'lucide-react';

export default function InternationalYoga() {
  const enquiry = encodeURIComponent('Hello NextClasses, I am interested in the international yoga programme with Kavery P P: 8 live English classes per month, videos and notes, US$500/month. Please share the schedule, session duration, class format and instructor qualifications.');
  return <section id="international-yoga" aria-labelledby="yoga-heading" className="scroll-mt-36 bg-slate-950 border-y border-cyan-400/20 py-16 sm:py-24">
    <div className="max-w-6xl mx-auto px-5 grid lg:grid-cols-[1.25fr_1fr] gap-10 items-center">
      <div>
        <p className="text-cyan-300 text-sm font-semibold tracking-widest uppercase flex gap-2 items-center"><Globe2 size={18} aria-hidden="true" /> International learners · Adults 18+</p>
        <h2 id="yoga-heading" className="text-4xl sm:text-5xl font-bold text-white mt-4 leading-tight">Make time for yoga.<br /><span className="text-orange-400">Learn with live guidance.</span></h2>
        <p className="text-neutral-300 text-lg leading-relaxed mt-5">An instructor-led yoga programme in English with Kavery P P, supported by practice videos and notes.</p>
        <div className="grid sm:grid-cols-3 gap-3 mt-7">
          {[{ icon: CalendarDays, title: '8 live classes', detail: 'Every month' }, { icon: Video, title: 'Practice videos', detail: 'Included' }, { icon: BookOpen, title: 'Learning notes', detail: 'Included' }].map(({ icon: Icon, title, detail }) => <div key={title} className="rounded-2xl bg-white/5 border border-white/10 p-4"><Icon className="text-cyan-300 mb-3" size={24} aria-hidden="true" /><p className="font-semibold text-white">{title}</p><p className="text-sm text-neutral-400 mt-1">{detail}</p></div>)}
        </div>
      </div>
      <div className="rounded-3xl border border-orange-400/40 bg-gradient-to-br from-orange-500/10 to-cyan-500/5 p-7 sm:p-9">
        <p className="text-neutral-300">Your instructor</p><h3 className="text-2xl font-bold text-white mt-1">Kavery P P</h3>
        <p className="text-cyan-300 mt-2">Live online classes · Taught in English</p>
        <p className="text-4xl font-bold text-white mt-7">US$500 <span className="text-base font-normal text-neutral-300">/ month</span></p>
        <p className="text-sm text-neutral-300 mt-3 leading-relaxed">Includes eight live classes, videos and notes. Enquire to confirm your time zone, timetable, session duration and class format before enrolling.</p>
        <a href={`https://wa.me/918792134951?text=${enquiry}`} target="_blank" rel="noopener noreferrer" className="mt-7 flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-bold px-5 py-4">Enquire about yoga <ArrowUpRight size={20} aria-hidden="true" /></a>
        <a href="tel:+918064262009" className="block text-center text-cyan-300 underline underline-offset-4 mt-4">Call Tara: +91 80 6426 2009</a>
        <a href={`mailto:support@nextclasses.in?subject=International%20yoga%20enquiry&body=${enquiry}`} className="block text-center text-neutral-300 underline underline-offset-4 mt-3">Email our course team</a>
        <p className="text-xs text-neutral-400 mt-5 leading-relaxed">Enquiry only; no payment or automatic charge. The CBSE tuition free trial does not apply to this programme. Yoga instruction is for general wellbeing, not medical treatment.</p>
      </div>
    </div>
  </section>;
}
