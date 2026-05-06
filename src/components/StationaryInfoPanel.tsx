import { BlockMath, InlineMath } from './KatexMath'

export function StationaryInfoPanel() {
  return (
    <div style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>

      <section style={{ marginBottom: '1.2rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Infinite square well</h4>
        <p style={{ margin: '0 0 6px' }}>
          A particle confined to <InlineMath math="x \in [0, L]" /> with V = 0 inside and V = ∞ outside.
          Dirichlet boundary conditions <InlineMath math="\psi(0) = \psi(L) = 0" /> force discrete energies:
        </p>
        <BlockMath math="E_n = \frac{n^2\pi^2}{2L^2}, \quad n = 1,2,3,\ldots" />
        <p style={{ margin: '4px 0 6px' }}>Normalised eigenfunctions:</p>
        <BlockMath math="\psi_n(x) = \sqrt{\frac{2}{L}}\,\sin\!\frac{n\pi x}{L}" />
        <p style={{ margin: '4px 0 0' }}>
          Spacing grows as <InlineMath math="n^2" /> — high-lying states are much more energetic.
          Position uncertainty: <InlineMath math="\sigma_x = L\sqrt{\tfrac{1}{12} - \tfrac{1}{2n^2\pi^2}}" />.
        </p>
      </section>

      <section style={{ marginBottom: '1.2rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Harmonic oscillator</h4>
        <p style={{ margin: '0 0 6px' }}>
          Potential <InlineMath math="V(x) = \tfrac{1}{2}\omega^2 x^2" /> gives uniformly spaced levels:
        </p>
        <BlockMath math="E_n = \omega\!\left(n + \tfrac{1}{2}\right), \quad n = 0,1,2,\ldots" />
        <p style={{ margin: '4px 0 6px' }}>Eigenfunctions use Hermite polynomials:</p>
        <BlockMath math="\psi_n(x) = \left(\frac{\omega}{\pi}\right)^{1/4}\frac{1}{\sqrt{2^n n!}}\,H_n(\sqrt{\omega}\,x)\,e^{-\omega x^2/2}" />
        <p style={{ margin: '4px 0 6px' }}>
          Hermite polynomials via recurrence:
        </p>
        <BlockMath math="H_0=1,\quad H_1=2x,\quad H_{n+1} = 2x\,H_n - 2n\,H_{n-1}" />
        <p style={{ margin: '4px 0 0' }}>
          Classical turning points (yellow dashes): <InlineMath math="x_c = \pm\sqrt{(2n+1)/\omega}" />.
          Beyond <InlineMath math="x_c" /> the wavefunction decays exponentially — quantum tunnelling into
          the classically forbidden region.
        </p>
      </section>

      <section>
        <h4 style={{ margin: '0 0 6px' }}>What to explore</h4>
        <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
          <li>ISW: increase n and count the nodes — <InlineMath math="\psi_n" /> has exactly <InlineMath math="n-1" /> nodes.</li>
          <li>ISW: halve L and watch all energies quadruple (<InlineMath math="E \propto 1/L^2" />).</li>
          <li>HO: all level spacings equal <InlineMath math="\omega" /> regardless of n — unlike ISW.</li>
          <li>HO: toggle |ψ|² and observe that probability peaks near the turning points at high n — the classical limit.</li>
          <li>HO: increase ω and watch the wavefunctions compress (more confined) and energies rise.</li>
        </ul>
      </section>

    </div>
  )
}
