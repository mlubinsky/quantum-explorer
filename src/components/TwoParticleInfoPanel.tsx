import { BlockMath, InlineMath } from './KatexMath'

export function TwoParticleInfoPanel() {
  return (
    <div style={{ lineHeight: 1.7, fontSize: '0.9rem' }}>
      <p>
        Two spin-less particles in an infinite square well [0, L].
        How the joint wavefunction is constructed depends on whether the
        particles are <strong>distinguishable</strong>, identical{' '}
        <strong>bosons</strong>, or identical <strong>fermions</strong>.
      </p>

      <h4 style={{ marginBottom: '0.3rem' }}>Single-particle eigenfunctions</h4>
      <BlockMath math="\psi_n(x)=\sqrt{\tfrac{2}{L}}\sin\!\left(\tfrac{n\pi x}{L}\right),\quad E_n=\tfrac{n^2\pi^2}{2L^2}" />

      <h4 style={{ marginBottom: '0.3rem' }}>Two-particle wavefunction</h4>
      <BlockMath math="\Psi_D(x_1,x_2)=\psi_m(x_1)\,\psi_n(x_2)" />
      <BlockMath math="\Psi_B(x_1,x_2)=\frac{\psi_m(x_1)\psi_n(x_2)+\psi_n(x_1)\psi_m(x_2)}{\sqrt{2}}\quad(m\neq n)" />
      <BlockMath math="\Psi_F(x_1,x_2)=\frac{\psi_m(x_1)\psi_n(x_2)-\psi_n(x_1)\psi_m(x_2)}{\sqrt{2}}\quad(m\neq n)" />

      <h4 style={{ marginBottom: '0.3rem' }}>Pauli exclusion principle</h4>
      <p>
        Setting <InlineMath math="m=n" /> in the Slater determinant gives{' '}
        <InlineMath math="\Psi_F\equiv 0" />.
        Two identical fermions cannot occupy the same single-particle state.
        Bosons have no such restriction.
      </p>

      <h4 style={{ marginBottom: '0.3rem' }}>Exchange hole / bunching</h4>
      <p>
        On the diagonal <InlineMath math="x_1=x_2" />:
      </p>
      <BlockMath math="\Psi_F(x,x)=0\;\text{(always)},\quad|\Psi_B(x,x)|^2=2|\psi_m(x)|^2|\psi_n(x)|^2=2|\Psi_D(x,x)|^2" />
      <p>
        Fermions are never found at the same position (exchange hole).
        Bosons are twice as likely as distinguishable particles — the
        <strong> Hanbury Brown–Twiss effect</strong>.
      </p>

      <h4 style={{ marginBottom: '0.3rem' }}>Single-particle marginal</h4>
      <BlockMath math="\rho(x)=\int_0^L|\Psi(x,x_2)|^2\,dx_2=\tfrac{1}{2}\bigl(|\psi_m(x)|^2+|\psi_n(x)|^2\bigr)" />
      <p>
        The exchange term vanishes by orthogonality, so bosons and fermions
        share the same single-particle marginal — exchange only shows up in
        the <em>joint</em> distribution <InlineMath math="|\Psi(x_1,x_2)|^2" />.
      </p>

      <h4 style={{ marginBottom: '0.3rem' }}>Total energy</h4>
      <BlockMath math="E=E_m+E_n=\frac{(m^2+n^2)\pi^2}{2L^2}" />
    </div>
  )
}
