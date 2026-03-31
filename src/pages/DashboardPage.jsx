
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy, Heart, Calendar, TrendingUp, AlertCircle, ArrowRight,
  Loader, Crown, Upload, CheckCircle, Clock, XCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getLatestPublishedDraw, getCharity, getAllWinners, submitWinnerProof } from '../lib/firestore';
import Layout from '../components/ui/Layout';
import ScoreManager from '../components/dashboard/ScoreManager';
import CharitySelector from '../components/dashboard/CharitySelector';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const TABS = ['overview', 'scores', 'charity', 'wins'];

function StatCard({ icon: Icon, label, value, sub, color = 'brand' }) {
  return (
    <div className="card">
      <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center ${
        color === 'gold' ? 'bg-gold-500/15 border border-gold-500/20' : 'bg-brand-500/15 border border-brand-500/20'
      }`}>
        <Icon size={18} className={color === 'gold' ? 'text-gold-400' : 'text-brand-400'} />
      </div>
      <p className="text-white/40 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className={`font-display text-2xl font-bold ${color === 'gold' ? 'gold-gradient-text' : 'gradient-text'}`}>{value}</p>
      {sub && <p className="text-white/30 text-xs mt-1">{sub}</p>}
    </div>
  );
}

function WinsTab({ userId }) {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);

  useEffect(() => {
    getAllWinners()
      .then(all => { setWinners(all.filter(w => w.userId === userId)); setLoading(false); })
      .catch(() => setLoading(false));
  }, [userId]);

  async function handleProofUpload(winnerId, e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingId(winnerId);
    try {
      const fakeUrl = `https://storage.example.com/proofs/${winnerId}_${Date.now()}.png`;
      await submitWinnerProof(winnerId, fakeUrl);
      setWinners(prev => prev.map(w => w.id === winnerId ? { ...w, proofUrl: fakeUrl, paymentStatus: 'proof_submitted' } : w));
      toast.success('Proof submitted! Admin will verify shortly.');
    } catch { toast.error('Upload failed. Try again.'); }
    finally { setUploadingId(null); }
  }

  const statusIcon = s => ({
    paid:            <CheckCircle size={15} className="text-brand-400" />,
    approved:        <CheckCircle size={15} className="text-green-400" />,
    proof_submitted: <Clock size={15} className="text-amber-400" />,
    rejected:        <XCircle size={15} className="text-red-400" />,
    pending:         <Clock size={15} className="text-white/30" />,
  }[s] || <Clock size={15} className="text-white/30" />);

  if (loading) return <div className="flex justify-center py-16"><Loader size={24} className="text-brand-500 animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Crown size={20} className="text-gold-400" />
        <h2 className="font-display text-xl font-bold text-white">My Winnings</h2>
      </div>
      {winners.length === 0 ? (
        <div className="card text-center py-16">
          <Trophy size={40} className="text-white/10 mx-auto mb-3" />
          <p className="text-white/40">No wins yet — keep logging scores and entering draws!</p>
          <Link to="/draws" className="btn-primary py-2 px-5 text-sm mt-4 inline-flex items-center gap-2">
            View Draws <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {winners.map(w => (
            <motion.div key={w.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
              className={`card border ${w.paymentStatus === 'paid' ? 'border-brand-500/20' : 'border-white/5'}`}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge-gold text-xs">{w.matchCount}-Match Win</span>
                    <div className="flex items-center gap-1 text-xs text-white/40">
                      {statusIcon(w.paymentStatus)}
                      {w.paymentStatus || 'pending'}
                    </div>
                  </div>
                  <p className="font-display text-2xl font-bold gradient-text">£{((w.prizeAmount || 0) / 100).toFixed(2)}</p>
                  <p className="text-white/40 text-xs mt-0.5">{w.drawMonth} draw</p>
                </div>
              </div>

              {/* Proof upload */}
              {!w.proofUrl && w.paymentStatus !== 'paid' && w.paymentStatus !== 'rejected' && (
                <div className="glass rounded-xl p-4 border border-amber-500/20 bg-amber-500/3">
                  <p className="text-amber-300 text-sm font-medium mb-1">Action required: Upload proof of scores</p>
                  <p className="text-white/40 text-xs mb-3">
                    Take a screenshot of your GolfGives scores page and upload it to claim your prize.
                  </p>
                  <label className={`btn-primary py-2 px-4 text-sm flex items-center gap-2 w-fit cursor-pointer ${uploadingId === w.id ? 'opacity-50 pointer-events-none' : ''}`}>
                    {uploadingId === w.id
                      ? <><Loader size={14} className="animate-spin" /> Uploading…</>
                      : <><Upload size={14} /> Upload Screenshot</>}
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleProofUpload(w.id, e)} />
                  </label>
                </div>
              )}
              {w.proofUrl && w.paymentStatus !== 'paid' && (
                <div className="glass rounded-xl p-3 flex items-center gap-2 text-amber-300 text-sm">
                  <Clock size={15} /> Proof submitted — awaiting admin verification
                </div>
              )}
              {w.paymentStatus === 'paid' && (
                <div className="glass rounded-xl p-3 flex items-center gap-2 text-brand-400 text-sm">
                  <CheckCircle size={15} /> Prize paid out!
                </div>
              )}
              {w.paymentStatus === 'rejected' && (
                <div className="glass rounded-xl p-3 flex items-center gap-2 text-red-400 text-sm">
                  <XCircle size={15} /> Verification rejected — contact support
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { currentUser, userProfile, refreshUserProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [latestDraw, setLatestDraw] = useState(null);
  const [charity, setCharity] = useState(null);
  const [loadingDraw, setLoadingDraw] = useState(true);

  const activeTab = searchParams.get('tab') || 'overview';
  const setTab = t => setSearchParams({ tab: t });

  useEffect(() => {
    getLatestPublishedDraw()
      .then(d => { setLatestDraw(d); setLoadingDraw(false); })
      .catch(() => setLoadingDraw(false));
  }, []);

  useEffect(() => {
    if (userProfile?.charityId) getCharity(userProfile.charityId).then(setCharity);
  }, [userProfile?.charityId]);

  if (!userProfile) return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen">
        <Loader size={32} className="text-brand-500 animate-spin" />
      </div>
    </Layout>
  );

  const isActive = userProfile.subscriptionStatus === 'active';
  const planPrice = userProfile.subscriptionPlan === 'yearly' ? 191.90 : 19.99;
  const charityContrib = ((planPrice * (userProfile.charityContributionPercent || 10)) / 100).toFixed(2);

  return (
    <Layout>
      <div className="py-10">
        <div className="page-container">
          {/* Header */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="mb-8">
            <p className="text-white/40 text-sm mb-1">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white">
              Welcome back, <span className="gradient-text">{currentUser?.displayName?.split(' ')[0] || 'Golfer'}</span>
            </h1>
          </motion.div>

          {/* Inactive banner */}
          {!isActive && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
              className="mb-8 flex items-center gap-4 glass rounded-2xl p-4 border border-amber-500/20 bg-amber-500/5">
              <AlertCircle size={20} className="text-amber-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-amber-300 font-medium text-sm">No active subscription</p>
                <p className="text-white/40 text-xs mt-0.5">Subscribe to enter monthly draws and contribute to charity.</p>
              </div>
              <Link to="/subscribe" className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5 flex-shrink-0">
                Subscribe <ArrowRight size={14} />
              </Link>
            </motion.div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 mb-8 glass rounded-xl p-1 w-fit">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  activeTab === t
                    ? 'bg-brand-500 text-dark-900 shadow-lg shadow-brand-500/20'
                    : 'text-white/50 hover:text-white'
                }`}>
                {t}
              </button>
            ))}
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
                  <StatCard icon={Calendar} label="Subscription"
                    value={isActive ? 'Active' : 'Inactive'}
                    sub={isActive && userProfile.subscriptionRenewalDate
                      ? `Renews ${format(new Date(userProfile.subscriptionRenewalDate), 'd MMM yyyy')}`
                      : userProfile.subscriptionPlan || 'No plan'}
                    color={isActive ? 'brand' : 'gold'} />
                </motion.div>
                <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}>
                  <StatCard icon={TrendingUp} label="Draws Entered"
                    value={userProfile.drawsEntered || 0}
                    sub="Since joining" />
                </motion.div>
                <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
                  <StatCard icon={Trophy} label="Total Won"
                    value={`£${((userProfile.totalWon || 0) / 100).toFixed(2)}`}
                    sub="All-time winnings" color="gold" />
                </motion.div>
                <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}>
                  <StatCard icon={Heart} label="Charity Contrib"
                    value={`£${charityContrib}`}
                    sub={`${userProfile.charityContributionPercent || 10}% of subscription`} color="gold" />
                </motion.div>
              </div>

              {/* Scores + latest draw side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-lg font-bold text-white">My Scores</h3>
                    <button onClick={() => setTab('scores')} className="text-brand-400 text-xs hover:underline flex items-center gap-1">
                      Manage <ArrowRight size={12} />
                    </button>
                  </div>
                  {userProfile.scores?.length > 0 ? (
                    <div className="space-y-2">
                      {userProfile.scores.slice(0, 5).map((s, i) => (
                        <div key={s.id || i} className="flex items-center gap-3 glass rounded-xl p-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-base flex-shrink-0 ${
                            s.score >= 36 ? 'bg-gold-500/15 text-gold-400' :
                            s.score >= 28 ? 'bg-brand-500/15 text-brand-400' : 'bg-white/5 text-white/60'
                          }`}>{s.score}</div>
                          <div className="flex-1">
                            <p className="text-white text-sm">{s.date ? format(new Date(s.date), 'dd MMM yyyy') : '—'}</p>
                          </div>
                          {i === 0 && <span className="badge-green text-xs">Latest</span>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-white/40 text-sm mb-3">No scores yet</p>
                      <button onClick={() => setTab('scores')} className="btn-primary py-2 px-4 text-xs">Add First Score</button>
                    </div>
                  )}
                </div>

                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-lg font-bold text-white">Latest Draw</h3>
                    <Link to="/draws" className="text-brand-400 text-xs hover:underline flex items-center gap-1">
                      All draws <ArrowRight size={12} />
                    </Link>
                  </div>
                  {loadingDraw ? (
                    <div className="flex justify-center py-8"><Loader size={20} className="text-brand-500 animate-spin" /></div>
                  ) : latestDraw ? (
                    <div>
                      <p className="text-white font-semibold mb-1">{latestDraw.month}</p>
                      <p className="text-brand-400 text-xs mb-4">Winning Numbers</p>
                      <div className="flex gap-2 flex-wrap">
                        {latestDraw.winningNumbers?.map((n, i) => {
                          const hit = userProfile.scores?.some(s => s.score === n);
                          return (
                            <div key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm ${
                              hit ? 'bg-gold-500/20 border border-gold-500/40 text-gold-300' : 'bg-white/5 border border-white/10 text-white/40'
                            }`}>{n}</div>
                          );
                        })}
                      </div>
                      {userProfile.scores?.length > 0 && (
                        <p className="text-white/40 text-xs mt-3">
                          {(() => {
                            const hits = latestDraw.winningNumbers?.filter(n => userProfile.scores.some(s => s.score === n)).length || 0;
                            return hits > 0 ? `✓ You matched ${hits} number${hits > 1 ? 's' : ''}!` : '✗ No matches this draw';
                          })()}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-white/40 text-sm">No draws published yet.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Charity card */}
              {charity && (
                <div className="card mt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-2xl">{charity.emoji || '💚'}</div>
                      <div>
                        <p className="text-white font-semibold">{charity.name}</p>
                        <p className="text-white/40 text-xs">{charity.category}</p>
                        <p className="text-brand-400 text-sm mt-1">You're donating £{charityContrib}/mo ({userProfile.charityContributionPercent || 10}%)</p>
                      </div>
                    </div>
                    <button onClick={() => setTab('charity')} className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5">
                      Change <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SCORES TAB */}
          {activeTab === 'scores' && (
            <ScoreManager scores={userProfile.scores || []} onRefresh={refreshUserProfile} />
          )}

          {/* CHARITY TAB */}
          {activeTab === 'charity' && (
            <CharitySelector
              currentCharityId={userProfile.charityId}
              currentPercent={userProfile.charityContributionPercent}
              onRefresh={refreshUserProfile}
            />
          )}

          {/* WINS TAB */}
          {activeTab === 'wins' && (
            <WinsTab userId={currentUser?.uid} />
          )}
        </div>
      </div>
    </Layout>
  );
}
