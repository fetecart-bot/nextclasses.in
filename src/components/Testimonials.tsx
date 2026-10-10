import { useLanguage } from '../context/LanguageContext';
import { useEffect, useState } from 'react';
import { CheckCircle2, Star } from 'lucide-react';

type PublishedReview = {
  id: string;
  display_name: string;
  course_title: string;
  rating: number;
  review_text: string;
  published_at: string;
};

export default function Testimonials() {
  const { t: translateUI } = useLanguage();

  const [reviews, setReviews] = useState<PublishedReview[]>([]);

  useEffect(() => {
    fetch('/api/reviews')
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((payload) => setReviews(Array.isArray(payload.reviews) ? payload.reviews : []))
      .catch(() => setReviews([]));
  }, []);

  return (
    <section id="testimonials" className="py-20 sm:py-28 bg-neutral-900 text-white border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-400">{translateUI("Verified student reviews")}</span>
          <h2 id="testimonials-heading" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">{translateUI("Experiences shared by enrolled learners")}</h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">{translateUI("Every published review is submitted from an active student account and checked before appearing here.")}</p>
        </div>

        {reviews.length === 0 ? (
          <div className="max-w-2xl mx-auto rounded-2xl border border-neutral-800 bg-neutral-950 p-8 text-center">
            <Star className="w-8 h-8 text-orange-400 mx-auto mb-3" />
            <h3 className="font-bold text-white">{translateUI("Verified reviews are opening soon")}</h3>
            <p className="text-sm text-neutral-400 mt-2">{translateUI("Enrolled students can submit feedback from their portal. Approved reviews will appear here.")}</p>
          </div>
        ) : (
          <div id="testimonials-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {reviews.map((review) => {
              const initials = review.display_name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
              return (
                <article key={review.id} className="p-8 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between space-y-6 hover:border-neutral-700 transition-all shadow-xl">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-1" aria-label={`${review.rating} out of 5 stars`}>
                        {[1, 2, 3, 4, 5].map((value) => <Star key={value} className={`w-4 h-4 ${value <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-700'}`} />)}
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-orange-400 text-[11px] font-semibold text-right">{review.course_title}</span>
                    </div>
                    <p className="text-neutral-300 text-sm leading-relaxed">“{review.review_text}”</p>
                  </div>
                  <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-orange-600 text-white flex items-center justify-center font-black" aria-hidden="true">{initials}</div>
                      <div><h4 className="font-bold text-white text-sm">{review.display_name}</h4><span className="text-xs text-neutral-400">{translateUI("Enrolled student")}</span></div>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />{translateUI("Verified learner")}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
