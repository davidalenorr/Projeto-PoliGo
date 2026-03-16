const PHASES = [
  'Fase 1: Classificacao e Convexidade',
  'Fase 2: Diagonais e Soma dos Angulos Internos',
  'Fase 3: Poligonos Regulares e Angulos Externos',
  'Fase 4: O Grande Mosaico',
  'Fase 5: Triangulacao e Area',
]

function HubPage() {
  return (
    <main className="mx-auto w-[min(1150px,calc(100%-1rem))] pb-24 pt-3 md:pb-12 md:pt-4">
      <section className="rounded-3xl border border-sky-900/15 bg-white/90 p-5 shadow-lg md:p-6">
        <h1 className="m-0 font-['Avenir_Next_Condensed'] text-4xl text-sky-900 md:text-5xl">Hub de Missoes</h1>
        <p className="mt-2 text-slate-600">Base pronta para conectarmos progresso e desbloqueio por fases.</p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {PHASES.map((phase, index) => (
            <article key={phase} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="m-0 text-xs uppercase tracking-wide text-slate-500">Trilha {index + 1}</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">{phase}</h2>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-0 rounded-full bg-gradient-to-r from-emerald-500 to-sky-600" />
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default HubPage
