import { Link } from 'react-router-dom';
import { Heart, Twitter, Instagram, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-24">
      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                <Heart size={16} className="text-white fill-white" />
              </div>
              <span className="font-display font-bold text-white text-lg">
                Green<span className="gradient-text">Heart</span>
              </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Play golf. Win prizes. Change lives. A subscription platform that turns your handicap into genuine charitable impact every month.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[Twitter, Instagram, Mail].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 glass rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all duration-200">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white/80 font-semibold text-sm mb-4">Platform</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'How It Works', href: '/#how-it-works' },
                { label: 'Charities', href: '/charities' },
                { label: 'Monthly Draws', href: '/draws' },
                { label: 'Subscribe', href: '/subscribe' },
              ].map(link => (
                <li key={link.href}>
                  <Link to={link.href} className="text-white/40 hover:text-white/80 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white/80 font-semibold text-sm mb-4">Account</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Sign In', href: '/login' },
                { label: 'Get Started', href: '/signup' },
              ].map(link => (
                <li key={link.href}>
                  <Link to={link.href} className="text-white/40 hover:text-white/80 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="divider mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} GreenHeart. All rights reserved.
          </p>
          <p className="text-white/30 text-xs flex items-center gap-1">
            Made with <Heart size={11} className="text-brand-500 fill-brand-500" /> for good causes
          </p>
        </div>
      </div>
    </footer>
  );
}
