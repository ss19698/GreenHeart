import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Search, CheckCircle, Loader } from 'lucide-react';
import { getCharities, updateUserProfile } from '../../lib/firestore';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function CharitySelector({ currentCharityId, currentPercent, onRefresh }) {
  const { currentUser } = useAuth();
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState(currentCharityId);
  const [percent, setPercent] = useState(currentPercent || 10);

  useEffect(() => {
    getCharities().then(c => { setCharities(c); setLoading(false); });
  }, []);

  const filtered = charities.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.category?.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSave() {
    if (!selectedId) { toast.error('Please select a charity'); return; }
    setSaving(true);
    try {
      await updateUserProfile(currentUser.uid, {
        charityId: selectedId,
        charityContributionPercent: percent,
      });
      toast.success('Charity preference saved!');
      onRefresh();
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="card flex items-center justify-center py-16">
      <Loader size={24} className="text-brand-500 animate-spin" />
    </div>
  );

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center">
          <Heart size={16} className="text-brand-400" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-white">Your Charity</h2>
          <p className="text-white/40 text-sm">Choose where your contribution goes</p>
        </div>
      </div>

      {/* Contribution % slider */}
      <div className="glass rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white/70 text-sm font-medium">Monthly contribution</p>
          <span className="font-mono font-bold text-brand-400 text-lg">{percent}%</span>
        </div>
        <input
          type="range"
          min={10}
          max={50}
          step={5}
          value={percent}
          onChange={e => setPercent(Number(e.target.value))}
          className="w-full accent-brand-500 h-2 rounded-full"
        />
        <div className="flex justify-between text-white/25 text-xs mt-1.5">
          <span>10% min</span>
          <span>50% max</span>
        </div>
        <p className="text-white/40 text-xs mt-2 text-center">
          ≈ £{((19.99 * percent) / 100).toFixed(2)}/month donated to your charity
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="Search charities..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Charity list */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1 mb-5">
        {filtered.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-8">
            {charities.length === 0 ? 'No charities listed yet. Check back soon.' : 'No results for your search.'}
          </p>
        ) : filtered.map((charity, i) => (
          <motion.div
            key={charity.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => setSelectedId(charity.id)}
            className={`flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all duration-200 border ${
              selectedId === charity.id
                ? 'border-brand-500/50 bg-brand-500/8'
                : 'border-white/5 hover:border-white/15 hover:bg-white/3'
            }`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${
              charity.emoji ? 'bg-white/5' : 'bg-brand-500/15'
            }`}>
              {charity.emoji || <Heart size={16} className="text-brand-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{charity.name}</p>
              {charity.category && <p className="text-white/40 text-xs">{charity.category}</p>}
            </div>
            {selectedId === charity.id && (
              <CheckCircle size={18} className="text-brand-400 flex-shrink-0" />
            )}
          </motion.div>
        ))}
      </div>

      <button onClick={handleSave} disabled={saving || !selectedId} className="btn-primary w-full flex items-center justify-center gap-2">
        {saving ? <span className="w-4 h-4 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" /> : <Heart size={15} />}
        Save Charity Selection
      </button>
    </div>
  );
}
