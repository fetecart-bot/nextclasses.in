import { useState, type FormEvent } from 'react';
import { Building2, GraduationCap, Users, CheckCircle2, ArrowRight, MessageSquare, Send } from 'lucide-react';

export default function InstitutionalBanner() {
  const [institutionName, setInstitutionName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!institutionName || !contactEmail) return;
    setSubmitted(true);
    setTimeout(() => {
      setInstitutionName('');
      setContactEmail('');
    }, 4000);
  };

  return (
    <section id="institutional" className="py-16 sm:py-20 bg-neutral-900 border-b border-neutral-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-orange-950/40 border border-neutral-800 p-8 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center shadow-2xl">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>For Schools, Colleges & Organizations</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Train Your Entire Faculty or Student Body in Practical AI
            </h2>

            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
              We conduct customized hands-on offline & online AI Bootcamps for schools (CBSE, ICSE, SCERT), engineering colleges, arts & science faculties, and corporate teams across Kerala and South India.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>On-campus hands-on workshops</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>SCERT & NEP 2020 aligned AI pedagogy</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Custom lab exercises & prompt vaults</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Authorized institutional certification</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="p-6 sm:p-8 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4 shadow-xl">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Request an Institutional Proposal
              </h3>
              <p className="text-xs text-neutral-400">
                Receive our syllabus deck, batch capacity, and institutional pricing within 4 working hours.
              </p>

              {submitted ? (
                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs space-y-1 text-center">
                  <span className="font-bold block">Inquiry Received!</span>
                  <span>Our Institutional Program Director will reach out shortly.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                      School / College / Organization Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. St. Joseph Higher Secondary / CET"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                      Official Contact Email / WhatsApp
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. principal@school.edu.in or 9847..."
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-neutral-950 font-bold text-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Get Syllabus & Institutional Pricing</span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
