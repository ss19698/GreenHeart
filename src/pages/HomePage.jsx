import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Heart, Trophy, Target, ArrowRight, Star, Users, TrendingUp, Zap, CheckCircle } from 'lucide-react';
import Layout from '../components/ui/Layout';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }
  }),
};

function AnimatedSection({ children, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} className={className}>
      {children}
    </motion.div>
  );
}

const stats = [
  { value: '£28,000+', label: 'Donated to charities', icon: Heart },
  { value: '1,240', label: 'Active subscribers', icon: Users },
  { value: '94', label: 'Monthly winners', icon: Trophy },
  { value: '38', label: 'Partner charities', icon: Star },
];

const steps = [
  {
    num: '01',
    title: 'Subscribe',
    desc: 'Choose a monthly or yearly plan. A portion of every payment goes directly to your chosen charity.',
    color: 'brand',
  },
  {
    num: '02',
    title: 'Enter Your Scores',
    desc: 'Log your last 5 Stableford golf scores. These are your draw tickets — the better you play, the better your odds.',
    color: 'gold',
  },
  {
    num: '03',
    title: 'Enter the Draw',
    desc: 'Every month we run a live draw. 5-match wins the jackpot. 4-match and 3-match tiers also win big.',
    color: 'brand',
  },
  {
    num: '04',
    title: 'Change Lives',
    desc: 'Whether you win or not, your subscription funds real charitable projects every single month.',
    color: 'gold',
  },
];

const features = [
  {
    icon: Target,
    title: 'Score-Based Draw Entries',
    desc: 'Your golf scores directly power your draw entries. Every Stableford point matters.',
  },
  {
    icon: Heart,
    title: 'Charity of Your Choice',
    desc: 'Pick from dozens of verified charities. You decide exactly where your contribution goes.',
  },
  {
    icon: Trophy,
    title: 'Monthly Prize Pool',
    desc: 'Three prize tiers — jackpot rolls over if unclaimed, building until someone wins big.',
  },
  {
    icon: Zap,
    title: 'Instant Results',
    desc: 'Draw results published monthly with full transparency on winning numbers and payouts.',
  },
  {
    icon: TrendingUp,
    title: 'Track Your Impact',
    desc: 'Your personal dashboard shows your charitable contribution growing every month.',
  },
  {
    icon: CheckCircle,
    title: 'Verified Payouts',
    desc: 'Winner verification ensures every prize is paid to a real, confirmed golfer.',
  },
];

export default function HomePage() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-brand-500/5 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-brand-700/8 blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-brand-900/10 blur-[150px]" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.015]"
            style={{ backgroundImage: 'linear-gradient(rgba(34,197,94,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
          />
        </div>

        <div className="page-container relative z-10 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              custom={0} variants={fadeUp} initial="hidden" animate="visible"
              className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-brand-400 mb-8 border border-brand-500/20"
            >
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              Next draw in 14 days · £12,400 jackpot
            </motion.div>

            <motion.h1
              custom={1} variants={fadeUp} initial="hidden" animate="visible"
              className="font-display text-5xl md:text-7xl font-bold leading-[1.08] mb-6 text-balance"
            >
              Golf that{' '}
              <span className="italic">actually</span>
              <br />
              <span className="gradient-text">changes lives.</span>
            </motion.h1>

            <motion.p
              custom={2} variants={fadeUp} initial="hidden" animate="visible"
              className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Subscribe, enter your scores, win monthly prizes — and send a real contribution to the charity you care about most. Every month, automatically.
            </motion.p>

            <motion.div
              custom={3} variants={fadeUp} initial="hidden" animate="visible"
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/subscribe" className="btn-primary text-base px-8 py-4 flex items-center gap-2 glow-green rounded-2xl">
                Start for £19.99/mo
                <ArrowRight size={18} />
              </Link>
              <Link to="/draws" className="btn-secondary text-base px-8 py-4 rounded-2xl">
                View latest draw
              </Link>
            </motion.div>

            <motion.p
              custom={4} variants={fadeUp} initial="hidden" animate="visible"
              className="text-white/30 text-sm mt-5"
            >
              Cancel anytime · Yearly plan saves 20% · PCI-compliant payments
            </motion.p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-2 bg-brand-500 rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-12 border-y border-white/5">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <AnimatedSection key={stat.label}>
                <motion.div custom={i} variants={fadeUp} className="text-center">
                  <div className="font-display text-3xl md:text-4xl font-bold gradient-text mb-1">
                    {stat.value}
                  </div>
                  <div className="text-white/40 text-sm">{stat.label}</div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24">
        <div className="page-container">
          <AnimatedSection className="text-center mb-16">
            <motion.div variants={fadeUp}>
              <p className="text-brand-400 text-sm font-semibold tracking-widest uppercase mb-3">How It Works</p>
              <h2 className="section-title mb-4">Four steps.<br />Unlimited impact.</h2>
              <p className="text-white/40 max-w-xl mx-auto">From your first score entry to seeing your charity donation grow — here's the whole journey.</p>
            </motion.div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <AnimatedSection key={step.num}>
                <motion.div custom={i} variants={fadeUp} className="card hover:border-white/15 group h-full">
                  <div className={`font-mono text-4xl font-bold mb-4 ${step.color === 'gold' ? 'gold-gradient-text' : 'gradient-text'}`}>
                    {step.num}
                  </div>
                  <h3 className="font-display text-xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{step.desc}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-radial from-brand-900/10 to-transparent pointer-events-none" />
        <div className="page-container relative">
          <AnimatedSection className="text-center mb-16">
            <motion.div variants={fadeUp}>
              <p className="text-brand-400 text-sm font-semibold tracking-widest uppercase mb-3">Features</p>
              <h2 className="section-title">Everything you need.<br /><span className="italic font-normal text-white/60">Nothing you don't.</span></h2>
            </motion.div>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feat, i) => (
              <AnimatedSection key={feat.title}>
                <motion.div custom={i % 3} variants={fadeUp} className="card-hover group">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center mb-4 group-hover:bg-brand-500/25 group-hover:border-brand-500/40 transition-all duration-200">
                    <feat.icon size={18} className="text-brand-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{feat.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{feat.desc}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="page-container">
          <AnimatedSection>
            <motion.div variants={fadeUp}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900/60 to-dark-600 border border-brand-500/20 p-12 md:p-16 text-center glow-green"
            >
              <div className="absolute inset-0 bg-gradient-radial from-brand-500/10 to-transparent" />
              <div className="relative">
                <Heart size={40} className="text-brand-500 fill-brand-500/30 mx-auto mb-6" />
                <h2 className="section-title mb-4">
                  Ready to play for<br />
                  <span className="gold-gradient-text">something that matters?</span>
                </h2>
                <p className="text-white/50 mb-8 max-w-lg mx-auto">
                  Join over 1,200 golfers who turn their weekend rounds into charitable impact — and monthly prize shots.
                </p>
                <Link to="/subscribe" className="btn-primary text-lg px-10 py-4 rounded-2xl inline-flex items-center gap-2">
                  Subscribe Now
                  <ArrowRight size={20} />
                </Link>
              </div>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}
