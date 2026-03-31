
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

const PLAN_AMOUNTS = {
  monthly: { amount: 1999 * 100, currency: "INR", description: "GolfGives Monthly Plan" },
  yearly: { amount: 19190 * 100, currency: "INR", description: "GolfGives Yearly Plan" },
};

// Load Razorpay checkout script dynamically
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Open Razorpay Checkout
 *
 * @param {Object} opts
 * @param {'monthly'|'yearly'} opts.plan
 * @param {string} opts.userEmail
 * @param {string} opts.userName
 * @param {string} opts.userId
 * @param {Function} opts.onSuccess  - called with { razorpay_payment_id, razorpay_order_id, razorpay_signature }
 * @param {Function} opts.onFailure  - called with error message
 */
export async function openRazorpayCheckout({ plan, userEmail, userName, userId, onSuccess, onFailure }) {
  const loaded = await loadRazorpayScript();
  if (!loaded) { onFailure('Failed to load payment gateway. Check your connection.'); return; }

  if (!RAZORPAY_KEY_ID) {
    onFailure('Razorpay key not configured. Add VITE_RAZORPAY_KEY_ID to .env.local');
    return;
  }

  const planConfig = PLAN_AMOUNTS[plan];
  if (!planConfig) { onFailure('Invalid plan selected.'); return; }

  const options = {
    key: RAZORPAY_KEY_ID,                  
    amount: planConfig.amount,              
    currency: planConfig.currency,
    name: 'GolfGives',
    description: planConfig.description,            

    handler: function (response) {
      response = { razorpay_payment_id, razorpay_order_id, razorpay_signature }
      onSuccess(response);
    },

    prefill: {
      name: userName || '',
      email: userEmail || '',
      contact: '',
    },

    notes: {
      userId,
      plan,
      platform: 'GolfGives',
    },

    theme: {
      color: '#22c55e',  
    },

    modal: {
      ondismiss: function () {
        onFailure('Payment cancelled by user.');
      },
    },
  };

  const rzp = new window.Razorpay(options);

  rzp.on('payment.failed', function (response) {
    onFailure(response.error?.description || 'Payment failed. Please try again.');
  });

  rzp.open();
}

export { PLAN_AMOUNTS };
