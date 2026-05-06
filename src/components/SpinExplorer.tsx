import { useState, useEffect, useRef, useCallback } from 'react'
import { BlochSphere } from './BlochSphere'
import { ParameterSlider } from './ParameterSlider'
import { HelpButton, HelpModal } from './HelpModal'
import { SpinInfoPanel } from './SpinInfoPanel'
import { SternGerlachPanel } from './SternGerlachPanel'
import { BellDemo } from './BellDemo'
import { computeTrajectory, blochVector } from '../utils/spinMath'
import type { Vec3 } from '../utils/spinMath'

const N_FRAMES = 300
const T_MAX    = 4 * Math.PI

const PI = Math.PI

type SpinTab = 'precession' | 'measurement' | 'bell'

const PRESETS: [string, number, number][] = [
  ['|↑⟩',  0,      0       ],
  ['|↓⟩',  PI,     0       ],
  ['|+x⟩', PI / 2, 0       ],
  ['|−x⟩', PI / 2, PI      ],
  ['|+y⟩', PI / 2, PI / 2  ],
  ['|−y⟩', PI / 2, 3*PI/2  ],
]

function formatBeta(re: number, im: number): string {
  const reS = re.toFixed(3)
  const imS = Math.abs(im).toFixed(3)
  if (Math.abs(im) < 5e-4) return reS
  if (Math.abs(re) < 5e-4) return `${im < 0 ? '−' : ''}${imS}i`
  return `${reS} ${im < 0 ? '−' : '+'} ${imS}i`
}

export function SpinExplorer() {
  const [activeTab,  setActiveTab]  = useState<SpinTab>('precession')
  const [theta,      setTheta]      = useState(Math.PI / 3)
  const [phi,        setPhi]        = useState(0)
  const [omega,      setOmega]      = useState(1.0)
  const [bTheta,     setBTheta]     = useState(0)
  const [bPhi,       setBPhi]       = useState(0)
  const [showHelp,   setShowHelp]   = useState(false)
  const [playing,    setPlaying]    = useState(false)
  const [frame,      setFrame]      = useState(0)
  const [trajectory, setTrajectory] = useState<Vec3[]>([])

  const rafRef   = useRef<number>(0)
  const frameRef = useRef(0)

  const bhat: Vec3 = blochVector(bTheta, bPhi)

  function applyPreset(t: number, p: number) {
    setTheta(t); setPhi(p)
    setPlaying(false); setFrame(0); frameRef.current = 0
  }

  function handleTabChange(tab: SpinTab) {
    setActiveTab(tab)
    if (tab === 'measurement' || tab === 'bell') {
      setTrajectory([])
      setPlaying(false)
    }
  }

  // Recompute trajectory when initial state or B-field changes
  useEffect(() => {
    const traj = computeTrajectory(theta, phi, bhat, omega, T_MAX, N_FRAMES)
    setTrajectory(traj)
    setFrame(0)
    frameRef.current = 0
  }, [theta, phi, omega, bTheta, bPhi])

  const tick = useCallback(() => {
    frameRef.current = (frameRef.current + 1) % N_FRAMES
    setFrame(frameRef.current)
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    if (playing) {
      rafRef.current = requestAnimationFrame(tick)
    } else {
      cancelAnimationFrame(rafRef.current)
    }
    return () => cancelAnimationFrame(rafRef.current)
  }, [playing, tick])

  const currentVec   = trajectory[frame] ?? blochVector(theta, phi)
  const currentTheta = Math.acos(Math.max(-1, Math.min(1, currentVec[2])))
  const currentPhi   = Math.atan2(currentVec[1], currentVec[0])

  const [sx, sy, sz] = currentVec

  // Ket coefficients from initial (θ, φ)
  const alphaRe = Math.cos(theta / 2)
  const betaRe  = Math.sin(theta / 2) * Math.cos(phi)
  const betaIm  = Math.sin(theta / 2) * Math.sin(phi)

  // Robertson: Δσ_x·Δσ_y ≥ |⟨σ_z⟩| — from animated vector
  const dSigmaX   = Math.sqrt(Math.max(0, 1 - sx * sx))
  const dSigmaY   = Math.sqrt(Math.max(0, 1 - sy * sy))
  const robertLHS = dSigmaX * dSigmaY
  const robertRHS = Math.abs(sz)
  const robertOK  = robertLHS >= robertRHS - 1e-9

  return (
    <>
      {showHelp && (
        <HelpModal title="Spin ½ — Physics Reference" onClose={() => setShowHelp(false)}>
          <SpinInfoPanel />
        </HelpModal>
      )}
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>

        {/* ── Bloch sphere + playback (always visible) ── */}
        <div style={{ flex: '0 0 420px' }}>
          <BlochSphere
            theta={currentTheta}
            phi={currentPhi}
            trajectory={trajectory.slice(0, frame + 1)}
            playing={playing}
          />
          {activeTab === 'precession' && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button onClick={() => setPlaying(p => !p)} style={btnStyle}>
                {playing ? 'Pause' : 'Play'}
              </button>
              <button
                onClick={() => { setPlaying(false); setFrame(0); frameRef.current = 0 }}
                style={btnStyle}
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* ── Controls column ── */}
        <div style={{ flex: '1 1 260px', minWidth: 220 }}>

          {/* Header + help */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Spin ½ / Bloch Sphere</h3>
            <HelpButton onClick={() => setShowHelp(true)} />
          </div>

          {/* Tab strip */}
          <div style={{ display: 'flex', gap: 0, marginBottom: '1rem', borderBottom: '1px solid #222' }}>
            {(['precession', 'measurement', 'bell'] as SpinTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                style={{
                  ...tabBtnStyle,
                  color:        activeTab === tab ? '#e0e0e0' : '#666',
                  borderBottom: activeTab === tab ? '2px solid #4361ee' : '2px solid transparent',
                  marginBottom: -1,
                }}
              >
                {tab === 'precession' ? 'Precession' : tab === 'measurement' ? 'Measurement' : 'Bell'}
              </button>
            ))}
          </div>

          {/* ── Precession tab ── */}
          {activeTab === 'precession' && (
            <>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: '#aaa', fontWeight: 500 }}>
                Initial state
              </h4>
              <ParameterSlider
                label="θ (polar angle)"
                value={theta} min={0} max={PI} step={0.01} unit="rad"
                description="Angle from |↑⟩ toward |↓⟩"
                onChange={setTheta}
              />
              <ParameterSlider
                label="φ (azimuthal angle)"
                value={phi} min={0} max={2 * PI} step={0.01} unit="rad"
                description="Phase around z-axis"
                onChange={setPhi}
              />

              {/* Presets */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.75rem' }}>
                {PRESETS.map(([label, t, p]) => (
                  <button key={label} onClick={() => applyPreset(t, p)} style={presetBtnStyle}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Ket display */}
              <div style={ketStyle}>
                <span style={{ color: '#aaa' }}>|ψ⟩ =</span>
                {' '}{alphaRe.toFixed(3)} |↑⟩ + ({formatBeta(betaRe, betaIm)}) |↓⟩
              </div>

              {/* Robertson */}
              <div style={robertsonStyle}>
                <span style={{ color: '#aaa', marginRight: 6 }}>Robertson:</span>
                Δσ<sub>x</sub>·Δσ<sub>y</sub> = <strong>{robertLHS.toFixed(3)}</strong>
                {' ≥ '}
                |⟨σ<sub>z</sub>⟩| = <strong>{robertRHS.toFixed(3)}</strong>
                {' '}
                <span style={{ color: robertOK ? '#06d6a0' : '#ef233c', fontWeight: 700 }}>
                  {robertOK ? '✓' : '✗'}
                </span>
              </div>

              {/* B-field */}
              <h4 style={{ margin: '0.75rem 0 0.5rem', fontSize: '0.9rem', color: '#aaa', fontWeight: 500 }}>
                Magnetic field B̂
              </h4>
              <ParameterSlider
                label="ω₀ (Larmor frequency)"
                value={omega} min={0.1} max={5} step={0.05} unit="a.u."
                description="Precession rate = γB"
                onChange={setOmega}
              />
              <ParameterSlider
                label="B polar angle θ_B"
                value={bTheta} min={0} max={PI} step={0.01} unit="rad"
                description="0 = B along z-axis"
                onChange={setBTheta}
              />
              <ParameterSlider
                label="B azimuthal angle φ_B"
                value={bPhi} min={0} max={2 * PI} step={0.01} unit="rad"
                onChange={setBPhi}
              />

              {/* Expectation values */}
              <h4 style={{ margin: '0.75rem 0 0.4rem', fontSize: '0.9rem', color: '#aaa', fontWeight: 500 }}>
                Expectation values
              </h4>
              <table style={{ fontSize: '0.85rem', fontVariantNumeric: 'tabular-nums', width: '100%' }}>
                <tbody>
                  <tr>
                    <td>⟨σ<sub>x</sub>⟩</td>
                    <td style={{ color: '#e74c3c', textAlign: 'right' }}>{sx.toFixed(3)}</td>
                  </tr>
                  <tr>
                    <td>⟨σ<sub>y</sub>⟩</td>
                    <td style={{ color: '#2ecc71', textAlign: 'right' }}>{sy.toFixed(3)}</td>
                  </tr>
                  <tr>
                    <td>⟨σ<sub>z</sub>⟩</td>
                    <td style={{ color: '#3498db', textAlign: 'right' }}>{sz.toFixed(3)}</td>
                  </tr>
                </tbody>
              </table>
            </>
          )}

          {/* ── Measurement tab ── */}
          {activeTab === 'measurement' && (
            <SternGerlachPanel
              theta={currentTheta}
              phi={currentPhi}
              onCollapse={(t, p) => { setTheta(t); setPhi(p) }}
            />
          )}

          {/* ── Bell tab ── */}
          {activeTab === 'bell' && <BellDemo />}
        </div>
      </div>
    </>
  )
}

const btnStyle: React.CSSProperties = {
  padding: '0.4rem 1rem', background: '#4361ee', color: '#fff',
  border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.9rem',
}

const tabBtnStyle: React.CSSProperties = {
  padding: '0.35rem 0.9rem', background: 'none', border: 'none',
  cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
  transition: 'color 0.15s',
}

const presetBtnStyle: React.CSSProperties = {
  padding: '0.2rem 0.55rem', background: '#1a1a2e', color: '#ccc',
  border: '1px solid #333', borderRadius: 4, cursor: 'pointer',
  fontSize: '0.8rem', fontFamily: 'monospace',
}

const ketStyle: React.CSSProperties = {
  background: '#161616', borderRadius: 5, padding: '5px 10px',
  fontSize: '0.85rem', fontFamily: 'monospace', color: '#e0e0e0',
  marginBottom: '0.5rem', letterSpacing: '0.01em',
}

const robertsonStyle: React.CSSProperties = {
  background: '#161616', borderRadius: 5, padding: '5px 10px',
  fontSize: '0.82rem', color: '#e0e0e0', marginBottom: '0.25rem',
}
