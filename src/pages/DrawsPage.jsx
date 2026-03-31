
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, Calendar, Loader, Info, AlertTriangle } from 'lucide-react';
import { getDraws } from '../lib/firestore';
import { useAuth } from '../context/AuthContext';
import { countMatches } from '../lib/drawEngine';
import Layout from '../components/ui/Layout';
import { format } from 'date-fns';

function ScoreBall({ number, hit }) {
  return (
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-mono font-bold text-sm transition-all ${
      hit
        ? 'bg-gold-500/20 border border-gold-500/40 text-gold-300 shadow-lg shadow-gold-500/10'
        : 'bg-white/5 border border-white/10 text-white/40'
    }`}>
      {number}
    </div>
  );
}

function DrawCard({ draw, userScores, index }) {
  const userScoreNums = (userScores || []).map(s => s.score);
  const matches = draw.status === 'published' && draw.winningNumbers?.length
    ? countMatches(userScoreNums, draw.winningNumbers)
    : 0;
  const isWinner = matches >= 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className={`card ${isWinner ? 'border-gold-500/30 bg-gold-500/3' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            draw.status === 'published'
              ? 'bg-gold-500/15 border border-gold-500/20'
              : 'bg-white/5 border border-white/10'
          }`}>
            {draw.status === 'published'
              ? <Crown size={18} className="text-gold-400" />
              : <Trophy size={18} className="text-white/30" />}
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">{draw.month || 'Draw'}</h3>
            <p className="text-white/40 text-xs">
              {draw.createdAt?.toDate ? format(draw.createdAt.toDate(), 'dd MMM yyyy') : 'Date TBC'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isWinner && (
            <span className="badge-gold text-xs flex items-center gap-1">
              🏆 {matches}-Match Win!
            </span>
          )}
          <span className={draw.status === 'published' ? 'badge-green' : 'badge-gray'}>
            {draw.status === 'published' ? 'Results Live' : 'Upcoming'}
          </span>
        </div>
      </div>

      {draw.status === 'published' && draw.winningNumbers?.length > 0 ? (
        <>
          {/* Winning numbers */}
          <div className="mb-5">
            <p className="text-white/40 text-xs mb-3 uppercase tracking-wider">Winning Numbers</p>
            <div className="flex gap-2 flex-wrap">
              {draw.winningNumbers.map((n, i) => (
                <ScoreBall key={i} number={n} hit={userScoreNums.includes(n)} />
              ))}
            </div>
            {userScoreNums.length > 0 && (
              <p className="text-white/40 text-xs mt-2">
                {matches > 0
                  ? `✓ You matched ${matches} number${matches > 1 ? 's' : ''}`
                  : '✗ No matches this draw — keep playing!'}
              </p>
            )}
          </div>

          {/* Prize tiers */}
          {draw.prizes && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: '5-Match Jackpot', val: draw.prizes.perWinner5, total: draw.prizes.jackpotPoolTotal },
                { label: '4-Match Prize',   val: draw.prizes.perWinner4, total: draw.prizes.pool4Total },
                { label: '3-Match Prize',   val: draw.prizes.perWinner3, total: draw.prizes.pool3Total },
              ].map(tier => (
                <div key={tier.label} className="glass rounded-xl p-3 text-center">
                  <p className="text-white/40 text-xs mb-1">{tier.label}</p>
                  <p className="gradient-text font-bold font-mono text-sm">
                    {tier.val ? `£${(tier.val / 100).toFixed(2)}` : (tier.total ? `Pool: £${(tier.total/100).toFixed(2)}` : 'Rolled')}
                  </p>
                </div>
              ))}
            </div>
          )}

          {draw.jackpotRolledOver && (
            <div className="flex items-center gap-2 text-amber-400 text-xs glass rounded-xl p-3">
              <Info size={13} />
              Jackpot rolled over — no 5-match winner this draw.
            </div>
          )}
        </>
      ) : (
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-white/30 text-sm">Draw results published after the monthly draw date.</p>
        </div>
      )}
    </motion.div>
  );
}

export default function DrawsPage() {
  const { currentUser, userProfile } = useAuth();
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentUser === undefined) return;
    setLoading(true);
    getDraws(20)
      .then(d => { setDraws(d); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [currentUser]);

  return (
    <Layout>
      <div className="py-16">
        <div className="page-container max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <p className="text-brand-400 text-sm font-semibold tracking-widest uppercase mb-3">Prize Draws</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Monthly Draws</h1>
            <p className="text-white/40 max-w-xl mx-auto">
              Every month, 5 winning numbers are drawn. Match 3, 4, or all 5 to win your share of the prize pool.
            </p>
          </motion.div>

          {/* Prize tier summary */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="grid grid-cols-3 gap-4 mb-12">
            {[
              { match: '3 Numbers', prize: '25% of pool', color: 'text-brand-400' },
              { match: '4 Numbers', prize: '35% of pool', color: 'text-brand-300' },
              { match: '5 Numbers', prize: '40% Jackpot', color: 'gold-gradient-text', special: true },
            ].map(tier => (
              <div key={tier.match} className={`card text-center ${tier.special ? 'border-gold-500/20 bg-gold-500/3' : ''}`}>
                <p className={`font-display text-xl font-bold mb-1 ${tier.color}`}>{tier.match}</p>
                <p className="text-white/40 text-xs">{tier.prize}</p>
                {tier.special && <p className="text-gold-400 text-xs mt-1">Rolls over if unclaimed</p>}
              </div>
            ))}
          </motion.div>

          {/* Your numbers */}
          {userProfile?.scores?.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
              className="card border-brand-500/20 mb-8">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Your Current Draw Numbers</p>
              <div className="flex gap-2 flex-wrap">
                {userProfile.scores.map((s, i) => (
                  <div key={i} className="w-11 h-11 rounded-xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center font-mono font-bold text-sm text-brand-300">
                    {s.score}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Error state */}
          {error && (
            <div className="flex items-center gap-3 glass rounded-xl p-4 border border-red-500/20 bg-red-500/5 mb-6">
              <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
              <div>
                <p className="text-red-300 text-sm font-medium">Could not load draws</p>
                <p className="text-white/40 text-xs mt-0.5">{error}</p>
                <p className="text-white/30 text-xs mt-1">Fix: Deploy updated firestore.rules → <code>firebase deploy --only firestore:rules</code></p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader size={32} className="text-brand-500 animate-spin" />
            </div>
          ) : draws.length === 0 && !error ? (
            <div className="text-center py-20">
              <Trophy size={40} className="text-white/10 mx-auto mb-3" />
              <p className="text-white/40">No draws published yet. Check back after the first monthly draw.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {draws.map((draw, i) => (
                <DrawCard key={draw.id} draw={draw} userScores={userProfile?.scores} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
