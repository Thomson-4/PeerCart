import { useState, useRef, useEffect } from 'react';
import {
  UploadCloud, Send, Loader, Lock, ShieldCheck,
  Camera, X, CheckCircle2, Smartphone, ImageIcon, QrCode, Zap,
} from 'lucide-react';
import { listings as listingsApi, upload as uploadApi } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  { label: 'Textbooks',       value: 'textbooks' },
  { label: 'Electronics',     value: 'electronics' },
  { label: 'Formal Wear',     value: 'formal-wear' },
  { label: 'Cycles',          value: 'cycles' },
  { label: 'Hobby Gear',      value: 'hobby-gear' },
  { label: 'Hostel Gear',     value: 'hostel-essentials' },
];

const CONDITIONS = [
  { label: 'New',      value: 'new' },
  { label: 'Like New', value: 'like-new' },
  { label: 'Good',     value: 'good' },
  { label: 'Fair',     value: 'fair' },
];

const EMPTY = {
  title: '', description: '', category: 'textbooks',
  condition: 'good', type: 'sell', price: '', urgent: false,
};

// Detect mobile device
const isMobile = /iPhone|Android|iPad|iPod/i.test(navigator.userAgent);

export default function AddItem() {
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const fileRef    = useRef(null);
  const trustLevel = user?.trustLevel ?? 0;

  const [formData,          setFormData]          = useState(EMPTY);
  const [imageFile,         setImageFile]         = useState(null);
  const [imagePreview,      setImagePreview]      = useState(null);
  const [liveCaptureVerified, setLiveCaptureVerified] = useState(false);
  const [submitting,        setSubmitting]        = useState(false);
  const [error,             setError]             = useState('');
  const [success,           setSuccess]           = useState(false);

  // QR upload state (desktop only)
  const [qrToken,  setQrToken]  = useState(null);
  const [qrUrl,    setQrUrl]    = useState(null);
  const [qrDone,   setQrDone]   = useState(false);
  const pollRef = useRef(null);

  // Poll backend every 2s while QR modal is open
  useEffect(() => {
    if (!qrToken || qrDone) return;
    pollRef.current = setInterval(async () => {
      try {
        const data = await uploadApi.pollSession(qrToken);
        if (data.completed && data.url) {
          clearInterval(pollRef.current);
          setQrDone(true);
          setImagePreview(data.url);
          setLiveCaptureVerified(true);
        }
      } catch (_) {}
    }, 2000);
    return () => clearInterval(pollRef.current);
  }, [qrToken, qrDone]);

  const openQrModal = async () => {
    try {
      const { token } = await uploadApi.createSession();
      const mobileUrl = `${window.location.origin}/upload/${token}`;
      setQrToken(token);
      setQrUrl(mobileUrl);
      setQrDone(false);
    } catch (err) {
      setError('Could not create upload session. Try again.');
    }
  };

  const closeQrModal = () => {
    clearInterval(pollRef.current);
    setQrToken(null);
    setQrUrl(null);
    setQrDone(false);
  };

  // Trust Level 0 gate
  if (trustLevel < 1) {
    return (
      <div className="w-full animate-in fade-in duration-500 flex flex-col items-center justify-center min-h-[400px] text-center gap-6">
        <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
          <Lock size={36} className="text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight mb-2">Verify Your Campus Email First</h1>
          <p className="text-text-secondary max-w-md">
            Trust Level 1 is required to post listings. Verify your college email to unlock buying and selling.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/profile"
            className="px-6 py-3 bg-accent text-white font-bold rounded-xl hover:-translate-y-0.5 transition-transform flex items-center gap-2">
            <ShieldCheck size={18} /> Go to Profile → Verify Email
          </Link>
          <Link to="/feed"
            className="px-6 py-3 border border-border-color text-text-secondary font-bold rounded-xl hover:text-text-primary transition-colors">
            Browse Listings
          </Link>
        </div>
      </div>
    );
  }

  const set = (key) => (e) => setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  // ── Image selection ─────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));

    // Mark as live capture if the user used the camera (mobile only)
    // We detect this by checking if the file came from capture input
    // and the device is mobile.
    const fromCamera = isMobile && e.target.getAttribute('capture') === 'environment';
    setLiveCaptureVerified(fromCamera);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setLiveCaptureVerified(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  // ── Submit ──────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.price) return;
    setError('');
    setSubmitting(true);
    try {
      // Upload image to Cloudinary if user selected a file directly.
      // (QR-upload path already stores the Cloudinary URL in imagePreview.)
      let imageUrl = null;
      if (imageFile) {
        const result = await uploadApi.uploadImage(imageFile);
        imageUrl = result.url;
      } else if (imagePreview && imagePreview.startsWith('https://')) {
        // QR mobile upload — imagePreview is already the Cloudinary URL
        imageUrl = imagePreview;
      }

      const body = {
        title:              formData.title.trim(),
        description:        formData.description.trim(),
        category:           formData.category,
        condition:          formData.condition,
        type:               formData.type,
        price:              Math.round(parseFloat(formData.price) * 100), // rupees → paise
        liveCaptureVerified,
        ...(imageUrl ? { images: [imageUrl] } : {}),
        ...(formData.type === 'rent' ? { urgent: formData.urgent } : {}),
      };
      await listingsApi.create(body);
      setSuccess(true);
      setTimeout(() => navigate('/feed'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full animate-in slide-in-from-bottom-5 duration-700">

      <div className="mb-8 text-center sm:text-left">
        <span className="trust-badge mb-3">Campus Marketplace</span>
        <h1 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">Sell or Rent an Item</h1>
        <p className="text-text-secondary text-lg max-w-2xl">
          List your item to the campus community in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">

        {/* ── Left: Photo upload ──────────────────────────────────── */}
        <div className="space-y-4">

          {imagePreview ? (
            /* Preview */
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden border-2 border-border-color">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
              {liveCaptureVerified && (
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-emerald-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  <CheckCircle2 size={13} /> Live Capture Verified
                </div>
              )}
            </div>
          ) : (
            /* Upload zone */
            <div className="space-y-3">
              <div
                onClick={() => fileRef.current?.click()}
                className="aspect-square w-full rounded-2xl border-2 border-dashed border-border-color bg-surface-elevated/80 flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors group"
              >
                <div className="bg-surface rounded-full p-4 mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  <UploadCloud size={32} className="text-text-secondary group-hover:text-accent" />
                </div>
                <h3 className="font-bold text-lg mb-1">
                  {isMobile ? 'Take a Photo' : 'Upload a Photo'}
                </h3>
                <p className="text-sm text-text-secondary">
                  {isMobile
                    ? 'Tap to open your rear camera'
                    : 'Click to select an image from your computer'}
                </p>
              </div>

              {/* Desktop: scan with phone */}
              {!isMobile && (
                <button
                  type="button"
                  onClick={openQrModal}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold border border-border-color rounded-xl hover:border-accent/60 hover:text-accent transition-colors text-text-secondary"
                >
                  <QrCode size={16} /> Scan QR to upload from phone instead
                </button>
              )}
            </div>
          )}

          {/* Hidden file input — camera on mobile, file picker on desktop */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            {...(isMobile ? { capture: 'environment' } : {})}
            onChange={handleImageChange}
            className="hidden"
          />

          {/* Capture status info */}
          <div className={`bento-panel p-4 flex gap-3 items-start border ${
            liveCaptureVerified
              ? 'border-emerald-500/30 bg-emerald-500/5'
              : 'border-border-color'
          }`}>
            {isMobile ? (
              <Camera size={18} className={liveCaptureVerified ? 'text-emerald-400 shrink-0 mt-0.5' : 'text-text-secondary shrink-0 mt-0.5'} />
            ) : (
              <Smartphone size={18} className="text-text-secondary shrink-0 mt-0.5" />
            )}
            <div className="text-xs text-text-secondary leading-relaxed">
              {liveCaptureVerified ? (
                <span className="text-emerald-400 font-bold">
                  Live capture verified! Buyers will see a verified badge on your listing.
                </span>
              ) : isMobile ? (
                <>
                  <strong className="text-text-primary">Use live camera</strong> for a verified badge —
                  builds trust with buyers. Or tap to pick from gallery.
                </>
              ) : (
                <>
                  <strong className="text-text-primary">On mobile?</strong> Use the rear camera to
                  get a live-capture verified badge. Desktop uses file upload.
                </>
              )}
            </div>
          </div>

          {/* Optional: switch between camera / gallery on mobile */}
          {isMobile && !imagePreview && (
            <button
              type="button"
              onClick={() => {
                // Create a gallery-only input temporarily
                const gal = document.createElement('input');
                gal.type   = 'file';
                gal.accept = 'image/*';
                gal.onchange = (ev) => {
                  const f = ev.target.files?.[0];
                  if (!f) return;
                  setImageFile(f);
                  setImagePreview(URL.createObjectURL(f));
                  setLiveCaptureVerified(false); // gallery = not live capture
                };
                gal.click();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm text-text-secondary border border-border-color rounded-xl hover:border-accent/50 hover:text-accent transition-colors"
            >
              <ImageIcon size={15} /> Pick from Gallery instead
            </button>
          )}
        </div>

        {/* ── Right: Form ─────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-5 bento-panel p-6 md:p-7">

          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-text-primary mb-2 uppercase tracking-wide">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={set('title')}
              placeholder="What are you selling?"
              className="input-base text-lg font-medium"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-text-primary mb-2 uppercase tracking-wide">Description</label>
            <textarea
              rows="4"
              value={formData.description}
              onChange={set('description')}
              placeholder="Condition, history, why you're selling…"
              className="input-base resize-none"
              required
            />
          </div>

          {/* Category + Condition */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-text-primary mb-2 uppercase tracking-wide">Category</label>
              <select className="input-base appearance-none cursor-pointer" value={formData.category} onChange={set('category')}>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-text-primary mb-2 uppercase tracking-wide">Condition</label>
              <select className="input-base appearance-none cursor-pointer" value={formData.condition} onChange={set('condition')}>
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sell / Rent toggle */}
          <div>
            <label className="block text-sm font-bold text-text-primary mb-2 uppercase tracking-wide">I want to</label>
            <div className="flex rounded-xl border border-border-color bg-surface/70 p-1">
              {['sell', 'rent'].map((t) => (
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
            {formData.type === 'rent' && trustLevel < 2 && (
              <p className="text-yellow-400 text-xs mt-2">
                Rent listings require Trust Level 2. You'll need to complete more transactions first.
              </p>
            )}
            {/* Urgent toggle for rent */}
            {formData.type === 'rent' && (
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, urgent: !prev.urgent }))}
                className={`mt-2 w-full flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-bold transition-all ${
                  formData.urgent
                    ? 'bg-orange-500/15 border-orange-500/40 text-orange-300'
                    : 'border-border-color text-text-secondary hover:border-orange-500/30 hover:text-orange-300'
                }`}
              >
                <Zap size={16} className={formData.urgent ? 'text-orange-400' : ''} />
                <span>{formData.urgent ? '⚡ Marked as Urgent — renters will see priority badge' : 'Mark as Urgent (need to rent out ASAP)'}</span>
              </button>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-bold text-text-primary mb-2 uppercase tracking-wide">
              Price (₹){' '}
              {formData.type === 'rent' && (
                <span className="normal-case font-normal text-text-secondary">per day</span>
              )}
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={set('price')}
              placeholder="e.g. 499"
              className="input-base"
              min="1"
              required
            />
          </div>

          {/* Error / Success */}
          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}
          {success && (
            <p className="text-green-400 text-sm bg-green-400/10 border border-green-400/20 rounded-xl px-4 py-3">
              ✅ Listing published! Redirecting…
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || success}
            className="w-full py-4 mt-2 cta-gradient text-white font-extrabold rounded-xl shadow-md hover:-translate-y-1 transition-transform duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting
              ? <Loader size={18} className="animate-spin" />
              : <><Send size={18} /> Publish Listing</>
            }
          </button>
        </form>
      </div>

      {/* QR Upload Modal */}
      {qrToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bento-panel p-8 max-w-sm w-full text-center relative">
            <button
              type="button"
              onClick={closeQrModal}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary"
            >
              <X size={20} />
            </button>

            {qrDone ? (
              <div className="flex flex-col items-center gap-4">
                <CheckCircle2 size={48} className="text-emerald-400" />
                <h3 className="text-xl font-black">Photo received!</h3>
                <p className="text-text-secondary text-sm">Your photo has been added. Close this to continue.</p>
                <button
                  type="button"
                  onClick={closeQrModal}
                  className="px-6 py-3 bg-accent text-white font-bold rounded-xl"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <Smartphone size={28} className="text-accent mx-auto mb-3" />
                <h3 className="text-xl font-black mb-1">Scan with your phone</h3>
                <p className="text-text-secondary text-sm mb-5">
                  Open your phone camera and scan this code to take a live photo and upload it directly.
                </p>

                {/* QR Code via free API — no npm package needed */}
                <div className="flex justify-center mb-5">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}&bgcolor=0a0a0a&color=ffffff&margin=2`}
                    alt="QR code"
                    className="rounded-xl"
                    width={200}
                    height={200}
                  />
                </div>

                <p className="text-xs text-text-secondary mb-2">
                  Or open this link on your phone:
                </p>
                <p className="text-xs text-accent font-mono break-all">{qrUrl}</p>

                <div className="flex items-center justify-center gap-2 mt-5 text-text-secondary text-sm">
                  <Loader size={14} className="animate-spin" />
                  Waiting for photo…
                </div>
                <p className="text-xs text-text-secondary mt-2">Session expires in 5 minutes</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
