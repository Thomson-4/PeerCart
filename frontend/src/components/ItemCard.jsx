import { Heart, MapPin, ChevronRight } from 'lucide-react';

export default function ItemCard({ image, title, price, distance, type, isLiked = false }) {
  const ctaText = type === 'Sell' ? 'Make Offer' : type === 'Rent' ? 'Rent Now' : 'Quick View';
  const tagColor =
    type === 'Sell'
      ? 'bg-accent text-white'
      : type === 'Rent'
      ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40'
      : 'bg-secondary-accent/20 text-secondary-accent border border-secondary-accent/40';

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[1.2rem] border border-border-color bg-surface/80 transition-all duration-300 gradient-stroke hover:-translate-y-1 hover:border-accent/60">
      <div className="relative aspect-[4/5] overflow-hidden bg-surface-elevated p-4">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold tracking-widest uppercase shadow-sm ${tagColor}`}>
            {type}
          </span>
        </div>
        
        <button className="absolute top-3 right-3 rounded-full border border-border-color bg-surface/85 p-2 text-text-secondary shadow-sm transition-colors hover:text-secondary-accent">
          <Heart size={20} className={isLiked ? 'fill-secondary-accent text-secondary-accent' : ''} />
        </button>

        <div className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 transition-opacity duration-300 backdrop-blur-[2px] group-hover:opacity-100">
          <button className="flex translate-y-4 items-center gap-2 rounded-full bg-text-primary px-6 py-3 font-bold text-background shadow-lg transition-all duration-300 group-hover:translate-y-0 hover:bg-accent">
            {ctaText} <ChevronRight size={16} strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 gap-2">
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-base font-bold text-text-primary leading-tight line-clamp-2">{title}</h3>
        </div>
        
        <div className="flex items-center gap-1.5 text-xs text-text-secondary mt-1">
          <MapPin size={14} className="text-accent" />
          <span className="font-semibold uppercase tracking-wide">{distance}</span>
        </div>

        <div className="mt-auto pt-4 flex items-end justify-between border-t border-border-color border-dashed">
          <span className="text-2xl font-extrabold text-accent tracking-tighter">
            ₹{price}
          </span>
          <button className="md:hidden text-xs font-bold text-secondary-accent uppercase flex items-center gap-1">
            {ctaText} <ChevronRight size={14} strokeWidth={3} />
          </button>
        </div>
      </div>
    </article>
  );
}
