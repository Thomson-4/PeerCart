import { Clock, MessageCircle, MapPin, Loader } from 'lucide-react';

export default function NeedCard({ user, title, urgency, timeframe, distance, description, reward, onHaveThis, contacting = false }) {
  return (
    <article className="glass-card gradient-stroke p-5 group transition-all duration-300 hover:border-secondary-accent/50">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-secondary-accent/35 to-accent/35 p-[2px]">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-full h-full rounded-full object-cover border-2 border-background"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-text-primary text-sm">{user.name}</span>
              <span className="trust-badge">
                ★ {user.trustScore}
              </span>
            </div>
            <div className="flex gap-2 text-text-secondary text-xs mt-0.5">
              <span className="flex items-center gap-1">
                <Clock size={12} /> {timeframe}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={12} /> {distance}
              </span>
            </div>
          </div>
        </div>
        
        {/* Urgency Badge */}
        {urgency === 'High' && (
          <span className="px-2 py-1 bg-red-500/10 text-red-300 border border-red-500/20 rounded text-[10px] uppercase font-bold tracking-wider animate-pulse">
            Urgent
          </span>
        )}
      </div>

      <h3 className="font-bold text-lg leading-tight mb-2 text-text-primary transition-all duration-300">
        "Need: {title}"
      </h3>
      <p className="text-sm text-text-secondary mb-4 line-clamp-2">
        {description}
      </p>

      <div className="flex items-center justify-between border-t border-border-color/70 pt-4">
        <div className="flex flex-col">
          <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Offering</span>
          <span className="font-bold text-accent">{reward}</span>
        </div>
        
        <button
          onClick={onHaveThis}
          disabled={contacting}
          className="flex items-center gap-2 bg-secondary-accent text-background px-4 py-2 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(180,255,57,0.26)] hover:scale-105 transition-transform disabled:opacity-60"
        >
          {contacting
            ? <Loader size={16} className="animate-spin" />
            : <MessageCircle size={16} />}
          {contacting ? 'Opening…' : 'I have this'}
        </button>
      </div>
    </article>
  );
}
