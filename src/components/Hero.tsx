import { useLanguage } from '../context/LanguageContext';
import { ArrowRight, Sparkles, CheckCircle2, Play, Users, Star, ShieldCheck, Zap } from 'lucide-react';
import { Course } from '../types';

interface HeroProps {
  flagshipCourse: Course;
  onExploreCourses: () => void;
  onExploreProducts: () => void;
  onSelectCourse: (course: Course) => void;
  onOpenStudentPortal: () => void;
  onAddToCart: (item: any) => void;
}

export default function Hero({ flagshipCourse, onExploreCourses, onSelectCourse, onOpenStudentPortal }: HeroProps) {
  return <section id="hero" className="bg-neutral-950 text-white py-14 sm:py-20 border-b border-neutral-800">
    <div className="max-w-6xl mx-auto px-5">
      <p className="text-orange-400 font-semibold mb-4">NextClasses · Practical ChatGPT skills</p>
      <h2 id="hero-title" className="text-4xl sm:text-6xl font-black leading-tight max-w-4xl">Make ChatGPT useful.<br/><span className="text-orange-400">Learn by practising.</span></h2>
      <p className="mt-5 text-lg text-neutral-300 max-w-2xl">Build practical ChatGPT skills for studying, teaching and everyday work. Explore the syllabus before enrolling.</p>
      <div className="flex flex-wrap gap-3 mt-7">
        <button id="hero-courses-cta" onClick={onExploreCourses} className="bg-orange-500 text-black font-bold px-6 py-4 rounded-xl">Explore programmes</button>
        <button onClick={() => onSelectCourse(flagshipCourse)} className="border border-orange-500 text-orange-300 px-6 py-4 rounded-xl">View ChatGPT syllabus</button>
        <a href="https://wa.me/918792134951?text=Please%20help%20me%20choose%20a%20NextClasses%20course" className="border border-neutral-600 px-6 py-4 rounded-xl">Ask a course adviser</a>
      </div>
      <button onClick={onOpenStudentPortal} className="mt-6 text-sm underline text-neutral-300">Already enrolled? Student sign in</button>
      <p className="mt-6 text-sm text-neutral-400">View the course details, study format and price before making a payment.</p>
    </div>
  </section>;
}
