import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search, ChevronRight, Sparkles, BookOpen, Laptop,
  Shirt, PackageSearch, Loader, ShieldCheck, RefreshCw,
  Sliders, X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ItemCard from '../components/ItemCard';
import { listings as listingsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import calculatorImg from '../assets/Calculator.jpg';
import heaterImg from '../assets/water heater.webp';

const MODES = ['All', 'Sell', 'Rent'];

const CATEGORIES = [
  { label: 'All',          value: '',                   icon: Sparkles  },
  { label: 'Electronics',  value: 'electronics',        icon: Laptop   },
  { label: 'Textbooks',    value: 'textbooks',          icon: BookOpen },
  { label: 'Hostel Gear',  value: 'hostel-essentials',  icon: Shirt    },
  { label: 'Formal Wear',  value: 'formal-wear',        icon: ShieldCheck },
  { label: 'Cycles',       value: 'cycles',             icon: RefreshCw   },
  { label: 'Hobby Gear',   value: 'hobby-gear',         icon: PackageSearch },
];

const CATEGORY_LABELS = {
  electronics:         'Electronics',
  textbooks:           'Textbooks',
  'formal-wear':       'Formal Wear',
  cycles:              'Cycles',
  'hobby-gear':        'Hobby Gear',
  'hostel-essentials': 'Hostel Gear',
};

const FALLBACK = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&q=80&w=400';

const rupees = (p) => `₹${(p / 100).toLocaleString('en-IN')}`;

const DEMO_ITEMS = [
  { id: 'demo-1', title: 'Book: Clean Code (Paperback)', price: '₹450',      type: 'Sell', category: 'Textbooks',   distance: '2.1 km', image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=600', isLiked: false },
  { id: 'demo-2', title: 'Casio FX-991EX Calculator',    price: '₹1,200',    type: 'Sell', category: 'Electronics',  distance: '0.9 km', image: calculatorImg, isLiked: true  },
  { id: 'demo-3', title: 'Electric Kettle (1.5L)',        price: '₹250/day',  type: 'Rent', category: 'Hostel Gear',  distance: '1.3 km', image: 'https://images.unsplash.com/photo-1556910633-5099dc3971e5?auto=format&fit=crop&q=80&w=600', isLiked: false },
  { id: 'demo-4', title: 'Water Heater Rod (1500W)',      price: '₹350',      type: 'Sell', category: 'Hostel Gear',  distance: '3.0 km', image: heaterImg, isLiked: false },
  { id: 'demo-5', title: 'Sony WH-1000XM4 Headphones',   price: '₹9,500',    type: 'Sell', category: 'Electronics',  distance: '1.8 km', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600', isLiked: false },
  { id: 'demo-6', title: 'Maths III Textbook',            price: '₹150/week', type: 'Rent', category: 'Textbooks',   distance: '0.4 km', image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600', isLiked: false },
];

const mapListing = (l) => ({
  id:       l._id,
  title:    l.title,
  price:    l.type === 'rent' ? `${rupees(l.price)}/day` : rupees(l.price),
  type:     l.type === 'sell' ? 'Sell' : 'Rent',
  category: CATEGORY_LABELS[l.category] || l.category,
  distance: 'Nearby',
  image:    l.images?.[0] || FALLBACK,
  isLiked:  false,
  urgent:   l.urgent || false,
});

/* ── Skeleton card ──────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border-color bg-surface overflow-hidden">
      <div className="aspect-[4/5] skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 skeleton rounded-full" />
        <div className="h-4 w-3/4 skeleton rounded-lg" />
        <div className="h-4 w-1/2 skeleton rounded-lg" />
        <div className="h-5 w-20 skeleton rounded-lg mt-2" />
      </div>
    </div>
  );
}

export default function HomeFeed() {
  const { user } = useAuth();
  const trustLevel = user?.trustLevel ?? 0;

  const [activeMode,     setActiveMode]     = useState('All');
  const [activeCategory, setActiveCategory] = useState('');
  const [query,          setQuery]          = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [items,          setItems]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [searching,      setSearching]      = useState(false); // subtle spinner during debounce
  const [error,          setError]          = useState('');
  const debounceRef = useRef(null);

  // Debounce: wait 400ms after user stops typing before hitting the API
  useEffect(() => {
    setSearching(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      setSearching(false);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (activeMode === 'Sell') params.type = 'sell';
      if (activeMode === 'Rent') params.type = 'rent';
      if (activeCategory)        params.category = activeCategory;
      if (debouncedQuery.trim()) params.q = debouncedQuery.trim();
      const data = await listingsApi.getAll(params);
      setItems((data.listings || []).map(mapListing));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeMode, activeCategory, debouncedQuery]);

  useEffect(() => {
    fetchListings();
    // Auto-refresh every 60s so sold/rented listings disappear without manual refresh
    const timer = setInterval(fetchListings, 60_000);
    return () => clearInterval(timer);
  }, [fetchListings]);

  const showDemo = !loading && !error && items.length === 0 && !debouncedQuery.trim();
  const displayItems = showDemo ? DEMO_ITEMS : items;

  return (
    <div className="flex flex-col gap-8 animate-fade-in w-full pb-24">

      {/* ── Trust Level 0 banner ──────────────────────────── */}
      {trustLevel < 1 && (
        <div className="animate-slide-down flex items-center justify-between gap-4 rounded-2xl border border-accent/30 bg-accent/8 px-5 py-4">
          <div className="flex items-center gap-3">
            <ShieldCheck size={18} className="text-accent shrink-0" />
            <p className="text-sm font-semibold">
              You're at <strong>Level 0</strong> — verify your campus email to unlock selling.
            </p>
          </div>
          <Link to="/profile" className="text-sm font-extrabold text-accent hover:underline whitespace-nowrap flex items-center gap-1">
            Verify <ChevronRight size={14} strokeWidth={3} />
          </Link>
        </div>
      )}

      {/* ── Hero banner ───────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-border-color bg-surface p-7 md:p-10">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-secondary-accent/10 pointer-events-none" />
        <div className="orb w-72 h-72 -top-16 -right-16 bg-accent/15 absolute" style={{ filter: 'blur(60px)' }} />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div>
            <span className="trust-badge mb-3 inline-flex">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-accent animate-ping-slow absolute" />
              Live Feed
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Nearby deals,<br />
              <span className="gradient-text">trusted people.</span>
            </h1>
            <p className="mt-3 text-text-secondary max-w-sm">
              Buy, sell, and rent from verified REVA students around you.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-right shrink-0">
            <p className="text-4xl font-black stat-num text-text-primary">
              {loading ? '—' : `${displayItems.length}`}
            </p>
            <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">
              {showDemo ? 'Demo items' : 'Active listings'}
            </p>
          </div>
        </div>
      </section>

      {/* ── Search + Mode toggle ──────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={17} className="absolute top-1/2 left-4 -translate-y-1/2 text-text-secondary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search listings…"
            className="input-base pl-11 h-12 rounded-2xl"
          />
          {query && (
            searching
              ? <Loader size={15} className="absolute top-1/2 right-3 -translate-y-1/2 animate-spin text-accent" />
              : <button
                  onClick={() => setQuery('')}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  <X size={16} />
                </button>
          )}
        </div>
        <div className="flex rounded-2xl border border-border-color bg-surface-elevated p-1 shrink-0">
          {MODES.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveMode(tab)}
              className={`rounded-xl px-5 py-2 text-sm font-bold transition-all duration-200 ${
                activeMode === tab
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Category filter chips ─────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-text-secondary mr-1">
          <Sliders size={14} />
          <span className="text-xs font-bold uppercase tracking-wide">Filter</span>
        </div>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`chip transition-all duration-200 ${activeCategory === cat.value ? 'active' : ''}`}
          >
            <cat.icon size={12} />
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── Listings ──────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-black tracking-tight">
            {showDemo ? 'Sample Listings' : 'Shop Feed'}
            {!loading && !showDemo && (
              <span className="ml-2 text-sm font-normal text-text-secondary">({filtered.length})</span>
            )}
          </h2>
          <button
            onClick={fetchListings}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-extrabold text-accent hover:text-accent-hover uppercase tracking-wide transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="bento-panel flex min-h-[200px] flex-col items-center justify-center gap-3 p-8 text-center">
            <p className="text-red-400 font-semibold">{error}</p>
            <button onClick={fetchListings} className="btn-primary rounded-xl px-5 py-2 text-sm">
              Retry
            </button>
          </div>
        )}

        {/* Items grid */}
        {!loading && !error && (
          <>
            {showDemo && (
              <div className="mb-5 flex items-start gap-2 rounded-xl bg-accent/8 border border-accent/20 px-4 py-3">
                <PackageSearch size={16} className="text-accent mt-0.5 shrink-0" />
                <p className="text-sm text-text-secondary">
                  No real listings yet — showing sample items. <Link to="/add" className="text-accent font-bold hover:underline">Post the first one!</Link>
                </p>
              </div>
            )}

            {/* No search results */}
            {!showDemo && items.length === 0 && (
              <div className="bento-panel flex flex-col items-center justify-center gap-3 py-16 text-center">
                <PackageSearch size={40} className="text-text-secondary/30" />
                <p className="font-bold text-text-primary">No listings found</p>
                <p className="text-sm text-text-secondary">
                  {debouncedQuery.trim()
                    ? <>No results for "<strong>{debouncedQuery}</strong>" — try different keywords.</>
                    : 'Try a different filter or check back later.'}
                </p>
                {debouncedQuery.trim() && (
                  <button onClick={() => setQuery('')} className="text-sm font-bold text-accent hover:underline">
                    Clear search
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {displayItems.map((item) => (
                <ItemCard key={item.id} {...item} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
