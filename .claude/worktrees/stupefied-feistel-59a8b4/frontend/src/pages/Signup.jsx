import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserPlus, Loader, Mail, User, ShieldCheck, Sparkles, ArrowRight, LogIn,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth as authApi } from '../services/api';

export default function Signup() {
  const [step,    setStep]    = useState('form'); // 'form' | 'otp'
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [otp,     setOtp]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [alreadyExists, setAlreadyExists] = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  /* ── Step 1: send OTP ─────────────────────────────────────────── */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setAlreadyExists(false);

    if (!name.trim() || name.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }

    setLoading(true);
    try {
      await authApi.sendEmailOtp(email, 'signup', name.trim());
      setStep('otp');
    } catch (err) {
      if (err.status === 409) {
        // Account already exists
        setAlreadyExists(true);
        setError(err.message);
      } else {
        setError(err.message || 'Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2: verify OTP ───────────────────────────────────────── */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.verifyEmailOtp(email, otp);
      login(data.token, data.user);
      navigate('/feed');
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 1 UI ────────────────────────────────────────────────── */
  if (step === 'form') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 py-12">
        <div className="orb w-80 h-80 bg-accent/20 fixed top-20 -left-20 -z-10 animate-blob" />
        <div className="orb w-64 h-64 bg-lime-400/15 fixed bottom-20 right-10 -z-10 animate-blob delay-1000" />

        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-bold mb-5">
              <Sparkles size={14} /> Join PeerCart
            </div>
            <h1 className="text-4xl font-black tracking-tight">
              Create your <span className="gradient-text">account</span>
            </h1>
            <p className="text-text-secondary mt-2">
              Use your college email — verified instantly, straight to <strong>Trust Level 1</strong>.
            </p>
          </div>

          <div className="glass-card gradient-stroke p-8">
            <form onSubmit={handleSendOtp} className="space-y-5" noValidate>

              {/* Name */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wide mb-2">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute top-1/2 -translate-y-1/2 left-4 text-text-secondary" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(''); }}
                    placeholder="Arjun Sharma"
                    className="input-base pl-10"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* College Email */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wide mb-2">College Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute top-1/2 -translate-y-1/2 left-4 text-text-secondary" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); setAlreadyExists(false); }}
                    placeholder="yourname@reva.edu.in"
                    className="input-base pl-10"
                    required
                  />
                </div>
              </div>

              {/* Info */}
              <div className="flex items-start gap-3 bg-accent/5 border border-accent/20 rounded-xl px-4 py-3">
                <ShieldCheck size={14} className="text-accent shrink-0 mt-0.5" />
                <p className="text-xs text-text-secondary leading-relaxed">
                  Only <strong>@reva.edu.in</strong> emails are accepted. We'll send an OTP to verify it's really you — no password needed.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 space-y-1">
                  <p>{error}</p>
                  {alreadyExists && (
                    <p className="text-text-secondary text-xs">
                      <Link to="/login" className="text-accent font-bold hover:underline inline-flex items-center gap-1">
                        <LogIn size={12} /> Sign in instead →
                      </Link>
                    </p>
                  )}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !name.trim() || !email}
                className="w-full cta-gradient text-white font-extrabold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-lg shadow-accent/20 text-base"
              >
                {loading
                  ? <Loader size={20} className="animate-spin" />
                  : <><ArrowRight size={20} /> Send OTP to my college email</>}
              </button>
            </form>

            {/* Already have account */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-color" />
              </div>
              <div className="relative flex justify-center text-xs text-text-secondary uppercase tracking-widest">
                <span className="bg-surface-alt px-3">Already have an account?</span>
              </div>
            </div>

            <Link
              to="/login"
              className="w-full text-center border border-border-color hover:border-accent/50 rounded-xl py-3 text-sm font-bold hover:text-accent transition-all flex items-center justify-center gap-2"
            >
              <LogIn size={15} /> Sign in
            </Link>
          </div>

          <p className="text-center text-xs text-text-secondary mt-6">
            By signing up you agree to the{' '}
            <span className="text-accent cursor-pointer hover:underline">Terms of Service</span>
            {' '}and{' '}
            <span className="text-accent cursor-pointer hover:underline">Privacy Policy</span>.
          </p>
        </div>
      </div>
    );
  }

  /* ── Step 2: OTP entry ────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="orb w-72 h-72 bg-accent/20 fixed top-10 -right-16 -z-10 animate-blob" />

      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 mb-5">
            <ShieldCheck size={32} className="text-accent" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Check your inbox</h1>
          <p className="text-text-secondary mt-2">
            OTP sent to <strong className="text-text-primary">{email}</strong>
          </p>
        </div>

        <div className="glass-card gradient-stroke p-8">
          <form onSubmit={handleVerifyOtp} className="space-y-5">

            <div>
              <label className="block text-sm font-bold uppercase tracking-wide mb-1">Enter OTP</label>
              <p className="text-xs text-text-secondary mb-4">Valid for 10 minutes · Do not share</p>
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

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full cta-gradient text-white font-extrabold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 hover:-translate-y-0.5 transition-all"
            >
              {loading
                ? <Loader size={20} className="animate-spin" />
                : <><UserPlus size={20} /> Create Account & Enter</>}
            </button>

            <button
              type="button"
              onClick={() => { setStep('form'); setOtp(''); setError(''); }}
              className="w-full text-text-secondary text-sm hover:text-text-primary transition-colors"
            >
              ← Change email
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
