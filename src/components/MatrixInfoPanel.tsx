import { BlockMath, InlineMath } from './KatexMath'
import { WikiRefs } from './WikiRefs'

export function MatrixInfoPanel() {
  return (
    <div style={{ fontSize: '0.9rem', lineHeight: 1.55 }}>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Matrix representation</h4>
        <p style={{ margin: '0 0 6px' }}>
          Any operator <InlineMath math="\hat O" /> becomes a matrix once written in
          the energy eigenbasis <InlineMath math="\{|\psi_n\rangle\}" />:
        </p>
        <BlockMath math="O_{mn} = \langle\psi_m|\hat O|\psi_n\rangle" />
        <p style={{ margin: '4px 0 0' }}>
          H is diagonal by construction (<InlineMath math="H_{mn} = E_n\delta_{mn}" />);
          X and P are generally dense, computed here by numerical quadrature over the
          plotted grid.
        </p>
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Selection rules</h4>
        <p style={{ margin: '0 0 6px' }}>
          Both potentials have definite-parity eigenstates, so{' '}
          <InlineMath math="\langle\psi_m|x|\psi_n\rangle" /> vanishes whenever{' '}
          <InlineMath math="\psi_m" /> and <InlineMath math="\psi_n" /> share the same
          parity — x is odd, so the integrand is odd unless the states differ in
          parity. P (odd under parity, like x) obeys the same rule.
        </p>
        <p style={{ margin: 0 }}>
          P is also purely imaginary and antisymmetric,{' '}
          <InlineMath math="P_{mn} = -P_{nm}" />, a direct consequence of P being
          Hermitian with real diagonal (here zero, since{' '}
          <InlineMath math="\langle\psi_n|p|\psi_n\rangle=0" /> for a real
          stationary state).
        </p>
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Heisenberg picture</h4>
        <p style={{ margin: '0 0 6px' }}>
          In the Heisenberg picture, operators evolve instead of states:
        </p>
        <BlockMath math="\hat O(t) = e^{i\hat Ht}\,\hat O\,e^{-i\hat Ht}" />
        <p style={{ margin: '4px 0 6px' }}>
          Sandwiched between eigenstates this becomes exact and closed-form — each
          matrix element just picks up a phase oscillating at its own Bohr frequency:
        </p>
        <BlockMath math="O_{mn}(t) = O_{mn}(0)\,e^{i\omega_{mn}t}, \quad \omega_{mn} = E_m - E_n" />
        <p style={{ margin: '4px 0 0' }}>
          Diagonal elements never change (<InlineMath math="\omega_{nn}=0" />) — this
          is why Ĥ itself looks frozen in the animated view. The "Time evolution"
          toggle plots <InlineMath math="\mathrm{Re}\,O_{mn}(t)" /> (or{' '}
          <InlineMath math="\mathrm{Im}" /> for P), and the collapsible "Bohr
          frequencies" panel shows every <InlineMath math="\omega_{mn}" /> and its
          period <InlineMath math="T_{mn}=2\pi/|\omega_{mn}|" />.
        </p>
      </section>

      <section>
        <h4 style={{ margin: '0 0 6px' }}>What to explore</h4>
        <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
          <li>Switch between H, X, P — note which matrices are diagonal, dense, or
            checkerboard-sparse (parity selection rule).</li>
          <li>Toggle "Time evolution" and play — off-diagonal cells oscillate, the
            diagonal stays fixed.</li>
          <li>Compare oscillation speed across cells — larger{' '}
            <InlineMath math="|E_m - E_n|" /> (further from the diagonal in energy)
            means faster oscillation.</li>
          <li>Open "Bohr frequencies" to read off exact periods for any pair
            (m, n).</li>
        </ul>
      </section>

      <WikiRefs links={[
        { label: 'Heisenberg picture — Wikipedia', url: 'https://en.wikipedia.org/wiki/Heisenberg_picture' },
        { label: 'Matrix mechanics — Wikipedia', url: 'https://en.wikipedia.org/wiki/Matrix_mechanics' },
      ]} />
    </div>
  )
}
