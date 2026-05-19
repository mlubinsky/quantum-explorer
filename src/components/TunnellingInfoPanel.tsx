import { BlockMath, InlineMath } from './KatexMath'
import { WikiRefs } from './WikiRefs'

export type TunnellingInfoTopic = 'tvsE' | 'wavefunction' | 'potential'

const TUNNELLING_LINKS = [
  { label: 'Transfer-matrix method — Wikipedia', url: 'https://en.wikipedia.org/wiki/Transfer-matrix_method_(optics)' },
  { label: 'WKB approximation — Wikipedia', url: 'https://en.wikipedia.org/wiki/WKB_approximation' },
]

export function TunnellingInfoPanel({ topic }: { topic: TunnellingInfoTopic }) {
  return (
    <>
      <div style={{ fontSize: '0.9rem', lineHeight: 1.55 }}>
        {topic === 'tvsE'        && <TvsESection />}
        {topic === 'wavefunction' && <WavefunctionSection />}
        {topic === 'potential'   && <PotentialSection />}
      </div>
      <WikiRefs links={TUNNELLING_LINKS} />
    </>
  )
}

function TvsESection() {
  return (
    <>
      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Transfer-matrix result</h4>
        <p style={{ margin: '0 0 6px' }}>
          Matching the piecewise plane-wave solutions at both barrier edges gives exact
          expressions for T. Define outside wave vector <InlineMath math="k=\sqrt{2E}" /> and
          inside wave vector <InlineMath math="\kappa=\sqrt{2(E-V_0)}" />.
        </p>
        <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '0.88rem' }}>Above barrier (E &gt; V₀):</p>
        <BlockMath math="T = \frac{1}{1 + \dfrac{V_0^2\sin^2(\kappa L)}{4E(E-V_0)}}" />
        <p style={{ margin: '4px 0 4px', fontWeight: 600, fontSize: '0.88rem' }}>Tunnelling (E &lt; V₀):</p>
        <BlockMath math="T = \frac{1}{1 + \dfrac{V_0^2\sinh^2(\tilde\kappa L)}{4E(V_0-E)}},\quad \tilde\kappa = \sqrt{2(V_0-E)}" />
        <p style={{ margin: '4px 0 0', color: '#aaa', fontSize: '0.85em' }}>
          In both cases <InlineMath math="R = 1-T" /> exactly (probability conservation).
        </p>
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Transmission resonances</h4>
        <p style={{ margin: '0 0 6px' }}>
          When <InlineMath math="\kappa L = n\pi" /> (<InlineMath math="n=1,2,\ldots" />),{' '}
          <InlineMath math="\sin(\kappa L)=0" /> and{' '}
          <InlineMath math="T=1" /> exactly — perfect transmission through the barrier.
          This occurs at energies:
        </p>
        <BlockMath math="E_n = V_0 + \frac{n^2\pi^2}{2L^2}" />
        <p style={{ margin: '4px 0 0', color: '#aaa', fontSize: '0.85em' }}>
          Analogy: Fabry-Pérot resonator. The barrier width matches an integer number of
          half-wavelengths inside, so reflected waves cancel by destructive interference.
        </p>
      </section>

      <section>
        <h4 style={{ margin: '0 0 6px' }}>WKB approximation</h4>
        <p style={{ margin: '0 0 6px' }}>
          For thick barriers (<InlineMath math="\tilde\kappa L \gg 1" />) the exact formula
          simplifies to the WKB result:
        </p>
        <BlockMath math="T_\mathrm{WKB} = e^{-2\tilde\kappa L}" />
        <p style={{ margin: '4px 0 0', color: '#aaa', fontSize: '0.85em' }}>
          The exact T is always slightly larger than the WKB estimate because the
          pre-exponential prefactor (from interface reflections) exceeds 1.
          For <InlineMath math="\tilde\kappa L \gtrsim 3" /> the two are within a few percent.
        </p>
      </section>
    </>
  )
}

function WavefunctionSection() {
  return (
    <>
      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Piecewise stationary wavefunction</h4>
        <p style={{ margin: '0 0 6px' }}>
          With the barrier spanning <InlineMath math="-L/2 \leq x \leq L/2" />, the exact
          stationary scattering state is:
        </p>
        <BlockMath math="\psi(x) = \begin{cases} e^{ikx} + r\,e^{-ikx} & x < -L/2 \\ A\,e^{i\kappa x} + B\,e^{-i\kappa x} & |x| \leq L/2 \\ t\,e^{ikx} & x > L/2 \end{cases}" />
        <p style={{ margin: '4px 0 0' }}>
          The coefficients <InlineMath math="r, t, A, B" /> are determined by continuity
          of <InlineMath math="\psi" /> and <InlineMath math="\psi'" /> at both edges.
        </p>
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Probability density</h4>
        <p style={{ margin: '0 0 6px' }}>
          In each region:
        </p>
        <BlockMath math="|\psi_L|^2 = 1 + R + 2\sqrt{R}\cos(2kx + \phi_r)" />
        <BlockMath math="|\psi_R|^2 = T \quad\text{(constant)}" />
        <p style={{ margin: '4px 0 0', color: '#aaa', fontSize: '0.85em' }}>
          The standing-wave pattern on the left has amplitude <InlineMath math="1+R" /> at
          the anti-nodes and <InlineMath math="(1-\sqrt{R})^2" /> at the nodes.
          On the right the amplitude is flat at <InlineMath math="T" />.
        </p>
      </section>

      <section>
        <h4 style={{ margin: '0 0 6px' }}>Evanescent wave</h4>
        <p style={{ margin: '0 0 0' }}>
          For <InlineMath math="E < V_0" /> the interior solution is{' '}
          <InlineMath math="\psi_B = A\,e^{\tilde\kappa x} + B\,e^{-\tilde\kappa x}" /> —
          real exponentials that decay across the barrier.
          The probability density falls from the entry face to the exit, but is non-zero
          everywhere: quantum tunnelling allows the particle to appear on the far side.
        </p>
      </section>
    </>
  )
}

function PotentialSection() {
  return (
    <>
      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Barrier vs well</h4>
        <p style={{ margin: '0 0 6px' }}>
          <strong>V₀ &gt; 0</strong> — repulsive barrier. Classically, a particle with{' '}
          <InlineMath math="E < V_0" /> is completely reflected (<InlineMath math="T=0" />).
          Quantum mechanically, <InlineMath math="T > 0" /> always — tunnelling.
        </p>
        <p style={{ margin: '0 0 0' }}>
          <strong>V₀ &lt; 0</strong> — attractive well. <InlineMath math="T \leq 1" />{' '}
          with perfect-transmission resonances where the well acts as an
          anti-reflection coating. Above resonance, <InlineMath math="T \to 1" /> as{' '}
          <InlineMath math="E \to \infty" />.
        </p>
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Classical vs quantum</h4>
        <table style={{ fontSize: '0.85rem', width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ color: '#aaa', borderBottom: '1px solid #333' }}>
              <th style={{ textAlign: 'left', paddingBottom: 4 }}>Case</th>
              <th style={{ textAlign: 'center', paddingBottom: 4 }}>Classical T</th>
              <th style={{ textAlign: 'center', paddingBottom: 4 }}>Quantum T</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '3px 0' }}>E &lt; V₀ (barrier)</td>
              <td style={{ textAlign: 'center' }}>0</td>
              <td style={{ textAlign: 'center', color: '#06d6a0' }}>&gt; 0</td>
            </tr>
            <tr>
              <td style={{ padding: '3px 0' }}>E = V₀</td>
              <td style={{ textAlign: 'center' }}>1</td>
              <td style={{ textAlign: 'center', color: '#f77f00' }}>&lt; 1</td>
            </tr>
            <tr>
              <td style={{ padding: '3px 0' }}>E &gt; V₀ (resonance)</td>
              <td style={{ textAlign: 'center' }}>&lt; 1</td>
              <td style={{ textAlign: 'center', color: '#06d6a0' }}>= 1</td>
            </tr>
            <tr>
              <td style={{ padding: '3px 0' }}>E → ∞</td>
              <td style={{ textAlign: 'center' }}>1</td>
              <td style={{ textAlign: 'center' }}>→ 1</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h4 style={{ margin: '0 0 6px' }}>Atomic units</h4>
        <p style={{ margin: '0 0 0', color: '#aaa', fontSize: '0.85em' }}>
          All quantities in atomic units: ħ = m = 1.
          1 a.u. of energy = 27.2 eV (1 Hartree).
          1 a.u. of length = 0.529 Å (Bohr radius).
          Typical tunnel barrier in molecules: V₀ ≈ 1–5 a.u., L ≈ 1–4 a.u.
        </p>
      </section>
    </>
  )
}
