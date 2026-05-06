import { BlockMath, InlineMath } from './KatexMath'

type Topic = 'main' | 'decomp' | 'expect' | 'norm' | 'momentum'
type SubMode = 'isw' | 'ho' | 'ho-sq'

export function TimeEvolutionInfoPanel({ topic, subMode }: { topic: Topic; subMode: SubMode }) {
  if (topic === 'main')     return <MainInfo subMode={subMode} />
  if (topic === 'decomp')   return <DecompInfo subMode={subMode} />
  if (topic === 'expect')   return <ExpectInfo subMode={subMode} />
  if (topic === 'momentum') return <MomentumInfo subMode={subMode} />
  return <NormInfo />
}

function MainInfo({ subMode }: { subMode: SubMode }) {
  return (
    <div style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
      {subMode === 'ho-sq' ? (
        <>
          <section style={{ marginBottom: '1.2rem' }}>
            <h4 style={{ margin: '0 0 6px' }}>HO squeezed coherent state</h4>
            <p style={{ margin: '0 0 6px' }}>The squeeze operator <InlineMath math="S(r) = \exp(r(a^2 - a^{\dagger 2})/2)" /> compresses one quadrature while stretching the other. Under HO time evolution the squeezing angle rotates at 2ω, producing a "breathing" Gaussian:</p>
            <BlockMath math="|\psi_\text{sq}(x,t)|^2 = \frac{1}{\sqrt{\pi}\,\sigma(t)}\exp\!\left(-\frac{(x-\langle x(t)\rangle)^2}{\sigma^2(t)}\right)" />
            <BlockMath math="\sigma(t) = \sqrt{\frac{\cosh(2r) - \sinh(2r)\cos(2\omega t)}{\omega}}" />
          </section>
          <section>
            <h4 style={{ margin: '0 0 6px' }}>Breathing period = π/ω</h4>
            <p style={{ margin: 0 }}>Width oscillates between <InlineMath math="e^{-r}/\sqrt{\omega}" /> (squeezed, narrowest) and <InlineMath math="e^r/\sqrt{\omega}" /> (anti-squeezed, widest). The product <InlineMath math="\Delta x \cdot \Delta p" /> reaches its minimum ħ/2 twice per breath (when the squeeze axis aligns with x or p), and its maximum <InlineMath math="\cosh(2r)/2" /> at the 45° angle.</p>
          </section>
        </>
      ) : subMode === 'isw' ? (
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

function MomentumInfo({ subMode }: { subMode: SubMode }) {
  return (
    <div style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
      {subMode === 'isw' ? (
        <section style={{ marginBottom: '1.2rem' }}>
          <h4 style={{ margin: '0 0 6px' }}>ISW time-evolved momentum distribution</h4>
          <p style={{ margin: '0 0 6px' }}>The momentum amplitude is the sum of time-evolved eigenstate amplitudes:</p>
          <BlockMath math="\phi(k,t) = \sum_n c_n e^{-iE_n t}\,\phi_n(k)" />
          <p style={{ margin: '4px 0 6px' }}>where <InlineMath math="\phi_n(k)" /> is the exact Fourier transform of <InlineMath math="\psi_n(x)" />. The de Broglie wavenumbers <InlineMath math="k = \pm n\pi/L" /> appear as Bragg peaks. Interference between levels causes the distribution to shift and reshape as the phases rotate.</p>
        </section>
      ) : subMode === 'ho' ? (
        <section style={{ marginBottom: '1.2rem' }}>
          <h4 style={{ margin: '0 0 6px' }}>HO coherent state in momentum space</h4>
          <p style={{ margin: '0 0 6px' }}>Coherent states are Gaussian in both position and momentum:</p>
          <BlockMath math="|\phi_\alpha(k,t)|^2 = \frac{1}{\sqrt{\pi\omega}}\exp\!\left(-\frac{(k - \langle p(t)\rangle)^2}{\omega}\right)" />
          <p style={{ margin: '4px 0 0' }}>Width <InlineMath math="\Delta p = \sqrt{\omega/2}" /> is constant. The peak tracks <InlineMath math="\langle p(t)\rangle = -|\alpha|\sqrt{2\omega}\sin(\omega t + \varphi_\alpha)" /> — in quadrature with the position oscillation.</p>
        </section>
      ) : (
        <section style={{ marginBottom: '1.2rem' }}>
          <h4 style={{ margin: '0 0 6px' }}>Squeezed state in momentum space</h4>
          <p style={{ margin: '0 0 6px' }}>The momentum distribution also breathes, but out of phase with position:</p>
          <BlockMath math="|\phi_\text{sq}(k,t)|^2 = \frac{1}{\sqrt{\pi}\,\sigma_p(t)}\exp\!\left(-\frac{(k-\langle p(t)\rangle)^2}{\sigma_p^2(t)}\right)" />
          <BlockMath math="\sigma_p(t) = \sqrt{\omega\left(\cosh(2r) + \sinh(2r)\cos(2\omega t)\right)}" />
          <p style={{ margin: '4px 0 0' }}>When x is squeezed (narrow position peak), p is anti-squeezed (wide momentum peak), and vice versa. The position and momentum widths breathe at 2ω, exactly out of phase.</p>
        </section>
      )}
      <section>
        <h4 style={{ margin: '0 0 6px' }}>Heisenberg duality</h4>
        <p style={{ margin: 0 }}>Position and momentum peaks are always in quadrature: when <InlineMath math="\langle x\rangle" /> is maximum, <InlineMath math="\langle p\rangle = 0" />, and vice versa. This is the Fourier uncertainty principle made visual.</p>
      </section>
    </div>
  )
}

function ExpectInfo({ subMode }: { subMode: SubMode }) {
  return (
    <div style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
      <section style={{ marginBottom: '1.2rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Ehrenfest theorem</h4>
        <p style={{ margin: '0 0 6px' }}>Expectation values obey Newton-like equations:</p>
        <BlockMath math="\frac{d\langle x\rangle}{dt} = \frac{\langle p\rangle}{m}, \quad \frac{d\langle p\rangle}{dt} = -\left\langle\frac{dV}{dx}\right\rangle" />
        <p style={{ margin: '4px 0 0' }}>
          For ISW, <InlineMath math="\langle x(t)\rangle" /> oscillates with the beat frequency <InlineMath math="\Delta E_{12}" />;
          for HO coherent/squeezed states it is exactly sinusoidal.
        </p>
      </section>
      <section>
        <h4 style={{ margin: '0 0 6px' }}>Heisenberg uncertainty</h4>
        <BlockMath math="\Delta x \cdot \Delta p \geq \frac{\hbar}{2} = 0.5 \text{ a.u.}" />
        <p style={{ margin: '4px 0 0' }}>
          {subMode === 'ho-sq'
            ? 'For a squeezed state, Δx·Δp oscillates between ħ/2 (minimum uncertainty, twice per breath) and cosh(2r)/2 (maximum, when the squeeze axis is at 45°). Watch the green line dip to the red bound twice per π/ω cycle.'
            : 'The dashed red line at 0.5 marks the uncertainty bound. Coherent states saturate it at all times (green exactly on red); ISW superpositions generally lie above it.'}
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
