import { useState } from 'react';
import { UploadCloud, Wand2, Sparkles, AlertCircle, Camera, CheckCircle, XCircle, Clock, TrendingUp, Shield } from 'lucide-react';

export default function AddItem() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzingCondition, setIsAnalyzingCondition] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(false);
  const [conditionAnalysis, setConditionAnalysis] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 35,
    tags: '',
    category: 'Electronics',
    condition: 'Good',
  });

  const handleImageUpload = () => {
    setUploadedImage(true);
    // Simulate image upload
    setTimeout(() => {
      setConditionAnalysis({
        score: 85,
        condition: 'Good',
        issues: ['Minor scratches on sides'],
        strengths: ['Fully functional', 'Clean appearance', 'All accessories included'],
        estimatedValue: 1200,
        confidence: 92,
      });
    }, 500);
  };

  const handleMagic = () => {
    setIsGenerating(true);
    setIsAnalyzingCondition(true);
    // Simulate AI Generation with condition analysis
    setTimeout(() => {
      setFormData({
        title: 'Scientific Calculator - Casio FX-991EX',
        description: 'Excellent condition calculator with advanced scientific functions. Perfect for engineering students. Battery life still strong, display clear without any dead pixels. Includes original protective case and user manual.',
        price: 1200,
        tags: 'Electronics, Calculator, Scientific, Casio, Engineering',
        category: 'Electronics',
        condition: 'Excellent',
      });
      setConditionAnalysis({
        score: 92,
        condition: 'Excellent',
        issues: [],
        strengths: ['Like new condition', 'All functions working', 'Original accessories', 'Recent battery replacement'],
        estimatedValue: 1200,
        confidence: 95,
        marketInsight: 'Priced 15% below market average for quick sale',
      });
      setIsGenerating(false);
      setIsAnalyzingCondition(false);
    }, 2000);
  };

  const analyzeCondition = () => {
    setIsAnalyzingCondition(true);
    setTimeout(() => {
      setConditionAnalysis({
        score: 78,
        condition: 'Good',
        issues: ['Minor wear on buttons', 'Slight discoloration'],
        strengths: ['All functions work perfectly', 'Screen protected', 'Good battery life'],
        estimatedValue: 950,
        confidence: 88,
        marketInsight: 'Fair price for condition, could sell faster with minor cleaning',
      });
      setIsAnalyzingCondition(false);
    }, 1500);
  };

  return (
    <div className="w-full animate-in slide-in-from-bottom-5 duration-700">
      
      <div className="mb-8 text-center sm:text-left">
        <span className="trust-badge mb-3">AI Listing Studio</span>
        <h1 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">Sell or Rent an Item</h1>
        <p className="text-text-secondary text-lg max-w-2xl">Create a high-performing listing in seconds with smart copy, tags, and pricing recommendations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Left Col: Upload & AI Analysis */}
        <div className="space-y-6">
          <div 
            onClick={handleImageUpload}
            className={`aspect-square w-full rounded-2xl border-2 border-dashed ${uploadedImage ? 'border-accent bg-accent/5' : 'border-border-color bg-surface-elevated/80'} flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors group neo-hover relative`}
          >
            {uploadedImage ? (
              <>
                <CheckCircle size={32} className="text-accent mb-2" />
                <h3 className="font-bold text-lg mb-1 text-accent">Image Uploaded</h3>
                <p className="text-sm text-text-secondary">Click to re-upload</p>
              </>
            ) : (
              <>
                <div className="bg-surface rounded-full p-4 mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  <Camera size={32} className="text-text-secondary group-hover:text-accent" />
                </div>
                <h3 className="font-bold text-lg mb-1">Take Photo</h3>
                <p className="text-sm text-text-secondary">AI will analyze condition</p>
              </>
            )}
          </div>

          <button 
            onClick={handleMagic}
            disabled={isGenerating || !uploadedImage}
            className="w-full relative overflow-hidden group cta-gradient text-white font-extrabold py-4 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-accent/30 disabled:opacity-70 disabled:cursor-not-allowed transition-transform hover:scale-[1.02]"
          >
            {isGenerating ? (
              <span className="animate-pulse flex items-center gap-2"><Sparkles size={20} /> AI Analyzing...</span>
            ) : (
              <><Wand2 size={20} /> AI Magic Auto-Fill</>
            )}
            {!isGenerating && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-xl" />}
          </button>

          {uploadedImage && (
            <button 
              onClick={analyzeCondition}
              disabled={isAnalyzingCondition}
              className="w-full bg-surface-elevated border border-border-color text-text-primary font-extrabold py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-accent hover:text-white transition-all disabled:opacity-70"
            >
              {isAnalyzingCondition ? (
                <span className="animate-pulse flex items-center gap-2"><Clock size={18} /> Analyzing...</span>
              ) : (
                <><Shield size={18} /> Analyze Condition</>
              )}
            </button>
          )}

          <div className="bento-panel p-4 flex gap-3 items-start">
            <AlertCircle size={20} className="text-text-secondary shrink-0 mt-0.5" />
            <div className="text-xs text-text-secondary leading-relaxed">
              <p className="font-semibold mb-1">AI Tips:</p>
              <ul className="space-y-1">
                <li>• Good lighting = better analysis</li>
                <li>• Show all angles & defects</li>
                <li>• Include accessories in photo</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Middle Col: Condition Analysis */}
        {conditionAnalysis && (
          <div className="space-y-6">
            <div className="bento-panel p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Shield size={20} className="text-accent" />
                  AI Condition Report
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  conditionAnalysis.score >= 90 ? 'bg-green-100 text-green-700' :
                  conditionAnalysis.score >= 70 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {conditionAnalysis.condition}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold">Condition Score</span>
                    <span className="text-lg font-bold text-accent">{conditionAnalysis.score}/100</span>
                  </div>
                  <div className="w-full bg-surface-elevated rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        conditionAnalysis.score >= 90 ? 'bg-green-500' :
                        conditionAnalysis.score >= 70 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{width: `${conditionAnalysis.score}%`}}
                    />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2 flex items-center gap-1">
                    <CheckCircle size={16} className="text-green-500" />
                    Strengths
                  </p>
                  <ul className="text-xs text-text-secondary space-y-1">
                    {conditionAnalysis.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                {conditionAnalysis.issues.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-2 flex items-center gap-1">
                      <XCircle size={16} className="text-yellow-500" />
                      Issues Found
                    </p>
                    <ul className="text-xs text-text-secondary space-y-1">
                      {conditionAnalysis.issues.map((issue, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-yellow-500 mt-0.5">•</span>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-4 border-t border-border-color">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold flex items-center gap-1">
                      <TrendingUp size={16} className="text-accent" />
                      Est. Value
                    </span>
                    <span className="text-lg font-bold text-accent">₹{conditionAnalysis.estimatedValue}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary">AI Confidence</span>
                    <span className="text-xs font-bold">{conditionAnalysis.confidence}%</span>
                  </div>
                </div>

                {conditionAnalysis.marketInsight && (
                  <div className="bg-accent/5 rounded-lg p-3">
                    <p className="text-xs font-semibold text-accent mb-1">Market Insight</p>
                    <p className="text-xs text-text-secondary">{conditionAnalysis.marketInsight}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Right Col: Form Details */}
        <div className="space-y-5 bento-panel p-6 md:p-7">
          <div>
            <label className="block text-sm font-bold text-text-primary mb-2 uppercase tracking-wide">Category</label>
            <select 
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="input-base text-lg font-medium"
            >
              <option value="Electronics">Electronics</option>
              <option value="Books">Books</option>
              <option value="Home Essentials">Home Essentials</option>
              <option value="Sports">Sports</option>
              <option value="Other">Other</option>
            </select>
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-text-primary mb-2 uppercase tracking-wide">Condition</label>
              <select 
                value={formData.condition}
                onChange={(e) => setFormData({...formData, condition: e.target.value})}
                className="input-base"
              >
                <option value="Like New">Like New</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-text-primary mb-2 uppercase tracking-wide">Type</label>
              <select 
                value={formData.type || 'Sell'}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="input-base"
              >
                <option value="Sell">Sell</option>
                <option value="Rent">Rent</option>
                <option value="Buy">Buy</option>
              </select>
            </div>
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

            {conditionAnalysis && (
              <div className="mt-4 p-3 bg-accent/5 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-accent">AI Recommended</span>
                  <span className="text-sm font-bold text-accent">₹{conditionAnalysis.estimatedValue}</span>
                </div>
              </div>
            )}
          </div>

          <button className="w-full py-4 mt-6 cta-gradient text-white font-extrabold rounded-xl shadow-md hover:-translate-y-1 transition-transform duration-300 flex items-center justify-center gap-2">
            <Sparkles size={20} />
            Publish Listing
          </button>

          <div className="text-center">
            <p className="text-xs text-text-secondary">
              By publishing, you agree to our AI-powered verification system
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
