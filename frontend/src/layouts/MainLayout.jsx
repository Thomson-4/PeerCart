import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import Footer from '../components/Footer';

export default function MainLayout({ theme, toggleTheme }) {
  return (
    <div className="relative min-h-screen bg-background text-text-primary selection:bg-accent/30 selection:text-text-primary transition-colors duration-300">
      <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
        <div className="floating-ambient absolute -top-24 -left-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="floating-ambient absolute top-[25%] -right-14 h-64 w-64 rounded-full bg-secondary-accent/10 blur-3xl [animation-delay:1.5s]" />
      </div>
      
      {/* Top Header for Desktop */}
      <Header theme={theme} toggleTheme={toggleTheme} />

      {/* Main Content Area */}
      <main className="relative z-10 2xl:container mx-auto 2xl:px-0 w-full px-4 sm:px-6 lg:px-12 pt-8 pb-24 md:pb-12 min-h-[calc(100vh-64px)] overflow-x-hidden">
        <Outlet />
      </main>

      {/* Floating Bottom Nav ONLY on Mobile/Tablet down */}
      <div className="md:hidden">
        <BottomNav />
      </div>

      <Footer />
    </div>
  );
}
