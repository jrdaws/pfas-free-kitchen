How to add a provider

1) Create a provider implementation file in:
- src/platform/providers/impl/<kind>.<name>.ts

2) Export default:
- { name: string, health(): Promise<{status:"ok"|"warn"|"error", details?:string}> }

3) Run:
- npm run health

Notes:
- Keep provider SDK imports inside the impl file only.
- App code must import only interfaces, never vendor SDKs.
