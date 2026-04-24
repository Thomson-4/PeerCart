import { useState } from 'react';
import { Heart, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';

const TAG_STYLES = {
  Sell: { pill: 'bg-accent text-white',                               glow: 'shadow-accent/30' },
  Rent: { pill: 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30',    glow: 'shadow-neon-cyan/20' },
  Buy:  { pill: 'bg-secondary-accent/20 text-secondary-accent border border-secondary-accent/30', glow: 'shadow-secondary-accent/20' },
};

export default function ItemCard({
  image, title, price, distance, type, category, isLiked: initialLiked = false,
}) {
  const [liked, setLiked] = useState(initialLiked);
  const tag = TAG_STYLES[type] || TAG_STYLES.Sell;
  const ctaText = type === 'Sell' ? 'Make Offer' : type === 'Rent' ? 'Rent Now' : 'Quick View';

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border-color bg-surface transition-all duration-300 hover:-translate-y-2 hover:border-accent/40 hover:shadow-2xl hover:shadow-accent/10">

      {/* ── Image area ────────────────────────────────────── */}
      <div className="relative aspect-[4/5] overflow-hidden bg-surface-elevated">
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />

        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Tag */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-sm ${tag.pill}`}>
            {type}
          </span>
        </div>

        {/* Like button */}
        <button
          onClick={() => setLiked(!liked)}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-200 shadow-sm ${
            liked
              ? 'bg-pink-500/20 border-pink-500/40 text-pink-400'
              : 'bg-surface/80 border-border-color text-text-secondary hover:text-pink-400 hover:border-pink-400/30'
          }`}
          aria-label={liked ? 'Unlike' : 'Like'}
        >
          <Heart size={14} className={liked ? 'fill-current' : ''} />
        </button>

        {/* CTA overlay */}
        <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button className="flex items-center gap-2 bg-text-primary text-background text-sm font-bold px-5 py-2.5 rounded-full shadow-lg translate-y-3 group-hover:translate-y-0 transition-all duration-300 hover:bg-accent hover:text-white">
            {ctaText} <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ── Info ──────────────────────────────────────────── */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        {/* Category + distance */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">{category}</span>
          <div className="flex items-center gap-1 text-[10px] text-text-secondary font-semibold">
            <MapPin size={10} className="text-accent" />
            {distance}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-text-primary leading-snug line-clamp-2 flex-1">
          {title}
        </h3>

        {/* Price + verified */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border-color border-dashed">
          <span className="text-xl font-black text-accent tracking-tight">{price}</span>
          <div className="flex items-center gap-1 text-[10px] font-bold text-text-secondary/70">
            <ShieldCheck size={11} className="text-accent/60" />
            Verified
          </div>
        </div>
      </div>

      {/* ── Ambient glow on hover ─────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
           style={{ boxShadow: 'inset 0 0 0 1px rgba(167,139,250,0.15)' }} />
    </article>
  );
}
