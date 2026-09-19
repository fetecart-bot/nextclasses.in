import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, MessageCircle } from 'lucide-react';
import { FAQ_DATA } from '../data';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 sm:py-28 bg-neutral-950 text-white border-b border-neutral-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5 text-orange-400" />
            <span>Got Questions?</span>
          </div>
          <h2 id="faq-heading" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            Everything you need to know about our courses, digital products, self-paced access, and certificates.
          </p>
        </div>

        {/* Accordions */}
        <div id="faq-accordions" className="space-y-3">
          {FAQ_DATA.map((item, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={item.id}
                id={item.id}
                className="rounded-xl bg-neutral-900/80 border border-neutral-800 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(idx)}
                  className="w-full px-6 py-4.5 flex items-center justify-between text-left hover:bg-neutral-850 transition-colors cursor-pointer"
                >
                  <span className="font-bold text-sm sm:text-base text-white pr-4">
                    {item.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-orange-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-neutral-300 border-t border-neutral-800/60 leading-relaxed bg-neutral-950/40">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions banner */}
        <div className="mt-12 p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="font-bold text-white text-base">Still have questions or need institutional training?</h4>
            <p className="text-xs text-neutral-400">Our academic counselors are active on WhatsApp to guide your choice.</p>
          </div>
          <a
            href="https://wa.me/918281644058?text=Hi%20NextClass%20AI%20Team,%20I%20have%20a%20question%20regarding%20courses%20and%20weekly%20materials"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shrink-0 shadow-md shadow-emerald-600/20"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp (+91 82816 44058)</span>
          </a>
        </div>

      </div>
    </section>
  );
}
