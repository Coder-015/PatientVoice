'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Topbar() {
  const pathname = usePathname();

  return (
    <nav className="topbar">
      <Link href="/" className="topbar-logo">PatientVoice</Link>
      <div className="topbar-nav">
        <Link href="/symptoms" className={pathname.startsWith('/symptoms') ? 'active' : ''}>Symptom Entry</Link>
        <Link href="/analysis" className={pathname.startsWith('/analysis') ? 'active' : ''}>AI Analysis</Link>
        <Link href="/reports" className={pathname.startsWith('/reports') ? 'active' : ''}>Clinical Reports</Link>
        <Link href="/history" className={pathname.startsWith('/history') ? 'active' : ''}>History</Link>
      </div>
      <div className="topbar-actions">
        <button className="icon-btn" onClick={() => alert('No new notifications!')}>
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <Link href="/profile" style={{ display: 'contents' }}>
          <button className="icon-btn"><span className="material-symbols-outlined">settings</span></button>
        </Link>
        <Link href="/profile" style={{ textDecoration: 'none' }}>
          <div className="avatar"><span className="material-symbols-outlined">person</span></div>
        </Link>
      </div>
    </nav>
  );
}
