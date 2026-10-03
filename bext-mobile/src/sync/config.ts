// Variáveis EXPO_PUBLIC_* são embutidas no bundle em tempo de build — sem
// dependência nova. Sem valor configurado, cai no stack local (`supabase
// start`), para `npx expo start` funcionar de primeira em dev.
export const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321';

export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
