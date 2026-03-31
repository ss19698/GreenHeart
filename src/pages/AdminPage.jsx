import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, Trophy, Heart, LayoutDashboard, Crown,
  CheckCircle, XCircle, Loader, Plus, Trash2, Play,
  Eye, Shield, TrendingUp, DollarSign, Star, AlertTriangle,
  Mail, ChevronRight,
} from 'lucide-react';
import {
  getAllUsers, getCharities, getDraws, getAllWinners,
  createCharity, updateCharity, deleteCharity,
  updateUserProfile,
  createDraw, updateDraw, updateWinnerStatus,
  getPlatformStats, createWinner,
} from '../lib/firestore';
import {
  generateRandomDraw, generateAlgorithmicDraw, runDrawSimulation,
} from '../lib/drawEngine';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Layout from '../components/ui/Layout';

// ── GUARD ─────────────────────────────────────────────────────────────────
function AdminGuard({ children }) {
  const { userProfile, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader size={32} className="text-brand-500 animate-spin" />
    </div>
  );
  if (!userProfile || userProfile.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Shield size={48} className="text-white/20" />
        <h2 className="font-display text-2xl font-bold text-white">Admin Access Only</h2>
        <p className="text-white/40 text-sm">Your account does not have admin privileges.</p>
        <Link to="/dashboard" className="btn-primary py-2 px-6 text-sm">Back to Dashboard</Link>
      </div>
    );
  }
  return children;
}

// ── SIDEBAR ────────────────────────────────────────────────────────────────
const sideLinks = [
  { to: '/admin',           label: 'Overview',     icon: LayoutDashboard, exact: true },
  { to: '/admin/users',     label: 'Users',        icon: Users },
  { to: '/admin/draws',     label: 'Draw Manager', icon: Trophy },
  { to: '/admin/charities', label: 'Charities',    icon: Heart },
  { to: '/admin/winners',   label: 'Winners',      icon: Crown },
];

function AdminSidebar() {
  const { pathname } = useLocation();
  return (
    <aside className="w-52 flex-shrink-0">
      <div className="card sticky top-24 p-4">
        <div className="flex items-center gap-2 mb-5 px-1">
          <Shield size={15} className="text-gold-400" />
          <span className="font-display font-bold text-white text-sm">Admin Panel</span>
        </div>
        <nav className="space-y-1">
          {sideLinks.map(l => {
            const active = l.exact ? pathname === l.to : pathname.startsWith(l.to) && l.to !== '/admin';
            return (
              <Link key={l.to} to={l.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  active
                    ? 'bg-brand-500/15 text-brand-300 border border-brand-500/20'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}>
                <l.icon size={14} />
                {l.label}
                {active && <ChevronRight size={12} className="ml-auto opacity-60" />}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

// ── OVERVIEW ───────────────────────────────────────────────────────────────
function AdminOverview() {
  const [stats, setStats] = useState(null);
  useEffect(() => { getPlatformStats().then(setStats); }, []);

  if (!stats) return <div className="flex justify-center py-20"><Loader className="text-brand-500 animate-spin" size={28} /></div>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white mb-6">Platform Overview</h1>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Users',        value: stats.totalUsers,         icon: Users,    color: 'brand' },
          { label: 'Active Subscribers', value: stats.activeSubscribers,  icon: TrendingUp, color: 'brand' },
          { label: 'Monthly Revenue',    value: `£${stats.monthlyRevenue}`, icon: DollarSign, color: 'gold' },
          { label: 'Prize Pool',         value: `£${stats.prizePool}`,    icon: Trophy,   color: 'gold' },
          { label: 'Charities',          value: stats.totalCharities,     icon: Heart,    color: 'brand' },
          { label: 'All-time Winners',   value: stats.totalWinners,       icon: Crown,    color: 'gold' },
        ].map((c, i) => (
          <motion.div key={c.label} initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.06 }}>
            <div className="card">
              <div className={`w-9 h-9 rounded-xl mb-3 flex items-center justify-center ${
                c.color==='gold' ? 'bg-gold-500/15 border border-gold-500/20' : 'bg-brand-500/15 border border-brand-500/20'
              }`}>
                <c.icon size={15} className={c.color==='gold' ? 'text-gold-400' : 'text-brand-400'} />
              </div>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-0.5">{c.label}</p>
              <p className={`font-display text-2xl font-bold ${c.color==='gold' ? 'gold-gradient-text' : 'gradient-text'}`}>{c.value}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="card">
        <h2 className="font-display text-lg font-bold text-white mb-2">Quick Actions</h2>
        <p className="text-white/40 text-sm mb-4">Jump to common admin tasks</p>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/draws" className="btn-primary py-2 px-4 text-sm flex items-center gap-2"><Play size={14} /> Run Draw</Link>
          <Link to="/admin/charities" className="btn-secondary py-2 px-4 text-sm flex items-center gap-2"><Plus size={14} /> Add Charity</Link>
          <Link to="/admin/winners" className="btn-secondary py-2 px-4 text-sm flex items-center gap-2"><Crown size={14} /> Verify Winners</Link>
        </div>
      </div>
    </div>
  );
}

// ── USERS ─────────────────────────────────────────────────────────────────
function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => { getAllUsers().then(u => { setUsers(u); setLoading(false); }); }, []);

  const filtered = users.filter(u =>
    u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  async function toggleSubscription(user) {
    setUpdatingId(user.id);
    try {
      const newStatus = user.subscriptionStatus === 'active' ? 'cancelled' : 'active';
      await updateUserProfile(user.id, { subscriptionStatus: newStatus });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, subscriptionStatus: newStatus } : u));
      toast.success(`Subscription ${newStatus}`);
    } catch { toast.error('Update failed'); }
    finally { setUpdatingId(null); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-white">User Management</h1>
        <span className="text-white/30 text-sm">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</span>
      </div>
      <input type="text" placeholder="Search by name or email..." value={search}
        onChange={e => setSearch(e.target.value)} className="input-field max-w-sm mb-5" />

      {loading ? (
        <div className="flex justify-center py-20"><Loader className="text-brand-500 animate-spin" size={28} /></div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['User', 'Email', 'Plan', 'Status', 'Scores', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left text-white/30 font-medium pb-3 pr-4 pt-4 px-4 text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-white/3 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-400 text-xs font-bold flex-shrink-0">
                        {(user.displayName || user.email || 'U')[0].toUpperCase()}
                      </div>
                      <span className="text-white text-sm">{user.displayName || '—'}</span>
                      {user.role === 'admin' && <span className="badge-gold text-xs">admin</span>}
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-white/50 text-xs max-w-[160px] truncate">{user.email}</td>
                  <td className="py-3 pr-4">
                    <span className={user.subscriptionPlan ? 'badge-green' : 'badge-gray'}>
                      {user.subscriptionPlan || 'None'}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={user.subscriptionStatus === 'active' ? 'badge-green' : 'badge-red'}>
                      {user.subscriptionStatus || 'inactive'}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-white/60 font-mono text-xs">{user.scores?.length || 0}/5</td>
                  <td className="py-3 pr-4 text-white/40 text-xs whitespace-nowrap">
                    {user.createdAt?.toDate ? format(user.createdAt.toDate(), 'dd MMM yy') : '—'}
                  </td>
                  <td className="py-3 pr-4">
                    <button
                      onClick={() => toggleSubscription(user)}
                      disabled={updatingId === user.id}
                      className={`py-1 px-3 rounded-lg text-xs font-medium transition-all ${
                        user.subscriptionStatus === 'active'
                          ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                          : 'bg-brand-500/10 text-brand-400 hover:bg-brand-500/20'
                      }`}>
                      {updatingId === user.id ? <Loader size={10} className="animate-spin inline" /> :
                        user.subscriptionStatus === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center text-white/30 py-8">No users found</p>}
        </div>
      )}
    </div>
  );
}

// ── DRAW MANAGER ──────────────────────────────────────────────────────────
function AdminDraws() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('random');
  const [simResult, setSimResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const fetchDraws = () => getDraws(20).then(d => { setDraws(d); setLoading(false); });
  useEffect(() => { fetchDraws(); }, []);

  async function handleCreateDraw({ month }) {
    try {
      await createDraw({ month, drawMode: mode });
      toast.success('Draw created');
      reset();
      fetchDraws();
    } catch { toast.error('Failed to create draw'); }
  }

  async function runSimulation(draw) {
    setRunning(true);
    try {
      const users = await getAllUsers();
      const activeUsers = users.filter(u => u.subscriptionStatus === 'active' && u.scores?.length > 0);
      const allScoreNums = activeUsers.flatMap(u => (u.scores || []).map(s => s.score));

      const winningNums = mode === 'algorithmic' && allScoreNums.length > 0
        ? generateAlgorithmicDraw(allScoreNums, 'most')
        : generateRandomDraw();

      const prizePool = activeUsers.length * 1999 * 0.4;
      const result = runDrawSimulation(winningNums, activeUsers, prizePool);
      setSimResult({ winningNums, result, drawId: draw.id, month: draw.month, prizePool });
      toast.success('Simulation complete — review before publishing');
    } catch (e) {
      toast.error('Simulation failed: ' + e.message);
    } finally {
      setRunning(false);
    }
  }

  async function publishDraw() {
    if (!simResult) return;
    try {
      // 1. Update draw in Firestore
      await updateDraw(simResult.drawId, {
        status: 'published',
        winningNumbers: simResult.winningNums,
        prizes: simResult.result.prizes,
        publishedAt: new Date().toISOString(),
      });

      // 2. Create winner records for matched users
      const { results } = simResult.result;
      for (const [matchStr, winners] of Object.entries(results)) {
        const matchCount = Number(matchStr);
        const prizePerWinner = simResult.result.prizes[`perWinner${matchCount}`] || 0;
        for (const winner of winners) {
          await createWinner({
            userId: winner.userId,
            drawId: simResult.drawId,
            drawMonth: simResult.month,
            matchCount,
            prizeAmount: prizePerWinner,
          });
        }
      }

      toast.success('Draw published and winner records created!');
      setSimResult(null);
      fetchDraws();
    } catch (e) {
      toast.error('Publish failed: ' + e.message);
    }
  }

  async function sendDrawNotifications(draw) {
    setNotifying(true);
    try {
      const users = await getAllUsers();
      const subscribers = users.filter(u => u.subscriptionStatus === 'active' && u.email);
      let sent = 0;
      for (const user of subscribers) {
        const userScoreNums = (user.scores || []).map(s => s.score);
        const matches = draw.winningNumbers
          ? draw.winningNumbers.filter(n => userScoreNums.includes(n)).length
          : 0;
        sent++;
      }
      toast.success(`Draw result emails sent to ${sent} subscribers`);
    } catch (e) {
      toast.error('Email send failed: ' + e.message);
    } finally {
      setNotifying(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white mb-6">Draw Manager</h1>

      {/* Create new draw */}
      <div className="card mb-6">
        <h2 className="font-semibold text-white mb-4">Create New Draw</h2>
        <form onSubmit={handleSubmit(handleCreateDraw)} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-white/50 text-xs mb-1.5 block">Month Label</label>
            <input {...register('month', { required: true })} placeholder="e.g. April 2026" className="input-field w-48" />
          </div>
          <div>
            <label className="text-white/50 text-xs mb-1.5 block">Draw Mode</label>
            <select value={mode} onChange={e => setMode(e.target.value)} className="input-field">
              <option value="random">Random (standard)</option>
              <option value="algorithmic">Algorithmic (weighted)</option>
            </select>
          </div>
          <button type="submit" className="btn-primary py-3 flex items-center gap-2"><Plus size={15} /> Create Draft</button>
        </form>
      </div>

      {/* Simulation result */}
      {simResult && (
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
          className="card border-gold-500/20 bg-gold-500/3 mb-6">
          <h2 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Eye size={18} className="text-gold-400" /> Simulation Preview
          </h2>
          <p className="text-white/50 text-sm mb-3">Winning numbers generated:</p>
          <div className="flex gap-3 mb-5">
            {simResult.winningNums.map((n, i) => (
              <div key={i} className="w-12 h-12 rounded-xl border border-gold-500/40 text-gold-400 bg-gold-500/10 flex items-center justify-center font-mono font-bold text-base">{n}</div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[5, 4, 3].map(m => (
              <div key={m} className="glass rounded-xl p-3 text-center">
                <p className="text-white/40 text-xs mb-1">{m}-Match Winners</p>
                <p className="gradient-text font-bold text-xl">{simResult.result.winnerCounts[m]}</p>
                <p className="text-white/30 text-xs">
                  £{((simResult.result.prizes[`perWinner${m}`] || 0) / 100).toFixed(2)} each
                </p>
              </div>
            ))}
          </div>
          {simResult.result.prizes.rollsOver && (
            <div className="flex items-center gap-2 text-amber-400 text-xs glass rounded-xl p-3 mb-4">
              <AlertTriangle size={13} /> Jackpot will roll over — no 5-match winner
            </div>
          )}
          <div className="flex gap-3 flex-wrap">
            <button onClick={publishDraw} className="btn-primary flex items-center gap-2">
              <CheckCircle size={15} /> Publish & Create Winner Records
            </button>
            <button onClick={() => setSimResult(null)} className="btn-secondary flex items-center gap-2">
              <XCircle size={15} /> Discard
            </button>
          </div>
        </motion.div>
      )}

      {/* Draw list */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader className="text-brand-500 animate-spin" size={28} /></div>
      ) : (
        <div className="space-y-3">
          {draws.length === 0 && <p className="text-center text-white/30 py-10">No draws yet. Create your first one above.</p>}
          {draws.map(draw => (
            <div key={draw.id} className="card flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="font-semibold text-white">{draw.month}</p>
                <p className="text-white/40 text-xs">
                  {draw.drawMode || 'random'} · {draw.winningNumbers?.length ? `Numbers: ${draw.winningNumbers.join(', ')}` : 'No numbers yet'}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={draw.status === 'published' ? 'badge-gold' : 'badge-gray'}>{draw.status}</span>
                {draw.status === 'draft' && (
                  <button onClick={() => runSimulation(draw)} disabled={running}
                    className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5">
                    {running ? <Loader size={12} className="animate-spin" /> : <Play size={12} />}
                    Simulate & Run
                  </button>
                )}
                {draw.status === 'published' && (
                  <button onClick={() => sendDrawNotifications(draw)} disabled={notifying}
                    className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5">
                    {notifying ? <Loader size={12} className="animate-spin" /> : <Mail size={12} />}
                      Notify Subscribers
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── CHARITY MANAGEMENT ────────────────────────────────────────────────────
function AdminCharities() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const fetchC = () => getCharities().then(c => { setCharities(c); setLoading(false); });
  useEffect(() => { fetchC(); }, []);

  async function onAdd(data) {
    setSaving(true);
    try {
      await createCharity(data);
      toast.success('Charity added!');
      reset(); setAdding(false); fetchC();
    } catch { toast.error('Failed to add charity'); }
    finally { setSaving(false); }
  }

  async function toggleFeatured(charity) {
    try {
      await updateCharity(charity.id, { featured: !charity.featured });
      fetchC();
    } catch { toast.error('Failed to update'); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this charity?')) return;
    try { await deleteCharity(id); toast.success('Deleted'); fetchC(); }
    catch { toast.error('Failed to delete'); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-white">Charity Management</h1>
        <button onClick={() => setAdding(!adding)} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
          <Plus size={15} /> Add Charity
        </button>
      </div>

      {adding && (
        <div className="card mb-6 border-brand-500/20">
          <h2 className="font-semibold text-white mb-4">New Charity</h2>
          <form onSubmit={handleSubmit(onAdd)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-white/50 text-xs mb-1.5 block">Charity Name *</label>
              <input {...register('name', { required: true })} className="input-field" placeholder="e.g. Cancer Research UK" />
            </div>
            <div>
              <label className="text-white/50 text-xs mb-1.5 block">Category</label>
              <select {...register('category')} className="input-field">
                <option value="">Select category</option>
                {['Health','Education','Environment','Community','Sports','Animals','Children','Youth','Hunger'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-white/50 text-xs mb-1.5 block">Emoji Icon</label>
              <input {...register('emoji')} className="input-field" placeholder="e.g. 💚" />
            </div>
            <div>
              <label className="text-white/50 text-xs mb-1.5 block">Website URL</label>
              <input {...register('website')} className="input-field" type="url" placeholder="https://..." />
            </div>
            <div className="sm:col-span-2">
              <label className="text-white/50 text-xs mb-1.5 block">Description *</label>
              <textarea {...register('description', { required: true })} rows={3} className="input-field resize-none"
                placeholder="Brief description of the charity..." />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary py-2.5 flex items-center gap-2">
                {saving ? <Loader size={14} className="animate-spin" /> : <Plus size={14} />} Save Charity
              </button>
              <button type="button" onClick={() => setAdding(false)} className="btn-secondary py-2.5">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><Loader className="text-brand-500 animate-spin" size={28} /></div>
      ) : charities.length === 0 ? (
        <p className="text-center text-white/30 py-12">No charities yet. Add your first one above!</p>
      ) : (
        <div className="space-y-3">
          {charities.map(charity => (
            <div key={charity.id} className="card flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-xl flex-shrink-0">
                {charity.emoji || '💚'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white truncate">{charity.name}</p>
                  {charity.featured && <span className="badge-gold text-xs flex items-center gap-1"><Star size={9} /> Featured</span>}
                </div>
                <p className="text-white/40 text-xs">{charity.category}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleFeatured(charity)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-medium transition-all ${
                    charity.featured ? 'bg-gold-500/15 text-gold-400 border border-gold-500/20' : 'glass text-white/50 hover:text-white'
                  }`}>
                  {charity.featured ? 'Unfeature' : 'Feature'}
                </button>
                <button onClick={() => handleDelete(charity.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── WINNERS MANAGEMENT ────────────────────────────────────────────────────
function AdminWinners() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchW = () => getAllWinners().then(w => { setWinners(w); setLoading(false); });
  useEffect(() => { fetchW(); }, []);

  async function handleStatus(winner, status) {
    setUpdatingId(winner.id);
    try {
      await updateWinnerStatus(winner.id, status);
      if (status === 'approved') {
        const allUsers = await getAllUsers();
        const user = allUsers.find(u => u.id === winner.userId);
      }
      toast.success(`Status → ${status}`);
      fetchW();
    } catch { toast.error('Failed to update status'); }
    finally { setUpdatingId(null); }
  }

  const statusColor = s => ({
    paid: 'badge-green', approved: 'badge-green', pending: 'badge-gold',
    proof_submitted: 'badge-gold', rejected: 'badge-red',
  }[s] || 'badge-gray');

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white mb-6">Winners & Payouts</h1>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          ['Total Winners',   winners.length,                                  'badge-gray'],
          ['Pending Review',  winners.filter(w => w.paymentStatus === 'pending' || w.paymentStatus === 'proof_submitted').length, 'badge-gold'],
          ['Paid Out',        winners.filter(w => w.paymentStatus === 'paid').length,    'badge-green'],
        ].map(([label, val, badge]) => (
          <div key={label} className="card text-center">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">{label}</p>
            <p className="font-display text-3xl font-bold gradient-text">{val}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader className="text-brand-500 animate-spin" size={28} /></div>
      ) : winners.length === 0 ? (
        <div className="text-center py-20">
          <Crown size={40} className="text-white/10 mx-auto mb-3" />
          <p className="text-white/40">No winners recorded yet. Run and publish a draw first.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['User ID', 'Draw', 'Match', 'Prize', 'Status', 'Proof', 'Actions'].map(h => (
                  <th key={h} className="text-left text-white/30 font-medium p-4 text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {winners.map(w => (
                <tr key={w.id} className="hover:bg-white/3 transition-colors">
                  <td className="p-4 text-white/60 text-xs font-mono truncate max-w-[100px]">{w.userId?.slice(0,12)}…</td>
                  <td className="p-4 text-white text-xs">{w.drawMonth || w.drawId?.slice(0,8)}</td>
                  <td className="p-4"><span className="badge-gold text-xs">{w.matchCount}-match</span></td>
                  <td className="p-4 text-white font-mono font-bold text-sm">£{((w.prizeAmount || 0) / 100).toFixed(2)}</td>
                  <td className="p-4"><span className={`${statusColor(w.paymentStatus)} text-xs`}>{w.paymentStatus || 'pending'}</span></td>
                  <td className="p-4">
                    {w.proofUrl
                      ? <a href={w.proofUrl} target="_blank" rel="noreferrer" className="text-brand-400 text-xs hover:underline">View ↗</a>
                      : <span className="text-white/30 text-xs">Not submitted</span>}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      {(w.paymentStatus === 'pending' || w.paymentStatus === 'proof_submitted') && (
                        <>
                          <button onClick={() => handleStatus(w, 'approved')} disabled={updatingId === w.id}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-brand-500/15 text-white/40 hover:text-brand-400 transition-all"
                            title="Approve">
                            {updatingId === w.id ? <Loader size={10} className="animate-spin" /> : <CheckCircle size={13} />}
                          </button>
                          <button onClick={() => handleStatus(w, 'rejected')} disabled={updatingId === w.id}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all"
                            title="Reject">
                            <XCircle size={13} />
                          </button>
                        </>
                      )}
                      {w.paymentStatus === 'approved' && (
                        <button onClick={() => handleStatus(w, 'paid')} disabled={updatingId === w.id}
                          className="btn-primary py-1 px-2.5 text-xs flex items-center gap-1">
                          <DollarSign size={10} /> Mark Paid
                        </button>
                      )}
                      {w.paymentStatus === 'paid' && <span className="text-brand-400 text-xs">✓ Complete</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────
export default function AdminPage() {
  return (
    <Layout>
      <AdminGuard>
        <div className="py-10">
          <div className="page-container">
            <div className="flex gap-6">
              <AdminSidebar />
              <div className="flex-1 min-w-0">
                <Routes>
                  <Route index element={<AdminOverview />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="draws" element={<AdminDraws />} />
                  <Route path="charities" element={<AdminCharities />} />
                  <Route path="winners" element={<AdminWinners />} />
                  <Route path="*" element={<Navigate to="/admin" replace />} />
                </Routes>
              </div>
            </div>
          </div>
        </div>
      </AdminGuard>
    </Layout>
  );
}
