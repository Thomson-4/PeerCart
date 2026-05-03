import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserPlus, Eye, EyeOff, Loader, Mail, Phone, Lock, User,
  ShieldCheck, Sparkles, ArrowRight, CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth as authApi } from '../services/api';

/* ─── Password strength meter ───────────────────────────────────── */
function StrengthBar({ password }) {
  const score = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-emerald-400'];

  if (!password) return null;
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : 'bg-border-color'}`}
          />
        ))}
      </div>
      <p className={`text-xs font-semibold ${score >= 3 ? 'text-emerald-400' : 'text-text-secondary'}`}>
        {labels[score]}
      </p>
    </div>
  );
}

/* ─── Reusable field — must be OUTSIDE Signup to keep focus on re-render ── */
function Field({ id, label, icon: Icon, type = 'text', placeholder, value, onChange, error: ferr, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold uppercase tracking-wide mb-2">
        {label}
      </label>
      <div className="relative">
        {Icon && <Icon size={16} className="absolute top-1/2 -translate-y-1/2 left-4 text-text-secondary pointer-events-none" />}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`input-base ${Icon ? 'pl-10' : ''} ${ferr ? 'border-red-400/50 focus:border-red-400' : ''}`}
        />
        {children}
      </div>
      {ferr && <p className="text-red-400 text-xs mt-1.5 font-medium">{ferr}</p>}
    </div>
  );
}

/* ─── Signup Page ───────────────────────────────────────────────── */
export default function Signup() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
  });
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm,  setShowConfirm]    = useState(false);
  const [loading,      setLoading]        = useState(false);
  const [error,        setError]          = useState('');
  const [fieldErrors,  setFieldErrors]    = useState({});

  const { login } = useAuth();
  const navigate  = useNavigate();

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setFieldErrors((fe) => ({ ...fe, [key]: '' }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Client-side validation
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!form.email && !form.phone) errs.email = 'Provide at least an email or phone number';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address';
    if (form.phone && !/^\+?[1-9]\d{9,14}$/.test(form.phone)) errs.phone = 'Enter a valid phone number';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setLoading(true);
    try {
      const data = await authApi.signup(
        form.name.trim(),
        form.email.trim() || undefined,
        form.phone.trim() || undefined,
        form.password,
        form.confirmPassword,
      );
      login(data.token, data.user);
      navigate('/feed');
    } catch (err) {
      // Server may return field-level errors array
      if (err.errors) {
        const fe = {};
        err.errors.forEach(({ path, msg }) => { fe[path] = msg; });
        setFieldErrors(fe);
      } else {
        setError(err.message || 'Signup failed — please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      {/* Ambient orbs */}
      <div className="orb w-80 h-80 bg-accent/20 fixed top-20 -left-20 -z-10 animate-blob" />
      <div className="orb w-64 h-64 bg-lime-400/15 fixed bottom-20 right-10 -z-10 animate-blob delay-1000" />

      <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-500">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-bold mb-5">
            <Sparkles size={14} />
            Join PeerCart
          </div>
          <h1 className="text-4xl font-black tracking-tight">
            Create your{' '}
            <span className="gradient-text">account</span>
          </h1>
          <p className="text-text-secondary mt-2">
            Buy and sell on your campus — it takes 30 seconds.
          </p>
        </div>

        <div className="glass-card gradient-stroke p-8">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Name */}
            <Field
              id="name" label="Full Name" icon={User}
              placeholder="Arjun Sharma"
              value={form.name} onChange={set('name')} error={fieldErrors.name}
            />

            {/* Email */}
            <Field
              id="email" label="Email Address" icon={Mail} type="email"
              placeholder="arjun@example.com  (or use phone below)"
              value={form.email} onChange={set('email')} error={fieldErrors.email}
            />

            {/* Phone */}
            <Field
              id="phone" label={<span>Phone Number <span className="text-text-secondary font-normal normal-case tracking-normal">(optional)</span></span>}
              icon={Phone} type="tel"
              placeholder="+919876543210"
              value={form.phone} onChange={set('phone')} error={fieldErrors.phone}
            />

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-color" />
              </div>
              <div className="relative flex justify-center text-xs text-text-secondary uppercase tracking-widest">
                <span className="bg-surface-alt px-3">Password</span>
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold uppercase tracking-wide mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute top-1/2 -translate-y-1/2 left-4 text-text-secondary pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Min. 6 characters"
                  className={`input-base pl-10 pr-12 ${fieldErrors.password ? 'border-red-400/50' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute top-1/2 -translate-y-1/2 right-4 text-text-secondary hover:text-text-primary transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-red-400 text-xs mt-1.5 font-medium">{fieldErrors.password}</p>}
              <StrengthBar password={form.password} />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm" className="block text-sm font-bold uppercase tracking-wide mb-2">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute top-1/2 -translate-y-1/2 left-4 text-text-secondary pointer-events-none" />
                <input
                  id="confirm"
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  placeholder="Re-enter your password"
                  className={`input-base pl-10 pr-12 ${fieldErrors.confirmPassword ? 'border-red-400/50' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute top-1/2 -translate-y-1/2 right-4 text-text-secondary hover:text-text-primary transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <CheckCircle2 size={16} className="absolute top-1/2 -translate-y-1/2 right-10 text-emerald-400" />
                )}
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1.5 font-medium">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Global error */}
            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            {/* Trust level info */}
            <div className="flex items-start gap-3 bg-accent/5 border border-accent/20 rounded-xl px-4 py-3">
              <ShieldCheck size={14} className="text-accent shrink-0 mt-0.5" />
              <p className="text-xs text-text-secondary leading-relaxed">
                You'll start at <strong className="text-text-primary">Trust Level 0</strong>. Verify your college email later to reach Level 1 and unlock selling.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full cta-gradient text-white font-extrabold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-lg shadow-accent/20 text-base"
            >
              {loading
                ? <Loader size={20} className="animate-spin" />
                : <><UserPlus size={20} /> Create Account</>
              }
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-color" />
            </div>
            <div className="relative flex justify-center text-xs text-text-secondary uppercase tracking-widest">
              <span className="bg-surface-alt px-3">Already have an account?</span>
            </div>
          </div>

          {/* Sign in links */}
          <div className="flex flex-col gap-3">
            <Link
              to="/login?tab=password"
              className="w-full text-center border border-border-color hover:border-accent/50 rounded-xl py-3 text-sm font-bold hover:text-accent transition-all flex items-center justify-center gap-2"
            >
              <ArrowRight size={15} /> Sign in with password
            </Link>
            <Link
              to="/login"
              className="w-full text-center text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Sign in with OTP instead
            </Link>
          </div>
        </div>

        {/* Footer note */}
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
