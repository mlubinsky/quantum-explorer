import { BlockMath, InlineMath } from './KatexMath'

export function EnergyLevelsDiagramInfoPanel() {
  return (
    <div style={{ fontSize: '0.9rem', lineHeight: 1.55 }}>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>What this chart shows</h4>
        <p style={{ margin: 0 }}>
          The potential V(x) is drawn as a filled shape. Horizontal lines mark
          the allowed energy levels Eₙ. Levels are <strong>discrete</strong>
          because the boundary conditions (ψ = 0 at the walls) only allow
          standing waves — modes that fit an integer number of half-wavelengths
          inside the well.
        </p>
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Infinite square well</h4>
        <BlockMath math="E_n = \frac{n^2\pi^2}{2L^2}, \quad n = 1,2,3,\ldots" />
        <p style={{ margin: '4px 0 0' }}>
          Spacing <strong>grows</strong> with n:{' '}
          <InlineMath math="\Delta E_n = E_n - E_{n-1} = \frac{(2n-1)\pi^2}{2L^2}" />.
          Halving L quadruples every level.
        </p>
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Harmonic oscillator</h4>
        <BlockMath math="E_n = \omega\!\left(n+\tfrac{1}{2}\right), \quad n = 0,1,2,\ldots" />
        <p style={{ margin: '4px 0 0' }}>
          Spacing is <strong>uniform</strong>:{' '}
          <InlineMath math="\Delta E_n = \omega" /> for every n.
          The zero-point energy <InlineMath math="E_0 = \omega/2 > 0" /> is
          visible as the lowest line sitting above V = 0.
        </p>
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Units</h4>
        <p style={{ margin: 0 }}>
          Energies are shown in atomic units (a.u. = Hartree) and electron-volts.{' '}
          <InlineMath math="1\,\text{a.u.} = 27.2114\,\text{eV}" />.
        </p>
      </section>

      <section>
        <h4 style={{ margin: '0 0 6px' }}>What to explore</h4>
        <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
          <li>ISW: drag L and watch every level scale as <InlineMath math="1/L^2" />.</li>
          <li>ISW: note the growing gaps — higher levels are much more widely
            spaced than lower ones.</li>
          <li>HO: drag ω and observe all levels rise or fall together, keeping
            uniform spacing.</li>
          <li>Compare the two: ISW levels fan out; HO levels stay evenly spaced.
            This is the key difference between the two potentials.</li>
        </ul>
      </section>

    </div>
  )
}
