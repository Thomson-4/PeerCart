import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, Star, Package, CheckCircle2, Loader, ArrowLeft } from 'lucide-react';
import { users as usersApi } from '../services/api';

const LEVELS = ['Phone Verified', 'Campus Verified', 'Trusted Student', 'Campus Rep'];
const LEVEL_COLORS = ['text-text-secondary', 'text-accent', 'text-green-400', 'text-yellow-400'];
const rupees = (p) => `₹${((p || 0) / 100).toLocaleString('en-IN')}`;

const FALLBACK = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&q=80&w=400';

export default function UserProfile() {
  const { id } = useParams();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    setLoading(true);
    usersApi.getProfile(id)
      .then((d) => setData(d))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="w-full pb-20 space-y-6 animate-pulse">
      <div className="flex items-center gap-4 py-6 border-b border-border-color">
        <div className="w-20 h-20 skeleton rounded-full shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-6 w-40 skeleton rounded-xl" />
          <div className="h-4 w-24 skeleton rounded-full" />
          <div className="h-3 w-32 skeleton rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-20 skeleton rounded-2xl" />)}
      </div>
    </div>
  );

  if (error) return (
    <div className="bento-panel p-6 text-center text-red-400">
      <p className="font-semibold">{error}</p>
      <Link to="/feed" className="text-sm text-accent hover:underline mt-2 inline-block">← Back to feed</Link>
    </div>
  );

  const { user, listings, reviews } = data;
  const level = user.trustLevel ?? 0;
  const initials = (user.name || '?').slice(0, 2).toUpperCase();

  return (
    <div className="w-full pb-20 space-y-8 animate-in fade-in duration-500">

      {/* Back */}
      <Link to="/feed" className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors w-fit">
        <ArrowLeft size={15} /> Back to feed
      </Link>

      {/* Header */}
      <div className="flex items-center gap-5 py-6 border-b border-border-color">
        <div className="w-20 h-20 rounded-full border-4 border-surface shadow-lg bg-gradient-to-tr from-accent to-lime-green p-0.5 shrink-0">
          {user.avatar
            ? <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
            : <div className="w-full h-full rounded-full bg-surface flex items-center justify-center text-xl font-black text-accent">{initials}</div>
          }
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{user.name || 'Campus User'}</h1>
          <div className={`flex items-center gap-1.5 mt-1 text-sm font-bold ${LEVEL_COLORS[level]}`}>
            <ShieldCheck size={14} />
            Level {level} — {LEVELS[level]}
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Member since {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bento-panel p-4 text-center">
          <p className="text-2xl font-extrabold text-accent">{user.completedTransactions || 0}</p>
          <p className="text-xs text-text-secondary font-semibold mt-1">Deals Done</p>
        </div>
        <div className="bento-panel p-4 text-center">
          <p className="text-2xl font-extrabold text-yellow-400 flex items-center justify-center gap-1">
            {(user.averageRating || 0).toFixed(1)} <Star size={16} fill="currentColor" />
          </p>
          <p className="text-xs text-text-secondary font-semibold mt-1">{user.totalRatings || 0} reviews</p>
        </div>
        <div className="bento-panel p-4 text-center">
          <p className="text-2xl font-extrabold text-text-primary">{listings.length}</p>
          <p className="text-xs text-text-secondary font-semibold mt-1">Active listings</p>
        </div>
      </div>

      {/* Active listings */}
      <div className="bento-panel p-6">
        <h2 className="text-lg font-black mb-4 flex items-center gap-2">
          <Package size={18} className="text-accent" /> Listings
        </h2>
        {listings.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-6">No active listings</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {listings.map((l) => (
              <Link key={l._id} to={`/listing/${l._id}`} className="rounded-xl border border-border-color hover:border-accent/40 transition-colors overflow-hidden group">
                <img
                  src={l.images?.[0] || FALLBACK}
                  alt={l.title}
                  className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-2">
                  <p className="text-xs font-bold truncate">{l.title}</p>
                  <p className="text-xs text-accent font-semibold mt-0.5">
                    {rupees(l.price)}{l.type === 'rent' ? '/day' : ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Reviews */}
      <div className="bento-panel p-6">
        <h2 className="text-lg font-black mb-4 flex items-center gap-2">
          <Star size={18} className="text-yellow-400" /> Reviews
        </h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-6">No reviews yet</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r._id} className="flex gap-3 pb-4 border-b border-border-color/50 last:border-0">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-black text-accent shrink-0">
                  {(r.reviewer?.name || '?').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">{r.reviewer?.name || 'Student'}</p>
                    <div className="flex">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} size={11} className={s <= r.rating ? 'text-yellow-400' : 'text-border-color'} fill={s <= r.rating ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                  </div>
                  {r.comment && <p className="text-xs text-text-secondary mt-1 leading-relaxed">{r.comment}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
