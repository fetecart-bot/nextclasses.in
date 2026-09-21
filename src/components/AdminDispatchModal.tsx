import { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Download, 
  Copy, 
  Check, 
  MessageCircle, 
  BookOpen, 
  Mail, 
  KeyRound, 
  Lock, 
  Loader2, 
  ExternalLink,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Smartphone,
  Building,
  UserCheck
} from 'lucide-react';
import { downloadStudyMaterialFile, generateWhatsAppDispatchMessage } from '../utils/studyMaterialGenerator';
import { COURSES_DATA } from '../data';
import { 
  getRegisteredStudents, 
  generateMailtoUrl, 
  generateGmailComposeUrl, 
  sendStudentCredentialsEmail, 
  RegisteredStudentAccount 
} from '../utils/studentRegistry';
import {
  getPaymentClaims,
  approvePaymentClaim,
  rejectPaymentClaim,
  PaymentClaim
} from '../utils/paymentClaims';

interface AdminDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCourseId?: string;
  initialPhone?: string;
  initialStudentName?: string;
}

export default function AdminDispatchModal({
  isOpen,
  onClose,
  initialCourseId = 'course-aissee-sainik',
  initialPhone = '',
  initialStudentName = '',
}: AdminDispatchModalProps) {
  const [activeTab, setActiveTab] = useState<'claims' | 'dispatch' | 'students'>('claims');
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId);
  const [studentPhone, setStudentPhone] = useState(initialPhone);
  const [studentEmail, setStudentEmail] = useState('');
  const [studentName, setStudentName] = useState(initialStudentName || 'Student');
  const [studentUsername, setStudentUsername] = useState('');
  const [studentPassword, setStudentPassword] = useState('');

  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedUtrId, setCopiedUtrId] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Claims state
  const [claims, setClaims] = useState<PaymentClaim[]>([]);
  const [claimsFilter, setClaimsFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [processingClaimId, setProcessingClaimId] = useState<string | null>(null);

  const [registeredAccounts, setRegisteredAccounts] = useState<RegisteredStudentAccount[]>([]);

  const loadData = () => {
    try {
      const allClaims = getPaymentClaims();
      setClaims(allClaims);

      const students = getRegisteredStudents();
      setRegisteredAccounts(students);
    } catch {
      // ignore
    }
  };

  // Load registered students & payment claims
  useEffect(() => {
    if (!isOpen) return;
    loadData();

    // If initial student exists, match account
    if (initialStudentName || initialPhone) {
      const students = getRegisteredStudents();
      const cleanP = initialPhone.replace(/[^0-9]/g, '');
      const match = students.find(
        (s) => (cleanP && s.phone.replace(/[^0-9]/g, '').includes(cleanP)) ||
               (initialStudentName && s.name.toLowerCase().includes(initialStudentName.toLowerCase()))
      );
      if (match) {
        setStudentName(match.name);
        setStudentPhone(match.phone);
        setStudentEmail(match.email);
        setStudentUsername(match.username);
        setStudentPassword(match.password);
        setSelectedCourseId(match.courseId || initialCourseId);
      }
    }
  }, [isOpen, initialStudentName, initialPhone, initialCourseId]);

  if (!isOpen) return null;

  const currentCourse = COURSES_DATA.find((c) => c.id === selectedCourseId) || COURSES_DATA[2]; // Fallback to Sainik School
  const formattedMessage = generateWhatsAppDispatchMessage(
    studentName, 
    selectedCourseId, 
    studentPhone,
    studentUsername ? { username: studentUsername, password: studentPassword } : undefined
  );

  const pendingClaimsCount = claims.filter((c) => c.status === 'pending_verification').length;

  const handleApproveClaim = async (claim: PaymentClaim) => {
    setProcessingClaimId(claim.id);
    setEmailStatus(null);

    try {
      const result = await approvePaymentClaim(claim.id, 'Admin (fetecart@gmail.com)');
      if (result.success && result.account) {
        setEmailStatus(`✓ Approved! Generated Credentials for ${claim.studentName} (@${result.account.username}). Sent to ${claim.email}.`);
        loadData();
      } else {
        setEmailStatus(`⚠️ Approval error: ${result.error || 'Failed to generate credentials'}`);
      }
    } catch (err: any) {
      setEmailStatus(`⚠️ Error approving claim: ${err?.message || 'Unexpected error'}`);
    } finally {
      setProcessingClaimId(null);
      setTimeout(() => setEmailStatus(null), 6000);
    }
  };

  const handleRejectClaim = async (claim: PaymentClaim) => {
    const reason = window.prompt(
      `Enter reason for rejecting claim from ${claim.studentName} (UTR: ${claim.utrNumber}):`,
      'Payment not received / UTR not found in HDFC Bank account statement'
    );
    if (!reason) return;

    setProcessingClaimId(claim.id);
    try {
      await rejectPaymentClaim(claim.id, reason);
      setEmailStatus(`Claim ${claim.claimCode} marked as REJECTED.`);
      loadData();
    } catch (err: any) {
      setEmailStatus(`⚠️ Failed to reject claim: ${err?.message}`);
    } finally {
      setProcessingClaimId(null);
      setTimeout(() => setEmailStatus(null), 4000);
    }
  };

  const handleCopyUtr = (utr: string, claimId: string) => {
    navigator.clipboard?.writeText(utr);
    setCopiedUtrId(claimId);
    setTimeout(() => setCopiedUtrId(null), 2500);
  };

  const handleSendWhatsApp = () => {
    let cleanPhone = studentPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
    
    const destPhone = cleanPhone || '918281644058';
    const waUrl = `https://wa.me/${destPhone}?text=${encodeURIComponent(formattedMessage)}`;
    window.open(waUrl, '_blank');
  };

  const handleSendClaimWhatsApp = (claim: PaymentClaim) => {
    let cleanPhone = claim.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    const username = claim.credentialsGenerated?.username || claim.studentName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const password = claim.credentialsGenerated?.password || 'NextClass@2027';

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.nextclasses.in';
    const message = `🎉 *NEXTCLASSES.IN - ENROLLMENT VERIFIED*\n\nDear *${claim.studentName}*,\n\nWe have verified your payment of *₹${claim.amount.toLocaleString('en-IN')}* via UPI (UTR: ${claim.utrNumber}) in our HDFC Bank account for:\n📚 *${claim.courseTitle}*\n\nYour official student portal login credentials:\n🌐 *Student Portal:* ${origin}\n👤 *Username:* ${username}\n🔑 *Password:* ${password}\n\nStudy materials, mock tests, and video lessons are now unlocked! Need help? WhatsApp us directly at +91 82816 44058.`;

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const handleSendEmailCredentials = async () => {
    if (!studentEmail) {
      setEmailStatus('⚠️ Please specify student email address.');
      setTimeout(() => setEmailStatus(null), 3000);
      return;
    }

    setIsSendingEmail(true);
    setEmailStatus(null);

    const mockAccount: RegisteredStudentAccount = {
      id: 'acc-' + Date.now(),
      name: studentName,
      email: studentEmail,
      phone: studentPhone,
      username: studentUsername || studentName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      password: studentPassword || 'NextClass@2027',
      courseId: selectedCourseId,
      courseTitle: currentCourse.title,
      enrolledCourseIds: [selectedCourseId],
      targetExamCode: 'AISSEE',
      learningGoal: 'Entrance Prep',
      registeredAt: new Date().toISOString().split('T')[0],
      amount: currentCourse.price,
    };

    const res = await sendStudentCredentialsEmail(mockAccount);
    setIsSendingEmail(false);

    if (res.outboundSmtpSent) {
      setEmailStatus(`✓ Credentials & study pack sent directly to ${studentEmail} via SMTP!`);
    } else {
      const gmailUrl = res.gmailComposeUrl || generateGmailComposeUrl(mockAccount);
      window.open(gmailUrl, '_blank');
      setEmailStatus(`✓ Opened in Gmail! Click 'Send' to deliver directly to ${studentEmail}.`);
    }
    setTimeout(() => setEmailStatus(null), 5000);
  };

  const handleOpenGmailDirect = () => {
    if (!studentEmail) {
      setEmailStatus('⚠️ Please specify student email address.');
      setTimeout(() => setEmailStatus(null), 3000);
      return;
    }
    const mockAccount: RegisteredStudentAccount = {
      id: 'acc-' + Date.now(),
      name: studentName,
      email: studentEmail,
      phone: studentPhone,
      username: studentUsername || studentName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      password: studentPassword || 'NextClass@2027',
      courseId: selectedCourseId,
      courseTitle: currentCourse.title,
      enrolledCourseIds: [selectedCourseId],
      targetExamCode: 'AISSEE',
      learningGoal: 'Entrance Prep',
      registeredAt: new Date().toISOString().split('T')[0],
      amount: currentCourse.price,
    };
    const gmailUrl = generateGmailComposeUrl(mockAccount);
    window.open(gmailUrl, '_blank');
    setEmailStatus(`✓ Opened Gmail compose with student credentials!`);
    setTimeout(() => setEmailStatus(null), 4000);
  };

  const handleDownloadPdf = () => {
    downloadStudyMaterialFile(selectedCourseId, studentName);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleCopyMessage = () => {
    navigator.clipboard?.writeText(formattedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSelectStudent = (acc: RegisteredStudentAccount) => {
    setStudentName(acc.name);
    setStudentPhone(acc.phone);
    setStudentEmail(acc.email);
    setStudentUsername(acc.username);
    setStudentPassword(acc.password);
    setSelectedCourseId(acc.courseId);
    setActiveTab('dispatch');
  };

  const filteredClaims = claims.filter((claim) => {
    if (claimsFilter === 'pending') return claim.status === 'pending_verification';
    if (claimsFilter === 'approved') return claim.status === 'approved';
    if (claimsFilter === 'rejected') return claim.status === 'rejected';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-3xl max-h-[94vh] overflow-y-auto rounded-3xl bg-[#0e141f] border border-[#212c40] shadow-2xl text-white">
        
        {/* Header */}
        <div className="sticky top-0 z-20 px-6 py-4 bg-[#0e141f]/95 backdrop-blur-md border-b border-[#1f293b] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white leading-tight">Admin Portal & Payment Reconciliation</h2>
              <span className="text-xs text-neutral-400">Razorpay & HDFC Bank Verification • Credential Generation • Study Pack Dispatch</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 pb-2 border-b border-[#1f293b] bg-[#0c111a] flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('claims')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'claims'
                ? 'bg-orange-500 text-neutral-950 shadow-md'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Payment Claims (Razorpay & UPI)</span>
            {pendingClaimsCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'claims' ? 'bg-neutral-950 text-orange-400' : 'bg-orange-500 text-neutral-950'
              }`}>
                {pendingClaimsCount} Pending
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dispatch')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'dispatch'
                ? 'bg-orange-500 text-neutral-950 shadow-md'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Manual Dispatcher</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('students')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'students'
                ? 'bg-orange-500 text-neutral-950 shadow-md'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Enrolled Students ({registeredAccounts.length})</span>
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {emailStatus && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs text-center font-semibold animate-in fade-in">
              {emailStatus}
            </div>
          )}

          {/* TAB 1: BANK UPI PAYMENT CLAIMS */}
          {activeTab === 'claims' && (
            <div className="space-y-4">
              {/* Informative Admin Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
                <Building className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-bold mb-0.5">Admin Reconciliation & Anti-Fraud Workflow:</strong>
                  <span>
                    Check your <strong>HDFC Netbanking / UPI app</strong> (for 8281644058@hdfc) or your <strong>Razorpay Dashboard</strong>. Cross-verify the student's 12-digit UPI UTR or Razorpay Payment ID and amount received.
                    Once confirmed, click <strong>"Approve & Dispatch"</strong> to generate portal credentials and send login details directly to the student.
                  </span>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {(['all', 'pending', 'approved', 'rejected'] as const).map((filterKey) => (
                    <button
                      key={filterKey}
                      type="button"
                      onClick={() => setClaimsFilter(filterKey)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize cursor-pointer transition-colors ${
                        claimsFilter === filterKey
                          ? 'bg-neutral-200 text-neutral-900 font-bold'
                          : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                      }`}
                    >
                      {filterKey === 'all' ? 'All Claims' : filterKey} (
                      {filterKey === 'all'
                        ? claims.length
                        : claims.filter((c) =>
                            filterKey === 'pending'
                              ? c.status === 'pending_verification'
                              : c.status === filterKey
                          ).length}
                      )
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={loadData}
                  className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white text-xs flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Claims Cards List */}
              {filteredClaims.length === 0 ? (
                <div className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 text-center text-neutral-400 text-xs">
                  No payment claims found in this view.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredClaims.map((claim) => {
                    const isProcessing = processingClaimId === claim.id;
                    const isCopied = copiedUtrId === claim.id;

                    return (
                      <div
                        key={claim.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          claim.status === 'pending_verification'
                            ? 'bg-[#121927] border-amber-500/40 shadow-lg shadow-amber-500/5'
                            : claim.status === 'approved'
                            ? 'bg-[#0f1821] border-emerald-500/30'
                            : 'bg-[#141217] border-rose-500/30'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-neutral-800">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-extrabold text-sm text-white">{claim.studentName}</span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                                {claim.claimCode}
                              </span>
                              {claim.status === 'pending_verification' && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Pending Bank Verification
                                </span>
                              )}
                              {claim.status === 'approved' && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Verified & Dispatched
                                </span>
                              )}
                              {claim.status === 'rejected' && (
                                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  Rejected (Fake UTR)
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-neutral-300 mt-1 font-medium">{claim.courseTitle}</p>
                            <span className="text-[11px] text-neutral-500 block mt-0.5">
                              Submitted {new Date(claim.submittedAt).toLocaleString('en-IN')} via {claim.paymentApp || 'UPI App'}
                            </span>
                          </div>

                          <div className="sm:text-right">
                            <span className="text-lg font-black text-orange-400 block">
                              ₹{claim.amount.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-mono block">
                              {claim.paymentMethod?.toLowerCase().includes('razorpay')
                                ? 'Channel: Razorpay Gateway'
                                : 'Payee: 8281644058@hdfc'}
                            </span>
                          </div>
                        </div>

                        {/* UTR and Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 py-3 text-xs">
                          <div className="p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                              {claim.paymentMethod?.toLowerCase().includes('razorpay') || claim.utrNumber.startsWith('pay_')
                                ? 'Razorpay Payment ID / Reference'
                                : '12-Digit UPI Reference (UTR)'}
                            </span>
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-sm font-bold text-amber-400 tracking-wider break-all">
                                {claim.utrNumber}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyUtr(claim.utrNumber, claim.id)}
                                className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors shrink-0 ml-2"
                              >
                                {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                <span>{isCopied ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                            <span className="text-[10px] text-neutral-500 block mt-1">
                              {claim.paymentMethod?.toLowerCase().includes('razorpay') || claim.utrNumber.startsWith('pay_')
                                ? 'Match this ID in your Razorpay Dashboard transactions'
                                : 'Match this number in your HDFC statement'}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80 space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-neutral-400">Email:</span>
                              <span className="text-white font-mono truncate max-w-[170px]">{claim.email}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-neutral-400">WhatsApp:</span>
                              <span className="text-emerald-400 font-mono font-bold">+91 {claim.phone}</span>
                            </div>
                            {claim.notes && (
                              <div className="text-[10px] text-neutral-400 pt-0.5 italic">
                                Note: "{claim.notes}"
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status specific view / Action Buttons */}
                        {claim.status === 'pending_verification' && (
                          <div className="pt-2 flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleApproveClaim(claim)}
                              className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-950 cursor-pointer disabled:opacity-50"
                            >
                              {isProcessing ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              )}
                              <span>Confirm Bank Credit & Generate Login</span>
                            </button>

                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleRejectClaim(claim)}
                              className="py-2.5 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Reject / Fake UTR</span>
                            </button>

                            <a
                              href={`https://wa.me/91${claim.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                `Hi ${claim.studentName}, Nextclasses.in admin here regarding your payment claim for ${claim.courseTitle} (UTR: ${claim.utrNumber}).`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs flex items-center gap-1.5 cursor-pointer ml-auto"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Chat WhatsApp</span>
                            </a>
                          </div>
                        )}

                        {claim.status === 'approved' && (
                          <div className="pt-2 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-3">
                              <span className="text-[11px] text-neutral-400">Generated Credentials:</span>
                              <span className="font-mono text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800 text-[11px]">
                                User: @{claim.credentialsGenerated?.username || 'user'}
                              </span>
                              <span className="font-mono text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800 text-[11px]">
                                Pass: {claim.credentialsGenerated?.password || 'NextClass@2027'}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSendClaimWhatsApp(claim)}
                              className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>Send WhatsApp Message</span>
                            </button>
                          </div>
                        )}

                        {claim.status === 'rejected' && (
                          <div className="pt-2 text-xs text-rose-300/90 font-mono">
                            Rejection Reason: {claim.rejectionReason || 'UTR not verified in bank'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MANUAL DISPATCHER */}
          {activeTab === 'dispatch' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 space-y-1">
                <p className="font-semibold text-white">Manual Dispatcher & Credential Generator</p>
                <p className="text-neutral-400 leading-relaxed">
                  Enter student details manually to generate immediate credentials and dispatch study packs via WhatsApp or Email.
                </p>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Student Name</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Arjun K."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141b27] border border-[#26354d] text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Student WhatsApp Phone</label>
                  <input
                    type="tel"
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    placeholder="e.g. 8281644058"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141b27] border border-[#26354d] text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Student Email Address</label>
                  <input
                    type="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="e.g. arjun@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141b27] border border-[#26354d] text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Assigned Username & Password</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={studentUsername}
                      onChange={(e) => setStudentUsername(e.target.value)}
                      placeholder="Username"
                      className="w-1/2 px-2.5 py-2 rounded-xl bg-[#141b27] border border-[#26354d] text-xs text-sky-400 font-mono focus:outline-none focus:border-orange-500"
                    />
                    <input
                      type="text"
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      placeholder="Password"
                      className="w-1/2 px-2.5 py-2 rounded-xl bg-[#141b27] border border-[#26354d] text-xs text-amber-400 font-mono focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Course Selector */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-neutral-300 block">Select Course / Exam Pack</label>
                  <span className="text-[11px] text-orange-400 font-bold">{COURSES_DATA.length} Courses Available</span>
                </div>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141b27] border border-[#26354d] text-sm text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  <optgroup label="🎖️ Sainik School & Entrance Tracks" className="bg-neutral-900 text-amber-400 font-bold">
                    {COURSES_DATA
                      .filter((c) => c.category === 'competitive_exams' || c.isCompetitiveExam)
                      .map((c) => (
                        <option key={c.id} value={c.id} className="bg-[#141b27] text-white">
                          {c.title} (₹{c.price.toLocaleString('en-IN')})
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="🤖 Artificial Intelligence & Automation Academy" className="bg-neutral-900 text-purple-400 font-bold">
                    {COURSES_DATA
                      .filter((c) => !c.isCompetitiveExam && c.category !== 'languages' && c.category !== 'competitive_exams')
                      .map((c) => (
                        <option key={c.id} value={c.id} className="bg-[#141b27] text-white">
                          {c.title} (₹{c.price.toLocaleString('en-IN')})
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="🗣️ Languages & Global Communication Academy" className="bg-neutral-900 text-emerald-400 font-bold">
                    {COURSES_DATA
                      .filter((c) => c.category === 'languages')
                      .map((c) => (
                        <option key={c.id} value={c.id} className="bg-[#141b27] text-white">
                          {c.title} (₹{c.price.toLocaleString('en-IN')})
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>

              {/* Message Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-300">Preview of Dispatch Message</span>
                  <span className="text-[11px] text-neutral-400 font-mono">Includes Login ID & Password</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#090d14] border border-[#1b2536] text-xs text-neutral-300 font-sans whitespace-pre-line max-h-40 overflow-y-auto leading-relaxed">
                  {formattedMessage}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send via WhatsApp Now</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendEmailCredentials}
                  disabled={isSendingEmail}
                  className="py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-600/20 cursor-pointer disabled:opacity-50"
                >
                  {isSendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  <span>Send Login via Email (SMTP)</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenGmailDirect}
                  className="py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/20 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Send via Gmail Web (1-Click)</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-600/20 cursor-pointer"
                >
                  {downloadSuccess ? <Check className="w-3.5 h-3.5 text-white" /> : <Download className="w-3.5 h-3.5" />}
                  <span>{downloadSuccess ? 'Downloaded!' : 'Download Printable PDF Pack'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="py-2.5 px-4 rounded-xl bg-[#172233] hover:bg-[#1f2d44] border border-[#2b3b57] text-neutral-200 font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer sm:col-span-2"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Message!' : 'Copy WhatsApp Message Text'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ENROLLED STUDENTS REGISTRY */}
          {activeTab === 'students' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-400 pb-1">
                <span>Verified Students with portal credentials in database:</span>
                <span className="font-bold text-orange-400">{registeredAccounts.length} Enrolled</span>
              </div>

              {registeredAccounts.length === 0 ? (
                <div className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 text-center text-neutral-400 text-xs">
                  No registered student accounts yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                  {registeredAccounts.map((acc) => (
                    <div
                      key={acc.id}
                      className="p-3.5 rounded-2xl bg-[#131b28] border border-[#222e42] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white text-sm">{acc.name}</span>
                          <span className="font-mono text-[11px] text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                            @{acc.username}
                          </span>
                          <span className="font-mono text-[11px] text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                            Pass: {acc.password}
                          </span>
                        </div>
                        <span className="text-[11px] text-neutral-400 block mt-1">{acc.courseTitle}</span>
                        <div className="flex items-center gap-3 text-[11px] text-neutral-400 font-mono mt-0.5">
                          <span>Phone: +91 {acc.phone}</span>
                          <span>•</span>
                          <span>{acc.email}</span>
                          {acc.utrNumber && (
                            <>
                              <span>•</span>
                              <span className="text-amber-400">UTR: {acc.utrNumber}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleSelectStudent(acc)}
                          className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-colors cursor-pointer"
                        >
                          Dispatch Again
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
