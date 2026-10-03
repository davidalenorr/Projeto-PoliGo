// Chama as Edge Functions direto com fetch — sem SDK do Supabase no app.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.ts';
import type { NewSyncEvent } from './types.ts';

type JoinClassResult =
  | { ok: true; studentId: string; classId: string; className: string }
  | { ok: false; error: string };

type IngestEventsResult = { ok: true; accepted: number } | { ok: false; error: string };

function headers(): Record<string, string> {
  const base: Record<string, string> = { 'content-type': 'application/json' };
  if (SUPABASE_ANON_KEY) base.apikey = SUPABASE_ANON_KEY;
  return base;
}

export async function joinClass(
  code: string,
  displayName: string,
  deviceId: string,
): Promise<JoinClassResult> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/join-class`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ code, displayName, deviceId }),
    });
    const body = await res.json();
    if (!res.ok) return { ok: false, error: body.error ?? 'request_failed' };
    return { ok: true, studentId: body.studentId, classId: body.classId, className: body.className };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}

export async function ingestEvents(
  studentId: string,
  classId: string,
  events: NewSyncEvent[],
): Promise<IngestEventsResult> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/ingest-events`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ studentId, classId, events }),
    });
    const body = await res.json();
    if (!res.ok) return { ok: false, error: body.error ?? 'request_failed' };
    return { ok: true, accepted: body.accepted ?? 0 };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}
