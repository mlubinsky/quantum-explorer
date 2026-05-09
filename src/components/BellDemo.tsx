import { useState, useMemo } from 'react'
import _Plot from 'react-plotly.js'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Plot = (_Plot as any).default ?? _Plot

import { HelpButton, HelpModal } from './HelpModal'
import { ParameterSlider } from './ParameterSlider'
import { BellInfoPanel } from './BellInfoPanel'
import type { BellInfoTopic } from './BellInfoPanel'
import { bellCorrelation, chshS, simulatePairs } from '../physics/bell'

const PI = Math.PI
const TSIRELSON = 2 * Math.sqrt(2)
const N_CURVE = 300

const DARK = {
  paper: '#0d0d0d', plot: '#111111', text: '#e0e0e0', grid: '#1e1e1e',
  blue: '#4361ee', orange: '#f77f00', green: '#06d6a0', red: '#ef233c',
  fill: 'rgba(67,97,238,0.12)',
}

function darkLayout(extra: Record<string, unknown> = {}) {
  return {
    paper_bgcolor: DARK.paper, plot_bgcolor: DARK.plot,
    font: { color: DARK.text, size: 12 },
    margin: { l: 55, r: 20, t: 30, b: 50 },
    height: 280,
    showlegend: true,
    legend: { x: 0.01, y: 0.05, bgcolor: 'rgba(0,0,0,0)', font: { size: 11 } },
    xaxis: {
      gridcolor: DARK.grid, zerolinecolor: DARK.grid, color: DARK.text,
      title: { text: 'θ (degrees)', font: { size: 12 } },
    },
    yaxis: {
      gridcolor: DARK.grid, zerolinecolor: DARK.grid, color: DARK.text,
    },
    ...extra,
  }
}

function degArray(n: number): number[] {
  return Array.from({ length: n }, (_, i) => (i / (n - 1)) * 180)
}

function radArray(n: number): number[] {
  return Array.from({ length: n }, (_, i) => (i / (n - 1)) * PI)
}

export function BellDemo() {
  // Correlation plot slider
  const [thetaDeg, setThetaDeg] = useState(45)

  // CHSH panel
  const [aDeg,  setADeg]  = useState(0)
  const [aPDeg, setAPDeg] = useState(90)
  const [bDeg,  setBDeg]  = useState(45)
  const [bPDeg, setBPDeg] = useState(135)

  // Simulation
  const [nShots, setNShots] = useState(500)
  const [simResult, setSimResult] = useState<{ samePairs: number; oppositePairs: number; eEstimate: number } | null>(null)

  // Help modals
  const [helpTopic, setHelpTopic] = useState<BellInfoTopic | null>(null)

  // Correlation curve data
  const corrData = useMemo(() => {
    const degs = degArray(N_CURVE)
    const rads = radArray(N_CURVE)
    const quantum = rads.map(bellCorrelation)
    // classical LHV upper bound: |E| ≤ 1 − 2θ/π for 0 ≤ θ ≤ π/2, then ≥ −1+2(θ−π/2)/π
    const lhvUpper = rads.map(r => {
      if (r <= PI / 2) return 1 - (2 * r) / PI
      return -1 + (2 * (r - PI / 2)) / PI
    })
    const lhvLower = lhvUpper.map(v => -v)
    return { degs, quantum, lhvUpper, lhvLower }
  }, [])

  const thetaRad = (thetaDeg * PI) / 180
  const eExact = bellCorrelation(thetaRad)

  // CHSH values
  const aR  = (aDeg  * PI) / 180
  const aPR = (aPDeg * PI) / 180
  const bR  = (bDeg  * PI) / 180
  const bPR = (bPDeg * PI) / 180

  const eAB  = bellCorrelation(bR  - aR)
  const eABP = bellCorrelation(bPR - aR)
  const eAPB = bellCorrelation(bR  - aPR)
  const eAPBP = bellCorrelation(bPR - aPR)
  const sValue = chshS(aR, aPR, bR, bPR)
  const sViolates = sValue > 2 + 1e-9

  function applyOptimal() {
    setADeg(0); setAPDeg(90); setBDeg(45); setBPDeg(135)
  }

  function runSim() {
    setSimResult(simulatePairs(thetaRad, nShots))
  }

  // Correlation plot traces
  const corrTraces = [
    {
      x: corrData.degs, y: corrData.quantum,
      type: 'scatter', mode: 'lines',
      name: 'E(θ) = −cos θ (quantum)',
      line: { color: DARK.blue, width: 2.5 },
    },
    {
      // fill between lhvLower and lhvUpper to show violation zone
      x: [...corrData.degs, ...corrData.degs.slice().reverse()],
      y: [...corrData.lhvUpper, ...corrData.lhvLower.slice().reverse()],
      type: 'scatter', fill: 'toself', fillcolor: DARK.fill,
      line: { width: 0 }, showlegend: false, hoverinfo: 'skip',
    },
    {
      x: corrData.degs, y: corrData.lhvUpper,
      type: 'scatter', mode: 'lines',
      name: 'Classical LHV bound',
      line: { color: DARK.orange, width: 1.8, dash: 'dash' },
    },
    {
      x: corrData.degs, y: corrData.lhvLower,
      type: 'scatter', mode: 'lines', showlegend: false,
      line: { color: DARK.orange, width: 1.8, dash: 'dash' },
    },
    // vertical line at current θ
    {
      x: [thetaDeg, thetaDeg], y: [-1.05, 1.05],
      type: 'scatter', mode: 'lines', showlegend: false,
      line: { color: '#666', width: 1, dash: 'dot' },
    },
    // current point
    {
      x: [thetaDeg], y: [eExact],
      type: 'scatter', mode: 'markers', name: `E(${thetaDeg}°) = ${eExact.toFixed(3)}`,
      marker: { color: DARK.green, size: 9 },
    },
  ]

  const corrLayout = {
    ...darkLayout(),
    yaxis: {
      gridcolor: DARK.grid, zerolinecolor: DARK.grid, color: DARK.text,
      range: [-1.15, 1.15],
      title: { text: 'E(θ)', font: { size: 12 } },
    },
    annotations: [{
      x: 45, y: -0.78, text: 'Quantum violates classical bound<br>for 0° < θ < 90°',
      showarrow: false, font: { size: 10, color: '#aaa' }, bgcolor: 'rgba(0,0,0,0.5)',
    }],
  }

  return (
    <>
      {helpTopic && (
        <HelpModal title={helpTitle(helpTopic)} onClose={() => setHelpTopic(null)}>
          <BellInfoPanel topic={helpTopic} />
        </HelpModal>
      )}

      {/* ── Section 1: Correlation curve ── */}
      <div style={sectionStyle}>
        <div style={headerStyle}>
          <span style={titleStyle}>Singlet correlation E(θ) = −cos θ</span>
          <HelpButton onClick={() => setHelpTopic('correlation')} />
        </div>

        <ParameterSlider
          label="θ (detector angle)"
          value={thetaDeg} min={0} max={180} step={1} unit="°" digits={0}
          description="Angle between Alice's and Bob's detector axes"
          onChange={setThetaDeg}
        />

        <div style={readoutStyle}>
          E({thetaDeg}°) = {eExact.toFixed(4)}
          {' '}·{' '}
          <span style={{ color: '#aaa', fontSize: '0.82em' }}>
            Classical bound: ±{(1 - (2 * Math.min(thetaRad, PI - thetaRad)) / PI).toFixed(4)}
          </span>
        </div>

        <Plot
          data={corrTraces as never}
          layout={corrLayout as never}
          config={{ displayModeBar: false, responsive: true }}
          style={{ width: '100%' }}
        />
      </div>

      {/* ── Section 2: CHSH panel ── */}
      <div style={sectionStyle}>
        <div style={headerStyle}>
          <span style={titleStyle}>CHSH inequality</span>
          <HelpButton onClick={() => setHelpTopic('chsh')} />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <button onClick={applyOptimal} style={presetBtnStyle}>Optimal (2√2)</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
          <ParameterSlider label="a (Alice 1)" value={aDeg}  min={0} max={180} step={1} unit="°" digits={0} onChange={setADeg} />
          <ParameterSlider label="a′ (Alice 2)" value={aPDeg} min={0} max={180} step={1} unit="°" digits={0} onChange={setAPDeg} />
          <ParameterSlider label="b (Bob 1)"   value={bDeg}  min={0} max={180} step={1} unit="°" digits={0} onChange={setBDeg} />
          <ParameterSlider label="b′ (Bob 2)"  value={bPDeg} min={0} max={180} step={1} unit="°" digits={0} onChange={setBPDeg} />
        </div>

        {/* Readout table */}
        <table style={tableStyle}>
          <thead>
            <tr style={{ color: '#aaa', fontSize: '0.8rem' }}>
              <th style={thStyle}>Pair</th>
              <th style={thStyle}>θ</th>
              <th style={thStyle}>E(θ)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}>E(a, b)</td>
              <td style={tdStyle}>{(Math.abs(bDeg - aDeg)).toFixed(0)}°</td>
              <td style={tdStyle}>{eAB.toFixed(4)}</td>
            </tr>
            <tr>
              <td style={tdStyle}>E(a, b′)</td>
              <td style={tdStyle}>{(Math.abs(bPDeg - aDeg)).toFixed(0)}°</td>
              <td style={tdStyle}>{eABP.toFixed(4)}</td>
            </tr>
            <tr>
              <td style={tdStyle}>E(a′, b)</td>
              <td style={tdStyle}>{(Math.abs(bDeg - aPDeg)).toFixed(0)}°</td>
              <td style={tdStyle}>{eAPB.toFixed(4)}</td>
            </tr>
            <tr>
              <td style={tdStyle}>E(a′, b′)</td>
              <td style={tdStyle}>{(Math.abs(bPDeg - aPDeg)).toFixed(0)}°</td>
              <td style={tdStyle}>{eAPBP.toFixed(4)}</td>
            </tr>
          </tbody>
        </table>

        {/* S value display */}
        <div style={{ ...sValueBoxStyle, borderColor: sViolates ? DARK.green : '#444' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 6 }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: sViolates ? DARK.green : '#888' }}>
              S = {sValue.toFixed(4)}
            </span>
            {sViolates
              ? <span style={{ color: DARK.green, fontWeight: 600, fontSize: '0.85rem' }}>✓ Quantum violation (S &gt; 2)</span>
              : <span style={{ color: '#888', fontSize: '0.85rem' }}>No violation (S ≤ 2)</span>
            }
          </div>
          <SBar value={sValue} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#777', marginTop: 3 }}>
            <span>0</span>
            <span style={{ color: '#f77f00' }}>Classical bound 2</span>
            <span style={{ color: DARK.green }}>Tsirelson 2√2 ≈ 2.828</span>
          </div>
        </div>
      </div>

      {/* ── Section 3: N-shot simulation ── */}
      <div style={sectionStyle}>
        <div style={headerStyle}>
          <span style={titleStyle}>N-shot simulation</span>
          <HelpButton onClick={() => setHelpTopic('simulation')} />
        </div>

        <p style={{ margin: '0 0 0.6rem', fontSize: '0.85rem', color: '#aaa' }}>
          Uses the same θ as the correlation plot above. Alice: uniform ±1.
          Bob: correlated via exact singlet probabilities.
        </p>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <div style={{ flex: '1 1 160px' }}>
            <label style={{ fontSize: '0.85rem', color: '#aaa', display: 'block', marginBottom: 3 }}>
              N (pairs)
            </label>
            <input
              type="number"
              value={nShots}
              min={10} max={5000}
              onChange={e => setNShots(Math.max(10, Math.min(5000, Number(e.target.value))))}
              style={nInputStyle}
            />
          </div>
          <button onClick={runSim} style={runBtnStyle}>Run simulation</button>
        </div>

        {simResult && <SimResult result={simResult} n={nShots} eExact={eExact} />}
      </div>
    </>
  )
}

function SBar({ value }: { value: number }) {
  const pct = Math.min(100, (value / TSIRELSON) * 100)
  const classicalPct = (2 / TSIRELSON) * 100
  return (
    <div style={{ position: 'relative', height: 14, background: '#1a1a1a', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{
        width: `${pct}%`, height: '100%',
        background: value > 2 ? 'linear-gradient(90deg, #4361ee, #06d6a0)' : '#4361ee',
        borderRadius: 4, transition: 'width 0.15s',
      }} />
      {/* classical bound marker */}
      <div style={{
        position: 'absolute', top: 0, left: `${classicalPct}%`,
        width: 2, height: '100%', background: '#f77f00',
      }} />
    </div>
  )
}

function SimResult({ result, n, eExact }: {
  result: { samePairs: number; oppositePairs: number; eEstimate: number }
  n: number
  eExact: number
}) {
  const { samePairs, oppositePairs, eEstimate } = result
  const sigma = 1 / Math.sqrt(n)
  const deviation = Math.abs(eEstimate - eExact)
  const zScore = deviation / sigma

  return (
    <div style={{ background: '#161616', borderRadius: 6, padding: '0.75rem', fontSize: '0.85rem' }}>
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.5rem' }}>
        <span>+1 pairs (same): <strong>{samePairs}</strong></span>
        <span>−1 pairs (opposite): <strong>{oppositePairs}</strong></span>
      </div>

      <div style={{ marginBottom: '0.4rem' }}>
        <span style={{ color: '#aaa' }}>Estimated E: </span>
        <strong style={{ color: '#4361ee' }}>{eEstimate.toFixed(4)}</strong>
        <span style={{ color: '#aaa' }}> &nbsp;·&nbsp; Exact: </span>
        <strong>{eExact.toFixed(4)}</strong>
      </div>

      <div style={{ color: zScore < 3 ? '#06d6a0' : '#f77f00', fontSize: '0.82rem' }}>
        Convergence: |Ê − E| = {deviation.toFixed(4)}
        &nbsp; (3σ = {(3 * sigma).toFixed(4)},
        &nbsp; σ = 1/√N = {sigma.toFixed(4)})
      </div>
    </div>
  )
}

function helpTitle(topic: BellInfoTopic): string {
  if (topic === 'correlation') return 'Bell — Singlet Correlation'
  if (topic === 'chsh') return 'Bell — CHSH Inequality'
  return 'Bell — N-shot Simulation'
}

const sectionStyle: React.CSSProperties = {
  marginBottom: '1.5rem',
  paddingBottom: '1.5rem',
  borderBottom: '1px solid #1e1e1e',
}

const headerStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem',
}

const titleStyle: React.CSSProperties = {
  fontWeight: 600, fontSize: '0.95rem',
}

const readoutStyle: React.CSSProperties = {
  fontSize: '0.85rem', fontVariantNumeric: 'tabular-nums',
  color: '#e0e0e0', marginBottom: '0.5rem',
  fontFamily: 'monospace',
}

const tableStyle: React.CSSProperties = {
  width: '100%', fontSize: '0.85rem',
  fontVariantNumeric: 'tabular-nums',
  borderCollapse: 'collapse', marginBottom: '0.75rem',
}

const thStyle: React.CSSProperties = {
  textAlign: 'left', paddingBottom: 4, borderBottom: '1px solid #222',
}

const tdStyle: React.CSSProperties = {
  padding: '3px 0', borderBottom: '1px solid #181818',
}

const sValueBoxStyle: React.CSSProperties = {
  background: '#161616', borderRadius: 6, padding: '0.6rem 0.75rem',
  border: '1px solid #444',
}

const presetBtnStyle: React.CSSProperties = {
  padding: '0.25rem 0.7rem', background: '#1a1a2e', color: '#ccc',
  border: '1px solid #333', borderRadius: 4, cursor: 'pointer',
  fontSize: '0.82rem',
}

const nInputStyle: React.CSSProperties = {
  width: '100%', padding: '0.3rem 0.5rem',
  background: '#1a1a1a', border: '1px solid #333',
  color: '#e0e0e0', borderRadius: 4, fontSize: '0.9rem',
}

const runBtnStyle: React.CSSProperties = {
  padding: '0.4rem 1rem', background: '#4361ee', color: '#fff',
  border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.9rem',
  whiteSpace: 'nowrap',
}
