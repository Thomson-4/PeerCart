import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, ShieldCheck, MapPin, Clock, Zap,
  MessageCircle, Tag, Package, Loader, AlertTriangle,
  CheckCircle2, Camera, CalendarDays, X,
} from 'lucide-react';
import { listings as listingsApi, chat as chatApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const FALLBACK = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&q=80&w=800';

const CONDITION_LABELS = {
  new:       { label: 'New',      color: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10' },
  'like-new':{ label: 'Like New', color: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10' },
  good:      { label: 'Good',     color: 'text-blue-400 border-blue-400/30 bg-blue-400/10' },
  fair:      { label: 'Fair',     color: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10' },
};

const CATEGORY_LABELS = {
  electronics:         'Electronics',
  textbooks:           'Textbooks',
  'formal-wear':       'Formal Wear',
  cycles:              'Cycles',
  'hobby-gear':        'Hobby Gear',
  'hostel-essentials': 'Hostel Gear',
};

const rupees = (p) => `₹${(p / 100).toLocaleString('en-IN')}`;

function TrustBadge({ level }) {
  const colors = ['text-text-secondary', 'text-blue-400', 'text-purple-400', 'text-emerald-400'];
  const labels = ['Level 0', 'Verified', 'Trusted', 'Ambassador'];
  return (
    <span className={`flex items-center gap-1 text-xs font-bold ${colors[level] || colors[0]}`}>
      <ShieldCheck size={12} /> {labels[level] || 'Level 0'}
    </span>
  );
}

/* ── Rent date picker modal ──────────────────────────────────────── */
function RentDateModal({ listing, onClose, onConfirm, loading }) {
  const today     = new Date().toISOString().split('T')[0];
  const [start,   setStart] = useState('');
  const [end,     setEnd]   = useState('');
  const [err,     setErr]   = useState('');

  const days = start && end
    ? Math.max(1, Math.ceil((new Date(end) - new Date(start)) / 86_400_000))
    : 0;

  const handleConfirm = () => {
    if (!start || !end)      { setErr('Please select both dates.'); return; }
    if (end <= start)        { setErr('End date must be after start date.'); return; }
    onConfirm(start, end, days);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-surface border border-border-color rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">

        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border-color">
          <div>
            <h2 className="font-black text-lg text-text-primary flex items-center gap-2">
              <CalendarDays size={18} className="text-accent" /> Pick Rental Dates
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">{listing.title}</p>
          </div>
          <button onClick={onClose} disabled={loading}
            className="w-8 h-8 rounded-full bg-surface-elevated hover:bg-border-color flex items-center justify-center text-text-secondary transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-1 block">Start date</label>
              <input type="date" min={today} value={start}
                onChange={(e) => { setStart(e.target.value); setErr(''); }}
                className="input-base text-sm py-2" />
            </div>
            <div>
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-1 block">End date</label>
              <input type="date" min={start || today} value={end}
                onChange={(e) => { setEnd(e.target.value); setErr(''); }}
                className="input-base text-sm py-2" />
            </div>
          </div>

          {days > 0 && (
            <div className="rounded-xl bg-accent/5 border border-accent/20 px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-bold text-text-primary">{days} day{days > 1 ? 's' : ''}</span>
              <span className="text-lg font-black text-accent">
                ₹{((listing.price / 100) * days).toLocaleString('en-IN')}
              </span>
            </div>
          )}

          {err && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">{err}</p>
          )}

          <button
            onClick={handleConfirm}
            disabled={loading || days === 0}
            className="w-full py-3.5 cta-gradient text-white font-extrabold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:-translate-y-0.5"
          >
            {loading ? <Loader size={16} className="animate-spin" /> : <><MessageCircle size={16} /> Chat with owner</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ListingDetail() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { user }    = useAuth();

  const [listing,      setListing]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [activeImg,    setActiveImg]    = useState(0);
  const [chatLoading,  setChatLoading]  = useState(false);
  const [chatError,    setChatError]    = useState('');
  const [rentModal,    setRentModal]    = useState(false); // show date picker

  useEffect(() => {
    setLoading(true);
    listingsApi.getOne(id)
      .then((data) => setListing(data.listing))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const isOwn = user && listing && listing.seller?._id === user.id;

  // For buy — go straight to chat
  const expressInterest = async (intentType) => {
    if (!user) { navigate('/login'); return; }
    if (isOwn) return;
    setChatError('');
    setChatLoading(true);
    try {
      const convData = await chatApi.getOrCreate({ listingId: listing._id });
      const conv     = convData.conversation;
      const msgs = {
        buy:          `Hi! I'm interested in buying your "${listing.title}". Is it still available?`,
        'rent-urgent': `Hi! I urgently need to rent your "${listing.title}" as soon as possible. Are you available soon?`,
      };
      await chatApi.sendMessage(conv._id, msgs[intentType] || msgs.buy);
      navigate(`/messages/${conv._id}`);
    } catch (err) {
      setChatError(err.message || 'Could not start conversation');
    } finally {
      setChatLoading(false);
    }
  };

  // For rent — after dates are picked, go to chat with dates in the message
  const handleRentConfirm = async (start, end, days) => {
    if (!user) { navigate('/login'); return; }
    setChatLoading(true);
    try {
      const convData = await chatApi.getOrCreate({ listingId: listing._id });
      const conv     = convData.conversation;
      const total    = `₹${((listing.price / 100) * days).toLocaleString('en-IN')}`;
      const msg      = `Hi! I'd like to rent your "${listing.title}" from ${start} to ${end} (${days} day${days > 1 ? 's' : ''}, total ${total}). Is it available?`;
      await chatApi.sendMessage(conv._id, msg);
      setRentModal(false);
      navigate(`/messages/${conv._id}`);
    } catch (err) {
      setChatError(err.message || 'Could not start conversation');
      setChatLoading(false);
    }
  };

  /* ── Loading skeleton ──────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="w-full pb-24 animate-in fade-in duration-300">
        {/* Back button placeholder */}
        <div className="h-6 w-20 skeleton rounded-lg mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: image */}
          <div className="space-y-3">
            <div className="aspect-square w-full skeleton rounded-2xl" />
          </div>
          {/* Right: details */}
          <div className="flex flex-col gap-5">
            {/* Category + condition chips */}
            <div className="flex items-center gap-2">
              <div className="h-5 w-24 skeleton rounded-full" />
              <div className="h-5 w-16 skeleton rounded-full" />
            </div>
            {/* Title */}
            <div className="space-y-2">
              <div className="h-8 w-3/4 skeleton rounded-xl" />
              <div className="h-8 w-1/2 skeleton rounded-xl" />
            </div>
            {/* Price */}
            <div className="h-12 w-36 skeleton rounded-xl" />
            {/* Description */}
            <div className="bento-panel p-4 space-y-2">
              <div className="h-4 w-20 skeleton rounded-lg" />
              <div className="h-3 w-full skeleton rounded-lg" />
              <div className="h-3 w-full skeleton rounded-lg" />
              <div className="h-3 w-2/3 skeleton rounded-lg" />
            </div>
            {/* Seller card */}
            <div className="bento-panel p-4 flex items-center gap-4">
              <div className="w-11 h-11 skeleton rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 skeleton rounded-lg" />
                <div className="h-3 w-20 skeleton rounded-lg" />
              </div>
              <div className="h-4 w-24 skeleton rounded-lg" />
            </div>
            {/* CTA button */}
            <div className="h-14 w-full skeleton rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  /* ── Error ─────────────────────────────────────────────────────── */
  if (error || !listing) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
        <AlertTriangle size={40} className="text-red-400" />
        <p className="text-red-400 font-semibold">{error || 'Listing not found'}</p>
        <button onClick={() => navigate('/feed')} className="btn-primary rounded-xl px-6 py-2 text-sm">
          Back to Feed
        </button>
      </div>
    );
  }

  const images    = listing.images?.length ? listing.images : [FALLBACK];
  const priceStr  = listing.type === 'rent' ? `${rupees(listing.price)}/day` : rupees(listing.price);
  const cond      = CONDITION_LABELS[listing.condition] || CONDITION_LABELS.good;
  const seller    = listing.seller || {};
  const trustLvl  = seller.trustLevel ?? 0;
  const postedAt  = new Date(listing.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="w-full animate-in fade-in duration-500 pb-24">
      {rentModal && (
        <RentDateModal
          listing={listing}
          onClose={() => setRentModal(false)}
          onConfirm={handleRentConfirm}
          loading={chatLoading}
        />
      )}

      {/* ── Back button ─────────────────────────────────────────── */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-sm font-bold text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

        {/* ── Left: Images ────────────────────────────────────────── */}
        <div className="space-y-3">
          {/* Main image */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-border-color bg-surface-elevated">
            <img
              src={images[activeImg]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest shadow-sm ${
                listing.type === 'rent'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-accent text-white'
              }`}>
                {listing.type === 'rent' ? 'Rent' : 'Sell'}
              </span>

              {listing.urgent && listing.type === 'rent' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  <Zap size={11} /> Urgent
                </span>
              )}

              {listing.liveCaptureVerified && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Camera size={11} /> Live Verified
                </span>
              )}
            </div>
          </div>

          {/* Thumbnail strip (if multiple images) */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImg === i ? 'border-accent' : 'border-border-color hover:border-accent/40'
                  }`}
                >
                  <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Details + Actions ─────────────────────────────── */}
        <div className="flex flex-col gap-5">

          {/* Category + condition */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-text-secondary">
              <Tag size={11} /> {CATEGORY_LABELS[listing.category] || listing.category}
            </span>
            <span className="text-text-secondary/40">·</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${cond.color}`}>
              {cond.label}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-text-primary">
            {listing.title}
          </h1>

          {/* Price */}
          <div className="flex items-end gap-3">
            <span className="text-4xl font-black text-accent tracking-tight">{priceStr}</span>
            {listing.type === 'rent' && listing.rentalDurationDays && (
              <span className="text-sm text-text-secondary mb-1.5 font-medium">
                · min {listing.rentalDurationDays} day{listing.rentalDurationDays > 1 ? 's' : ''}
              </span>
            )}
            {listing.type === 'rent' && listing.rentalDeposit > 0 && (
              <span className="text-sm text-text-secondary mb-1.5">
                · {rupees(listing.rentalDeposit)} deposit
              </span>
            )}
          </div>

          {/* Urgent needs-it-soon banner */}
          {listing.urgent && listing.type === 'rent' && (
            <div className="flex items-center gap-3 rounded-xl bg-orange-500/10 border border-orange-500/25 px-4 py-3">
              <Zap size={18} className="text-orange-400 shrink-0" />
              <p className="text-sm font-semibold text-orange-300">
                This owner needs it rented <strong>urgently</strong> — respond fast!
              </p>
            </div>
          )}

          {/* Description */}
          <div className="bento-panel p-4">
            <p className="text-sm font-bold uppercase tracking-wide text-text-secondary mb-2">Description</p>
            <p className="text-text-primary leading-relaxed whitespace-pre-wrap">{listing.description}</p>
          </div>

          {/* Seller card */}
          <div className="bento-panel p-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-black text-lg shrink-0">
              {(seller.name || 'U')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-text-primary truncate">{seller.name || 'Campus Student'}</p>
              <TrustBadge level={trustLvl} />
            </div>
            <div className="flex flex-col items-end gap-1 text-right shrink-0">
              <div className="flex items-center gap-1 text-xs text-text-secondary">
                <Clock size={11} /> {postedAt}
              </div>
              <div className="flex items-center gap-1 text-xs text-text-secondary">
                <MapPin size={11} className="text-accent" /> Campus
              </div>
            </div>
          </div>

          {/* ── CTA Buttons ──────────────────────────────────────── */}
          {chatError && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
              {chatError}
            </p>
          )}

          {isOwn ? (
            <div className="flex items-center gap-2 rounded-xl bg-accent/10 border border-accent/20 px-4 py-3">
              <CheckCircle2 size={16} className="text-accent" />
              <p className="text-sm font-semibold text-accent">This is your listing.</p>
              <Link to="/profile" className="ml-auto text-sm font-bold text-accent hover:underline">
                Manage →
              </Link>
            </div>
          ) : listing.status !== 'active' ? (
            <div className="flex items-center gap-2 rounded-xl bg-red-400/10 border border-red-400/20 px-4 py-3">
              <AlertTriangle size={16} className="text-red-400" />
              <p className="text-sm font-semibold text-red-400 capitalize">
                This listing is {listing.status}.
              </p>
            </div>
          ) : listing.type === 'sell' ? (
            /* ── SELL actions ── */
            <div className="space-y-3">
              <button
                onClick={() => expressInterest('buy')}
                disabled={chatLoading}
                className="w-full py-4 cta-gradient text-white font-extrabold rounded-xl shadow-md hover:-translate-y-0.5 transition-transform flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {chatLoading
                  ? <Loader size={18} className="animate-spin" />
                  : <><MessageCircle size={18} /> I want to buy this</>
                }
              </button>
              <p className="text-center text-xs text-text-secondary">
                Sends a message to the seller — no payment yet.
              </p>
            </div>
          ) : (
            /* ── RENT actions ── */
            <div className="space-y-3">
              <button
                onClick={() => setRentModal(true)}
                disabled={chatLoading}
                className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-extrabold rounded-xl shadow-md hover:-translate-y-0.5 transition-transform flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {chatLoading
                  ? <Loader size={18} className="animate-spin" />
                  : <><CalendarDays size={18} /> Pick dates & rent</>
                }
              </button>
              {listing.urgent && (
                <button
                  onClick={() => expressInterest('rent-urgent')}
                  disabled={chatLoading}
                  className="w-full py-3.5 bg-orange-500/20 border border-orange-500/40 text-orange-300 font-bold rounded-xl hover:bg-orange-500/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Zap size={16} /> I need this urgently
                </button>
              )}
              <p className="text-center text-xs text-text-secondary">
                Select your rental dates, then chat with the owner.
              </p>
            </div>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-4 text-xs text-text-secondary pt-1">
            <span className="flex items-center gap-1">
              <Package size={12} /> {listing.views || 0} views
            </span>
            {listing.liveCaptureVerified && (
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 size={12} /> Photo verified
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
