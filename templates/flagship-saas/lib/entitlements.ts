/**
 * Entitlements System
 *
 * Role-based capability checks for feature access control.
 * In a real app, this would check against user roles and plan tiers.
 */

export type Capability =
  | 'analytics'
  | 'export'
  | 'api'
  | 'customDomain'
  | 'whiteLabel'
  | 'advancedReporting'
  | 'prioritySupport'
  | 'customIntegrations';

export type UserRole = 'free' | 'pro' | 'enterprise';
export type PlanTier = 'free' | 'pro' | 'enterprise';

interface User {
  id: string;
  email: string;
  role: UserRole;
  plan: PlanTier;
}

// Mock current user - in real app, this would come from auth context
const getCurrentUser = (): User => {
  return {
    id: 'user-123',
    email: 'admin@example.com',
    role: 'pro',
    plan: 'pro'
  };
};

// Capability matrix: which plans have which capabilities
const capabilityMatrix: Record<Capability, PlanTier[]> = {
  analytics: ['free', 'pro', 'enterprise'],
  export: ['pro', 'enterprise'],
  api: ['pro', 'enterprise'],
  customDomain: ['enterprise'],
  whiteLabel: ['enterprise'],
  advancedReporting: ['pro', 'enterprise'],
  prioritySupport: ['pro', 'enterprise'],
  customIntegrations: ['enterprise']
};

/**
 * Check if the current user has access to a specific capability
 *
 * @example
 * ```ts
 * if (can('export')) {
 *   // Show export button
 * }
 * ```
 */
export function can(capability: Capability): boolean {
  const user = getCurrentUser();
  const allowedPlans = capabilityMatrix[capability];

  if (!allowedPlans) {
    console.warn(`Unknown capability: ${capability}`);
    return false;
  }

  return allowedPlans.includes(user.plan);
}

/**
 * Check multiple capabilities at once
 */
export function canAll(...capabilities: Capability[]): boolean {
  return capabilities.every(cap => can(cap));
}

/**
 * Check if user has any of the given capabilities
 */
export function canAny(...capabilities: Capability[]): boolean {
  return capabilities.some(cap => can(cap));
}

/**
 * Get all capabilities available to current user
 */
export function getAvailableCapabilities(): Capability[] {
  const user = getCurrentUser();
  return Object.entries(capabilityMatrix)
    .filter(([_, plans]) => plans.includes(user.plan))
    .map(([capability]) => capability as Capability);
}

/**
 * Require a capability - throws error if not available
 * Useful for protecting API routes
 */
export function requireCapability(capability: Capability): void {
  if (!can(capability)) {
    throw new Error(`Access denied: ${capability} capability required`);
  }
}
