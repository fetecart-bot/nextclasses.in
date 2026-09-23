import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  FileText, 
  Truck, 
  RefreshCw, 
  DollarSign, 
  Lock, 
  Mail, 
  MessageCircle, 
  MapPin, 
  Phone,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Info,
  Building,
  Target
} from 'lucide-react';

export type PolicyTab = 'about' | 'terms' | 'privacy' | 'refund' | 'shipping' | 'pricing';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: PolicyTab;
}

export default function PolicyModal({
  isOpen,
  onClose,
  initialTab = 'terms',
}: PolicyModalProps) {
  const [activeTab, setActiveTab] = useState<PolicyTab>(initialTab);

  // Sync tab when initialTab changes
  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  if (!isOpen) return null;

  return (
    <div 
      id="legal-policy-modal" 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base sm:text-lg flex items-center gap-2">
                <span>Legal & Compliance Policies</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Razorpay Compliant
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Nextclasses.in • Official Domain: <span className="text-cyan-400 font-mono">www.nextclasses.in</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close legal modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center overflow-x-auto border-b border-neutral-800 bg-neutral-950/40 px-4 scrollbar-none gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'about'
                ? 'border-orange-500 text-orange-400 bg-neutral-800/40'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>About Us</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'pricing'
                ? 'border-orange-500 text-orange-400 bg-neutral-800/40'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Pricing Policy</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shipping')}
            className={`flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'shipping'
                ? 'border-orange-500 text-orange-400 bg-neutral-800/40'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Shipping & Delivery Policy</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'terms'
                ? 'border-orange-500 text-orange-400 bg-neutral-800/40'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Terms & Conditions</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-orange-500 text-orange-400 bg-neutral-800/40'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Privacy Policy</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('refund')}
            className={`flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'refund'
                ? 'border-orange-500 text-orange-400 bg-neutral-800/40'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Cancellation & Refund Policy</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs sm:text-sm leading-relaxed">
          
          {/* 0. ABOUT US */}
          {activeTab === 'about' && (
            <div id="policy-about-content" className="space-y-5">
              <div className="border-b border-neutral-800 pb-3">
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <Info className="w-5 h-5 text-orange-400" />
                  <span>About Us • Nextclasses.in (Fetecart Store)</span>
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Empowering Indian learners, educators, and professionals with practical Generative AI mastery
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <h5 className="font-bold text-white text-sm">Who We Are</h5>
                <p className="text-neutral-300">
                  <strong>Nextclasses.in</strong> is an Indian EdTech initiative operated under <strong>Fetecart Store</strong>, located in Thrissur, Kerala. We specialize in self-paced video masterclasses, interactive dashboards, and production-tested digital AI toolkits for students, teachers, competitive exam aspirants, and working professionals.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="font-bold text-white text-sm mb-1.5">Our Mission & Purpose</h5>
                  <p className="text-neutral-400 leading-relaxed">
                    Our mission is to democratize modern Artificial Intelligence workflows. Rather than focusing on abstract computer science math, we teach actionable techniques using tools like Claude 3.7 Sonnet, ChatGPT, Gemini, and open automation frameworks. We help educators generate curriculum in minutes, enable competitive exam students to practice with AI examiners, and train small businesses to automate everyday operations.
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-white text-sm mb-1.5">What We Deliver</h5>
                  <ul className="list-disc pl-5 text-neutral-400 space-y-1.5">
                    <li><strong>On-Demand Video Masterclasses:</strong> High-definition video modules, practical hands-on exercises, and prompt libraries accessible 24/7.</li>
                    <li><strong>Multilingual Instruction:</strong> Content delivered in clear, conversational English and All Indian Languages.</li>
                    <li><strong>Self-Paced Toolkits:</strong> Downloadable prompt vaults, Notion productivity systems, and lesson planning templates.</li>
                    <li><strong>Verified Certificates:</strong> Digital verifiable completion credentials with QR verification for CV and LinkedIn.</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-bold text-white text-sm mb-1.5">Registered Office & Merchant Details</h5>
                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1 text-xs text-neutral-300">
                    <p><strong className="text-white">Business Entity:</strong> Fetecart Store (Nextclasses.in)</p>
                    <p><strong className="text-white">Official Office:</strong> Pattukulangara, Puduruthi, Thrissur, Kerala, India - 680623</p>
                    <p><strong className="text-white">Customer Support Phone:</strong> +91 82816 44058</p>
                    <p><strong className="text-white">Official Email:</strong> support@nextclasses.in / fetecart@gmail.com</p>
                    <p><strong className="text-white">Authorized Domain:</strong> www.nextclasses.in</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 1. PRICING POLICY */}
          {activeTab === 'pricing' && (
            <div id="policy-pricing-content" className="space-y-5">
              <div className="border-b border-neutral-800 pb-3">
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-orange-400" />
                  <span>Pricing Policy & Fee Schedule</span>
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Last updated: January 2025 • Nextclasses.in (operated at www.nextclasses.in)
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <p className="text-neutral-300 font-medium">
                  Nextclasses.in is dedicated to providing transparent, clear, and upfront pricing for all our self-paced masterclasses, video courses, prompt toolkits, and digital educational resources.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="font-bold text-white text-sm mb-1.5">1. Currency and Taxes</h5>
                  <p className="text-neutral-400">
                    All prices displayed on our website are in <strong>Indian Rupees (INR - ₹)</strong>. Course fees and digital download fees are inclusive of applicable Goods and Services Tax (GST) unless explicitly indicated otherwise during checkout.
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-white text-sm mb-1.5">2. Fee Structure Overview</h5>
                  <ul className="list-disc pl-5 text-neutral-400 space-y-1">
                    <li><strong>Self-Paced Digital Toolkits & Prompt Vaults:</strong> Ranging from ₹499 to ₹1,499 for lifetime instant access.</li>
                    <li><strong>Self-Paced Video Masterclasses (Claude AI, Google AI Studio, Automation):</strong> Ranging from ₹499 to ₹1,999 with lifetime access and verified certificate.</li>
                    <li><strong>Institutional & Corporate Training:</strong> Custom pricing quoted upon institutional review and seat headcount.</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-bold text-white text-sm mb-1.5">3. Price Modifications</h5>
                  <p className="text-neutral-400">
                    Nextclasses.in reserves the right to modify promotional rates, launch introductory offers, or revise course pricing at any time. Any price changes will not affect students who have already enrolled or completed transactions prior to the change.
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-white text-sm mb-1.5">4. Payment Processing</h5>
                  <p className="text-neutral-400">
                    Payments are securely handled via <strong>Razorpay</strong>. We support UPI (Google Pay, PhonePe, Paytm, BHIM, CRED), Credit Cards (Visa, MasterCard, RuPay), Debit Cards, and Netbanking from all scheduled Indian banks. We do not store your sensitive card or banking credentials.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. SHIPPING AND DELIVERY POLICY */}
          {activeTab === 'shipping' && (
            <div id="policy-shipping-content" className="space-y-5">
              <div className="border-b border-neutral-800 pb-3">
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-orange-400" />
                  <span>Shipping & Delivery Policy</span>
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Last updated: January 2025 • Nextclasses.in (operated at www.nextclasses.in)
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>100% Digital Delivery — No Physical Shipping Charges</span>
                </div>
                <p className="text-neutral-300">
                  Nextclasses.in primarily offers digital educational programs, self-paced masterclasses, interactive dashboards, and downloadable assets.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="font-bold text-white text-sm mb-1.5">1. Delivery Mode & Timeline</h5>
                  <ul className="list-disc pl-5 text-neutral-400 space-y-1.5">
                    <li>
                      <strong>Instant Digital Downloads:</strong> Digital products (Prompt Vaults, Notion Templates, PDF Toolkits) are delivered <em>immediately</em> upon successful payment confirmation. Download links are displayed on your checkout screen and also transmitted to your registered email address within <strong>5 to 15 minutes</strong>.
                    </li>
                    <li>
                      <strong>Course & Student Portal Access:</strong> Credentials, student portal logins, and on-demand video masterclass access with downloadable resources are provisioned <em>instantly</em> upon registration and sent to your registered email and WhatsApp within minutes.
                    </li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-bold text-white text-sm mb-1.5">2. Shipping Charges</h5>
                  <p className="text-neutral-400">
                    Since our offerings are digital services and downloadable electronic media, there are <strong>zero (₹0) shipping or courier charges</strong> for our digital courses and toolkits.
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-white text-sm mb-1.5">3. Non-Delivery or Access Issues</h5>
                  <p className="text-neutral-400">
                    If you do not receive access credentials or download links within 1 hour of payment, please check your Spam/Junk email folder. Alternatively, you may contact our customer support team immediately at <strong className="text-white">fetecart@gmail.com</strong> or message our WhatsApp helpline at <a href="https://wa.me/918281644058?text=Hi%20NextClass%20Support,%20I%20have%20an%20order%20access%20inquiry" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline font-mono font-bold">+91 82816 44058</a> with your Razorpay Payment ID for instant manual provisioning.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3. TERMS AND CONDITIONS */}
          {activeTab === 'terms' && (
            <div id="policy-terms-content" className="space-y-5">
              <div className="border-b border-neutral-800 pb-3">
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-400" />
                  <span>Terms and Conditions</span>
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Last updated: January 2025 • Nextclasses.in (operated at www.nextclasses.in)
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="font-bold text-white text-sm mb-1.5">1. Acceptance of Terms</h5>
                  <p className="text-neutral-400">
                    By browsing, accessing, or purchasing any program or product from Nextclasses.in (operated through <span className="text-cyan-400">www.nextclasses.in</span>), you agree to comply with and be bound by these Terms and Conditions. If you disagree with any part of these terms, please do not use our service.
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-white text-sm mb-1.5">2. User Account and Access</h5>
                  <p className="text-neutral-400">
                    You are responsible for maintaining the confidentiality of your portal credentials. Sharing course materials, recording files, or portal logins with unauthorized third parties is strictly prohibited and will result in immediate termination of account access without refund.
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-white text-sm mb-1.5">3. Intellectual Property</h5>
                  <p className="text-neutral-400">
                    All curriculum designs, prompt frameworks, video recordings, slides, and proprietary guides are the intellectual property of Nextclasses.in and its creators. Enrolled students are granted a personal, non-exclusive, non-transferable license to use materials for their own educational and professional advancement. Reselling or distributing course content is unlawful.
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-white text-sm mb-1.5">4. Community Code of Conduct</h5>
                  <p className="text-neutral-400">
                    Students must maintain professional and respectful communication in all student WhatsApp groups and discussion channels. Harassment, spam, or abusive behavior will lead to termination of community privileges.
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-white text-sm mb-1.5">5. Governing Law & Jurisdiction</h5>
                  <p className="text-neutral-400">
                    These terms are governed by the laws of India. Any disputes arising out of or related to these terms shall be subject to the exclusive jurisdiction of the competent courts in Kerala, India.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 4. PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div id="policy-privacy-content" className="space-y-5">
              <div className="border-b border-neutral-800 pb-3">
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-orange-400" />
                  <span>Privacy Policy</span>
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Last updated: January 2025 • Nextclasses.in (operated at www.nextclasses.in)
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="font-bold text-white text-sm mb-1.5">1. Information We Collect</h5>
                  <p className="text-neutral-400">
                    When you enroll or purchase, we collect your name, email address, phone/WhatsApp number, and preferred language for course delivery. We also collect transactional identifiers provided by Razorpay to verify and fulfill your purchase.
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-white text-sm mb-1.5">2. How We Use Your Data</h5>
                  <ul className="list-disc pl-5 text-neutral-400 space-y-1">
                    <li>To fulfill orders and provision student portal and video access.</li>
                    <li>To invite you to student WhatsApp communities, prompt sharing channels, and resource vaults.</li>
                    <li>To issue tax invoices and official verified completion certificates.</li>
                    <li>To provide customer care and answer student questions.</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-bold text-white text-sm mb-1.5">3. Non-Disclosure & Security</h5>
                  <p className="text-neutral-400">
                    We strictly <strong>never sell, rent, or trade your personal information</strong> to third-party telemarketers or external advertisers. Your details are secured using industry-standard SSL encryption and protected servers.
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-white text-sm mb-1.5">4. Payment Security (Razorpay)</h5>
                  <p className="text-neutral-400">
                    Financial transactions are processed via Razorpay Payments (India) Private Limited, an RBI-authorized payment aggregator compliant with PCI-DSS Level 1 security standards. Nextclasses.in does not collect or retain card numbers, CVVs, or Netbanking passwords.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 5. CANCELLATION & REFUND POLICY */}
          {activeTab === 'refund' && (
            <div id="policy-refund-content" className="space-y-5">
              <div className="border-b border-neutral-800 pb-3">
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-orange-400" />
                  <span>Cancellation and Refund Policy</span>
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Last updated: January 2025 • Nextclasses.in (operated at www.nextclasses.in)
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <AlertCircle className="w-4 h-4" />
                  <span>Transparent 7-Day Guarantee on All Courses</span>
                </div>
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  We want you to be delighted with your educational experience. Please read our policy below before making a purchase.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="font-bold text-white text-sm mb-1.5">1. Self-Paced Courses & Masterclasses</h5>
                  <p className="text-neutral-400">
                    If you enroll in any course and feel that the curriculum does not meet your expectations, you may request a refund within <strong>7 days of enrollment</strong>. Upon receipt of your written request with your Razorpay Payment ID, we will initiate a 100% refund without hassle.
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-white text-sm mb-1.5">2. Digital Downloads & Toolkits</h5>
                  <p className="text-neutral-400">
                    Due to the immediate digital nature of downloadable assets (such as prompt vaults, Notion templates, and PDF guides), digital products are generally non-refundable once the files have been downloaded or duplicated. However, if you experienced technical duplication failures or duplicate billing, we will promptly refund or rectify the transaction.
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-white text-sm mb-1.5">3. Technical Access Rectification</h5>
                  <p className="text-neutral-400">
                    In the rare event of technical delivery issues or portal access downtime that cannot be resolved by our support team within 24 hours, enrolled participants will be issued an immediate 100% full refund.
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-white text-sm mb-1.5">4. Refund Processing Time</h5>
                  <p className="text-neutral-400">
                    Approved refunds are credited directly back to the original source payment method (UPI ID, original bank account, or card) via Razorpay within <strong>5 to 7 working days</strong>, adhering to standard Indian banking clearing cycles.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Merchant Contact Footer Inside Modal */}
          <div className="mt-8 p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">
              Merchant Details, Grievance Redressal & Support
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-neutral-400">
              <div className="flex items-start gap-2 sm:col-span-2">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-medium">Fetecart Store</strong>
                  <span>Pattukulangara, Puduruthi, Thrissur, Kerala, India - 680623</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-neutral-500 block">Phone Support:</span>
                  <a href="tel:8281644058" className="text-neutral-200 hover:text-white font-mono font-medium">
                    +91 82816 44058
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-neutral-500 block">Official Support Email:</span>
                  <a href="mailto:support@nextclasses.in" className="hover:text-white text-neutral-200 transition-colors">
                    support@nextclasses.in
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-neutral-800 bg-neutral-950/90 text-xs text-neutral-400">
          <span>Official Domain: <strong className="text-white">www.nextclasses.in</strong></span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
