import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

export const env = createEnv({
  // Skip validation during `next build` so missing vars don't crash the build.
  // Set SKIP_ENV_VALIDATION=1 in Vercel → Settings → Environment Variables
  // (Build environment only) as a fallback. All required vars still validated
  // at runtime on first request.
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  server: {
    DATABASE_URL: z.url(),
    REDIS_URL: z.url(),
    // Optional: absent or "placeholder" falls back to mock data
    EODHD_API_KEY: z.string().min(1).optional(),
    // Optional: Clerk keyless mode manages these internally without env vars
    CLERK_SECRET_KEY: z.string().min(1).optional(),
    // Optional until billing is wired up
    STRIPE_SECRET_KEY: z.string().min(1).optional(),
    STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  },
  client: {
    // Optional: Clerk keyless mode manages these internally without env vars
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_APP_URL: z.url().optional(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    EODHD_API_KEY: process.env.EODHD_API_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
});
