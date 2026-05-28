/**
 * whatsappTemplates.ts
 *
 * Central file for all WhatsApp message templates.
 * Usage:
 *   import { buildWAUrl, WA_TEMPLATES } from "./whatsappTemplates";
 *   const url = buildWAUrl(phone, WA_TEMPLATES.subscriptionActive(member, plan, expiry));
 *   Linking.openURL(url);
 */

// ─── Helpers ──────────────────────────────────────────────────────────
const safeStr    = (v: any): string => (typeof v === "string" ? v : String(v ?? ""));
const cleanPhone = (phone: any): string => safeStr(phone).replace(/\D/g, "");

/**
 * Build a wa.me deep-link with an optional pre-filled message.
 * @param phone  Raw phone string (digits only extracted automatically)
 * @param message  Plain-text message (will be URI-encoded)
 */
export const buildWAUrl = (phone: any, message?: string): string => {
  const digits = cleanPhone(phone);
  // Prepend country code if not already there (assumes India +91)
  const e164 = digits.startsWith("91") ? digits : `91${digits}`;
  const base  = `https://wa.me/${e164}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
};

// ─── Template definitions ─────────────────────────────────────────────
export const WA_TEMPLATES = {

  /**
   * Sent when a subscription is active — general greeting.
   */
  subscriptionActive: (
    memberName: string,
    planName:   string,
    expiryDate: string,
    gymName     = "our gym"
  ): string =>
    `Hi ${memberName}! 👋

Your *${planName}* subscription at *${gymName}* is currently active and valid until *${expiryDate}*.

If you have any questions or need assistance, feel free to reach out anytime. We're happy to help! 💪

Thank you for being a valued member. 🙏`,

  /**
   * Sent as a reminder before subscription expires.
   */
  renewalReminder: (
    memberName: string,
    planName:   string,
    expiryDate: string,
    gymName     = "our gym"
  ): string =>
    `Hi ${memberName}! ⏰

This is a friendly reminder that your *${planName}* subscription at *${gymName}* is expiring on *${expiryDate}*.

Renew now to continue enjoying uninterrupted access! 🏋️

Reply to this message or visit us to renew. See you at the gym! 💪`,

  /**
   * Sent immediately after renewal is confirmed.
   */
  renewalConfirmed: (
    memberName: string,
    planName:   string,
    newExpiry:  string,
    amountPaid: number | string,
    gymName     = "our gym"
  ): string =>
    `Hi ${memberName}! ✅

Great news! Your *${planName}* subscription at *${gymName}* has been successfully renewed.

📅 *New Expiry:* ${newExpiry}
💰 *Amount Paid:* ₹${amountPaid}

Thank you for your continued trust. Keep crushing it! 🔥`,

  /**
   * Sent when a new subscription is created.
   */
  welcome: (
    memberName: string,
    planName:   string,
    code:       string,
    expiryDate: string,
    gymName     = "our gym"
  ): string =>
    `Welcome to *${gymName}*, ${memberName}! 🎉

Your membership is now active. Here are your details:

🏷️ *Plan:* ${planName}
🔑 *Code:* ${code}
📅 *Valid Until:* ${expiryDate}

We're excited to have you with us! Let's achieve great things together. 💪🏼

For any queries, just reply to this message.`,

  /**
   * Sent when a subscription is cancelled.
   */
  cancellationNotice: (
    memberName: string,
    planName:   string,
    gymName     = "our gym"
  ): string =>
    `Hi ${memberName},

Your *${planName}* subscription at *${gymName}* has been cancelled as requested.

We're sorry to see you go! 😔 If this was a mistake or you'd like to re-subscribe, please visit us or reply to this message.

We hope to see you back soon! 🙏`,

  /**
   * Generic follow-up / check-in message.
   */
  checkIn: (
    memberName: string,
    gymName     = "our gym"
  ): string =>
    `Hi ${memberName}! 😊

Just checking in from *${gymName}*. Hope your fitness journey is going great!

Is there anything we can help you with? We'd love to hear your feedback and support you in reaching your goals. 💪

Reply anytime — we're here for you! 🙌`,
};

// ─── Type export for autocomplete ────────────────────────────────────
export type WATemplateKey = keyof typeof WA_TEMPLATES;