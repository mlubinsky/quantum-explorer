import { BlockMath, InlineMath } from './KatexMath'

export function SpinInfoPanel() {
  return (
    <div style={{ fontSize: '0.9rem', lineHeight: 1.55 }}>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>State space</h4>
        <p style={{ margin: '0 0 6px' }}>
          A spin-½ particle lives in a 2-dimensional complex Hilbert space.
          The general (normalised) state is:
        </p>
        <BlockMath math="|\psi\rangle = \alpha|\!\uparrow\rangle + \beta|\!\downarrow\rangle, \quad |\alpha|^2 + |\beta|^2 = 1" />
        <p style={{ margin: '4px 0 6px' }}>
          Fixing the global phase gives the Bloch parameterisation:
        </p>
        <BlockMath math="|\psi\rangle = \cos\!\tfrac{\theta}{2}|\!\uparrow\rangle + e^{i\varphi}\sin\!\tfrac{\theta}{2}|\!\downarrow\rangle" />
        <p style={{ margin: '4px 0 0' }}>
          The <strong>Bloch vector</strong> <InlineMath math="\mathbf{r} = (\sin\theta\cos\varphi,\;\sin\theta\sin\varphi,\;\cos\theta)" /> has
          unit length and uniquely identifies every pure state.
          North pole (<InlineMath math="\theta=0" />) = <InlineMath math="|\!\uparrow\rangle" />;
          south pole (<InlineMath math="\theta=\pi" />) = <InlineMath math="|\!\downarrow\rangle" />.
        </p>
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Pauli matrices</h4>
        <BlockMath math="\sigma_x = \begin{pmatrix}0&1\\1&0\end{pmatrix},\quad \sigma_y = \begin{pmatrix}0&-i\\i&0\end{pmatrix},\quad \sigma_z = \begin{pmatrix}1&0\\0&-1\end{pmatrix}" />
        <p style={{ margin: '4px 0 0' }}>
          Each has eigenvalues ±1. Expectation values read directly from the Bloch vector:
        </p>
        <BlockMath math="\langle\sigma_x\rangle = r_x,\quad \langle\sigma_y\rangle = r_y,\quad \langle\sigma_z\rangle = r_z" />
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Robertson uncertainty</h4>
        <p style={{ margin: '0 0 6px' }}>
          Robertson's relation for observables A, B states{' '}
          <InlineMath math="\Delta A\cdot\Delta B \ge \tfrac{1}{2}|\langle[A,B]\rangle|" />.
          Since <InlineMath math="[\sigma_x,\sigma_y]=2i\sigma_z" /> this gives:
        </p>
        <BlockMath math="\Delta\sigma_x\cdot\Delta\sigma_y \;\ge\; |\langle\sigma_z\rangle|" />
        <p style={{ margin: '4px 0 6px' }}>
          For a pure state on the Bloch sphere,{' '}
          <InlineMath math="\Delta\sigma_i = \sqrt{1 - \langle\sigma_i\rangle^2}" />,
          so all quantities come directly from the Bloch vector.
          The inequality is always satisfied (shown in green ✓); equality holds only at the
          six cardinal states ±x, ±y, ±z.
        </p>
        <p style={{ margin: '4px 0 0', fontSize: '0.85em', color: '#aaa' }}>
          Try: <strong>|↑⟩</strong> → LHS = 1, RHS = 1 (saturates). &nbsp;
          <strong>|+x⟩</strong> → RHS = 0 (trivially satisfied — σ_x eigenstate). &nbsp;
          Drag θ to π/4 for an intermediate case.
        </p>
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Larmor precession</h4>
        <p style={{ margin: '0 0 6px' }}>
          A spin in a magnetic field <InlineMath math="\mathbf{B} = \omega_0 \hat{B}" /> evolves under:
        </p>
        <BlockMath math="H = \tfrac{\omega_0}{2}\,(\hat{B}\cdot\boldsymbol{\sigma})" />
        <p style={{ margin: '4px 0 6px' }}>
          The Bloch vector rotates rigidly around <InlineMath math="\hat{B}" /> at angular
          frequency <InlineMath math="\omega_0" /> (Rodrigues' formula — exact, no numerical ODE):
        </p>
        <BlockMath math="\mathbf{r}(t) = \mathbf{r}\cos(\omega_0 t) + (\hat{B}\times\mathbf{r})\sin(\omega_0 t) + \hat{B}(\hat{B}\cdot\mathbf{r})(1-\cos(\omega_0 t))" />
        <p style={{ margin: '4px 0 6px' }}>
          Period <InlineMath math="T = 2\pi/\omega_0" />. All times in atomic units (1 a.u. = 24.19 as).
        </p>
        <p style={{ margin: '4px 0 0', fontSize: '0.85em', color: '#aaa' }}>
          <strong>Sign convention:</strong> positive ω₀ rotates the Bloch vector
          counterclockwise around B̂ (right-hand rule), matching{' '}
          <InlineMath math="H = +\tfrac{\omega_0}{2}\hat{B}\cdot\boldsymbol{\sigma}" />.
          Some textbooks use the opposite sign (e.g. electron NMR with{' '}
          <InlineMath math="H = -\tfrac{\gamma B}{2}\boldsymbol{\sigma}" />); to match those, negate ω₀.
        </p>
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Stern-Gerlach measurement</h4>
        <p style={{ margin: '0 0 6px' }}>
          Measuring spin along axis <InlineMath math="\hat{n}" /> gives outcome{' '}
          <InlineMath math="+\tfrac{1}{2}" /> with probability (Born rule):
        </p>
        <BlockMath math="P(+\tfrac{1}{2}) = \frac{1 + \hat{n}\cdot\mathbf{r}}{2}" />
        <p style={{ margin: '4px 0 6px' }}>
          After the measurement the state <strong>collapses</strong> — the Bloch vector
          snaps to <InlineMath math="+\hat{n}" /> (outcome <InlineMath math="+\tfrac{1}{2}" />) or{' '}
          <InlineMath math="-\hat{n}" /> (outcome <InlineMath math="-\tfrac{1}{2}" />),
          erasing all prior information about the spin direction.
        </p>
        <p style={{ margin: '4px 0 6px', fontSize: '0.85em', color: '#aaa' }}>
          <strong>Non-commutativity:</strong> measure along z (+½), then along x (random ±½),
          then along z again — the second z outcome is 50/50, even though the first was
          definite. The intermediate x measurement destroyed the z-polarisation.
        </p>
        <p style={{ margin: '4px 0 0', fontSize: '0.85em', color: '#aaa' }}>
          <strong>Irreducible randomness:</strong> identical preparation, same axis, yet
          individual outcomes differ. No hidden variable predetermines the result —
          this is a theorem (Bell, 1964), not a modelling choice.
        </p>
      </section>

      <section>
        <h4 style={{ margin: '0 0 6px' }}>What to explore</h4>
        <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
          <li>Set <InlineMath math="\theta = \pi/2" /> (equator), <InlineMath math="\hat{B} = \hat{z}" />,
            press Play — the arrow circles the equator at rate <InlineMath math="\omega_0" />.</li>
          <li>Double <InlineMath math="\omega_0" /> and observe the period halves.</li>
          <li>Tilt <InlineMath math="\hat{B}" /> away from <InlineMath math="\hat{z}" /> — the
            cone of precession tilts with it.</li>
          <li>Set <InlineMath math="\theta = 0" /> (north pole) and any <InlineMath math="\hat{B}" /> —
            the state is an eigenstate and does not precess.</li>
        </ul>
      </section>

    </div>
  )
}
