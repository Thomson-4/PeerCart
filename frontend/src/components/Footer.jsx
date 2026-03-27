import { NavLink } from 'react-router-dom';
import { MessageCircle, Camera, PackageSearch, Mail, ShieldCheck } from 'lucide-react';
import logo from '../assets/Gemini_Generated_Image_5tzb215tzb215tzb.png';

export default function Footer() {
  return (
    <footer className="w-full bg-surface/90 border-t border-border-color pt-16 pb-32 md:pb-16 px-6 relative z-10 transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Logo & About */}
        <div className="col-span-1 md:col-span-1 space-y-6">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="PeerCart"
              className="h-16 sm:h-20 w-auto object-contain floating-ambient"
            />
          </div>
          <p className="text-sm text-text-secondary leading-relaxed font-medium">
            Building the safest, most transparent marketplace for people to buy, sell, and rent with confidence.
          </p>
          <div className="flex gap-4">
            <a href="#" className="p-2 bg-surface-elevated hover:bg-accent hover:text-white rounded-full transition-colors">
              <MessageCircle size={18} />
            </a>
            <a href="#" className="p-2 bg-surface-elevated hover:bg-accent hover:text-white rounded-full transition-colors">
              <Camera size={18} />
            </a>
            <a href="#" className="p-2 bg-surface-elevated hover:bg-accent hover:text-white rounded-full transition-colors">
              <PackageSearch size={18} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-6">
          <h4 className="text-sm font-extrabold uppercase tracking-widest text-text-primary">Platform</h4>
          <ul className="space-y-4 text-sm font-bold text-text-secondary">
            <li><NavLink to="/feed" className="hover:text-accent transition-colors">Shop Feed</NavLink></li>
            <li><NavLink to="/needs" className="hover:text-accent transition-colors">Need Board</NavLink></li>
            <li><NavLink to="/add" className="hover:text-accent transition-colors">Sell an Item</NavLink></li>
            <li><NavLink to="/profile" className="hover:text-accent transition-colors">Your Profile</NavLink></li>
          </ul>
        </div>

        {/* Support */}
        <div className="space-y-6">
          <h4 className="text-sm font-extrabold uppercase tracking-widest text-text-primary">Support</h4>
          <ul className="space-y-4 text-sm font-bold text-text-secondary">
            <li><a href="#" className="hover:text-accent transition-colors">Safety Guides</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">Trust Score Help</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">FAQs</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">Contact Us</a></li>
          </ul>
        </div>

        {/* Mailing List / CTA */}
        <div className="space-y-6">
          <h4 className="text-sm font-extrabold uppercase tracking-widest text-text-primary">Contact</h4>
          <p className="text-sm text-text-secondary font-medium">Have a platform-specific request? Shoot us an email.</p>
          <a href="mailto:hello@peercart.app" className="inline-flex items-center gap-2 text-sm font-extrabold text-accent hover:underline underline-offset-4">
            <Mail size={16} /> hello@peercart.app
          </a>
          <div className="pt-2 flex items-center gap-2 text-xs font-bold text-text-secondary uppercase">
             <ShieldCheck size={14} className="text-accent" /> Verified Safe Platform
          </div>
        </div>

      </div>

      {/* Legal Footer Section */}
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-border-color/50 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-xs text-text-secondary font-bold tracking-wide">
          © 2026 PeerCart Technologies Inc. All rights reserved.
        </p>
        <div className="flex gap-8 text-xs text-text-secondary font-bold tracking-wide">
          <a href="#" className="hover:text-text-primary">Privacy Policy</a>
          <a href="#" className="hover:text-text-primary">Terms of Service</a>
          <a href="#" className="hover:text-text-primary">Cookie Policy</a>
        </div>
      </div>
    </footer>
  );
}
