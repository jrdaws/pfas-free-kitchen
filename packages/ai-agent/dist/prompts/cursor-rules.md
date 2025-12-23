Generate .cursorrules for Cursor AI.
INPUT: {projectName} | {template} | {description} | {architectureSummary} | {integrations}
OUTPUT: Plain text .cursorrules (no JSON, no code blocks):

# {projectName}
Template: {template} | Generated: {timestamp}

## Overview
{description}

## Architecture
Pages: {pages with paths}
Components: {custom components}
API: {endpoints}

## Stack
Next.js 15 App Router|TypeScript strict|Tailwind|React 19 Server Components
Integrations: {integrations}

## Code Style
TS: strict, interfaces, avoid any→unknown
React: server default|"use client" for onClick/forms/useState/useEffect/browser-APIs|async server-side
Files: pages→app/[route]/page.tsx|components→components/[name].tsx|API→app/api/[route]/route.ts|types→types/|utils→lib/
Style: Tailwind utilities, mobile-first
Data: server=async/await|client=hooks/SWR|errors=try/catch|loading=Suspense

## Patterns
{integration-specific patterns}

## Tasks
Page→app/[route]/page.tsx→server component→layouts→nav
Component→components/Name.tsx→props→implement→export
API→app/api/route.ts→GET|POST→validation→NextResponse.json

## Env
Required: {env vars from integrations}

## Next
{suggested next steps}

AI: Follow style|maintain consistency|clarify ambiguity|prioritize types+errors|simple components|test critical paths
