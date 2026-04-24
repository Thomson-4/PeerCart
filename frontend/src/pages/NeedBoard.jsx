import { useState, useEffect } from 'react';
import { Send, Filter, Search, Loader } from 'lucide-react';
import NeedCard from '../components/NeedCard';
import { needs as needsApi } from '../services/api';

const CATEGORIES = [
  { label: 'Textbooks',   value: 'textbooks' },
  { label: 'Electronics', value: 'electronics' },
  { label: 'Formal Wear', value: 'formal-wear' },
  { label: 'Cycles',      value: 'cycles' },
  { label: 'Hobby Gear',  value: 'hobby-gear' },
  { label: 'Hostel Gear', value: 'hostel-essentials' },
];

const hoursUntil = (dateStr) => {
  const diff = new Date(dateStr) - Date.now();
  return diff / 3_600_000;
};

const mapNeed = (n) => ({
  id: n._id,
  user: {
    name:       n.postedBy?.name  || 'Campus User',
    avatar:     n.postedBy?.avatar || `https://i.pravatar.cc/150?u=${n.postedBy?._id}`,
    trustScore: String(Math.round((n.postedBy?.averageRating || 0) * 20)),
  },
  title:       n.title,
  description: n.description,
  urgency:     hoursUntil(n.expiresAt) < 24 ? 'High' : 'Normal',
  timeframe:   n.type === 'buy' ? 'Looking to buy' : 'Looking to rent',
  distance:    'Campus',
  reward:      n.maxBudget ? `Up to ₹${(n.maxBudget / 100).toLocaleString('en-IN')}` : 'Negotiable',
});

const EMPTY_FORM = { title: '', description: '', category: 'textbooks', type: 'buy', maxBudget: '' };

export default function NeedBoard() {
  const [needs,         setNeeds]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [submitting,    setSubmitting]     = useState(false);
  const [error,         setError]         = useState('');
  const [formError,     setFormError]     = useState('');
  const [query,         setQuery]         = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('All');
  const [formData,      setFormData]      = useState(EMPTY_FORM);

  const fetchNeeds = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await needsApi.getAll();
      setNeeds((data.needs || []).map(mapNeed));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNeeds(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) return;
    setFormError('');
    setSubmitting(true);
    try {
      const body = {
        title:       formData.title.trim(),
        description: formData.description.trim(),
        category:    formData.category,
        type:        formData.type,
        ...(formData.maxBudget && { maxBudget: Math.round(parseFloat(formData.maxBudget) * 100) }),
      };
      const data = await needsApi.create(body);
      setNeeds((prev) => [mapNeed(data.need), ...prev]);
      setFormData(EMPTY_FORM);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const set = (key) => (e) => setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  const filteredNeeds = needs.filter((n) => {
    const qMatch = !query.trim() ||
      n.title.toLowerCase().includes(query.toLowerCase()) ||
      n.description.toLowerCase().includes(query.toLowerCase());
    const uMatch = urgencyFilter === 'All' || n.urgency === urgencyFilter;
    return qMatch && uMatch;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 animate-in fade-in slide-in-from-bottom-5 duration-700 mb-20">

      {/* Post form */}
      <div className="w-full lg:w-[40%] xl:w-[35%]">
        <div className="sticky top-24">
          <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Got a Need?</h1>
          <p className="text-text-secondary mb-6 text-lg">Post it once. Let verified sellers come to you.</p>

          <form onSubmit={handleSubmit} className="glass-card gradient-stroke p-6 sm:p-8 space-y-5">
            <div>
              <label className="block text-sm font-bold text-text-primary mb-2 tracking-wide uppercase">What do you need?</label>
              <input
                type="text"
                placeholder="e.g. Graphic Calculator for 2 days"
                className="input-base"
                value={formData.title}
                onChange={set('title')}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-text-primary mb-2 tracking-wide uppercase">Details</label>
              <textarea
                rows="3"
                placeholder="Explain what exactly you're looking for…"
                className="input-base resize-none"
                value={formData.description}
                onChange={set('description')}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-text-primary mb-2 tracking-wide uppercase">Category</label>
                <select className="input-base appearance-none cursor-pointer" value={formData.category} onChange={set('category')}>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-text-primary mb-2 tracking-wide uppercase">Max Budget (₹)</label>
                <input
                  type="number"
                  placeholder="Optional"
                  className="input-base"
                  value={formData.maxBudget}
                  onChange={set('maxBudget')}
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-text-primary mb-2 tracking-wide uppercase">I want to</label>
              <div className="flex rounded-xl border border-border-color bg-surface/70 p-1">
                {['buy', 'rent'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, type: t }))}
                    className={`w-full rounded-lg py-2 text-sm font-bold capitalize transition ${
                      formData.type === t ? 'bg-accent text-white' : 'text-text-secondary'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {formError && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-4 bg-accent hover:bg-accent-hover text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting
                ? <Loader size={18} className="animate-spin" />
                : <><Send size={18} /> Broadcast Need</>}
            </button>
          </form>
        </div>
      </div>

      {/* Needs list */}
      <div className="w-full lg:w-[60%] xl:w-[65%]">
        <div className="mb-6 bento-panel p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-black tracking-tight">Recent Requests</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative grow sm:w-64">
              <Search size={16} className="absolute top-1/2 -translate-y-1/2 left-3 text-text-secondary" />
              <input className="input-base h-10 pl-9" placeholder="Search requests" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="flex items-center gap-1 rounded-xl border border-border-color bg-surface/80 px-2">
              <Filter size={14} className="text-text-secondary" />
              <select className="h-10 bg-transparent text-sm text-text-primary outline-none" value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value)}>
                <option>All</option>
                <option>Normal</option>
                <option>High</option>
              </select>
            </div>
          </div>
        </div>

        {loading && (
          <div className="bento-panel flex min-h-[200px] items-center justify-center gap-3">
            <Loader size={24} className="animate-spin text-accent" />
            <p className="text-text-secondary font-semibold">Loading needs…</p>
          </div>
        )}

        {!loading && error && (
          <div className="bento-panel p-6 text-center text-red-400">{error}</div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredNeeds.map((need) => (
              <NeedCard key={need.id} {...need} onHaveThis={() => window.alert(`Connect with ${need.user.name}`)} />
            ))}
            {filteredNeeds.length === 0 && (
              <div className="bento-panel p-6 text-center text-text-secondary md:col-span-2">
                No needs posted yet. Be the first!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
