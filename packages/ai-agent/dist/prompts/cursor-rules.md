You are generating a .cursorrules file for Cursor AI continuation.

TASK: Create a comprehensive .cursorrules file that guides future development.

PROJECT CONTEXT:
- Project Name: {projectName}
- Template: {template}
- Description: {description}

ARCHITECTURE SUMMARY:
{architectureSummary}

INTEGRATIONS:
{integrations}

OUTPUT FORMAT:
Return plain text content for the .cursorrules file (no JSON, no markdown code blocks):

---

# Project: {projectName}
# Template: {template}
# Generated: {timestamp}

## Project Overview

{description}

## Architecture

### Pages
{list pages with paths and descriptions}

### Components
{list custom components}

### API Routes
{list API endpoints}

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **React**: Version 19 with Server Components

### Integrations
{list active integrations with brief descriptions}

## Code Style Guidelines

### TypeScript
- Strict mode enabled
- Define interfaces for all props and complex types
- Use type inference where obvious
- Avoid `any` type - use `unknown` if type is truly unknown

### React Components
- Server components by default
- Use "use client" only when necessary:
  - Interactive elements (onClick, form handling)
  - React hooks (useState, useEffect, etc.)
  - Browser APIs
- Async data fetching in server components
- Keep components focused and single-purpose

### File Organization
- Pages: `app/[route]/page.tsx`
- Components: `components/[name].tsx`
- API Routes: `app/api/[route]/route.ts`
- Types: `types/[name].ts`
- Utils: `lib/[name].ts`

### Styling
- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Keep styles co-located with components
- Use template's design system as reference

### Data Fetching
- Server components: Direct async/await
- Client components: Use React hooks or SWR/TanStack Query
- Error handling: Try/catch with user-friendly messages
- Loading states: Suspense boundaries where appropriate

## Integration Patterns

{integration-specific code patterns based on active integrations}

## Common Tasks

### Adding a New Page
1. Create `app/[route]/page.tsx`
2. Define the page component (server component by default)
3. Add any route-specific layouts if needed
4. Update navigation if public page

### Adding a New Component
1. Create `components/ComponentName.tsx`
2. Define props interface
3. Implement component logic
4. Export and use in pages

### Adding an API Route
1. Create `app/api/[route]/route.ts`
2. Export handler functions (GET, POST, etc.)
3. Add error handling and validation
4. Return JSON responses with NextResponse

### Adding Integration Features
{template-specific integration instructions}

## Testing
- Test files: `*.test.ts` or `*.test.tsx`
- Run tests: `npm test`
- Focus on critical business logic and user flows

## Environment Variables
Required variables in `.env.local`:
{list required env vars based on integrations}

## Next Steps for Development

{suggested next steps based on generated architecture}

---

GUIDELINES FOR CURSOR AI:
- Follow the code style guidelines above
- Maintain consistency with existing code
- Ask for clarification if requirements are ambiguous
- Prioritize type safety and error handling
- Keep components simple and focused
- Test critical functionality
