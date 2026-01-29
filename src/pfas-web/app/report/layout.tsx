import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Report an Issue',
  description: 'Report issues with product information, suspected PFAS content, or other concerns about our verification data.',
};

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<ReportLoadingSkeleton />}>
      {children}
    </Suspense>
  );
}

function ReportLoadingSkeleton() {
  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '2rem 1rem' 
    }}>
      <div style={{ 
        height: '2rem', 
        width: '200px', 
        background: 'var(--bg-secondary)', 
        borderRadius: '4px',
        marginBottom: '1rem',
      }} />
      <div style={{ 
        height: '1rem', 
        width: '400px', 
        background: 'var(--bg-secondary)', 
        borderRadius: '4px',
        marginBottom: '2rem',
      }} />
      <div style={{ 
        height: '400px', 
        background: 'var(--bg-secondary)', 
        borderRadius: '8px',
      }} />
    </div>
  );
}
