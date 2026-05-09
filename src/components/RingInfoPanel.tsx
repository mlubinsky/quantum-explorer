import { BlockMath, InlineMath } from './KatexMath'

export type RingInfoTopic = 'energy' | 'current' | 'wavefunction' | 'wavepacket'

export function RingInfoPanel({ topic }: { topic: RingInfoTopic }) {
  if (topic === 'energy')      return <EnergySection />
  if (topic === 'current')     return <CurrentSection />
  if (topic === 'wavefunction') return <WavefunctionSection />
  return <WavepacketSection />
}

function EnergySection() {
  return (
    <div>
      <p>A spinless particle of mass <InlineMath math="m=1" /> constrained to a ring of radius <InlineMath math="R" />, threaded by magnetic flux <InlineMath math="\Phi" />.</p>
      <p>Dimensionless flux (atomic units, <InlineMath math="\hbar=e=1" />):</p>
      <BlockMath math="\varphi = \Phi / \Phi_0, \quad \Phi_0 = 2\pi" />
      <p>Exact eigenenergies:</p>
      <BlockMath math="E_n(\varphi) = \frac{(n - \varphi)^2}{2R^2}, \quad n \in \mathbb{Z}" />
      <p>The spectrum is <strong>periodic in <InlineMath math="\varphi" /> with period 1</strong>. Adjacent levels <InlineMath math="n" /> and <InlineMath math="n+1" /> cross at <InlineMath math="\varphi = n + \tfrac{1}{2}" />.</p>
      <p>Ground-state quantum number: <InlineMath math="n^*(\varphi) = \text{round}(\varphi)" /> — jumps by <InlineMath math="\pm 1" /> at half-integer <InlineMath math="\varphi" />.</p>
    </div>
  )
}

function CurrentSection() {
  return (
    <div>
      <p>Persistent (equilibrium) current in state <InlineMath math="n" />:</p>
      <BlockMath math="I_n(\varphi) = -\frac{\partial E_n}{\partial \Phi} = \frac{n - \varphi}{R^2}" />
      <p>The <strong>ground-state current</strong> <InlineMath math="I_{gs}(\varphi) = (n^*(\varphi) - \varphi)/R^2" /> is a sawtooth with amplitude <InlineMath math="\pm 1/(2R^2)" /> and period <InlineMath math="\Phi_0" />.</p>
      <p>Discontinuities occur at half-integer <InlineMath math="\varphi" /> (level crossings). The flux-induced current is a purely quantum effect — it persists even at <InlineMath math="T = 0" />.</p>
    </div>
  )
}

function WavefunctionSection() {
  return (
    <div>
      <p>Angular-momentum eigenstates on the ring:</p>
      <BlockMath math="\psi_n(\theta) = \frac{1}{\sqrt{2\pi}}\,e^{in\theta}" />
      <BlockMath math="\operatorname{Re}(\psi_n) = \frac{\cos(n\theta)}{\sqrt{2\pi}}, \quad \operatorname{Im}(\psi_n) = \frac{\sin(n\theta)}{\sqrt{2\pi}}" />
      <p>Probability density <InlineMath math="|\psi_n(\theta)|^2 = 1/(2\pi)" /> is <strong>uniform</strong> for all energy eigenstates — there is no preferred angular position.</p>
      <p>The ring is deformed by <InlineMath math="\operatorname{Re}(\psi_n(\theta))" /> for visual reference. For <InlineMath math="n \neq 0" /> you see <InlineMath math="2|n|" /> lobes; <InlineMath math="n=0" /> is a flat circle.</p>
    </div>
  )
}

function WavepacketSection() {
  return (
    <div>
      <p>Gaussian superposition of angular-momentum states centred at <InlineMath math="n_0 = \text{round}(\varphi)" />, width <InlineMath math="\sigma_\varphi" />:</p>
      <BlockMath math="c_n \propto \exp\!\left(-\frac{(n-n_0)^2}{2\sigma_\varphi^2}\right), \quad \sum_n |c_n|^2 = 1" />
      <BlockMath math="\psi(\theta,t) = \frac{1}{\sqrt{2\pi}}\sum_n c_n\,e^{i(n\theta - E_n(\varphi)\,t)}" />
      <p>Quantum revival time (exact):</p>
      <BlockMath math="T_\text{rev} = 4\pi R^2" />
      <p>At <InlineMath math="\varphi = 0" /> the packet re-forms at <InlineMath math="\theta = 0" />. At <InlineMath math="\varphi = 0.5" /> the AB phase shifts the revival to <InlineMath math="\theta = \pi" />.</p>
    </div>
  )
}
