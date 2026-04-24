import { useState, useEffect } from 'react';
import {
  CheckCircle2, Star, ShieldCheck,
  Loader, LogOut, ChevronRight, Lock, Package,
} from 'lucide-react';
import { auth as authApi, listings as listingsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

/* ─── Trust level meta ──────────────────────────────────────────── */
const LEVELS = [
  {
    level: 0,
    label: 'Phone Verified',
    sublabel: 'Browse & post needs',
    color: 'text-text-secondary',
    bg: 'bg-surface-elevated',
    border: 'border-border-color',
  },
  {
    level: 1,
    label: 'Campus Verified',
    sublabel: 'Sell items · up to ₹1,500',
    color: 'text-accent',
    bg: 'bg-accent/10',
    border: 'border-accent/30',
  },
  {
    level: 2,
    label: 'Trusted Student',
    sublabel: 'Rent items · up to ₹10,000',
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    border: 'border-green-400/30',
  },
  {
    level: 3,
    label: 'Campus Rep',
    sublabel: 'Priority matching · lower fees · verified badge',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/30',
  },
];

/* ─── Email OTP verification sub-form ───────────────────────────── */
function EmailVerifyForm({ onVerified }) {
  const [email,   setEmail]   = useState('');
  const [otp,     setOtp]     = useState('');
  const [step,    setStep]    = useState('email'); // 'email' | 'otp'
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const { refreshUser } = useAuth();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.sendEmailOtp(email);
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
      await authApi.verifyEmailOtp(email, otp);
      await refreshUser();
      onVerified?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'otp') {
    return (
      <form onSubmit={handleVerifyOtp} className="mt-4 space-y-3">
        <p className="text-xs text-text-secondary">OTP sent to <strong className="text-text-primary">{email}</strong></p>
        <div className="flex gap-2">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="6-digit OTP"
            maxLength={6}
            className="input-base flex-1 text-center text-xl tracking-[0.4em] font-black"
            autoFocus
            required
          />
          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="px-4 py-2 bg-accent text-white font-bold rounded-xl text-sm disabled:opacity-60 flex items-center gap-1.5 whitespace-nowrap"
          >
            {loading ? <Loader size={14} className="animate-spin" /> : <><ShieldCheck size={14} /> Verify</>}
          </button>
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button type="button" onClick={() => { setStep('email'); setOtp(''); setError(''); }}
          className="text-xs text-text-secondary hover:text-text-primary transition-colors">
          ← Change email
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSendOtp} className="mt-4 space-y-3">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="yourname@reva.edu.in"
          className="input-base flex-1 text-sm"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-accent text-white font-bold rounded-xl text-sm hover:bg-accent-hover transition-colors disabled:opacity-60 flex items-center gap-1.5 whitespace-nowrap"
        >
          {loading ? <Loader size={14} className="animate-spin" /> : <>Send OTP <ChevronRight size={14} /></>}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <p className="text-xs text-text-secondary">Must use your campus email (@reva.edu.in)</p>
    </form>
  );
}

/* ─── Trust Journey ─────────────────────────────────────────────── */
function TrustJourney({ user }) {
  const current = user?.trustLevel ?? 0;
  const txCount = user?.completedTransactions ?? 0;
  const [emailVerified, setEmailVerified] = useState(false);

  return (
    <div className="bento-panel p-6 md:p-7">
      <h2 className="text-xl font-black mb-5 tracking-tight">Your Trust Journey</h2>
      <div className="space-y-3">
        {LEVELS.map(({ level, label, sublabel, color, bg, border }) => {
          const done    = current > level;
          const active  = current === level;

          return (
            <div
              key={level}
              className={`rounded-2xl border p-4 transition-all ${
                done   ? 'border-border-color bg-surface/40 opacity-70' :
                active ? `${border} ${bg}` :
                         'border-border-color bg-surface/20 opacity-50'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Step indicator */}
                <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 ${
                  done   ? 'bg-green-400/20 text-green-400' :
                  active ? `${bg} ${color} border ${border}` :
                           'bg-surface-elevated text-text-secondary border border-border-color'
                }`}>
                  {done ? <CheckCircle2 size={16} /> : level}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-bold text-sm ${done ? 'text-text-secondary line-through' : active ? color : 'text-text-secondary'}`}>
                      {label}
                    </span>
                    {active && (
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                    {done && (
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-green-400/20 text-green-400 px-2 py-0.5 rounded-full">
                        Complete
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">{sublabel}</p>

                  {/* Level 0 → 1 action: verify email via OTP */}
                  {active && level === 0 && !emailVerified && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-text-primary mb-1">
                        Verify your @reva.edu.in email to unlock selling
                      </p>
                      <EmailVerifyForm onVerified={() => setEmailVerified(true)} />
                    </div>
                  )}
                  {active && level === 0 && emailVerified && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-green-400 bg-green-400/10 border border-green-400/20 rounded-xl px-3 py-2">
                      <CheckCircle2 size={14} /> Email verified! Refresh the page to see Level 1.
                    </div>
                  )}

                  {/* Level 1 → 2 action: transaction progress */}
                  {active && level === 1 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-text-primary mb-2">
                        Complete 3 transactions rated 4★+ to reach Level 2
                      </p>
                      <div className="flex gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className={`h-2 flex-1 rounded-full ${
                              i < txCount ? 'bg-accent' : 'bg-surface-elevated'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-text-secondary mt-1.5">{txCount} / 3 completed</p>
                    </div>
                  )}

                  {/* Level 2 → 3 action */}
                  {active && level === 2 && (
                    <p className="text-xs text-text-secondary mt-2">
                      Keep completing transactions and maintaining high ratings to earn Campus Rep status.
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const STATUS_STYLES = {
  active:  'bg-green-400/10 text-green-400 border-green-400/30',
  sold:    'bg-text-secondary/10 text-text-secondary border-border-color',
  rented:  'bg-accent/10 text-accent border-accent/30',
  expired: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30',
};

function MyListings() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listingsApi.getMine()
      .then((d) => setItems(d.listings || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="bento-panel p-6 flex items-center gap-3 text-text-secondary">
      <Loader size={18} className="animate-spin" /> Loading your listings…
    </div>
  );

  return (
    <div className="bento-panel p-6 md:p-7">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
          <Package size={20} className="text-accent" /> My Listings
        </h2>
        <Link to="/add" className="text-sm font-bold text-accent hover:underline">+ New listing</Link>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-10 text-text-secondary">
          <Package size={36} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">You haven't posted anything yet.</p>
          <Link to="/add" className="mt-3 inline-block text-sm text-accent hover:underline">Post your first listing →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item._id} className="flex items-center gap-4 p-3 rounded-xl border border-border-color bg-surface/40 hover:border-accent/30 transition-colors">
              {item.images?.[0] ? (
                <img src={item.images[0]} alt={item.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-surface-elevated" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-surface-elevated flex-shrink-0 flex items-center justify-center text-2xl">
                  📦
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-text-primary truncate">{item.title}</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  ₹{((item.price || 0) / 100).toLocaleString('en-IN')}
                  {item.type === 'rent' ? '/day' : ''} · {item.category}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border capitalize ${STATUS_STYLES[item.status] || STATUS_STYLES.active}`}>
                  {item.status}
                </span>
                <span className={`text-[10px] font-semibold uppercase ${item.type === 'rent' ? 'text-accent' : 'text-text-secondary'}`}>
                  {item.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────── */
export default function Profile() {
  const { user: ctxUser, logout, refreshUser } = useAuth();
  const [user,    setUser]    = useState(ctxUser);
  const [loading, setLoading] = useState(!ctxUser);
  const [error,   setError]   = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    authApi.me()
      .then((data) => { setUser(data.user); refreshUser(); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center gap-3">
        <Loader size={24} className="animate-spin text-accent" />
        <p className="text-text-secondary font-semibold">Loading profile…</p>
      </div>
    );
  }

  if (error) {
    return <div className="bento-panel p-6 text-center text-red-400">{error}</div>;
  }

  const trustScore   = Math.round((user?.averageRating || 0) * 20);
  const avatarUrl    = user?.avatar || null;
  const initials     = (user?.name || user?.phone || '?').slice(0, 2).toUpperCase();
  const currentLevel = LEVELS[user?.trustLevel ?? 0];

  return (
    <div className="w-full animate-in fade-in duration-700 pb-20 space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 py-8 border-b border-border-color">
        <div className="relative">
          <div className="w-28 h-28 rounded-full border-4 border-surface p-1 shadow-lg bg-gradient-to-tr from-accent to-lime-green">
            {avatarUrl ? (
              <img src={avatarUrl} alt={user?.name || 'User'} className="w-full h-full object-cover rounded-full bg-surface" />
            ) : (
              <div className="w-full h-full rounded-full bg-surface flex items-center justify-center text-2xl font-black text-accent select-none">
                {initials}
              </div>
            )}
          </div>
          {user?.emailVerified && (
            <div className="absolute -bottom-2 right-1 bg-text-primary text-background flex items-center gap-1 px-2.5 py-1 rounded-full border-2 border-surface shadow-sm">
              <CheckCircle2 size={11} className="text-lime-green" />
              <span className="text-[10px] font-extrabold uppercase tracking-wide">Verified</span>
            </div>
          )}
        </div>

        <div className="text-center md:text-left flex-1">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">{user?.name || user?.phone}</h1>
              <div className={`inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 rounded-full text-xs font-bold border ${currentLevel.bg} ${currentLevel.border} ${currentLevel.color}`}>
                <ShieldCheck size={12} />
                Level {user?.trustLevel} — {currentLevel.label}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="self-center flex items-center gap-2 px-4 py-2 border border-border-color text-text-secondary hover:text-red-400 hover:border-red-400/30 font-bold text-sm rounded-xl transition-colors"
            >
              <LogOut size={15} /> Log out
            </button>
          </div>
          <p className="text-sm text-text-secondary">{user?.email || 'No email verified yet'} · {user?.phone}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bento-panel p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Trust Score</p>
            <p className="text-3xl font-extrabold text-accent">{trustScore}<span className="text-sm font-normal text-text-secondary">/100</span></p>
          </div>
          <ShieldCheck size={40} className="text-accent/20" />
        </div>
        <div className="bento-panel p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Rating</p>
            <p className="text-3xl font-extrabold text-text-primary flex items-end gap-1.5">
              {(user?.averageRating || 0).toFixed(1)}
              <Star size={18} className="text-yellow-400 mb-0.5" fill="currentColor" />
            </p>
          </div>
          <p className="text-sm font-bold text-text-secondary">{user?.completedTransactions || 0} deals</p>
        </div>
        <div className="bento-panel p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Can Sell Up To</p>
            <p className="text-2xl font-extrabold text-text-primary">
              {user?.trustLevel >= 2 ? '₹10,000' : user?.trustLevel >= 1 ? '₹1,500' : '—'}
            </p>
          </div>
          <Lock size={36} className="text-text-secondary/20" />
        </div>
      </div>

      {/* Trust Journey */}
      <TrustJourney user={user} />

      {/* My Listings */}
      <MyListings />

    </div>
  );
}
