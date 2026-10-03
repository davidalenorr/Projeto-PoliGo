'use client';

import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export function TopBar({ crumbs }: { crumbs: { label: string; href?: string }[] }) {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div style={styles.bar}>
      <nav style={styles.crumbs}>
        {crumbs.map((crumb, i) => (
          <span key={i} style={styles.crumbItem}>
            {i > 0 && <span style={styles.sep}>/</span>}
            {crumb.href ? (
              <Link href={crumb.href} style={styles.crumbLink}>
                {crumb.label}
              </Link>
            ) : (
              <span style={styles.crumbCurrent}>{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>
      <button onClick={handleSignOut} style={styles.signOut}>
        Sair
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 28px',
    borderBottom: '1px solid var(--line)',
    background: 'var(--surface)',
  },
  crumbs: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 14,
  },
  crumbItem: {
    display: 'inline-flex',
    alignItems: 'center',
  },
  sep: {
    margin: '0 8px',
    color: 'var(--line)',
  },
  crumbLink: {
    color: 'var(--ink-soft)',
    textDecoration: 'none',
  },
  crumbCurrent: {
    color: 'var(--ink)',
    fontWeight: 600,
  },
  signOut: {
    border: '1px solid var(--line)',
    background: 'transparent',
    borderRadius: 3,
    padding: '6px 12px',
    fontSize: 13,
    color: 'var(--ink-soft)',
    cursor: 'pointer',
  },
};
