import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compare Products',
  description: 'Compare PFAS-free kitchen products side by side. View verification tiers, materials, features, and retailers.',
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
