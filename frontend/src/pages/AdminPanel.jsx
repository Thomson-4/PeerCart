import { useState, useEffect } from 'react';
import { ShieldCheck, Users, TrendingUp, AlertTriangle, CheckCircle2, XCircle, Loader, LogIn } from 'lucide-react';
import { admin as adminApi } from '../services/api';

const rupees = (p) => `₹${((p || 0) / 100).toLocaleString('en-IN')}`;

function StatCard({ label, value, sub, color = 'text-accent' }) {
  return (
    <div className="bento-panel p-5">
      <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-text-secondary mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminPanel() {
  const [secret,   setSecret]   = useState(() => sessionStorage.getItem('pc_admin_secret') || '');
  const [authed,   setAuthed]   = useState(false);
  const [stats,    setStats]    = useState(null);
  const [disputes, setDisputes] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [resolving, setResolving] = useState(null); // txn id being resolved

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [sData, dData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getDisputes(),
      ]);
      setStats(sData.stats);
      setDisputes(dData.disputes || []);
      setAuthed(true);
    } catch (err) {
      setError(err.status === 401 ? 'Wrong admin secret.' : err.message);
      setAuthed(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    sessionStorage.setItem('pc_admin_secret', secret);
    load();
  };

  const handleResolve = async (txId, action) => {
    setResolving(txId + action);
    try {
      await adminApi.resolveDispute(txId, action);
      setDisputes((prev) => prev.filter((d) => d._id !== txId));
    } catch (err) {
      alert(err.message);
    } finally {
      setResolving(null);
    }
  };

  if (!authed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-sm glass-card gradient-stroke p-8 space-y-5">
          <div className="text-center">
            <ShieldCheck size={36} className="text-accent mx-auto mb-3" />
            <h1 className="text-2xl font-black tracking-tight">Admin Panel</h1>
            <p className="text-sm text-text-secondary mt-1">Enter the admin secret to continue</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Admin secret"
              className="input-base"
              required
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-3 bg-accent text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <Loader size={16} className="animate-spin" /> : <><LogIn size={16} /> Enter</>}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-20 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">Admin Panel</h1>
        <button onClick={load} disabled={loading} className="flex items-center gap-2 text-sm font-bold text-text-secondary hover:text-accent transition-colors">
          {loading ? <Loader size={15} className="animate-spin" /> : '↻'} Refresh
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total Users"        value={stats.totalUsers}        color="text-accent" />
          <StatCard label="Active Listings"    value={stats.totalListings}     color="text-blue-400" />
          <StatCard label="Transactions"       value={stats.totalTransactions} color="text-green-400" />
          <StatCard label="GMV"                value={rupees(stats.totalGMVPaise)} color="text-yellow-400" sub={`${stats.disputeRate}% dispute rate`} />
        </div>
      )}

      {/* Campus breakdown */}
      {stats?.campusBreakdown?.length > 0 && (
        <div className="bento-panel p-6">
          <h2 className="text-lg font-black mb-4 flex items-center gap-2"><Users size={18} className="text-accent" /> Users by Campus</h2>
          <div className="space-y-2">
            {stats.campusBreakdown.map((c) => (
              <div key={c.name} className="flex items-center justify-between py-2 border-b border-border-color/50 last:border-0">
                <span className="text-sm font-semibold">{c.name}</span>
                <span className="text-sm font-bold text-accent">{c.count} users</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disputes */}
      <div className="bento-panel p-6">
        <h2 className="text-lg font-black mb-4 flex items-center gap-2">
          <AlertTriangle size={18} className="text-red-400" /> Open Disputes
          {disputes.length > 0 && <span className="ml-1 px-2 py-0.5 rounded-full bg-red-400/20 text-red-400 text-xs font-extrabold">{disputes.length}</span>}
        </h2>

        {disputes.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 size={32} className="mx-auto mb-2 text-green-400/40" />
            <p className="text-sm text-text-secondary font-semibold">No open disputes 🎉</p>
          </div>
        ) : (
          <div className="space-y-4">
            {disputes.map((d) => (
              <div key={d._id} className="rounded-xl border border-red-400/20 bg-red-400/5 p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-sm">{d.listing?.title || 'Unknown listing'}</p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Buyer: <strong>{d.buyer?.name || d.buyer?.phone}</strong> ·
                      Seller: <strong>{d.seller?.name || d.seller?.phone}</strong>
                    </p>
                    <p className="text-xs text-text-secondary">
                      Amount: <strong className="text-text-primary">{rupees(d.amount)}</strong>
                    </p>
                    {d.disputeReason && (
                      <p className="text-xs text-text-secondary mt-1 italic">"{d.disputeReason}"</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleResolve(d._id, 'release')}
                    disabled={!!resolving}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl text-xs font-bold hover:bg-green-500/30 transition-colors disabled:opacity-50"
                  >
                    {resolving === d._id + 'release' ? <Loader size={12} className="animate-spin" /> : <CheckCircle2 size={13} />}
                    Release to Seller
                  </button>
                  <button
                    onClick={() => handleResolve(d._id, 'refund')}
                    disabled={!!resolving}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold hover:bg-red-500/30 transition-colors disabled:opacity-50"
                  >
                    {resolving === d._id + 'refund' ? <Loader size={12} className="animate-spin" /> : <XCircle size={13} />}
                    Refund Buyer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
