'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from '@/lib/useSession';
import { TopBar } from '@/app/_components/TopBar';

type ClassRow = {
  id: string;
  name: string;
  join_code: string;
  archived_at: string | null;
  studentCount: number;
};

export default function TurmasPage() {
  const session = useSession();
  const [classes, setClasses] = useState<ClassRow[] | undefined>(undefined);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session) return;

    let mounted = true;

    (async () => {
      const { data: classRows, error: classError } = await supabase
        .from('classes')
        .select('id, name, join_code, archived_at')
        .order('created_at', { ascending: false });

      if (!mounted) return;
      if (classError) {
        setError(classError.message);
        return;
      }

      const withCounts = await Promise.all(
        (classRows ?? []).map(async (c) => {
          const { count } = await supabase
            .from('students')
            .select('id', { count: 'exact', head: true })
            .eq('class_id', c.id);
          return { ...c, studentCount: count ?? 0 };
        }),
      );

      if (mounted) setClasses(withCounts);
    })();

    return () => {
      mounted = false;
    };
  }, [session]);

  if (session === undefined || classes === undefined) {
    return <p style={styles.loading}>Carregando…</p>;
  }

  return (
    <main>
      <TopBar crumbs={[{ label: 'Turmas' }]} />
      <div style={styles.container}>
        {error && <p style={styles.error}>{error}</p>}

        {classes.length === 0 ? (
          <p style={styles.empty}>
            Nenhuma turma ainda. Crie uma pelo SQL Editor do Supabase
            (<code>supabase/snippets.sql</code>, bloco 2).
          </p>
        ) : (
          <ul style={styles.list}>
            {classes.map((c) => (
              <li key={c.id}>
                <Link href={`/turmas/${c.id}`} style={styles.row}>
                  <span style={styles.rowName}>
                    {c.name}
                    {c.archived_at && <span style={styles.archivedTag}>arquivada</span>}
                  </span>
                  <span style={styles.rowMeta}>
                    <span className="num">{c.join_code}</span>
                    <span style={styles.rowDot}>·</span>
                    <span className="num">{c.studentCount}</span> alunos
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  loading: { padding: 28, color: 'var(--ink-soft)', fontSize: 14 },
  container: { maxWidth: 720, margin: '0 auto', padding: '28px' },
  error: { color: 'var(--flag)', fontSize: 14 },
  empty: { color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.6 },
  list: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 1 },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 18px',
    background: 'var(--surface)',
    border: '1px solid var(--line)',
    textDecoration: 'none',
    color: 'var(--ink)',
  },
  rowName: { fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 },
  archivedTag: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--ink-soft)',
    border: '1px solid var(--line)',
    borderRadius: 3,
    padding: '2px 6px',
  },
  rowMeta: { fontSize: 13, color: 'var(--ink-soft)' },
  rowDot: { margin: '0 8px' },
};
