Generate START_PROMPT.md for Cursor AI (welcoming, actionable).
PROJECT: {projectName} | DESCRIPTION: {description} | TEMPLATE: {template}
ARCHITECTURE: {architectureSummary}
FEATURES: {features} | INTEGRATIONS: {integrations}

OUTPUT: Markdown for START_PROMPT.md (no JSON wrapper):

---

# {projectName}

{description}

## Generated
Scaffolded via **Dawson Framework** ({template} template) + AI architecture generation.

### Structure
Pages: {pages} | Components: {components} | API: {api_routes}

### Integrations
{integrations with setup}

## Setup
```bash
cp .env.example .env.local  # Add: {env vars}
npm install && npm run dev  # Open http://localhost:3000
```

## Implementation
TODO comments mark key areas. Priority:
1. **Logic**: {pages/components} core functionality + data fetching + API endpoints
2. **Data**: schema for {key entities} → migrations → data access layer
3. **Integrations**: {integration-specific setup}
4. **UI**: brand customization + loading/error states + responsive

### Structure
app/ (pages+api) | components/ (custom+ui) | lib/ (utils) | types/ | public/

### Docs
{integrations}: Setup→[link] | API→[link] | Example→`app/api/...`

## Workflow
1. Data models → 2. API routes → 3. UI components → 4. Integrations → 5. Testing → 6. Deploy (`framework deploy` or Vercel)

## Commands
`npm run dev` (start) | `npm run build` (production) | `npm run lint` (code quality) | `npm test` (testing)

## Resources
[Dawson Docs](https://docs.dawson.dev) | [Next.js 15](https://nextjs.org/docs) | templates/{template}/README.md | integrations/*/README.md

## Help
Check .cursorrules | TODO comments | template examples | integration docs

## Next Prompt
"Implement {most important feature}: data models for {key entities} → API endpoints → UI components. Include error handling + TypeScript types."

---
🚀
