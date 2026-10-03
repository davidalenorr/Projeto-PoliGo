'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from '@/lib/useSession';
import { TopBar } from '@/app/_components/TopBar';
import { downloadCsv, formatDuration, formatRelativeTime, toCsv, trailPercent } from '@/lib/format';

// bext-mobile/src/data/missions.ts: 43 missões não-chefão no app hoje.
// Chefões ("faseN_boss") são contados à parte, na coluna "chefões".
const TOTAL_MISSIONS = 43;

type ProgressRow = {
  student_id: string;
  class_id: string;
  display_name: string;
  last_seen_at: string;
  missions_completed: number;
  bosses_defeated: number;
  quiz_sessions: number;
  last_activity: string | null;
  attempts: number;
  attempts_correct: number;
  accuracy_pct: number;
  avg_completion_ms: number | null;
};

type SortKey = 'display_name' | 'trail' | 'missions_completed' | 'bosses_defeated' | 'accuracy_pct' | 'avg_completion_ms' | 'last_seen_at';

export default function TurmaPage() {
  const session = useSession();
  const router = useRouter();
  const { classId } = useParams<{ classId: string }>();

  const [className, setClassName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [archivedAt, setArchivedAt] = useState<string | null>(null);
  const [rows, setRows] = useState<ProgressRow[] | undefined>(undefined);
  const [error, setError] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('display_name');
  const [sortAsc, setSortAsc] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!session) return;
    let mounted = true;

    (async () => {
      const [{ data: classRow, error: classError }, { data: progressRows, error: progressError }] = await Promise.all([
        supabase.from('classes').select('name, join_code, archived_at').eq('id', classId).single(),
        supabase.from('student_progress').select('*').eq('class_id', classId),
      ]);

      if (!mounted) return;

      if (classError || progressError) {
        setError((classError ?? progressError)!.message);
        return;
      }

      setClassName(classRow?.name ?? '');
      setJoinCode(classRow?.join_code ?? '');
      setArchivedAt(classRow?.archived_at ?? null);
      setRows(progressRows ?? []);
    })();

    return () => {
      mounted = false;
    };
  }, [session, classId]);

  const handleToggleArchive = async () => {
    const archiving = !archivedAt;
    const message = archiving
      ? `Arquivar "${className}"? A turma para de aceitar novos alunos e eventos. Pode reativar depois.`
      : `Reativar "${className}"?`;
    if (!window.confirm(message)) return;

    setBusy(true);
    const { error: updateError } = await supabase
      .from('classes')
      .update({ archived_at: archiving ? new Date().toISOString() : null })
      .eq('id', classId);
    setBusy(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setArchivedAt(archiving ? new Date().toISOString() : null);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Excluir "${className}" e TODOS os dados dos alunos (progresso e eventos)? Esta ação não pode ser desfeita.`,
    );
    if (!confirmed) return;

    setBusy(true);
    const { error: deleteError } = await supabase.from('classes').delete().eq('id', classId);
    setBusy(false);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    router.push('/turmas');
  };

  const sorted = useMemo(() => {
    if (!rows) return [];
    const withTrail = rows.map((r) => ({ ...r, trail: trailPercent(r.missions_completed, TOTAL_MISSIONS) }));

    return [...withTrail].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      let cmp: number;
      if (typeof av === 'string' && typeof bv === 'string') cmp = av.localeCompare(bv);
      else cmp = (Number(av) || 0) - (Number(bv) || 0);
      return sortAsc ? cmp : -cmp;
    });
  }, [rows, sortKey, sortAsc]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortAsc((prev) => !prev);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const handleExport = () => {
    const columns = [
      { key: 'display_name', label: 'Aluno' },
      { key: 'trail', label: '% trilha' },
      { key: 'missions_completed', label: 'Missões' },
      { key: 'bosses_defeated', label: 'Chefões' },
      { key: 'accuracy_pct', label: 'Precisão %' },
      { key: 'avg_completion_ms', label: 'Tempo médio (ms)' },
      { key: 'last_seen_at', label: 'Último acesso' },
    ];
    const csv = toCsv(sorted, columns);
    downloadCsv(`${className || 'turma'}.csv`, csv);
  };

  if (session === undefined || rows === undefined) {
    return <p style={styles.loading}>Carregando…</p>;
  }

  return (
    <main>
      <TopBar crumbs={[{ label: 'Turmas', href: '/turmas' }, { label: className || '…' }]} />
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              {className}
              {archivedAt && <span style={styles.archivedTag}>arquivada</span>}
            </h1>
            <p style={styles.meta}>
              código <span className="num">{joinCode}</span>
              <span style={styles.metaDot}>·</span>
              <span className="num">{sorted.length}</span> alunos
            </p>
          </div>
          <div style={styles.actions}>
            <button onClick={handleExport} style={styles.exportButton} disabled={sorted.length === 0}>
              Exportar CSV
            </button>
            <button onClick={handleToggleArchive} style={styles.neutralButton} disabled={busy}>
              {archivedAt ? 'Reativar turma' : 'Arquivar turma'}
            </button>
            <button onClick={handleDelete} style={styles.dangerButton} disabled={busy}>
              Excluir dados da turma
            </button>
          </div>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {sorted.length === 0 ? (
          <p style={styles.empty}>Ninguém entrou nesta turma ainda.</p>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <Th label="Aluno" columnKey="display_name" activeKey={sortKey} sortAsc={sortAsc} onSort={handleSort} align="left" />
                  <Th label="% trilha" columnKey="trail" activeKey={sortKey} sortAsc={sortAsc} onSort={handleSort} />
                  <Th label="Missões" columnKey="missions_completed" activeKey={sortKey} sortAsc={sortAsc} onSort={handleSort} />
                  <Th label="Chefões" columnKey="bosses_defeated" activeKey={sortKey} sortAsc={sortAsc} onSort={handleSort} />
                  <Th label="Precisão" columnKey="accuracy_pct" activeKey={sortKey} sortAsc={sortAsc} onSort={handleSort} />
                  <Th label="Tempo médio" columnKey="avg_completion_ms" activeKey={sortKey} sortAsc={sortAsc} onSort={handleSort} />
                  <Th label="Último acesso" columnKey="last_seen_at" activeKey={sortKey} sortAsc={sortAsc} onSort={handleSort} />
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr key={r.student_id}>
                    <td style={styles.tdName}>
                      <Link href={`/turmas/${classId}/alunos/${r.student_id}`} style={styles.studentLink}>
                        {r.display_name}
                      </Link>
                    </td>
                    <td style={styles.td} className="num">
                      {r.trail}%
                    </td>
                    <td style={styles.td} className="num">
                      {r.missions_completed}/{TOTAL_MISSIONS}
                    </td>
                    <td style={styles.td} className="num">
                      {r.bosses_defeated}/10
                    </td>
                    <td style={{ ...styles.td, color: r.accuracy_pct < 50 && r.attempts > 0 ? 'var(--flag)' : undefined }} className="num">
                      {r.attempts > 0 ? `${r.accuracy_pct}%` : '—'}
                    </td>
                    <td style={styles.td} className="num">
                      {formatDuration(r.avg_completion_ms)}
                    </td>
                    <td style={styles.td} className="num">
                      {formatRelativeTime(r.last_seen_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

function Th({
  label,
  columnKey,
  activeKey,
  align,
  sortAsc,
  onSort,
}: {
  label: string;
  columnKey: SortKey;
  activeKey: SortKey;
  align?: 'left' | 'right';
  sortAsc: boolean;
  onSort: (key: SortKey) => void;
}) {
  const active = columnKey === activeKey;
  return (
    <th
      onClick={() => onSort(columnKey)}
      style={{ ...styles.th, textAlign: align ?? 'right', cursor: 'pointer', color: active ? 'var(--ink)' : styles.th.color }}
    >
      {label}
      {active && <span style={{ marginLeft: 4 }}>{sortAsc ? '↑' : '↓'}</span>}
    </th>
  );
}

const styles: Record<string, React.CSSProperties> = {
  loading: { padding: 28, color: 'var(--ink-soft)', fontSize: 14 },
  container: { maxWidth: 1040, margin: '0 auto', padding: '28px' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 },
  title: { margin: 0, fontSize: 20, fontWeight: 600 },
  meta: { margin: '4px 0 0', fontSize: 13, color: 'var(--ink-soft)' },
  metaDot: { margin: '0 8px' },
  actions: { display: 'flex', gap: 8 },
  exportButton: {
    border: '1px solid var(--blue)',
    background: 'transparent',
    color: 'var(--blue)',
    borderRadius: 3,
    padding: '9px 14px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  neutralButton: {
    border: '1px solid var(--line)',
    background: 'transparent',
    color: 'var(--ink-soft)',
    borderRadius: 3,
    padding: '9px 14px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  dangerButton: {
    border: '1px solid var(--flag)',
    background: 'transparent',
    color: 'var(--flag)',
    borderRadius: 3,
    padding: '9px 14px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  archivedTag: {
    marginLeft: 10,
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--ink-soft)',
    border: '1px solid var(--line)',
    borderRadius: 3,
    padding: '2px 6px',
    verticalAlign: 'middle',
  },
  error: { color: 'var(--flag)', fontSize: 14 },
  empty: { color: 'var(--ink-soft)', fontSize: 14 },
  tableWrap: { border: '1px solid var(--line)', background: 'var(--surface)', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: {
    padding: '10px 14px',
    fontWeight: 600,
    fontSize: 12,
    color: 'var(--ink-soft)',
    borderBottom: '1px solid var(--line)',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  },
  td: { padding: '10px 14px', textAlign: 'right', borderBottom: '1px solid var(--line-soft)' },
  tdName: { padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid var(--line-soft)', fontWeight: 500 },
  studentLink: { color: 'var(--ink)', textDecoration: 'none' },
};
