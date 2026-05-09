import { BlockMath, InlineMath } from './KatexMath'

export type HydrogenInfoTopic =
  | 'radialDensity'
  | 'radialWavefunction'
  | 'orbital2D'
  | 'angularShape'
  | 'isosurface'
  | 'grotrian'

export function HydrogenInfoPanel({ topic }: { topic: HydrogenInfoTopic }) {
  if (topic === 'radialDensity')    return <RadialDensitySection />
  if (topic === 'radialWavefunction') return <RadialWavefunctionSection />
  if (topic === 'orbital2D')        return <Orbital2DSection />
  if (topic === 'angularShape')     return <AngularShapeSection />
  if (topic === 'isosurface')       return <IsosurfaceSection />
  return <GrotrianSection />
}

function RadialDensitySection() {
  return (
    <div>
      <p>Probability of finding the electron between <em>r</em> and <em>r + dr</em>:</p>
      <BlockMath math="P(r) = r^2 |R_{nl}(r)|^2,\quad \int_0^\infty P(r)\,dr = 1" />
      <p><strong>Mean radius (exact):</strong></p>
      <BlockMath math="\langle r \rangle_{nl} = \frac{3n^2 - l(l+1)}{2Z}" />
      <p>Radial nodes: <InlineMath math="n - l - 1" /> zeros of <InlineMath math="R_{nl}" /> on <InlineMath math="(0,\infty)" />.</p>
    </div>
  )
}

function RadialWavefunctionSection() {
  return (
    <div>
      <p>Radial wavefunction for nuclear charge Z (atomic units):</p>
      <BlockMath math="R_{nl}(r) = N_{nl}\,e^{-Zr/n}\!\left(\frac{2Zr}{n}\right)^{\!l} L_{n-l-1}^{2l+1}\!\!\left(\frac{2Zr}{n}\right)" />
      <BlockMath math="N_{nl} = \sqrt{\left(\frac{2Z}{n}\right)^{\!3}\!\frac{(n-l-1)!}{2n\,(n+l)!}}" />
      <p>The associated Laguerre polynomials <InlineMath math="L_k^\alpha" /> are computed by exact three-term recurrence. First few (Z = 1):</p>
      <BlockMath math="R_{10}=2e^{-r},\quad R_{20}=\tfrac{1}{2\sqrt{2}}(2-r)e^{-r/2},\quad R_{21}=\tfrac{r}{\sqrt{24}}e^{-r/2}" />
    </div>
  )
}

function Orbital2DSection() {
  return (
    <div>
      <p>Cross-section through the nucleus (y = 0) of the full probability density:</p>
      <BlockMath math="|\psi_{nlm}(x,z)|^2 = |R_{nl}(r)|^2\cdot|\Theta_{lm}(\theta)|^2" />
      <p>where <InlineMath math="r = \sqrt{x^2+z^2}" />, <InlineMath math="\theta" /> is the polar angle from z, and <InlineMath math="\Theta_{lm}" /> is the normalised polar factor of the real spherical harmonic, computed from associated Legendre polynomials.</p>
      <p>The colour scale (Viridis, 0–1) is normalised to the maximum of each state.</p>
    </div>
  )
}

function AngularShapeSection() {
  return (
    <div>
      <p>Polar plot of the <strong>φ-integrated</strong> angular density, showing the θ-profile of the electron's angular distribution:</p>
      <BlockMath math="r(\theta) = \int_0^{2\pi}|Y_l^m(\theta,\phi)|^2\,\frac{d\phi}{2\pi} = \frac{2l+1}{2}\cdot\frac{(l-|m|)!}{(l+|m|)!}\cdot|P_l^{|m|}(\cos\theta)|^2" />
      <p>This θ-profile is <strong>identical for m and −m</strong>. The difference between m and −m lies in the φ-factor of the real spherical harmonic:</p>
      <ul>
        <li><InlineMath math="m > 0" />: <InlineMath math="\cos(|m|\phi)" /> factor → lobes in the <strong>xz-plane</strong> (visible in the 2D cross-section at y=0)</li>
        <li><InlineMath math="m < 0" />: <InlineMath math="\sin(|m|\phi)" /> factor → lobes in the <strong>yz-plane</strong> (<InlineMath math="\sin(|m|\phi)|_{\phi=0}=0" />, so the xz cross-section is identically zero)</li>
        <li><InlineMath math="m = 0" />: no φ dependence → cylindrical symmetry around z</li>
      </ul>
      <p>Examples of the θ-profile shape:</p>
      <ul>
        <li><InlineMath math="l=0" /> (s): sphere (circle in polar plot)</li>
        <li><InlineMath math="l=1, m=0" /> (p<sub>z</sub>): two lobes along z</li>
        <li><InlineMath math="l=1, |m|=1" /> (p<sub>x</sub> or p<sub>y</sub>): two lobes along x — same shape, different plane</li>
        <li><InlineMath math="l=2, m=0" /> (d<sub>z²</sub>): double lobe + ring</li>
      </ul>
    </div>
  )
}

function IsosurfaceSection() {
  return (
    <div>
      <p>3D isosurface of the probability density <InlineMath math="|\psi_{nlm}|^2" /> at 10% of its peak value. The surface encloses the region where the electron is most likely to be found.</p>
      <BlockMath math="|\psi_{nlm}(x,y,z)|^2 = |R_{nl}(r)|^2\cdot|Y_l^m(\theta,\phi)|^2" />
      <p>Real spherical harmonics are used, with the φ-factor <InlineMath math="\cos(|m|\phi)" /> for <InlineMath math="m>0" /> and <InlineMath math="\sin(|m|\phi)" /> for <InlineMath math="m<0" />. Drag to rotate; scroll to zoom.</p>
      <p>Computed on a uniform 3D grid using the same exact normalised functions as the 2D cross-section.</p>
    </div>
  )
}

function GrotrianSection() {
  return (
    <div>
      <p>Energy levels of the hydrogen-like atom (columns = angular momentum <em>l</em>):</p>
      <BlockMath math="E_n = -\frac{Z^2}{2n^2}\quad\text{(Hartree)}" />
      <p>Electric dipole (E1) selection rules: <InlineMath math="\Delta l = \pm 1" />, <InlineMath math="\Delta m = 0,\pm 1" />. Arrows are coloured by photon wavelength (Rydberg formula):</p>
      <BlockMath math="\frac{1}{\lambda} = R_\infty Z^2\!\left(\frac{1}{n_f^2}-\frac{1}{n_i^2}\right)" />
      <ul>
        <li>Lyman <InlineMath math="n\to 1" />: UV 91–122 nm (violet dashed)</li>
        <li>Balmer <InlineMath math="n\to 2" />: visible 365–656 nm (solid, wavelength colour)</li>
        <li>Paschen <InlineMath math="n\to 3" />: near-IR (dark red dashed)</li>
        <li>Brackett+ <InlineMath math="n\geq4" />: mid-IR (dark red dashed)</li>
      </ul>
      <p><strong>Click a level</strong> to highlight its allowed decay channels and dim all others. Click the same level again to clear the focus.</p>
    </div>
  )
}
