Generate .cursorrules file for Cursor AI continuation.
PROJECT: {projectName} | TEMPLATE: {template} | DESCRIPTION: {description}
ARCHITECTURE: {architectureSummary}
INTEGRATIONS: {integrations}

OUTPUT: Plain text for .cursorrules (no JSON, no markdown code blocks):

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

## Stack
Next.js 15 App Router | TypeScript strict | Tailwind CSS | React 19 Server Components
Integrations: {integrations}

## Code Style
TypeScript: strict, interfaces, infer types, avoid `any`→use `unknown`
React: server default | "use client" for: onClick|forms|useState|useEffect|browser APIs | async fetch server-side
Files: pages→app/[route]/page.tsx | components→components/[name].tsx | API→app/api/[route]/route.ts | types→types/ | utils→lib/
Styling: Tailwind utilities, mobile-first, co-located
Data: server=async/await | client=hooks/SWR | errors=try/catch | loading=Suspense

## Patterns
{integration-specific code patterns}

## Tasks
Page: app/[route]/page.tsx → server component → layouts → nav
Component: components/Name.tsx → props → implement → export
API: app/api/[route]/route.ts → GET|POST handlers → validation → NextResponse.json
Integration: {template-specific instructions}

## Testing
Files: *.test.ts(x) | Run: npm test | Focus: critical logic+user flows

## Env
Required in `.env.local`: {env vars based on integrations}

## Next Steps
{suggested next steps}

---
AI GUIDELINES: Follow style above | maintain consistency | clarify ambiguity | prioritize types+errors | simple components | test critical paths
