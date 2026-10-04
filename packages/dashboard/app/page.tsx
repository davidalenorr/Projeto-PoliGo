'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function HomePage() {
  const [loggedIn, setLoggedIn] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setLoggedIn(!!data.session));
  }, []);

  return (
    <main>
      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <nav style={styles.nav}>
            <span style={styles.brand}>PoliGo</span>
            {loggedIn ? (
              <Link href="/turmas" style={styles.navCta}>
                Ir para o painel
              </Link>
            ) : (
              <div style={styles.navLinks}>
                <Link href="/login" style={styles.navLink}>
                  Entrar
                </Link>
                <Link href="/signup" style={styles.navCta}>
                  Cadastrar escola
                </Link>
              </div>
            )}
          </nav>

          <div style={styles.heroBody}>
            <h1 style={styles.headline}>
              Acompanhe como cada aluno aprende geometria, sem planilha.
            </h1>
            <p style={styles.subhead}>
              PoliGo é um jogo de missões de geometria e álgebra para o 8º e 9º
              ano. Seus alunos jogam pelo celular; este painel mostra, turma por
              turma e aluno por aluno, o que cada um já resolveu, onde errou e
              quanto tempo levou em cada fase.
            </p>
            <Link href={loggedIn ? '/turmas' : '/signup'} style={styles.primaryCta}>
              {loggedIn ? 'Ir para o painel' : 'Cadastrar minha escola'}
            </Link>
          </div>

          <CaseMotif />
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.sectionInner}>
          <h2 style={styles.sectionTitle}>Como funciona</h2>
          <div style={styles.featureGrid}>
            <FeatureBlock
              title="Turma por turma"
              text="Cada turma tem um código de entrada. Veja quantos alunos já entraram em cada uma."
            />
            <FeatureBlock
              title="Quem precisa de ajuda"
              text="Tabela ordenável por precisão, missões concluídas, chefões derrotados e tempo médio — para achar rápido quem está travado."
            />
            <FeatureBlock
              title="O caminho de cada aluno"
              text="Abra um aluno e veja a precisão por fase e a linha do tempo completa de tentativas, acertos e erros."
            />
          </div>
        </div>
      </section>

      <section style={styles.sectionAlt}>
        <div style={styles.sectionInner}>
          <h2 style={styles.sectionTitle}>Como começar</h2>
          <ol style={styles.steps}>
            <li style={styles.step}>
              <span style={styles.stepNum}>1</span>
              <span style={styles.stepText}>Cadastre sua escola com e-mail e senha.</span>
            </li>
            <li style={styles.step}>
              <span style={styles.stepNum}>2</span>
              <span style={styles.stepText}>
                Peça pro suporte liberar sua turma e te passar o código de 6 caracteres.
              </span>
            </li>
            <li style={styles.step}>
              <span style={styles.stepNum}>3</span>
              <span style={styles.stepText}>
                Compartilhe o código com os alunos — eles digitam no app e já aparecem no painel.
              </span>
            </li>
          </ol>
        </div>
      </section>

      <footer style={styles.footer}>
        <span>PoliGo · painel do professor</span>
      </footer>
    </main>
  );
}

function FeatureBlock({ title, text }: { title: string; text: string }) {
  return (
    <div style={styles.featureBlock}>
      <h3 style={styles.featureTitle}>{title}</h3>
      <p style={styles.featureText}>{text}</p>
    </div>
  );
}

function CaseMotif() {
  // Um pequeno "quadro de investigação" geométrico — pontos ligados por
  // linhas, ecoando tanto o conteúdo (geometria) quanto a narrativa do
  // app (detetives conectando pistas). Único momento decorativo da página.
  const points = [
    [40, 180],
    [160, 60],
    [300, 110],
    [230, 220],
    [370, 40],
  ];
  return (
    <svg className="case-motif" style={styles.motif} viewBox="0 0 420 260" fill="none" aria-hidden="true">
      {points.map(([x1, y1], i) =>
        points.slice(i + 1).map(([x2, y2], j) => (
          <line
            key={`${i}-${j}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="var(--navy-soft)"
            strokeWidth={1}
          />
        )),
      )}
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={5} fill={i === 2 ? 'var(--gold)' : 'var(--on-navy)'} />
      ))}
    </svg>
  );
}

const styles: Record<string, React.CSSProperties> = {
  hero: { background: 'var(--navy)' },
  heroInner: {
    maxWidth: 1040,
    margin: '0 auto',
    padding: '0 28px 64px',
    position: 'relative',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '22px 0',
  },
  brand: { fontSize: 15, fontWeight: 700, color: 'var(--on-navy)' },
  navLinks: { display: 'flex', alignItems: 'center', gap: 14 },
  navLink: { fontSize: 14, fontWeight: 600, color: 'var(--on-navy-soft)', textDecoration: 'none' },
  navCta: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--on-navy)',
    textDecoration: 'none',
    border: '1px solid var(--navy-soft)',
    borderRadius: 3,
    padding: '8px 14px',
  },
  heroBody: { maxWidth: 580, paddingTop: 48 },
  headline: {
    fontSize: 38,
    lineHeight: 1.2,
    fontWeight: 700,
    color: 'var(--on-navy)',
    margin: '0 0 18px',
  },
  subhead: {
    fontSize: 16,
    lineHeight: 1.6,
    color: 'var(--on-navy-soft)',
    margin: '0 0 28px',
  },
  primaryCta: {
    display: 'inline-block',
    background: 'var(--gold)',
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    textDecoration: 'none',
    padding: '12px 22px',
    borderRadius: 3,
  },
  motif: {
    position: 'absolute',
    right: 0,
    top: 40,
    width: 420,
    height: 260,
    opacity: 0.9,
  },
  section: { background: 'var(--paper)' },
  sectionAlt: { background: 'var(--surface)', borderTop: '1px solid var(--line)' },
  sectionInner: { maxWidth: 1040, margin: '0 auto', padding: '56px 28px' },
  sectionTitle: { fontSize: 22, fontWeight: 700, color: 'var(--ink)', margin: '0 0 28px' },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 32,
  },
  featureBlock: {},
  featureTitle: { fontSize: 16, fontWeight: 700, margin: '0 0 8px', color: 'var(--ink)' },
  featureText: { fontSize: 14, lineHeight: 1.6, color: 'var(--ink-soft)', margin: 0, maxWidth: '38ch' },
  steps: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 18 },
  step: { display: 'flex', alignItems: 'flex-start', gap: 16 },
  stepNum: {
    flexShrink: 0,
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: 'var(--blue-soft)',
    color: 'var(--blue)',
    fontSize: 14,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { fontSize: 15, lineHeight: 1.6, color: 'var(--ink)', paddingTop: 4, maxWidth: '52ch' },
  footer: {
    padding: '24px 28px',
    fontSize: 13,
    color: 'var(--ink-soft)',
    borderTop: '1px solid var(--line)',
  },
};
