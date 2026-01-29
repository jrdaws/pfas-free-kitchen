import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Learn | PFAS-Free Kitchen',
    default: 'Learn About PFAS',
  },
};

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
