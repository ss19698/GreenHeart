import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Heart, ChevronDown, LogOut, Settings, LayoutDashboard, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const navLinks = [
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Charities', href: '/charities' },
  { label: 'Draws', href: '/draws' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { currentUser, userProfile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      toast.success('Logged out');
      navigate('/');
    } catch {
      toast.error('Failed to log out');
    }
  }

  const isActive = (href) => location.pathname === href;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="glass border-b border-white/5 backdrop-blur-xl">
        <div className="page-container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:shadow-brand-500/50 transition-all duration-200">
                <Heart size={16} className="text-white fill-white" />
              </div>
              <span className="font-display font-bold text-white text-lg tracking-tight">
                Green<span className="gradient-text">Heart</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={clsx(
                    isActive(link.href) ? 'nav-link-active' : 'nav-link'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-3">
              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 glass px-3 py-2 rounded-xl hover:border-brand-500/30 transition-all duration-200"
                  >
                    <div className="w-7 h-7 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
                      <span className="text-brand-400 text-xs font-bold">
                        {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                      </span>
                    </div>
                    <span className="text-white/80 text-sm font-medium max-w-[120px] truncate">
                      {currentUser.displayName || currentUser.email}
                    </span>
                    <ChevronDown size={14} className={clsx('text-white/40 transition-transform', userMenuOpen && 'rotate-180')} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 glass-strong rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/40"
                      >
                        <div className="p-1">
                          <Link to="/dashboard" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-white/80 hover:text-white transition-colors text-sm">
                            <LayoutDashboard size={15} />
                            Dashboard
                          </Link>
                          {userProfile?.role === 'admin' && (
                            <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-gold-400 transition-colors text-sm">
                              <Shield size={15} />
                              Admin Panel
                            </Link>
                          )}
                          <div className="divider my-1" />
                          <button onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors text-sm">
                            <LogOut size={15} />
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
                  <Link to="/subscribe" className="btn-primary text-sm py-2">
                    Subscribe
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden glass p-2 rounded-lg"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong border-b border-white/10"
          >
            <div className="page-container py-4 flex flex-col gap-1">
              {navLinks.map(link => (
                <Link key={link.href} to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="nav-link py-3 block">
                  {link.label}
                </Link>
              ))}
              <div className="divider my-2" />
              {currentUser ? (
                <>
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="nav-link py-3 block">Dashboard</Link>
                  {userProfile?.role === 'admin' && (
                    <Link to="/admin" onClick={() => setMobileOpen(false)} className="text-gold-400 py-3 block px-3 text-sm">Admin Panel</Link>
                  )}
                  <button onClick={handleLogout} className="text-red-400 py-3 text-left px-3 text-sm">Sign out</button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary text-center">Sign in</Link>
                  <Link to="/subscribe" onClick={() => setMobileOpen(false)} className="btn-primary text-center">Subscribe Now</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
