import { useState, useEffect, useRef, useCallback } from 'react'
import Plot from 'react-plotly.js'
import { HelpButton, HelpModal } from './HelpModal'
import { RingInfoPanel } from './RingInfoPanel'
import {
  ringEnergy,
  groundStateN,
  persistentCurrent,
  ringWavefunctionRe,
  ringPacket,
  ringPacketCoeffs,
  revivalTime,
  crossingPhis,
} from '../physics/ring'

const DARK = '#1a1a2e'
const GRID = '#2a2a3e'
const TEXT = '#c8c8d8'

const BAND_COLORS = [
  '#e63946', '#f4a261', '#2a9d8f', '#4361ee',
  '#7209b7', '#06d6a0', '#ff6b6b', '#ffd166', '#118ab2',
]

const N_BANDS = [-4, -3, -2, -1, 0, 1, 2, 3, 4]
const PHI_POINTS = 200
const THETA_POINTS = 200

function makeThetaArray(N = THETA_POINTS) {
  return Array.from({ length: N }, (_, i) => (i / N) * 2 * Math.PI)
}

function bandColor(n: number) {
  return BAND_COLORS[(n + 4) % BAND_COLORS.length]
}

// ── Energy level diagram ───────────────────────────────────────────────────

function EnergyDiagram({
  phi, R, n: selectedN, onPhiChange,
}: {
  phi: number; R: number; n: number; onPhiChange: (p: number) => void
}) {
  const [showHelp, setShowHelp] = useState(false)
  const phiArr = Array.from({ length: PHI_POINTS + 1 }, (_, i) => -1 + (4 / PHI_POINTS) * i)
  const crossings = crossingPhis(-4, 4)
  const gsN = groundStateN(phi)

  const traces: Plotly.Data[] = N_BANDS.map(n => ({
    x: phiArr,
    y: phiArr.map(p => ringEnergy(n, p, R)),
    mode: 'lines',
    line: { color: bandColor(n), width: n === gsN ? 3 : 1.5 },
    name: `n=${n}`,
    hovertemplate: `n=${n}, φ=%{x:.2f}, E=%{y:.4f}<extra></extra>`,
  }))

  // current-φ vertical line
  traces.push({
    x: [phi, phi],
    y: [0, ringEnergy(-4, phi, R) + 0.05],
    mode: 'lines',
    line: { color: '#ffffff', width: 1, dash: 'dot' },
    showlegend: false,
    hoverinfo: 'skip',
  } as Plotly.Data)

  // dots at current phi for each band
  N_BANDS.forEach(n => {
    traces.push({
      x: [phi],
      y: [ringEnergy(n, phi, R)],
      mode: 'markers',
      marker: { color: bandColor(n), size: n === gsN ? 10 : 6, symbol: 'circle' },
      showlegend: false,
      hovertemplate: `n=${n}, E=%{y:.4f}<extra></extra>`,
    } as Plotly.Data)
  })

  // crossing markers
  traces.push({
    x: crossings,
    y: crossings.map(() => 0),
    mode: 'markers',
    marker: { color: '#ffffff', size: 5, symbol: 'circle-open' },
    showlegend: false,
    hoverinfo: 'skip',
  } as Plotly.Data)

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ color: TEXT, fontSize: '0.9rem', fontWeight: 600 }}>Energy Level Diagram</span>
        <HelpButton onClick={() => setShowHelp(true)} />
      </div>
      <Plot
        data={traces}
        layout={{
          paper_bgcolor: DARK, plot_bgcolor: DARK,
          margin: { t: 10, b: 50, l: 60, r: 20 },
          xaxis: { title: 'φ (flux / Φ₀)', color: TEXT, gridcolor: GRID, range: [-1, 3] },
          yaxis: { title: 'E (Hartree)', color: TEXT, gridcolor: GRID, rangemode: 'tozero' },
          showlegend: true,
          legend: { x: 1.01, y: 1, font: { color: TEXT, size: 10 }, bgcolor: 'transparent' },
          font: { color: TEXT },
          height: 340,
        }}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: '100%' }}
        onClick={(e) => {
          const pt = e.points?.[0]
          if (pt?.x != null) onPhiChange(pt.x as number)
        }}
      />
      {showHelp && (
        <HelpModal title="Energy Level Diagram" onClose={() => setShowHelp(false)}>
          <RingInfoPanel topic="energy" />
        </HelpModal>
      )}
    </div>
  )
}

// ── Wavefunction on ring ───────────────────────────────────────────────────

function WavefunctionPlot({ n }: { n: number }) {
  const [showHelp, setShowHelp] = useState(false)
  const [open, setOpen] = useState(true)
  const thetas = makeThetaArray()
  const A = 0.5

  const r = thetas.map(th => 1 + A * ringWavefunctionRe(n, th))
  const x = r.map((ri, i) => ri * Math.cos(thetas[i]))
  const y = r.map((ri, i) => ri * Math.sin(thetas[i]))

  const xRef = Array.from({ length: 101 }, (_, i) => Math.cos((i / 100) * 2 * Math.PI))
  const yRef = Array.from({ length: 101 }, (_, i) => Math.sin((i / 100) * 2 * Math.PI))

  return (
    <div style={{ marginTop: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => setOpen(o => !o)} style={collapseBtnStyle}>
          {open ? '▾' : '▸'}
        </button>
        <span style={{ color: TEXT, fontSize: '0.9rem', fontWeight: 600 }}>
          Wavefunction on Ring (n = {n})
        </span>
        <HelpButton onClick={() => setShowHelp(true)} />
      </div>
      {open && (
        <Plot
          data={[
            { x: xRef, y: yRef, mode: 'lines', line: { color: '#444', width: 1 }, showlegend: false, hoverinfo: 'skip' },
            { x, y, mode: 'lines', fill: 'toself', fillcolor: 'rgba(67,97,238,0.2)', line: { color: '#4361ee', width: 2 }, name: `Re(ψ_${n})`, hoverinfo: 'skip' },
          ]}
          layout={{
            paper_bgcolor: DARK, plot_bgcolor: DARK,
            margin: { t: 10, b: 10, l: 10, r: 10 },
            xaxis: { visible: false, scaleanchor: 'y' },
            yaxis: { visible: false },
            showlegend: false,
            height: 280,
          }}
          config={{ displayModeBar: false, responsive: true }}
          style={{ width: '100%' }}
        />
      )}
      {showHelp && (
        <HelpModal title="Wavefunction on Ring" onClose={() => setShowHelp(false)}>
          <RingInfoPanel topic="wavefunction" />
        </HelpModal>
      )}
    </div>
  )
}

// ── Persistent current ─────────────────────────────────────────────────────

function CurrentPlot({
  phi, R, n: selectedN,
}: {
  phi: number; R: number; n: number
}) {
  const [showHelp, setShowHelp] = useState(false)
  const [open, setOpen] = useState(true)
  const phiArr = Array.from({ length: PHI_POINTS + 1 }, (_, i) => -1 + (4 / PHI_POINTS) * i)

  // Sawtooth ground-state current (split at crossings to avoid vertical lines)
  const gsSegments: { x: number[]; y: number[] }[] = []
  let seg: { x: number[]; y: number[] } = { x: [], y: [] }
  let prevNgs = groundStateN(phiArr[0])
  for (const p of phiArr) {
    const ngs = groundStateN(p)
    if (ngs !== prevNgs) {
      gsSegments.push(seg)
      seg = { x: [], y: [] }
      prevNgs = ngs
    }
    seg.x.push(p)
    seg.y.push(persistentCurrent(ngs, p, R))
  }
  gsSegments.push(seg)

  const traces: Plotly.Data[] = gsSegments.map((s, i) => ({
    x: s.x, y: s.y,
    mode: 'lines',
    line: { color: '#f4a261', width: 2 },
    name: i === 0 ? 'I_gs (sawtooth)' : undefined,
    showlegend: i === 0,
    hovertemplate: 'φ=%{x:.2f}, I=%{y:.4f}<extra></extra>',
  } as Plotly.Data))

  // Selected-n line
  traces.push({
    x: phiArr,
    y: phiArr.map(p => persistentCurrent(selectedN, p, R)),
    mode: 'lines',
    line: { color: bandColor(selectedN), width: 2, dash: 'dash' },
    name: `I_${selectedN}`,
  } as Plotly.Data)

  // Current phi marker
  traces.push({
    x: [phi],
    y: [persistentCurrent(groundStateN(phi), phi, R)],
    mode: 'markers',
    marker: { color: '#fff', size: 8 },
    showlegend: false,
    hovertemplate: `I_gs=%{y:.4f}<extra></extra>`,
  } as Plotly.Data)

  return (
    <div style={{ marginTop: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => setOpen(o => !o)} style={collapseBtnStyle}>
          {open ? '▾' : '▸'}
        </button>
        <span style={{ color: TEXT, fontSize: '0.9rem', fontWeight: 600 }}>Persistent Current</span>
        <HelpButton onClick={() => setShowHelp(true)} />
      </div>
      {open && (
        <Plot
          data={traces}
          layout={{
            paper_bgcolor: DARK, plot_bgcolor: DARK,
            margin: { t: 10, b: 50, l: 60, r: 20 },
            xaxis: { title: 'φ (flux / Φ₀)', color: TEXT, gridcolor: GRID, range: [-1, 3] },
            yaxis: { title: 'I (a.u.)', color: TEXT, gridcolor: GRID },
            showlegend: true,
            legend: { x: 1.01, y: 1, font: { color: TEXT, size: 10 }, bgcolor: 'transparent' },
            font: { color: TEXT },
            height: 280,
          }}
          config={{ displayModeBar: false, responsive: true }}
          style={{ width: '100%' }}
        />
      )}
      {showHelp && (
        <HelpModal title="Persistent Current" onClose={() => setShowHelp(false)}>
          <RingInfoPanel topic="current" />
        </HelpModal>
      )}
    </div>
  )
}

// ── Wavepacket animation ───────────────────────────────────────────────────

function WavepacketAnimation({ phi, R }: { phi: number; R: number }) {
  const [showHelp, setShowHelp] = useState(false)
  const [open, setOpen] = useState(true)
  const [running, setRunning] = useState(false)
  const [loop, setLoop] = useState(true)
  const [speed, setSpeed] = useState(1.0)
  const tRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)
  const [displayT, setDisplayT] = useState(0)

  const Trev = revivalTime(R)
  const n0 = groundStateN(phi)
  const coeffs = ringPacketCoeffs(n0, 1.5, 5)
  const thetas = makeThetaArray()

  const getFrame = useCallback((t: number) => {
    const psi = thetas.map(th => ringPacket(th, t, coeffs, phi, R))
    const psiSq = psi.map(v => v * v)
    const A = 0.6
    const r = psiSq.map(p => 1 + A * p * 2 * Math.PI)
    return {
      x: r.map((ri, i) => ri * Math.cos(thetas[i])),
      y: r.map((ri, i) => ri * Math.sin(thetas[i])),
    }
  }, [coeffs, phi, R]) // thetas is stable (new array each render but same values)

  const [frame, setFrame] = useState(() => getFrame(0))

  const tick = useCallback((now: number) => {
    if (lastTimeRef.current === null) lastTimeRef.current = now
    const dt = ((now - lastTimeRef.current) / 1000) * speed * Trev * 0.15
    lastTimeRef.current = now
    tRef.current += dt
    if (loop && tRef.current > Trev) tRef.current -= Trev
    setDisplayT(tRef.current)
    setFrame(getFrame(tRef.current))
    rafRef.current = requestAnimationFrame(tick)
  }, [speed, Trev, loop, getFrame])

  useEffect(() => {
    if (running) {
      lastTimeRef.current = null
      rafRef.current = requestAnimationFrame(tick)
    } else {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current) }
  }, [running, tick])

  // reset when phi/R changes
  useEffect(() => {
    tRef.current = 0
    setDisplayT(0)
    setFrame(getFrame(0))
  }, [phi, R, getFrame])

  const xRef = Array.from({ length: 101 }, (_, i) => Math.cos((i / 100) * 2 * Math.PI))
  const yRef = Array.from({ length: 101 }, (_, i) => Math.sin((i / 100) * 2 * Math.PI))

  return (
    <div style={{ marginTop: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => setOpen(o => !o)} style={collapseBtnStyle}>
          {open ? '▾' : '▸'}
        </button>
        <span style={{ color: TEXT, fontSize: '0.9rem', fontWeight: 600 }}>Wavepacket Animation</span>
        <HelpButton onClick={() => setShowHelp(true)} />
      </div>
      {open && (
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
            <button onClick={() => setRunning(r => !r)} style={btnStyle}>
              {running ? '⏸ Pause' : '▶ Play'}
            </button>
            <button onClick={() => {
              setRunning(false)
              tRef.current = 0
              setDisplayT(0)
              setFrame(getFrame(0))
            }} style={btnStyle}>⏮ Reset</button>
            <label style={{ color: TEXT, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 4 }}>
              <input type="checkbox" checked={loop} onChange={e => setLoop(e.target.checked)} />
              Loop
            </label>
            <label style={{ color: TEXT, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              Speed {speed.toFixed(2)}×
              <input type="range" min={0.1} max={4} step={0.05} value={speed}
                onChange={e => setSpeed(+e.target.value)}
                style={{ width: 80 }} />
            </label>
            <span style={{ color: '#aaa', fontSize: '0.82rem', marginLeft: 8 }}>
              t/T_rev = {(displayT / Trev).toFixed(3)}
            </span>
          </div>
          <Plot
            data={[
              { x: xRef, y: yRef, mode: 'lines', line: { color: '#333', width: 1 }, showlegend: false, hoverinfo: 'skip' },
              { x: frame.x, y: frame.y, mode: 'lines', fill: 'toself', fillcolor: 'rgba(67,97,238,0.25)', line: { color: '#4361ee', width: 2 }, showlegend: false, hoverinfo: 'skip' },
            ]}
            layout={{
              paper_bgcolor: DARK, plot_bgcolor: DARK,
              margin: { t: 10, b: 10, l: 10, r: 10 },
              xaxis: { visible: false, scaleanchor: 'y', range: [-2.2, 2.2] },
              yaxis: { visible: false, range: [-2.2, 2.2] },
              showlegend: false,
              height: 320,
            }}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: '100%' }}
          />
        </div>
      )}
      {showHelp && (
        <HelpModal title="Wavepacket Animation" onClose={() => setShowHelp(false)}>
          <RingInfoPanel topic="wavepacket" />
        </HelpModal>
      )}
    </div>
  )
}

// ── Readout panel ─────────────────────────────────────────────────────────

function Readout({ phi, R, n }: { phi: number; R: number; n: number }) {
  const ngs = groundStateN(phi)
  const E = ringEnergy(n, phi, R)
  const Egs = ringEnergy(ngs, phi, R)
  const I = persistentCurrent(n, phi, R)
  const Igs = persistentCurrent(ngs, phi, R)
  const abPhase = 2 * Math.PI * phi

  const row = (label: string, val: string) => (
    <tr key={label}>
      <td style={{ color: '#aaa', paddingRight: '1rem' }}>{label}</td>
      <td style={{ color: TEXT, fontFamily: 'monospace' }}>{val}</td>
    </tr>
  )

  return (
    <table style={{ borderCollapse: 'collapse', fontSize: '0.82rem', width: '100%' }}>
      <tbody>
        {row(`E_${n}(φ)`, E.toFixed(6) + ' Eh')}
        {row(`I_${n}(φ)`, I.toFixed(6) + ' a.u.')}
        {row('n*(φ)', String(ngs))}
        {row('E_gs(φ)', Egs.toFixed(6) + ' Eh')}
        {row('I_gs(φ)', Igs.toFixed(6) + ' a.u.')}
        {row('AB phase 2πφ', abPhase.toFixed(4) + ' rad')}
        {row('T_rev', (4 * Math.PI * R * R).toFixed(4) + ' a.u.')}
      </tbody>
    </table>
  )
}

// ── Styles ─────────────────────────────────────────────────────────────────

const collapseBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', color: TEXT, cursor: 'pointer', fontSize: '1rem', padding: '0 2px',
}

const btnStyle: React.CSSProperties = {
  background: '#2a2a3e', border: '1px solid #444', color: TEXT,
  padding: '0.3rem 0.7rem', borderRadius: 4, cursor: 'pointer', fontSize: '0.82rem',
}

const sliderRowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
}

const labelStyle: React.CSSProperties = {
  color: '#aaa', fontSize: '0.82rem', minWidth: 90,
}

// ── Main explorer ─────────────────────────────────────────────────────────

export function RingExplorer() {
  const [phi, setPhi] = useState(0)
  const [R, setR] = useState(1.0)
  const [n, setN] = useState(0)

  return (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
      {/* Left panel: controls + readout */}
      <div style={{ width: 230, flexShrink: 0 }}>
        <div style={{ background: '#12122a', border: '1px solid #222', borderRadius: 6, padding: '1rem' }}>
          <div style={{ color: TEXT, fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>
            Controls
          </div>

          <div style={sliderRowStyle}>
            <span style={labelStyle}>φ = {phi.toFixed(2)}</span>
            <input type="range" min={-1} max={3} step={0.01} value={phi}
              onChange={e => setPhi(+e.target.value)}
              style={{ flex: 1 }} />
          </div>

          <div style={sliderRowStyle}>
            <span style={labelStyle}>R = {R.toFixed(2)} a₀</span>
            <input type="range" min={0.5} max={3} step={0.05} value={R}
              onChange={e => setR(+e.target.value)}
              style={{ flex: 1 }} />
          </div>

          <div style={{ ...sliderRowStyle, marginBottom: 12 }}>
            <span style={labelStyle}>n = {n}</span>
            <select
              value={n}
              onChange={e => setN(+e.target.value)}
              style={{ background: '#1a1a2e', color: TEXT, border: '1px solid #333', borderRadius: 4, padding: '0.2rem 0.4rem', fontSize: '0.82rem' }}
            >
              {N_BANDS.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          <div style={{ borderTop: '1px solid #222', paddingTop: '0.75rem' }}>
            <div style={{ color: '#aaa', fontSize: '0.78rem', marginBottom: 6, fontWeight: 600 }}>Readout</div>
            <Readout phi={phi} R={R} n={n} />
          </div>
        </div>
      </div>

      {/* Right panel: plots */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <EnergyDiagram phi={phi} R={R} n={n} onPhiChange={setPhi} />
        <WavefunctionPlot n={n} />
        <CurrentPlot phi={phi} R={R} n={n} />
        <WavepacketAnimation phi={phi} R={R} />
      </div>
    </div>
  )
}
