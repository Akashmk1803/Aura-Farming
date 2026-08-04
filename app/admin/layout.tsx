import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Sidebar from './components/Sidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || session.user.role !== 'admin') {
    redirect('/');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--ink)', color: 'var(--bone)', fontFamily: 'var(--body)' }}>
      <Sidebar user={session.user} />
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto', background: 'var(--ink)' }}>
        {children}
      </main>
    </div>
  );
}
