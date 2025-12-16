/**
 * Meta integration (OAuth + Graph API) - OPTIONAL
 */
export function metaEnabled(env: NodeJS.ProcessEnv = process.env) {
  return Boolean(env.META_APP_ID && env.META_APP_SECRET && env.META_REDIRECT_URI);
}
