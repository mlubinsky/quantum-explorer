import { BlockMath, InlineMath } from './KatexMath'
import { WikiRefs } from './WikiRefs'

export function MomentumInfoPanel() {
  return (
    <div style={{ fontSize: '0.9rem', lineHeight: 1.55 }}>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Fourier transform</h4>
        <p style={{ margin: '0 0 6px' }}>
          Every state has a momentum-space representation{' '}
          <InlineMath math="\varphi_n(k)" /> related to the position-space
          wavefunction by:
        </p>
        <BlockMath math="\varphi_n(k) = \frac{1}{\sqrt{2\pi}} \int_{-\infty}^{\infty} \psi_n(x)\, e^{-ikx}\, dx" />
        <p style={{ margin: '4px 0 0' }}>
          <InlineMath math="|\varphi_n(k)|^2" /> is the probability density of
          measuring momentum <InlineMath math="\hbar k" /> (with ħ = 1 in a.u.).
        </p>
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Infinite square well — exact formula</h4>
        <BlockMath math="|\varphi_n(k)|^2 = \frac{4n^2\pi}{L^3} \cdot \frac{\sin^2\!\bigl(\tfrac{kL}{2} - \tfrac{n\pi}{2}\bigr)}{\bigl((n\pi/L)^2 - k^2\bigr)^2}" />
        <p style={{ margin: '4px 0 0' }}>
          The expression is 0/0 at <InlineMath math="k = \pm n\pi/L" />;
          the resolved limit is <InlineMath math="L/(4\pi)" />.
          For odd n the distribution peaks at k = 0 (the wavefunction has a
          non-zero spatial average). For even n it is zero at k = 0.
        </p>
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Harmonic oscillator — self-duality</h4>
        <p style={{ margin: '0 0 6px' }}>
          For <InlineMath math="V(x) = \tfrac{1}{2}\omega^2 x^2" />,
          the Fourier transform maps eigenfunctions to eigenfunctions:
        </p>
        <BlockMath math="|\varphi_n(k;\,\omega)|^2 = |\psi_n(k;\,1/\omega)|^2" />
        <p style={{ margin: '4px 0 6px' }}>
          The momentum distribution is the <em>same formula</em> as the
          position distribution, but with the reciprocal frequency{' '}
          <InlineMath math="1/\omega" />.
        </p>
        <p style={{ margin: 0 }}>
          At <InlineMath math="\omega = 1" />: the distributions are{' '}
          <strong>identical</strong> — the HO is self-dual under the
          Fourier transform. At <InlineMath math="\omega > 1" />: position is
          compressed, momentum is spread; at{' '}
          <InlineMath math="\omega < 1" />: the reverse.
        </p>
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Heisenberg uncertainty</h4>
        <BlockMath math="\sigma_x \cdot \sigma_p \geq \tfrac{\hbar}{2} = \tfrac{1}{2}" />
        <p style={{ margin: '4px 0 0' }}>
          The HO ground state <InlineMath math="(n=0)" /> saturates the bound:
          <InlineMath math="\sigma_x = \sigma_p = 1/\sqrt{2\omega}" /> at ω = 1,
          giving <InlineMath math="\sigma_x\sigma_p = 1/2" /> exactly.
        </p>
      </section>

      <section>
        <h4 style={{ margin: '0 0 6px' }}>What to explore</h4>
        <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
          <li>ISW: increase n — the distribution shifts weight to larger |k|,
            reflecting higher momentum at higher energy.</li>
          <li>ISW: increase L — the distribution narrows (wider well → more
            precisely defined momentum — Heisenberg).</li>
          <li>HO: set ω = 1 and compare the momentum plot to the wavefunction
            plot — they should look identical.</li>
          <li>HO: increase ω above 1 and watch the momentum distribution widen
            while the position distribution narrows.</li>
        </ul>
      </section>

      <WikiRefs links={[
        { label: 'Position and momentum space — Wikipedia', url: 'https://en.wikipedia.org/wiki/Position_and_momentum_space' },
        { label: 'Momentum operator — Wikipedia', url: 'https://en.wikipedia.org/wiki/Momentum_operator' },
      ]} />
    </div>
  )
}
