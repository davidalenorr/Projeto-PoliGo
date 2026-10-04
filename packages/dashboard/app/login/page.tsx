'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

const ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'E-mail ou senha incorretos.',
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const [error, setError] = useState('');
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotStatus, setForgotStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setError('');

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setStatus('error');
      setError(ERROR_MESSAGES[signInError.message] ?? signInError.message);
      return;
    }

    router.push('/turmas');
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotStatus('sending');
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setForgotStatus('sent');
  };

  return (
    <main className="login-main" style={styles.main}>
      <div style={styles.panel}>
        <Link href="/" style={styles.brand}>
          PoliGo
        </Link>
        <p style={styles.panelText}>
          Entre com seu e-mail e senha da escola para acompanhar suas turmas.
        </p>
      </div>

      <div style={styles.formSide}>
        <div style={styles.card}>
          <h1 style={styles.title}>{forgotMode ? 'Recuperar senha' : 'Entrar'}</h1>
          <p style={styles.subtitle}>
            {forgotMode ? 'Enviamos um link pra você criar uma senha nova' : 'Acompanhamento de turmas para professores'}
          </p>

          {forgotMode ? (
            forgotStatus === 'sent' ? (
              <p style={styles.hint}>
                Se <strong>{email}</strong> tiver uma conta, chegou um e-mail com o link. Confira a caixa de entrada.
              </p>
            ) : (
              <form onSubmit={handleForgot} style={styles.form}>
                <label style={styles.label} htmlFor="forgot-email">
                  E-mail
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="professor@escola.com"
                  style={styles.input}
                />
                <button type="submit" disabled={forgotStatus === 'sending'} style={styles.button}>
                  {forgotStatus === 'sending' ? 'Enviando…' : 'Enviar link'}
                </button>
              </form>
            )
          ) : (
            <form onSubmit={handleSubmit} style={styles.form}>
              <label style={styles.label} htmlFor="email">
                E-mail
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

              <label style={styles.label} htmlFor="password">
                Senha
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={styles.input}
              />

              {status === 'error' && <p style={styles.errorText}>{error}</p>}

              <button type="submit" disabled={status === 'sending'} style={styles.button}>
                {status === 'sending' ? 'Entrando…' : 'Entrar'}
              </button>
            </form>
          )}

          <p style={styles.footerText}>
            {forgotMode ? (
              <button onClick={() => { setForgotMode(false); setForgotStatus('idle'); }} style={styles.linkButton}>
                Voltar pro login
              </button>
            ) : (
              <>
                <button onClick={() => setForgotMode(true)} style={styles.linkButton}>
                  Esqueceu a senha?
                </button>
                {' · '}
                Ainda não tem conta? <Link href="/signup" style={styles.footerLink}>Cadastre sua escola</Link>
              </>
            )}
          </p>
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { minHeight: '100vh', display: 'flex' },
  panel: {
    flex: '1 1 40%',
    background: 'var(--navy)',
    padding: '40px 44px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  brand: { fontSize: 15, fontWeight: 700, color: 'var(--on-navy)', textDecoration: 'none' },
  panelText: {
    fontSize: 16,
    lineHeight: 1.6,
    color: 'var(--on-navy-soft)',
    maxWidth: '32ch',
    margin: 0,
  },
  formSide: {
    flex: '1 1 60%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: { width: '100%', maxWidth: 360 },
  title: { margin: 0, fontSize: 24, fontWeight: 700 },
  subtitle: { margin: '6px 0 28px', color: 'var(--ink-soft)', fontSize: 14 },
  form: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, fontWeight: 500, marginTop: 8 },
  input: {
    border: '1px solid var(--line)',
    borderRadius: 3,
    padding: '10px 12px',
    fontSize: 15,
    fontFamily: 'inherit',
    color: 'var(--ink)',
    background: 'var(--surface)',
  },
  errorText: { color: 'var(--flag)', fontSize: 13, margin: 0 },
  button: {
    marginTop: 12,
    border: 'none',
    borderRadius: 3,
    padding: '11px 16px',
    background: 'var(--blue)',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  footerText: { fontSize: 13, color: 'var(--ink-soft)', marginTop: 20 },
  footerLink: { color: 'var(--blue)', fontWeight: 600 },
  hint: { fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6 },
  linkButton: {
    border: 'none',
    background: 'transparent',
    color: 'var(--blue)',
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
    padding: 0,
  },
};
