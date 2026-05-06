import { useState } from 'react'
import { bornP, collapseState, blochVector } from '../utils/spinMath'
import type { Vec3 } from '../utils/spinMath'

interface Props {
  theta: number
  phi: number
  onCollapse: (theta: number, phi: number) => void
}

type AxisPreset = 'x' | 'y' | 'z' | 'custom'

interface MeasurementRecord {
  axisLabel: string
  pPlus: number
  outcome: '+' | '-'
}

const PI = Math.PI

function axisVec(preset: AxisPreset, customTheta: number, customPhi: number): Vec3 {
  if (preset === 'x') return [1, 0, 0]
  if (preset === 'y') return [0, 1, 0]
  if (preset === 'z') return [0, 0, 1]
  return [
    Math.sin(customTheta) * Math.cos(customPhi),
    Math.sin(customTheta) * Math.sin(customPhi),
    Math.cos(customTheta),
  ]
}

function axisLabel(preset: AxisPreset, customTheta: number, customPhi: number): string {
  if (preset !== 'custom') return preset
  return `(θ=${customTheta.toFixed(2)}, φ=${customPhi.toFixed(2)})`
}

function ProbBar({ pPlus }: { pPlus: number }) {
  const pct = (pPlus * 100).toFixed(1)
  const mct = ((1 - pPlus) * 100).toFixed(1)
  return (
    <div style={{ marginBottom: '0.6rem' }}>
      <div style={{ marginBottom: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ width: 22, fontSize: '0.8rem', color: '#aaa' }}>+½</span>
          <div style={{ flex: 1, height: 12, background: '#1a1a1a', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${pPlus * 100}%`, height: '100%', background: '#4361ee', borderRadius: 3, transition: 'width 0.15s' }} />
          </div>
          <span style={{ width: 38, fontSize: '0.8rem', color: '#4361ee', textAlign: 'right' }}>{pct}%</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 22, fontSize: '0.8rem', color: '#aaa' }}>−½</span>
          <div style={{ flex: 1, height: 12, background: '#1a1a1a', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${(1 - pPlus) * 100}%`, height: '100%', background: '#ef233c', borderRadius: 3, transition: 'width 0.15s' }} />
          </div>
          <span style={{ width: 38, fontSize: '0.8rem', color: '#ef233c', textAlign: 'right' }}>{mct}%</span>
        </div>
      </div>
    </div>
  )
}

function Histogram({ plus, minus, pExact }: { plus: number; minus: number; pExact: number }) {
  const total = plus + minus
  const maxCount = Math.max(plus, minus, 1)
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
        <span style={{ width: 22, fontSize: '0.8rem', color: '#aaa' }}>+½</span>
        <div style={{ flex: 1, height: 14, background: '#1a1a1a', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${(plus / maxCount) * 100}%`, height: '100%', background: '#4361ee', borderRadius: 3 }} />
        </div>
        <span style={{ width: 50, fontSize: '0.78rem', color: '#aaa', textAlign: 'right' }}>{plus}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 22, fontSize: '0.8rem', color: '#aaa' }}>−½</span>
        <div style={{ flex: 1, height: 14, background: '#1a1a1a', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${(minus / maxCount) * 100}%`, height: '100%', background: '#ef233c', borderRadius: 3 }} />
        </div>
        <span style={{ width: 50, fontSize: '0.78rem', color: '#aaa', textAlign: 'right' }}>{minus}</span>
      </div>
      <div style={{ fontSize: '0.75rem', color: '#888', marginTop: 4 }}>
        exact P(+½) = {(pExact * 100).toFixed(2)}% · observed {total > 0 ? ((plus / total) * 100).toFixed(1) : '—'}% · N = {total}
      </div>
      <div style={{ fontSize: '0.75rem', color: '#888', marginTop: 2, fontStyle: 'italic' }}>
        Same |ψ⟩ each trial — quantum randomness is irreducible, not hidden-variable ignorance.
      </div>
    </div>
  )
}

function MeasurementHistory({ history, onClear }: { history: MeasurementRecord[]; onClear: () => void }) {
  if (history.length === 0) return null

  const last = history[history.length - 1]
  const prev = history.length >= 2 ? history[history.length - 2] : null
  const axisChanged = prev !== null && prev.axisLabel !== last.axisLabel

  const spinFilterNote = history.length >= 3 &&
    history[history.length - 1].axisLabel === history[0].axisLabel &&
    history.some((r, i) => i > 0 && r.axisLabel !== history[0].axisLabel)

  return (
    <div style={{ marginTop: '0.6rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: 600 }}>Measurement history</span>
        <button onClick={onClear} style={clearBtnStyle}>Clear</button>
      </div>
      <div style={{ maxHeight: 140, overflowY: 'auto', fontSize: '0.78rem', color: '#ccc' }}>
        {history.map((rec, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 2 }}>
            <span style={{ color: '#555', minWidth: 18 }}>{i + 1}.</span>
            <span>along <strong>{rec.axisLabel}</strong></span>
            <span style={{ color: '#666' }}>(P(+½)={( rec.pPlus * 100).toFixed(0)}%)</span>
            <span style={{ color: rec.outcome === '+' ? '#4361ee' : '#ef233c', fontWeight: 700 }}>
              → {rec.outcome === '+' ? '+½' : '−½'}
            </span>
          </div>
        ))}
      </div>
      {axisChanged && (
        <p style={noteStyle}>
          After measuring along <strong>{prev!.axisLabel}</strong>, the state collapsed to a
          {prev!.axisLabel}-eigenstate — it has no memory of its previous direction.
          Measuring along <strong>{last.axisLabel}</strong> now uses this new state.
          Non-commuting measurements do not have simultaneous definite values.
        </p>
      )}
      {spinFilterNote && (
        <p style={noteStyle}>
          Spin-filter result: measuring a perpendicular axis between two {history[0].axisLabel}-axis
          measurements randomises the second {history[0].axisLabel} outcome, even if the first was
          definite. The intermediate measurement erased the original spin direction.
        </p>
      )}
    </div>
  )
}

export function SternGerlachPanel({ theta, phi, onCollapse }: Props) {
  const [axisPreset,   setAxisPreset]   = useState<AxisPreset>('z')
  const [customTheta,  setCustomTheta]  = useState(PI / 4)
  const [customPhi,    setCustomPhi]    = useState(0)
  const [nShots,       setNShots]       = useState(500)
  const [shotResult,   setShotResult]   = useState<{ plus: number; minus: number; pExact: number } | null>(null)
  const [history,      setHistory]      = useState<MeasurementRecord[]>([])
  const [prepState,    setPrepState]    = useState<{ theta: number; phi: number } | null>(null)
  const [prepResult,   setPrepResult]   = useState<{ plus: number; minus: number; pExact: number } | null>(null)

  const axis  = axisVec(axisPreset, customTheta, customPhi)
  const label = axisLabel(axisPreset, customTheta, customPhi)
  const bloch = blochVector(theta, phi)
  const pPlus = bornP(axis, bloch)

  function handleMeasureOnce() {
    const outcome: '+' | '-' = Math.random() < pPlus ? '+' : '-'
    setHistory(h => [...h, { axisLabel: label, pPlus, outcome }])
    const { theta: t, phi: p } = collapseState(axis, outcome)
    onCollapse(t, p)
    setShotResult(null)
  }

  function handleRunShots() {
    let plus = 0
    for (let i = 0; i < nShots; i++) { if (Math.random() < pPlus) plus++ }
    setShotResult({ plus, minus: nShots - plus, pExact: pPlus })
  }

  function handleLockPrep() {
    setPrepState({ theta, phi })
    setPrepResult(null)
  }

  function handleRunFromPrep() {
    if (!prepState) return
    const prepBloch = blochVector(prepState.theta, prepState.phi)
    const p = bornP(axis, prepBloch)
    let plus = 0
    for (let i = 0; i < nShots; i++) { if (Math.random() < p) plus++ }
    setPrepResult({ plus, minus: nShots - plus, pExact: p })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

      {/* Axis selector */}
      <div>
        <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: 5 }}>Measurement axis n̂</div>
        <div style={{ display: 'flex', gap: '0.3rem', marginBottom: 6 }}>
          {(['x', 'y', 'z', 'custom'] as AxisPreset[]).map(p => (
            <button
              key={p}
              onClick={() => setAxisPreset(p)}
              style={{ ...axisBtnStyle, background: axisPreset === p ? '#4361ee' : '#1a1a1a', color: axisPreset === p ? '#fff' : '#ccc' }}
            >
              {p === 'custom' ? 'custom' : p}
            </button>
          ))}
        </div>
        {axisPreset === 'custom' && (
          <div style={{ fontSize: '0.8rem', color: '#ccc', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label>
              θ_n = {customTheta.toFixed(2)} rad
              <input type="range" min={0} max={PI} step={0.01} value={customTheta}
                onChange={e => setCustomTheta(parseFloat(e.target.value))}
                style={{ display: 'block', width: '100%', marginTop: 2 }} />
            </label>
            <label>
              φ_n = {customPhi.toFixed(2)} rad
              <input type="range" min={0} max={2 * PI} step={0.01} value={customPhi}
                onChange={e => setCustomPhi(parseFloat(e.target.value))}
                style={{ display: 'block', width: '100%', marginTop: 2 }} />
            </label>
          </div>
        )}
      </div>

      {/* Probability bar */}
      <ProbBar pPlus={pPlus} />

      {/* Single measurement */}
      <div>
        <button onClick={handleMeasureOnce} style={measureBtnStyle}>
          Measure once
        </button>
        <MeasurementHistory history={history} onClear={() => setHistory([])} />
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #222', margin: 0 }} />

      {/* N-shot run */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: '0.8rem', color: '#aaa' }}>N shots:</span>
          <input
            type="number" min={1} max={5000} value={nShots}
            onChange={e => setNShots(Math.max(1, Math.min(5000, parseInt(e.target.value) || 1)))}
            style={nInputStyle}
          />
          <button onClick={handleRunShots} style={runBtnStyle}>Run N shots</button>
        </div>
        {shotResult && <Histogram {...shotResult} />}
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #222', margin: 0 }} />

      {/* Locked prep state */}
      <div>
        <div style={{ fontSize: '0.75rem', color: '#888', fontStyle: 'italic', marginBottom: 5 }}>
          Identical preparation — measure the same state N times
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 4 }}>
          <button onClick={handleLockPrep} style={runBtnStyle}>Lock |ψ⟩ as prep state</button>
          {prepState && (
            <span style={{ fontSize: '0.75rem', color: '#888' }}>
              θ={prepState.theta.toFixed(3)}, φ={prepState.phi.toFixed(3)}
            </span>
          )}
        </div>
        {prepState && (
          <button onClick={handleRunFromPrep} style={{ ...measureBtnStyle, marginBottom: 4 }}>
            Measure {nShots}× from |prep⟩
          </button>
        )}
        {prepResult && (
          <>
            <Histogram {...prepResult} />
            <div style={{ fontSize: '0.75rem', color: '#888', marginTop: 4, fontStyle: 'italic' }}>
              Starting from the same prepared state each time — P(+½) converges to the exact value as N grows.
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const axisBtnStyle: React.CSSProperties = {
  padding: '0.2rem 0.6rem', border: '1px solid #333', borderRadius: 4,
  cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'monospace',
}

const measureBtnStyle: React.CSSProperties = {
  padding: '0.3rem 1rem', background: '#4361ee', color: '#fff',
  border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.85rem',
  marginBottom: '0.3rem',
}

const runBtnStyle: React.CSSProperties = {
  padding: '0.25rem 0.7rem', background: '#1a1a2e', color: '#ccc',
  border: '1px solid #333', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem',
}

const clearBtnStyle: React.CSSProperties = {
  padding: '0.15rem 0.5rem', background: 'none', color: '#555',
  border: '1px solid #333', borderRadius: 3, cursor: 'pointer', fontSize: '0.75rem',
}

const nInputStyle: React.CSSProperties = {
  width: 60, background: '#1a1a1a', color: '#ccc', border: '1px solid #333',
  borderRadius: 4, padding: '0.2rem 0.4rem', fontSize: '0.8rem',
}

const noteStyle: React.CSSProperties = {
  margin: '4px 0 0', fontSize: '0.75rem', color: '#888',
  background: '#111', borderLeft: '2px solid #333',
  padding: '4px 8px', borderRadius: '0 4px 4px 0',
}
