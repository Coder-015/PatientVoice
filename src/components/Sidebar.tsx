'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', path: '/', icon: 'dashboard' },
    { name: 'Symptom Entry', path: '/symptoms', icon: 'edit_note' },
    { name: 'AI Analysis', path: '/analysis', icon: 'psychology' },
    { name: 'Clinical Reports', path: '/reports', icon: 'description' },
    { name: 'History', path: '/history', icon: 'history' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-name">PatientVoice</div>
        <div className="sidebar-brand-sub">Empathetic Curator</div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          // Determine activity, handling cases like /analysis/[id]
          const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
          
          return (
            <Link key={item.path} href={item.path} className={isActive ? 'active' : ''}>
              <span className="material-symbols-outlined">{item.icon}</span>{item.name}
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-bottom">
        <Link href="/symptoms" style={{ textDecoration: 'none' }}>
          <button className="new-entry-btn">
            <span className="material-symbols-outlined">add</span>New Entry
          </button>
        </Link>
      </div>
    </aside>
  );
}
