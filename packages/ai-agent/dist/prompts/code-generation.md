Generate scaffold code from architecture.
INPUT: {architecture} | PROJECT: {projectName} | STYLE: {templateReference}
STACK: Next.js 15 App Router, React 19, TypeScript strict, Tailwind CSS, Server Components default

GENERATE: pages→app/[path]/page.tsx|components(create-new only)→components/[name].tsx|API→app/api/[path]/route.ts|types→types/[name].ts
SKIP: config files, common UI, layouts, middleware, integration setup

PAGE PATTERN: export default function Name(){return(<main className="container mx-auto px-4 py-8"><h1>Title</h1>{/*TODO*/}</main>)}
COMPONENT PATTERN: interface Props{title:string}export function Name({title}:Props){return(<div>{/*TODO*/}</div>)}
API PATTERN: import{NextRequest,NextResponse}from'next/server';export async function GET(req:NextRequest){try{return NextResponse.json({success:true})}catch{return NextResponse.json({error:'Error'},{status:500})}}

RULES:
- Server components default, "use client" only for: onClick|useState|useEffect|forms|browser-APIs
- TypeScript interfaces for all props
- Tailwind utilities, mobile-first
- TODO comments for implementation points
- MVP scaffold, not production-complete

OUTPUT: {files:[{path,content,overwrite:false}],integrationCode:[]}
