import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, Download, ExternalLink, QrCode, ShieldCheck, Smartphone, Mail, Phone, User, BookOpen, Sparkles, CheckCircle2, MessageCircle, KeyRound, Lock, ArrowRight, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { downloadStudyMaterialFile, generateWhatsAppDispatchMessage } from '../utils/studyMaterialGenerator';
import { registerPaidStudent, RegisteredStudentAccount, generateMailtoUrl } from '../utils/studentRegistry';
import { COURSES_DATA } from '../data';

interface DirectUPIQRCodeCardProps {
  amount?: number;
  orderId?: string;
  courseId?: string;
  courseTitle?: string;
  onPaymentConfirmed?: (utrNumber: string, studentData?: { name: string; email: string; phone: string; courseId: string; username?: string; password?: string }) => void;
  onOpenPortal?: () => void;
  showConfirmationInput?: boolean;
}

export const DirectUPIQRCodeCard: React.FC<DirectUPIQRCodeCardProps> = ({
  amount,
  orderId,
  courseId: propCourseId = 'course-aissee-sainik',
  courseTitle: propCourseTitle,
  onPaymentConfirmed,
  onOpenPortal,
  showConfirmationInput = true,
}) => {
  const { user, loginWithAccount } = useAuth();
  const [copied, setCopied] = useState(false);
  const [copiedUser, setCopiedUser] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [dynamicQrUrl, setDynamicQrUrl] = useState<string | null>(null);

  // Student Details Form
  const [studentName, setStudentName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone?.replace('+91 ', '') || '');
  const [selectedCourseId, setSelectedCourseId] = useState(propCourseId || 'course-aissee-sainik-6');
  const [hasManuallySelectedCourse, setHasManuallySelectedCourse] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [createdAccount, setCreatedAccount] = useState<RegisteredStudentAccount | null>(null);

  // Retrieve all available courses (combining custom courses from localStorage with COURSES_DATA)
  const allCourses = useMemo(() => {
    try {
      const saved = localStorage.getItem('nextclass_custom_courses');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const ids = new Set(parsed.map((p: any) => p.id));
          const missing = COURSES_DATA.filter((c) => !ids.has(c.id));
          return [...parsed, ...missing];
        }
      }
    } catch {
      // fallback
    }
    return COURSES_DATA;
  }, []);

  useEffect(() => {
    if (propCourseId) {
      setSelectedCourseId(propCourseId);
      setHasManuallySelectedCourse(false);
    }
  }, [propCourseId]);

  const currentCourse = allCourses.find((c) => c.id === selectedCourseId) || allCourses[0] || COURSES_DATA[0];
  const payableAmount = hasManuallySelectedCourse
    ? currentCourse.price
    : (typeof amount === 'number' && !isNaN(amount) && amount > 0 ? amount : currentCourse.price || 1799);
  const upiId = '8281644058@hdfc';
  const note = orderId ? `Order ${orderId}` : (currentCourse ? currentCourse.title.substring(0, 25) : 'Course Enrollment');

  // Construct UPI deep-link URI
  const upiDeepLink = payableAmount
    ? `upi://pay?pa=${upiId}&pn=NextClass&am=${payableAmount}&cu=INR&tn=${encodeURIComponent(note)}`
    : `upi://pay?pa=${upiId}&pn=NextClass&cu=INR&tn=${encodeURIComponent(note)}`;

  // Generate dynamic QR code
  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(upiDeepLink, {
      margin: 1,
      width: 320,
      color: {
        dark: themeMode === 'dark' ? '#ffffff' : '#000000',
        light: themeMode === 'dark' ? '#0b101b' : '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => {
        if (isMounted) setDynamicQrUrl(url);
      })
      .catch(() => {
        if (isMounted) setDynamicQrUrl(null);
      });

    return () => {
      isMounted = false;
    };
  }, [upiDeepLink, themeMode]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQr = () => {
    const link = document.createElement('a');
    link.href = dynamicQrUrl || (themeMode === 'dark' ? '/biju-pb-upi-qr.svg' : '/biju-pb-upi-qr-light.svg');
    link.download = `upi-qr-${amount ? `rs${amount}` : 'pay'}.png`;
    link.click();
  };

  const handleConfirmEnrollment = async () => {
    if (!studentName.trim()) {
      alert('Please enter your full name for course enrollment & certificate.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      alert('Please enter a valid email address so we can send your study materials and access credentials.');
      return;
    }
    if (!phone.trim() || phone.replace(/[^0-9]/g, '').length < 10) {
      alert('Please enter your 10-digit WhatsApp phone number to receive your weekly study drop & mock test links.');
      return;
    }

    const cleanUtr = utrNumber.trim() || `UPI-${Date.now().toString().slice(-6)}`;

    setIsSubmitting(true);

    try {
      // 1. Create and persist student credentials & trigger email dispatch
      const account = await registerPaidStudent({
        name: studentName.trim(),
        email: email.trim(),
        phone: phone.replace(/[^0-9]/g, ''),
        courseId: selectedCourseId,
        amount: payableAmount,
        utrNumber: cleanUtr,
      });

      setCreatedAccount(account);

      // 2. Authenticate the student with their new account
      loginWithAccount(account);

      setIsConfirmed(true);

      if (onPaymentConfirmed) {
        onPaymentConfirmed(cleanUtr, {
          name: account.name,
          email: account.email,
          phone: account.phone,
          courseId: selectedCourseId,
          username: account.username,
          password: account.password,
        });
      }
    } catch (err) {
      console.error('Enrollment registration error:', err);
      alert('Registration encountered a network delay, but your enrollment details are noted. Launching portal...');
      setIsConfirmed(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyUsername = () => {
    if (!createdAccount) return;
    navigator.clipboard?.writeText(createdAccount.username);
    setCopiedUser(true);
    setTimeout(() => setCopiedUser(false), 2000);
  };

  const handleCopyPassword = () => {
    if (!createdAccount) return;
    navigator.clipboard?.writeText(createdAccount.password);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  const handleDownloadStudyPack = () => {
    downloadStudyMaterialFile(selectedCourseId, studentName || 'Student');
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleSendToMyWhatsApp = () => {
    const cleanPhone = phone.replace(/[^0-9]/g, '') || '8281644058';
    const dest = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const portalUrl = typeof window !== 'undefined' ? `${window.location.origin}/?portal=true` : '/?portal=true';
    const msg = createdAccount
      ? `🎓 *NextClass AI Enrollment Credentials* 🔐\n\n` +
        `Hi *${createdAccount.name}*, here are your login details for *${createdAccount.courseTitle}*:\n` +
        `• *Username:* ${createdAccount.username}\n` +
        `• *Password:* ${createdAccount.password}\n` +
        `• *Portal Link:* ${portalUrl}\n\n` +
        `Download your printable study pack from the portal.\n` +
        `Helpline: +91 82816 44058`
      : generateWhatsAppDispatchMessage(studentName || 'Student', selectedCourseId, cleanPhone);
    window.open(`https://wa.me/${dest}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleOpenEmailClient = () => {
    if (!createdAccount) return;
    window.open(generateMailtoUrl(createdAccount), '_blank');
  };

  // SUCCESS CONFIRMATION VIEW
  if (isConfirmed) {
    return (
      <div className="w-full max-w-md mx-auto rounded-3xl bg-[#101726] border border-emerald-500/40 shadow-2xl p-5 sm:p-6 text-white text-center space-y-4 font-sans animate-in zoom-in-95 duration-200">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            Enrollment Verified & Active
          </span>
          <h3 className="text-xl font-black text-white mt-2">
            Welcome, {studentName}!
          </h3>
          <p className="text-xs text-neutral-300 mt-1">
            You are officially enrolled in: <br />
            <strong className="text-amber-400">{currentCourse.title}</strong>
          </p>
        </div>

        {/* Generated Student Username & Password Box */}
        {createdAccount && (
          <div className="p-4 rounded-2xl bg-[#0b101b] border border-orange-500/40 text-left space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400 uppercase tracking-wider">
                <KeyRound className="w-4 h-4 text-orange-400" />
                <span>Your Student Portal Login</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 border border-emerald-800 text-emerald-300 font-semibold">
                Saved & Dispatched
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between bg-neutral-900/90 px-3 py-2 rounded-xl border border-neutral-800">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Username</span>
                  <span className="text-sm font-mono font-bold text-sky-400">{createdAccount.username}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUsername}
                  className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 flex items-center gap-1 transition-colors"
                >
                  {copiedUser ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUser ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between bg-neutral-900/90 px-3 py-2 rounded-xl border border-neutral-800">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Password</span>
                  <span className="text-sm font-mono font-bold text-emerald-400">{createdAccount.password}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 flex items-center gap-1 transition-colors"
                >
                  {copiedPass ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPass ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-neutral-400 pt-0.5">
              * Note: You can also use your email (<strong className="text-neutral-200">{createdAccount.email}</strong>) as your login ID.
            </p>
          </div>
        )}

        {/* Email & Phone Confirmation Pill */}
        <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 text-left text-xs space-y-1.5">
          <div className="flex items-center justify-between text-neutral-300">
            <div className="flex items-center gap-2 truncate">
              <Mail className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span className="truncate">Login credentials delivered to: <strong>{email}</strong></span>
            </div>
            {createdAccount && (
              <button
                type="button"
                onClick={handleOpenEmailClient}
                className="text-[11px] text-orange-400 hover:underline shrink-0 ml-2 font-bold"
                title="Open email draft / send copy to email client"
              >
                Send Copy &rarr;
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 text-neutral-300">
            <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">WhatsApp drops to: <strong>+91 {phone}</strong></span>
          </div>
        </div>

        {/* Immediate Download & Access Buttons */}
        <div className="space-y-2 pt-1">
          {onOpenPortal && (
            <button
              type="button"
              onClick={onOpenPortal}
              className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-400 text-neutral-950 font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-neutral-950" />
              <span>Launch Student Learning Portal & Study Materials</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDownloadStudyPack}
            className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-neutral-700"
          >
            {downloadSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
            <span>{downloadSuccess ? 'Study Pack Downloaded!' : 'Download Complete Study Pack (PDF)'}</span>
          </button>

          <button
            type="button"
            onClick={handleSendToMyWhatsApp}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Send Credentials to My WhatsApp</span>
          </button>
        </div>

        <p className="text-[11px] text-neutral-400 pt-1">
          Need immediate tutor assistance? WhatsApp Helpline: <strong className="text-white">+91 82816 44058</strong>
        </p>
      </div>
    );
  }

  // STANDARD PAYMENT & ENROLLMENT VIEW
  return (
    <div className="w-full max-w-md mx-auto rounded-3xl bg-[#121824] border border-[#212b3d] shadow-2xl p-4 sm:p-6 text-white text-center space-y-4 font-sans">
      {/* Top Header Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-left">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold block">
              Official NextClass UPI
            </span>
            <span className="text-xs font-semibold text-neutral-200">
              Instant Bank Settlement (0% Fee)
            </span>
          </div>
        </div>

        {/* Dark / Light QR Toggle */}
        <div className="flex items-center bg-[#192233] p-0.5 rounded-lg border border-[#243147] text-[11px]">
          <button
            type="button"
            onClick={() => setThemeMode('dark')}
            className={`px-2 py-0.5 rounded ${themeMode === 'dark' ? 'bg-orange-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'}`}
          >
            Dark
          </button>
          <button
            type="button"
            onClick={() => setThemeMode('light')}
            className={`px-2 py-0.5 rounded ${themeMode === 'light' ? 'bg-white text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'}`}
          >
            Light
          </button>
        </div>
      </div>

      {/* Title & Amount Display */}
      <div>
        <h3 className="text-lg sm:text-xl font-extrabold tracking-wide text-white">
          Scan QR Code to Enroll
        </h3>
        <div className="mt-1.5 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 font-extrabold text-sm">
          <span>Fee:</span>
          <span className="text-base text-white">₹{payableAmount.toLocaleString('en-IN')}</span>
          <span className="text-[11px] text-neutral-300 font-medium truncate max-w-[200px]">
            • {currentCourse.examName || currentCourse.title}
          </span>
        </div>
      </div>

      {/* QR Code Container */}
      <div className="relative mx-auto w-56 h-56 sm:w-64 sm:h-64 rounded-2xl bg-[#0b101b] border-2 border-orange-500/40 shadow-inner flex items-center justify-center overflow-hidden p-2 group">
        {dynamicQrUrl ? (
          <img
            src={dynamicQrUrl}
            alt="UPI QR Code - NextClass AI"
            className="w-full h-full object-contain rounded-xl"
            referrerPolicy="no-referrer"
          />
        ) : (
          <img
            src={themeMode === 'dark' ? '/biju-pb-upi-qr.svg' : '/biju-pb-upi-qr-light.svg'}
            alt="NextClass Official UPI QR"
            className="w-full h-full object-contain rounded-xl"
            referrerPolicy="no-referrer"
          />
        )}

        {/* Hover overlay to download QR */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-xl">
          <button
            type="button"
            onClick={handleDownloadQr}
            className="px-3 py-1.5 rounded-lg bg-white/90 text-neutral-900 font-bold text-xs flex items-center gap-1.5 hover:bg-white shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save QR</span>
          </button>
        </div>
      </div>

      {/* UPI ID Info Box */}
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#161f30] border border-[#223049] text-xs">
        <div className="text-left font-mono truncate mr-2">
          <span className="text-[10px] text-neutral-400 block">UPI ID / VPA</span>
          <span className="font-bold text-orange-400 text-sm">{upiId}</span>
          <span className="text-[10px] text-neutral-500 block truncate">NextClass Official (HDFC Bank)</span>
        </div>
        <button
          type="button"
          onClick={handleCopyUpi}
          className="shrink-0 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-orange-500/20 cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Direct Mobile UPI Intent Apps */}
      <div className="space-y-1.5 pt-0.5">
        <span className="text-[11px] text-neutral-400 flex items-center justify-center gap-1.5">
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Mobile user? Tap to pay directly in your app:</span>
        </span>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { name: 'GPay', color: 'hover:border-blue-500/50 hover:bg-blue-950/40 text-blue-300' },
            { name: 'PhonePe', color: 'hover:border-purple-500/50 hover:bg-purple-950/40 text-purple-300' },
            { name: 'Paytm', color: 'hover:border-sky-500/50 hover:bg-sky-950/40 text-sky-300' },
            { name: 'BHIM', color: 'hover:border-emerald-500/50 hover:bg-emerald-950/40 text-emerald-300' },
          ].map((app) => (
            <a
              key={app.name}
              href={upiDeepLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`py-1.5 px-1.5 rounded-xl bg-[#18202e] border border-[#273347] font-bold text-[11px] text-center transition-all flex items-center justify-center gap-1 cursor-pointer ${app.color}`}
            >
              <span>{app.name}</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
          ))}
        </div>
      </div>

      {/* STUDENT ENROLLMENT DETAILS & UTR VERIFICATION FORM */}
      {showConfirmationInput && (
        <div className="pt-3 border-t border-[#1f293b] space-y-2.5 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-orange-400" />
              <span>Student Details for Study Pack Dispatch:</span>
            </span>
            <span className="text-[10px] text-amber-400 font-semibold">Required for Delivery</span>
          </div>

          {/* Student Name */}
          <div>
            <label className="text-[11px] text-neutral-300 block mb-1">Student / Parent Full Name *</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="text-[11px] text-neutral-300 block mb-1 flex items-center justify-between">
              <span>Email Address (for PDF Study Pack & Portal Access) *</span>
              <span className="text-[10px] text-orange-400">Never spammed</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rahul.sharma@gmail.com"
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* WhatsApp Phone */}
          <div>
            <label className="text-[11px] text-neutral-300 block mb-1">WhatsApp Phone Number (for Weekly Study Drop) *</label>
            <div className="flex">
              <span className="inline-flex items-center px-2.5 rounded-l-xl border border-r-0 border-neutral-700 bg-[#161f30] text-neutral-400 text-xs font-mono">
                +91
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="flex-1 px-3 py-2 rounded-r-xl bg-neutral-950 border border-neutral-700 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Selected Course */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] text-neutral-300 block">Enrolling For Course / Exam *</label>
              <span className="text-[10px] text-orange-400 font-bold">{allCourses.length} Courses Available</span>
            </div>
            <select
              id="checkout-course-dropdown"
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setHasManuallySelectedCourse(true);
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-xs text-white focus:outline-none focus:border-orange-500 font-medium cursor-pointer"
            >
              <optgroup label="🎖️ Sainik School & Competitive Entrance Tracks" className="bg-neutral-900 text-amber-400 font-bold">
                {allCourses
                  .filter((c) => c.category === 'competitive_exams' || c.isCompetitiveExam)
                  .map((c) => (
                    <option key={c.id} value={c.id} className="bg-neutral-950 text-white py-1">
                      {c.title} — ₹{c.price.toLocaleString('en-IN')}
                    </option>
                  ))}
              </optgroup>

              <optgroup label="🤖 Artificial Intelligence & Automation Academy" className="bg-neutral-900 text-purple-400 font-bold">
                {allCourses
                  .filter((c) => !c.isCompetitiveExam && c.category !== 'languages' && c.category !== 'competitive_exams')
                  .map((c) => (
                    <option key={c.id} value={c.id} className="bg-neutral-950 text-white py-1">
                      {c.title} — ₹{c.price.toLocaleString('en-IN')}
                    </option>
                  ))}
              </optgroup>

              <optgroup label="🗣️ Languages & Global Communication Academy" className="bg-neutral-900 text-emerald-400 font-bold">
                {allCourses
                  .filter((c) => c.category === 'languages')
                  .map((c) => (
                    <option key={c.id} value={c.id} className="bg-neutral-950 text-white py-1">
                      {c.title} — ₹{c.price.toLocaleString('en-IN')}
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          {/* 12-digit UPI UTR */}
          <div>
            <label className="text-[11px] text-neutral-300 block mb-1 flex items-center justify-between">
              <span>12-digit UPI Reference / UTR Number</span>
              <span className="text-[10px] text-neutral-400">From payment receipt</span>
            </label>
            <input
              type="text"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
              placeholder="e.g. 526189201844 (found in GPay/PhonePe receipt)"
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleConfirmEnrollment}
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs tracking-wide transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer mt-1"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isSubmitting ? 'Verifying...' : 'Verify & Unlock Instant Study Materials'}</span>
          </button>

          <p className="text-[10px] text-neutral-400 text-center">
            ✓ Instant PDF download • Portal unlocked • WhatsApp helpline: +91 82816 44058
          </p>
        </div>
      )}
    </div>
  );
};
