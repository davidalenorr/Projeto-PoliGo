'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from '@/lib/useSession';
import { TopBar } from '@/app/_components/TopBar';

export default function ConfiguracoesPage() {
  const session = useSession();
  const [school, setSchool] = useState('');
  const [schoolStatus, setSchoolStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [schoolError, setSchoolError] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (session) setSchool((session.user.user_metadata?.school as string) ?? '');
  }, [session]);

  if (session === undefined) {
    return <p style={styles.loading}>Carregando…</p>;
  }

  const handleSaveSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setSchoolStatus('saving');
    setSchoolError('');

    const { error } = await supabase.auth.updateUser({ data: { school } });

    if (error) {
      setSchoolStatus('error');
      setSchoolError(error.message);
      return;
    }
    setSchoolStatus('saved');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordStatus('error');
      setPasswordError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    setPasswordStatus('saving');
    setPasswordError('');

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setPasswordStatus('error');
      setPasswordError(error.message);
      return;
    }
    setNewPassword('');
    setPasswordStatus('saved');
  };

  return (
    <main>
      <TopBar crumbs={[{ label: 'Configurações' }]} />
      <div style={styles.container}>
        <h1 style={styles.heading}>Configurações</h1>

        <form onSubmit={handleSaveSchool} style={styles.card}>
          <h2 style={styles.cardTitle}>Sua conta</h2>
          <label style={styles.label}>E-mail</label>
          <input value={session?.user.email ?? ''} disabled style={{ ...styles.input, ...styles.inputDisabled }} />

          <label style={styles.label} htmlFor="school">
            Nome da escola
          </label>
          <input
            id="school"
            type="text"
            value={school}
            onChange={(e) => {
              setSchool(e.target.value);
              setSchoolStatus('idle');
            }}
            style={styles.input}
          />

          {schoolStatus === 'error' && <p style={styles.error}>{schoolError}</p>}
          {schoolStatus === 'saved' && <p style={styles.success}>Salvo.</p>}

          <button type="submit" disabled={schoolStatus === 'saving'} style={styles.button}>
            {schoolStatus === 'saving' ? 'Salvando…' : 'Salvar'}
          </button>
        </form>

        <form onSubmit={handleChangePassword} style={styles.card}>
          <h2 style={styles.cardTitle}>Trocar senha</h2>
          <label style={styles.label} htmlFor="new-password">
            Nova senha
          </label>
          <input
            id="new-password"
            type="password"
            minLength={6}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setPasswordStatus('idle');
            }}
            placeholder="mínimo 6 caracteres"
            style={styles.input}
          />

          {passwordStatus === 'error' && <p style={styles.error}>{passwordError}</p>}
          {passwordStatus === 'saved' && <p style={styles.success}>Senha alterada.</p>}

          <button type="submit" disabled={passwordStatus === 'saving' || !newPassword} style={styles.button}>
            {passwordStatus === 'saving' ? 'Salvando…' : 'Trocar senha'}
          </button>
        </form>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  loading: { padding: 28, color: 'var(--ink-soft)', fontSize: 14 },
  container: { maxWidth: 480, margin: '0 auto', padding: '28px', display: 'flex', flexDirection: 'column', gap: 20 },
  heading: { fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--ink)' },
  card: {
    border: '1px solid var(--line)',
    borderRadius: 4,
    background: 'var(--surface)',
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  cardTitle: { fontSize: 15, fontWeight: 700, margin: '0 0 6px', color: 'var(--ink)' },
  label: { fontSize: 13, fontWeight: 500, marginTop: 8 },
  input: {
    border: '1px solid var(--line)',
    borderRadius: 3,
    padding: '10px 12px',
    fontSize: 15,
    fontFamily: 'inherit',
    color: 'var(--ink)',
    background: 'var(--paper)',
  },
  inputDisabled: { color: 'var(--ink-soft)', cursor: 'not-allowed' },
  error: { color: 'var(--flag)', fontSize: 13, margin: 0 },
  success: { color: 'var(--good)', fontSize: 13, margin: 0 },
  button: {
    marginTop: 8,
    alignSelf: 'flex-start',
    border: 'none',
    borderRadius: 3,
    padding: '10px 16px',
    background: 'var(--blue)',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
};
