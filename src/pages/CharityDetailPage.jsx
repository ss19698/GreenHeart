import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Calendar, ExternalLink, Loader } from 'lucide-react';
import { getCharity } from '../lib/firestore';
import Layout from '../components/ui/Layout';

export default function CharityDetailPage() {
  const { id } = useParams();
  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCharity(id).then(c => { setCharity(c); setLoading(false); });
  }, [id]);

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen">
        <Loader size={32} className="text-brand-500 animate-spin" />
      </div>
    </Layout>
  );

  if (!charity) return (
    <Layout>
      <div className="page-container py-20 text-center">
        <p className="text-white/40">Charity not found.</p>
        <Link to="/charities" className="btn-primary mt-4 inline-flex">Back to Charities</Link>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="py-16">
        <div className="page-container max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link to="/charities" className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors w-fit">
              <ArrowLeft size={15} /> Back to Charities
            </Link>

            <div className="card mb-8">
              <div className="flex items-start gap-5 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-4xl flex-shrink-0">
                  {charity.emoji || '💚'}
                </div>
                <div>
                  <h1 className="font-display text-3xl font-bold text-white mb-1">{charity.name}</h1>
                  <div className="flex items-center gap-2 flex-wrap">
                    {charity.category && <span className="badge-green">{charity.category}</span>}
                    {charity.featured && <span className="badge-gold">Featured Partner</span>}
                  </div>
                </div>
              </div>

              <p className="text-white/60 leading-relaxed mb-6">{charity.description}</p>

              {charity.website && (
                <a href={charity.website} target="_blank" rel="noopener noreferrer"
                  className="btn-secondary inline-flex items-center gap-2 text-sm">
                  Visit Website <ExternalLink size={14} />
                </a>
              )}
            </div>

            {/* Stats */}
            {charity.totalReceived > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="card text-center">
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Total Raised</p>
                  <p className="font-display text-2xl font-bold gradient-text">£{charity.totalReceived?.toLocaleString()}</p>
                  <p className="text-white/30 text-xs mt-0.5">via GreenHeart subscribers</p>
                </div>
                <div className="card text-center">
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Supporters</p>
                  <p className="font-display text-2xl font-bold text-white">{charity.supporterCount || 0}</p>
                  <p className="text-white/30 text-xs mt-0.5">active contributors</p>
                </div>
              </div>
            )}

            {/* Events */}
            {charity.events && charity.events.length > 0 && (
              <div className="card">
                <h3 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Calendar size={16} className="text-brand-400" />
                  Upcoming Events
                </h3>
                <div className="space-y-3">
                  {charity.events.map((event, i) => (
                    <div key={i} className="glass rounded-xl p-4 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400 flex-shrink-0">
                        <Calendar size={16} />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{event.name}</p>
                        <p className="text-white/40 text-xs mt-0.5">{event.date} · {event.location}</p>
                        {event.description && <p className="text-white/40 text-xs mt-1">{event.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 text-center">
              <p className="text-white/40 text-sm mb-4">Want to support {charity.name}?</p>
              <Link to="/subscribe" className="btn-primary inline-flex items-center gap-2">
                <Heart size={15} />
                Subscribe & Choose This Charity
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
