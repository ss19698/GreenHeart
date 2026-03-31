import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Heart, ExternalLink, Star, Loader } from 'lucide-react';
import { getCharities } from '../lib/firestore';
import Layout from '../components/ui/Layout';

const CATEGORIES = ['All', 'Health', 'Education', 'Environment', 'Community', 'Sports', 'Animals', 'Children'];

export default function CharitiesPage() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    getCharities().then(c => { setCharities(c); setLoading(false); });
  }, []);

  const filtered = charities.filter(c => {
    const matchSearch = c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || c.category === activeCategory;
    return matchSearch && matchCat;
  });

  const featured = charities.filter(c => c.featured);

  return (
    <Layout>
      <div className="py-16">
        <div className="absolute inset-0 bg-gradient-radial from-brand-900/8 to-transparent pointer-events-none" />
        <div className="page-container relative">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <p className="text-brand-400 text-sm font-semibold tracking-widest uppercase mb-3">Our Partners</p>
            <h1 className="section-title mb-4">Charities We Support</h1>
            <p className="text-white/40 max-w-xl mx-auto">
              Every subscriber chooses where their contribution goes. Explore our verified charity partners and find the cause that matters most to you.
            </p>
          </motion.div>

          {/* Featured */}
          {featured.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center gap-2 mb-6">
                <Star size={16} className="text-gold-400" />
                <h2 className="font-display text-xl font-bold text-white">Featured Charity</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {featured.slice(0, 2).map((charity, i) => (
                  <motion.div key={charity.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <Link to={`/charities/${charity.id}`}
                      className="card-hover group relative overflow-hidden border-gold-500/15 block">
                      <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 to-transparent" />
                      <div className="relative">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-14 h-14 rounded-2xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                            {charity.emoji || '❤️'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-display text-lg font-bold text-white">{charity.name}</h3>
                              <span className="badge-gold text-xs"><Star size={9} /> Featured</span>
                            </div>
                            {charity.category && <span className="badge-green text-xs">{charity.category}</span>}
                          </div>
                        </div>
                        <p className="text-white/50 text-sm leading-relaxed line-clamp-2">{charity.description}</p>
                        <div className="flex items-center gap-2 mt-4 text-brand-400 text-sm font-medium group-hover:gap-3 transition-all">
                          Learn more <ExternalLink size={13} />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Search & filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="Search charities..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                    activeCategory === cat
                      ? 'bg-brand-500 text-dark-900'
                      : 'glass hover:border-white/20 text-white/60 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader size={32} className="text-brand-500 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Heart size={40} className="text-white/10 mx-auto mb-3" />
              <p className="text-white/40">
                {charities.length === 0 ? 'No charities added yet.' : 'No charities match your search.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((charity, i) => (
                <motion.div key={charity.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link to={`/charities/${charity.id}`} className="card-hover group block h-full">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/15 flex items-center justify-center text-xl flex-shrink-0">
                        {charity.emoji || '💚'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white group-hover:text-brand-300 transition-colors">{charity.name}</h3>
                        {charity.category && <span className="text-white/40 text-xs">{charity.category}</span>}
                      </div>
                    </div>
                    <p className="text-white/40 text-sm leading-relaxed line-clamp-3">{charity.description}</p>
                    {charity.totalReceived > 0 && (
                      <p className="text-brand-400 text-xs font-medium mt-3">
                        £{charity.totalReceived.toLocaleString()} raised through GreenHeart
                      </p>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
