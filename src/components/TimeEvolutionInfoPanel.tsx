import { BlockMath, InlineMath } from './KatexMath'

type Topic = 'main' | 'decomp' | 'expect' | 'norm'
type SubMode = 'isw' | 'ho'

export function TimeEvolutionInfoPanel({ topic, subMode }: { topic: Topic; subMode: SubMode }) {
  if (topic === 'main') return <MainInfo subMode={subMode} />
  if (topic === 'decomp') return <DecompInfo subMode={subMode} />
  if (topic === 'expect') return <ExpectInfo />
  return <NormInfo />
}

function MainInfo({ subMode }: { subMode: SubMode }) {
  return (
    <div style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
      {subMode === 'isw' ? (
        <>
          <section style={{ marginBottom: '1.2rem' }}>
            <h4 style={{ margin: '0 0 6px' }}>ISW superposition</h4>
            <p style={{ margin: '0 0 6px' }}>A general time-evolving state is a superposition of energy eigenstates:</p>
            <BlockMath math="\psi(x,t) = \sum_{n=1}^{8} c_n\,\psi_n(x)\,e^{-iE_n t}" />
            <p style={{ margin: '4px 0 6px' }}>
              The probability density <InlineMath math="|{\psi}(x,t)|^2" /> oscillates due to beating between levels.
            </p>
          </section>
          <section style={{ marginBottom: '1.2rem' }}>
            <h4 style={{ margin: '0 0 6px' }}>Quantum revivals</h4>
            <p style={{ margin: '0 0 6px' }}>
              For the ISW, all energy differences <InlineMath math="E_m - E_n" /> are integer multiples of
              <InlineMath math="E_1 = \pi^2/(2L^2)" />. After the revival time, every phase is an integer multiple of 2π:
            </p>
            <BlockMath math="T_\text{rev} = \frac{4L^2}{\pi} \quad (\hbar = m = 1)" />
            <p style={{ margin: '4px 0 0' }}>
              At <InlineMath math="t = T_\text{rev}" />, <InlineMath math="|\psi(x,t)|^2" /> returns exactly to its initial shape.
            </p>
          </section>
          <section>
            <h4 style={{ margin: '0 0 6px' }}>Ehrenfest theorem</h4>
            <p style={{ margin: 0 }}>
              The orange dashed line marks <InlineMath math="\langle x(t)\rangle" />, which oscillates like a classical
              particle: <InlineMath math="d\langle x\rangle/dt = \langle p\rangle/m" />.
            </p>
          </section>
        </>
      ) : (
        <>
          <section style={{ marginBottom: '1.2rem' }}>
            <h4 style={{ margin: '0 0 6px' }}>HO coherent state</h4>
            <p style={{ margin: '0 0 6px' }}>
              A coherent state <InlineMath math="|\alpha\rangle" /> is a displaced ground state — the most
              "classical-like" pure quantum state:
            </p>
            <BlockMath math="|\alpha\rangle = e^{-|\alpha|^2/2}\sum_{n=0}^{\infty}\frac{\alpha^n}{\sqrt{n!}}|n\rangle" />
            <p style={{ margin: '4px 0 6px' }}>The probability density is an exact Gaussian:</p>
            <BlockMath math="|\psi_\alpha(x,t)|^2 = \sqrt{\frac{\omega}{\pi}}\exp\!\left(-\omega(x-\langle x(t)\rangle)^2\right)" />
          </section>
          <section>
            <h4 style={{ margin: '0 0 6px' }}>Oscillation without spreading</h4>
            <BlockMath math="\langle x(t)\rangle = |\alpha|\sqrt{2/\omega}\cos(\omega t + \varphi_\alpha)" />
            <p style={{ margin: '4px 0 0' }}>
              The width <InlineMath math="\Delta x = 1/\sqrt{2\omega}" /> is constant — coherent states
              saturate the uncertainty bound at all times.
            </p>
          </section>
        </>
      )}
    </div>
  )
}

function DecompInfo({ subMode }: { subMode: SubMode }) {
  return (
    <div style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
      <section style={{ marginBottom: '1.2rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Energy decomposition</h4>
        <p style={{ margin: '0 0 6px' }}>
          The bar chart shows the probability of measuring energy <InlineMath math="E_n" />:
        </p>
        <BlockMath math="P(E_n) = |c_n|^2" />
        <p style={{ margin: '4px 0 0' }}>
          This is time-independent — measuring the energy does not change <InlineMath math="|c_n|^2" />.
          The bars must sum to 1.
        </p>
      </section>
      {subMode === 'ho' && (
        <section>
          <h4 style={{ margin: '0 0 6px' }}>Poisson distribution for coherent states</h4>
          <p style={{ margin: '0 0 6px' }}>
            For <InlineMath math="|\alpha\rangle" />, the weights follow a Poisson distribution with mean
            <InlineMath math="\bar{n} = |\alpha|^2" />:
          </p>
          <BlockMath math="|c_n|^2 = e^{-|\alpha|^2}\frac{|\alpha|^{2n}}{n!}" />
        </section>
      )}
    </div>
  )
}

function ExpectInfo() {
  return (
    <div style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
      <section style={{ marginBottom: '1.2rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Ehrenfest theorem</h4>
        <p style={{ margin: '0 0 6px' }}>Expectation values obey Newton-like equations:</p>
        <BlockMath math="\frac{d\langle x\rangle}{dt} = \frac{\langle p\rangle}{m}, \quad \frac{d\langle p\rangle}{dt} = -\left\langle\frac{dV}{dx}\right\rangle" />
        <p style={{ margin: '4px 0 0' }}>
          For ISW, <InlineMath math="\langle x(t)\rangle" /> oscillates with the beat frequency <InlineMath math="\Delta E_{12}" />;
          for HO coherent state it is exactly sinusoidal.
        </p>
      </section>
      <section>
        <h4 style={{ margin: '0 0 6px' }}>Heisenberg uncertainty</h4>
        <BlockMath math="\Delta x \cdot \Delta p \geq \frac{\hbar}{2} = 0.5 \text{ a.u.}" />
        <p style={{ margin: '4px 0 0' }}>
          The dashed red line at 0.5 marks the uncertainty bound. Coherent states saturate it at all times
          (green line exactly touches red); ISW superpositions generally lie above it.
        </p>
      </section>
    </div>
  )
}

function NormInfo() {
  return (
    <div style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
      <section>
        <h4 style={{ margin: '0 0 6px' }}>Exact norm conservation</h4>
        <p style={{ margin: '0 0 6px' }}>
          The analytical time-evolution <InlineMath math="e^{-iE_n t}" /> is a pure phase factor
          with <InlineMath math="|e^{-iE_n t}| = 1" />, so:
        </p>
        <BlockMath math="\|\psi(t)\|^2 = \sum_n |c_n|^2 = 1 \quad \forall t" />
        <p style={{ margin: '4px 0 0' }}>
          This is a flat line at 1.000 for all time — unlike numerical solvers (Crank-Nicolson,
          split-operator) which conserve norm only approximately.
        </p>
      </section>
    </div>
  )
}
