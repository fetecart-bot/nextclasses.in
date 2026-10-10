import LanguageSwitch from '../components/LanguageSwitch';
import { useLanguage } from '../context/LanguageContext';
import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import StudentPortalModal from '../components/StudentPortalModal';
import InteractiveMockTestModal from '../components/InteractiveMockTestModal';

/** Dedicated student entry: no storefront, cart, enrolment or purchase links. */
export default function StudentAppPage() {
  const { t: translateUI } = useLanguage();

  const { user, loginWithCredentials, logout } = useAuth();
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(true);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [testId, setTestId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const account = user;
    if (!account?.password || !(account.username || account.email)) {
      setChecking(false);
      return;
    }
    loginWithCredentials(account.username || account.email, account.password, undefined, { serverOnly: true })
      .then((result) => {
        if (cancelled) return;
        setVerified(Boolean(result.success && result.user?.enrolledCourseIds?.length));
        setChecking(false);
        if (!result.success) setError('Connect to the internet and sign in to verify your account.');
      });
    return () => { cancelled = true; };
  }, []);

  async function signIn(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const result = await loginWithCredentials(identifier.trim(), password, undefined, { serverOnly: true });
      if (result.success && result.user?.enrolledCourseIds?.length) setVerified(true);
      else setError('Unable to sign in. Check your credentials, internet connection and course assignment.');
    } catch {
      setError('Unable to connect. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  const signOut = () => { logout(); setVerified(false); setPassword(''); setTestId(null); };
  if (checking) return <main className="min-h-screen bg-neutral-950 text-white grid place-items-center">{translateUI("Checking your student account…")}</main>;
  if (verified && user?.enrolledCourseIds?.length) {
    return <main className="min-h-screen bg-neutral-950 text-white">
      {testId ? <InteractiveMockTestModal initialTestId={testId} onClose={() => setTestId(null)} onOpenStudentPortal={() => setTestId(null)} />
        : <StudentPortalModal initialCourseId={user.enrolledCourseIds[0]} onClose={signOut} onLaunchMockTest={setTestId} />}
    </main>;
  }
  return <main className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
    <section className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900 p-7">
      <div className="flex justify-center mb-4"><LanguageSwitch /></div>
      <img src="/nextclasses-logo-512.png" alt="NextClasses" className="h-20 w-20 mx-auto mb-5 rounded-2xl" />
      <h1 className="text-2xl font-bold text-center">{translateUI("Welcome to NextClasses")}</h1>
      <p className="mt-3 text-neutral-400 text-center">{translateUI("Sign in to access your assigned courses and AI mentor.")}</p>
      <form onSubmit={signIn} className="mt-7 space-y-4">
        <label className="block">{translateUI("Username or email")}<input required autoComplete="username" value={identifier} onChange={event => setIdentifier(event.target.value)} className="mt-2 w-full rounded-xl bg-neutral-950 border border-neutral-700 p-3" /></label>
        <label className="block">{translateUI("Password")}<input required type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} className="mt-2 w-full rounded-xl bg-neutral-950 border border-neutral-700 p-3" /></label>
        {error && <p role="alert" className="text-orange-300">{error}</p>}
        <button disabled={busy} className="w-full rounded-xl bg-orange-500 text-black font-bold p-3 disabled:opacity-50">{translateUI(busy ? 'Signing in…' : 'Sign in')}</button>
      </form>
      <p className="text-sm text-neutral-400 mt-5">{translateUI("Use the student credentials supplied by NextClasses. Internet access is required to sign in and use the AI mentor.")}</p>
    </section>
  </main>;
}
