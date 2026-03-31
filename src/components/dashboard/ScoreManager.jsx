import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, Check, X, Calendar, Target } from 'lucide-react';
import { addScore, updateScore, deleteScore } from '../../lib/firestore';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

function ScoreColor(score) {
  if (score >= 36) return 'border-gold-500 text-gold-400 bg-gold-500/10';
  if (score >= 28) return 'border-brand-500 text-brand-400 bg-brand-500/10';
  if (score >= 18) return 'border-blue-500 text-blue-400 bg-blue-500/10';
  return 'border-white/20 text-white/50 bg-white/5';
}

function ScoreLabel(score) {
  if (score >= 36) return 'Excellent';
  if (score >= 28) return 'Good';
  if (score >= 18) return 'Average';
  return 'Below par';
}

export default function ScoreManager({ scores = [], onRefresh }) {
  const { currentUser } = useAuth();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { register: editReg, handleSubmit: editSubmit, setValue, formState: { errors: editErrors } } = useForm();

  async function onAdd({ score, date }) {
    setLoadingId('add');
    try {
      await addScore(currentUser.uid, { score: Number(score), date });
      toast.success('Score added');
      reset();
      setAdding(false);
      onRefresh();
    } catch {
      toast.error('Failed to add score');
    } finally {
      setLoadingId(null);
    }
  }

  async function onEdit(scoreId, { score, date }) {
    setLoadingId(scoreId);
    try {
      await updateScore(currentUser.uid, scoreId, { score: Number(score), date });
      toast.success('Score updated');
      setEditingId(null);
      onRefresh();
    } catch {
      toast.error('Failed to update score');
    } finally {
      setLoadingId(null);
    }
  }

  async function onDelete(scoreId) {
    if (!confirm('Delete this score?')) return;
    setLoadingId(scoreId);
    try {
      await deleteScore(currentUser.uid, scoreId);
      toast.success('Score removed');
      onRefresh();
    } catch {
      toast.error('Failed to delete score');
    } finally {
      setLoadingId(null);
    }
  }

  function startEdit(s) {
    setEditingId(s.id);
    setValue('score', s.score);
    setValue('date', s.date);
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-bold text-white">My Scores</h2>
          <p className="text-white/40 text-sm mt-0.5">
            {scores.length}/5 scores entered
            {scores.length === 5 && ' · Adding a new score removes the oldest'}
          </p>
        </div>
        <button
          onClick={() => { setAdding(!adding); reset(); }}
          className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 ${
            adding ? 'bg-white/10 text-white/60' : 'btn-primary py-2'
          }`}
        >
          {adding ? <X size={15} /> : <Plus size={15} />}
          {adding ? 'Cancel' : 'Add Score'}
        </button>
      </div>

      {/* Add score form */}
      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-5 overflow-hidden"
          >
            <form onSubmit={handleSubmit(onAdd)} className="glass rounded-xl p-4 flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="text-white/50 text-xs mb-1.5 block">Stableford Score (1–45)</label>
                <input
                  {...register('score', {
                    required: 'Score required',
                    min: { value: 1, message: 'Min 1' },
                    max: { value: 45, message: 'Max 45' },
                  })}
                  type="number"
                  placeholder="e.g. 32"
                  className="input-field"
                />
                {errors.score && <p className="text-red-400 text-xs mt-1">{errors.score.message}</p>}
              </div>
              <div className="flex-1">
                <label className="text-white/50 text-xs mb-1.5 block">Date Played</label>
                <input
                  {...register('date', { required: 'Date required' })}
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  className="input-field"
                />
                {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date.message}</p>}
              </div>
              <div className="flex items-end">
                <button type="submit" disabled={loadingId === 'add'} className="btn-primary py-3 px-5 flex items-center gap-2">
                  {loadingId === 'add'
                    ? <span className="w-4 h-4 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
                    : <Check size={16} />}
                  Save
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Score list */}
      {scores.length === 0 ? (
        <div className="text-center py-12">
          <Target size={40} className="text-white/10 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No scores yet. Add your first Stableford score to enter draws.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {scores.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: i * 0.05 }}
              >
                {editingId === s.id ? (
                  <form onSubmit={editSubmit((data) => onEdit(s.id, data))}
                    className="glass rounded-xl p-4 flex flex-col sm:flex-row gap-3 border border-brand-500/30">
                    <div className="flex-1">
                      <input
                        {...editReg('score', { required: true, min: 1, max: 45 })}
                        type="number"
                        className="input-field"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        {...editReg('date', { required: true })}
                        type="date"
                        max={new Date().toISOString().split('T')[0]}
                        className="input-field"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="submit" disabled={loadingId === s.id} className="btn-primary py-2.5 px-4">
                        {loadingId === s.id
                          ? <span className="w-4 h-4 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
                          : <Check size={15} />}
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} className="btn-secondary py-2.5 px-4">
                        <X size={15} />
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="glass rounded-xl p-4 flex items-center gap-4 group hover:border-white/15 transition-all">
                    <div className={`score-pill ${ScoreColor(s.score)} flex-shrink-0`}>
                      {s.score}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${ScoreColor(s.score).split(' ')[1]}`}>
                          {ScoreLabel(s.score)}
                        </span>
                        {i === 0 && <span className="badge-green text-xs">Latest</span>}
                      </div>
                      <div className="flex items-center gap-1.5 text-white/40 text-xs mt-0.5">
                        <Calendar size={11} />
                        {s.date ? format(new Date(s.date), 'dd MMM yyyy') : 'No date'}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(s)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => onDelete(s.id)} disabled={loadingId === s.id}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all">
                        {loadingId === s.id
                          ? <span className="w-3 h-3 border border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                          : <Trash2 size={13} />}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {scores.length > 0 && (
        <div className="mt-6 pt-4 divider grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-white/40 text-xs mb-0.5">Highest</p>
            <p className="text-brand-400 font-mono font-bold">{Math.max(...scores.map(s => s.score))}</p>
          </div>
          <div className="text-center">
            <p className="text-white/40 text-xs mb-0.5">Average</p>
            <p className="text-white font-mono font-bold">
              {(scores.reduce((a, s) => a + s.score, 0) / scores.length).toFixed(1)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-white/40 text-xs mb-0.5">Lowest</p>
            <p className="text-white/60 font-mono font-bold">{Math.min(...scores.map(s => s.score))}</p>
          </div>
        </div>
      )}
    </div>
  );
}
