import { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2, Star, ShieldCheck,
  Loader, LogOut, ChevronRight, Lock, Package, ShoppingBag,
  Pencil, Trash2, CheckSquare, Camera,
} from 'lucide-react';
import { auth as authApi, listings as listingsApi, upload as uploadApi } from '../services/api';
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

/* ─── Trust progression thresholds (mirrors backend trustProgression.js) ── */
const TRUST_THRESHOLDS = {
  2: { minTx: 3,  minRating: 4.0 },
  3: { minTx: 10, minRating: 4.3 },
};

/* ─── Dual-requirement progress bar ─────────────────────────────── */
function DualProgress({ txCount, rating, minTx, minRating }) {
  const txPct     = Math.min(100, Math.round((txCount / minTx) * 100));
  const ratingPct = Math.min(100, Math.round((rating  / minRating) * 100));
  const txDone     = txCount >= minTx;
  const ratingDone = rating  >= minRating;

  return (
    <div className="mt-3 space-y-2.5">
      {/* Transactions bar */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className={`font-semibold ${txDone ? 'text-green-400' : 'text-text-secondary'}`}>
            {txDone ? '✓' : ''} Completed deals
          </span>
          <span className={`font-bold ${txDone ? 'text-green-400' : 'text-accent'}`}>
            {txCount} / {minTx}
          </span>
        </div>
        <div className="h-2 rounded-full bg-surface-elevated overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${txDone ? 'bg-green-400' : 'bg-accent'}`}
            style={{ width: `${txPct}%` }}
          />
        </div>
      </div>
      {/* Rating bar */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className={`font-semibold ${ratingDone ? 'text-green-400' : 'text-text-secondary'}`}>
            {ratingDone ? '✓' : ''} Average rating
          </span>
          <span className={`font-bold ${ratingDone ? 'text-green-400' : 'text-yellow-400'}`}>
            {rating.toFixed(1)} / {minRating}★
          </span>
        </div>
        <div className="h-2 rounded-full bg-surface-elevated overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${ratingDone ? 'bg-green-400' : 'bg-yellow-400'}`}
            style={{ width: `${ratingPct}%` }}
          />
        </div>
      </div>
      {/* Status line */}
      <p className="text-xs text-text-secondary">
        {txDone && ratingDone
          ? '🎉 Both requirements met — level up coming after next transaction!'
          : [
              !txDone    && `${minTx - txCount} more deal${minTx - txCount > 1 ? 's' : ''} needed`,
              !ratingDone && `maintain ${minRating}★ avg rating`,
            ].filter(Boolean).join(' · ')}
      </p>
    </div>
  );
}

/* ─── Trust Journey ─────────────────────────────────────────────── */
function TrustJourney({ user }) {
  const current  = user?.trustLevel ?? 0;
  const txCount  = user?.completedTransactions ?? 0;
  const rating   = user?.averageRating ?? 0;
  const [emailVerified, setEmailVerified] = useState(false);

  const UNLOCKS = [
    'Browse listings · post needs',
    'Sell items · transactions up to ₹1,500',
    'Rent items · transactions up to ₹10,000',
    'Priority matching · verified badge · ambassador perks',
  ];

  return (
    <div className="bento-panel p-6 md:p-7">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-black tracking-tight">Trust Journey</h2>
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${LEVELS[current].bg} ${LEVELS[current].border} ${LEVELS[current].color}`}>
          Level {current} — {LEVELS[current].label}
        </span>
      </div>

      <div className="space-y-3">
        {LEVELS.map(({ level, label, color, bg, border }) => {
          const done   = current > level;
          const active = current === level;
          const next   = level === current + 1;

          return (
            <div
              key={level}
              className={`rounded-2xl border p-4 transition-all ${
                done   ? 'border-border-color bg-surface/30 opacity-60' :
                active ? `${border} ${bg}` :
                next   ? 'border-border-color bg-surface/40' :
                         'border-border-color bg-surface/20 opacity-40'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Indicator */}
                <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 ${
                  done   ? 'bg-green-400/20 text-green-400 border border-green-400/30' :
                  active ? `${bg} ${color} border ${border}` :
                           'bg-surface-elevated text-text-secondary border border-border-color'
                }`}>
                  {done ? <CheckCircle2 size={15} /> : level}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-bold text-sm ${done ? 'text-text-secondary' : active ? color : 'text-text-secondary'}`}>
                      {label}
                    </span>
                    {active && <span className="text-[10px] font-bold uppercase tracking-widest bg-accent/20 text-accent px-2 py-0.5 rounded-full">Current</span>}
                    {done   && <span className="text-[10px] font-bold uppercase tracking-widest bg-green-400/20 text-green-400 px-2 py-0.5 rounded-full">✓ Done</span>}
                    {next   && <span className="text-[10px] font-bold uppercase tracking-widest bg-surface-elevated text-text-secondary px-2 py-0.5 rounded-full">Next</span>}
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">{UNLOCKS[level]}</p>

                  {/* L0 active → verify email */}
                  {active && level === 0 && !emailVerified && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-text-primary mb-1">Verify your @reva.edu.in email to unlock selling</p>
                      <EmailVerifyForm onVerified={() => setEmailVerified(true)} />
                    </div>
                  )}
                  {active && level === 0 && emailVerified && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-green-400 bg-green-400/10 border border-green-400/20 rounded-xl px-3 py-2">
                      <CheckCircle2 size={14} /> Email verified! Refresh to see Level 1.
                    </div>
                  )}

                  {/* L1 active → show dual progress toward L2 */}
                  {active && level === 1 && (
                    <DualProgress
                      txCount={txCount} rating={rating}
                      minTx={TRUST_THRESHOLDS[2].minTx}
                      minRating={TRUST_THRESHOLDS[2].minRating}
                    />
                  )}

                  {/* L2 active → show dual progress toward L3 */}
                  {active && level === 2 && (
                    <DualProgress
                      txCount={txCount} rating={rating}
                      minTx={TRUST_THRESHOLDS[3].minTx}
                      minRating={TRUST_THRESHOLDS[3].minRating}
                    />
                  )}

                  {/* Next level preview — show requirements */}
                  {next && level > 0 && TRUST_THRESHOLDS[level] && (
                    <p className="text-xs text-text-secondary mt-1.5">
                      Requires {TRUST_THRESHOLDS[level].minTx} completed deals
                      · {TRUST_THRESHOLDS[level].minRating}★ avg rating
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

function ListingCard({ item, onDeleted, onStatusChanged }) {
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmSold,   setConfirmSold]   = useState(false);
  const [busy,          setBusy]          = useState(false);

  const handleDelete = async () => {
    setBusy(true);
    try {
      await listingsApi.remove(item._id);
      onDeleted(item._id);
    } catch (_) {}
    finally { setBusy(false); setConfirmDelete(false); }
  };

  const handleMarkSold = async () => {
    setBusy(true);
    const newStatus = item.type === 'rent' ? 'rented' : 'sold';
    try {
      await listingsApi.markStatus(item._id, newStatus);
      onStatusChanged(item._id, newStatus);
    } catch (_) {}
    finally { setBusy(false); setConfirmSold(false); }
  };

  return (
    <div className="flex flex-col gap-3 p-3 rounded-xl border border-border-color bg-surface/40">
      {/* Main row */}
      <div className="flex items-center gap-3">
        {item.images?.[0] ? (
          <img src={item.images[0]} alt={item.title}
            className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-surface-elevated" />
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

      {/* Action buttons row */}
      <div className="flex items-center gap-2 pt-1 border-t border-border-color/50">

        {/* Edit */}
        <button
          onClick={() => navigate(`/edit/${item._id}`)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-border-color rounded-lg text-text-secondary hover:border-accent/50 hover:text-accent transition-colors"
        >
          <Pencil size={12} /> Edit
        </button>

        {/* Mark as sold/rented — only for active listings */}
        {item.status === 'active' && (
          confirmSold ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-text-secondary">
                Mark as {item.type === 'rent' ? 'rented' : 'sold'}?
              </span>
              <button
                onClick={handleMarkSold}
                disabled={busy}
                className="px-2.5 py-1.5 text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
              >
                {busy ? <Loader size={11} className="animate-spin" /> : 'Yes'}
              </button>
              <button
                onClick={() => setConfirmSold(false)}
                className="px-2.5 py-1.5 text-xs font-bold border border-border-color rounded-lg text-text-secondary hover:text-text-primary transition-colors"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmSold(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-border-color rounded-lg text-text-secondary hover:border-emerald-500/50 hover:text-emerald-400 transition-colors"
            >
              <CheckSquare size={12} /> Mark {item.type === 'rent' ? 'Rented' : 'Sold'}
            </button>
          )
        )}

        {/* Delete */}
        <div className="ml-auto">
          {confirmDelete ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-text-secondary">Delete?</span>
              <button
                onClick={handleDelete}
                disabled={busy}
                className="px-2.5 py-1.5 text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
              >
                {busy ? <Loader size={11} className="animate-spin" /> : 'Yes, delete'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2.5 py-1.5 text-xs font-bold border border-border-color rounded-lg text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-border-color rounded-lg text-text-secondary hover:border-red-400/50 hover:text-red-400 transition-colors"
            >
              <Trash2 size={12} /> Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function MyListings() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listingsApi.getMine()
      .then((d) => setItems(d.listings || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDeleted = (id) => setItems((prev) => prev.filter((i) => i._id !== id));
  const handleStatusChanged = (id, status) =>
    setItems((prev) => prev.map((i) => i._id === id ? { ...i, status } : i));

  if (loading) return (
    <div className="bento-panel p-6 md:p-7 space-y-3">
      <div className="h-6 w-32 skeleton rounded-xl mb-2" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border-color">
          <div className="w-14 h-14 skeleton rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/2 skeleton rounded-lg" />
            <div className="h-3 w-1/3 skeleton rounded-lg" />
          </div>
          <div className="h-6 w-16 skeleton rounded-full shrink-0" />
        </div>
      ))}
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
          <Link to="/add" className="mt-3 inline-block text-sm text-accent hover:underline">
            Post your first listing →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <ListingCard
              key={item._id}
              item={item}
              onDeleted={handleDeleted}
              onStatusChanged={handleStatusChanged}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────── */
export default function Profile() {
  const { user: ctxUser, logout, refreshUser } = useAuth();
  const [user,            setUser]            = useState(ctxUser);
  const [loading,         setLoading]         = useState(!ctxUser);
  const [error,           setError]           = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError,     setAvatarError]     = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    authApi.me()
      .then((data) => { setUser(data.user); refreshUser(); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset so the same file can be re-selected if needed
    e.target.value = '';

    setAvatarError('');
    setAvatarUploading(true);
    try {
      const uploadData = await uploadApi.uploadImage(file);
      const url = uploadData.url || uploadData.secure_url;
      if (!url) throw new Error('No URL returned from upload');
      const data = await authApi.updateProfile({ avatar: url });
      setUser(data.user);
      await refreshUser();
    } catch (err) {
      setAvatarError(err.message || 'Upload failed');
    } finally {
      setAvatarUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full pb-20 space-y-8 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 py-8 border-b border-border-color">
          <div className="w-28 h-28 skeleton rounded-full shrink-0" />
          <div className="flex-1 space-y-3 text-center md:text-left">
            <div className="h-8 w-48 skeleton rounded-xl mx-auto md:mx-0" />
            <div className="h-5 w-32 skeleton rounded-full mx-auto md:mx-0" />
            <div className="h-4 w-56 skeleton rounded-lg mx-auto md:mx-0" />
          </div>
        </div>
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bento-panel p-5 flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-3 w-20 skeleton rounded-full" />
                <div className="h-9 w-16 skeleton rounded-xl" />
              </div>
              <div className="w-10 h-10 skeleton rounded-xl" />
            </div>
          ))}
        </div>
        {/* Trust journey */}
        <div className="bento-panel p-6 space-y-4">
          <div className="h-6 w-40 skeleton rounded-xl" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 w-full skeleton rounded-2xl" />
          ))}
        </div>
        {/* Listings section */}
        <div className="bento-panel p-6 space-y-4">
          <div className="h-6 w-32 skeleton rounded-xl" />
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border-color">
              <div className="w-14 h-14 skeleton rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/2 skeleton rounded-lg" />
                <div className="h-3 w-1/3 skeleton rounded-lg" />
              </div>
              <div className="h-6 w-16 skeleton rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="bento-panel p-6 text-center text-red-400">{error}</div>;
  }

  const nextThreshold = TRUST_THRESHOLDS[Math.min((user?.trustLevel ?? 0) + 1, 3)];
  const avatarUrl    = user?.avatar || null;
  const initials     = (user?.name || user?.phone || '?').slice(0, 2).toUpperCase();
  const currentLevel = LEVELS[user?.trustLevel ?? 0];

  return (
    <div className="w-full animate-in fade-in duration-700 pb-20 space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 py-8 border-b border-border-color">
        <div className="relative group/avatar">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />

          <div className="w-28 h-28 rounded-full border-4 border-surface p-1 shadow-lg bg-gradient-to-tr from-accent to-lime-green">
            {avatarUrl ? (
              <img src={avatarUrl} alt={user?.name || 'User'} className="w-full h-full object-cover rounded-full bg-surface" />
            ) : (
              <div className="w-full h-full rounded-full bg-surface flex items-center justify-center text-2xl font-black text-accent select-none">
                {initials}
              </div>
            )}
          </div>

          {/* Camera overlay button */}
          <button
            type="button"
            onClick={() => !avatarUploading && fileInputRef.current?.click()}
            disabled={avatarUploading}
            aria-label="Change profile photo"
            className="absolute inset-0 rounded-full flex items-center justify-center
              bg-black/0 group-hover/avatar:bg-black/40
              opacity-0 group-hover/avatar:opacity-100
              transition-all duration-200 cursor-pointer disabled:cursor-wait"
          >
            {avatarUploading
              ? <Loader size={22} className="text-white animate-spin" />
              : <Camera size={22} className="text-white drop-shadow" />}
          </button>

          {/* Email verified badge — keep below avatar */}
          {user?.emailVerified && (
            <div className="absolute -bottom-2 right-1 bg-text-primary text-background flex items-center gap-1 px-2.5 py-1 rounded-full border-2 border-surface shadow-sm pointer-events-none">
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
          {avatarError && (
            <p className="text-xs text-red-400 mt-2 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">
              ⚠ {avatarError}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Completed deals */}
        <div className="bento-panel p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Completed Deals</p>
            <p className="text-3xl font-extrabold text-accent">
              {user?.completedTransactions || 0}
              {nextThreshold && (
                <span className="text-sm font-normal text-text-secondary ml-1">
                  / {nextThreshold.minTx} for L{(user?.trustLevel ?? 0) + 1}
                </span>
              )}
            </p>
          </div>
          <ShieldCheck size={40} className="text-accent/20" />
        </div>

        {/* Rating */}
        <div className="bento-panel p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Avg Rating</p>
            <p className="text-3xl font-extrabold text-text-primary flex items-end gap-1.5">
              {(user?.averageRating || 0).toFixed(1)}
              <Star size={18} className="text-yellow-400 mb-0.5" fill="currentColor" />
            </p>
            {nextThreshold && (user?.averageRating || 0) < nextThreshold.minRating && (
              <p className="text-xs text-text-secondary mt-1">
                Need {nextThreshold.minRating}★ for next level
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            {[1,2,3,4,5].map((s) => (
              <Star
                key={s}
                size={10}
                className={s <= Math.round(user?.averageRating || 0) ? 'text-yellow-400' : 'text-border-color'}
                fill={s <= Math.round(user?.averageRating || 0) ? 'currentColor' : 'none'}
              />
            ))}
          </div>
        </div>

        {/* Transaction limit */}
        <div className="bento-panel p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Per-Deal Limit</p>
            <p className="text-2xl font-extrabold text-text-primary">
              {user?.trustLevel >= 3 ? 'Unlimited' :
               user?.trustLevel >= 2 ? '₹10,000' :
               user?.trustLevel >= 1 ? '₹1,500' : '—'}
            </p>
            <p className="text-xs text-text-secondary mt-1">
              {user?.trustLevel >= 1
                ? `Level ${user.trustLevel} · raises with trust`
                : 'Verify email to unlock selling'}
            </p>
          </div>
          <Lock size={36} className="text-text-secondary/20" />
        </div>
      </div>

      {/* Trust Journey */}
      <TrustJourney user={user} />

      {/* My Orders shortcut */}
      <Link
        to="/orders"
        className="bento-panel p-5 flex items-center justify-between hover:border-accent/30 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <ShoppingBag size={18} className="text-accent" />
          </div>
          <div>
            <p className="font-bold text-text-primary text-sm">My Orders</p>
            <p className="text-xs text-text-secondary">View purchases, sales & escrow status</p>
          </div>
        </div>
        <ChevronRight size={18} className="text-text-secondary group-hover:text-accent transition-colors" />
      </Link>

      {/* My Listings */}
      <MyListings />

    </div>
  );
}
