import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { PackageSearch, MessageCircle, PlusCircle, User } from 'lucide-react';
import { chat as chatApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function BottomNav() {
  const { isAuthenticated } = useAuth();
  const [unread, setUnread] = useState(0);

  // Poll unread count every 15 seconds when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetch = () => chatApi.unreadCount().then((d) => setUnread(d.unreadCount || 0)).catch(() => {});
    fetch();
    const id = setInterval(fetch, 15000);
    return () => clearInterval(id);
  }, [isAuthenticated]);

  const navItems = [
    { name: 'Feed',     path: '/feed',     icon: PackageSearch },
    { name: 'Messages', path: '/messages', icon: MessageCircle, badge: unread },
    { name: 'Add',      path: '/add',      icon: PlusCircle,   isPrimary: true },
    { name: 'Profile',  path: '/profile',  icon: User },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] sm:w-[420px] z-50">
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
                    <div className="relative">
                      <item.icon
                        size={24}
                        className={`transition-all ${isActive ? 'scale-110 drop-shadow-[0_0_8px_currentColor]' : ''}`}
                      />
                      {item.badge > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-accent text-white text-[9px] font-extrabold flex items-center justify-center">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                    </div>
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
