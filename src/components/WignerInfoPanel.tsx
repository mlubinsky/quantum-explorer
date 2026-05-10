import { BlockMath, InlineMath } from './KatexMath'

export function WignerInfoPanel() {
  return (
    <div style={{ lineHeight: 1.7, fontSize: '0.9rem' }}>
      <p>
        The <strong>Wigner function</strong> is a quasi-probability distribution on
        phase space <InlineMath math="(x,p)" />:
      </p>
      <BlockMath math="W(x,p)=\frac{1}{\pi}\int_{-\infty}^{\infty}\psi^*(x+y)\,\psi(x-y)\,e^{2ipy}\,dy" />
      <p>
        It is real and normalised, <InlineMath math="\iint W\,dx\,dp=1" />, but can be
        <strong> negative</strong> — negative regions signal non-classical correlations.
      </p>

      <h4 style={{ marginBottom: '0.3rem' }}>Marginals</h4>
      <BlockMath math="\int W(x,p)\,dp=|\psi(x)|^2,\quad\int W(x,p)\,dx=|\tilde\psi(p)|^2" />

      <h4 style={{ marginBottom: '0.3rem' }}>Fock state |n⟩</h4>
      <BlockMath math="W_n(x,p)=\frac{(-1)^n}{\pi}\,e^{-s}\,L_n(2s),\quad s=\frac{p^2}{\omega}+\omega x^2" />
      <p>
        <InlineMath math="W_0" /> is a positive Gaussian.
        For <InlineMath math="n\ge1" /> the function oscillates and reaches
        <InlineMath math="\;W_n(0,0)=(-1)^n/\pi" />.
      </p>

      <h4 style={{ marginBottom: '0.3rem' }}>Coherent state |α⟩</h4>
      <BlockMath math="W_\alpha(x,p)=\frac{1}{\pi}\exp\!\bigl(-\omega(x-\langle x\rangle)^2-(p-\langle p\rangle)^2/\omega\bigr)" />
      <p>Always non-negative — the most classical pure state.</p>

      <h4 style={{ marginBottom: '0.3rem' }}>Squeezed state D(α)S(r)|0⟩</h4>
      <BlockMath math="W(x,p)=\frac{1}{\pi}\exp\!\bigl(-e^{2r}\omega(x-x_0)^2-e^{-2r}(p-p_0)^2/\omega\bigr)" />
      <p>
        Still non-negative, but the ellipse is tilted: squeeze along{' '}
        <InlineMath math="x" /> (<InlineMath math="\Delta x=e^{-r}/\sqrt{2\omega}" />)
        and anti-squeeze along <InlineMath math="p" />.
      </p>

      <h4 style={{ marginBottom: '0.3rem' }}>Cat state (|α⟩ ± |−α⟩)/N</h4>
      <BlockMath math="W_\pm=\frac{W_{+\alpha}+W_{-\alpha}\pm\frac{2}{\pi}e^{-s}\cos(2x_0 p)}{2(1\pm e^{-2|\alpha|^2})}" />
      <p>
        The <InlineMath math="\cos" />-modulated interference fringe between the two
        Gaussians is the quantum signature — W oscillates rapidly in{' '}
        <InlineMath math="p" /> and goes deeply negative.
      </p>

      <h4 style={{ marginBottom: '0.3rem' }}>Negativity</h4>
      <BlockMath math="\mathcal{N}=\int\!\!\int_{\{W<0\}}\!|W|\,dx\,dp" />
      <p>
        Zero for classical states (coherent, squeezed). Positive for all non-classical
        states (Fock <InlineMath math="n\ge1" />, cat, superposition).
      </p>
    </div>
  )
}
