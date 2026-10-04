'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'error' | 'done'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    // O link de recuperação já chega com a sessão (supabase-js lê o token
    // da URL ao carregar o client) — só precisamos confirmar que existe.
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setStatus('error');
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    setStatus('saving');
    setError('');

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setStatus('error');
      setError(updateError.message);
      return;
    }

    setStatus('done');
    setTimeout(() => router.push('/turmas'), 1500);
  };

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <h1 style={styles.title}>Nova senha</h1>

        {!ready ? (
          <p style={styles.hint}>
            Link inválido ou expirado. <a href="/login" style={styles.link}>Pedir um novo link</a>.
          </p>
        ) : status === 'done' ? (
          <p style={styles.hint}>Senha alterada. Levando pro painel…</p>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label} htmlFor="password">
              Nova senha
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="mínimo 6 caracteres"
              style={styles.input}
              autoFocus
            />
            {status === 'error' && <p style={styles.error}>{error}</p>}
            <button type="submit" disabled={status === 'saving'} style={styles.button}>
              {status === 'saving' ? 'Salvando…' : 'Salvar nova senha'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--navy)' },
  card: { width: '100%', maxWidth: 360, background: 'var(--surface)', borderRadius: 4, padding: '32px 28px' },
  title: { margin: '0 0 20px', fontSize: 22, fontWeight: 700, color: 'var(--ink)' },
  hint: { fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6, margin: 0 },
  link: { color: 'var(--blue)', fontWeight: 600 },
  form: { display: 'flex', flexDirection: 'column', gap: 8 },
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
  error: { color: 'var(--flag)', fontSize: 13, margin: 0 },
  button: {
    marginTop: 8,
    border: 'none',
    borderRadius: 3,
    padding: '11px 16px',
    background: 'var(--blue)',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
};
