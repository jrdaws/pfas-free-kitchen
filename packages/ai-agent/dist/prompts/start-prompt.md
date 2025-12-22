You are generating a START_PROMPT.md file for Cursor AI.

TASK: Create a welcoming and actionable starting prompt for developers.

PROJECT CONTEXT:
- Project Name: {projectName}
- Description: {description}
- Template: {template}

ARCHITECTURE:
{architectureSummary}

FEATURES:
{features}

INTEGRATIONS:
{integrations}

OUTPUT FORMAT:
Return markdown content for START_PROMPT.md (no JSON, no code blocks around the entire output):

---

# {projectName}

{description}

## What's Been Generated

This project was scaffolded using **Dawson Framework** with the **{template}** template and enhanced with AI-powered architecture generation.

### Project Structure

**Pages:**
{list pages with descriptions}

**Custom Components:**
{list custom components that were generated}

**API Routes:**
{list API endpoints}

### Integrations Configured

{list integrations with setup instructions}

## Getting Started

### 1. Environment Setup

Copy the example environment file and add your API keys:

```bash
cp .env.example .env.local
```

Add the following required environment variables to `.env.local`:

```bash
{env vars list based on integrations}
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## Implementation Guide

### Priority Tasks

The generated scaffold includes TODO comments throughout the code. Here are the key areas to implement:

1. **Business Logic**
   - {page/component 1}: Implement core functionality
   - {page/component 2}: Add data fetching logic
   - {API route 1}: Implement endpoint logic

2. **Data Models**
   - Define database schema for: {key entities}
   - Set up database migrations
   - Create data access layer

3. **Integration Setup**
{integration-specific setup tasks}

4. **UI Polish**
   - Customize components to match brand
   - Add loading and error states
   - Implement responsive design

### File Structure

```
{projectName}/
├── app/                 # Next.js App Router
│   ├── page.tsx        # Home page
│   ├── [other pages]   # Additional pages
│   └── api/           # API routes
├── components/         # React components
│   ├── [custom]/      # Your custom components
│   └── ui/           # Template UI components
├── lib/               # Utility functions
├── types/             # TypeScript type definitions
└── public/            # Static assets
```

### Integration Documentation

**{Integration 1}:**
- Setup guide: [link]
- API reference: [link]
- Example implementation: See `app/api/...` or `lib/...`

**{Integration 2}:**
- Setup guide: [link]
- API reference: [link]
- Example implementation: See `...`

## Development Workflow

1. **Start with data**: Define your data models and database schema
2. **Build API layer**: Implement API routes for data operations
3. **Create UI components**: Build out the user interface
4. **Add integrations**: Configure auth, payments, etc.
5. **Test thoroughly**: Write tests for critical flows
6. **Deploy**: Use `framework deploy` or deploy manually to Vercel

## Helpful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Lint code
npm run type-check      # TypeScript type checking

# Testing
npm test                # Run tests
```

## Resources

- **Dawson Framework Docs**: [https://docs.dawson.dev](https://docs.dawson.dev)
- **Next.js 15 Docs**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **Template Guide**: See `templates/{template}/README.md`
- **Integration Guides**: Check `integrations/[integration]/README.md`

## Need Help?

- Check `.cursorrules` for project-specific guidelines
- Review generated TODO comments in code
- Refer to template examples for patterns
- Consult integration documentation for setup

## Continue Development

**Suggested next prompt for Cursor:**

"Let's implement the {most important feature} functionality. Start by defining the data models for {key entities}, then create the API endpoints, and finally build the UI components. Make sure to include proper error handling and TypeScript types throughout."

---

**Happy coding! 🚀**
