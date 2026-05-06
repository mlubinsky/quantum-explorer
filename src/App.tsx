import { useState } from 'react'
import { SpinExplorer } from './components/SpinExplorer'
import './App.css'

type Module = 'spin'

const MODULES: { id: Module; label: string; description: string }[] = [
  { id: 'spin', label: 'Spin-½ / Bloch Sphere', description: 'Larmor precession, exact 2×2 matrix dynamics' },
]

export default function App() {
  const [active, setActive] = useState<Module>('spin')

  return (
    <div className="app">
      <header className="app-header">
        <h1>Quantum Explorer</h1>
        <p className="subtitle">Exact analytical quantum mechanics — no backend, no approximations</p>
      </header>

      <nav className="module-nav">
        {MODULES.map(m => (
          <button
            key={m.id}
            className={`module-btn${active === m.id ? ' active' : ''}`}
            onClick={() => setActive(m.id)}
          >
            {m.label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {active === 'spin' && <SpinExplorer />}
      </main>
    </div>
  )
}
