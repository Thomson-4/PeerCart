import { useState, useRef, useEffect } from 'react';
import {
  Save, Loader, ArrowLeft, UploadCloud, X,
  CheckCircle2, AlertCircle, Zap,
} from 'lucide-react';
import { listings as listingsApi, upload as uploadApi } from '../services/api';
import { useNavigate, useParams, Link } from 'react-router-dom';

const CATEGORIES = [
  { label: 'Textbooks',    value: 'textbooks' },
  { label: 'Electronics',  value: 'electronics' },
  { label: 'Formal Wear',  value: 'formal-wear' },
  { label: 'Cycles',       value: 'cycles' },
  { label: 'Hobby Gear',   value: 'hobby-gear' },
  { label: 'Hostel Gear',  value: 'hostel-essentials' },
];

const CONDITIONS = [
  { label: 'New',      value: 'new' },
  { label: 'Like New', value: 'like-new' },
  { label: 'Good',     value: 'good' },
  { label: 'Fair',     value: 'fair' },
];

export default function EditListing() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const fileRef   = useRef(null);

  const [form,         setForm]         = useState(null);   // null = loading
  const [imageFile,    setImageFile]    = useState(null);   // new file picked
  const [imagePreview, setImagePreview] = useState(null);   // current preview URL
  const [submitting,   setSubmitting]   = useState(false);
  const [loadError,    setLoadError]    = useState('');
  const [saveError,    setSaveError]    = useState('');
  const [success,      setSuccess]      = useState(false);

  // Load existing listing
  useEffect(() => {
    listingsApi.getOne(id)
      .then((data) => {
        const l = data.listing;
        setForm({
          title:       l.title       || '',
          description: l.description || '',
          category:    l.category    || 'textbooks',
          condition:   l.condition   || 'good',
          type:        l.type        || 'sell',
          price:       l.price != null ? (l.price / 100).toString() : '',
          urgent:      l.urgent      || false,
        });
        setImagePreview(l.images?.[0] || null);
      })
      .catch((err) => setLoadError(err.message || 'Could not load listing.'));
  }, [id]);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.price) return;
    setSaveError('');
    setSubmitting(true);
    try {
      let imageUrl;
      if (imageFile) {
        const result = await uploadApi.uploadImage(imageFile);
        imageUrl = result.url;
      } else if (imagePreview?.startsWith('https://')) {
        imageUrl = imagePreview; // unchanged existing URL
      }

      const body = {
        title:       form.title.trim(),
        description: form.description.trim(),
        category:    form.category,
        condition:   form.condition,
        type:        form.type,
        price:       Math.round(parseFloat(form.price) * 100),
        ...(form.type === 'rent' ? { urgent: form.urgent } : { urgent: false }),
        ...(imageUrl ? { images: [imageUrl] } : {}),
      };

      await listingsApi.update(id, body);
      setSuccess(true);
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      setSaveError(err.message || 'Failed to save changes. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Loading ─────────────────────────────────────── */
  if (!form && !loadError) {
    return (
      <div className="flex items-center justify-center min-h-[300px] gap-3">
        <Loader size={22} className="animate-spin text-accent" />
        <p className="text-text-secondary font-semibold">Loading listing…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="bento-panel p-8 text-center space-y-4">
        <AlertCircle size={36} className="text-red-400 mx-auto" />
        <p className="text-text-primary font-bold">{loadError}</p>
        <Link to="/profile" className="text-sm text-accent hover:underline">← Back to Profile</Link>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-500 pb-24">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link to="/profile" className="p-2 rounded-xl border border-border-color text-text-secondary hover:text-text-primary hover:border-accent/30 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Edit Listing</h1>
          <p className="text-text-secondary text-sm mt-0.5">Update your listing details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* ── Image ─────────────────────────────────────────── */}
        <div className="space-y-3">
          {imagePreview ? (
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden border-2 border-border-color">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileRef.current?.click()}
              className="aspect-square w-full rounded-2xl border-2 border-dashed border-border-color bg-surface-elevated/80 flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors group"
            >
              <div className="bg-surface rounded-full p-4 mb-4 shadow-sm group-hover:scale-110 transition-transform">
                <UploadCloud size={32} className="text-text-secondary group-hover:text-accent" />
              </div>
              <p className="font-bold text-lg mb-1">Upload New Photo</p>
              <p className="text-sm text-text-secondary">Click to select an image</p>
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          {imagePreview && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold border border-border-color rounded-xl hover:border-accent/60 hover:text-accent transition-colors text-text-secondary"
            >
              <UploadCloud size={15} /> Replace Image
            </button>
          )}
        </div>

        {/* ── Form ──────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-5 bento-panel p-6">

          {/* Title */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wide mb-2">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={set('title')}
              placeholder="What are you selling?"
              className="input-base text-base font-medium"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wide mb-2">Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={set('description')}
              placeholder="Condition, history, why you're selling…"
              className="input-base resize-none"
              required
            />
          </div>

          {/* Category + Condition */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold uppercase tracking-wide mb-2">Category</label>
              <select className="input-base appearance-none cursor-pointer" value={form.category} onChange={set('category')}>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold uppercase tracking-wide mb-2">Condition</label>
              <select className="input-base appearance-none cursor-pointer" value={form.condition} onChange={set('condition')}>
                {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          {/* Sell / Rent */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wide mb-2">Type</label>
            <div className="flex rounded-xl border border-border-color bg-surface/70 p-1">
              {['sell', 'rent'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, type: t }))}
                  className={`w-full rounded-lg py-2 text-sm font-bold capitalize transition ${
                    form.type === t ? 'bg-accent text-white' : 'text-text-secondary'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {form.type === 'rent' && (
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, urgent: !prev.urgent }))}
                className={`mt-2 w-full flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-bold transition-all ${
                  form.urgent
                    ? 'bg-orange-500/15 border-orange-500/40 text-orange-300'
                    : 'border-border-color text-text-secondary hover:border-orange-500/30 hover:text-orange-300'
                }`}
              >
                <Zap size={16} className={form.urgent ? 'text-orange-400' : ''} />
                {form.urgent ? '⚡ Marked as Urgent' : 'Mark as Urgent (need to rent out ASAP)'}
              </button>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wide mb-2">
              Price (₹){form.type === 'rent' && <span className="font-normal normal-case text-text-secondary"> per day</span>}
            </label>
            <input
              type="number"
              value={form.price}
              onChange={set('price')}
              placeholder="e.g. 499"
              className="input-base"
              min="1"
              required
            />
          </div>

          {/* Errors / Success */}
          {saveError && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
              {saveError}
            </p>
          )}
          {success && (
            <p className="text-emerald-400 text-sm bg-emerald-400/10 border border-emerald-400/20 rounded-xl px-4 py-3 flex items-center gap-2">
              <CheckCircle2 size={15} /> Changes saved! Redirecting…
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || success}
            className="w-full py-3.5 cta-gradient text-white font-extrabold rounded-xl shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting
              ? <Loader size={18} className="animate-spin" />
              : <><Save size={18} /> Save Changes</>}
          </button>
        </form>
      </div>
    </div>
  );
}
