'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from '@/lib/useSession';
import { TopBar } from '@/app/_components/TopBar';
import { downloadCsv, formatDuration, toCsv } from '@/lib/format';

type EventRow = {
  type: string;
  mission_id: string | null;
  phase_number: number | null;
  correct: boolean | null;
  duration_ms: number | null;
  occurred_at: string;
};

const EVENT_LABELS: Record<string, string> = {
  mission_started: 'Iniciou missão',
  mission_attempt: 'Tentativa',
  mission_completed: 'Concluiu missão',
  boss_defeated: 'Derrotou chefão',
  quiz_session: 'Treino livre',
};

export default function AlunoPage() {
  const session = useSession();
  const { classId, studentId } = useParams<{ classId: string; studentId: string }>();

  const [studentName, setStudentName] = useState('');
  const [className, setClassName] = useState('');
  const [events, setEvents] = useState<EventRow[] | undefined>(undefined);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session) return;
    let mounted = true;

    (async () => {
      const [{ data: student, error: studentError }, { data: classRow }, { data: eventRows, error: eventsError }] =
        await Promise.all([
          supabase.from('students').select('display_name').eq('id', studentId).single(),
          supabase.from('classes').select('name').eq('id', classId).single(),
          supabase
            .from('events')
            .select('type, mission_id, phase_number, correct, duration_ms, occurred_at')
            .eq('student_id', studentId)
            .order('occurred_at', { ascending: false }),
        ]);

      if (!mounted) return;

      if (studentError || eventsError) {
        setError((studentError ?? eventsError)!.message);
        return;
      }

      setStudentName(student?.display_name ?? '');
      setClassName(classRow?.name ?? '');
      setEvents(eventRows ?? []);
    })();

    return () => {
      mounted = false;
    };
  }, [session, classId, studentId]);

  const phaseStats = useMemo(() => {
    const stats = new Map<number, { correct: number; total: number }>();
    for (let phase = 1; phase <= 10; phase++) stats.set(phase, { correct: 0, total: 0 });

    (events ?? [])
      .filter((e) => e.type === 'mission_attempt' && e.phase_number)
      .forEach((e) => {
        const s = stats.get(e.phase_number!);
        if (!s) return;
        s.total += 1;
        if (e.correct) s.correct += 1;
      });

    return Array.from(stats.entries()).map(([phase, s]) => ({
      phase,
      accuracy: s.total > 0 ? Math.round((100 * s.correct) / s.total) : null,
      total: s.total,
    }));
  }, [events]);

  const handleExport = () => {
    const columns = [
      { key: 'type', label: 'Tipo' },
      { key: 'mission_id', label: 'Missão' },
      { key: 'phase_number', label: 'Fase' },
      { key: 'correct', label: 'Correto' },
      { key: 'duration_ms', label: 'Duração (ms)' },
      { key: 'occurred_at', label: 'Quando' },
    ];
    const rows = (events ?? []).map((e) => ({
      type: EVENT_LABELS[e.type] ?? e.type,
      mission_id: e.mission_id,
      phase_number: e.phase_number,
      correct: e.correct === null ? '' : e.correct ? 'sim' : 'não',
      duration_ms: e.duration_ms,
      occurred_at: e.occurred_at,
    }));
    downloadCsv(`${studentName || 'aluno'}.csv`, toCsv(rows, columns));
  };

  if (session === undefined || events === undefined) {
    return <p style={styles.loading}>Carregando…</p>;
  }

  return (
    <main>
      <TopBar
        crumbs={[
          { label: 'Turmas', href: '/turmas' },
          { label: className || '…', href: `/turmas/${classId}` },
          { label: studentName || '…' },
        ]}
      />
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>{studentName}</h1>
          <button onClick={handleExport} style={styles.exportButton} disabled={events.length === 0}>
            Exportar CSV
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Precisão por fase</h2>
          <PhaseChart data={phaseStats} />
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Linha do tempo</h2>
          {events.length === 0 ? (
            <p style={styles.empty}>Nenhum evento registrado ainda.</p>
          ) : (
            <ul style={styles.timeline}>
              {events.map((e, i) => (
                <li key={i} style={styles.timelineRow}>
                  <span className="num" style={styles.timelineTime}>
                    {new Date(e.occurred_at).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span style={styles.timelineLabel}>{EVENT_LABELS[e.type] ?? e.type}</span>
                  <span style={styles.timelineDetail}>
                    {e.mission_id && <span className="num">{e.mission_id}</span>}
                    {e.correct !== null && (
                      <span style={{ color: e.correct ? 'var(--good)' : 'var(--flag)', marginLeft: 8 }}>
                        {e.correct ? '✓' : '✕'}
                      </span>
                    )}
                    {e.duration_ms !== null && (
                      <span className="num" style={{ marginLeft: 8, color: 'var(--ink-soft)' }}>
                        {formatDuration(e.duration_ms)}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

function PhaseChart({ data }: { data: { phase: number; accuracy: number | null; total: number }[] }) {
  const width = 640;
  const height = 140;
  const barWidth = width / data.length;
  const chartHeight = 100;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Precisão por fase">
      <line x1={0} y1={chartHeight} x2={width} y2={chartHeight} stroke="var(--line)" strokeWidth={1} />
      {data.map((d, i) => {
        const x = i * barWidth;
        const barH = d.accuracy === null ? 0 : (chartHeight * d.accuracy) / 100;
        const barColor = d.accuracy === null ? 'var(--line)' : d.accuracy < 50 ? 'var(--flag)' : 'var(--blue)';
        return (
          <g key={d.phase}>
            <rect
              x={x + barWidth * 0.2}
              y={chartHeight - barH}
              width={barWidth * 0.6}
              height={barH}
              fill={barColor}
            />
            <text x={x + barWidth / 2} y={chartHeight + 18} textAnchor="middle" fontSize={11} fill="var(--ink-soft)" fontFamily="var(--font-plex-mono), monospace">
              {d.phase}
            </text>
            {d.accuracy !== null && (
              <text x={x + barWidth / 2} y={chartHeight - barH - 6} textAnchor="middle" fontSize={11} fill="var(--ink)" fontFamily="var(--font-plex-mono), monospace">
                {d.accuracy}%
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

const styles: Record<string, React.CSSProperties> = {
  loading: { padding: 28, color: 'var(--ink-soft)', fontSize: 14 },
  container: { maxWidth: 760, margin: '0 auto', padding: '28px' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  title: { margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--ink)' },
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
  error: { color: 'var(--flag)', fontSize: 14 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)', margin: '0 0 12px' },
  empty: { color: 'var(--ink-soft)', fontSize: 14 },
  timeline: { listStyle: 'none', margin: 0, padding: 0, border: '1px solid var(--line)', borderRadius: 4, overflow: 'hidden', background: 'var(--surface)' },
  timelineRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '10px 14px',
    borderBottom: '1px solid var(--line-soft)',
    fontSize: 13,
  },
  timelineTime: { color: 'var(--ink-soft)', minWidth: 90 },
  timelineLabel: { minWidth: 130 },
  timelineDetail: { color: 'var(--ink)' },
};
