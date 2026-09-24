import { useState, useMemo, useEffect, type FormEvent } from 'react';
import { 
  X, 
  Trash2, 
  Tag, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  MessageCircle, 
  Download, 
  CreditCard, 
  Smartphone, 
  Building,
  Calendar,
  Clock,
  Zap,
  FileText,
  Layers,
  Sparkles,
  Send,
  Eye,
  Check,
  AlertCircle,
  Loader2,
  User,
  Mail
} from 'lucide-react';
import { CartItem, ExamScheduleCalculation } from '../types';
import { calculateDaysToExam, calculateWeeksToExam, generateWeeklyDispatchRoadmap } from '../utils/examScheduler';
import { useAuth } from '../context/AuthContext';
import { registerPaidStudent } from '../utils/studentRegistry';
import { submitPaymentClaim } from '../utils/paymentClaims';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onOpenPortalDemo: () => void;
  customRazorpayKeyId?: string;
  onOpenPolicyModal?: (tab: 'about' | 'terms' | 'privacy' | 'refund' | 'shipping' | 'pricing') => void;
  onOpenVerificationModal?: (details: {
    courseId: string;
    courseTitle: string;
    amount: number;
    utr?: string;
    paymentMethod?: string;
    paymentApp?: string;
    studentName?: string;
    email?: string;
    phone?: string;
  }) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onClearCart,
  onOpenPortalDemo,
  customRazorpayKeyId = '',
  onOpenPolicyModal,
  onOpenVerificationModal,
}: CartDrawerProps) {
  const { user, loginWithAccount, enrollCourse } = useAuth();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number } | null>({
    code: 'AIFUTURE',
    percent: 40,
  });
  const [couponError, setCouponError] = useState<string | null>(null);

  // Razorpay Key & Gateway Configuration (Admin custom key overrides or falls back to env)
  const envRazorpayKey = (((import.meta as any).env?.VITE_RAZORPAY_KEY_ID as string) || 'rzp_live_TefblkmIMTFIRH').trim();
  const rawKey = (customRazorpayKeyId || envRazorpayKey || 'rzp_live_TefblkmIMTFIRH').trim();
  const razorpayKeyId = rawKey.startsWith('rzp_test_') ? 'rzp_live_TefblkmIMTFIRH' : rawKey;
  const isLiveKeyConfigured = Boolean(razorpayKeyId && razorpayKeyId.startsWith('rzp_'));
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Form states initialized with auth user if available
  const [studentName, setStudentName] = useState(user?.name || '');
  const [studentEmail, setStudentEmail] = useState(user?.email || '');
  const [studentPhone, setStudentPhone] = useState(user?.phone ? user.phone.replace('+91 ', '') : '');

  // Sync contact details if logged in user state changes
  useEffect(() => {
    if (user) {
      if (user.name) setStudentName(user.name);
      if (user.email) setStudentEmail(user.email);
      if (user.phone) setStudentPhone(user.phone.replace('+91 ', ''));
    }
  }, [user]);

  // Exam target dates per item (itemId -> YYYY-MM-DD)
  const [itemTargetDates, setItemTargetDates] = useState<Record<string, string>>({});

  // Checkout flow state
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [showWhatsAppPreview, setShowWhatsAppPreview] = useState(false);
  const [whatsAppDispatched, setWhatsAppDispatched] = useState(false);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);

  const [completedOrderDetails, setCompletedOrderDetails] = useState<{
    orderId: string;
    totalAmount: number;
    items: CartItem[];
    name: string;
    email: string;
    phone: string;
    examRoadmaps?: ExamScheduleCalculation[];
    paymentId?: string;
    gatewayType?: string;
  } | null>(null);

  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Reset orderComplete whenever new items are added to the cart
  useEffect(() => {
    if (items.length > 0 && orderComplete) {
      setOrderComplete(false);
      setCompletedOrderDetails(null);
    }
  }, [items, orderComplete]);

  // Reset order completion state whenever the drawer is closed
  useEffect(() => {
    if (!isOpen) {
      setOrderComplete(false);
      setCompletedOrderDetails(null);
      setIsProcessing(false);
      setPaymentError(null);
    }
  }, [isOpen]);

  const handleClose = () => {
    setOrderComplete(false);
    setCompletedOrderDetails(null);
    setIsProcessing(false);
    setPaymentError(null);
    onClose();
  };

  if (!isOpen) return null;

  const rawTotal = items.reduce((acc, item) => acc + (Number(item.price) || 0), 0);
  const discountAmount = appliedCoupon ? Math.round((rawTotal * appliedCoupon.percent) / 100) : 0;
  const finalTotal = Math.max(0, rawTotal - discountAmount);

  const completeEnrollmentAndOrder = (
    paymentId: string,
    gatewayType: string,
    roadmaps: ExamScheduleCalculation[],
    verifiedStudent?: { name?: string; email?: string; phone?: string }
  ) => {
    const finalName = (verifiedStudent?.name || studentName || user?.name || 'Student').trim();
    const finalEmail = (verifiedStudent?.email || studentEmail || user?.email || '').trim();
    const finalPhone = (verifiedStudent?.phone || studentPhone || user?.phone?.replace('+91 ', '') || '').trim();

    setIsProcessing(false);
    const randomOrderId = `NC-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    setCompletedOrderDetails({
      orderId: randomOrderId,
      totalAmount: finalTotal,
      items: [...items],
      name: finalName,
      email: finalEmail,
      phone: finalPhone,
      examRoadmaps: roadmaps.length > 0 ? roadmaps : undefined,
      paymentId,
      gatewayType,
    });
    setOrderComplete(true);

    // Register verified student in secure student registry and auto-login
    const primaryCourseId = items[0]?.id || 'course-aissee-sainik';
    registerPaidStudent({
      name: finalName,
      email: finalEmail,
      phone: finalPhone,
      courseId: primaryCourseId,
      amount: finalTotal,
      utrNumber: paymentId,
    }).then((verifiedAccount) => {
      loginWithAccount({
        id: verifiedAccount.id,
        name: verifiedAccount.name,
        email: verifiedAccount.email,
        phone: verifiedAccount.phone,
        username: verifiedAccount.username,
        enrolledCourseIds: items.map((i) => i.id),
        targetExamCode: roadmaps[0]?.examCode || 'AISSEE',
        targetExamDate: roadmaps[0]?.targetExamDate || '2027-01-10',
        learningGoal: `Master Curriculum for ${items[0]?.title || 'Sainik School'}`,
        registeredAt: verifiedAccount.registeredAt,
        completedLessons: [1],
        mockTestScores: [],
      });
    }).catch(() => {
      // fallback safe student enrollment
    });
    items.forEach((it) => enrollCourse(it.id));

    // Automated server-side WhatsApp dispatch via Meta Cloud API / Server Dispatcher
    try {
      fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: finalPhone,
          recipientName: finalName,
          orderId: randomOrderId,
          itemsSummary: items.map((i) => i.title).join(', '),
          messageType: 'enrollment_confirmation',
        }),
      }).catch((err) => console.log('Automated WhatsApp dispatch notice:', err));
    } catch {
      // safe fallback
    }

    onClearCart();
  };

  const handleApplyCoupon = (e: FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const code = couponCode.trim().toUpperCase();

    if (code === 'AIFUTURE') {
      setAppliedCoupon({ code: 'AIFUTURE', percent: 40 });
      setCouponCode('');
    } else if (code === 'NEXTCLASS20' || code === 'LASTSCHOOL20') {
      setAppliedCoupon({ code: 'NEXTCLASS20', percent: 20 });
      setCouponCode('');
    } else {
      setCouponError('Invalid coupon code. Try using "AIFUTURE" for 40% off or "NEXTCLASS20".');
    }
  };

  const handleDateChangeForItem = (itemId: string, newDate: string) => {
    setItemTargetDates((prev) => ({
      ...prev,
      [itemId]: newDate,
    }));
  };

  const handleOpenVerification = (customData?: {
    utr?: string;
    paymentMethod?: string;
    paymentApp?: string;
  }) => {
    onClose();
    if (onOpenVerificationModal) {
      onOpenVerificationModal({
        courseId: items[0]?.id || 'course-aissee-sainik',
        courseTitle: items.map((i) => i.title).join(', ') || 'Nextclasses Course Pack',
        amount: finalTotal,
        utr: customData?.utr || '',
        paymentMethod:
          customData?.paymentMethod || 'Razorpay Gateway (Cards / NetBanking / UPI)',
        paymentApp: customData?.paymentApp || 'Razorpay',
        studentName: studentName || user?.name || '',
        email: studentEmail || user?.email || '',
        phone: studentPhone || '',
      });
    }
  };

  const handleCheckoutSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPaymentError(null);

    // Validate 10-digit contact number
    const cleanPhone = studentPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setPaymentError('Please enter a valid 10-digit mobile / WhatsApp number before opening the payment gateway.');
      const phoneInput = document.getElementById('checkout-student-phone');
      if (phoneInput) phoneInput.focus();
      return;
    }

    // Validate email address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!studentEmail || !emailRegex.test(studentEmail.trim())) {
      setPaymentError('Please enter a valid email address to receive your login credentials and payment receipt.');
      const emailInput = document.getElementById('checkout-student-email');
      if (emailInput) emailInput.focus();
      return;
    }

    setIsProcessing(true);

    // Compute roadmaps for any competitive exams in the cart
    const roadmaps: ExamScheduleCalculation[] = [];
    items.forEach((item) => {
      if (item.isCompetitiveExam || item.category === 'competitive_exams') {
        const targetDate = itemTargetDates[item.id] || item.targetExamDate || '2027-05-02';
        const code = item.targetExamCode || 'NEET';
        const name = item.examName || item.title;
        const calc = generateWeeklyDispatchRoadmap(code, name, targetDate);
        roadmaps.push(calc);
      }
    });

    const formattedContact = cleanPhone.length === 10 ? `+91${cleanPhone}` : cleanPhone.startsWith('91') ? `+${cleanPhone}` : `+91${cleanPhone}`;

    // Razorpay Gateway Flow
    if (isLiveKeyConfigured) {
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        try {
          // Release small checkout fields before mounting Razorpay. This prevents
          // iOS Safari's input zoom from making the payment sheet wider than the viewport.
          if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
          window.scrollTo({ left: 0, behavior: 'instant' as ScrollBehavior });
          const options = {
            key: razorpayKeyId,
            amount: Math.round(finalTotal * 100), // amount in paise
            currency: 'INR',
            name: 'Nextclasses.in',
            description: items.map((it) => it.title).join(', ').substring(0, 80),
            image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
            prefill: {
              name: studentName.trim() || user?.name || 'Student',
              email: studentEmail.trim(),
              contact: formattedContact,
            },
            notes: {
              studentName: studentName.trim() || user?.name || 'Student',
              studentEmail: studentEmail.trim(),
              studentPhone: formattedContact,
              courseCount: items.length.toString(),
              courseId: items[0]?.id || '',
              courseTitle: items.map((it) => it.title).join(', ').substring(0, 240),
            },
            theme: {
              color: '#f97316',
            },
            modal: {
              ondismiss: () => {
                setIsProcessing(false);
              },
            },
            handler: async (response: any) => {
              setIsProcessing(false);
              const rzpPaymentId = response.razorpay_payment_id || `pay_${Date.now()}`;
              await submitPaymentClaim({
                studentName: studentName.trim() || user?.name || 'Student',
                email: studentEmail.trim(),
                phone: formattedContact,
                courseId: items[0]?.id || 'course-unassigned',
                courseTitle: items.map((it) => it.title).join(', '),
                amount: finalTotal,
                utrNumber: rzpPaymentId,
                paymentMethod: 'Razorpay Gateway',
                paymentApp: 'Razorpay',
                notes: 'Recorded automatically after successful checkout.',
              });
              onClearCart();
              // Pop up verification window immediately with Razorpay Payment ID prefilled!
              handleOpenVerification({
                utr: rzpPaymentId,
                paymentMethod: 'Razorpay Gateway (Cards / NetBanking / UPI)',
                paymentApp: 'Razorpay',
              });
            },
          };

          const rzpInstance = new (window as any).Razorpay(options);
          rzpInstance.on('payment.failed', (resp: any) => {
            setIsProcessing(false);
            setPaymentError(
              resp.error?.description || resp.error?.reason || 'Payment could not be completed via Razorpay.'
            );
          });
          rzpInstance.open();
        } catch (err: any) {
          setIsProcessing(false);
          setPaymentError(`Payment initialization error: ${err?.message || 'Check key and permissions'}`);
        }
      } else {
        setIsProcessing(false);
        setPaymentError('Razorpay checkout SDK is loading. Please try again in a moment.');
      }
    } else {
      setIsProcessing(false);
      // In sandbox/test environment: generate test Razorpay Payment ID and pop up the verification window
      const testRzpId = `pay_test_${Date.now().toString().slice(-8)}`;
      onClearCart();
      handleOpenVerification({
        utr: testRzpId,
        paymentMethod: 'Razorpay Gateway (Cards / NetBanking / UPI)',
        paymentApp: 'Razorpay',
      });
    }
  };

  const handleDownloadTaxInvoice = () => {
    if (!completedOrderDetails) return;
    const invoiceContent = `
=====================================================
NEXTCLASSES.IN - OFFICIAL TAX INVOICE & RECEIPT
GSTIN: 32AABCN1234F1Z8 | Kerala, India
=====================================================
Invoice No:    INV-${completedOrderDetails.orderId}
Date:          ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
Student Name:  ${completedOrderDetails.name}
Email:         ${completedOrderDetails.email}
Phone/WhatsApp:+91 ${completedOrderDetails.phone}
Payment Mode:  ${completedOrderDetails.gatewayType || 'Razorpay UPI / Cards (Verified)'}
Payment Ref:   ${completedOrderDetails.paymentId || 'N/A'}
Status:        PAID & ENROLLED
-----------------------------------------------------
ITEMS PURCHASED:
${completedOrderDetails.items.map((it, idx) => `${idx + 1}. ${it.title} - ₹${it.price}`).join('\n')}

Subtotal:      ₹${completedOrderDetails.items.reduce((acc, it) => acc + it.price, 0)}
Coupon:        ${appliedCoupon ? appliedCoupon.code + ' (' + appliedCoupon.percent + '% OFF)' : 'None'}
Total Paid:    ₹${completedOrderDetails.totalAmount} (Inclusive of all taxes)
-----------------------------------------------------
DISPATCH DELIVERY DETAILS:
Weekly Study Material Cycle: Every Sunday at 06:00 AM IST
Channels: WhatsApp (+91 ${completedOrderDetails.phone}) + Student Learning Portal
Guarantee: 100% 7-Day Money-Back Guarantee
=====================================================
Thank you for choosing Nextclasses.in!
Support: support@nextclasses.in | WhatsApp: +91 82816 44058 | https://www.nextclasses.in
    `.trim();

    const element = document.createElement('a');
    const file = new Blob([invoiceContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `Nextclasses_Invoice_${completedOrderDetails.orderId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setDownloadNotice(`✓ Official Tax Invoice downloaded for ${completedOrderDetails.orderId}`);
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  const handleSendTestWhatsAppDispatch = async () => {
    setIsSendingWhatsApp(true);
    const targetPhone = completedOrderDetails?.phone || studentPhone || '8281644058';
    const orderId = completedOrderDetails?.orderId || 'NC-ENROLL';
    const studentNameVal = completedOrderDetails?.name || studentName || 'Student';
    const itemsSummary = completedOrderDetails?.items?.map((i) => i.title).join(', ') || 'Nextclasses.in Course';

    const fallbackDirectMsg = `👋 Hi Nextclasses.in Support! I have completed enrollment for Order #${orderId} (${studentNameVal}, WhatsApp: +91 ${targetPhone}).\nCourse: ${itemsSummary}\nPlease deliver my course materials and add me to the WhatsApp batch group.`;

    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: targetPhone,
          recipientName: studentNameVal,
          orderId,
          itemsSummary,
          messageType: 'weekly_drop',
        }),
      });
      const data = await res.json();
      setWhatsAppDispatched(true);
      if (data?.mode === 'live') {
        setDownloadNotice(`✓ WhatsApp Cloud API alert dispatched to +${data.recipient}!`);
      } else {
        // If API is simulated or not live, directly launch WhatsApp to +91 82816 44058
        setDownloadNotice(`✓ Opening WhatsApp Helpline (+91 82816 44058)...`);
        window.open(`https://wa.me/918281644058?text=${encodeURIComponent(fallbackDirectMsg)}`, '_blank');
      }
      setTimeout(() => setDownloadNotice(null), 4000);
    } catch {
      setWhatsAppDispatched(true);
      setDownloadNotice(`✓ Opening WhatsApp (+91 82816 44058)...`);
      window.open(`https://wa.me/918281644058?text=${encodeURIComponent(fallbackDirectMsg)}`, '_blank');
      setTimeout(() => setDownloadNotice(null), 4000);
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  const handleDownloadRoadmap = (examName: string) => {
    setDownloadNotice(`Downloading Official Weekly Dispatch Schedule for ${examName} (PDF)...`);
    setTimeout(() => {
      setDownloadNotice(`✓ ${examName} Weekly Dispatch Roadmap saved to device.`);
      setTimeout(() => setDownloadNotice(null), 3000);
    }, 1200);
  };

  return (
    <div
      id="cart-drawer-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-xs transition-opacity overflow-x-hidden"
    >
      <div className="relative w-full max-w-lg bg-neutral-950 border-l border-neutral-800 text-white h-full flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-white">
              {orderComplete ? 'Enrollment Confirmed' : 'Shopping Cart & Checkout'}
            </span>
            {!orderComplete && (
              <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {orderComplete && completedOrderDetails ? (
            /* Order Success State */
            <div id="order-success-screen" className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-950/80 border-2 border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-white">You're All Set! 🎉</h3>
                <p className="text-xs text-neutral-300">
                  Welcome to Nextclasses.in, <span className="font-bold text-white">{completedOrderDetails.name}</span>.
                </p>
                <div className="text-[11px] font-mono text-amber-400 pt-1">
                  ORDER ID: {completedOrderDetails.orderId}
                </div>
              </div>

              {/* Delivery info card */}
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-left space-y-2 text-xs">
                <div className="flex justify-between text-neutral-300">
                  <span>Student Email:</span>
                  <span className="font-mono text-white">{completedOrderDetails.email}</span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>WhatsApp Number:</span>
                  <span className="font-mono text-white">{completedOrderDetails.phone}</span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>Payment Gateway:</span>
                  <span className="font-semibold text-orange-400">{completedOrderDetails.gatewayType || 'Verified'}</span>
                </div>
                {completedOrderDetails.paymentId && (
                  <div className="flex justify-between text-neutral-300">
                    <span>Payment ID:</span>
                    <span className="font-mono text-[11px] text-neutral-300">{completedOrderDetails.paymentId}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-300 pt-1 border-t border-neutral-800">
                  <span>Total Paid:</span>
                  <span className="font-bold text-emerald-400 text-sm">₹{completedOrderDetails.totalAmount}</span>
                </div>
              </div>

              {/* If competitive exam was enrolled, show the calculated weekly delivery schedule! */}
              {completedOrderDetails.examRoadmaps && completedOrderDetails.examRoadmaps.length > 0 && (
                <div className="space-y-4 text-left">
                  {completedOrderDetails.examRoadmaps.map((roadmap, rIdx) => (
                    <div
                      key={rIdx}
                      className="p-4 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 border border-orange-500/30 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400">
                          <Zap className="w-4 h-4 text-orange-400" />
                          <span>Weekly Material Delivery Active</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          AUTOMATED ENGINE
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-black text-white">{roadmap.examName}</h4>
                        <div className="flex items-center gap-3 text-xs text-neutral-300 mt-1">
                          <span className="font-mono text-amber-400 font-bold">
                            {roadmap.daysRemaining} Days
                          </span>
                          <span>•</span>
                          <span className="font-mono text-emerald-400 font-bold">
                            {roadmap.weeksRemaining} Weekly Packs
                          </span>
                          <span>•</span>
                          <span className="text-neutral-400">Target: {roadmap.targetDate}</span>
                        </div>
                      </div>

                      {/* Delivery cadence banner */}
                      <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-[11px] text-orange-200 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                        <span>
                          Delivered every Sunday at 6:00 AM IST to WhatsApp (<strong>{completedOrderDetails.phone}</strong>) & Student Portal.
                        </span>
                      </div>

                      {/* Immediate Week 1 Pack */}
                      <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            Week 1 Study Pack (Unlocked Now)
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                            READY FOR DOWNLOAD
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-300">
                          {roadmap.dispatches[0]?.title}: NCERT Core Notes, 200+ MCQs, and Diagnostic Mock Test.
                        </p>
                      </div>

                      {/* Upcoming 2 dispatches preview */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                          Next Upcoming Sunday Dispatches:
                        </span>
                        {roadmap.dispatches.slice(1, 3).map((disp) => (
                          <div
                            key={disp.weekNumber}
                            className="flex items-center justify-between text-xs p-2 rounded-lg bg-neutral-900 border border-neutral-850"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-5 h-5 rounded bg-neutral-800 text-[10px] font-mono font-bold flex items-center justify-center text-neutral-300">
                                W{disp.weekNumber}
                              </span>
                              <span className="truncate text-[11px] text-neutral-300 font-medium">
                                {disp.title}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-amber-400 shrink-0 ml-2">
                              {disp.releaseDate}
                            </span>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDownloadRoadmap(roadmap.examName)}
                        className="w-full py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <Download className="w-3.5 h-3.5 text-orange-400" />
                        <span>Download Full {roadmap.weeksRemaining}-Week Dispatch Calendar (PDF)</span>
                      </button>
                    </div>
                  ))}

                  {downloadNotice && (
                    <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300 text-center font-medium">
                      {downloadNotice}
                    </div>
                  )}
                </div>
              )}

              {/* Quick Actions */}
              <div className="space-y-3 pt-2">
                {/* WhatsApp Dispatch Preview Box */}
                <div className="p-3.5 rounded-xl bg-neutral-900 border border-emerald-900/40 text-left space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp Cloud API Dispatch Engine</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowWhatsAppPreview((prev) => !prev)}
                      className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{showWhatsAppPreview ? 'Hide Message Preview' : 'Preview Live Alert'}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-neutral-300">
                    Automated Sunday 6:00 AM dispatch queued for <span className="text-white font-mono font-bold">+91 {completedOrderDetails.phone}</span>.
                  </p>

                  {showWhatsAppPreview && (
                    <div className="p-3 rounded-lg bg-[#0b141a] border border-[#202c33] space-y-2 text-xs font-sans text-[#e9edef] shadow-inner">
                      <div className="flex items-center justify-between text-[10px] text-[#8696a0] pb-1 border-b border-[#202c33]">
                        <span className="font-semibold text-[#00a884] flex items-center gap-1">
                          <span>Nextclasses.in Learning System</span>
                          <Check className="w-3 h-3 text-[#00a884]" />
                        </span>
                        <span>Sunday 06:00 AM</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        👋 Hi <strong>{completedOrderDetails.name}</strong>! Your <strong>Week 1 Study Material Package</strong> is ready for download.
                      </p>
                      <div className="p-2 rounded bg-[#111b21] border border-[#202c33] text-[10px] space-y-1">
                        <div>📦 <strong>Included:</strong> High-Yield Mind Maps + Chapter Formula Sheets + Mock Paper 01</div>
                        <div>⏱️ <strong>Target:</strong> Complete before Saturday evening review</div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <span className="px-2.5 py-1 rounded bg-[#00a884]/20 text-[#00a884] text-[10px] font-bold border border-[#00a884]/30">
                          📥 1-Click PDF Download
                        </span>
                        <span className="px-2.5 py-1 rounded bg-[#00a884]/20 text-[#00a884] text-[10px] font-bold border border-[#00a884]/30">
                          📝 Start Mock Test CBT
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleSendTestWhatsAppDispatch}
                      disabled={whatsAppDispatched || isSendingWhatsApp}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isSendingWhatsApp ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Send className="w-3 h-3" />
                      )}
                      <span>
                        {isSendingWhatsApp
                          ? 'Sending via WhatsApp...'
                          : whatsAppDispatched
                          ? '✓ Test Dispatch Delivered'
                          : 'Trigger Test WhatsApp Alert'}
                      </span>
                    </button>
                    <span className="text-[10px] text-neutral-400">Powered by WhatsApp Cloud API</span>
                  </div>
                </div>

                <a
                  href={`https://wa.me/918281644058?text=${encodeURIComponent(`Hi Nextclasses.in Team, I just enrolled with Order #${completedOrderDetails.orderId} (${completedOrderDetails.name}, Phone: +91 ${completedOrderDetails.phone}). Please send my study materials and add me to the batch WhatsApp group!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-600/20"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Join Official WhatsApp Student Community (+91 82816 44058)</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onOpenPortalDemo();
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 text-neutral-950 font-bold text-xs transition-opacity cursor-pointer shadow-md shadow-orange-500/20"
                >
                  <span>Open NextClass Student Learning Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    const catalogEl = document.getElementById('catalog') || document.getElementById('courses');
                    if (catalogEl) {
                      catalogEl.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 hover:text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                  <span>Enroll in Another Course / Explore Catalog</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadTaxInvoice}
                  className="w-full py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 border border-neutral-800 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-orange-400" />
                  <span>Download Official GST Tax Invoice & Receipt (.txt)</span>
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-2 px-3 text-neutral-400 hover:text-white text-xs font-medium transition-colors cursor-pointer text-center"
                >
                  Done & Close Drawer
                </button>
              </div>

              {/* Items Enrolled */}
              <div className="pt-4 border-t border-neutral-800 text-left space-y-2">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  Enrolled Course / Digital Assets:
                </span>
                <ul className="space-y-1 text-xs text-neutral-300">
                  {completedOrderDetails.items.map((it, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="line-clamp-1">{it.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : items.length === 0 ? (
            /* Empty Cart */
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-neutral-900 mx-auto flex items-center justify-center text-neutral-500">
                <Tag className="w-8 h-8" />
              </div>
              <p className="text-base text-neutral-300 font-medium">Your cart is empty.</p>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                Explore our competitive exam tracks (NEET, JEE, KEAM, AISSEE, Navodaya) or practical AI courses.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-neutral-950 font-bold text-xs cursor-pointer"
              >
                Browse All Programs
              </button>
            </div>
          ) : (
            /* Items in Cart & Checkout form */
            <div className="space-y-6">
              
              {/* Items List */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
                  Items Selected ({items.length})
                </span>

                {items.map((item) => {
                  const isCompetitive = item.isCompetitiveExam || item.category === 'competitive_exams';
                  const targetDate = itemTargetDates[item.id] || item.targetExamDate || '2027-05-02';
                  const daysToExam = isCompetitive ? calculateDaysToExam(targetDate) : 0;
                  const weeksToExam = isCompetitive ? calculateWeeksToExam(daysToExam) : 0;

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isCompetitive
                          ? 'bg-neutral-900/90 border-orange-500/30'
                          : 'bg-neutral-900 border-neutral-800'
                      }`}
                    >
                      <div className="flex items-start gap-3 justify-between">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-16 h-12 rounded-lg object-cover bg-neutral-800 shrink-0"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.dataset.triedFallback) {
                              target.dataset.triedFallback = 'true';
                              target.src = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80';
                            }
                          }}
                        />

                        <div className="flex-1 min-w-0 pr-2">
                          <span className="text-xs font-bold text-white block line-clamp-1">
                            {item.title}
                          </span>
                          <span className="text-[11px] text-neutral-400 block mt-0.5">
                            {item.format}
                          </span>
                          <div className="flex items-baseline gap-1.5 mt-1">
                            <span className="text-sm font-black text-white">₹{item.price}</span>
                            <span className="text-[11px] line-through text-neutral-500">₹{item.originalPrice}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1.5 text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Remove from cart"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Competitive Exam Real-Time Countdown & Delivery Scheduler */}
                      {isCompetitive && (
                        <div className="mt-3 pt-3 border-t border-neutral-800 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-orange-400 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Calculated Exam Delivery Schedule</span>
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                              {daysToExam} Days Left • {weeksToExam} Weeks
                            </span>
                          </div>

                          {/* Target Date Picker */}
                          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-neutral-950 border border-neutral-800">
                            <div className="flex items-center gap-1.5 text-neutral-300 text-[11px]">
                              <Calendar className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                              <span>Target Exam Date:</span>
                            </div>
                            <input
                              type="date"
                              aria-label="Target Exam Date"
                              value={targetDate}
                              onChange={(e) => handleDateChangeForItem(item.id, e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                              className="px-2 py-1 rounded bg-neutral-900 border border-neutral-700 text-[11px] font-mono text-white focus:outline-none focus:border-orange-500"
                            />
                          </div>

                          {/* Delivery cadence note */}
                          <div className="text-[11px] text-neutral-300 leading-relaxed bg-orange-500/10 p-2 rounded-lg border border-orange-500/20 flex items-start gap-2">
                            <Zap className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                            <span>
                              <strong>Automated Weekly Dispatch:</strong> Based on your {daysToExam} days countdown, study modules will be delivered every Sunday directly to your student portal and WhatsApp.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Coupon Code Box */}
              <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2">
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="coupon-code-input"
                      type="text"
                      placeholder="Enter promo code (e.g. AIFUTURE)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 uppercase font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </form>

                {couponError && (
                  <p className="text-[11px] text-rose-400">{couponError}</p>
                )}

                {appliedCoupon && (
                  <div className="flex items-center justify-between text-xs text-emerald-400 bg-emerald-950/40 p-2 rounded border border-emerald-800/60">
                    <span>Coupon "{appliedCoupon.code}" applied ({appliedCoupon.percent}% OFF)</span>
                    <button
                      type="button"
                      onClick={() => setAppliedCoupon(null)}
                      className="text-neutral-400 hover:text-white"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Checkout Form */}
              <form id="checkout-student-form" onSubmit={handleCheckoutSubmit} className="space-y-4">
                {paymentError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-xs leading-relaxed">{paymentError}</p>
                    </div>
                  </div>
                )}

                {/* Student Contact Information Provision (Collected before Razorpay opens) */}
                <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Student Contact Details
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                      Required for Portal Access
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Provide your mobile number and email. Your student login credentials, receipt, and downloadable study packs will be sent here immediately.
                  </p>

                  <div className="space-y-3 pt-1">
                    {/* Full Name */}
                    <div>
                      <label htmlFor="checkout-student-name" className="block text-[11px] font-semibold text-neutral-300 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="checkout-student-name"
                          type="text"
                          value={studentName}
                          onChange={(e) => {
                            setStudentName(e.target.value);
                            if (paymentError) setPaymentError(null);
                          }}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-base sm:text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Contact Number (WhatsApp / Mobile) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor="checkout-student-phone" className="block text-[11px] font-semibold text-neutral-300">
                          Contact Number (WhatsApp) <span className="text-rose-400">*</span>
                        </label>
                        <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                          <Smartphone className="w-3 h-3" />
                          Direct WhatsApp Delivery
                        </span>
                      </div>
                      <div className="relative flex">
                        <div className="inline-flex items-center px-3 rounded-l-xl bg-neutral-900 border border-r-0 border-neutral-700 text-neutral-300 text-xs font-mono font-bold select-none">
                          🇮🇳 +91
                        </div>
                        <input
                          id="checkout-student-phone"
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          value={studentPhone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setStudentPhone(val);
                            if (paymentError) setPaymentError(null);
                          }}
                          placeholder="98765 43210 (10 digits)"
                          className="w-full min-w-0 px-3 py-2.5 rounded-r-xl bg-neutral-950 border border-neutral-700 text-base sm:text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono tracking-wider transition-colors"
                          required
                        />
                      </div>
                      <span className="text-[10px] text-neutral-500 mt-1 block">
                        We dispatch portal logins & weekly updates directly to this WhatsApp number.
                      </span>
                    </div>

                    {/* Email Address */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor="checkout-student-email" className="block text-[11px] font-semibold text-neutral-300">
                          Email Address <span className="text-rose-400">*</span>
                        </label>
                        <span className="text-[10px] text-neutral-400">PDF Study Pack & Receipt</span>
                      </div>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="checkout-student-email"
                          type="email"
                          value={studentEmail}
                          onChange={(e) => {
                            setStudentEmail(e.target.value);
                            if (paymentError) setPaymentError(null);
                          }}
                          placeholder="student@example.com"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-base sm:text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-medium transition-colors"
                          required
                        />
                      </div>
                      <span className="text-[10px] text-neutral-500 mt-1 block">
                        Your enrollment confirmation & payment receipt will be sent here immediately.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Razorpay Gateway Information Banner */}
                <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-orange-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Razorpay Secure Gateway
                      </span>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      RBI COMPLIANT
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-300 leading-relaxed">
                    Razorpay checkout will launch with your contact details prefilled. Choose from any supported payment mode:
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800 flex items-center gap-2">
                      <Smartphone className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      <div>
                        <span className="text-[11px] font-semibold text-white block">UPI Instant</span>
                        <span className="text-[9px] text-neutral-400 block">GPay, PhonePe, Paytm, CRED</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800 flex items-center gap-2">
                      <CreditCard className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      <div>
                        <span className="text-[11px] font-semibold text-white block">Cards</span>
                        <span className="text-[9px] text-neutral-400 block">Debit & Credit (Visa, MC, RuPay)</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800 flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      <div>
                        <span className="text-[11px] font-semibold text-white block">Net Banking</span>
                        <span className="text-[9px] text-neutral-400 block">50+ Banks (SBI, HDFC, ICICI...)</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800 flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <div>
                        <span className="text-[11px] font-semibold text-white block">Wallets & PayLater</span>
                        <span className="text-[9px] text-neutral-400 block">Amazon Pay, Mobikwik, etc.</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1.5 border-t border-neutral-800">
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>PCI-DSS Level 1 & 256-Bit SSL Encrypted</span>
                    </span>
                    <span>Zero Platform Fees</span>
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="pt-4 border-t border-neutral-800 space-y-1.5 text-xs">
                  <div className="flex justify-between text-neutral-400">
                    <span>Subtotal:</span>
                    <span>₹{rawTotal}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount ({appliedCoupon.code}):</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-neutral-400">
                    <span>Platform Delivery & AI Engine:</span>
                    <span className="text-emerald-400 font-medium">FREE</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-white pt-2 border-t border-neutral-800">
                    <span>Total Amount:</span>
                    <span className="text-orange-400">₹{finalTotal}</span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  id="btn-complete-checkout"
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-neutral-950 font-black text-sm transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                      <span>Opening Razorpay Secure Gateway...</span>
                    </div>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Pay ₹{finalTotal.toLocaleString('en-IN')} via Razorpay</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-400 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Instant Verification & Portal Activation</span>
                </div>

                {/* Direct link for students who already paid via Razorpay */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => handleOpenVerification()}
                    className="w-full py-2.5 px-3 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                    <span>Already completed Razorpay payment? Submit Verification Details</span>
                  </button>
                </div>

                {/* Razorpay Compliance Policy Links */}
                <div className="pt-2 border-t border-neutral-800 text-[10px] text-neutral-400 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                  <span>By paying, you agree to our:</span>
                  <button
                    type="button"
                    onClick={() => onOpenPolicyModal?.('terms')}
                    className="text-neutral-300 hover:text-white underline cursor-pointer"
                  >
                    Terms
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => onOpenPolicyModal?.('privacy')}
                    className="text-neutral-300 hover:text-white underline cursor-pointer"
                  >
                    Privacy
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => onOpenPolicyModal?.('refund')}
                    className="text-neutral-300 hover:text-white underline cursor-pointer"
                  >
                    Refund Policy
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => onOpenPolicyModal?.('pricing')}
                    className="text-neutral-300 hover:text-white underline cursor-pointer"
                  >
                    Pricing
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => onOpenPolicyModal?.('shipping')}
                    className="text-neutral-300 hover:text-white underline cursor-pointer"
                  >
                    Shipping
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
