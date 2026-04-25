import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Loader, Phone, Mail, Terminal, Lock, Eye, EyeOff, UserPlus, KeyRound, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth as authApi } from '../services/api';

/* ─── Phone OTP tab ─────────────────────────────────────────────── */
function PhoneTab() {
  const [step,    setStep]    = useState('phone');
  const [phone,   setPhone]   = useState('');
  const [otp,     setOtp]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.sendOtp(phone);
      setStep('otp');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.verifyOtp(phone, otp);
      login(data.token, data.user);
      navigate('/feed');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'phone') {
    return (
      <form onSubmit={handleSendOtp} className="space-y-5">
        <div>
          <label className="block text-sm font-bold uppercase tracking-wide mb-2">Phone Number</label>
          <div className="relative">
            <Phone size={16} className="absolute top-1/2 -translate-y-1/2 left-4 text-text-secondary" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+919876543210"
              className="input-base pl-10 text-lg"
              required
              autoFocus
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full cta-gradient text-white font-extrabold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 hover:-translate-y-0.5 transition-all">
          {loading ? <Loader size={20} className="animate-spin" /> : <><ArrowRight size={20} /> Send OTP</>}
        </button>

        <div className="flex items-start gap-3 bg-surface/60 border border-border-color rounded-xl px-4 py-3">
          <Terminal size={14} className="text-text-secondary shrink-0 mt-0.5" />
          <p className="text-xs text-text-secondary">OTP appears in your <strong>backend terminal</strong> (dev mode). Logs in at <strong>Level 0</strong> — verify email later to unlock selling.</p>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerifyOtp} className="space-y-5">
      <div>
        <label className="block text-sm font-bold uppercase tracking-wide mb-1">Enter OTP</label>
        <p className="text-sm text-text-secondary mb-3">Sent to {phone}</p>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="••••••"
          maxLength={6}
          className="input-base text-3xl text-center tracking-[0.6em] font-black"
          required
          autoFocus
        />
      </div>

      {error && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{error}</p>}

      <button type="submit" disabled={loading || otp.length < 6}
        className="w-full cta-gradient text-white font-extrabold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 hover:-translate-y-0.5 transition-all">
        {loading ? <Loader size={20} className="animate-spin" /> : <><ShieldCheck size={20} /> Verify & Enter</>}
      </button>

      <button type="button" onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
        className="w-full text-text-secondary text-sm hover:text-text-primary transition-colors">
        ← Change number
      </button>
    </form>
  );
}

/* ─── College Email OTP tab ─────────────────────────────────────── */
function EmailTab() {
  const [step,       setStep]       = useState('email');
  const [email,      setEmail]      = useState('');
  const [otp,        setOtp]        = useState('');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [noAccount,  setNoAccount]  = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setNoAccount(false);
    setLoading(true);
    try {
      await authApi.sendEmailOtp(email, 'login');
      setStep('otp');
    } catch (err) {
      if (err.status === 404) {
        setNoAccount(true);
        setError(err.message);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.verifyEmailOtp(email, otp);
      login(data.token, data.user);
      navigate('/feed');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'email') {
    return (
      <form onSubmit={handleSendOtp} className="space-y-5">
        <div>
          <label className="block text-sm font-bold uppercase tracking-wide mb-2">College Email</label>
          <div className="relative">
            <Mail size={16} className="absolute top-1/2 -translate-y-1/2 left-4 text-text-secondary" />
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); setNoAccount(false); }}
              placeholder="yourname@reva.edu.in"
              className="input-base pl-10 text-lg"
              required
              autoFocus
            />
          </div>
        </div>

        {/* Error — with sign-up prompt if no account found */}
        {error && (
          <div className={`text-sm rounded-xl px-4 py-3 border space-y-2 ${noAccount ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' : 'text-red-400 bg-red-400/10 border-red-400/20'}`}>
            <div className="flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
            {noAccount && (
              <Link
                to="/signup"
                className="flex items-center gap-1.5 text-accent font-bold text-xs hover:underline"
              >
                <UserPlus size={13} /> Create a new account →
              </Link>
            )}
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full cta-gradient text-white font-extrabold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 hover:-translate-y-0.5 transition-all">
          {loading ? <Loader size={20} className="animate-spin" /> : <><ArrowRight size={20} /> Send OTP</>}
        </button>

        <div className="flex items-start gap-3 bg-accent/5 border border-accent/20 rounded-xl px-4 py-3">
          <ShieldCheck size={14} className="text-accent shrink-0 mt-0.5" />
          <p className="text-xs text-text-secondary">
            Sign in with your <strong>@reva.edu.in</strong> email via one-time password.
            No account yet? <Link to="/signup" className="text-accent font-bold hover:underline">Sign up first →</Link>
          </p>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerifyOtp} className="space-y-5">
      <div>
        <label className="block text-sm font-bold uppercase tracking-wide mb-1">Enter OTP</label>
        <p className="text-sm text-text-secondary mb-3">Sent to {email}</p>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="••••••"
          maxLength={6}
          className="input-base text-3xl text-center tracking-[0.6em] font-black"
          required
          autoFocus
        />
      </div>

      {error && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{error}</p>}

      <button type="submit" disabled={loading || otp.length < 6}
        className="w-full cta-gradient text-white font-extrabold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 hover:-translate-y-0.5 transition-all">
        {loading ? <Loader size={20} className="animate-spin" /> : <><ShieldCheck size={20} /> Verify & Sign In</>}
      </button>

      <button type="button" onClick={() => { setStep('email'); setOtp(''); setError(''); setNoAccount(false); }}
        className="w-full text-text-secondary text-sm hover:text-text-primary transition-colors">
        ← Change email
      </button>
    </form>
  );
}

/* ─── Password Sign-in tab ──────────────────────────────────────── */
function PasswordTab() {
  const [identifier, setIdentifier] = useState('');
  const [password,   setPassword]   = useState('');
  const [showPw,     setShowPw]     = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.signin(identifier, password);
      login(data.token, data.user);
      navigate('/feed');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-bold uppercase tracking-wide mb-2">Email or Phone</label>
        <div className="relative">
          <Mail size={16} className="absolute top-1/2 -translate-y-1/2 left-4 text-text-secondary" />
          <input
            type="text"
            value={identifier}
            onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
            placeholder="you@example.com or +91..."
            className="input-base pl-10"
            required
            autoFocus
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold uppercase tracking-wide mb-2">Password</label>
        <div className="relative">
          <Lock size={16} className="absolute top-1/2 -translate-y-1/2 left-4 text-text-secondary" />
          <input
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            placeholder="Your password"
            className="input-base pl-10 pr-12"
            required
          />
          <button
            type="button"
            onClick={() => setShowPw((p) => !p)}
            className="absolute top-1/2 -translate-y-1/2 right-4 text-text-secondary hover:text-text-primary transition-colors"
            tabIndex={-1}
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !identifier || !password}
        className="w-full cta-gradient text-white font-extrabold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 hover:-translate-y-0.5 transition-all"
      >
        {loading ? <Loader size={20} className="animate-spin" /> : <><KeyRound size={20} /> Sign In</>}
      </button>

      <div className="text-center">
        <Link
          to="/signup"
          className="text-sm text-text-secondary hover:text-accent transition-colors inline-flex items-center gap-1"
        >
          <UserPlus size={13} /> Don't have an account? Sign up
        </Link>
      </div>
    </form>
  );
}

/* ─── Main Login Page ───────────────────────────────────────────── */
export default function Login() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'password' ? 'password' : searchParams.get('tab') === 'phone' ? 'phone' : 'email';
  const [tab, setTab] = useState(defaultTab); // 'email' | 'phone' | 'password'

  const TABS = [
    { id: 'email',    label: 'College Email', icon: Mail },
    { id: 'phone',    label: 'Mobile OTP',   icon: Phone },
    { id: 'password', label: 'Password',      icon: Lock },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Ambient orb */}
      <div className="orb w-72 h-72 bg-accent/20 fixed top-10 -right-16 -z-10 animate-blob" />

      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 mb-5">
            <ShieldCheck size={32} className="text-accent" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            Welcome back to <span className="gradient-text">PeerCart</span>
          </h1>
          <p className="text-text-secondary mt-2">Sign in to your account. New here? <Link to="/signup" className="text-accent font-bold hover:underline">Sign up →</Link></p>
        </div>

        <div className="glass-card gradient-stroke p-8 space-y-6">
          {/* Tab toggle — 3 tabs */}
          <div className="flex rounded-xl border border-border-color bg-surface/70 p-1 gap-0.5">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-1 rounded-lg py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  tab === id ? 'bg-accent text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tab === 'phone'    && <PhoneTab />}
          {tab === 'email'    && <EmailTab />}
          {tab === 'password' && <PasswordTab />}
        </div>

        {/* Sign up link */}
        <p className="text-center text-sm text-text-secondary mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-accent font-bold hover:underline inline-flex items-center gap-1">
            <UserPlus size={13} /> Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
