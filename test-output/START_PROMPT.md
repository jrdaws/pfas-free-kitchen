# TodoApp
A simple todo list application where users can create, edit, and delete tasks. Include user authentication and the ability to mark tasks as complete.

## Generated
Scaffolded via **Dawson Framework** (saas) + AI architecture.

### Structure
Pages: /|/dashboard|/settings | Components: TaskList|TaskDetails|TaskCreate|TaskEdit|SettingsForm | API: POST /api/auth|GET /api/tasks|POST /api/tasks|PUT /api/tasks/:id|DELETE /api/tasks/:id|GET /api/settings|PUT /api/settings

### Integrations
- **auth**: supabase
- **db**: supabase

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
[Dawson Docs](https://docs.dawson.dev)|[Next.js 15](https://nextjs.org/docs)|templates/saas/README.md

## Next Prompt
"Implement {primary feature}: data models for {key entities}→API endpoints→UI. Include error handling + TypeScript types."