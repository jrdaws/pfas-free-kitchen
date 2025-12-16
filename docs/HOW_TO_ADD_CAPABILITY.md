How to add a capability

1) Add a row to:
- scripts/orchestrator/capabilities.json

Required fields:
- id, phrase, command, tier, optional, color, requiresEnv, paths[]

2) Regenerate:
- npm run framework:map

3) Confirm entitlements:
- node scripts/orchestrator/entitlements-test.mjs . "<capabilityId>"
