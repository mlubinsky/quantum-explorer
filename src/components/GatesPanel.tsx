import { useState } from 'react'
import {
  blochToQubit, qubitToBloch, qubitAngles, qubitNorm,
  applyX, applyY, applyZ, applyH, applyS, applySDag, applyT, applyTDag,
  applyRx, applyRy, applyRz,
  blochSlerp,
} from '../physics/gates'
import type { Qubit } from '../physics/gates'
import type { Vec3 as SpinVec3 } from '../utils/spinMath'

const PI = Math.PI

interface GatesPanelProps {
  theta: number
  phi: number
  onStateChange: (theta: number, phi: number, trail: SpinVec3[]) => void
}

const PRESETS: [string, number, number][] = [
  ['|↑⟩',  0,      0      ],
  ['|↓⟩',  PI,     0      ],
  ['|+x⟩', PI/2,   0      ],
  ['|−x⟩', PI/2,   PI     ],
  ['|+y⟩', PI/2,   PI/2   ],
  ['|−y⟩', PI/2, 3*PI/2   ],
]

type RotAxis = 'Rx' | 'Ry' | 'Rz'

const N_ARC = 40
const MAX_HISTORY = 12

function toSpinVec(rx: number, ry: number, rz: number): SpinVec3 {
  return [rx, ry, rz]
}

function formatComplex(re: number, im: number): string {
  const r = re.toFixed(3)
  const i = Math.abs(im).toFixed(3)
  if (Math.abs(im) < 5e-4) return r
  if (Math.abs(re) < 5e-4) return `${im < 0 ? '−' : ''}${i}i`
  return `${r} ${im < 0 ? '−' : '+'} ${i}i`
}

export function GatesPanel({ theta, phi, onStateChange }: GatesPanelProps) {
  const [history, setHistory] = useState<[Qubit, string][]>([])
  const [rotAxis, setRotAxis] = useState<RotAxis>('Rz')
  const [rotAngle, setRotAngle] = useState(PI / 2)

  const qubit = blochToQubit(theta, phi)
  const { rx, ry, rz } = qubitToBloch(qubit)

  function applyGate(label: string, next: Qubit) {
    const old = { rx, ry, rz }
    const newBloch = qubitToBloch(next)
    const arc = blochSlerp(old, newBloch, N_ARC)
    const trail: SpinVec3[] = arc.map(v => toSpinVec(v.rx, v.ry, v.rz))
    const { theta: nt, phi: np } = qubitAngles(next)
    setHistory(h => [...h, [qubit, label] as [Qubit, string]].slice(-MAX_HISTORY))
    onStateChange(nt, np, trail)
  }

  function undo() {
    if (history.length === 0) return
    const prev = history[history.length - 1]
    const [prevQ] = prev
    const { theta: nt, phi: np } = qubitAngles(prevQ)
    setHistory(h => h.slice(0, -1))
    onStateChange(nt, np, [])
  }

  function applyPreset(t: number, p: number) {
    setHistory([])
    onStateChange(t, p, [])
  }

  function applyParametric() {
    const fn = rotAxis === 'Rx' ? applyRx : rotAxis === 'Ry' ? applyRy : applyRz
    applyGate(`${rotAxis}(${(rotAngle / PI).toFixed(2)}π)`, fn(rotAngle, qubit))
  }

  const norm = qubitNorm(qubit)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

      {/* State preset strip */}
      <div>
        <div style={sectionLabel}>State presets</div>
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
          {PRESETS.map(([label, t, p]) => (
            <button key={label} onClick={() => applyPreset(t, p)} style={presetBtn}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Gate pad */}
      <div>
        <div style={sectionLabel}>Gates</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            {([['X', () => applyX(qubit)], ['Y', () => applyY(qubit)], ['Z', () => applyZ(qubit)]] as [string, () => Qubit][]).map(
              ([lbl, fn]) => <button key={lbl} onClick={() => applyGate(lbl, fn())} style={gateBtn}>{lbl}</button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            {([['H', () => applyH(qubit)], ['S', () => applyS(qubit)], ['S†', () => applySDag(qubit)]] as [string, () => Qubit][]).map(
              ([lbl, fn]) => <button key={lbl} onClick={() => applyGate(lbl, fn())} style={gateBtn}>{lbl}</button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            {([['T', () => applyT(qubit)], ['T†', () => applyTDag(qubit)]] as [string, () => Qubit][]).map(
              ([lbl, fn]) => <button key={lbl} onClick={() => applyGate(lbl, fn())} style={gateBtn}>{lbl}</button>
            )}
          </div>
        </div>
      </div>

      {/* Parametric rotation */}
      <div>
        <div style={sectionLabel}>Rotation</div>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.4rem' }}>
          {(['Rx', 'Ry', 'Rz'] as RotAxis[]).map(ax => (
            <button
              key={ax}
              onClick={() => setRotAxis(ax)}
              style={{
                ...axisBtn,
                background: rotAxis === ax ? '#4361ee' : '#1a1a2e',
                borderColor: rotAxis === ax ? '#4361ee' : '#444',
                color: rotAxis === ax ? '#fff' : '#aaa',
              }}
            >
              {ax}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <span style={{ color: '#aaa', fontSize: '0.8rem', width: 70 }}>
            {(rotAngle / PI).toFixed(3)}π
          </span>
          <input
            type="range" min={-2 * PI} max={2 * PI} step={0.01}
            value={rotAngle}
            onChange={e => setRotAngle(Number(e.target.value))}
            style={{ flex: 1, accentColor: '#4361ee' }}
          />
        </div>
        <button onClick={applyParametric} style={applyBtn}>Apply {rotAxis}</button>
      </div>

      {/* Gate history */}
      {history.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
            <div style={sectionLabel}>History</div>
            <button onClick={undo} style={undoBtn}>↩ Undo</button>
          </div>
          <div style={{
            display: 'flex', gap: '0.3rem', overflowX: 'auto',
            padding: '0.2rem 0', scrollbarWidth: 'thin',
          }}>
            {history.map(([, lbl], i) => (
              <span key={i} style={{
                background: i === history.length - 1 ? '#4361ee33' : '#1a1a2e',
                border: '1px solid #333', borderRadius: 3,
                padding: '0.15rem 0.4rem', fontSize: '0.75rem',
                color: '#ccc', whiteSpace: 'nowrap', fontFamily: 'monospace',
              }}>
                {lbl}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* State readout */}
      <div style={readoutBox}>
        <div style={{ color: '#888', fontSize: '0.75rem', marginBottom: '0.4rem', fontWeight: 600 }}>State</div>
        <div style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#e0e0e0', marginBottom: '0.3rem' }}>
          |ψ⟩ = ({formatComplex(qubit.aRe, qubit.aIm)})|↑⟩ + ({formatComplex(qubit.bRe, qubit.bIm)})|↓⟩
        </div>
        <div style={{ fontSize: '0.8rem', color: '#aaa' }}>
          <span style={{ color: '#e74c3c' }}>rx = {rx.toFixed(3)}</span>
          {'  '}
          <span style={{ color: '#2ecc71' }}>ry = {ry.toFixed(3)}</span>
          {'  '}
          <span style={{ color: '#3498db' }}>rz = {rz.toFixed(3)}</span>
        </div>
        <div style={{ fontSize: '0.78rem', color: norm > 1 + 1e-6 || norm < 1 - 1e-6 ? '#ef233c' : '#444', marginTop: '0.2rem' }}>
          ‖ψ‖ = {norm.toFixed(6)}
        </div>
      </div>
    </div>
  )
}

const sectionLabel: React.CSSProperties = {
  fontSize: '0.75rem', color: '#666', fontWeight: 600,
  textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem',
}

const gateBtn: React.CSSProperties = {
  padding: '0.35rem 0.7rem', background: '#1a1a2e', color: '#e0e0e0',
  border: '1px solid #333', borderRadius: 4, cursor: 'pointer',
  fontSize: '0.9rem', fontFamily: 'monospace', fontWeight: 700,
  minWidth: 44, transition: 'background 0.1s',
}

const presetBtn: React.CSSProperties = {
  padding: '0.2rem 0.55rem', background: '#1a1a2e', color: '#ccc',
  border: '1px solid #333', borderRadius: 4, cursor: 'pointer',
  fontSize: '0.8rem', fontFamily: 'monospace',
}

const axisBtn: React.CSSProperties = {
  padding: '0.25rem 0.6rem', border: '1px solid', borderRadius: 4,
  cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'monospace',
}

const applyBtn: React.CSSProperties = {
  padding: '0.35rem 1rem', background: '#4361ee', color: '#fff',
  border: 'none', borderRadius: 4, cursor: 'pointer',
  fontSize: '0.85rem', fontWeight: 600,
}

const undoBtn: React.CSSProperties = {
  padding: '0.15rem 0.5rem', background: 'transparent', color: '#888',
  border: '1px solid #333', borderRadius: 4, cursor: 'pointer',
  fontSize: '0.78rem',
}

const readoutBox: React.CSSProperties = {
  background: '#0d0d1a', borderRadius: 5, padding: '0.6rem 0.8rem',
  border: '1px solid #1a1a2e',
}
