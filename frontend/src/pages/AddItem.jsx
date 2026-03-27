import { useState } from 'react';
import { UploadCloud, Wand2, Sparkles, AlertCircle } from 'lucide-react';

export default function AddItem() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 35,
    tags: '',
  });

  const handleMagic = () => {
    setIsGenerating(true);
    // Simulate AI Generation
    setTimeout(() => {
      setFormData({
        title: 'Sony WH-1000XM4 Noise Cancelling Headphones',
        description: 'Hardly used, perfect condition. Comes with original case, charging cable, and airplane adapter. Selling because I upgraded to AirPods Max.',
        price: 150,
        tags: 'Electronics, Audio, Sony, Headphones',
      });
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="w-full animate-in slide-in-from-bottom-5 duration-700">
      
      <div className="mb-8 text-center sm:text-left">
        <span className="trust-badge mb-3">AI Listing Studio</span>
        <h1 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">Sell or Rent an Item</h1>
        <p className="text-text-secondary text-lg max-w-2xl">Create a high-performing listing in seconds with smart copy, tags, and pricing recommendations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Left Col: Upload */}
        <div className="space-y-6">
          <div className="aspect-square w-full rounded-2xl border-2 border-dashed border-border-color bg-surface-elevated/80 flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors group neo-hover">
            <div className="bg-surface rounded-full p-4 mb-4 shadow-sm group-hover:scale-110 transition-transform">
              <UploadCloud size={32} className="text-text-secondary group-hover:text-accent" />
            </div>
            <h3 className="font-bold text-lg mb-1">Upload Photo</h3>
            <p className="text-sm text-text-secondary">Drag and drop or click to browse</p>
          </div>

          <button 
            onClick={handleMagic}
            disabled={isGenerating}
            className="w-full relative overflow-hidden group cta-gradient text-white font-extrabold py-4 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-accent/30 disabled:opacity-70 disabled:cursor-not-allowed transition-transform hover:scale-[1.02]"
          >
            {isGenerating ? (
              <span className="animate-pulse flex items-center gap-2"><Sparkles size={20} /> Analyzing Image...</span>
            ) : (
              <><Wand2 size={20} /> Use AI Magic Auto-Fill</>
            )}
            {!isGenerating && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-xl" />}
          </button>

          <div className="bento-panel p-4 flex gap-3 items-start">
            <AlertCircle size={20} className="text-text-secondary shrink-0 mt-0.5" />
            <p className="text-xs text-text-secondary leading-relaxed">
              <strong>Pro Tip:</strong> Ensure good lighting and a clean background for the best AI-generated descriptions and optimal pricing suggestions.
            </p>
          </div>
        </div>

        {/* Right Col: Form Details */}
        <div className="space-y-5 bento-panel p-6 md:p-7">
          <div>
            <label className="block text-sm font-bold text-text-primary mb-2 uppercase tracking-wide">Title</label>
            <input 
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="What are you selling?" 
              className="input-base text-lg font-medium" 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-text-primary mb-2 uppercase tracking-wide">Description</label>
            <textarea 
              rows="4" 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Condition, history, why you are selling..." 
              className="input-base resize-none"
            ></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-text-primary mb-2 uppercase tracking-wide">Tags</label>
            <input 
              type="text" 
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              placeholder="Comma separated" 
              className="input-base" 
            />
          </div>

          <div className="pt-4 border-t border-border-color">
            <div className="flex justify-between items-end mb-4">
              <label className="block text-sm font-bold text-text-primary uppercase tracking-wide flex items-center gap-2">
                Smart Pricing <Sparkles size={14} className="text-accent" />
              </label>
              <span className="text-2xl font-extrabold text-accent tracking-tighter">₹{formData.price}</span>
            </div>
            
            <input 
              type="range" 
              min="0" 
              max="10000" 
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="w-full accent-accent h-2 bg-surface-elevated rounded-lg appearance-none cursor-pointer" 
            />
            <div className="flex justify-between text-xs text-text-secondary font-medium mt-3">
              <span>Quick Sale</span>
              <span>Fair Market</span>
              <span>Maximum Profit</span>
            </div>
          </div>

          <button className="w-full py-4 mt-6 cta-gradient text-white font-extrabold rounded-xl shadow-md hover:-translate-y-1 transition-transform duration-300">
            Publish Listing
          </button>
        </div>
      </div>

    </div>
  );
}
