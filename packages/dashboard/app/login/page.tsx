'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setError('');

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (signInError) {
      setStatus('error');
      setError(signInError.message);
      return;
    }

    setStatus('sent');
  };

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <h1 style={styles.title}>PoliGo · Painel</h1>
        <p style={styles.subtitle}>Acompanhamento de turmas para professores</p>

        {status === 'sent' ? (
          <p style={styles.sentText}>
            Enviamos um link de acesso para <strong>{email}</strong>. Abra-o neste
            navegador para entrar.
          </p>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label} htmlFor="email">
              E-mail do professor
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="professor@escola.com"
              style={styles.input}
            />
            {status === 'error' && <p style={styles.errorText}>{error}</p>}
            <button type="submit" disabled={status === 'sending'} style={styles.button}>
              {status === 'sending' ? 'Enviando…' : 'Enviar link de acesso'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    background: 'var(--surface)',
    border: '1px solid var(--line)',
    borderRadius: 4,
    padding: '32px 28px',
  },
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 600,
  },
  subtitle: {
    margin: '6px 0 28px',
    color: 'var(--ink-soft)',
    fontSize: 14,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
  },
  input: {
    border: '1px solid var(--line)',
    borderRadius: 3,
    padding: '10px 12px',
    fontSize: 15,
    fontFamily: 'inherit',
    color: 'var(--ink)',
    background: 'var(--paper)',
  },
  errorText: {
    color: 'var(--flag)',
    fontSize: 13,
    margin: 0,
  },
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
  sentText: {
    fontSize: 14,
    lineHeight: 1.6,
  },
};
