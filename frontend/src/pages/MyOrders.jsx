import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, Loader, Package, CheckCircle2, Clock,
  AlertTriangle, XCircle, ChevronRight, RefreshCw,
  ShieldCheck, MessageCircle,
} from 'lucide-react';
import { transactions as txApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const rupees = (p) => p != null ? `₹${(p / 100).toLocaleString('en-IN')}` : '—';

function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ── Status badge config ─────────────────────────────────────────── */
const STATUS = {
  initiated: { label: 'Payment Pending', color: 'bg-yellow-400/15 text-yellow-400 border-yellow-400/30', icon: Clock },
  escrowed:  { label: 'In Escrow',       color: 'bg-blue-400/15 text-blue-400 border-blue-400/30',     icon: ShieldCheck },
  completed: { label: 'Completed',       color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
  disputed:  { label: 'Disputed',        color: 'bg-red-400/15 text-red-400 border-red-400/30',         icon: AlertTriangle },
};

/* ── Dispute modal ───────────────────────────────────────────────── */
function DisputeModal({ txId, onClose, onDone }) {
  const [reason,  setReason]  = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) { setError('Please describe the issue.'); return; }
    setLoading(true);
    try {
      await txApi.raiseDispute(txId, reason.trim());
      onDone();
    } catch (err) {
      setError(err.message || 'Failed to raise dispute. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-surface border border-border-color rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border-color">
          <div>
            <h2 className="font-black text-lg text-text-primary flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-400" /> Raise a Dispute
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">Our team will review and resolve within 48 hours.</p>
          </div>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-text-secondary mb-2 block">
              Describe the issue
            </label>
            <textarea
              value={reason}
              onChange={(e) => { setReason(e.target.value); setError(''); }}
              placeholder="e.g. Item not received, item condition doesn't match description…"
              rows={4}
              maxLength={500}
              className="input-base resize-none text-sm"
            />
            <p className="text-[10px] text-text-secondary mt-1 text-right">{reason.length}/500</p>
          </div>
          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 py-3 border border-border-color rounded-xl text-sm font-bold text-text-secondary hover:border-accent/30 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading || !reason.trim()}
              className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-extrabold disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              {loading ? <Loader size={15} className="animate-spin" /> : <><AlertTriangle size={15} /> Submit Dispute</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Transaction card ────────────────────────────────────────────── */
function TxCard({ tx, userId, onRefresh }) {
  const [confirming, setConfirming] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [actionError, setActionError] = useState('');

  const isBuyer  = tx.buyer?._id === userId || tx.buyer === userId;
  const isSeller = tx.seller?._id === userId || tx.seller === userId;
  const other    = isBuyer ? tx.seller : tx.buyer;
  const listing  = tx.listing || {};

  const status   = STATUS[tx.status] || STATUS.initiated;
  const StatusIcon = status.icon;

  const handleConfirm = async () => {
    setActionError('');
    setConfirming(true);
    try {
      await txApi.confirmReceipt(tx._id);
      onRefresh();
    } catch (err) {
      setActionError(err.message || 'Failed to confirm. Try again.');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <>
      {disputeOpen && (
        <DisputeModal
          txId={tx._id}
          onClose={() => setDisputeOpen(false)}
          onDone={() => { setDisputeOpen(false); onRefresh(); }}
        />
      )}

      <div className="bento-panel p-4 space-y-3">
        {/* Top row: listing info + status */}
        <div className="flex items-start gap-3">
          {listing.images?.[0] ? (
            <img src={listing.images[0]} alt={listing.title}
              className="w-14 h-14 rounded-xl object-cover shrink-0 border border-border-color" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-surface-elevated shrink-0 flex items-center justify-center border border-border-color">
              <Package size={20} className="text-text-secondary/40" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="font-bold text-sm text-text-primary truncate">{listing.title || 'Listing'}</p>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border shrink-0 flex items-center gap-1 ${status.color}`}>
                <StatusIcon size={9} />
                {status.label}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              <span className={`font-bold ${isBuyer ? 'text-accent' : 'text-emerald-400'}`}>
                {isBuyer ? 'You bought' : 'You sold'}
              </span>
              {' · '}{other?.name || 'User'} · {fmtDate(tx.createdAt)}
            </p>
            <p className="text-base font-black text-text-primary mt-1">{rupees(tx.amount)}</p>
          </div>
        </div>

        {/* Rental dates */}
        {tx.type === 'rent' && tx.rentalStartDate && (
          <div className="flex items-center gap-2 text-xs text-text-secondary bg-surface-elevated rounded-lg px-3 py-2">
            <Clock size={12} className="text-accent shrink-0" />
            Rental: {fmtDate(tx.rentalStartDate)} → {fmtDate(tx.rentalEndDate)}
          </div>
        )}

        {/* Action error */}
        {actionError && (
          <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
            {actionError}
          </p>
        )}

        {/* Actions */}
        {tx.status === 'escrowed' && isBuyer && (
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 cta-gradient text-white text-xs font-extrabold rounded-xl disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-sm shadow-accent/20"
            >
              {confirming
                ? <Loader size={13} className="animate-spin" />
                : <><CheckCircle2 size={13} /> Confirm Receipt</>}
            </button>
            <button
              onClick={() => setDisputeOpen(true)}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-red-400/40 text-red-400 hover:bg-red-400/10 text-xs font-bold rounded-xl transition-colors"
            >
              <AlertTriangle size={13} /> Dispute
            </button>
          </div>
        )}

        {tx.status === 'escrowed' && isSeller && (
          <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-400/10 border border-blue-400/20 rounded-lg px-3 py-2.5">
            <ShieldCheck size={14} className="shrink-0" />
            Funds in escrow — waiting for buyer to confirm receipt
          </div>
        )}

        {tx.status === 'completed' && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-lg px-3 py-2.5">
            <CheckCircle2 size={14} className="shrink-0" />
            {isBuyer ? 'Payment released to seller. Deal done!' : 'Funds received. Deal done!'}
          </div>
        )}

        {tx.status === 'disputed' && (
          <div className="flex items-center gap-2 text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2.5">
            <AlertTriangle size={14} className="shrink-0" />
            Under review — our team will resolve this within 48 hours
          </div>
        )}

        {tx.status === 'initiated' && (
          <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-3 py-2.5">
            <Clock size={14} className="shrink-0" />
            Awaiting payment — complete the Razorpay checkout to proceed
          </div>
        )}

        {/* View listing link */}
        {listing._id && (
          <Link to={`/listing/${listing._id}`}
            className="flex items-center gap-1 text-xs text-text-secondary hover:text-accent transition-colors w-fit">
            <Package size={11} /> View listing <ChevronRight size={11} />
          </Link>
        )}
      </div>
    </>
  );
}

/* ── Main Page ───────────────────────────────────────────────────── */
export default function MyOrders() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState('all'); // all | buying | selling
  const [error,        setError]        = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await txApi.myTransactions();
      setTransactions(data.transactions || []);
    } catch (err) {
      setError(err.message || 'Could not load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = transactions.filter((tx) => {
    if (filter === 'buying')  return tx.buyer?._id === user?.id || tx.buyer === user?.id;
    if (filter === 'selling') return tx.seller?._id === user?.id || tx.seller === user?.id;
    return true;
  });

  const FILTERS = [
    { key: 'all',     label: 'All' },
    { key: 'buying',  label: 'Buying' },
    { key: 'selling', label: 'Selling' },
  ];

  // counts for badges
  const actionNeeded = transactions.filter(
    (tx) => tx.status === 'escrowed' && (tx.buyer?._id === user?.id || tx.buyer === user?.id)
  ).length;

  return (
    <div className="w-full animate-in fade-in duration-500 pb-24 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <ShoppingBag size={22} className="text-accent" /> My Orders
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Your purchases and sales on PeerCart.
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); load(); }}
          className="p-2 rounded-xl border border-border-color text-text-secondary hover:text-accent hover:border-accent/30 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Action-needed banner */}
      {actionNeeded > 0 && (
        <div className="flex items-center gap-3 bg-blue-400/10 border border-blue-400/30 rounded-2xl px-4 py-3">
          <ShieldCheck size={18} className="text-blue-400 shrink-0" />
          <p className="text-sm text-text-primary">
            <span className="font-black text-blue-400">{actionNeeded} order{actionNeeded > 1 ? 's' : ''}</span>
            {' '}waiting for you to <strong>confirm receipt</strong> — tap the card below.
          </p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 bg-surface-elevated rounded-2xl p-1 w-fit">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all ${
              filter === key
                ? 'bg-accent text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading && (
        <div className="flex items-center justify-center py-20 gap-3">
          <Loader size={22} className="animate-spin text-accent" />
          <p className="text-text-secondary font-semibold">Loading orders…</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 bg-red-400/10 border border-red-400/20 rounded-2xl px-4 py-3 text-sm text-red-400">
          <XCircle size={16} className="shrink-0" /> {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <ShoppingBag size={48} className="text-text-secondary/20" />
          <div>
            <p className="font-bold text-text-primary">No {filter === 'all' ? '' : filter} orders yet</p>
            <p className="text-sm text-text-secondary mt-1">
              {filter === 'selling'
                ? 'When someone buys your listing, it appears here.'
                : 'Browse listings and make an offer to get started.'}
            </p>
          </div>
          {filter !== 'selling' && (
            <Link to="/feed" className="text-sm font-bold text-accent hover:underline flex items-center gap-1">
              Browse listings <ChevronRight size={14} />
            </Link>
          )}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((tx) => (
            <TxCard
              key={tx._id}
              tx={tx}
              userId={user?.id}
              onRefresh={() => { setLoading(true); load(); }}
            />
          ))}
        </div>
      )}

      {/* Go to messages CTA */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center justify-center">
          <Link
            to="/messages"
            className="text-sm text-text-secondary hover:text-accent transition-colors flex items-center gap-1.5"
          >
            <MessageCircle size={14} /> Open Messages
          </Link>
        </div>
      )}
    </div>
  );
}
