import { useState } from 'react'
import pkg from '../package.json'
import { SpinExplorer } from './components/SpinExplorer'
import { StationaryExplorer } from './components/StationaryExplorer'
import { TimeEvolutionExplorer } from './components/TimeEvolutionExplorer'
import { FreeParticleExplorer } from './components/FreeParticleExplorer'
import { ScatteringExplorer } from './components/ScatteringExplorer'
import { HydrogenExplorer } from './components/HydrogenExplorer'
import { RingExplorer } from './components/RingExplorer'
import { InlineMath } from './components/KatexMath'
import './App.css'

type Module = 'stationary' | 'time-evolution' | 'free-particle' | 'tunnelling' | 'spin' | 'hydrogen' | 'ring'

const MODULES: { id: Module; label: string }[] = [
  { id: 'stationary',     label: 'Stationary States' },
  { id: 'time-evolution', label: 'Time Evolution' },
  { id: 'free-particle',  label: 'Free Particle' },
  { id: 'tunnelling',     label: 'Scattering' },
  { id: 'spin',           label: 'Spin-½ / Bloch Sphere' },
  { id: 'hydrogen',       label: 'Hydrogen Atom' },
  { id: 'ring',           label: 'Ring & A-B' },
]

const MODULE_INFO: Record<Module, { eq: string; bc: string }> = {
  'stationary': {
    eq: String.raw`\hat{H}\psi = E\psi,\quad \hat{H}=-\tfrac{1}{2}\tfrac{d^2}{dx^2}+V(x)`,
    bc: String.raw`\text{ISW: }\psi(0)=\psi(L)=0\;\cdot\;\text{HO: }\psi\to 0\ (|x|\to\infty)`,
  },
  'time-evolution': {
    eq: String.raw`i\,\tfrac{\partial\psi}{\partial t}=\hat{H}\psi,\quad\hat{H}=-\tfrac{1}{2}\tfrac{\partial^2}{\partial x^2}+V(x)`,
    bc: String.raw`\psi(x,t)=\textstyle\sum_n c_n\phi_n(x)\,e^{-iE_nt}`,
  },
  'free-particle': {
    eq: String.raw`i\,\tfrac{\partial\psi}{\partial t}=-\tfrac{1}{2}\tfrac{\partial^2\psi}{\partial x^2},\quad V(x)=0`,
    bc: String.raw`v_g=k_0,\quad v_\phi=k_0/2,\quad\sigma(t)=\sigma_0\sqrt{1+(t/t_0)^2},\quad\psi\to 0\ (|x|\to\infty)`,
  },
  'tunnelling': {
    eq: String.raw`-\tfrac{1}{2}\psi''+V(x)\psi=E\psi,\quad V=V_0\ (|x|\le L/2),\ 0\ \text{otherwise}`,
    bc: String.raw`x\to-\infty\text{: }\psi=e^{ikx}+r\,e^{-ikx};\quad x\to+\infty\text{: }\psi=t\,e^{ikx}`,
  },
  'spin': {
    eq: String.raw`H=\tfrac{\omega_0}{2}(\hat{B}\cdot\boldsymbol{\sigma}),\quad|\psi\rangle=\alpha|\!\uparrow\rangle+\beta|\!\downarrow\rangle,\quad|\alpha|^2+|\beta|^2=1`,
    bc: String.raw`\mathbf{r}=(\sin\theta\cos\varphi,\;\sin\theta\sin\varphi,\;\cos\theta),\quad|\mathbf{r}|=1\ (\text{pure state})`,
  },
  'hydrogen': {
    eq: String.raw`\hat{H}\psi=E\psi,\quad\hat{H}=-\tfrac{1}{2}\nabla^2+V(r),\quad V(r)=-Z/r`,
    bc: String.raw`E_n=-Z^2/(2n^2),\quad\psi\to 0\ (r\to\infty),\quad\psi\ \text{regular at}\ r=0`,
  },
  'ring': {
    eq: String.raw`\hat{H}=\tfrac{1}{2}\!\left(-i\tfrac{d}{d\phi}-\tfrac{\Phi}{\Phi_0}\right)^{\!2},\quad\Phi_0=2\pi\ \text{(a.u.)}`,
    bc: String.raw`\psi(\phi+2\pi)=e^{\,i2\pi\Phi/\Phi_0}\,\psi(\phi)`,
  },
}

export default function App() {
  const [active, setActive] = useState<Module>('stationary')
  const info = MODULE_INFO[active]

  return (
    <div className="app">
      <header className="app-header">
        <h1>Quantum Explorer</h1>
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

      <div className="module-strip">
        <div className="module-strip-eq"><InlineMath math={info.eq} /></div>
        <div className="module-strip-bc"><InlineMath math={info.bc} /></div>
      </div>

      <main className="app-main">
        {active === 'stationary'     && <StationaryExplorer />}
        {active === 'time-evolution' && <TimeEvolutionExplorer />}
        {active === 'free-particle'  && <FreeParticleExplorer />}
        {active === 'tunnelling'     && <ScatteringExplorer />}
        {active === 'spin'           && <SpinExplorer />}
        {active === 'hydrogen'       && <HydrogenExplorer />}
        {active === 'ring'           && <RingExplorer />}
      </main>

      <footer className="app-footer">
        Michael Lubinsky &nbsp;·&nbsp; v{pkg.version}
      </footer>
    </div>
  )
}
