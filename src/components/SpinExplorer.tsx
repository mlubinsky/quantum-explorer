import { useState, useEffect, useRef, useCallback } from 'react'
import { BlochSphere } from './BlochSphere'
import { ParameterSlider } from './ParameterSlider'
import { HelpButton, HelpModal } from './HelpModal'
import { SpinInfoPanel } from './SpinInfoPanel'
import { computeTrajectory, blochVector } from '../utils/spinMath'
import type { Vec3 } from '../utils/spinMath'

const N_FRAMES = 300
const T_MAX    = 4 * Math.PI   // two full precession cycles

export function SpinExplorer() {
  const [theta,  setTheta]  = useState(Math.PI / 3)
  const [phi,    setPhi]    = useState(0)
  const [omega,  setOmega]  = useState(1.0)
  const [bTheta, setBTheta] = useState(0)         // B-field polar angle (0 = z-axis)
  const [bPhi,   setBPhi]   = useState(0)         // B-field azimuthal angle
  const [showHelp, setShowHelp] = useState(false)

  const [playing,   setPlaying]   = useState(false)
  const [frame,     setFrame]     = useState(0)
  const [trajectory, setTrajectory] = useState<Vec3[]>([])

  const rafRef = useRef<number>(0)
  const frameRef = useRef(0)

  const bhat: Vec3 = blochVector(bTheta, bPhi)

  // Recompute trajectory whenever initial state or B-field changes
  useEffect(() => {
    const traj = computeTrajectory(theta, phi, bhat, omega, T_MAX, N_FRAMES)
    setTrajectory(traj)
    setFrame(0)
    frameRef.current = 0
  }, [theta, phi, omega, bTheta, bPhi])   // bhat is derived, no need to list

  // Animation loop
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

  const currentVec = trajectory[frame] ?? blochVector(theta, phi)
  const currentTheta = Math.acos(Math.max(-1, Math.min(1, currentVec[2])))
  const currentPhi   = Math.atan2(currentVec[1], currentVec[0])

  // Expectation values from current Bloch vector
  const [sx, sy, sz] = currentVec
  const sigmaX = sx.toFixed(3)
  const sigmaY = sy.toFixed(3)
  const sigmaZ = sz.toFixed(3)

  return (
    <>
      {showHelp && (
        <HelpModal title="Spin ½ — Physics Reference" onClose={() => setShowHelp(false)}>
          <SpinInfoPanel />
        </HelpModal>
      )}
    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
      <div style={{ flex: '0 0 420px' }}>
        <BlochSphere
          theta={currentTheta}
          phi={currentPhi}
          trajectory={trajectory.slice(0, frame + 1)}
          playing={playing}
        />
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <button onClick={() => setPlaying(p => !p)} style={btnStyle}>
            {playing ? 'Pause' : 'Play'}
          </button>
          <button onClick={() => { setPlaying(false); setFrame(0); frameRef.current = 0 }} style={btnStyle}>
            Reset
          </button>
        </div>
      </div>

      <div style={{ flex: '1 1 260px', minWidth: 220 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem' }}>Spin ½ / Bloch Sphere</h3>
          <HelpButton onClick={() => setShowHelp(true)} />
        </div>
        <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '0.9rem', color: '#aaa', fontWeight: 500 }}>Initial state</h3>
        <ParameterSlider
          label="θ (polar angle)"
          value={theta} min={0} max={Math.PI} step={0.01} unit="rad"
          description="Angle from |↑⟩ toward |↓⟩"
          onChange={setTheta}
        />
        <ParameterSlider
          label="φ (azimuthal angle)"
          value={phi} min={0} max={2 * Math.PI} step={0.01} unit="rad"
          description="Phase around z-axis"
          onChange={setPhi}
        />

        <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Magnetic field B</h3>
        <ParameterSlider
          label="ω₀ (Larmor frequency)"
          value={omega} min={0.1} max={5} step={0.05} unit="a.u."
          description="Precession rate = γB"
          onChange={setOmega}
        />
        <ParameterSlider
          label="B polar angle θ_B"
          value={bTheta} min={0} max={Math.PI} step={0.01} unit="rad"
          description="0 = B along z-axis"
          onChange={setBTheta}
        />
        <ParameterSlider
          label="B azimuthal angle φ_B"
          value={bPhi} min={0} max={2 * Math.PI} step={0.01} unit="rad"
          onChange={setBPhi}
        />

        <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>Expectation values</h3>
        <table style={{ fontSize: '0.85rem', fontVariantNumeric: 'tabular-nums', width: '100%' }}>
          <tbody>
            <tr><td>⟨σ_x⟩</td><td style={{ color: '#e74c3c', textAlign: 'right' }}>{sigmaX}</td></tr>
            <tr><td>⟨σ_y⟩</td><td style={{ color: '#2ecc71', textAlign: 'right' }}>{sigmaY}</td></tr>
            <tr><td>⟨σ_z⟩</td><td style={{ color: '#3498db', textAlign: 'right' }}>{sigmaZ}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
    </>
  )
}

const btnStyle: React.CSSProperties = {
  padding: '0.4rem 1rem',
  background: '#4361ee',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: '0.9rem',
}
