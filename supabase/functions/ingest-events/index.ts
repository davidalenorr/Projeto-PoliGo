// POST /functions/v1/ingest-events
//   body: { studentId, classId, events: EventInput[] }
//   200:  { accepted: number }
//
// Recebe um lote de eventos de jogo do app, valida cada um, confere que o
// aluno realmente pertence à turma e grava com dedupe por (student_id, clientEventId).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { clampPayload, isUuid, json, preflight } from "../_shared/http.ts";
import { checkRateLimit } from "../_shared/rateLimit.ts";

const MAX_EVENTS = 200;
const MAX_PAST_MS = 1000 * 60 * 60 * 24 * 30; // 30 dias
const MAX_FUTURE_MS = 1000 * 60; // 1 min de folga p/ relógio

const EVENT_TYPES = new Set([
  "mission_started",
  "mission_attempt",
  "mission_completed",
  "boss_defeated",
  "quiz_session",
]);

type EventInput = {
  clientEventId?: unknown;
  type?: unknown;
  missionId?: unknown;
  phaseNumber?: unknown;
  correct?: unknown;
  durationMs?: unknown;
  payload?: unknown;
  occurredAt?: unknown;
};

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let body: { studentId?: unknown; classId?: unknown; events?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad_json" }, 400);
  }

  const studentId = String(body.studentId ?? "");
  const classId = String(body.classId ?? "");
  const rawEvents: EventInput[] = Array.isArray(body.events) ? body.events : [];

  if (!isUuid(studentId) || !isUuid(classId)) return json({ error: "invalid_ids" }, 400);
  if (rawEvents.length === 0) return json({ accepted: 0 });
  if (rawEvents.length > MAX_EVENTS) return json({ error: "too_many_events" }, 413);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  // o aluno existe, é dessa turma, e a turma não está arquivada?
  const { data, error: studentErr } = await admin
    .from("students")
    .select("id, class_id, classes!inner(archived_at)")
    .eq("id", studentId)
    .maybeSingle();

  if (studentErr) return json({ error: "lookup_failed" }, 500);

  const student = data as
    | { id: string; class_id: string; classes: { archived_at: string | null } | null }
    | null;

  if (!student || student.class_id !== classId || student.classes?.archived_at) {
    return json({ error: "student_not_in_class" }, 403);
  }

  const [studentOk, classOk] = await Promise.all([
    checkRateLimit(admin, "ingest-events:student", studentId, 30, 60_000),
    checkRateLimit(admin, "ingest-events:class", classId, 300, 60_000),
  ]);
  if (!studentOk || !classOk) return json({ error: "rate_limited" }, 429);

  const now = Date.now();
  const rows: Record<string, unknown>[] = [];
  for (const e of rawEvents) {
    if (!e || typeof e !== "object") continue;
    if (typeof e.type !== "string" || !EVENT_TYPES.has(e.type)) continue;
    if (!isUuid(e.clientEventId)) continue;

    const occurred = Date.parse(String(e.occurredAt));
    if (!Number.isFinite(occurred)) continue;
    if (occurred > now + MAX_FUTURE_MS || occurred < now - MAX_PAST_MS) continue;

    const phase = Number(e.phaseNumber);
    const duration = Number(e.durationMs);

    rows.push({
      client_event_id: e.clientEventId,
      student_id: studentId,
      class_id: classId,
      type: e.type,
      mission_id: typeof e.missionId === "string" ? e.missionId.slice(0, 40) : null,
      phase_number: Number.isInteger(phase) && phase >= 1 && phase <= 10 ? phase : null,
      correct: typeof e.correct === "boolean" ? e.correct : null,
      duration_ms:
        Number.isInteger(duration) && duration >= 0
          ? Math.min(duration, 3_600_000)
          : null,
      payload: clampPayload(e.payload),
      occurred_at: new Date(occurred).toISOString(),
    });
  }

  if (rows.length === 0) return json({ accepted: 0 });

  const { data: insertedRows, error: insertErr } = await admin
    .from("events")
    .upsert(rows, { onConflict: "student_id,client_event_id", ignoreDuplicates: true })
    .select("id");

  if (insertErr) return json({ error: "insert_failed" }, 500);

  await admin
    .from("students")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", studentId);

  return json({ accepted: insertedRows?.length ?? 0 });
});
