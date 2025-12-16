/**
 * Apple Sign In - OPTIONAL
 */
export function appleEnabled(env: NodeJS.ProcessEnv = process.env) {
  return Boolean(env.APPLE_TEAM_ID && env.APPLE_CLIENT_ID && env.APPLE_KEY_ID && env.APPLE_PRIVATE_KEY_P8 && env.APPLE_REDIRECT_URI);
}
