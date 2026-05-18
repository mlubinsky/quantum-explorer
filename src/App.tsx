import { useState, useEffect } from 'react'
import pkg from '../package.json'
import { parseHash } from './physics/urlState'
import { SpinExplorer } from './components/SpinExplorer'
import { StationaryExplorer } from './components/StationaryExplorer'
import { TimeEvolutionExplorer } from './components/TimeEvolutionExplorer'
import { FreeParticleExplorer } from './components/FreeParticleExplorer'
import { ScatteringExplorer } from './components/ScatteringExplorer'
import { HydrogenExplorer } from './components/HydrogenExplorer'
import { RingExplorer } from './components/RingExplorer'
import { WignerExplorer } from './components/WignerExplorer'
import { TwoParticleExplorer } from './components/TwoParticleExplorer'
import { FourierExplorer } from './components/FourierExplorer'
import { InlineMath } from './components/KatexMath'
import './App.css'

type Module = 'stationary' | 'time-evolution' | 'free-particle' | 'tunnelling' | 'spin' | 'hydrogen' | 'ring' | 'wigner' | 'two-particle' | 'fourier'

const MODULE_GROUPS: { label: string; modules: { id: Module; label: string }[] }[] = [
  {
    label: 'Single Particle — 1D',
    modules: [
      { id: 'stationary',     label: 'Stationary States' },
      { id: 'time-evolution', label: 'Time Evolution' },
      { id: 'free-particle',  label: 'Free Particle' },
      { id: 'tunnelling',     label: 'Scattering' },
      { id: 'wigner',         label: 'Wigner Function' },
      { id: 'fourier',        label: 'Fourier Explorer' },
    ],
  },
  {
    label: 'Atoms & Fields',
    modules: [
      { id: 'hydrogen', label: 'Hydrogen Atom' },
      { id: 'ring',     label: 'Ring & A-B' },
    ],
  },
  {
    label: 'Two Particles',
    modules: [
      { id: 'two-particle', label: 'Bosons & Fermions (ISW)' },
    ],
  },
  {
    label: 'Quantum Information',
    modules: [
      { id: 'spin', label: 'Spin-½ / Bloch Sphere' },
    ],
  },
]

const ALL_MODULE_IDS: Module[] = MODULE_GROUPS.flatMap(g => g.modules.map(m => m.id))

function moduleFromHash(): Module {
  const { moduleId } = parseHash(window.location.hash)
  return ALL_MODULE_IDS.includes(moduleId as Module) ? (moduleId as Module) : 'stationary'
}

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
  'wigner': {
    eq: String.raw`W(x,p)=\tfrac{1}{\pi}\!\int_{-\infty}^{\infty}\!\psi^*(x+y)\,\psi(x-y)\,e^{2ipy}\,dy`,
    bc: String.raw`\textstyle\int W\,dp=|\psi(x)|^2,\quad\int W\,dx=|\tilde\psi(p)|^2,\quad\iint W\,dx\,dp=1`,
  },
  'two-particle': {
    eq: String.raw`\Psi_{B/F}(x_1,x_2)=\tfrac{\psi_m(x_1)\psi_n(x_2)\pm\psi_n(x_1)\psi_m(x_2)}{\sqrt{2}},\quad m\neq n`,
    bc: String.raw`E=E_m+E_n,\quad\Psi_F(x,x)=0\ \forall x,\quad|\Psi_B(x,x)|^2=2|\Psi_D(x,x)|^2\ \text{(HBT)}`,
  },
  'fourier': {
    eq: String.raw`\hat\psi(k)=\tfrac{1}{\sqrt{2\pi}}\int_{-\infty}^{\infty}\psi(x)\,e^{-ikx}\,dx`,
    bc: String.raw`\Delta x\,\Delta k\geq\tfrac{1}{2};\quad\sigma_k=\sqrt{\tfrac{1}{4\sigma^2}+\beta^2\sigma^2};\quad|\hat\psi_n(k)|^2\text{ peaks at }k=\pm n\pi/L`,
  },
}

export default function App() {
  const [active, setActive] = useState<Module>(moduleFromHash)
  const info = MODULE_INFO[active]

  // Sync hash → state when user navigates with browser back/forward
  useEffect(() => {
    const onPop = () => setActive(moduleFromHash())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // Sync state → hash (pushState so back/forward works; doesn't trigger popstate)
  useEffect(() => {
    const hash = `#${active}`
    if (window.location.hash !== hash) {
      window.history.pushState(null, '', hash)
    }
  }, [active])

  return (
    <div className="app">
      <header className="app-header">
        <h1>Quantum Explorer</h1>
        <select
          className="module-select"
          value={active}
          onChange={e => setActive(e.target.value as Module)}
          aria-label="Select module"
        >
          {MODULE_GROUPS.map(g => (
            <optgroup key={g.label} label={g.label}>
              {g.modules.map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </header>

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
        {active === 'wigner'         && <WignerExplorer />}
        {active === 'two-particle'   && <TwoParticleExplorer />}
        {active === 'fourier'        && <FourierExplorer />}
      </main>

      <footer className="app-footer">
        Michael Lubinsky &nbsp;·&nbsp; v{pkg.version}
      </footer>

      <a
        className="feedback-fab"
        href="https://github.com/mlubinsky/quantum-explorer/discussions/new/choose"
        target="_blank"
        rel="noreferrer"
      >
        💬 Feedback
      </a>
    </div>
  )
}
