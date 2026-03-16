function LabPage() {
  return (
    <main className="mx-auto w-[min(1150px,calc(100%-1rem))] pb-24 pt-3 md:pb-12 md:pt-4">
      <section className="rounded-3xl border border-sky-900/15 bg-white/90 p-5 shadow-lg md:p-6">
        <h1 className="m-0 font-['Avenir_Next_Condensed'] text-4xl text-sky-900 md:text-5xl">Laboratorio</h1>
        <p className="mt-2 text-slate-600">
          Nesta tela vamos adicionar o canvas p5.js com manipulacao de vertices e formulas em tempo real.
        </p>

        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
          Canvas interativo entra no proximo passo.
        </div>
      </section>
    </main>
  )
}

export default LabPage
