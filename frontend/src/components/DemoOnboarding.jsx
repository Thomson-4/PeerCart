import { useCallback, useEffect, useMemo, useState } from 'react';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';
import logo from '../assets/Gemini_Generated_Image_5tzb215tzb215tzb.png';

const STORAGE_KEY = 'peercart_demo_onboarding_v1';
const TOTAL_MS = 10000;

const phases = [
  { title: 'Welcome to PeerCart', subtitle: 'The modern way to buy, sell, and rent locally.' },
  { title: 'Buy · Sell · Rent', subtitle: 'One app. Every kind of peer deal.' },
  { title: 'Trust-first', subtitle: 'Verified profiles and reputation that actually matter.' },
  { title: 'You are in', subtitle: 'Explore the feed, post a need, or list in seconds.' },
];

export default function DemoOnboarding() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return !localStorage.getItem(STORAGE_KEY);
    } catch {
      return false;
    }
  });
  const [phaseIndex, setPhaseIndex] = useState(0);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
    setVisible(false);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const id = setInterval(() => {
      setPhaseIndex((i) => (i + 1) % phases.length);
    }, 2500);
    return () => {
      document.body.style.overflow = prev;
      clearInterval(id);
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(dismiss, TOTAL_MS);
    return () => clearTimeout(t);
  }, [visible, dismiss]);

  const phase = phases[phaseIndex];

  const icons = useMemo(
    () => [<Sparkles key="s" size={22} />, <Zap key="z" size={22} />, <ShieldCheck key="sh" size={22} />, <Sparkles key="s2" size={22} />],
    []
  );

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background/92 px-6 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-onboarding-title"
    >
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-4 top-4 rounded-full border border-border-color bg-surface/90 px-4 py-2 text-xs font-bold uppercase tracking-widest text-text-secondary transition hover:border-accent hover:text-accent sm:right-8 sm:top-8"
      >
        Skip
      </button>

      <div className="floating-ambient mb-8 max-w-[min(100%,280px)]">
        <img src={logo} alt="" className="h-auto w-full object-contain drop-shadow-2xl" />
      </div>

      <div
        key={phaseIndex}
        className="max-w-md text-center animate-in fade-in zoom-in-95 duration-500"
      >
        <div className="mb-4 flex justify-center text-accent">{icons[phaseIndex]}</div>
        <h2 id="demo-onboarding-title" className="text-3xl font-black tracking-tight sm:text-4xl">
          {phase.title}
        </h2>
        <p className="mt-3 text-base text-text-secondary sm:text-lg">{phase.subtitle}</p>
      </div>

      <button
        type="button"
        onClick={dismiss}
        className="mt-10 rounded-full cta-gradient px-10 py-3 text-sm font-extrabold text-white shadow-lg shadow-accent/30 transition hover:scale-[1.03]"
      >
        Enter app
      </button>

      <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden bg-surface-elevated">
        <div className="demo-progress-bar h-full w-full cta-gradient" />
      </div>
    </div>
  );
}
