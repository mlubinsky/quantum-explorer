import { BlockMath, InlineMath } from './KatexMath'

export type ScatteringInfoTopic =
  | 'tvsE' | 'wavefunction' | 'potential'
  | 'stepTvsE' | 'stepWavefunction' | 'stepPotential'
  | 'deltaTvsE' | 'deltaWavefunction' | 'deltaPotential'
  | 'ptTvsE' | 'ptWavefunction' | 'ptPotential'
  | 'kpDispersion' | 'kpBandStructure' | 'kpBands'
  | 'morsePotential' | 'morseWavefunction' | 'morseAnharmonicity'

export function ScatteringInfoPanel({ topic }: { topic: ScatteringInfoTopic }) {
  return (
    <div style={{ fontSize: '0.9rem', lineHeight: 1.55 }}>
      {topic === 'tvsE'              && <BarrierTvsESection />}
      {topic === 'wavefunction'      && <BarrierWavefunctionSection />}
      {topic === 'potential'         && <BarrierPotentialSection />}
      {topic === 'stepTvsE'          && <StepTvsESection />}
      {topic === 'stepWavefunction'  && <StepWavefunctionSection />}
      {topic === 'stepPotential'     && <StepPotentialSection />}
      {topic === 'deltaTvsE'         && <DeltaTvsESection />}
      {topic === 'deltaWavefunction' && <DeltaWavefunctionSection />}
      {topic === 'deltaPotential'    && <DeltaPotentialSection />}
      {topic === 'ptTvsE'            && <PtTvsESection />}
      {topic === 'ptWavefunction'    && <PtWavefunctionSection />}
      {topic === 'ptPotential'       && <PtPotentialSection />}
      {topic === 'kpDispersion'        && <KpDispersionSection />}
      {topic === 'kpBandStructure'     && <KpBandStructureSection />}
      {topic === 'kpBands'             && <KpBandsSection />}
      {topic === 'morsePotential'      && <MorsePotentialSection />}
      {topic === 'morseWavefunction'   && <MorseWavefunctionSection />}
      {topic === 'morseAnharmonicity'  && <MorseAnharmonicitySection />}
    </div>
  )
}

// ── Barrier topics ─────────────────────────────────────────────────────────────

function BarrierTvsESection() {
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
          <InlineMath math="T=1" /> exactly — perfect transmission. This occurs at:
        </p>
        <BlockMath math="E_n = V_0 + \frac{n^2\pi^2}{2L^2}" />
        <p style={{ margin: '4px 0 0', color: '#aaa', fontSize: '0.85em' }}>
          Analogy: Fabry-Pérot resonator. Reflected waves cancel by destructive interference
          when the barrier width equals an integer number of half-wavelengths inside.
        </p>
      </section>

      <section>
        <h4 style={{ margin: '0 0 6px' }}>WKB approximation</h4>
        <p style={{ margin: '0 0 6px' }}>
          For thick barriers (<InlineMath math="\tilde\kappa L \gg 1" />) the exact result
          simplifies to:
        </p>
        <BlockMath math="T_\mathrm{WKB} = e^{-2\tilde\kappa L}" />
        <p style={{ margin: '4px 0 0', color: '#aaa', fontSize: '0.85em' }}>
          The exact T is always slightly larger because the pre-exponential prefactor exceeds 1.
          For <InlineMath math="\tilde\kappa L \gtrsim 3" /> the two agree within a few percent.
        </p>
      </section>
    </>
  )
}

function BarrierWavefunctionSection() {
  return (
    <>
      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Piecewise stationary wavefunction</h4>
        <BlockMath math="\psi(x) = \begin{cases} e^{ikx} + r\,e^{-ikx} & x < -L/2 \\ A\,e^{i\kappa x} + B\,e^{-i\kappa x} & |x| \leq L/2 \\ t\,e^{ikx} & x > L/2 \end{cases}" />
        <p style={{ margin: '4px 0 0' }}>
          Continuity of <InlineMath math="\psi" /> and <InlineMath math="\psi'" /> at both edges
          uniquely fixes <InlineMath math="r, t, A, B" />.
        </p>
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Probability density</h4>
        <BlockMath math="|\psi_L|^2 = 1 + R + 2\sqrt{R}\cos(2kx + \phi_r)" />
        <BlockMath math="|\psi_R|^2 = T \quad\text{(constant)}" />
        <p style={{ margin: '4px 0 0', color: '#aaa', fontSize: '0.85em' }}>
          Anti-node amplitude = <InlineMath math="(1+\sqrt{R})^2" />;
          node amplitude = <InlineMath math="(1-\sqrt{R})^2" />.
          Right of barrier: flat at T.
        </p>
      </section>

      <section>
        <h4 style={{ margin: '0 0 6px' }}>Evanescent wave (E &lt; V₀)</h4>
        <p style={{ margin: '0 0 0' }}>
          Interior: <InlineMath math="\psi_B = A e^{\tilde\kappa x} + B e^{-\tilde\kappa x}" />.
          Density decays across the barrier, but is non-zero — the particle has
          a finite probability to appear on the far side (tunnelling).
        </p>
      </section>
    </>
  )
}

function BarrierPotentialSection() {
  return (
    <>
      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Barrier vs well</h4>
        <p style={{ margin: '0 0 6px' }}>
          <strong>V₀ &gt; 0</strong> — repulsive barrier. Classically T = 0 for E &lt; V₀.
          Quantum mechanically T &gt; 0 always.
        </p>
        <p style={{ margin: '0 0 0' }}>
          <strong>V₀ &lt; 0</strong> — attractive well. Resonances (T = 1) occur;
          the well acts as an anti-reflection coating.
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
            {[
              ['E < V₀ (barrier)', '0', '> 0', '#06d6a0'],
              ['E = V₀', '1', '< 1', '#f77f00'],
              ['E > V₀ (resonance)', '< 1', '= 1', '#06d6a0'],
              ['E → ∞', '1', '→ 1', '#e0e0e0'],
            ].map(([c, cl, qu, col]) => (
              <tr key={c as string}>
                <td style={{ padding: '3px 0' }}>{c}</td>
                <td style={{ textAlign: 'center' }}>{cl}</td>
                <td style={{ textAlign: 'center', color: col as string }}>{qu}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h4 style={{ margin: '0 0 6px' }}>Atomic units</h4>
        <p style={{ margin: '0 0 0', color: '#aaa', fontSize: '0.85em' }}>
          ħ = m = 1. 1 a.u. energy = 27.2 eV. 1 a.u. length = 0.529 Å.
        </p>
      </section>
    </>
  )
}

// ── Step topics ────────────────────────────────────────────────────────────────

function StepTvsESection() {
  return (
    <>
      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Boundary-matching at one interface</h4>
        <p style={{ margin: '0 0 6px' }}>
          With <InlineMath math="k_1=\sqrt{2E}" /> (left) and{' '}
          <InlineMath math="k_2=\sqrt{2(E-V_0)}" /> (right), matching <InlineMath math="\psi" /> and{' '}
          <InlineMath math="\psi'" /> at <InlineMath math="x=0" /> gives:
        </p>
        <BlockMath math="r = \frac{k_1-k_2}{k_1+k_2}, \qquad t = \frac{2k_1}{k_1+k_2}" />
        <p style={{ margin: '4px 0 6px', fontWeight: 600, fontSize: '0.88rem' }}>Probability current ratio (E &gt; V₀):</p>
        <BlockMath math="T = \frac{k_2}{k_1}|t|^2 = \frac{4k_1 k_2}{(k_1+k_2)^2}, \qquad R = \left(\frac{k_1-k_2}{k_1+k_2}\right)^2" />
        <p style={{ margin: '4px 0 0', color: '#aaa', fontSize: '0.85em' }}>
          The <InlineMath math="k_2/k_1" /> factor comes from the probability <em>current</em>{' '}
          <InlineMath math="j = |\psi|^2 v" />, not just the amplitude.
          Without it T + R ≠ 1.
        </p>
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Total reflection (E ≤ V₀)</h4>
        <p style={{ margin: '0 0 6px' }}>
          For <InlineMath math="E \leq V_0" />, <InlineMath math="k_2" /> is imaginary.
          The reflection amplitude becomes a pure phase factor:
        </p>
        <BlockMath math="r = \frac{k_1 - i\kappa}{k_1 + i\kappa}, \qquad |r|^2 = 1" />
        <p style={{ margin: '4px 0 0', color: '#aaa', fontSize: '0.85em' }}>
          T = 0 exactly — 100% reflection — but an evanescent wave still penetrates into
          the step region with amplitude decaying as <InlineMath math="e^{-\kappa x}" />.
        </p>
      </section>

      <section>
        <h4 style={{ margin: '0 0 6px' }}>Classical vs quantum (step)</h4>
        <p style={{ margin: '0 0 0' }}>
          Remarkably, the step T formula is <em>identical</em> to the classical result for
          E &gt; V₀: a classical particle slowing from speed <InlineMath math="\sqrt{2E}" /> to{' '}
          <InlineMath math="\sqrt{2(E-V_0)}" /> also gives partial reflection from the
          impedance mismatch. The quantum surprise is instead in the wavefunction —
          the standing-wave interference pattern on the left and the evanescent tail for
          E &lt; V₀ are purely quantum effects.
        </p>
      </section>
    </>
  )
}

function StepWavefunctionSection() {
  return (
    <>
      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Stationary scattering state</h4>
        <BlockMath math="\psi(x) = \begin{cases} e^{ik_1 x} + r\,e^{-ik_1 x} & x < 0 \\ t\,e^{ik_2 x} & x \geq 0 \text{ (above step)} \\ t\,e^{-\kappa x} & x \geq 0 \text{ (below step)} \end{cases}" />
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Standing-wave pattern (x &lt; 0)</h4>
        <BlockMath math="|\psi|^2 = 1 + R + 2\sqrt{R}\cos(2k_1 x + \phi_r)" />
        <p style={{ margin: '4px 0 6px' }}>
          Fringe visibility: <InlineMath math="V = 2\sqrt{R}/(1+R)" />.
          When R = 1 (total reflection): V = 1 — perfect dark and bright fringes
          with period <InlineMath math="\lambda/2 = \pi/k_1" />.
        </p>
        <p style={{ margin: '0 0 0', color: '#aaa', fontSize: '0.85em' }}>
          For E ≪ V₀: <InlineMath math="r \to -1" />, so{' '}
          <InlineMath math="|\psi|^2 = 4\sin^2(k_1 x)" /> — perfect standing wave
          with a node at x = 0.
        </p>
      </section>

      <section>
        <h4 style={{ margin: '0 0 6px' }}>Evanescent penetration (E &lt; V₀)</h4>
        <BlockMath math="|\psi|^2 = |t|^2\,e^{-2\kappa x}, \qquad \delta = \frac{1}{\kappa} = \frac{1}{\sqrt{2(V_0-E)}}" />
        <p style={{ margin: '4px 0 0', color: '#aaa', fontSize: '0.85em' }}>
          At E = V₀: <InlineMath math="\delta \to \infty" /> — the wave penetrates
          arbitrarily far, yet T = 0 because there is no propagating component
          and therefore no net probability current.
        </p>
      </section>
    </>
  )
}

function StepPotentialSection() {
  return (
    <>
      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Step vs barrier</h4>
        <p style={{ margin: '0 0 6px' }}>
          The step is the <em>semi-infinite</em> limit of the rectangular barrier (L → ∞).
          With only one interface there are no resonances — T rises monotonically from
          0 to 1 as E increases above V₀.
        </p>
        <p style={{ margin: '0 0 0' }}>
          Optical analogy: the step is a single glass surface; the barrier is a
          glass slab (two surfaces, Fabry-Pérot cavity).
        </p>
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Upward vs downward step</h4>
        <p style={{ margin: '0 0 6px' }}>
          <strong>V₀ &gt; 0 (upward step):</strong> particle slows down in region II.
          Partial reflection for E &gt; V₀; total reflection for E &lt; V₀.
          Analogous to light going from a rare to a dense medium.
        </p>
        <p style={{ margin: '0 0 0' }}>
          <strong>V₀ &lt; 0 (downward step):</strong> particle speeds up. Partial
          reflection for all E &gt; 0 — <InlineMath math="T < 1" /> even though the
          particle gains energy. No evanescent region exists. Analogous to light
          going from dense to rare medium.
        </p>
      </section>

      <section>
        <h4 style={{ margin: '0 0 6px' }}>What to explore</h4>
        <ul style={{ margin: 0, paddingLeft: '1.2em', color: '#aaa', fontSize: '0.85em' }}>
          <li>Set E just above V₀ — T is small, standing waves nearly perfect on the left.</li>
          <li>Set E ≫ V₀ — T → 1, standing-wave amplitude → 0 (no reflection).</li>
          <li>Set V₀ &lt; 0 — partial reflection from a well, penetration depth disappears.</li>
          <li>Watch the evanescent tail shrink as E increases toward V₀ from below.</li>
        </ul>
      </section>
    </>
  )
}

// ── Delta topics ───────────────────────────────────────────────────────────────

function DeltaTvsESection() {
  return (
    <>
      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Exact transmission formula</h4>
        <p style={{ margin: '0 0 6px' }}>
          With <InlineMath math="k = \sqrt{2E}" /> and coupling strength{' '}
          <InlineMath math="\alpha = |g|" />, boundary matching at <InlineMath math="x=0" /> gives:
        </p>
        <BlockMath math="T = \frac{k^2}{k^2 + \alpha^2} = \frac{2E}{2E + \alpha^2}, \qquad R = \frac{\alpha^2}{k^2+\alpha^2}" />
        <p style={{ margin: '4px 0 0', color: '#aaa', fontSize: '0.85em' }}>
          T starts at 0, rises monotonically to 1. No resonances. No threshold.
          T depends only on <InlineMath math="\alpha^2" /> — the same for attractive and
          repulsive delta with equal <InlineMath math="\alpha" />.
        </p>
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Half-transmission and the bound state</h4>
        <p style={{ margin: '0 0 6px' }}>
          For the attractive delta (<InlineMath math="g = -\alpha" />), the bound-state energy is{' '}
          <InlineMath math="E_b = -\alpha^2/2" />. Substituting <InlineMath math="E = |E_b|" />:
        </p>
        <BlockMath math="T(|E_b|) = \frac{\alpha^2}{\alpha^2 + \alpha^2} = \frac{1}{2}" />
        <p style={{ margin: '4px 0 0', color: '#aaa', fontSize: '0.85em' }}>
          The bound-state energy sets the energy scale for scattering — a deep well scatters
          more strongly than a shallow one.
        </p>
      </section>

      <section>
        <h4 style={{ margin: '0 0 6px' }}>Comparison with other potentials</h4>
        <table style={{ fontSize: '0.85rem', width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ color: '#aaa', borderBottom: '1px solid #333' }}>
              <th style={{ textAlign: 'left', paddingBottom: 4 }}>Potential</th>
              <th style={{ textAlign: 'center', paddingBottom: 4 }}>T at low E</th>
              <th style={{ textAlign: 'center', paddingBottom: 4 }}>Resonances</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Barrier (width L)', '→ 0 (tunnelling)', 'Yes (T=1 at κL=nπ)'],
              ['Step', '= 0 (E < V₀)', 'No'],
              ['Delta', '→ 0 (no threshold)', 'No'],
            ].map(([p, lo, res]) => (
              <tr key={p as string} style={{ borderBottom: '1px solid #1e1e1e' }}>
                <td style={{ padding: '4px 0' }}>{p}</td>
                <td style={{ textAlign: 'center' }}>{lo}</td>
                <td style={{ textAlign: 'center' }}>{res}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  )
}

function DeltaWavefunctionSection() {
  return (
    <>
      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Scattering wavefunction</h4>
        <BlockMath math="\psi(x) = \begin{cases} e^{ikx} + r\,e^{-ikx} & x < 0 \\ t\,e^{ikx} & x \geq 0 \end{cases}" />
        <p style={{ margin: '4px 0 6px' }}>
          Continuity at <InlineMath math="x=0" />: <InlineMath math="1+r = t" />.
          Derivative jump: <InlineMath math="\psi'(0^+) - \psi'(0^-) = 2g\,\psi(0)" />.
          Solving:
        </p>
        <BlockMath math="t = \frac{ik}{ik - g}, \qquad r = \frac{g}{ik - g}" />
        <p style={{ margin: '4px 0 0', color: '#aaa', fontSize: '0.85em' }}>
          Key result: <InlineMath math="|\psi(x)|^2 = T" /> for all <InlineMath math="x > 0" /> —
          perfectly flat, no standing wave on the transmitted side.
        </p>
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Bound state (attractive only)</h4>
        <BlockMath math="\psi_b(x) = \sqrt{\alpha}\,e^{-\alpha|x|}, \qquad E_b = -\frac{\alpha^2}{2}" />
        <p style={{ margin: '4px 0 6px' }}>
          Normalised: <InlineMath math="\int_{-\infty}^\infty |\psi_b|^2\,dx = 1" />.
          Probability density peaks at <InlineMath math="|\psi_b(0)|^2 = \alpha" />.
          Penetration depth = <InlineMath math="1/\alpha" />.
        </p>
        <p style={{ margin: '0 0 0', color: '#aaa', fontSize: '0.85em' }}>
          The delta function has exactly one bound state for any <InlineMath math="\alpha > 0" />,
          however small — unlike a finite square well which needs a minimum depth.
        </p>
      </section>

      <section>
        <h4 style={{ margin: '0 0 6px' }}>Standing wave on the left</h4>
        <BlockMath math="|\psi(x)|^2 = 1 + R + 2\bigl(r_{\mathrm{Re}}\cos 2kx + r_{\mathrm{Im}}\sin 2kx\bigr), \quad x < 0" />
        <p style={{ margin: '4px 0 0', color: '#aaa', fontSize: '0.85em' }}>
          Amplitude oscillates between{' '}
          <InlineMath math="(1-\sqrt{R})^2" /> and <InlineMath math="(1+\sqrt{R})^2" />.
          The sin term has opposite sign for attractive vs repulsive —
          same <InlineMath math="|r|" /> but different phase.
        </p>
      </section>
    </>
  )
}

function DeltaPotentialSection() {
  return (
    <>
      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>What is a delta potential?</h4>
        <p style={{ margin: '0 0 6px' }}>
          <InlineMath math="V(x) = g\,\delta(x)" /> is a zero-range contact interaction —
          the particle feels a force only exactly at <InlineMath math="x=0" />.
          The Schrödinger equation everywhere except the origin is just the free-particle
          equation; the delta enters only via the derivative boundary condition.
        </p>
        <p style={{ margin: '0 0 0', color: '#aaa', fontSize: '0.85em' }}>
          Physical realisation: a very thin, very tall barrier or well in the limit where
          the product <InlineMath math="\alpha = V_0 L" /> is kept fixed as <InlineMath math="L \to 0" />.
        </p>
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Striking symmetry: same T for ±α</h4>
        <p style={{ margin: '0 0 6px' }}>
          The transmission coefficient <InlineMath math="T = k^2/(k^2+\alpha^2)" /> depends
          on <InlineMath math="\alpha^2" /> only. An attractive and a repulsive delta of the same
          strength reflect equally — a strong attractive well is as opaque as a strong wall.
        </p>
        <p style={{ margin: '0 0 0', color: '#aaa', fontSize: '0.85em' }}>
          Contrast: classically, the attractive well would allow perfect transmission for all E.
          Quantum mechanically, the wave nature of the particle makes even an attractive singularity
          a near-perfect reflector in the strong-coupling limit.
        </p>
      </section>

      <section>
        <h4 style={{ margin: '0 0 6px' }}>Only one bound state</h4>
        <p style={{ margin: '0 0 0' }}>
          Any attractive delta has exactly one bound state, regardless of <InlineMath math="\alpha" />.
          This contrasts with the finite square well, which needs a minimum depth
          <InlineMath math="V_0 \geq \pi^2/(8L^2)" /> to bind even one state.
          The delta is the maximally concentrated well — one bound state, infinitely sharp.
        </p>
      </section>
    </>
  )
}

// ── Pöschl-Teller topics ───────────────────────────────────────────────────────

function PtTvsESection() {
  return (
    <>
      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>The reflectionless result</h4>
        <p style={{ margin: '0 0 6px' }}>
          For integer <InlineMath math="N" />, the Pöschl-Teller potential is{' '}
          <strong>reflectionless</strong> — transmission is perfect at every energy:
        </p>
        <BlockMath math="T(E) = 1, \quad R(E) = 0 \quad \text{for all } E > 0" />
        <p style={{ margin: '4px 0 0', color: '#aaa', fontSize: '0.85em' }}>
          Classically, a particle with <InlineMath math="E < V_0" /> bounces back
          (<InlineMath math="T_\mathrm{cl} = 0" />). Quantum mechanically, the wave
          always passes through — the reflected components from all points in the
          smooth well cancel exactly by destructive interference.
        </p>
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Why integer N?</h4>
        <p style={{ margin: '0 0 6px' }}>
          The potential <InlineMath math="V(x) = -\tfrac{N(N+1)\alpha^2}{2}\,\mathrm{sech}^2(\alpha x)" />{' '}
          is exactly solvable for any <InlineMath math="\lambda" /> via the substitution{' '}
          <InlineMath math="\lambda(\lambda+1) = 2V_0/\alpha^2" />. The S-matrix has
          the exact form:
        </p>
        <BlockMath math="t(k) = \prod_{n=1}^{N} \frac{k - i n\alpha}{k + i n\alpha}" />
        <p style={{ margin: '4px 0 0', color: '#aaa', fontSize: '0.85em' }}>
          Each factor has <InlineMath math="|{(k-in\alpha)}/{(k+in\alpha)}|=1" />, so{' '}
          <InlineMath math="|t|^2 = 1" /> — the product of pure phases is still a
          pure phase. R = 0 follows from unitarity: <InlineMath math="|r|^2 = 1 - |t|^2 = 0" />.
          For non-integer <InlineMath math="\lambda" />, the product doesn't close and <InlineMath math="R > 0" />.
        </p>
      </section>

      <section>
        <h4 style={{ margin: '0 0 6px' }}>Physical analogy</h4>
        <p style={{ margin: '0 0 0' }}>
          An anti-reflection coating on a camera lens eliminates reflection by destructive
          interference at both surfaces. The Pöschl-Teller well is the quantum analogue —
          a smooth potential shape that cancels its own reflected wave at every energy
          simultaneously.
        </p>
      </section>
    </>
  )
}

function PtWavefunctionSection() {
  return (
    <>
      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Bound-state energies</h4>
        <BlockMath math="E_j = -\frac{\alpha^2 (N-j)^2}{2}, \quad j = 0, 1, \ldots, N{-}1" />
        <p style={{ margin: '4px 0 6px' }}>
          <InlineMath math="j=0" /> is the ground state (deepest).{' '}
          The top state always has <InlineMath math="E_{N-1} = -\alpha^2/2" />, independent of <InlineMath math="N" />.
          All states satisfy <InlineMath math="-V_0 < E_j < 0" />.
        </p>
        <p style={{ margin: '0 0 0', color: '#aaa', fontSize: '0.85em' }}>
          The <InlineMath math="j" />-th state has exactly <InlineMath math="j" /> nodes (node theorem).
          Even <InlineMath math="j" /> → symmetric wavefunction; odd <InlineMath math="j" /> → antisymmetric.
        </p>
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Wavefunctions via Rodrigues formula</h4>
        <BlockMath math="\psi_j(x) \propto P_N^{N-j}(\tanh\alpha x) = \mathrm{sech}^{N-j}(\alpha x)\cdot\left[\frac{d^{N-j}P_N}{du^{N-j}}\right]_{\!u=\tanh\alpha x}" />
        <p style={{ margin: '4px 0 6px' }}>
          where <InlineMath math="P_N" /> is the Legendre polynomial of degree <InlineMath math="N" />.
          Explicit forms:
        </p>
        <table style={{ fontSize: '0.82rem', borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            {[
              ['j=0', 'sech^N(αx)'],
              ['j=1', 'sech^{N−1}(αx)·tanh(αx)'],
              ['j=2', 'sech^{N−2}(αx)·[(2N−1)tanh²(αx)−1]'],
            ].map(([j, f]) => (
              <tr key={j} style={{ borderBottom: '1px solid #1e1e1e' }}>
                <td style={{ padding: '3px 8px 3px 0', color: '#aaa', whiteSpace: 'nowrap' }}>{j}</td>
                <td style={{ padding: '3px 0', fontFamily: 'monospace', fontSize: '0.80rem' }}>{f}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h4 style={{ margin: '0 0 6px' }}>Unique bound-state property</h4>
        <p style={{ margin: '0 0 0' }}>
          Unlike the delta potential (one bound state for any depth) or the finite square
          well (integer count depends on depth), the Pöschl-Teller well has{' '}
          <em>exactly</em> <InlineMath math="N" /> bound states by construction —
          the integer <InlineMath math="N" /> controls both the depth <InlineMath math="V_0 = N(N+1)\alpha^2/2" />{' '}
          and the number of states simultaneously.
        </p>
      </section>
    </>
  )
}

function PtPotentialSection() {
  return (
    <>
      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>The sech² shape</h4>
        <BlockMath math="V(x) = -\frac{N(N+1)\alpha^2}{2}\,\mathrm{sech}^2(\alpha x)" />
        <p style={{ margin: '4px 0 6px' }}>
          <InlineMath math="\mathrm{sech}^2(u) = 1/\cosh^2(u)" /> decays exponentially
          as <InlineMath math="e^{-2\alpha|x|}" /> for large <InlineMath math="|x|" />.
          The well has depth <InlineMath math="V_0 = N(N+1)\alpha^2/2" /> at <InlineMath math="x=0" />{' '}
          and half-width <InlineMath math="{\approx}\,1/\alpha" />.
        </p>
        <p style={{ margin: '0 0 0', color: '#aaa', fontSize: '0.85em' }}>
          Increasing <InlineMath math="\alpha" /> narrows and deepens the well proportionally.
          Increasing <InlineMath math="N" /> adds bound states and deepens the well while
          keeping the width fixed.
        </p>
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Role in inverse scattering theory</h4>
        <p style={{ margin: '0 0 0' }}>
          The Pöschl-Teller family are the simplest{' '}
          <em>reflectionless potentials</em> — a class discovered by
          Kay and Moses (1956) via the Gel&apos;fand-Levitan inverse scattering method.
          They are the building blocks of multi-soliton solutions to the
          Korteweg-de Vries (KdV) equation — each bound state corresponds to one soliton.
        </p>
      </section>

      <section>
        <h4 style={{ margin: '0 0 6px' }}>Comparison with other wells</h4>
        <table style={{ fontSize: '0.85rem', width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ color: '#aaa', borderBottom: '1px solid #333' }}>
              <th style={{ textAlign: 'left', paddingBottom: 4 }}>Potential</th>
              <th style={{ textAlign: 'center', paddingBottom: 4 }}>Bound states</th>
              <th style={{ textAlign: 'center', paddingBottom: 4 }}>T (E &lt; V₀)</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Delta −αδ(x)', '1 (always)', '< 1'],
              ['Finite square well', 'depends on depth', '< 1 (tunnelling)'],
              ['Pöschl-Teller', 'exactly N', '1 (always!)'],
            ].map(([p, b, t]) => (
              <tr key={p as string} style={{ borderBottom: '1px solid #1e1e1e' }}>
                <td style={{ padding: '4px 0' }}>{p}</td>
                <td style={{ textAlign: 'center' }}>{b}</td>
                <td style={{ textAlign: 'center', color: t === '1 (always!)' ? '#06d6a0' : '#e0e0e0' }}>{t}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  )
}

// ── Kronig-Penney topics ───────────────────────────────────────────────────────

function KpDispersionSection() {
  return (
    <>
      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Dispersion relation</h4>
        <p>Bloch boundary conditions at each delta barrier give the exact condition:</p>
        <BlockMath math="\cos(Ka) = f(ka), \quad f(u) = \cos u + P\,\frac{\sin u}{u}" />
        <p>where <InlineMath math="u = ka = a\sqrt{2E}" />, <InlineMath math="K" /> is the Bloch wavevector, and <InlineMath math="P = \alpha a" />.</p>
        <p><strong>Allowed band</strong>: <InlineMath math="|f| \leq 1" /> — propagating Bloch state exists.</p>
        <p><strong>Forbidden gap</strong>: <InlineMath math="|f| > 1" /> — evanescent, no real K.</p>
        <p>At <InlineMath math="u=n\pi" />: <InlineMath math="\sin(n\pi)=0" />, so <InlineMath math="f=(-1)^n=\pm 1" /> — always a band boundary, for any P.</p>
      </section>
      <section>
        <h4 style={{ margin: '0 0 6px' }}>Limits</h4>
        <p><strong>P = 0</strong>: free particle (<InlineMath math="f=\cos ka \in [-1,1]" />, no gaps).</p>
        <p><strong>P → ∞</strong>: bands collapse, full spectrum forbidden except at <InlineMath math="ka=n\pi" />.</p>
      </section>
    </>
  )
}

function KpBandStructureSection() {
  return (
    <>
      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Reduced Brillouin zone</h4>
        <BlockMath math="Ka = \arccos\!\bigl(f(ka)\bigr) \in [0,\pi]" />
        <p>Plotting <InlineMath math="E" /> vs <InlineMath math="Ka/\pi" /> in the first zone gives the band structure. Successive bands alternate direction: band 1 runs <InlineMath math="Ka\!:\,0\!\to\!\pi" />, band 2 runs <InlineMath math="\pi\!\to\!0" />, etc.</p>
      </section>
      <section>
        <h4 style={{ margin: '0 0 6px' }}>Zone-boundary energies</h4>
        <BlockMath math="E_n = \frac{(n\pi/a)^2}{2}, \quad n=1,2,3,\ldots" />
        <p>At <InlineMath math="E_n" />, <InlineMath math="f=\pm 1" /> exactly. Gaps open symmetrically around these energies; gap width grows with P.</p>
      </section>
    </>
  )
}

function KpBandsSection() {
  return (
    <section>
      <h4 style={{ margin: '0 0 6px' }}>Physical picture</h4>
      <p>A periodic lattice Bragg-reflects waves at <InlineMath math="k = n\pi/a" />, splitting the free-particle parabola into allowed bands with forbidden gaps. In the delta-function KP model, complete stop-bands arise from constructive/destructive Bragg interference — the same delta barrier that gives <InlineMath math="T = k^2/(k^2+\alpha^2)" /> individually now blocks all propagation within a gap energy range.</p>
      <p>Higher bands are wider: the relative effect of each barrier shrinks as <InlineMath math="\Delta E/E \sim \alpha/\sqrt{E}" /> at large E.</p>
    </section>
  )
}

// ── Morse topics ───────────────────────────────────────────────────────────────

function MorsePotentialSection() {
  return (
    <>
      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Morse potential</h4>
        <BlockMath math="V(x) = D_e\!\left(e^{-2\alpha x} - 2\,e^{-\alpha x}\right)" />
        <p style={{ margin: '4px 0' }}>
          <InlineMath math="V_{\min} = -D_e" /> at <InlineMath math="x = 0" /> (equilibrium);{' '}
          <InlineMath math="V \to 0" /> as <InlineMath math="x \to +\infty" /> (dissociation);{' '}
          <InlineMath math="V \to +\infty" /> as <InlineMath math="x \to -\infty" /> (repulsive wall).
        </p>
        <p style={{ margin: '4px 0' }}>Key parameters:</p>
        <BlockMath math="\lambda = \frac{\sqrt{2D_e}}{\alpha},\quad \omega_e = \alpha\sqrt{2D_e} = \alpha^2\lambda" />
        <p style={{ margin: '4px 0', color: '#aaa', fontSize: '0.87em' }}>
          <InlineMath math="\lambda" /> is the dimensionless well depth; <InlineMath math="\omega_e" /> is the harmonic
          frequency at the minimum. Number of bound states: <InlineMath math="N = \lfloor \lambda - \tfrac{1}{2}\rfloor + 1" />.
        </p>
      </section>
      <section>
        <h4 style={{ margin: '0 0 6px' }}>Exact eigenvalues</h4>
        <BlockMath math="E_n = -\frac{\alpha^2}{2}\!\left(\lambda - n - \tfrac{1}{2}\right)^2,\quad n = 0, 1, \ldots, \lfloor\lambda - \tfrac{1}{2}\rfloor" />
        <p style={{ margin: '4px 0', color: '#aaa', fontSize: '0.87em' }}>
          All <InlineMath math="E_n < 0" /> (bound). At <InlineMath math="n = n_{\max}" />,{' '}
          <InlineMath math="E_{n_{\max}} \to 0" /> as <InlineMath math="n_{\max} \to \lambda - \tfrac{1}{2}" />{' '}
          (dissociation threshold).
        </p>
      </section>
    </>
  )
}

function MorseWavefunctionSection() {
  return (
    <>
      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Exact wavefunctions</h4>
        <BlockMath math="\psi_n(x) = N_n\, z^{\lambda - n - \frac{1}{2}}\, e^{-z/2}\, L_n^{(k)}(z)" />
        <p style={{ margin: '4px 0 8px' }}>
          where <InlineMath math="z = 2\lambda\,e^{-\alpha x}" />, <InlineMath math="k = 2\lambda - 2n - 1" />,
          and <InlineMath math="L_n^{(k)}" /> is the associated Laguerre polynomial.
        </p>
        <p style={{ margin: '4px 0' }}>Normalization constant:</p>
        <BlockMath math="N_n = \sqrt{\frac{\alpha\,k\,n!}{\Gamma(2\lambda - n)}}" />
        <p style={{ margin: '4px 0', color: '#aaa', fontSize: '0.87em' }}>
          <InlineMath math="\psi_n" /> has exactly <InlineMath math="n" /> nodes. The classical turning points
          follow from <InlineMath math="V(x) = E_n" />:
        </p>
        <BlockMath math="x_{\text{left}} = -\frac{\ln(1+\beta)}{\alpha},\quad x_{\text{right}} = -\frac{\ln(1-\beta)}{\alpha},\quad \beta = \sqrt{1 + E_n/D_e}" />
      </section>
    </>
  )
}

function MorseAnharmonicitySection() {
  return (
    <>
      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Anharmonic level spacing</h4>
        <BlockMath math="\Delta E_n = E_{n+1} - E_n = \alpha^2(\lambda - n - 1)" />
        <p style={{ margin: '4px 0' }}>
          The harmonic oscillator has constant spacing <InlineMath math="\omega_e = \alpha^2\lambda" />.
          The Morse spacing decreases linearly:{' '}
          <InlineMath math="\Delta E_n = \omega_e - \alpha^2(n+1)" />.
        </p>
        <p style={{ margin: '4px 0' }}>
          The last gap closes as <InlineMath math="n \to n_{\max}" />, signalling approach to dissociation.
          The <InlineMath math="\Delta E_n / \omega_e" /> column shows the anharmonic ratio; it equals 1
          for the harmonic oscillator and falls toward 0 near dissociation.
        </p>
      </section>
      <section>
        <h4 style={{ margin: '0 0 6px' }}>Comparison to harmonic oscillator</h4>
        <p style={{ margin: '4px 0', color: '#aaa', fontSize: '0.87em' }}>
          For small <InlineMath math="\alpha" /> (wide, shallow well) with fixed <InlineMath math="\omega_e" />,
          the Morse levels approach the HO ladder <InlineMath math="-D_e + \omega_e(n+\tfrac{1}{2})" />.
          The first anharmonic correction to the spacing is <InlineMath math="-\alpha^2" /> per level,
          which grows as the well gets steeper or the energy approaches the dissociation limit.
        </p>
      </section>
    </>
  )
}
