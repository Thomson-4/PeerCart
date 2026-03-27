import { useState } from 'react';
import { Send, Filter, Search } from 'lucide-react';
import NeedCard from '../components/NeedCard';

const initialNeeds = [
  {
    id: 1,
    user: { name: 'Rahul S.', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d', trustScore: '92' },
    title: 'Lab Coat & Safety Goggles for tomorrow',
    description: "I have my chemistry lab at 9 AM and I forgot my lab coat at home. Does anyone have a spare coat (size L) I could borrow for 2 hours?",
    urgency: 'High',
    timeframe: 'By 8:30 AM',
    distance: 'City Center',
    reward: '₹50 or a Chai',
  },
  {
    id: 2,
    user: { name: 'Priya M.', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', trustScore: '98' },
    title: 'Scientific Calculator (991ES)',
    description: "Need a scientific calculator for my Math-III exam on Friday. Will return it back by evening. Happy to pay a small rent.",
    urgency: 'Normal',
    timeframe: 'By Friday',
    distance: 'West End',
    reward: '₹100/day',
  },
  {
    id: 3,
    user: { name: 'Amit V.', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d', trustScore: '85' },
    title: 'Induction Cooker for 2 days',
    description: "My induction stove stopped working and the repair guy will take 2 days. Need one urgently to make dinner. Any lead would help!",
    urgency: 'High',
    timeframe: 'ASAP',
    distance: 'Old Town',
    reward: 'Up to ₹200',
  },
];

export default function NeedBoard() {
  const [needs, setNeeds] = useState(initialNeeds);
  const [query, setQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('All');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    timeframe: 'Today',
    reward: '',
    urgency: 'Normal',
  });

  const filteredNeeds = needs.filter((need) => {
    const queryMatch =
      query.trim().length === 0 ||
      need.title.toLowerCase().includes(query.toLowerCase()) ||
      need.description.toLowerCase().includes(query.toLowerCase());
    const urgencyMatch = urgencyFilter === 'All' || need.urgency === urgencyFilter;
    return queryMatch && urgencyMatch;
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) return;

    const newNeed = {
      id: Date.now(),
      user: {
        name: 'You',
        avatar: 'https://i.pravatar.cc/150?u=you-peercart',
        trustScore: '97',
      },
      title: formData.title.trim(),
      description: formData.description.trim(),
      urgency: formData.urgency,
      timeframe: formData.timeframe,
      distance: 'Your Area',
      reward: formData.reward.trim() || 'Negotiable',
    };

    setNeeds((prev) => [newNeed, ...prev]);
    setFormData({
      title: '',
      description: '',
      timeframe: 'Today',
      reward: '',
      urgency: 'Normal',
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 animate-in fade-in slide-in-from-bottom-5 duration-700 mb-20">
      <div className="w-full lg:w-[40%] xl:w-[35%]">
        <div className="sticky top-24">
          <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Got a Need?</h1>
          <p className="text-text-secondary mb-6 text-lg">Post it once. Let verified sellers come to you.</p>
          
          <form onSubmit={handleSubmit} className="glass-card gradient-stroke p-6 sm:p-8 space-y-5">
            <div>
              <label className="block text-sm font-bold text-text-primary mb-2 tracking-wide uppercase">What do you need?</label>
              <input
                type="text"
                placeholder="e.g. Graphic Calculator for 2 days"
                className="input-base"
                value={formData.title}
                onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-text-primary mb-2 tracking-wide uppercase">Details</label>
              <textarea 
                rows="3" 
                placeholder="Explain what exactly you're looking for..." 
                className="input-base resize-none"
                value={formData.description}
                onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-text-primary mb-2 tracking-wide uppercase">By When?</label>
                <select
                  className="input-base appearance-none cursor-pointer"
                  value={formData.timeframe}
                  onChange={(event) => setFormData((prev) => ({ ...prev, timeframe: event.target.value }))}
                >
                  <option>Today</option>
                  <option>Tomorrow</option>
                  <option>This Week</option>
                  <option>Flexible</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-text-primary mb-2 tracking-wide uppercase">Reward</label>
                <input
                  type="text"
                  placeholder="Rs 100/day, coffee..."
                  className="input-base"
                  value={formData.reward}
                  onChange={(event) => setFormData((prev) => ({ ...prev, reward: event.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-text-primary mb-2 tracking-wide uppercase">Urgency</label>
              <div className="flex rounded-xl border border-border-color bg-surface/70 p-1">
                {['Normal', 'High'].map((urgency) => (
                  <button
                    key={urgency}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, urgency }))}
                    className={`w-full rounded-lg py-2 text-sm font-bold transition ${
                      formData.urgency === urgency ? 'bg-accent text-white' : 'text-text-secondary'
                    }`}
                  >
                    {urgency}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full mt-4 bg-accent hover:bg-accent-hover text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
              <Send size={18} /> Broadcast Need
            </button>
          </form>
        </div>
      </div>

      <div className="w-full lg:w-[60%] xl:w-[65%]">
        <div className="mb-6 bento-panel p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-black tracking-tight">Recent Requests</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative grow sm:w-64">
              <Search size={16} className="absolute top-1/2 -translate-y-1/2 left-3 text-text-secondary" />
              <input
                className="input-base h-10 pl-9"
                placeholder="Search requests"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="flex items-center gap-1 rounded-xl border border-border-color bg-surface/80 px-2">
              <Filter size={14} className="text-text-secondary" />
              <select
                className="h-10 bg-transparent text-sm text-text-primary outline-none"
                value={urgencyFilter}
                onChange={(event) => setUrgencyFilter(event.target.value)}
              >
                <option>All</option>
                <option>Normal</option>
                <option>High</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredNeeds.map((need) => (
            <NeedCard
              key={need.id}
              {...need}
              onHaveThis={() => window.alert(`Start chat with ${need.user.name}`)}
            />
          ))}
          {filteredNeeds.length === 0 && (
            <div className="bento-panel p-6 text-center text-text-secondary md:col-span-2 xl:col-span-2">
              No matching needs right now. Try another filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
