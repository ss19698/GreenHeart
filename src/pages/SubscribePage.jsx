import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Star, ArrowRight, Shield, CreditCard, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { activateSubscription, createOrder, updateOrder } from '../lib/firestore';
import { openRazorpayCheckout } from '../lib/razorpay';
import { sendSubscriptionEmail } from '../lib/email';
import toast from 'react-hot-toast';
import Layout from '../components/ui/Layout';

const plans = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '₹1,999',
    priceNum: 1999,
    period: '/month',
    description: 'Flexible month-to-month',
    badge: null,
    perks: [
      'Full draw entry every month',
      'Choose your charity',
      'Score tracking dashboard',
      'Winner verification access',
      'Monthly prize pool share',
    ],
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: '₹19,190',
    priceNum: 19190,
    period: '/year',
    description: 'Save 20% — best value',
    badge: 'Best Value',
    perks: [
      'Everything in Monthly',
      '20% savings vs monthly',
      'Priority winner processing',
      'Early draw result access',
      'Exclusive yearly subscriber badge',
      'Double charity contribution option',
    ],
  },
];

export default function SubscribePage() {
  const { currentUser, userProfile, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState('yearly');
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    if (!currentUser) { navigate('/signup'); return; }
    setLoading(true);

    // Create a local order record first
    let orderId = null;
    try {
      orderId = await createOrder(currentUser.uid, {
        plan: selected,
        amount: plans.find(p => p.id === selected)?.priceNum || 1999,
        currency: 'INR',
      });
    } catch { /* non-critical */ }

    openRazorpayCheckout({
      plan: selected,
      userEmail: currentUser.email,
      userName: currentUser.displayName,
      userId: currentUser.uid,

      onSuccess: async (paymentResponse) => {
        try {
          // Update order record
          if (orderId) {
            await updateOrder(orderId, {
              status: 'paid',
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              razorpayOrderId: paymentResponse.razorpay_order_id || null,
              paidAt: new Date().toISOString(),
            });
          }
          // Activate subscription in Firestore
          await activateSubscription(currentUser.uid, selected, paymentResponse.razorpay_payment_id);
          // Send confirmation email
          await sendSubscriptionEmail(currentUser, selected);
          await refreshUserProfile();
          toast.success('Subscription activated! Welcome to GolfGives 🎉');
          navigate('/dashboard');
        } catch (err) {
          toast.error('Payment succeeded but activation failed — contact support.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      },

      onFailure: (msg) => {
        if (!msg.includes('cancelled')) toast.error(msg);
        setLoading(false);
      },
    });
  }

  const selectedPlan = plans.find(p => p.id === selected);

  return (
    <Layout>
      <div className="min-h-screen py-20">
        <div className="absolute inset-0 bg-gradient-radial from-brand-900/10 to-transparent pointer-events-none" />
        <div className="page-container relative">

          {/* Header */}
          <div className="text-center mb-16">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-brand-400 text-sm font-semibold tracking-widest uppercase mb-3">Subscribe</motion.p>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Choose your plan</motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="text-white/40 max-w-lg mx-auto">
              Every plan includes full draw entry, charity contributions, and your performance dashboard.
            </motion.p>
          </div>

          {/* Test mode banner */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="max-w-3xl mx-auto mb-8 flex items-center gap-3 glass rounded-xl p-4 border border-amber-500/20 bg-amber-500/5">
            <Zap size={16} className="text-amber-400 flex-shrink-0" />
            <p className="text-amber-300 text-sm">
              <strong>Test Mode Active.</strong> Use Razorpay test card: <code className="font-mono bg-white/10 px-1 rounded">4111 1111 1111 1111</code>, any future expiry, any CVV.
            </p>
          </motion.div>

          {/* Plans */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">
            {plans.map((plan, i) => (
              <motion.div key={plan.id}
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 + 0.2 }}
                onClick={() => setSelected(plan.id)}
                className={`relative rounded-2xl p-6 cursor-pointer transition-all duration-300 border-2 ${
                  selected === plan.id
                    ? 'border-brand-500 bg-brand-500/5 shadow-lg shadow-brand-500/10'
                    : 'border-white/10 bg-white/3 hover:border-white/20'
                }`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="badge-gold text-xs px-3 py-1 flex items-center gap-1">
                      <Star size={10} />{plan.badge}
                    </span>
                  </div>
                )}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">{plan.name}</h3>
                    <p className="text-white/40 text-sm mt-0.5">{plan.description}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    selected === plan.id ? 'border-brand-500 bg-brand-500' : 'border-white/30'
                  }`}>
                    {selected === plan.id && <Check size={12} className="text-dark-900" />}
                  </div>
                </div>
                <div className="mb-6">
                  <span className="font-display text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-white/40 text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-2.5">
                  {plan.perks.map(perk => (
                    <li key={perk} className="flex items-center gap-2.5 text-sm text-white/70">
                      <Check size={14} className="text-brand-500 flex-shrink-0" />{perk}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="flex flex-col items-center gap-4">
            <button onClick={handleSubscribe} disabled={loading}
              className="btn-primary text-lg px-12 py-4 rounded-2xl flex items-center gap-2 shadow-lg shadow-brand-500/30">
              {loading ? (
                <span className="w-5 h-5 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
              ) : (
                <>
                  <CreditCard size={20} />
                  {currentUser ? `Pay ${selectedPlan?.price} via Razorpay` : 'Get Started'}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
            <div className="flex items-center gap-6 text-white/30 text-xs">
              <span className="flex items-center gap-1.5"><Shield size={12} /> PCI-compliant</span>
              <span>Cancel anytime</span>
              <span>Powered by Razorpay</span>
            </div>
          </motion.div>

          {/* Prize pool breakdown */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="mt-20 max-w-2xl mx-auto">
            <h3 className="font-display text-xl font-bold text-white text-center mb-6">Prize Pool Distribution</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: '5-Match Jackpot', share: '40%', color: 'gold', rollover: true },
                { label: '4-Match Prize', share: '35%', color: 'brand' },
                { label: '3-Match Prize', share: '25%', color: 'brand' },
              ].map(tier => (
                <div key={tier.label} className={`card text-center ${tier.color === 'gold' ? 'border-gold-500/20' : ''}`}>
                  <div className={`font-display text-3xl font-bold mb-1 ${tier.color === 'gold' ? 'gold-gradient-text' : 'gradient-text'}`}>
                    {tier.share}
                  </div>
                  <p className="text-white/60 text-xs">{tier.label}</p>
                  {tier.rollover && <p className="text-gold-400 text-xs mt-1">Rolls over if unclaimed</p>}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
