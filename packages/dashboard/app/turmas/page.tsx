'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from '@/lib/useSession';
import { TopBar } from '@/app/_components/TopBar';
import { generateJoinCode } from '@/lib/joinCode';

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
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [justCreated, setJustCreated] = useState<{ name: string; code: string } | null>(null);

  const loadClasses = async () => {
    const { data: classRows, error: classError } = await supabase
      .from('classes')
      .select('id, name, join_code, archived_at')
      .order('created_at', { ascending: false });

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

    setClasses(withCounts);
  };

  useEffect(() => {
    if (!session) return;
    let mounted = true;
    loadClasses().then(() => {
      if (!mounted) return;
    });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    setCreating(true);
    setCreateError('');

    // join_code é único — em caso raro de colisão, tenta de novo com outro código.
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateJoinCode();
      const { error: insertError } = await supabase
        .from('classes')
        .insert({ name: name.trim(), join_code: code, owner: session.user.id });

      if (!insertError) {
        setJustCreated({ name: name.trim(), code });
        setName('');
        setShowForm(false);
        setCreating(false);
        await loadClasses();
        return;
      }

      if (insertError.code !== '23505') {
        setCreateError(insertError.message);
        setCreating(false);
        return;
      }
      // 23505 = unique_violation no join_code: tenta outro código.
    }

    setCreateError('Não deu para gerar um código único. Tente de novo.');
    setCreating(false);
  };

  if (session === undefined || classes === undefined) {
    return <p style={styles.loading}>Carregando…</p>;
  }

  return (
    <main>
      <TopBar crumbs={[{ label: 'Turmas' }]} />
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.heading}>Suas turmas</h1>
          {!showForm && (
            <button onClick={() => setShowForm(true)} style={styles.newButton}>
              Nova turma
            </button>
          )}
        </div>

        {justCreated && (
          <div style={styles.successCard}>
            <p style={styles.successText}>
              Turma <strong>{justCreated.name}</strong> criada. Código de entrada:
            </p>
            <p style={styles.successCode} className="num">
              {justCreated.code}
            </p>
            <p style={styles.successHint}>
              Passe esse código pros alunos — eles digitam no app pra entrar na turma.
            </p>
            <button onClick={() => setJustCreated(null)} style={styles.dismissButton}>
              Entendi
            </button>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleCreate} style={styles.formCard}>
            <label style={styles.label} htmlFor="class-name">
              Nome da turma
            </label>
            <input
              id="class-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="9º ano B"
              style={styles.input}
              autoFocus
            />
            {createError && <p style={styles.error}>{createError}</p>}
            <div style={styles.formActions}>
              <button type="submit" disabled={creating} style={styles.newButton}>
                {creating ? 'Criando…' : 'Criar turma'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setCreateError('');
                }}
                style={styles.cancelButton}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {error && <p style={styles.error}>{error}</p>}

        {classes.length === 0 && !showForm ? (
          <div style={styles.emptyCard}>
            <p style={styles.empty}>Você ainda não tem turmas.</p>
            <button onClick={() => setShowForm(true)} style={styles.newButton}>
              Criar sua primeira turma
            </button>
          </div>
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
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  heading: { fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--ink)' },
  error: { color: 'var(--flag)', fontSize: 14 },
  newButton: {
    border: 'none',
    borderRadius: 3,
    padding: '10px 16px',
    background: 'var(--blue)',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  cancelButton: {
    border: '1px solid var(--line)',
    borderRadius: 3,
    padding: '10px 16px',
    background: 'transparent',
    color: 'var(--ink-soft)',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  formCard: {
    border: '1px solid var(--line)',
    borderRadius: 4,
    padding: 20,
    background: 'var(--surface)',
    marginBottom: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: { fontSize: 13, fontWeight: 500 },
  input: {
    border: '1px solid var(--line)',
    borderRadius: 3,
    padding: '10px 12px',
    fontSize: 15,
    fontFamily: 'inherit',
    color: 'var(--ink)',
    background: 'var(--paper)',
  },
  formActions: { display: 'flex', gap: 8, marginTop: 8 },
  successCard: {
    border: '1px solid var(--gold)',
    background: 'var(--gold-soft)',
    borderRadius: 4,
    padding: 20,
    marginBottom: 20,
  },
  successText: { margin: '0 0 6px', fontSize: 14, color: 'var(--ink)' },
  successCode: { margin: '0 0 6px', fontSize: 28, fontWeight: 700, color: 'var(--ink)', letterSpacing: 2 },
  successHint: { margin: '0 0 14px', fontSize: 13, color: 'var(--ink-soft)' },
  dismissButton: {
    border: '1px solid var(--navy)',
    background: 'transparent',
    color: 'var(--navy)',
    borderRadius: 3,
    padding: '8px 14px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  emptyCard: {
    border: '1px dashed var(--line)',
    borderRadius: 4,
    padding: 28,
    background: 'var(--surface)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 14,
  },
  empty: { color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.6, margin: 0 },
  list: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 20px',
    background: 'var(--surface)',
    border: '1px solid var(--line)',
    borderLeft: '3px solid var(--blue)',
    borderRadius: 3,
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
