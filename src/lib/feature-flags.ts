/**
 * Lightweight feature flags driven by environment variables.
 *
 * ● Local dev / demo:  set NEXT_PUBLIC_ENABLE_REGISTRATION=true  in .env.local
 * ● Production V1:     set NEXT_PUBLIC_ENABLE_REGISTRATION=false in Vercel env
 *
 * When your privacy policy is ready, flip the Vercel variable to "true" and
 * redeploy — registration goes live with zero code changes.
 */

export const REGISTRATION_ENABLED =
    process.env.NEXT_PUBLIC_ENABLE_REGISTRATION !== "false";
