import { BlockMath, InlineMath } from './KatexMath'

export type HydrogenInfoTopic =
  | 'radialDensity'
  | 'radialWavefunction'
  | 'orbital2D'
  | 'angularShape'
  | 'isosurface'
  | 'grotrian'
  | 'zeeman'
  | 'anomalousZeeman'
  | 'stark'
  | 'emissionSpectra'

export function HydrogenInfoPanel({ topic }: { topic: HydrogenInfoTopic }) {
  if (topic === 'radialDensity')     return <RadialDensitySection />
  if (topic === 'radialWavefunction') return <RadialWavefunctionSection />
  if (topic === 'orbital2D')         return <Orbital2DSection />
  if (topic === 'angularShape')      return <AngularShapeSection />
  if (topic === 'isosurface')        return <IsosurfaceSection />
  if (topic === 'zeeman')            return <ZeemanSection />
  if (topic === 'anomalousZeeman')   return <AnomalousZeemanSection />
  if (topic === 'stark')             return <StarkSection />
  if (topic === 'emissionSpectra')   return <EmissionSpectraSection />
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

function ZeemanSection() {
  return (
    <div>
      <p>In a uniform magnetic field <strong>B</strong> along z, the energy of sublevel |n, l, m<sub>l</sub>⟩ becomes:</p>
      <BlockMath math="E(n,l,m_l,B) = E_n + \mu_B B m_l = -\frac{Z^2}{2n^2} + \frac{B\, m_l}{2}" />
      <p>where <InlineMath math="\mu_B = \tfrac{1}{2}" /> in atomic units (Bohr magneton). Each degenerate level splits into 2l + 1 equally-spaced sublevels.</p>
      <p><strong>Lorentz triplet:</strong> any E1-allowed transition (Δl = ±1) produces exactly three distinct frequencies regardless of l:</p>
      <BlockMath math="\Delta E = \Delta E_0 + \mu_B B\,\Delta m_l, \quad \Delta m_l \in \{-1,\,0,\,+1\}" />
      <p>The photon energy depends only on Δm<sub>l</sub>, not on the specific m<sub>l</sub> values — multiple paths contribute to each component at the same frequency.</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginTop: 8 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #444' }}>
            <th style={{ textAlign: 'left', padding: '3px 8px', color: '#aaa' }}>Component</th>
            <th style={{ textAlign: 'left', padding: '3px 8px', color: '#aaa' }}>Δm<sub>l</sub></th>
            <th style={{ textAlign: 'left', padding: '3px 8px', color: '#aaa' }}>Polarization</th>
            <th style={{ textAlign: 'left', padding: '3px 8px', color: '#aaa' }}>Frequency shift</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style={{ padding: '3px 8px', color: '#ff7070' }}>σ+</td><td style={{ padding: '3px 8px' }}>+1</td><td style={{ padding: '3px 8px' }}>right circular (along B)</td><td style={{ padding: '3px 8px' }}>+μ_B B</td></tr>
          <tr><td style={{ padding: '3px 8px', color: '#e0e0e0' }}>π</td><td style={{ padding: '3px 8px' }}>0</td><td style={{ padding: '3px 8px' }}>linear (⊥ to B)</td><td style={{ padding: '3px 8px' }}>0</td></tr>
          <tr><td style={{ padding: '3px 8px', color: '#70b0ff' }}>σ−</td><td style={{ padding: '3px 8px' }}>−1</td><td style={{ padding: '3px 8px' }}>left circular (along B)</td><td style={{ padding: '3px 8px' }}>−μ_B B</td></tr>
        </tbody>
      </table>
      <p style={{ marginTop: 10, fontSize: '0.82rem', color: '#999' }}>
        <em>Simplified nonrelativistic model — orbital angular momentum only, spin ignored.
        The anomalous Zeeman effect (which requires spin and the Landé g-factor) is not shown here.</em>
      </p>
    </div>
  )
}

function AnomalousZeemanSection() {
  return (
    <div>
      <p>When electron spin S=½ is included, the total angular momentum is <strong>J = L + S</strong>, giving two J-multiplets per orbital state (for L &gt; 0):</p>
      <BlockMath math="J = L \pm \tfrac{1}{2},\quad m_J = -J,\,-J{+}1,\ldots,+J" />
      <p><strong>Landé g-factor</strong> (LS-coupling approximation; assumes g<sub>L</sub>=1, g<sub>S</sub>=2, pure LS coupling):</p>
      <BlockMath math="g_J = 1 + \frac{J(J+1)+S(S+1)-L(L+1)}{2J(J+1)}" />
      <p>Special cases: S=0 → g<sub>J</sub>=1 (normal Zeeman); L=0 → g<sub>J</sub>=2 (pure spin).</p>
      <p><strong>Zeeman energy</strong> of sublevel |J, m<sub>J</sub>⟩:</p>
      <BlockMath math="\Delta E = g_J\,\mu_B\,B\,m_J,\quad \mu_B = \tfrac{1}{2}\text{ a.u.}" />
      <p><strong>Why more than 3 lines?</strong> Each J term has a different g<sub>J</sub>, so m<sub>J</sub> sublevels of J=L+½ and J=L−½ split at different rates. The E1 selection rules allow ΔJ=0,±1 and |Δm<sub>J</sub>|≤1, producing up to 10 lines for a 2p→1s transition (vs 3 for normal Zeeman).</p>
      <p><strong>Selection rules:</strong></p>
      <BlockMath math="\Delta L = \pm 1,\quad \Delta J = 0,\pm 1\;(J{=}0\not\to J{=}0),\quad |\Delta m_J|\le 1" />
      <p>Fine-structure splitting (spin-orbit) is much smaller than the displayed B range and is omitted — all J terms are degenerate at B=0 in this view.</p>
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

function StarkSection() {
  return (
    <div>
      <p>A uniform electric field <strong>F</strong> along the z-axis perturbs the atom:</p>
      <BlockMath math="H' = F z \quad\text{(atomic units: }e{=}1,\,a_0{=}1\text{)}" />
      <p><strong>Why only n = 2?</strong> The n = 1 level has no degenerate partner — its diagonal matrix element ⟨1s|z|1s⟩ = 0 by parity, and there is no other n = 1 state to mix with, so the first non-zero Stark shift is quadratic (polarisability). For n = 2 the accidental degeneracy of |2s⟩ and |2p₀⟩ enables a first-order <em>linear</em> shift.</p>
      <p><strong>Key matrix element (a.u.):</strong></p>
      <BlockMath math="\langle 2s\,|\,z\,|\,2p_0\rangle = -\frac{3}{Z}" />
      <p><strong>First-order energy shifts</strong> (parabolic quantum numbers n₁, n₂, m):</p>
      <BlockMath math="\Delta E = -\tfrac{3}{2}\,n\,(n_1 - n_2)\,\frac{F}{Z}" />
      <p>For n = 2 the four states split as follows:</p>
      <BlockMath math="\Delta E = \begin{cases} -3F/Z & (n_1{=}1,\,n_2{=}0,\,m{=}0)\quad\text{lower}\\[4pt] 0 & (m{=}\pm 1)\quad\text{unshifted}\\[4pt] +3F/Z & (n_1{=}0,\,n_2{=}1,\,m{=}0)\quad\text{upper} \end{cases}" />
      <p>The <strong>parabolic states</strong> are superpositions of spherical harmonics:</p>
      <BlockMath math="\frac{|2s\rangle + |2p_0\rangle}{\sqrt{2}}\;\text{(lower)},\qquad \frac{|2s\rangle - |2p_0\rangle}{\sqrt{2}}\;\text{(upper)}" />
      <p><strong>Induced dipole moment</strong> of each shifted level:</p>
      <BlockMath math="\langle\mu_z\rangle = -\frac{\partial\Delta E}{\partial F} = \pm\frac{3}{Z}\;a_0" />
      <p><strong>Field ionisation threshold</strong> (classical barrier suppression):</p>
      <BlockMath math="F_\text{ion} = \frac{Z^3}{16\,n^4} \approx 0.00391\text{ a.u.}\;(n{=}2,\,Z{=}1)" />
      <p>First-order perturbation theory is valid for F ≪ F<sub>ion</sub>. The orange dashed line marks this threshold.</p>
    </div>
  )
}

function EmissionSpectraSection() {
  return (
    <div>
      <p>When an electron drops from level n<sub>Hi</sub> to n<sub>Lo</sub>, a photon is emitted:</p>
      <BlockMath math="\Delta E = E_{n_\text{Hi}} - E_{n_\text{Lo}} = \frac{Z^2}{2}\!\left(\frac{1}{n_\text{Lo}^2} - \frac{1}{n_\text{Hi}^2}\right)\;\text{Hartree}" />
      <p>The <strong>Rydberg formula</strong> gives the wavelength:</p>
      <BlockMath math="\frac{1}{\lambda} = R_\infty Z^2\!\left(\frac{1}{n_\text{Lo}^2} - \frac{1}{n_\text{Hi}^2}\right),\quad \lambda = \frac{hc}{\Delta E}" />
      <p>In atomic units <InlineMath math="hc = 45.564\;\text{nm·Eh}" />, so <InlineMath math="\lambda\,[\text{nm}] = 45.564\,/\,\Delta E\,[\text{Eh}]" />.
        Wavelengths scale as <InlineMath math="1/Z^2" /> for hydrogenic ions.</p>
      <p><strong>Named series</strong> (grouped by lower level n<sub>Lo</sub>):</p>
      <ul style={{ lineHeight: 1.8, paddingLeft: '1.2rem' }}>
        <li><strong>Lyman</strong> (→ n=1): UV, 91–122 nm</li>
        <li><strong>Balmer</strong> (→ n=2): visible, 365–656 nm &mdash;
          H-α 656 nm (red), H-β 486 nm, H-γ 434 nm, H-δ 410 nm</li>
        <li><strong>Paschen</strong> (→ n=3): near-IR, 820–1875 nm</li>
        <li><strong>Brackett</strong> (→ n=4): mid-IR, 1458–4051 nm</li>
      </ul>
      <p>The E1 selection rule <InlineMath math="\Delta\ell = \pm 1" /> governs which transitions occur,
        but since the nonrelativistic hydrogen energy depends only on n (not ℓ), each line in this
        display represents all allowed ℓ transitions between those two shells.</p>
    </div>
  )
}
