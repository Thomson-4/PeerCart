import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ArrowRight, ShieldCheck, Zap, Users, Sparkles,
  Star, PackageCheck, GraduationCap, MessageSquare,
  TrendingUp, BookOpen, Cpu, Home, ChevronRight,
} from 'lucide-react';

/* ── Scroll-reveal hook ─────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ── Floating orb ───────────────────────────────────────────────── */
function Orb({ className }) {
  return <div className={`orb animate-blob ${className}`} aria-hidden="true" />;
}

/* ── Animated number ticker ─────────────────────────────────────── */
function AnimatedStat({ value, label, icon: Icon }) {
  return (
    <div className="bento-panel p-5 flex flex-col gap-3 reveal-scale hover:scale-105 transition-transform duration-300">
      {Icon && <Icon size={20} className="text-accent" />}
      <p className="text-3xl font-black stat-num text-text-primary">{value}</p>
      <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">{label}</p>
    </div>
  );
}

/* ── Category pill card ─────────────────────────────────────────── */
function CategoryCard({ icon: Icon, title, sub, color, delay }) {
  return (
    <NavLink
      to="/feed"
      className={`group relative overflow-hidden bento-panel p-5 flex flex-col gap-3 interactive-card reveal delay-${delay}`}
    >
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="font-black text-base leading-snug">{title}</p>
        <p className="text-xs text-text-secondary mt-0.5">{sub}</p>
      </div>
      <ChevronRight
        size={16}
        className="absolute bottom-4 right-4 text-text-secondary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300"
      />
    </NavLink>
  );
}

/* ── Feature block ──────────────────────────────────────────────── */
function FeatureBlock({ icon: Icon, title, body, accent, delay }) {
  return (
    <div className={`bento-panel p-7 flex flex-col gap-4 reveal delay-${delay} hover:border-accent/40 transition-colors duration-300`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${accent}`}>
        <Icon size={22} />
      </div>
      <h3 className="text-lg font-black tracking-tight">{title}</h3>
      <p className="text-sm text-text-secondary leading-relaxed">{body}</p>
    </div>
  );
}

/* ── Marquee ticker ─────────────────────────────────────────────── */
const TICKERS = [
  '🔥 Sony WH-1000XM4 · ₹9,500', '📚 Maths III Textbook · ₹150/wk',
  '❄️ Mini Fridge · ₹4,500', '🧮 FX-991EX Calculator · ₹1,200',
  '💻 MacBook Air M1 · ₹55,000', '👔 Formal Blazer · ₹800/day',
  '🚴 Cycle · ₹200/day', '🎧 Boat Nirvana · ₹2,800',
];

function MarqueeRow() {
  const items = [...TICKERS, ...TICKERS]; // double for seamless loop
  return (
    <div className="w-full overflow-hidden py-3 border-y border-border-color bg-surface/40 backdrop-blur-sm">
      <div className="marquee-track">
        {items.map((t, i) => (
          <span key={i} className="text-xs font-bold text-text-secondary whitespace-nowrap flex items-center gap-3">
            {t}
            <span className="w-1 h-1 rounded-full bg-border-color inline-block" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Main ───────────────────────────────────────────────────────── */
export default function Landing() {
  useReveal();

  const categories = [
    { icon: Cpu,         title: 'Electronics',     sub: 'Laptops, headphones, calcs', color: 'bg-accent/15 text-accent',           delay: '100' },
    { icon: BookOpen,    title: 'Textbooks',        sub: 'Notes, guides, study tools',  color: 'bg-neon-cyan/15 text-neon-cyan',      delay: '200' },
    { icon: Home,        title: 'Hostel Essentials', sub: 'Kettles, fridges, appliances', color: 'bg-secondary-accent/15 text-secondary-accent', delay: '300' },
    { icon: GraduationCap, title: 'Formal Wear',   sub: 'Blazers, formals on rent',    color: 'bg-neon-pink/15 text-neon-pink',      delay: '400' },
  ];

  const featured = [
    { title: 'Sony WH-1000XM4',       price: '₹9,500',    tag: 'Buy',  img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600' },
    { title: 'Maths III Textbook',     price: '₹150/week', tag: 'Rent', img: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=600' },
    { title: 'Mini Fridge',            price: '₹4,500',    tag: 'Buy',  img: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&q=80&w=600' },
    { title: 'Scientific Calculator',  price: '₹120/day',  tag: 'Rent', img: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&q=80&w=600' },
  ];

  const tagStyles = {
    Buy:  'bg-accent text-white',
    Rent: 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40',
    Sell: 'bg-secondary-accent/20 text-secondary-accent border border-secondary-accent/40',
  };

  return (
    <div className="flex flex-col gap-0 pb-24 -mt-8 -mx-4 sm:-mx-6 lg:-mx-12 overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex flex-col justify-center px-4 sm:px-8 lg:px-16 pt-20 pb-16 overflow-hidden">

        {/* Background orbs */}
        <Orb className="w-[600px] h-[600px] -top-40 -left-40 bg-accent/20 [animation-delay:0s]" />
        <Orb className="w-[500px] h-[500px] top-[30%] -right-28 bg-secondary-accent/15 [animation-delay:2s]" />
        <Orb className="w-[400px] h-[400px] bottom-0 left-1/2 -translate-x-1/2 bg-neon-cyan/10 [animation-delay:4s]" />

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

            {/* Left */}
            <div className="flex flex-col gap-7">
              {/* Animated pill badge */}
              <div className="animate-slide-up flex items-center gap-2 self-start">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-secondary-accent animate-ping-slow absolute" />
                  <div className="w-2 h-2 rounded-full bg-secondary-accent" />
                </div>
                <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-text-secondary">
                  Campus Marketplace · Live Now
                </span>
              </div>

              {/* Headline */}
              <div className="animate-slide-up delay-100">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.0]">
                  Buy, sell &<br />
                  <span className="gradient-text">rent anything</span>
                  <br />on campus.
                </h1>
              </div>

              <p className="animate-slide-up delay-200 text-lg text-text-secondary leading-relaxed max-w-lg">
                PeerCart connects REVA students for trusted peer-to-peer deals — from textbooks to electronics to hostel gear.
              </p>

              {/* CTAs */}
              <div className="animate-slide-up delay-300 flex flex-col sm:flex-row gap-3">
                <NavLink to="/feed" className="btn-primary rounded-2xl px-8 py-4 text-base glow-accent">
                  Browse Feed <ArrowRight size={20} />
                </NavLink>
                <NavLink to="/login" className="btn-ghost rounded-2xl px-8 py-4 text-base">
                  Sign In Free
                </NavLink>
              </div>

              {/* Social proof micro strip */}
              <div className="animate-slide-up delay-400 flex items-center gap-4 pt-2">
                <div className="flex -space-x-2">
                  {[42, 43, 44, 45, 46].map((n) => (
                    <img
                      key={n}
                      src={`https://i.pravatar.cc/40?img=${n}`}
                      className="w-8 h-8 rounded-full border-2 border-background object-cover"
                      alt="user"
                    />
                  ))}
                </div>
                <p className="text-sm text-text-secondary">
                  <strong className="text-text-primary">240+</strong> students active this week
                </p>
              </div>
            </div>

            {/* Right — bento stats */}
            <div className="animate-scale-in delay-300 grid grid-cols-2 gap-4">
              <div className="bento-panel p-6 col-span-2 flex items-center gap-5 hover:border-accent/40 transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-accent/15 flex items-center justify-center shrink-0">
                  <ShieldCheck size={26} className="text-accent" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-1">Trust Score</p>
                  <p className="text-4xl font-black stat-num gradient-text-warm">97.4</p>
                  <p className="text-xs text-text-secondary mt-1">Campus-verified users only</p>
                </div>
              </div>

              <div className="bento-panel p-5 hover:border-secondary-accent/40 transition-colors">
                <TrendingUp size={18} className="text-secondary-accent mb-2" />
                <p className="text-3xl font-black text-text-primary">2.1K+</p>
                <p className="text-xs text-text-secondary mt-1 font-semibold">Active listings</p>
              </div>

              <div className="bento-panel p-5 hover:border-neon-cyan/40 transition-colors">
                <Star size={18} className="text-neon-cyan mb-2" fill="currentColor" />
                <p className="text-3xl font-black text-text-primary">4.9</p>
                <p className="text-xs text-text-secondary mt-1 font-semibold">Avg seller rating</p>
              </div>

              <div className="bento-panel p-5 col-span-2 overflow-hidden relative hover:border-accent/30 transition-colors">
                <p className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-3">Smart Discovery</p>
                <div className="flex flex-wrap gap-2">
                  {['Buy', 'Sell', 'Rent', 'Need Board', 'Books', 'Electronics'].map((pill) => (
                    <span key={pill} className="chip active-style text-xs font-bold px-3 py-1.5 rounded-full border border-accent/30 bg-accent/10 text-accent">
                      {pill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER MARQUEE ─────────────────────────────────── */}
      <MarqueeRow />

      {/* ── CATEGORIES ─────────────────────────────────────── */}
      <section className="px-4 sm:px-8 lg:px-16 py-20 max-w-7xl mx-auto w-full">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-secondary-accent mb-2">Shop by Category</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight reveal">
              Everything a student needs.
            </h2>
          </div>
          <NavLink to="/feed" className="text-sm font-bold text-accent flex items-center gap-1 hover:gap-2 transition-all">
            View all <ArrowRight size={15} />
          </NavLink>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <CategoryCard key={cat.title} {...cat} />
          ))}
        </div>
      </section>

      {/* ── FEATURED LISTINGS ──────────────────────────────── */}
      <section className="px-4 sm:px-8 lg:px-16 pb-20 max-w-7xl mx-auto w-full">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-accent mb-2">Handpicked</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight reveal">
              Featured right now.
            </h2>
          </div>
          <NavLink to="/feed" className="text-sm font-bold text-accent flex items-center gap-1 hover:gap-2 transition-all">
            Shop feed <ArrowRight size={15} />
          </NavLink>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featured.map((item, i) => (
            <NavLink
              to="/feed"
              key={item.title}
              className={`group relative overflow-hidden rounded-2xl border border-border-color bg-surface interactive-card reveal delay-${(i + 1) * 100}`}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              </div>
              <div className="p-4">
                <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full ${tagStyles[item.tag]}`}>
                  {item.tag}
                </span>
                <p className="mt-2 font-bold text-text-primary line-clamp-1">{item.title}</p>
                <p className="mt-1 text-xl font-black text-accent">{item.price}</p>
              </div>
            </NavLink>
          ))}
        </div>
      </section>

      {/* ── FEATURE HIGHLIGHTS ─────────────────────────────── */}
      <section className="px-4 sm:px-8 lg:px-16 py-20 border-y border-border-color bg-surface-elevated/50 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-secondary-accent mb-3">Why PeerCart</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight reveal">
              Built different, for students.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <FeatureBlock
              icon={ShieldCheck}
              title="Campus-verified only"
              body="Every user is verified via college email or phone. No strangers. Safer deals, always."
              accent="bg-accent/15 text-accent"
              delay="100"
            />
            <FeatureBlock
              icon={Zap}
              title="Fast local handoffs"
              body="Listings are from people within your campus. Close deals in minutes, not days."
              accent="bg-secondary-accent/15 text-secondary-accent"
              delay="200"
            />
            <FeatureBlock
              icon={Users}
              title="Trust-first UX"
              body="Trust scores, review history, and transparent ratings before every transaction."
              accent="bg-neon-cyan/15 text-neon-cyan"
              delay="300"
            />
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ───────────────────────────────────── */}
      <section className="relative px-4 sm:px-8 lg:px-16 py-24 overflow-hidden w-full">
        <Orb className="w-[500px] h-[500px] -bottom-32 -right-32 bg-accent/15 [animation-delay:1s]" />
        <Orb className="w-[400px] h-[400px] top-0 -left-24 bg-secondary-accent/10 [animation-delay:3s]" />

        <div className="relative z-10 max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="reveal-left">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-text-secondary mb-4">Social Proof</p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05] mb-6">
              10,000+ trades<br /><span className="gradient-text">completed.</span>
            </h2>
            <p className="text-text-secondary text-lg leading-relaxed max-w-md">
              PeerCart students rely on trust scores and real reviews before every campus meetup.
            </p>
            <NavLink to="/login" className="btn-primary mt-8 rounded-2xl px-7 py-4 inline-flex">
              Join for free <ArrowRight size={20} />
            </NavLink>
          </div>

          <div className="grid grid-cols-2 gap-4 reveal-right">
            <AnimatedStat value="4.9/5" label="Avg seller rating" icon={Star} />
            <AnimatedStat value="2K+" label="Active listings" icon={PackageCheck} />
            <AnimatedStat value="97.4" label="Trust score" icon={ShieldCheck} />
            <AnimatedStat value="240+" label="Weekly traders" icon={Users} />
          </div>
        </div>
      </section>

      {/* ── NEED BOARD CTA ─────────────────────────────────── */}
      <section className="px-4 sm:px-8 lg:px-16 py-16 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden animated-border bg-surface p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8 reveal">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-secondary-accent/10 pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 trust-badge mb-4">
                <MessageSquare size={12} /> Need Board
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">Can't find it? Post a need.</h2>
              <p className="text-text-secondary max-w-md">
                Let verified sellers come to you. Post what you need and get matched in minutes.
              </p>
            </div>
            <NavLink to="/needs" className="relative z-10 btn-lime rounded-2xl px-8 py-4 text-base shrink-0 glow-lime">
              Post a Need <ArrowRight size={20} />
            </NavLink>
          </div>
        </div>
      </section>

      {/* ── FOOTER LINKS ───────────────────────────────────── */}
      <section className="px-4 sm:px-8 lg:px-16 py-16 border-t border-border-color w-full">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NavLink to="/needs" className="bento-panel p-6 hover:border-accent/40 transition-colors group reveal delay-100">
            <MessageSquare size={20} className="text-accent mb-3" />
            <p className="font-black">Need Board</p>
            <p className="text-sm text-text-secondary mt-1">Post what you need, get replies fast.</p>
            <p className="text-xs text-accent mt-3 font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Open <ChevronRight size={13} />
            </p>
          </NavLink>
          <NavLink to="/feed" className="bento-panel p-6 hover:border-secondary-accent/40 transition-colors group reveal delay-200">
            <Sparkles size={20} className="text-secondary-accent mb-3" />
            <p className="font-black">Verified Feed</p>
            <p className="text-sm text-text-secondary mt-1">Browse trusted listings nearby.</p>
            <p className="text-xs text-secondary-accent mt-3 font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Browse <ChevronRight size={13} />
            </p>
          </NavLink>
          <NavLink to="/profile" className="bento-panel p-6 hover:border-neon-cyan/40 transition-colors group reveal delay-300">
            <ShieldCheck size={20} className="text-neon-cyan mb-3" />
            <p className="font-black">Trust Dashboard</p>
            <p className="text-sm text-text-secondary mt-1">Track reviews, score & activity.</p>
            <p className="text-xs text-neon-cyan mt-3 font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              View <ChevronRight size={13} />
            </p>
          </NavLink>
        </div>
      </section>

    </div>
  );
}
