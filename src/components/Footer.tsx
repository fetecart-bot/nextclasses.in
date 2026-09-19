import { Sparkles, MessageCircle, Mail, MapPin, Heart, ArrowUp, ShieldCheck, FileText, Truck, RefreshCw, DollarSign, Lock, Phone, KeyRound } from 'lucide-react';
import { PolicyTab } from './PolicyModal';

interface FooterProps {
  onNavigateTo: (id: string) => void;
  onOpenStudentPortal: () => void;
  onOpenPolicyModal?: (tab: PolicyTab) => void;
  onOpenAdmin?: () => void;
}

export default function Footer({ onNavigateTo, onOpenStudentPortal, onOpenPolicyModal, onOpenAdmin }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="main-footer" className="bg-neutral-950 text-neutral-400 text-xs border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-neutral-950 font-black text-lg shadow-md">
                NC
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">NextClass</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                AI Academy
              </span>
            </div>

            <p className="text-neutral-400 leading-relaxed text-xs max-w-sm">
              India's dedicated practical AI academy. We turn complex generative AI breakthroughs into simple, high-leverage workflows for educators, students, and professionals in conversational Indian languages and English.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
              <a
                href="https://wa.me/918281644058?text=Hi%20NextClass%20AI%20Support"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp: +91 8281644058</span>
              </a>
              <span className="text-neutral-700">•</span>
              <a
                href="tel:8281644058"
                className="inline-flex items-center gap-1.5 text-orange-300 hover:text-orange-200 transition-colors font-medium"
              >
                <Phone className="w-4 h-4 text-orange-400" />
                <span>Phone: +91 82816 44058</span>
              </a>
              <span className="text-neutral-700">•</span>
              <a
                href="mailto:fetecart@gmail.com"
                className="inline-flex items-center gap-1.5 text-neutral-300 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4 text-orange-400" />
                <span>fetecart@gmail.com</span>
              </a>
              <span className="text-neutral-700">•</span>
              <a
                href="https://www.fetecart.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
              >
                <span>www.fetecart.in</span>
              </a>
            </div>
          </div>

          {/* Quick Links: Courses */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Company & Courses</h4>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTo('about-us')}
                  className="text-amber-400 hover:text-amber-300 font-semibold transition-colors text-left flex items-center gap-1"
                >
                  <span>About Us (NextClass AI)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTo('courses')}
                  className="hover:text-white transition-colors text-left"
                >
                  Master Claude AI (All Indian Languages & English)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTo('courses')}
                  className="hover:text-white transition-colors text-left"
                >
                  AI for School & College Teachers
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTo('courses')}
                  className="hover:text-white transition-colors text-left"
                >
                  AI for Students & Academics
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTo('courses')}
                  className="hover:text-white transition-colors text-left"
                >
                  Generative AI for Beginners
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTo('courses')}
                  className="hover:text-white transition-colors text-left"
                >
                  Automations & AI Agents with n8n
                </button>
              </li>
            </ul>
          </div>

          {/* Digital Products */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Digital AI Products</h4>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTo('products')}
                  className="hover:text-white transition-colors text-left"
                >
                  2,500+ Curated Prompt Vault
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTo('products')}
                  className="hover:text-white transition-colors text-left"
                >
                  Educator's AI Notion Operating System
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTo('products')}
                  className="hover:text-white transition-colors text-left"
                >
                  Midjourney & Flux Photoreal Guide
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTo('products')}
                  className="hover:text-white transition-colors text-left"
                >
                  Freelance AI Consultant Agency Kit
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenStudentPortal}
                  className="text-amber-400 hover:text-amber-300 font-semibold transition-colors text-left"
                >
                  Student Dashboard Demo →
                </button>
              </li>
            </ul>
          </div>

          {/* Trust & Location */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Registered Office & Contact</h4>
            <div className="space-y-2.5 text-neutral-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <address className="not-italic text-neutral-300 leading-snug">
                  <strong className="text-white block font-semibold">Fetecart Store</strong>
                  Pattukulangara, Puduruthi,<br />
                  Thrissur, Kerala, India - 680623
                </address>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Phone className="w-4 h-4 text-orange-400 shrink-0" />
                <a href="tel:8281644058" className="text-neutral-200 hover:text-white font-mono">
                  +91 8281644058
                </a>
              </div>
              <div className="pt-1">
                <span className="inline-block px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-[11px] text-emerald-400 font-mono">
                  ● Systems Operational • Instant Delivery Active
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Razorpay Compliance Policies Bar */}
        <div id="policies" className="mt-12 pt-8 border-t border-neutral-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Mandatory Legal & Razorpay Policies
              </span>
            </div>
            <span className="text-[11px] text-neutral-500">
              Compliant with RBI Payment Aggregator Guidelines & Consumer Protection (E-Commerce) Rules
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            <a
              href="#pricing-policy"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = 'pricing-policy';
                onOpenPolicyModal?.('pricing');
              }}
              className="p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800/80 border border-neutral-800 hover:border-orange-500/40 text-left transition-all group"
            >
              <DollarSign className="w-4 h-4 text-orange-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <div className="font-semibold text-white text-xs">Pricing Policy</div>
              <div className="text-[10px] text-neutral-400">INR fee schedule & GST</div>
            </a>

            <a
              href="#shipping-policy"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = 'shipping-policy';
                onOpenPolicyModal?.('shipping');
              }}
              className="p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800/80 border border-neutral-800 hover:border-orange-500/40 text-left transition-all group"
            >
              <Truck className="w-4 h-4 text-cyan-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <div className="font-semibold text-white text-xs">Shipping Policy</div>
              <div className="text-[10px] text-neutral-400">Instant digital delivery</div>
            </a>

            <a
              href="#terms-and-conditions"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = 'terms-and-conditions';
                onOpenPolicyModal?.('terms');
              }}
              className="p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800/80 border border-neutral-800 hover:border-orange-500/40 text-left transition-all group"
            >
              <FileText className="w-4 h-4 text-amber-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <div className="font-semibold text-white text-xs">Terms & Conditions</div>
              <div className="text-[10px] text-neutral-400">User license & course access</div>
            </a>

            <a
              href="#privacy-policy"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = 'privacy-policy';
                onOpenPolicyModal?.('privacy');
              }}
              className="p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800/80 border border-neutral-800 hover:border-orange-500/40 text-left transition-all group"
            >
              <Lock className="w-4 h-4 text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <div className="font-semibold text-white text-xs">Privacy Policy</div>
              <div className="text-[10px] text-neutral-400">Data safety & encryption</div>
            </a>

            <a
              href="#refund-policy"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = 'refund-policy';
                onOpenPolicyModal?.('refund');
              }}
              className="p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800/80 border border-neutral-800 hover:border-orange-500/40 text-left transition-all group col-span-2 sm:col-span-1"
            >
              <RefreshCw className="w-4 h-4 text-rose-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <div className="font-semibold text-white text-xs">Refund Policy</div>
              <div className="text-[10px] text-neutral-400">7-day guarantee & terms</div>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-500 text-[11px]">
          <div className="flex flex-wrap items-center gap-2">
            <span>© {new Date().getFullYear()} NextClass AI. All rights reserved.</span>
            <span className="text-neutral-700">•</span>
            <span className="text-neutral-400">Official Merchant Domain: <a href="https://www.fetecart.in" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">www.fetecart.in</a></span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <button
              type="button"
              onClick={() => onOpenPolicyModal?.('about')}
              className="hover:text-neutral-300 transition-colors"
            >
              About Us
            </button>
            <button
              type="button"
              onClick={() => onOpenPolicyModal?.('terms')}
              className="hover:text-neutral-300 transition-colors"
            >
              Terms of Service
            </button>
            <button
              type="button"
              onClick={() => onOpenPolicyModal?.('privacy')}
              className="hover:text-neutral-300 transition-colors"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => onOpenPolicyModal?.('refund')}
              className="hover:text-neutral-300 transition-colors"
            >
              Cancellation / Refund
            </button>
            <button
              type="button"
              onClick={() => onOpenPolicyModal?.('shipping')}
              className="hover:text-neutral-300 transition-colors"
            >
              Shipping Policy
            </button>
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 text-neutral-400 hover:text-white transition-colors"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            {onOpenAdmin && (
              <button
                type="button"
                id="footer-admin-tiny-link"
                onClick={onOpenAdmin}
                className="opacity-30 hover:opacity-100 transition-opacity text-[10px] text-neutral-500 hover:text-neutral-300 inline-flex items-center gap-1 cursor-pointer ml-1"
                title="Staff Portal (Password Protected)"
              >
                <KeyRound className="w-2.5 h-2.5" />
                <span>Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
