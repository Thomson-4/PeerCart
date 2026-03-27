import { NavLink } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, Users, Sparkles, MessageCircle, Star, PackageCheck, GraduationCap } from 'lucide-react';

export default function Landing() {
  const categories = [
    { title: 'Electronics', subtitle: 'Headphones, laptops, calculators' },
    { title: 'Books', subtitle: 'Books, guides, and learning tools' },
    { title: 'Home Essentials', subtitle: 'Furniture, appliances, and essentials' },
    { title: 'Rentals', subtitle: 'Borrow short-term for lower cost' },
  ];

  const featured = [
    { title: 'Sony WH-1000XM4', price: 'Rs 9,500', tag: 'Buy' },
    { title: 'Maths III Textbook', price: 'Rs 150/week', tag: 'Rent' },
    { title: 'Mini Fridge', price: 'Rs 4,500', tag: 'Sell' },
    { title: 'Scientific Calculator', price: 'Rs 120/day', tag: 'Rent' },
  ];

  return (
    <div className="flex flex-col gap-20 pb-20 animate-in fade-in duration-1000">
      <section className="rounded-3xl border border-border-color bg-surface/85 p-6 md:p-10 gradient-stroke">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border-color bg-surface-elevated px-4 py-2">
              <Sparkles size={14} className="text-secondary-accent" />
              <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-text-secondary">Verified Peer Marketplace</span>
            </div>

            <h1 className="mt-6 text-4xl md:text-6xl font-black tracking-tight leading-[1.04]">
              Your trusted marketplace,
              <span className="block text-accent">styled like a modern social app.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base md:text-lg text-text-secondary leading-relaxed">
              Buy, sell, and rent from verified people nearby. Fast discovery, trust-first interactions, and clean handoffs.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <NavLink to="/feed" className="btn-primary w-auto rounded-full px-7 py-3">
                Explore Marketplace <ArrowRight size={18} />
              </NavLink>
              <NavLink to="/add" className="btn-secondary w-auto rounded-full px-7 py-3">
                Post Your Item
              </NavLink>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bento-panel p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-text-secondary">Trust Score</p>
              <p className="mt-3 text-3xl font-black">97.4</p>
              <p className="mt-2 text-sm text-text-secondary">Profile-verified users only</p>
            </div>
            <div className="bento-panel p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-text-secondary">Active listings</p>
              <p className="mt-3 text-3xl font-black">2.1K+</p>
              <p className="mt-2 text-sm text-text-secondary">Live around your city</p>
            </div>
            <div className="bento-panel p-4 col-span-2">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-text-secondary">Smart Discovery</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {['Buy', 'Sell', 'Rent', 'Needs Board'].map((pill) => (
                  <span key={pill} className="rounded-full bg-accent/15 px-3 py-1 text-xs font-bold text-accent">
                    {pill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-border-color bg-surface/85 p-6 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">Shop by Category</h2>
          <NavLink to="/feed" className="text-sm font-bold text-accent">View all</NavLink>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((item) => (
            <div key={item.title} className="bento-panel p-5 transition hover:border-accent/50">
              <p className="text-lg font-bold">{item.title}</p>
              <p className="mt-2 text-sm text-text-secondary">{item.subtitle}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-border-color bg-surface/85 p-6 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">Featured Listings</h2>
          <NavLink to="/feed" className="text-sm font-bold text-accent">Shop feed</NavLink>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.map((item) => (
            <div key={item.title} className="bento-panel p-4">
              <span className="inline-flex rounded-full bg-secondary-accent/18 px-2.5 py-1 text-[11px] font-bold text-secondary-accent">
                {item.tag}
              </span>
              <p className="mt-3 font-bold">{item.title}</p>
              <p className="mt-1 text-sm text-text-secondary">{item.price}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bento-panel p-6">
          <ShieldCheck size={26} className="text-accent" />
          <h3 className="mt-4 text-xl font-black tracking-tight">Identity Verified</h3>
          <p className="mt-2 text-sm text-text-secondary leading-relaxed">
            Access is restricted to verified users for safer transactions.
          </p>
        </div>
        <div className="bento-panel p-6">
          <Zap size={26} className="text-secondary-accent" />
          <h3 className="mt-4 text-xl font-black tracking-tight">Fast Local Handoffs</h3>
          <p className="mt-2 text-sm text-text-secondary leading-relaxed">
            Discover nearby listings and close deals quickly around your area.
          </p>
        </div>
        <div className="bento-panel p-6">
          <Users size={26} className="text-accent" />
          <h3 className="mt-4 text-xl font-black tracking-tight">Built for Gen-Z</h3>
          <p className="mt-2 text-sm text-text-secondary leading-relaxed">
            Social, visual, and trust-centric UX instead of utility-heavy clutter.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-border-color bg-gradient-to-r from-accent/15 via-surface to-secondary-accent/10 p-8 md:p-10">
        <div className="grid gap-7 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-text-secondary">Social Proof</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-black tracking-tight">10,000+ peer-to-peer trades completed.</h2>
            <p className="mt-3 text-text-secondary">PeerCart users rely on trust scores and reviews before every meetup.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bento-panel p-4">
              <Star size={16} className="text-secondary-accent" />
              <p className="mt-2 text-2xl font-black">4.9/5</p>
              <p className="text-xs text-text-secondary">Avg rating</p>
            </div>
            <div className="bento-panel p-4">
              <PackageCheck size={16} className="text-accent" />
              <p className="mt-2 text-2xl font-black">2K+</p>
              <p className="text-xs text-text-secondary">Active listings</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-border-color bg-surface/85 p-6 md:p-8">
        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-text-secondary">Weekly Market Pulse</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-black tracking-tight">Stay updated with top local deals</h2>
            <p className="mt-2 text-text-secondary">Get curated trending categories, best prices, and trusted need requests.</p>
          </div>
          <div className="flex items-center rounded-full border border-border-color bg-surface-elevated p-1">
            <button className="rounded-full bg-accent px-4 py-2 text-sm font-bold text-white">Subscribe</button>
            <span className="px-3 text-xs font-bold uppercase tracking-[0.12em] text-text-secondary">No spam</span>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-border-color bg-surface/85 p-6 md:p-8">
        <h3 className="text-lg font-black mb-4">Resources</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <NavLink to="/needs" className="bento-panel p-4 hover:border-accent/50 transition">
            <MessageCircle size={18} className="text-accent" />
            <p className="mt-3 font-bold">Need Board</p>
            <p className="text-sm text-text-secondary">Post what you need and get replies fast.</p>
          </NavLink>
          <NavLink to="/feed" className="bento-panel p-4 hover:border-accent/50 transition">
            <GraduationCap size={18} className="text-secondary-accent" />
            <p className="mt-3 font-bold">Verified Feed</p>
            <p className="text-sm text-text-secondary">Browse trusted listings nearby.</p>
          </NavLink>
          <NavLink to="/profile" className="bento-panel p-4 hover:border-accent/50 transition">
            <Star size={18} className="text-accent" />
            <p className="mt-3 font-bold">Trust Dashboard</p>
            <p className="text-sm text-text-secondary">Track reviews, score, and activity.</p>
          </NavLink>
        </div>
      </section>
    </div>
  );
}
