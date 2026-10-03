// Funções puras de formatação — sem React, sem Supabase. Reaproveitadas
// nas páginas e testáveis isoladamente.

export function formatDuration(ms: number | null): string {
  if (ms === null || !Number.isFinite(ms) || ms < 0) return '—';
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function formatRelativeTime(isoString: string | null, now: number = Date.now()): string {
  if (!isoString) return '—';
  const then = new Date(isoString).getTime();
  if (!Number.isFinite(then)) return '—';

  const diffMs = Math.max(0, now - then);
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `${minutes}min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function trailPercent(missionsCompleted: number, totalMissions: number): number {
  if (totalMissions <= 0) return 0;
  return Math.round((100 * Math.min(missionsCompleted, totalMissions)) / totalMissions);
}

/** Serializa linhas para CSV (RFC 4180 básico: aspas duplas escapadas, campo entre aspas se tiver vírgula/aspas/quebra de linha). */
export function toCsv(rows: Record<string, string | number | null>[], columns: { key: string; label: string }[]): string {
  const escape = (value: string | number | null): string => {
    const text = value === null || value === undefined ? '' : String(value);
    if (/[",\n]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  const header = columns.map((c) => escape(c.label)).join(',');
  const lines = rows.map((row) => columns.map((c) => escape(row[c.key])).join(','));
  return [header, ...lines].join('\r\n');
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
