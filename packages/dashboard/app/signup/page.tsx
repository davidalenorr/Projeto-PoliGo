'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

const ERROR_MESSAGES: Record<string, string> = {
  'User already registered': 'Já existe uma conta com esse e-mail. Tente entrar.',
};

export default function SignupPage() {
  const router = useRouter();
  const [school, setSchool] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      setStatus('error');
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    setStatus('sending');
    setError('');

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { school } },
    });

    if (signUpError) {
      setStatus('error');
      setError(ERROR_MESSAGES[signUpError.message] ?? signUpError.message);
      return;
    }

    router.push('/turmas');
  };

  return (
    <main className="login-main" style={styles.main}>
      <div style={styles.panel}>
        <Link href="/" style={styles.brand}>
          PoliGo
        </Link>
        <p style={styles.panelText}>
          Crie a conta da sua escola. Depois, peça pro suporte liberar sua
          primeira turma com o código de entrada.
        </p>
      </div>

      <div style={styles.formSide}>
        <div style={styles.card}>
          <h1 style={styles.title}>Cadastrar escola</h1>
          <p style={styles.subtitle}>Leva menos de um minuto</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label} htmlFor="school">
              Nome da escola
            </label>
            <input
              id="school"
              type="text"
              required
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="Escola Municipal X"
              style={styles.input}
            />

            <label style={styles.label} htmlFor="email">
              Seu e-mail
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
              Crie uma senha
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
            />

            {status === 'error' && <p style={styles.errorText}>{error}</p>}

            <button type="submit" disabled={status === 'sending'} style={styles.button}>
              {status === 'sending' ? 'Criando conta…' : 'Criar conta'}
            </button>
          </form>

          <p style={styles.footerText}>
            Já tem conta? <Link href="/login" style={styles.footerLink}>Entrar</Link>
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
    background: 'var(--gold)',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  footerText: { fontSize: 13, color: 'var(--ink-soft)', marginTop: 20 },
  footerLink: { color: 'var(--blue)', fontWeight: 600 },
};
