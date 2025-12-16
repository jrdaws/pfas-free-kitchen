/**
 * Google integration (OAuth + Gmail API) - OPTIONAL
 * App code should call this module, not googleapis directly.
 */
export function googleEnabled(env: NodeJS.ProcessEnv = process.env) {
  return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REDIRECT_URI);
}
