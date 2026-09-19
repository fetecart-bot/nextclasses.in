import { useState, useEffect } from 'react';
import { X, Send, Download, Copy, Check, MessageCircle, BookOpen, Mail, KeyRound, Lock, Loader2, ExternalLink } from 'lucide-react';
import { downloadStudyMaterialFile, generateWhatsAppDispatchMessage } from '../utils/studyMaterialGenerator';
import { COURSES_DATA } from '../data';
import { 
  getRegisteredStudents, 
  generateMailtoUrl, 
  generateGmailComposeUrl, 
  sendStudentCredentialsEmail, 
  RegisteredStudentAccount 
} from '../utils/studentRegistry';

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
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId);
  const [studentPhone, setStudentPhone] = useState(initialPhone);
  const [studentEmail, setStudentEmail] = useState('');
  const [studentName, setStudentName] = useState(initialStudentName || 'Student');
  const [studentUsername, setStudentUsername] = useState('');
  const [studentPassword, setStudentPassword] = useState('');

  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const [registeredAccounts, setRegisteredAccounts] = useState<RegisteredStudentAccount[]>([]);

  // Load registered students
  useEffect(() => {
    if (!isOpen) return;
    try {
      const students = getRegisteredStudents();
      setRegisteredAccounts(students);

      // If initial student exists, match account
      if (initialStudentName || initialPhone) {
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
    } catch {
      // ignore
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

  const handleSendWhatsApp = () => {
    let cleanPhone = studentPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
    
    // If no phone entered, prompt or fallback to helpline
    const destPhone = cleanPhone || '918281644058';
    const waUrl = `https://wa.me/${destPhone}?text=${encodeURIComponent(formattedMessage)}`;
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
      // Open Gmail Web compose or mailto so it sends immediately
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

  const handleCopyPortalLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.fetecart.in';
    const portalUrl = `${origin}/?portal=true&course=${encodeURIComponent(selectedCourseId)}`;
    navigator.clipboard?.writeText(portalUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSelectStudent = (acc: RegisteredStudentAccount) => {
    setStudentName(acc.name);
    setStudentPhone(acc.phone);
    setStudentEmail(acc.email);
    setStudentUsername(acc.username);
    setStudentPassword(acc.password);
    setSelectedCourseId(acc.courseId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#0e141f] border border-[#212c40] shadow-2xl text-white">
        {/* Header */}
        <div className="sticky top-0 z-10 px-6 py-4 bg-[#0e141f]/95 backdrop-blur-md border-b border-[#1f293b] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
              <Send className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white leading-tight">Admin Study Material Dispatcher</h2>
              <span className="text-xs text-neutral-400">Manage Student Credentials, Email Dispatches & WhatsApp Deliveries</span>
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

        <div className="p-5 sm:p-6 space-y-5">
          {/* Quick Notice Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-start gap-2.5">
            <MessageCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-bold">Got a payment confirmation or WhatsApp inquiry?</strong>
              <span>Select the student below or type their details. The system generates unique login credentials and delivers the official study pack directly via WhatsApp and Email.</span>
            </div>
          </div>

          {emailStatus && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs text-center font-semibold animate-in fade-in">
              {emailStatus}
            </div>
          )}

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
              <optgroup label="🎖️ Sainik School & Competitive Entrance Tracks" className="bg-neutral-900 text-amber-400 font-bold">
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

          {/* Live Message Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-300">Preview of Dispatch Message to Student</span>
              <span className="text-[11px] text-neutral-400 font-mono">Includes Login ID & Password</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#090d14] border border-[#1b2536] text-xs text-neutral-300 font-sans whitespace-pre-line max-h-40 overflow-y-auto leading-relaxed">
              {formattedMessage}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Direct WhatsApp Send */}
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Send via WhatsApp Now</span>
            </button>

            {/* Direct Email Credentials Send */}
            <button
              type="button"
              onClick={handleSendEmailCredentials}
              disabled={isSendingEmail}
              className="py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-600/20 cursor-pointer disabled:opacity-50"
            >
              {isSendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              <span>Send Login ID & Password via Email</span>
            </button>

            {/* Direct Gmail Web Compose */}
            <button
              type="button"
              onClick={handleOpenGmailDirect}
              className="py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/20 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Send via Gmail Web (1-Click Compose)</span>
            </button>

            {/* Download Study Pack to Attach */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-600/20 cursor-pointer"
            >
              {downloadSuccess ? <Check className="w-3.5 h-3.5 text-white" /> : <Download className="w-3.5 h-3.5" />}
              <span>{downloadSuccess ? 'Downloaded!' : 'Download Printable PDF Pack'}</span>
            </button>

            {/* Copy Message */}
            <button
              type="button"
              onClick={handleCopyMessage}
              className="py-2.5 px-4 rounded-xl bg-[#172233] hover:bg-[#1f2d44] border border-[#2b3b57] text-neutral-200 font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Message!' : 'Copy WhatsApp Message Text'}</span>
            </button>
          </div>

          {/* Registered Students Quick Pick */}
          {registeredAccounts.length > 0 && (
            <div className="pt-3 border-t border-[#1f293b] space-y-2">
              <span className="text-xs font-semibold text-neutral-400 block">
                Registered Students in Database (Click to Auto-Fill & Dispatch):
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {registeredAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    onClick={() => handleSelectStudent(acc)}
                    className="p-2.5 rounded-xl bg-[#131b28] hover:bg-[#1a2538] border border-[#222e42] flex items-center justify-between text-xs cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{acc.name}</span>
                        <span className="font-mono text-[10px] text-sky-400 bg-sky-950 px-1 rounded border border-sky-800">
                          @{acc.username}
                        </span>
                        <span className="font-mono text-[10px] text-amber-400 bg-amber-950 px-1 rounded border border-amber-800">
                          {acc.password}
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-400 block">{acc.courseTitle.substring(0, 42)}...</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-neutral-300 block font-mono">{acc.phone}</span>
                      <span className="text-[10px] text-neutral-400">{acc.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
