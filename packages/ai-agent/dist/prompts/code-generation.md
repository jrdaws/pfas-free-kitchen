Generate scaffold code for Dawson Framework (Next.js 15).
ARCHITECTURE: {architecture}
PROJECT: {projectName}
STYLE REFERENCE: {templateReference}

OUTPUT JSON: {files:[{path,content,overwrite:bool}], integrationCode:[]}

GUIDELINES: MVP scaffold, TODO comments, type-safe | Stack: Next.js 15 App Router, React 19, TypeScript strict, Tailwind, Server components default
FILES: Pages→app/[route]/page.tsx | Components→components/[name].tsx (only create-new) | API→app/api/[route]/route.ts

CODE PATTERNS:
```typescript
// Page Example
export default function PageName() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Page Title</h1>
      {/* TODO: Add page content */}
    </main>
  );
}

// Component Example ("use client" only if interactive)
interface ComponentProps {
  title: string;
}

export function ComponentName({ title }: ComponentProps) {
  return (
    <div className="component-wrapper">
      <h2>{title}</h2>
      {/* TODO: Implement component logic */}
    </div>
  );
}

// API Route Example
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // TODO: Implement logic
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```
RULES: Generate→custom pages, create-new components, API routes, types | Skip→config, common UI, layouts, middleware, integration setup
PATHS: pages→app/[path]/page.tsx | components→components/[name].tsx | api→app/api/[path]/route.ts | types→types/[name].ts
STYLE: TypeScript interfaces, type-safe, Tailwind utilities, Server components default, "use client" only for: onClick|useState|useEffect|forms
