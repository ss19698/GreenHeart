import emailjs from "@emailjs/browser";
import { logEmail } from "./firestore";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const TEMPLATES = {
  welcome: import.meta.env.VITE_EMAILJS_TPL_WELCOME,
  subscriptionActive: import.meta.env.VITE_EMAILJS_TPL_SUB,
};

async function sendEmail(templateId, params, userId = null, type = "unknown") {
  try {
    await emailjs.send(
      SERVICE_ID,
      templateId,
      params,
      PUBLIC_KEY
    );

    console.log("Email sent:", type);

    if (userId) {
      await logEmail(userId, type, {
        to: params.to_email,
        subject: params.subject || type,
      });
    }

  } catch (err) {
    console.error("Email failed:", err);
  }
}

// Welcome Email
export async function sendWelcomeEmail(uid, email, displayName) {
  await sendEmail(
    TEMPLATES.welcome,
    {
      to_email: email,
      to_name: displayName || "Golfer",
    },
    uid,
    "welcome"
  );
}

// Subscription Email
export async function sendSubscriptionEmail(user, plan) {
  await sendEmail(
    TEMPLATES.subscriptionActive,
    {
      to_email: user.email,
      to_name: user.displayName || "Golfer",
      plan_name: plan,
    },
    user.uid,
    "subscription_active"
  );
}