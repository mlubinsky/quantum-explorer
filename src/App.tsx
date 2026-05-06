import { useState } from 'react'
import { SpinExplorer } from './components/SpinExplorer'
import { StationaryExplorer } from './components/StationaryExplorer'
import { TimeEvolutionExplorer } from './components/TimeEvolutionExplorer'
import { FreeParticleExplorer } from './components/FreeParticleExplorer'
import './App.css'

type Module = 'stationary' | 'time-evolution' | 'free-particle' | 'spin'

const MODULES: { id: Module; label: string }[] = [
  { id: 'stationary',     label: 'Stationary States' },
  { id: 'time-evolution', label: 'Time Evolution' },
  { id: 'free-particle',  label: 'Free Particle' },
  { id: 'spin',           label: 'Spin-½ / Bloch Sphere' },
]

export default function App() {
  const [active, setActive] = useState<Module>('stationary')

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
        {active === 'stationary'     && <StationaryExplorer />}
        {active === 'time-evolution' && <TimeEvolutionExplorer />}
        {active === 'free-particle'  && <FreeParticleExplorer />}
        {active === 'spin'           && <SpinExplorer />}
      </main>
    </div>
  )
}
