import { useState, type FormEvent } from 'react';
import { X, User, Mail, Phone, Calendar, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SUPPORTED_EXAMS } from '../utils/examScheduler';

interface StudentAuthModalProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function StudentAuthModal({ onClose, onSuccess }: StudentAuthModalProps = {}) {
  const { isAuthModalOpen, closeAuthModal, user, login, logout } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [selectedExam, setSelectedExam] = useState(user?.targetExamCode || 'NEET');

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      closeAuthModal();
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) return;

    const examInfo = SUPPORTED_EXAMS.find((ex) => ex.code === selectedExam);

    login({
      name,
      email,
      phone,
      targetExamCode: selectedExam,
      targetExamDate: examInfo?.defaultExamDate || '2027-05-02',
    });

    if (onSuccess) {
      onSuccess();
    } else {
      closeAuthModal();
    }
  };

  return (
    <div
      id="student-auth-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-neutral-950 border border-neutral-800 text-white shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500 text-neutral-950 font-black text-xs flex items-center justify-center">
              NC
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Student Account Portal</h3>
              <p className="text-[11px] text-neutral-400">Manage enrollment, dispatches & mock tests</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status if already signed in */}
        {user && (
          <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-neutral-400 block">Logged in as:</span>
              <span className="font-bold text-white">{user.name}</span>
              <span className="text-neutral-400 block font-mono text-[11px]">{user.email}</span>
            </div>
            <button
              type="button"
              onClick={logout}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-rose-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-orange-400" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Pillai"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-orange-400" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              required
              placeholder="e.g. rahul@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-orange-400" />
              <span>WhatsApp Number (for weekly material drops)</span>
            </label>
            <input
              type="tel"
              required
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-orange-400" />
              <span>Target Exam / Main Goal</span>
            </label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              {SUPPORTED_EXAMS.map((ex) => (
                <option key={ex.code} value={ex.code} className="bg-neutral-950">
                  {ex.name} ({ex.defaultExamDate})
                </option>
              ))}
              <option value="AI_MASTERY" className="bg-neutral-950">
                AI Platform Mastery (Google AI Studio, ChatGPT 6, Zapier)
              </option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-neutral-950 font-bold text-xs hover:opacity-95 transition-opacity shadow-lg shadow-orange-500/20 flex items-center justify-center gap-1.5 cursor-pointer mt-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{user ? 'Save Profile & Update Goals' : 'Access Student Learning Portal'}</span>
          </button>

          <div className="flex flex-col items-center justify-center gap-1 text-[10px] text-neutral-500 text-center">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
              <span>Instant secure access across Web, WhatsApp & Mobile.</span>
            </div>
            <div>
              Need assistance?{' '}
              <a
                href="https://wa.me/918281644058?text=Hi%20NextClass%20Support,%20I%20need%20help%20with%20student%20registration"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline font-mono font-medium"
              >
                WhatsApp Helpline: +91 82816 44058
              </a>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
