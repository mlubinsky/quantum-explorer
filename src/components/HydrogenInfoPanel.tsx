import { BlockMath, InlineMath } from './KatexMath'

export type HydrogenInfoTopic =
  | 'radialDensity'
  | 'radialWavefunction'
  | 'orbital2D'
  | 'grotrian'

export function HydrogenInfoPanel({ topic }: { topic: HydrogenInfoTopic }) {
  if (topic === 'radialDensity') return <RadialDensitySection />
  if (topic === 'radialWavefunction') return <RadialWavefunctionSection />
  if (topic === 'orbital2D') return <Orbital2DSection />
  return <GrotrianSection />
}

function RadialDensitySection() {
  return (
    <div>
      <p>The radial probability density gives the probability of finding the electron between <em>r</em> and <em>r + dr</em>:</p>
      <BlockMath math="P(r) = r^2 |R_{nl}(r)|^2" />
      <p>The factor of <InlineMath math="r^2" /> comes from the volume element in spherical coordinates. P(r) is normalised:</p>
      <BlockMath math="\int_0^\infty P(r)\, dr = 1" />
      <p><strong>Mean radius (exact):</strong></p>
      <BlockMath math="\langle r \rangle_{nl} = \frac{1}{2Z}\bigl(3n^2 - l(l+1)\bigr)" />
      <p><strong>Radial nodes:</strong> <InlineMath math="n - l - 1" /> zeros of <InlineMath math="R_{nl}" /> on <InlineMath math="(0, \infty)" />.</p>
    </div>
  )
}

function RadialWavefunctionSection() {
  return (
    <div>
      <p>The radial wavefunction for a hydrogen-like atom with nuclear charge Z:</p>
      <BlockMath math="R_{nl}(r) = N_{nl}\, e^{-Zr/n}\!\left(\frac{2Zr}{n}\right)^{\!l} L_{n-l-1}^{2l+1}\!\!\left(\frac{2Zr}{n}\right)" />
      <p>where <InlineMath math="L_k^\alpha" /> are associated Laguerre polynomials (exact, three-term recurrence), and:</p>
      <BlockMath math="N_{nl} = \sqrt{\left(\frac{2Z}{n}\right)^{\!3} \frac{(n-l-1)!}{2n\,(n+l)!}}" />
      <p>First few (Z = 1):</p>
      <BlockMath math="R_{10} = 2e^{-r},\quad R_{20} = \tfrac{1}{2\sqrt{2}}(2-r)e^{-r/2},\quad R_{21} = \tfrac{1}{\sqrt{24}}\,r\,e^{-r/2}" />
    </div>
  )
}

function Orbital2DSection() {
  return (
    <div>
      <p>The full wavefunction factorises:</p>
      <BlockMath math="\psi_{nlm}(r,\theta,\phi) = R_{nl}(r)\,Y_l^m(\theta,\phi)" />
      <p>The heatmap shows <InlineMath math="|\psi_{nlm}(r,\theta)|^2" /> in the xz-plane (φ = 0), using real spherical harmonics computed from associated Legendre polynomials:</p>
      <BlockMath math="|\psi|^2 = |R_{nl}(r)|^2 \cdot |\Theta_{lm}(\theta)|^2" />
      <ul>
        <li><strong>s orbitals</strong> (l = 0): spherically symmetric.</li>
        <li><strong>p orbitals</strong> (l = 1): dumbbell along z (m=0) or x (m=±1).</li>
        <li><strong>d orbitals</strong> (l = 2): cloverleaf / donut shapes.</li>
      </ul>
    </div>
  )
}

function GrotrianSection() {
  return (
    <div>
      <p>Energy levels of the hydrogen-like atom:</p>
      <BlockMath math="E_n = -\frac{Z^2}{2n^2}\quad\text{(Hartree)}" />
      <p>Columns are spectroscopic labels (s, p, d, f, g) for <InlineMath math="l = 0, 1, 2, 3, 4" />. Electric dipole selection rules: <InlineMath math="\Delta l = \pm 1" />, <InlineMath math="\Delta m = 0, \pm 1" />.</p>
      <p><strong>Spectral series (Z = 1):</strong></p>
      <ul>
        <li>Lyman: <InlineMath math="n \to 1" />, UV, 91–122 nm</li>
        <li>Balmer: <InlineMath math="n \to 2" />, visible, 365–656 nm</li>
        <li>Paschen: <InlineMath math="n \to 3" />, IR, 820–1875 nm</li>
      </ul>
      <BlockMath math="\frac{1}{\lambda} = R_\infty Z^2\!\left(\frac{1}{n_f^2} - \frac{1}{n_i^2}\right)" />
    </div>
  )
}
