import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Janela fixa atômica (via a função SQL `rate_limit_hit`, um round trip).
 * `scope` separa os contadores (ex.: "join-class:device"); `key` é o
 * aparelho/aluno/turma sendo limitado dentro desse scope.
 */
export async function checkRateLimit(
  admin: SupabaseClient,
  scope: string,
  key: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  const { data, error } = await admin.rpc("rate_limit_hit", {
    p_scope: scope,
    p_key: key,
    p_window_ms: windowMs,
  });

  if (error) {
    // Falha no controle não deve travar o fluxo normal do piloto.
    console.error("rate_limit_hit failed", error);
    return true;
  }

  return (data as number) <= limit;
}
