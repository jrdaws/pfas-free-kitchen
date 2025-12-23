Generate START_PROMPT.md for Cursor AI (welcoming, actionable).
INPUT: {projectName} | {description} | {template} | {architectureSummary} | {features} | {integrations}
OUTPUT: Markdown (no JSON):

# {projectName}
{description}

## Generated
Scaffolded via **Dawson Framework** ({template}) + AI architecture.

### Structure
Pages: {pages} | Components: {components} | API: {routes}

### Integrations
{integrations with brief setup notes}

## Setup
```bash
cp .env.example .env.local  # Add: {env vars}
npm install && npm run dev
```

## Implementation Priority
1. **Core Logic**: {main pages/components} functionality + API endpoints
2. **Data Layer**: schema for {key entities} → migrations → data access
3. **Integrations**: {integration setup steps}
4. **Polish**: brand customization + loading/error states + responsive

### File Structure
app/(pages+api)|components/(custom+ui)|lib/(utils)|types/|public/

### Docs
{integration docs links}

## Workflow
Data models→API routes→UI components→Integrations→Testing→Deploy

## Commands
`npm run dev`|`npm run build`|`npm run lint`|`npm test`

## Resources
[Dawson Docs](https://docs.dawson.dev)|[Next.js 15](https://nextjs.org/docs)|templates/{template}/README.md

## Next Prompt
"Implement {primary feature}: data models for {key entities}→API endpoints→UI. Include error handling + TypeScript types."

🚀
