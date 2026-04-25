import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import Footer from '../components/Footer';

export default function MainLayout({ theme, toggleTheme }) {
  const { pathname } = useLocation();

  // Landing page gets full-bleed, no wrapper padding — it controls its own layout
  const isLanding = pathname === '/';

  return (
    <div className="relative min-h-screen bg-background text-text-primary selection:bg-accent/30 selection:text-text-primary">

      {/* Global ambient orbs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="floating-ambient absolute -top-40 -left-32 h-96 w-96 rounded-full bg-accent/8 blur-3xl" />
        <div className="floating-ambient-slow absolute top-[40%] -right-24 h-80 w-80 rounded-full bg-secondary-accent/8 blur-3xl" style={{ animationDelay: '2s' }} />
        <div className="floating-ambient absolute bottom-20 left-1/3 h-72 w-72 rounded-full bg-neon-cyan/6 blur-3xl" style={{ animationDelay: '5s' }} />
      </div>

      {/* Header */}
      <Header theme={theme} toggleTheme={toggleTheme} />

      {/* Page content */}
      {isLanding ? (
        // Landing: full-bleed, no padding wrappers
        <main className="relative z-10 w-full overflow-x-hidden">
          <Outlet />
        </main>
      ) : (
        // Other pages: contained with padding
        <main className="relative z-10 w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-12 pt-8 pb-28 md:pb-16 min-h-[calc(100vh-68px)]">
          <Outlet />
        </main>
      )}

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50">
        <BottomNav />
      </div>

      <Footer />
    </div>
  );
}
