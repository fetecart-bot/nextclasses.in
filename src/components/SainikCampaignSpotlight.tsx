import { useLanguage } from '../context/LanguageContext';
import { ArrowRight, BookOpenCheck, CalendarClock, ShieldCheck } from 'lucide-react';
import { Course } from '../types';

interface SainikCampaignSpotlightProps {
  courses: Course[];
}

const TRACKS = [
  {
    id: 'course-aissee-sainik-6',
    label: 'Class 6 Entrance',
    audience: 'For students currently studying in Class 4 or 5',
    pattern: '125 questions • 300 marks',
  },
  {
    id: 'course-aissee-sainik-9',
    label: 'Class 9 Entrance',
    audience: 'For students currently studying in Class 7 or 8',
    pattern: '150 questions • 400 marks',
  },
] as const;

export default function SainikCampaignSpotlight({ courses }: SainikCampaignSpotlightProps) {
  const { t: translateUI } = useLanguage();

  const availableTracks = TRACKS.map((track) => ({
    ...track,
    course: courses.find((course) => course.id === track.id),
  })).filter((track) => Boolean(track.course));

  if (!availableTracks.length) return null;

  return (
    <section
      aria-labelledby="sainik-campaign-heading"
      className="border-y border-amber-400/20 bg-gradient-to-b from-amber-950/30 via-neutral-950 to-neutral-950 py-14 sm:py-18"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-300">
            <ShieldCheck className="h-4 w-4" />{translateUI("Admissions preparation 2027")}</div>
          <h2 id="sainik-campaign-heading" className="text-3xl font-black tracking-tight text-white sm:text-4xl">{translateUI("Sainik School entrance preparation for Class 6 and Class 9")}</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-300 sm:text-base">{translateUI("Choose the student’s entrance level to see the correct AISSEE syllabus, weekly study plan, mock tests and enrolment details.")}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {availableTracks.map(({ course, ...track }) => {
            if (!course) return null;
            const slug = course.id.replace(/^course-/, '');
            return (
              <article key={course.id} className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-xl shadow-black/20 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-amber-400">AISSEE 2027</p>
                    <h3 className="mt-1 text-2xl font-extrabold text-white">{translateUI(track.label)}</h3>
                    <p className="mt-1 text-sm text-neutral-400">{translateUI(track.audience)}</p>
                  </div>
                  <div className="rounded-2xl bg-amber-400/10 p-3 text-amber-300">
                    <BookOpenCheck className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-neutral-300">
                    <span className="mb-1 flex items-center gap-1.5 font-bold text-white"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />{translateUI("Exam pattern")}</span>
                    {translateUI(track.pattern)}
                  </div>
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-neutral-300">
                    <span className="mb-1 flex items-center gap-1.5 font-bold text-white"><CalendarClock className="h-3.5 w-3.5 text-emerald-400" />{translateUI("Study support")}</span>{translateUI("Weekly plan and mocks")}</div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-2xl font-black text-white">₹{course.price}</span>
                    <span className="ml-2 text-sm text-neutral-500 line-through">₹{course.originalPrice}</span>
                  </div>
                  <a
                    href={`/courses/${slug}/`}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-2.5 text-sm font-extrabold text-neutral-950 shadow-lg shadow-orange-500/15 transition hover:brightness-105"
                  >{translateUI("View syllabus & enrol")}<ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-5 text-center text-xs text-neutral-500">{translateUI("Unsure which level applies? Use the WhatsApp academic support link shown on the course page before enrolling.")}</p>
      </div>
    </section>
  );
}
