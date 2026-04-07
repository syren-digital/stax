import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

export const stripe = key
  ? new Stripe(key, { apiVersion: "2026-03-25.dahlia", typescript: true })
  : null;

export const STRIPE_PRICE_IDS = {
  starter: process.env.STRIPE_PRICE_ID_STARTER ?? "",
  growth: process.env.STRIPE_PRICE_ID_GROWTH ?? "",
  pro: process.env.STRIPE_PRICE_ID_PRO ?? "",
} as const;

export type SubscriptionTierKey = keyof typeof STRIPE_PRICE_IDS;
