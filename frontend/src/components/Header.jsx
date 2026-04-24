import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { ShoppingBag, Moon, Sun, User, Menu, X, Sparkles } from 'lucide-react';
import logo from '../assets/Gemini_Generated_Image_5tzb215tzb215tzb.png';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { name: 'Home',       path: '/' },
  { name: 'Shop Feed',  path: '/feed' },
  { name: 'Need Board', path: '/needs' },
  { name: 'Sell Item',  path: '/add' },
];

export default function Header({ theme, toggleTheme }) {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, []);

  return (
    <>
      {/* ── Promo Banner ─────────────────────────────────── */}
      <div className="relative z-50 bg-gradient-to-r from-accent via-accent-hover to-accent text-white text-xs sm:text-sm font-bold flex items-center justify-center py-2.5 px-4 text-center gap-2">
        <Sparkles size={13} className="text-secondary-accent shrink-0" />
        <span>Zero listing fee for your first 10 posts — post now and save!</span>
        <Sparkles size={13} className="text-secondary-accent shrink-0" />
      </div>

      {/* ── Main Header ──────────────────────────────────── */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? 'glass shadow-md shadow-black/10'
            : 'bg-background/80 backdrop-blur-md'
        }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-12 h-[68px] flex items-center justify-between gap-4">

          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 shrink-0">
            <img
              src={logo}
              alt="PeerCart"
              className="h-14 w-auto object-contain drop-shadow-sm hover:scale-[1.03] transition-transform"
            />
          </NavLink>

          {/* Center nav — desktop */}
          <nav className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2 gap-1 rounded-2xl border border-border-color bg-surface-elevated/70 px-2 py-1.5 backdrop-blur-sm">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl text-[13px] font-extrabold uppercase tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'bg-accent text-white shadow-sm shadow-accent/30'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 text-text-secondary hover:text-accent transition-colors rounded-xl hover:bg-surface-elevated"
              aria-label="Toggle theme"
            >
              {theme === 'dark'
                ? <Sun size={19} strokeWidth={2.5} />
                : <Moon size={19} strokeWidth={2.5} />}
            </button>

            {/* Cart icon */}
            <button className="relative p-2.5 text-text-secondary hover:text-accent transition-colors rounded-xl hover:bg-surface-elevated hidden sm:flex">
              <ShoppingBag size={19} strokeWidth={2.5} />
              <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-secondary-accent text-background text-[9px] font-black flex items-center justify-center">
                2
              </span>
            </button>

            {/* Profile / Sign in */}
            <NavLink
              to={isAuthenticated ? '/profile' : '/login'}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-xl transition-all text-sm font-bold ${
                  isActive
                    ? 'text-accent'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated px-3 py-2'
                }`
              }
            >
              {isAuthenticated
                ? (
                  <img
                    src="https://i.pravatar.cc/150?u=peercart"
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-accent/40 object-cover hover:border-accent transition-colors"
                  />
                )
                : (
                  <>
                    <User size={17} strokeWidth={2.5} />
                    <span className="hidden sm:inline">Sign in</span>
                  </>
                )}
            </NavLink>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2.5 text-text-secondary hover:text-text-primary transition-colors rounded-xl hover:bg-surface-elevated"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* ── Mobile menu ────────────────────────────────── */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            mobileOpen ? 'max-h-80 border-t border-border-color' : 'max-h-0'
          }`}
        >
          <nav className="px-4 py-4 flex flex-col gap-1 bg-surface/95 backdrop-blur-md">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-accent text-white'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
    </>
  );
}
