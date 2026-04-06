'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Topbar from './Topbar';
import Sidebar from './Sidebar';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && pathname !== '/auth') {
        router.push('/auth');
      } else if (session && pathname === '/auth') {
        router.push('/');
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && pathname !== '/auth') {
        router.push('/auth');
      } else if (session && pathname === '/auth') {
        router.push('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--surface)' }}>
        <div className="loading-pulse"></div>
      </div>
    );
  }

  if (pathname === '/auth') {
    return <>{children}</>;
  }

  return (
    <>
      <div className="accent-line"></div>
      <Topbar />
      <div className="app-layout">
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div className="main-content">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
