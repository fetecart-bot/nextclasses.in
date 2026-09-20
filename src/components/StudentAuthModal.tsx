import { useState, type FormEvent } from 'react';
import { X, Lock, KeyRound, Eye, EyeOff, ShieldCheck, LogOut, Loader2, BookOpen, QrCode } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { COURSES_DATA } from '../data';

interface StudentAuthModalProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function StudentAuthModal({ onClose, onSuccess }: StudentAuthModalProps = {}) {
  const { closeAuthModal, user, loginWithCredentials, logout } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState(COURSES_DATA[0]?.id || 'course-aissee-sainik-6');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      closeAuthModal();
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanId = identifier.trim();
    const cleanPass = password.trim();

    if (!cleanId || !cleanPass) {
      setLoginError('Please enter both your Username/Email and Access Password.');
      return;
    }

    setIsSubmitting(true);
    const res = loginWithCredentials(cleanId, cleanPass, selectedCourseId);
    setIsSubmitting(false);

    if (res.success) {
      if (onSuccess) {
        onSuccess();
      } else {
        closeAuthModal();
      }
    } else {
      setLoginError(res.message || 'Invalid credentials. Access restricted to registered and paid students only.');
    }
  };

  return (
    <div
      id="student-auth-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-[#0b101b] border border-[#1e293b] text-white shadow-2xl p-6 sm:p-7 space-y-5 my-auto animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-neutral-950 font-black text-xs flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20">
              NC
            </div>
            <div>
              <h3 className="font-bold text-sm text-white leading-tight">Student Portal Sign In</h3>
              <p className="text-[11px] text-neutral-400">Restricted to Registered Students & Cadets</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status if already signed in */}
        {user ? (
          <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-neutral-400 block font-medium">Currently signed in as:</span>
                <span className="font-bold text-white text-sm">{user.name}</span>
                <span className="text-neutral-400 block font-mono text-xs">{user.email}</span>
                {user.username && (
                  <span className="text-orange-400 text-[11px] font-mono block">ID: {user.username}</span>
                )}
              </div>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/80 border border-red-800 text-rose-300 text-xs font-semibold hover:bg-red-900 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-neutral-950 font-bold text-xs transition-colors cursor-pointer"
            >
              Continue to Dashboard & Study Materials
            </button>
          </div>
        ) : (
          /* Secure Login Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 leading-relaxed flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold">Protected Student Portal</strong>
                <span>Random name and number sign-ins are strictly disabled. Only authenticated students with issued credentials may access course files, CBT mock tests, and weekly study packs.</span>
              </div>
            </div>

            {/* Course Selection Dropdown */}
            <div className="space-y-1">
              <label htmlFor="auth-course-select" className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-orange-400" />
                <span>Select Enrolled Course</span>
              </label>
              <div className="relative">
                <select
                  id="auth-course-select"
                  value={selectedCourseId}
                  onChange={(e) => {
                    setSelectedCourseId(e.target.value);
                    if (loginError) setLoginError(null);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-orange-500 font-medium cursor-pointer"
                >
                  {COURSES_DATA.map((course) => (
                    <option key={course.id} value={course.id} className="bg-[#0b101b] text-white">
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Identifier input */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-orange-400" />
                <span>Username or Registered Email</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. bijubpb78 or student email"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (loginError) setLoginError(null);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>

            {/* Password input */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-orange-400" />
                <span>Access Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (loginError) setLoginError(null);
                  }}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error banner */}
            {loginError && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs text-center font-medium animate-in fade-in-50">
                {loginError}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-neutral-950 font-bold text-xs hover:opacity-95 transition-opacity shadow-lg shadow-orange-500/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              <span>Verify & Access Student Portal</span>
            </button>

            {/* Help / Enrollment guidance */}
            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-[11px] text-neutral-400 text-center space-y-1">
              <p>
                💡 <strong className="text-neutral-200">Enrolled via UPI QR Code?</strong> Your credentials were generated and delivered to your registered email & phone upon verification.
              </p>
              <div className="pt-1 flex items-center justify-center gap-1 text-[10px] text-neutral-400">
                <QrCode className="w-3.5 h-3.5 text-orange-400" />
                <span>UPI ID: <strong className="text-orange-400 font-mono">8281644058@hdfc</strong></span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-1 text-[10px] text-neutral-500 text-center pt-1">
              <div>
                Need help recovering your credentials?{' '}
                <a
                  href="https://wa.me/918281644058?text=Hi%20Nextclasses.in%20Support,%20I%20need%20help%20with%20student%20portal%20login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline font-mono font-medium"
                >
                  WhatsApp: +91 82816 44058
                </a>
              </div>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

