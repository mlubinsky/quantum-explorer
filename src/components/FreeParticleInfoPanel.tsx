import { BlockMath, InlineMath } from './KatexMath'
import { WikiRefs } from './WikiRefs'

type Topic = 'main' | 'momentum' | 'expect' | 'norm'

const FREE_PARTICLE_LINKS = [
  { label: 'Wave packet — Wikipedia', url: 'https://en.wikipedia.org/wiki/Wave_packet' },
  { label: 'Uncertainty principle — Wikipedia', url: 'https://en.wikipedia.org/wiki/Uncertainty_principle' },
]

export function FreeParticleInfoPanel({ topic }: { topic: Topic }) {
  return (
    <>
      {topic === 'main'     && <MainInfo />}
      {topic === 'momentum' && <MomentumInfo />}
      {topic === 'expect'   && <ExpectInfo />}
      {topic === 'norm'     && <NormInfo />}
      <WikiRefs links={FREE_PARTICLE_LINKS} />
    </>
  )
}

function MainInfo() {
  return (
    <div style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
      <section style={{ marginBottom: '1.2rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Initial Gaussian wavepacket</h4>
        <p style={{ margin: '0 0 6px' }}>
          At <InlineMath math="t = 0" /> the state is a minimum-uncertainty Gaussian centred at <InlineMath math="x_0" /> with width <InlineMath math="\sigma_0" /> and carrier wave vector <InlineMath math="k_0" />:
        </p>
        <BlockMath math="\psi(x,0) = (2\pi\sigma_0^2)^{-1/4}\exp\!\left(-\frac{(x-x_0)^2}{4\sigma_0^2} + ik_0(x-x_0)\right)" />
      </section>

      <section style={{ marginBottom: '1.2rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Exact time evolution</h4>
        <p style={{ margin: '0 0 6px' }}>
          Under the free Hamiltonian <InlineMath math="H = p^2/2" /> the probability density stays Gaussian — it just spreads and translates:
        </p>
        <BlockMath math="|\psi(x,t)|^2 = \frac{1}{\sigma(t)\sqrt{2\pi}}\exp\!\left(-\frac{(x - \langle x(t)\rangle)^2}{2\sigma(t)^2}\right)" />
        <BlockMath math="\sigma(t) = \sigma_0\sqrt{1 + (t/t_0)^2}, \qquad t_0 = 2\sigma_0^2" />
      </section>

      <section style={{ marginBottom: '1.2rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Group vs. phase velocity</h4>
        <p style={{ margin: '0 0 4px' }}>
          The <strong>orange dashed line</strong> tracks the packet centre <InlineMath math="\langle x(t)\rangle = x_0 + k_0 t" />, which moves at the <em>group velocity</em> <InlineMath math="v_g = k_0" />.
        </p>
        <p style={{ margin: '0 0 4px' }}>
          Each plane-wave component <InlineMath math="e^{ikx - ik^2t/2}" /> moves at <em>phase velocity</em>{' '}
          <InlineMath math="v_\text{ph} = k_0/2" />. Toggling Re(ψ) shows the carrier ripples drifting at half the group speed.
        </p>
      </section>

      <section>
        <h4 style={{ margin: '0 0 6px' }}>Spreading time</h4>
        <p style={{ margin: '0' }}>
          At <InlineMath math="t = t_0 = 2\sigma_0^2" /> the width has grown to <InlineMath math="\sigma_0\sqrt{2}" />.
          Wide packets (<InlineMath math="\sigma_0" /> large) spread slowly — increase <InlineMath math="\sigma_0" /> to see the effect.
        </p>
      </section>
    </div>
  )
}

function MomentumInfo() {
  return (
    <div style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
      <section style={{ marginBottom: '1.2rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Fourier transform of the initial state</h4>
        <p style={{ margin: '0 0 6px' }}>
          The momentum-space wavefunction is the Fourier transform of <InlineMath math="\psi(x,0)" />:
        </p>
        <BlockMath math="\phi(k) = \frac{1}{\sqrt{2\pi}}\int_{-\infty}^{\infty} \psi(x,0)\,e^{-ikx}\,dx" />
        <p style={{ margin: '0 0 6px' }}>
          For the Gaussian initial state this is also a Gaussian:
        </p>
        <BlockMath math="|\phi(k)|^2 = \frac{1}{\sigma_p\sqrt{2\pi}}\exp\!\left(-\frac{(k-k_0)^2}{2\sigma_p^2}\right), \qquad \sigma_p = \frac{1}{2\sigma_0}" />
      </section>

      <section style={{ marginBottom: '1.2rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Why it does not change with time</h4>
        <p style={{ margin: '0' }}>
          The energy eigenstates of the free particle are the plane waves <InlineMath math="e^{ikx}" /> with energy <InlineMath math="E_k = k^2/2" />.
          Time evolution only adds a phase <InlineMath math="e^{-ik^2t/2}" /> to each component, which cancels in <InlineMath math="|\phi(k,t)|^2 = |\phi(k)|^2" />.
          The momentum distribution is <em>completely frozen</em> — measuring momentum at any time gives the same result.
        </p>
      </section>

      <section>
        <h4 style={{ margin: '0 0 6px' }}>Heisenberg uncertainty</h4>
        <p style={{ margin: '0' }}>
          At <InlineMath math="t = 0" />: <InlineMath math="\Delta x = \sigma_0" />, <InlineMath math="\Delta p = 1/(2\sigma_0)" />, so{' '}
          <InlineMath math="\Delta x \cdot \Delta p = \hbar/2" /> — the minimum allowed value.
          Making <InlineMath math="\sigma_0" /> small (narrow packet) forces <InlineMath math="\sigma_p" /> large (wide momentum spread) and vice versa.
        </p>
      </section>
    </div>
  )
}

function ExpectInfo() {
  return (
    <div style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
      <section style={{ marginBottom: '1.2rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Ehrenfest theorem</h4>
        <p style={{ margin: '0 0 6px' }}>
          For a free particle the expectation values follow classical equations of motion exactly:
        </p>
        <BlockMath math="\langle x(t)\rangle = x_0 + k_0 t, \qquad \langle p(t)\rangle = k_0 = \text{const}" />
        <p style={{ margin: '0' }}>
          The position grows linearly (classical free particle), the momentum is constant.
        </p>
      </section>

      <section style={{ marginBottom: '1.2rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Spreading of Δx</h4>
        <BlockMath math="\Delta x(t) = \sigma(t) = \sigma_0\sqrt{1 + (t/t_0)^2}, \qquad t_0 = 2\sigma_0^2" />
        <p style={{ margin: '0' }}>
          Once spread, the packet cannot un-spread — there is no restoring force.
          This is qualitatively different from the HO squeezed state, where the width oscillates.
        </p>
      </section>

      <section>
        <h4 style={{ margin: '0 0 6px' }}>Heisenberg uncertainty product</h4>
        <BlockMath math="\Delta x(t)\cdot\Delta p = \frac{1}{2}\sqrt{1 + (t/t_0)^2}" />
        <p style={{ margin: '0' }}>
          Equals <InlineMath math="\hbar/2 = 0.5" /> only at <InlineMath math="t = 0" />.
          Any subsequent evolution increases it — the minimum-uncertainty state is a single instant.
          <InlineMath math="\Delta p = 1/(2\sigma_0)" /> stays constant throughout.
        </p>
      </section>
    </div>
  )
}

function NormInfo() {
  return (
    <div style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
      <section>
        <h4 style={{ margin: '0 0 6px' }}>Exact normalisation</h4>
        <p style={{ margin: '0 0 6px' }}>
          The probability density <InlineMath math="|\psi(x,t)|^2" /> is a Gaussian with unit area for all <InlineMath math="t" />:
        </p>
        <BlockMath math="\int_{-\infty}^{\infty} |\psi(x,t)|^2\,dx = 1 \quad \forall\, t" />
        <p style={{ margin: '0' }}>
          There is no numerical drift because all formulas are exact closed-form — no PDE solver or grid approximation is involved.
          The flat line at 1.000 confirms the analytic result.
        </p>
      </section>
    </div>
  )
}
