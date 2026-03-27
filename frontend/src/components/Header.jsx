import { NavLink } from 'react-router-dom';
import { ShoppingCart, Search, Moon, Sun, User } from 'lucide-react';
import logo from '../assets/Gemini_Generated_Image_5tzb215tzb215tzb.png';

export default function Header({ theme, toggleTheme }) {
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Shop Feed', path: '/feed' },
    { name: 'Need Board', path: '/needs' },
    { name: 'Sell an Item', path: '/add' },
  ];

  return (
    <div className="w-full relative z-50">
      {/* Top Promotional Banner */}
      <div className="bg-[#0cfba7] bg-gradient-to-r from-accent to-accent-hover text-white text-xs sm:text-sm font-bold flex items-center justify-center py-2 px-4 shadow-sm text-center">
        ⚡ Trending now: Zero listing fee for your first 10 posts.
      </div>
      
      {/* Main Header */}
      <header className="w-full glass bg-surface/90 sticky top-0 transition-colors">
        <div className="w-full px-4 sm:px-6 lg:px-12 h-24 sm:h-28 flex items-center justify-between">
          
          {/* Logo/Brand */}
          <NavLink to="/feed" className="flex items-center gap-3 shrink-0">
            <img
              src={logo}
              alt="PeerCart"
              className="h-16 sm:h-20 w-auto object-contain drop-shadow-sm transition-transform hover:scale-[1.02]"
            />
          </NavLink>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden md:flex items-center absolute justify-center left-1/2 -translate-x-1/2 gap-2 rounded-full border border-border-color bg-surface-elevated/80 px-3 py-2">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-full text-xs lg:text-sm font-extrabold uppercase tracking-wide transition-all duration-200 ${
                    isActive 
                      ? 'text-white bg-accent shadow-md' 
                      : 'text-text-primary hover:text-accent hover:bg-surface'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Right Extras (Cart, User, Theme) */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button className="text-text-primary hover:text-accent transition-colors p-2 hidden sm:block rounded-full bg-surface-elevated/80 border border-border-color">
              <Search size={20} strokeWidth={2.5} />
            </button>
            <button className="text-text-primary hover:text-accent transition-colors p-2 relative group hidden sm:block rounded-full bg-surface-elevated/80 border border-border-color">
              <ShoppingCart size={20} strokeWidth={2.5} />
              <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-secondary-accent text-white text-[9px] font-bold flex items-center justify-center group-hover:scale-110 transition-transform">
                2
              </span>
            </button>
            
            <div className="w-px h-6 bg-border-color hidden sm:block mx-1"></div>

            <button 
              onClick={toggleTheme}
              className="p-2 text-text-primary hover:text-accent transition-colors rounded-full bg-surface-elevated/80 border border-border-color"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} strokeWidth={2.5} /> : <Moon size={20} strokeWidth={2.5} />}
            </button>
            
            <NavLink to="/profile" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-surface-elevated border-2 border-border-color overflow-hidden hover:border-accent transition-colors">
                <img src="https://i.pravatar.cc/150?u=a042581f4e" alt="Profile" className="w-full h-full object-cover" />
              </div>
            </NavLink>
          </div>
        </div>
      </header>
    </div>
  );
}
