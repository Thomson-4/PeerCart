import { useState, useEffect } from 'react';
import { Search, ChevronRight, Sparkles, Book, Laptop, Shirt, PackageSearch } from 'lucide-react';
import ItemCard from '../components/ItemCard';
import AnimatedNumber from '../components/AnimatedNumber';
import { FeedGridSkeleton } from '../components/Skeleton';

const dummyData = [
  { id: 1, title: 'Study Table with Lamp', price: '850', type: 'Sell', category: 'Home Essentials', distance: 'Downtown', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=400', isLiked: false },
  { id: 2, title: 'Data Structures Textbook Set', price: '2,200', type: 'Sell', category: 'Books', distance: 'Block L', image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=400', isLiked: false },
  { id: 3, title: 'Btwin Rockrider Cycle', price: '5,500', type: 'Sell', category: 'Home Essentials', distance: 'Riverside', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=400', isLiked: true },
  { id: 4, title: 'Programming Textbook - Clean Code', price: '450', type: 'Sell', category: 'Books', distance: 'Campus Center', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400', isLiked: false },
  { id: 5, title: 'Scientific Calculator - Casio FX-991EX', price: '1,200', type: 'Buy', category: 'Electronics', distance: 'Science Block', image: '/src/assets/Calculator.jpg', isLiked: true },
  { id: 6, title: 'Bajaj Immersion 1500 Watts Water Heater Rod', price: '350', type: 'Sell', category: 'Home Essentials', distance: 'South Campus', image: '/src/assets/water heater.webp', isLiked: false },
];

const categories = [
  { name: 'All', icon: Sparkles },
  { name: 'Electronics', icon: Laptop },
  { name: 'Books', icon: Book },
  { name: 'Home Essentials', icon: Shirt }
];

export default function HomeFeed() {
  const [activeMode, setActiveMode] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [isFeedLoading, setIsFeedLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsFeedLoading(false), 1100);
    return () => clearTimeout(t);
  }, []);

  const filteredItems = dummyData.filter((item) => {
    const modeMatch = activeMode === 'All' || item.type === activeMode;
    const categoryMatch = activeCategory === 'All' || item.category === activeCategory;
    const queryMatch = query.trim().length === 0 || item.title.toLowerCase().includes(query.toLowerCase());
    return modeMatch && categoryMatch && queryMatch;
  });

  return (
    <div className="flex flex-col gap-8 md:gap-10 animate-in fade-in zoom-in-95 duration-500 w-full mb-20">
      <section className="relative overflow-hidden rounded-3xl border border-border-color bg-surface/80 p-6 md:p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/30 via-transparent to-secondary-accent/20" />
        <div className="relative z-10 grid gap-6 md:grid-cols-[1.3fr_1fr] md:items-end">
          <div>
            <span className="trust-badge mb-3">Verified Users Only</span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-[1.05]">
              Nearby deals for everyday life.
            </h1>
            <p className="mt-3 max-w-xl text-text-secondary">
              Discover trusted buy, sell, and rent listings from people around you.
            </p>
          </div>
          <div className="bento-panel p-4">
            <p className="text-xs uppercase font-bold tracking-[0.14em] text-text-secondary">Trust System</p>
            <p className="mt-2 text-sm text-text-secondary">Only verified users can access live listings and chats.</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm font-semibold">Avg Trust Score</span>
              <span className="trust-badge tabular-nums">
                <AnimatedNumber end={96.1} duration={1600} decimals={1} />
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-[1.1fr_auto]">
        <div className="relative">
          <Search size={18} className="absolute top-1/2 left-4 -translate-y-1/2 text-text-secondary" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search nearby items"
            className="input-base pl-11 h-12 rounded-xl"
          />
        </div>
        <div className="flex rounded-xl border border-border-color bg-surface/80 p-1">
          {['All', 'Buy', 'Sell', 'Rent'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveMode(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                activeMode === tab ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      <section className="bento-panel p-4 md:p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl md:text-2xl font-black tracking-tight">Browse by vibe</h2>
          <span className="text-xs font-semibold text-text-secondary">{filteredItems.length} live items</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`rounded-2xl border p-4 text-left transition-all ${
                activeCategory === cat.name
                  ? 'border-accent/70 bg-accent/15'
                  : 'border-border-color bg-surface/40 hover:border-secondary-accent/60'
              }`}
            >
              <cat.icon size={20} className="mb-2 text-text-primary" />
              <p className="text-sm font-bold">{cat.name}</p>
              <p className="text-xs text-text-secondary mt-1">Quick filter</p>
            </button>
          ))}
        </div>
      </section>

      <section className="w-full flex flex-col gap-6">
        <div className="flex items-end justify-between px-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">Nearby Matches</h2>
          <button className="text-sm font-extrabold text-accent hover:text-accent-hover flex items-center gap-1 uppercase tracking-wide">
            Explore <ChevronRight size={16} strokeWidth={3} />
          </button>
        </div>

        {isFeedLoading ? (
          <FeedGridSkeleton count={8} />
        ) : filteredItems.length === 0 ? (
          <div className="bento-panel flex min-h-[180px] flex-col items-center justify-center gap-2 p-6 text-center">
            <PackageSearch size={28} className="text-text-secondary" />
            <p className="font-semibold">No items found for this filter set.</p>
            <p className="text-sm text-text-secondary">Try switching category or searching with fewer keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 animate-in fade-in duration-500 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} {...item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
