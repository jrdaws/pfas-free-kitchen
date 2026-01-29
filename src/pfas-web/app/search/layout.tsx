import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Products',
  description: 'Browse our complete catalog of independently verified PFAS-free cookware, bakeware, and kitchen products.',
  openGraph: {
    title: 'Browse PFAS-Free Products',
    description: 'Discover verified PFAS-free cookware. Filter by tier, material, brand, and more.',
    type: 'website',
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
