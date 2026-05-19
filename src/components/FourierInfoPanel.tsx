import { BlockMath, InlineMath } from './KatexMath'
import { WikiRefs } from './WikiRefs'

export function FourierInfoPanel() {
  return (
    <div>
      <p style={{ color: '#aaa', marginTop: 0 }}>
        The Fourier transform pairs position and momentum representations of a quantum state.
        Narrow in position → wide in momentum, and vice versa — the uncertainty principle.
      </p>

      <h4 style={{ color: '#e0e0e0' }}>FT Convention</h4>
      <BlockMath math={String.raw`\hat\psi(k)=\frac{1}{\sqrt{2\pi}}\int_{-\infty}^{\infty}\psi(x)\,e^{-ikx}\,dx`} />

      <h4 style={{ color: '#e0e0e0' }}>Gaussian wavepacket</h4>
      <BlockMath math={String.raw`\psi(x)=(2\pi\sigma^2)^{-1/4}\exp\!\left(-\frac{(x-x_0)^2}{4\sigma^2}\right)e^{ik_0 x}`} />
      <p style={{ color: '#aaa' }}>Exact momentum distribution:</p>
      <BlockMath math={String.raw`|\hat\psi(k)|^2=\frac{1}{\sigma_k\sqrt{2\pi}}\exp\!\left(-\frac{(k-k_0)^2}{2\sigma_k^2}\right),\quad \sigma_k=\frac{1}{2\sigma}`} />
      <p style={{ color: '#aaa' }}>Uncertainty product:</p>
      <BlockMath math={String.raw`\Delta x\,\Delta k=\sigma\cdot\frac{1}{2\sigma}=\frac{1}{2}\quad\text{(minimum uncertainty)}`} />

      <h4 style={{ color: '#e0e0e0' }}>Chirped Gaussian</h4>
      <p style={{ color: '#aaa' }}>
        A chirped packet has a <em>position-dependent local frequency</em>{' '}
        <InlineMath math={String.raw`k_{\rm loc}(x)=k_0+\beta(x-x_0)`} />.
        The envelope <InlineMath math={String.raw`|\psi_\beta|^2`} /> is unchanged,
        but the FT broadens:
      </p>
      <BlockMath math={String.raw`\sigma_k=\sqrt{\frac{1}{4\sigma^2}+\beta^2\sigma^2}\;\geq\;\frac{1}{2\sigma}`} />
      <BlockMath math={String.raw`\Delta x\,\Delta k=\sigma\sigma_k\geq\tfrac{1}{2},\quad\text{equality iff }\beta=0`} />

      <h4 style={{ color: '#e0e0e0' }}>ISW eigenstate</h4>
      <p style={{ color: '#aaa' }}>
        For <InlineMath math={String.raw`\psi_n(x)=\sqrt{2/L}\sin(n\pi x/L)`} />:
      </p>
      <BlockMath math={String.raw`|\hat\psi_n(k)|^2=\frac{2n^2\pi}{L^3}\cdot\frac{1-(-1)^n\cos(kL)}{\bigl((n\pi/L)^2-k^2\bigr)^2}`} />
      <p style={{ color: '#aaa' }}>
        Two Bragg peaks at <InlineMath math={String.raw`k=\pm n\pi/L`} /> corresponding to the two
        travelling-wave components of the standing wave.
        Since <InlineMath math={String.raw`\langle k\rangle=0`} /> and{' '}
        <InlineMath math={String.raw`\langle k^2\rangle=2E_n=(n\pi/L)^2`} />:
      </p>
      <BlockMath math={String.raw`\Delta k=\frac{n\pi}{L},\quad\Delta x\,\Delta k>\frac{1}{2}`} />
      <WikiRefs links={[
        { label: 'Fourier transform — Wikipedia', url: 'https://en.wikipedia.org/wiki/Fourier_transform' },
        { label: 'Uncertainty principle — Wikipedia', url: 'https://en.wikipedia.org/wiki/Uncertainty_principle' },
      ]} />
    </div>
  )
}
