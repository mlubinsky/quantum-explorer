import { BlockMath, InlineMath } from './KatexMath'
import { WikiRefs } from './WikiRefs'

export function GatesInfoPanel() {
  return (
    <div style={{ fontSize: '0.9rem', lineHeight: 1.55 }}>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Gates as 2×2 unitaries</h4>
        <p style={{ margin: '0 0 6px' }}>
          A single-qubit gate is a unitary operator acting on the state vector:
        </p>
        <BlockMath math="|\psi'\rangle = U|\psi\rangle, \quad U^\dagger U = I" />
        <p style={{ margin: '4px 0 0' }}>
          Unitarity preserves the norm exactly — the readout below the gate pad
          confirms ‖ψ‖ = 1 after every operation.
        </p>
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Pauli gates — π rotations</h4>
        <BlockMath math="X = \begin{pmatrix}0&1\\1&0\end{pmatrix},\quad Y = \begin{pmatrix}0&-i\\i&0\end{pmatrix},\quad Z = \begin{pmatrix}1&0\\0&-1\end{pmatrix}" />
        <p style={{ margin: '4px 0 0' }}>
          Each is a <InlineMath math="\pi" /> rotation of the Bloch vector about its
          own axis: X flips <InlineMath math="r_y" /> and <InlineMath math="r_z" />; Y
          flips <InlineMath math="r_x" /> and <InlineMath math="r_z" />; Z flips{' '}
          <InlineMath math="r_x" /> and <InlineMath math="r_y" /> — the component
          along the rotation axis is left unchanged.
        </p>
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Hadamard</h4>
        <BlockMath math="H = \frac{1}{\sqrt{2}}\begin{pmatrix}1&1\\1&-1\end{pmatrix}" />
        <p style={{ margin: '4px 0 0' }}>
          Geometrically a <InlineMath math="\pi" /> rotation about the axis{' '}
          <InlineMath math="(\hat x+\hat z)/\sqrt2" />: it swaps{' '}
          <InlineMath math="r_x \leftrightarrow r_z" /> and negates the new{' '}
          <InlineMath math="r_z" />. Maps <InlineMath math="|\!\uparrow\rangle" /> to
          the equal superposition <InlineMath math="|\!+x\rangle" />.
        </p>
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Phase gates S, T</h4>
        <BlockMath math="S = \begin{pmatrix}1&0\\0&i\end{pmatrix} = R_z(\pi/2),\quad T = \begin{pmatrix}1&0\\0&e^{i\pi/4}\end{pmatrix} = R_z(\pi/4)" />
        <p style={{ margin: '4px 0 0' }}>
          Both rotate about <InlineMath math="\hat z" /> only — they leave{' '}
          <InlineMath math="r_z" /> (and hence the north/south-pole states) unchanged
          and rotate <InlineMath math="r_x, r_y" /> in the equatorial plane.
          S† and T† apply the opposite angle.
        </p>
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Parametric rotations</h4>
        <BlockMath math="R_x(\theta)=e^{-i\theta X/2},\quad R_y(\theta)=e^{-i\theta Y/2},\quad R_z(\theta)=e^{-i\theta Z/2}" />
        <p style={{ margin: '4px 0 0' }}>
          Each rotates the Bloch vector by angle <InlineMath math="\theta" /> about
          its axis — exact, closed-form (the same Rodrigues' formula used for Larmor
          precession in the Precession tab). X, Y, Z above are the special case{' '}
          <InlineMath math="\theta=\pi" /> up to a global phase; S and T are the
          special cases <InlineMath math="\theta=\pi/2" /> and{' '}
          <InlineMath math="\pi/4" /> of Rz.
        </p>
      </section>

      <section>
        <h4 style={{ margin: '0 0 6px' }}>What to explore</h4>
        <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
          <li>Apply H, then Z, then H again — recovers the state H would give
            applying X instead (Z in the Hadamard basis acts like X).</li>
          <li>Apply S twice — same effect as one Z (S² = Z).</li>
          <li>Apply T four times — same effect as one S; eight times returns to the
            identity (T⁸ = I).</li>
          <li>Drag the rotation slider through 2π — the trajectory traces a full
            great-circle arc on the sphere.</li>
        </ul>
      </section>

      <WikiRefs links={[
        { label: 'Quantum logic gate — Wikipedia', url: 'https://en.wikipedia.org/wiki/Quantum_logic_gate' },
        { label: 'Bloch sphere — Wikipedia', url: 'https://en.wikipedia.org/wiki/Bloch_sphere' },
      ]} />
    </div>
  )
}
