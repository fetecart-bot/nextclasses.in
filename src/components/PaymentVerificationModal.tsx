import React, { useState, useEffect, FormEvent } from 'react';
import { 
  X, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MessageCircle, 
  HelpCircle, 
  ExternalLink,
  Lock,
  ArrowRight,
  Send,
  Building,
  Smartphone
} from 'lucide-react';
import { COURSES_DATA } from '../data';
import { submitPaymentClaim, PaymentClaim } from '../utils/paymentClaims';

interface PaymentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCourseId?: string;
  initialCourseTitle?: string;
  initialAmount?: number;
  initialUtr?: string;
  initialPaymentMethod?: string;
  initialPaymentApp?: string;
  initialStudentName?: string;
  initialEmail?: string;
  initialPhone?: string;
  onClaimSubmitted?: (claim: PaymentClaim) => void;
}

export const PaymentVerificationModal: React.FC<PaymentVerificationModalProps> = ({
  isOpen,
  onClose,
  initialCourseId = 'course-aissee-sainik',
  initialCourseTitle,
  initialAmount = 1799,
  initialUtr = '',
  initialPaymentMethod = 'Direct HDFC UPI (8281644058@hdfc)',
  initialPaymentApp = 'Google Pay',
  initialStudentName = '',
  initialEmail = '',
  initialPhone = '',
  onClaimSubmitted,
}) => {
  const [studentName, setStudentName] = useState(initialStudentName);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId);
  const [amount, setAmount] = useState<number>(initialAmount);
  const [utrNumber, setUtrNumber] = useState(initialUtr);
  const [paymentMethod, setPaymentMethod] = useState(initialPaymentMethod);
  const [paymentApp, setPaymentApp] = useState(initialPaymentApp);
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedClaim, setSubmittedClaim] = useState<PaymentClaim | null>(null);

  // Sync initial props
  useEffect(() => {
    if (isOpen) {
      if (initialCourseId) setSelectedCourseId(initialCourseId);
      if (initialAmount) setAmount(initialAmount);
      if (initialUtr) setUtrNumber(initialUtr);
      if (initialPaymentMethod) setPaymentMethod(initialPaymentMethod);
      if (initialPaymentApp) setPaymentApp(initialPaymentApp);
      if (initialStudentName) setStudentName(initialStudentName);
      if (initialEmail) setEmail(initialEmail);
      if (initialPhone) setPhone(initialPhone);
      setErrorMsg(null);
    }
  }, [
    isOpen,
    initialCourseId,
    initialAmount,
    initialUtr,
    initialPaymentMethod,
    initialPaymentApp,
    initialStudentName,
    initialEmail,
    initialPhone,
  ]);

  if (!isOpen) return null;

  const currentCourse = COURSES_DATA.find((c) => c.id === selectedCourseId) || COURSES_DATA[2];
  const courseTitle = initialCourseTitle || currentCourse.title;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanName = studentName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const cleanUtr = utrNumber.trim();
    const isRzp = paymentMethod.toLowerCase().includes('razorpay') || cleanUtr.toLowerCase().startsWith('pay') || cleanUtr.toLowerCase().startsWith('rzp');

    if (!cleanName) {
      setErrorMsg('Please enter student or parent full name.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Please enter a valid email address to receive your login credentials.');
      return;
    }
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit WhatsApp number (+91).');
      return;
    }
    if (cleanUtr.length < (isRzp ? 6 : 10)) {
      setErrorMsg(
        isRzp
          ? 'Please enter a valid Razorpay Payment ID (e.g. pay_...) or transaction reference.'
          : 'Please enter the valid 12-digit UPI Reference / UTR Number from your payment app receipt.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const claim = await submitPaymentClaim({
        studentName: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        courseId: selectedCourseId,
        courseTitle,
        amount: Number(amount) || currentCourse.price,
        utrNumber: cleanUtr,
        paymentMethod: paymentMethod || 'Direct HDFC UPI (8281644058@hdfc)',
        paymentApp: paymentApp || (isRzp ? 'Razorpay' : 'Google Pay'),
        notes: notes.trim(),
      });

      setSubmittedClaim(claim);
      if (onClaimSubmitted) {
        onClaimSubmitted(claim);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to record verification details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmittedClaim(null);
    setErrorMsg(null);
    onClose();
  };

  return (
    <div
      id="payment-verification-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleResetAndClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-[#0e1420] border border-[#1f2b3e] shadow-2xl text-white">
        
        {/* Modal Header */}
        <div className="sticky top-0 z-10 px-5 py-4 bg-[#0e1420]/95 backdrop-blur-md border-b border-[#1f2b3e] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white leading-tight">
                {submittedClaim
                  ? 'Payment Verification Submitted'
                  : paymentMethod.toLowerCase().includes('razorpay')
                  ? 'Submit Razorpay Payment Verification'
                  : 'Submit UPI / Payment Verification'}
              </h2>
              <span className="text-[11px] text-neutral-400">
                {submittedClaim
                  ? 'Awaiting Admin Bank & Gateway Reconciliation'
                  : 'Admin manual reconciliation before credential dispatch'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {submittedClaim ? (
            /* SUBMITTED & UNDER REVIEW CONFIRMATION SCREEN */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase block">
                      Status: Under Admin Bank Verification
                    </span>
                    <h3 className="text-base font-bold text-white leading-tight mt-0.5">
                      Claim Reference: {submittedClaim.claimCode}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed">
                  Thank you, <strong>{submittedClaim.studentName}</strong>! Your payment verification request for <strong>{submittedClaim.courseTitle}</strong> has been logged into our admin portal.
                </p>

                <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-neutral-400">
                    <span>Payment ID / UTR:</span>
                    <span className="text-amber-400 font-bold">{submittedClaim.utrNumber}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Payment Method:</span>
                    <span className="text-neutral-300 font-semibold">{submittedClaim.paymentMethod || 'Gateway / UPI'}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Amount Paid:</span>
                    <span className="text-white font-bold">₹{submittedClaim.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Payment App / Channel:</span>
                    <span className="text-neutral-300">{submittedClaim.paymentApp}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Contact Email:</span>
                    <span className="text-neutral-300 truncate max-w-[200px]">{submittedClaim.email}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>WhatsApp:</span>
                    <span className="text-neutral-300">+91 {submittedClaim.phone}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300 space-y-1.5 leading-relaxed">
                  <p className="font-semibold text-white flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-orange-400" />
                    <span>How Your Login Credentials Will Be Issued:</span>
                  </p>
                  <p>
                    To protect academic assets and prevent fraud, our accounts team manually verifies credits against our official HDFC Bank account.
                  </p>
                  <p>
                    Once confirmed (usually within <strong>15–30 minutes</strong> during business hours), your student account username & password will be automatically generated and dispatched directly to your <strong>WhatsApp (+91 {submittedClaim.phone})</strong> and <strong>Email ({submittedClaim.email})</strong>.
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2.5 pt-1">
                <a
                  href={`https://wa.me/918281644058?text=${encodeURIComponent(
                    `Hi Nextclasses Admin, I have submitted UPI payment verification for ${submittedClaim.courseTitle}.\n• Student: ${submittedClaim.studentName}\n• UTR: ${submittedClaim.utrNumber}\n• Amount: ₹${submittedClaim.amount}\nKindly verify and dispatch my login credentials.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Expedite via WhatsApp (+91 82816 44058)</span>
                </a>

                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Done & Close Window
                </button>
              </div>
            </div>
          ) : (
            /* VERIFICATION SUBMISSION FORM */
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              
              {/* Informative Guidance Banner */}
              <div className="p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/25 text-xs text-neutral-300 space-y-1">
                <span className="font-bold text-orange-400 block text-xs">
                  🛡️ Anti-Fraud Manual Verification
                </span>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  {paymentMethod.toLowerCase().includes('razorpay')
                    ? 'Submit your Razorpay Payment ID (e.g. pay_...) and contact details. Our team cross-references settlement logs before dispatching your credentials.'
                    : 'Enter your payment details and the 12-digit UTR reference from your UPI app receipt. Our administration reconciles credits in our bank account before generating and emailing your student portal login credentials.'}
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Payment Method Selector */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300 block">
                  Payment Method / Gateway *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => {
                    const newMethod = e.target.value;
                    setPaymentMethod(newMethod);
                    if (newMethod.includes('Razorpay')) {
                      setPaymentApp('Razorpay');
                    } else if (paymentApp === 'Razorpay') {
                      setPaymentApp('Google Pay');
                    }
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-orange-500 font-medium cursor-pointer"
                >
                  <option value="Razorpay Gateway (Cards / NetBanking / UPI)">
                    💳 Razorpay Gateway (Cards, UPI, NetBanking, Wallets)
                  </option>
                  <option value="Direct HDFC UPI (8281644058@hdfc)">
                    ⚡ Direct HDFC UPI (8281644058@hdfc / QR Code)
                  </option>
                  <option value="Direct Bank NEFT / IMPS">
                    🏦 Direct Bank NEFT / IMPS Transfer
                  </option>
                </select>
              </div>

              {/* Course Selection & Amount */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300 block">
                  Enrolled Course / Program *
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => {
                    setSelectedCourseId(e.target.value);
                    const matched = COURSES_DATA.find((c) => c.id === e.target.value);
                    if (matched) setAmount(matched.price);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-orange-500 font-medium cursor-pointer"
                >
                  <optgroup label="🎖️ Sainik School & Entrance" className="bg-neutral-900 text-amber-400 font-bold">
                    {COURSES_DATA.filter((c) => c.isCompetitiveExam || c.category === 'competitive_exams').map((c) => (
                      <option key={c.id} value={c.id} className="bg-neutral-950 text-white">
                        {c.title} — ₹{c.price.toLocaleString('en-IN')}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🤖 AI & Tech Academy" className="bg-neutral-900 text-purple-400 font-bold">
                    {COURSES_DATA.filter((c) => !c.isCompetitiveExam && c.category !== 'languages').map((c) => (
                      <option key={c.id} value={c.id} className="bg-neutral-950 text-white">
                        {c.title} — ₹{c.price.toLocaleString('en-IN')}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🗣️ Languages Academy" className="bg-neutral-900 text-emerald-400 font-bold">
                    {COURSES_DATA.filter((c) => c.category === 'languages').map((c) => (
                      <option key={c.id} value={c.id} className="bg-neutral-950 text-white">
                        {c.title} — ₹{c.price.toLocaleString('en-IN')}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Reference Number */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-300 block">
                    {paymentMethod.toLowerCase().includes('razorpay')
                      ? 'Razorpay Payment ID / Bank Ref No. *'
                      : '12-Digit Bank UTR / UPI Ref ID *'}
                  </label>
                  <span className="text-[10px] text-orange-400 font-bold">
                    {paymentMethod.toLowerCase().includes('razorpay') ? 'From Razorpay Confirmation' : 'From Payment Receipt'}
                  </span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder={
                    paymentMethod.toLowerCase().includes('razorpay')
                      ? 'e.g. pay_P281948192 or Bank Ref'
                      : 'e.g. 425981726481 (12 digits)'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 tracking-wider"
                />
                <p className="text-[10px] text-neutral-400">
                  {paymentMethod.toLowerCase().includes('razorpay')
                    ? 'Found in your Razorpay popup receipt, bank SMS, or transaction email.'
                    : 'Visible in Google Pay, PhonePe, or Paytm transaction details under "UPI Ref No." or "UTR".'}
                </p>
              </div>

              {/* Payment App Used & Amount Paid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Payment Gateway / App *
                  </label>
                  <select
                    value={paymentApp}
                    onChange={(e) => setPaymentApp(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    <option value="Razorpay">Razorpay Gateway (Cards/UPI)</option>
                    <option value="Google Pay">Google Pay (GPay)</option>
                    <option value="PhonePe">PhonePe</option>
                    <option value="Paytm">Paytm</option>
                    <option value="BHIM UPI">BHIM UPI</option>
                    <option value="HDFC MobileBanking">HDFC MobileBanking</option>
                    <option value="CRED">CRED</option>
                    <option value="Other Bank UPI">Other Bank App / NetBanking</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Amount Paid (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>
              </div>

              {/* Student Full Name */}
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Student / Parent Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Student Email Address */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-neutral-300 block">
                    Email Address (for portal login credentials) *
                  </label>
                  <span className="text-[10px] text-neutral-400">Confidential</span>
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rahul.sharma@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  WhatsApp Number (for password delivery & study drops) *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-neutral-700 bg-neutral-900 text-neutral-400 text-xs font-mono">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="flex-1 px-3.5 py-2.5 rounded-r-xl bg-neutral-900 border border-neutral-700 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="text-xs text-neutral-400 block mb-1">
                  Optional Notes (Sender Bank, Account Name, or comments)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Paid from SBI Account of Mr. Sharma"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-neutral-950 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting Claim to Admin...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Payment for Admin Verification</span>
                    </>
                  )}
                </button>
                <p className="text-center text-[10px] text-neutral-500 mt-2">
                  🔒 Bank reconciliation required. Official credentials are sent once verified.
                </p>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
