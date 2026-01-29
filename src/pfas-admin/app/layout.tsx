import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { AdminSidebar, AdminHeader } from '@/components/layout';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Admin Console | PFAS-Free Kitchen',
    template: '%s | Admin Console',
  },
  description: 'PFAS-Free Kitchen Admin Console',
  robots: 'noindex, nofollow',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="admin-layout">
          <AdminSidebar />
          <div className="admin-content">
            <AdminHeader user={session.user} />
            <main className="admin-main">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
