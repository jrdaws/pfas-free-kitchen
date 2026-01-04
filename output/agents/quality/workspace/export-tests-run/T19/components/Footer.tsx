"use client";

import Link from "next/link";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  projectName?: string;
  description?: string;
  sections?: FooterSection[];
}

const DEFAULT_SECTIONS: FooterSection[] = [
  { title: "Product", links: [{ label: "Features", href: "#features" }, { label: "Pricing", href: "#pricing" }] },
  { title: "Company", links: [{ label: "About", href: "/about" }, { label: "Blog", href: "/blog" }] },
  { title: "Legal", links: [{ label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }] },
];

export function Footer({ projectName = "My Project", description = "Building the future of web development.", sections = DEFAULT_SECTIONS }: FooterProps) {
  return (
    <footer className="bg-slate-950 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">{projectName.charAt(0).toUpperCase()}</span>
              </div>
              <span className="text-white font-semibold text-lg">{projectName}</span>
            </Link>
            <p className="text-slate-400 text-sm mb-6 max-w-xs">{description}</p>
          </div>
          {sections.map((section, index) => (
            <div key={index}>
              <h3 className="text-white font-semibold text-sm mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}><Link href={link.href} className="text-slate-400 hover:text-white text-sm transition-colors">{link.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="py-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-sm">© {new Date().getFullYear()} {projectName}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-slate-400 hover:text-white text-sm transition-colors">Privacy</Link>
            <Link href="/terms" className="text-slate-400 hover:text-white text-sm transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
