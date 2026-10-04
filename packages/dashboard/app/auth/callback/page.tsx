'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace('/turmas');
    });

    // supabase-js já troca o código/token da URL pela sessão ao carregar o
    // client (detectSessionInUrl). Se depois de um tempo não houver sessão,
    // o link provavelmente expirou ou já foi usado.
    const timeout = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (data.session) router.replace('/turmas');
      else setError(true);
    }, 2500);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      listener.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--navy)' }}>
      <p style={{ fontSize: 14, color: error ? '#f3a06b' : 'var(--on-navy-soft)' }}>
        {error ? (
          <>
            Link inválido ou expirado. <a href="/login" style={{ color: 'var(--on-navy)' }}>Pedir um novo link</a>.
          </>
        ) : (
          'Entrando…'
        )}
      </p>
    </main>
  );
}
