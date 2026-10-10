import { useLanguage } from '../context/LanguageContext';
import { useState } from 'react';
import { CheckCircle2, Loader2, Star } from 'lucide-react';

type Props = {
  identifier: string;
  password: string;
  courseId: string;
  courseTitle: string;
};

export default function StudentReviewForm({ identifier, password, courseId, courseTitle }: Props) {
  const { t: translateUI } = useLanguage();

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setMessage(null);
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, courseId, rating, reviewText, consentToPublish: consent }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Unable to submit your review');
      setMessage(payload.message || 'Thank you. Your review was sent for approval.');
    } catch (err: any) {
      setError(err?.message || 'Unable to submit your review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto rounded-3xl border border-[#263750] bg-[#0f172a] p-5 sm:p-7 space-y-5">
      <div>
        <div className="flex items-center gap-2 text-orange-400 font-black">
          <Star className="w-5 h-5 fill-orange-400" />
          <h3>{translateUI("Share your course experience")}</h3>
        </div>
        <p className="text-xs text-neutral-400 mt-1">{translateUI("Only verified enrolled students can submit. Reviews appear publicly after administrator approval.")}</p>
      </div>

      <div className="rounded-xl bg-[#141d2d] border border-[#263750] p-3 text-xs text-neutral-300">{translateUI("Reviewing:")}<strong className="text-white">{courseTitle}</strong>
      </div>

      <div>
        <label className="text-xs font-bold text-neutral-300 block mb-2">{translateUI("Your rating")}</label>
        <div className="flex gap-2" role="radiogroup" aria-label={translateUI("Course rating")}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value} star${value > 1 ? 's' : ''}`} aria-pressed={rating === value} className="cursor-pointer p-1">
              <Star className={`w-8 h-8 transition-colors ${value <= rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-600 hover:text-amber-300'}`} />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="student-review" className="text-xs font-bold text-neutral-300 block mb-2">{translateUI("What helped you most?")}</label>
        <textarea id="student-review" value={reviewText} onChange={(event) => setReviewText(event.target.value.slice(0, 1000))} rows={6} placeholder={translateUI("Tell future students about the teaching, materials, mentor, or your progress...")} className="w-full rounded-xl bg-[#0a0f1d] border border-[#263750] px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500" />
        <span className="block text-right text-[10px] text-neutral-500 mt-1">{reviewText.length}/1000</span>
      </div>

      <label className="flex items-start gap-2.5 text-xs text-neutral-300 cursor-pointer">
        <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-0.5 accent-orange-500" />
        <span>{translateUI("I permit NextClasses.in to publish my name, course, rating, and review on its website.")}</span>
      </label>

      {message && <div className="flex items-center gap-2 rounded-xl border border-emerald-800 bg-emerald-950/60 p-3 text-xs font-semibold text-emerald-300"><CheckCircle2 className="w-4 h-4" />{message}</div>}
      {error && <div className="rounded-xl border border-rose-800 bg-rose-950/60 p-3 text-xs font-semibold text-rose-300">{error}</div>}

      <button type="button" disabled={submitting || rating === 0 || reviewText.trim().length < 20 || !consent} onClick={submit} className="w-full rounded-xl bg-orange-500 hover:bg-orange-400 disabled:bg-neutral-700 disabled:text-neutral-500 px-4 py-3 text-sm font-black text-neutral-950 transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2">
        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}{translateUI("Submit verified review")}</button>
    </div>
  );
}
