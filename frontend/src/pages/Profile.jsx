import { Settings, CheckCircle2, Star, ShieldCheck, MapPin } from 'lucide-react';
import AnimatedNumber from '../components/AnimatedNumber';

export default function Profile() {
  return (
    <div className="w-full animate-in fade-in duration-700 pb-20">
      
      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mt-4 mb-12 py-8 border-b border-border-color">
        
        {/* Avatar & Verification */}
        <div className="relative group">
          <div className="w-32 h-32 rounded-full border-4 border-surface p-1 shadow-lg shadow-black/5 bg-gradient-to-tr from-accent to-lime-green">
            <img 
              src="https://i.pravatar.cc/300?u=a042581f4e29026024d" 
              alt="User" 
              className="w-full h-full object-cover rounded-full bg-surface"
            />
          </div>
          <div className="absolute -bottom-2 right-2 bg-text-primary text-background flex items-center gap-1 px-3 py-1 rounded-full border-2 border-surface shadow-sm">
            <CheckCircle2 size={12} className="text-lime-green" />
            <span className="text-[10px] font-extrabold uppercase tracking-wide">Verified</span>
          </div>
        </div>

        {/* Info */}
        <div className="text-center md:text-left flex-1 mt-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight mb-1">Rahul S.</h1>
              <span className="text-sm font-medium text-text-secondary flex items-center justify-center md:justify-start gap-1.5 flex-wrap">
                <MapPin size={16} /> Bangalore, India
              </span>
            </div>
            
            <button className="hidden sm:flex self-center items-center gap-2 px-4 py-2 bg-text-primary text-background font-bold text-sm rounded-full hover:scale-105 transition-transform shadow-md">
              <Settings size={16} /> Manage Account
            </button>
          </div>

          <p className="text-base text-text-primary max-w-lg mx-auto md:mx-0 leading-relaxed font-medium">
            Power seller focused on electronics and home essentials. Renting and reselling quality items with fast responses.
          </p>
        </div>
      </div>

      {/* Trust & Reputation Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-surface-elevated rounded-2xl p-6 border border-border-color shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Trust Score</h3>
            <div className="text-3xl font-extrabold text-accent flex items-end gap-2 tabular-nums">
              <AnimatedNumber end={98} duration={1800} />{' '}
              <span className="text-sm pb-1 text-text-primary">/ 100</span>
            </div>
          </div>
          <ShieldCheck size={48} className="text-accent/20" />
        </div>

        <div className="bg-surface-elevated rounded-2xl p-6 border border-border-color shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Reviews</h3>
            <div className="text-3xl font-extrabold text-text-primary flex items-end gap-2">
              4.9 <span className="text-sm pb-1 flex text-yellow-500"><Star size={16} fill="currentColor" /></span>
            </div>
          </div>
          <span className="text-sm font-bold text-text-secondary">(24 items)</span>
        </div>

        <div className="bg-surface-elevated rounded-2xl p-6 border border-border-color shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Member Since</h3>
            <div className="text-2xl font-extrabold text-text-primary">Aug '22</div>
          </div>
          <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent font-bold">2yr</div>
        </div>
      </div>

      {/* Tabs / Content Area */}
      <div>
        <div className="flex gap-8 border-b border-border-color mb-8 text-sm font-extrabold uppercase tracking-wide">
          <button className="pb-3 border-b-2 border-text-primary text-text-primary">Active Listings (3)</button>
          <button className="pb-3 text-text-secondary hover:text-text-primary transition-colors">Past Rentals</button>
        </div>

        {/* Minimal List View for Active Items */}
        <div className="space-y-4">
          {[
            { tag: 'Selling', title: 'BS Grewal Engg Mathematics', price: '₹450', views: 45 },
            { tag: 'Renting', title: 'Btwin Cycle', price: '₹50/day', views: 124 },
            { tag: 'Selling', title: 'White Induction Cooker', price: '₹1,200', views: 18 },
          ].map((item, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 bg-surface-elevated rounded-2xl border border-border-color hover:border-accent hover:shadow-lg transition-all group">
              <div className="flex items-center gap-6 mb-4 sm:mb-0">
                <span className={`px-3 py-1.5 rounded-md text-[10px] font-bold tracking-widest uppercase ${item.tag === 'Selling' ? 'bg-text-primary text-background' : 'bg-accent text-white shadow-[0_0_10px_rgba(170,59,255,0.3)]'}`}>
                  {item.tag}
                </span>
                <span className="font-extrabold text-lg group-hover:text-accent transition-colors">{item.title}</span>
              </div>
              
              <div className="flex items-center gap-6 text-sm">
                <span className="text-text-secondary font-medium">{item.views} views</span>
                <span className="font-extrabold text-lg text-text-primary">{item.price}</span>
                <button className="text-accent font-bold hover:underline underline-offset-4">Edit</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
