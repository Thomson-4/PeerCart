import { NavLink } from 'react-router-dom';
import { PackageSearch, MessageSquarePlus, PlusCircle, User } from 'lucide-react';

export default function BottomNav() {
  const navItems = [
    { name: 'Feed', path: '/feed', icon: PackageSearch },
    { name: 'Needs', path: '/needs', icon: MessageSquarePlus },
    { name: 'Add', path: '/add', icon: PlusCircle, isPrimary: true },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] sm:w-[400px] z-50">
      <nav className="glass-card animated-border flex items-center justify-between px-6 py-3 rounded-full border border-border-color shadow-xl">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 transition-all duration-300 ${
                item.isPrimary
                  ? '-translate-y-3'
                  : isActive
                  ? 'text-accent'
                  : 'text-text-secondary hover:text-text-primary'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {item.isPrimary ? (
                  <div className="cta-gradient text-white p-3.5 rounded-full shadow-lg hover:scale-105 transition-transform">
                    <item.icon size={26} strokeWidth={2.5} />
                  </div>
                ) : (
                  <>
                    <item.icon
                      size={24}
                      className={`transition-all ${isActive ? 'scale-110 drop-shadow-[0_0_8px_currentColor]' : ''}`}
                    />
                    <span className={`text-[10px] font-bold tracking-wide ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                      {item.name}
                    </span>
                  </>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
