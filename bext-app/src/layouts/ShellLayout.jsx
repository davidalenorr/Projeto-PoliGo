import { NavLink, Outlet } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Inicio' },
  { to: '/hub', label: 'Hub' },
  { to: '/laboratorio', label: 'Laboratorio' },
]

function ShellLayout() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex w-[min(1150px,calc(100%-1rem))] items-center justify-between py-3">
          <p className="m-0 font-['Avenir_Next_Condensed'] text-xl text-sky-900 md:text-2xl">BEXT</p>
          <nav className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                    isActive ? 'bg-sky-700 text-white' : 'text-slate-700 hover:bg-slate-200'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <nav className="fixed bottom-3 left-1/2 z-30 flex w-[min(460px,calc(100%-1rem))] -translate-x-1/2 items-center justify-between rounded-2xl border border-slate-200 bg-white/95 p-1 shadow-lg md:hidden">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex-1 rounded-xl px-2 py-2 text-center text-xs font-semibold transition ${
                isActive ? 'bg-sky-700 text-white' : 'text-slate-700'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  )
}

export default ShellLayout
