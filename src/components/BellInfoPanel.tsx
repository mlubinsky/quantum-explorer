import { BlockMath, InlineMath } from './KatexMath'

export type BellInfoTopic = 'correlation' | 'chsh' | 'simulation'

export function BellInfoPanel({ topic }: { topic: BellInfoTopic }) {
  return (
    <div style={{ fontSize: '0.9rem', lineHeight: 1.55 }}>
      {topic === 'correlation' && <CorrelationSection />}
      {topic === 'chsh' && <ChshSection />}
      {topic === 'simulation' && <SimulationSection />}
    </div>
  )
}

function CorrelationSection() {
  return (
    <>
      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Singlet state</h4>
        <p style={{ margin: '0 0 6px' }}>
          Two spin-½ particles in the singlet state:
        </p>
        <BlockMath math="|\psi^-\rangle = \frac{|\!\uparrow\downarrow\rangle - |\!\downarrow\uparrow\rangle}{\sqrt{2}}" />
        <p style={{ margin: '4px 0 0' }}>
          This is the unique entangled state with total spin zero. Neither particle has
          a definite spin direction — only their relative orientations are fixed.
        </p>
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Quantum correlation</h4>
        <p style={{ margin: '0 0 6px' }}>
          Alice measures along <InlineMath math="\hat{a}" />, Bob along <InlineMath math="\hat{b}" />.
          The two-spin correlation is exactly:
        </p>
        <BlockMath math="E(\hat{a},\hat{b}) = \langle\psi^-|(\hat{a}\cdot\boldsymbol{\sigma})\otimes(\hat{b}\cdot\boldsymbol{\sigma})|\psi^-\rangle = -\hat{a}\cdot\hat{b} = -\cos\theta" />
        <p style={{ margin: '4px 0 0' }}>
          where <InlineMath math="\theta" /> is the angle between the two detector axes.
          At <InlineMath math="\theta = 0" /> the outcomes are perfectly anti-correlated
          (Alice +½ always gives Bob −½); at <InlineMath math="\theta = \pi" /> they are
          perfectly correlated.
        </p>
      </section>

      <section>
        <h4 style={{ margin: '0 0 6px' }}>Classical (LHV) bound</h4>
        <p style={{ margin: '0 0 6px' }}>
          Any local hidden variable (LHV) theory is constrained to correlations that
          interpolate <em>linearly</em> between the extreme values. The tightest classical
          bound is:
        </p>
        <BlockMath math="|E_\mathrm{lhv}(\theta)| \leq 1 - \frac{2\theta}{\pi} \quad (0 \leq \theta \leq \tfrac{\pi}{2})" />
        <p style={{ margin: '4px 0 0' }}>
          The quantum curve <InlineMath math="E(\theta)=-\cos\theta" /> dips <em>below</em>{' '}
          this piecewise-linear bound for <InlineMath math="0 < \theta < 90°" />, making the
          violation visible in a single plot without any averaging.
        </p>
      </section>
    </>
  )
}

function ChshSection() {
  return (
    <>
      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>CHSH inequality</h4>
        <p style={{ margin: '0 0 6px' }}>
          Use four detector settings: <InlineMath math="a, a'" /> for Alice
          and <InlineMath math="b, b'" /> for Bob. Define:
        </p>
        <BlockMath math="S = |E(a,b) - E(a,b') + E(a',b) + E(a',b')|" />
        <p style={{ margin: '4px 0 6px' }}>
          Clauser, Horne, Shimony and Holt (1969) proved:
        </p>
        <BlockMath math="\text{Classical (all LHV):}\quad S \leq 2" />
        <BlockMath math="\text{Quantum maximum (Tsirelson 1980):}\quad S \leq 2\sqrt{2} \approx 2.828" />
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Optimal angles</h4>
        <p style={{ margin: '0 0 6px' }}>
          The maximum <InlineMath math="S = 2\sqrt{2}" /> is achieved with:
        </p>
        <BlockMath math="a = 0°,\quad a' = 90°,\quad b = 45°,\quad b' = 135°" />
        <p style={{ margin: '4px 0 6px' }}>
          Each pair contributes <InlineMath math="-1/\sqrt{2}" /> except
          E(a, b') which contributes <InlineMath math="+1/\sqrt{2}" />:
        </p>
        <BlockMath math="S = \left|-\tfrac{1}{\sqrt{2}} - \tfrac{1}{\sqrt{2}} - \tfrac{1}{\sqrt{2}} - \tfrac{1}{\sqrt{2}}\right| = \frac{4}{\sqrt{2}} = 2\sqrt{2}" />
      </section>

      <section>
        <h4 style={{ margin: '0 0 6px' }}>Experimental status</h4>
        <p style={{ margin: '0 0 0' }}>
          Aspect (1982) performed the first definitive test, finding{' '}
          <InlineMath math="S \approx 2.7" />. Loophole-free Bell tests in 2015
          (Delft, Vienna, NIST) closed both the locality and detection loopholes
          simultaneously, confirming <InlineMath math="S > 2" /> beyond any doubt.
          Local hidden variable theories are experimentally excluded.
        </p>
      </section>
    </>
  )
}

function SimulationSection() {
  return (
    <>
      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Sampling singlet pairs</h4>
        <p style={{ margin: '0 0 6px' }}>
          For each of the <InlineMath math="N" /> pairs:
        </p>
        <ol style={{ margin: '0 0 8px', paddingLeft: '1.4em' }}>
          <li>Draw Alice's outcome uniformly: <InlineMath math="a \in \{+1, -1\}" />.</li>
          <li>
            Given the angle <InlineMath math="\theta" /> between detectors, Bob's outcome
            is correlated via:
            <BlockMath math="P(\text{same}) = \frac{1-\cos\theta}{2},\quad P(\text{opposite}) = \frac{1+\cos\theta}{2}" />
          </li>
          <li>
            Each product <InlineMath math="ab" /> is <InlineMath math="+1" /> (same) or{' '}
            <InlineMath math="-1" /> (opposite); average over <InlineMath math="N" /> pairs
            gives <InlineMath math="\hat{E}" />.
          </li>
        </ol>
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 6px' }}>Convergence</h4>
        <p style={{ margin: '0 0 6px' }}>
          Each <InlineMath math="ab \in \{+1,-1\}" />, so the estimator variance is:
        </p>
        <BlockMath math="\mathrm{std}(\hat{E}) \approx \frac{1}{\sqrt{N}}" />
        <p style={{ margin: '4px 0 0' }}>
          With <InlineMath math="N = 500" /> pairs the standard deviation is{' '}
          <InlineMath math="\approx 0.045" />; with <InlineMath math="N = 5000" />{' '}
          it drops to <InlineMath math="\approx 0.014" />.
        </p>
      </section>

      <section>
        <h4 style={{ margin: '0 0 6px' }}>Irreducible randomness</h4>
        <p style={{ margin: '0 0 0' }}>
          Every run with the same <InlineMath math="N" /> and <InlineMath math="\theta" />{' '}
          produces a slightly different <InlineMath math="\hat{E}" />, yet the long-run
          average always converges to <InlineMath math="-\cos\theta" />.
          Individual outcomes are irreducibly random — no hidden variable predetermines
          Alice's result. The statistics, however, are perfectly predictable.
        </p>
      </section>
    </>
  )
}
