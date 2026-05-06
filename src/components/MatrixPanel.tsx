import { useState, useEffect, useRef, useMemo } from 'react'
import { buildH, buildX, buildP, heisenbergRe } from '../utils/matrixElements'
import { MatrixHeatmap } from './MatrixHeatmap'

type Operator = 'H' | 'X' | 'P'
type View = 'static' | 'animated'

interface Props {
  energies: number[]
  wavefunctions: number[][]
  gridX: number[]
  dx: number
  labels: string[]
}

const btn: React.CSSProperties = {
  padding: '3px 11px',
  border: '1px solid #333',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: '0.8rem',
  background: '#1a1a1a',
  color: '#aaa',
}
const btnActive: React.CSSProperties = { ...btn, background: '#4361ee', color: '#fff', borderColor: '#4361ee' }
const btnOp: React.CSSProperties = { ...btn, fontFamily: 'Georgia, serif', fontSize: '0.95rem', fontWeight: 700 }
const btnOpActive: React.CSSProperties = { ...btnOp, background: '#4361ee', color: '#fff', borderColor: '#4361ee' }

export function MatrixPanel({ energies, wavefunctions, gridX, dx, labels }: Props) {
  const N = energies.length

  const [operator, setOperator] = useState<Operator>('X')
  const [view, setView] = useState<View>('static')
  const [playing, setPlaying] = useState(false)
  const [t, setT] = useState(0)
  const [speed, setSpeed] = useState(1)

  const rafRef = useRef<number | null>(null)
  const lastRef = useRef<number | null>(null)

  useEffect(() => {
    if (!playing || view !== 'animated') return
    const step = (now: number) => {
      if (lastRef.current !== null) setT(prev => prev + (now - lastRef.current!) / 1000 * speed)
      lastRef.current = now
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      lastRef.current = null
    }
  }, [playing, view, speed])

  useEffect(() => { setT(0); setPlaying(false) }, [operator, view])

  const H_mat = useMemo(
    () => buildH(energies).map((e, m) => energies.map((_, n) => m === n ? e : 0)),
    [energies],
  )
  const X_mat = useMemo(() => buildX(wavefunctions, gridX, dx), [wavefunctions, gridX, dx])
  const P_mat = useMemo(() => buildP(wavefunctions, dx), [wavefunctions, dx])

  if (N < 2) return (
    <p style={{ fontSize: '0.82rem', color: '#666' }}>Need at least 2 levels.</p>
  )

  const base = operator === 'H' ? H_mat : operator === 'X' ? X_mat : P_mat
  const matrix = view === 'animated' ? heisenbergRe(base, energies, t) : base

  const heatmapTitle: Record<Operator, string> = {
    H: '⟨ψₘ|Ĥ|ψₙ⟩ — diagonal in its own eigenbasis',
    X: view === 'animated'
      ? `Re⟨ψₘ|x(t)|ψₙ⟩   t = ${t.toFixed(2)} a.u.`
      : '⟨ψₘ|x|ψₙ⟩ — real, symmetric',
    P: view === 'animated'
      ? `Re⟨ψₘ|p(t)|ψₙ⟩   t = ${t.toFixed(2)} a.u.`
      : 'Im⟨ψₘ|p|ψₙ⟩ — purely imaginary, antisymmetric',
  }

  const bohrFreqs = energies.map((Em) => energies.map(En => Em - En))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Operator + view selectors */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: '0.8rem', color: '#aaa' }}>Operator:</span>
        {(['H', 'X', 'P'] as Operator[]).map(op => (
          <button key={op} onClick={() => setOperator(op)}
            style={operator === op ? btnOpActive : btnOp}>{op}</button>
        ))}
        <span style={{ marginLeft: 10, fontSize: '0.8rem', color: '#aaa' }}>View:</span>
        {(['static', 'animated'] as View[]).map(v => (
          <button key={v} onClick={() => setView(v)}
            style={view === v ? btnActive : btn}>
            {v === 'static' ? 'Structure (t = 0)' : 'Time evolution'}
          </button>
        ))}
      </div>

      {/* Animation controls */}
      {view === 'animated' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, fontSize: '0.8rem', color: '#ccc' }}>
          <button onClick={() => setPlaying(p => !p)} style={{ ...btn, minWidth: '4.5em' }}>
            {playing ? 'Pause' : 'Play'}
          </button>
          <button onClick={() => { setT(0); setPlaying(false) }} style={btn}>Reset</button>
          <span>t = <strong>{t.toFixed(2)}</strong> a.u.</span>
          <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            Speed:
            <select value={speed} onChange={e => setSpeed(Number(e.target.value))}
              style={{ background: '#1a1a1a', color: '#ccc', border: '1px solid #333', borderRadius: 3, padding: '1px 4px' }}>
              {[0.25, 0.5, 1, 2, 5].map(s => <option key={s} value={s}>{s}×</option>)}
            </select>
          </label>
          {operator === 'H' && (
            <span style={{ color: '#555', fontStyle: 'italic' }}>Ĥ is time-independent</span>
          )}
        </div>
      )}

      <MatrixHeatmap
        data={matrix}
        rowLabels={labels}
        colLabels={labels}
        title={heatmapTitle[operator]}
        sequential={operator === 'H'}
        markDiagonal={view === 'animated'}
      />

      {view === 'static' && (
        <p style={{ margin: 0, fontSize: '0.75rem', color: '#555', fontStyle: 'italic' }}>
          {operator === 'H' && 'H is diagonal by definition — off-diagonal elements are exactly zero.'}
          {operator === 'X' && 'Zero entries reflect parity selection rules: ⟨ψₘ|x|ψₙ⟩ = 0 when ψₘ and ψₙ have the same parity.'}
          {operator === 'P' && 'P is purely imaginary; table shows Im⟨ψₘ|p|ψₙ⟩. Antisymmetry P_mn = −P_nm follows from the operator being Hermitian.'}
        </p>
      )}
      {view === 'animated' && (
        <p style={{ margin: 0, fontSize: '0.75rem', color: '#555', fontStyle: 'italic' }}>
          Colour shows Re[Oₘₙ(t)]. Magnitude |Oₘₙ| is time-invariant; diagonal elements (ωₙₙ = 0) never change.
        </p>
      )}

      <details>
        <summary style={{ fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', userSelect: 'none', color: '#aaa' }}>
          Bohr frequencies ωₘₙ = Eₘ − Eₙ (a.u.)
        </summary>
        <div style={{ marginTop: 10 }}>
          <MatrixHeatmap
            data={bohrFreqs}
            rowLabels={labels}
            colLabels={labels}
            title="ωₘₙ — off-diagonal elements oscillate at these frequencies"
          />
          <p style={{ margin: '6px 0 0', fontSize: '0.72rem', color: '#555' }}>
            Period Tₘₙ = 2π / |ωₘₙ| a.u. &nbsp;·&nbsp; Diagonal is always zero.
          </p>
        </div>
      </details>
    </div>
  )
}
