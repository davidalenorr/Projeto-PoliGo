function HomePage() {
  const players = [
    {
      id: 'jp',
      name: 'Joao Pedro',
      phase: 'Fase 2: Arquiteto',
      avatar: 'J',
      tone: 'bg-sky-600 text-white',
    },
    {
      id: 'ms',
      name: 'Maria Silva',
      phase: 'Fase 4: O Mosaico',
      avatar: 'M',
      tone: 'bg-amber-400 text-slate-900',
    },
  ]

  return (
    <main className="min-h-svh bg-[#d9d9dc] px-4 py-5 md:grid md:place-items-center">
      <section className="mx-auto w-full max-w-[390px] rounded-[42px] border-[5px] border-[#a6a6a9] bg-[#f4f4f5] p-6 shadow-[0_20px_30px_rgba(0,0,0,0.06)]">
        <header className="pb-7 pt-5 text-center">
          <h1 className="m-0 text-[3rem] font-medium tracking-[0.06em] text-[#0b5f8f]">PoliGo</h1>
        </header>

        <h2 className="m-0 pb-5 text-[2rem] font-semibold text-[#1f3e66]">Quem esta jogando?</h2>

        <div className="grid gap-4">
          {players.map((player) => (
            <button
              type="button"
              key={player.id}
              className="grid grid-cols-[56px_1fr] items-center gap-4 rounded-[22px] bg-white px-4 py-3 text-left shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-transform duration-200 hover:-translate-y-0.5"
            >
              <span
                className={`grid h-14 w-14 place-items-center rounded-full text-3xl font-semibold ${player.tone}`}
              >
                {player.avatar}
              </span>
              <span>
                <strong className="block text-4xl leading-tight text-[#1f3e66]">{player.name}</strong>
                <span className="block text-[1.55rem] font-semibold text-[#0d6b9f]">{player.phase}</span>
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="mt-5 w-full rounded-[22px] border-[3px] border-dashed border-[#1d74a7] px-6 py-5 text-[2rem] font-semibold text-[#0b5f8f] transition hover:bg-[#e8f3fb]"
        >
          + Novo Detetive
        </button>
      </section>
    </main>
  )
}

export default HomePage
