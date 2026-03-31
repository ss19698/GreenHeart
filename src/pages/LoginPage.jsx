
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Layout from '../components/ui/Layout';

const ERROR_MESSAGES = {
  'auth/invalid-credential':     'Invalid email or password.',
  'auth/user-not-found':         'No account found with this email.',
  'auth/wrong-password':         'Incorrect password.',
  'auth/too-many-requests':      'Too many failed attempts. Try again later.',
  'auth/network-request-failed': 'Network error. Check your connection.',
  'auth/user-disabled':          'This account has been disabled.',
};

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(ERROR_MESSAGES[err.code] || err.message || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Signed in with Google!');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(ERROR_MESSAGES[err.code] || 'Google sign-in failed.');
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-sm">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
            <div className="text-center mb-8">
              <h1 className="font-display text-3xl font-bold text-white mb-2">Welcome back</h1>
              <p className="text-white/40 text-sm">Sign in to your GolfGives account</p>
            </div>

            {error && (
              <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
                className="mb-4 glass rounded-xl p-3 border border-red-500/30 bg-red-500/5 text-red-300 text-sm">
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mb-4">
              <div>
                <label className="text-white/50 text-xs mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" required className="input-field pl-10" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-white/50 text-xs">Password</label>
                  <Link to="/forgot-password" className="text-brand-400 text-xs hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input type={showPw ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                    required className="input-field pl-10 pr-10" />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="btn-primary w-full py-3.5 flex items-center justify-center gap-2">
                {loading ? <span className="w-5 h-5 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" /> : <>Sign In <ArrowRight size={16} /></>}
              </button>
            </form>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/30 text-xs">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <button onClick={handleGoogle} disabled={googleLoading}
              className="btn-secondary w-full py-3 flex items-center justify-center gap-2 mb-6">
              {googleLoading
                ? <span className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                : <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>}
              Continue with Google
            </button>

            <p className="text-center text-white/40 text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-brand-400 hover:text-brand-300 font-medium">Sign up free</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
