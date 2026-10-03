// POST /functions/v1/join-class
//   body: { code: string, displayName: string, deviceId: string }
//   200:  { studentId, classId, className }
//
// Valida o código da turma, cria/atualiza o aluno (só primeiro nome + hash do
// aparelho) e devolve os ids que o app guarda no expo-secure-store.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { json, preflight, sha256Hex } from "../_shared/http.ts";

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let body: { code?: unknown; displayName?: unknown; deviceId?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad_json" }, 400);
  }

  const code = String(body.code ?? "").trim().toUpperCase().replace(/-/g, "");
  const displayName = String(body.displayName ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 40);
  const deviceId = String(body.deviceId ?? "").trim();

  if (!/^[A-Z0-9]{6}$/.test(code)) return json({ error: "invalid_code" }, 400);
  if (displayName.length < 1) return json({ error: "invalid_name" }, 400);
  if (deviceId.length < 8) return json({ error: "invalid_device" }, 400);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const { data, error: classErr } = await admin
    .from("classes")
    .select("id, name, archived_at")
    .eq("join_code", code)
    .maybeSingle();

  if (classErr) return json({ error: "lookup_failed" }, 500);

  const klass = data as
    | { id: string; name: string; archived_at: string | null }
    | null;

  if (!klass || klass.archived_at) return json({ error: "class_not_found" }, 404);

  const deviceHash = await sha256Hex(deviceId);

  const { data: upserted, error: upsertErr } = await admin
    .from("students")
    .upsert(
      {
        class_id: klass.id,
        display_name: displayName,
        device_hash: deviceHash,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "class_id,device_hash" },
    )
    .select("id")
    .single();

  const student = upserted as { id: string } | null;
  if (upsertErr || !student) return json({ error: "join_failed" }, 500);

  return json(
    { studentId: student.id, classId: klass.id, className: klass.name },
    200,
  );
});
