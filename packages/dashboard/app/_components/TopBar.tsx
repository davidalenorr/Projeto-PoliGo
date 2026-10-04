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
      <div style={styles.left}>
        <Link href="/turmas" style={styles.brand}>
          PoliGo
        </Link>
        <nav style={styles.crumbs}>
          {crumbs.map((crumb, i) => (
            <span key={i} style={styles.crumbItem}>
              <span style={styles.sep}>/</span>
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
      </div>
      <div style={styles.right}>
        <Link href="/configuracoes" style={styles.settingsLink}>
          Configurações
        </Link>
        <button onClick={handleSignOut} style={styles.signOut}>
          Sair
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 28px',
    background: 'var(--navy)',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
  },
  brand: {
    fontSize: 15,
    fontWeight: 700,
    color: 'var(--on-navy)',
    textDecoration: 'none',
    letterSpacing: 0.2,
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
    color: 'var(--on-navy-soft)',
  },
  crumbLink: {
    color: 'var(--on-navy-soft)',
    textDecoration: 'none',
  },
  crumbCurrent: {
    color: 'var(--on-navy)',
    fontWeight: 600,
  },
  right: { display: 'flex', alignItems: 'center', gap: 16 },
  settingsLink: {
    fontSize: 13,
    color: 'var(--on-navy-soft)',
    textDecoration: 'none',
  },
  signOut: {
    border: '1px solid var(--navy-soft)',
    background: 'transparent',
    borderRadius: 3,
    padding: '6px 12px',
    fontSize: 13,
    color: 'var(--on-navy-soft)',
    cursor: 'pointer',
  },
};
