import { useState } from 'react'
import { WavefunctionPlot } from './WavefunctionPlot'
import { ParameterSlider } from './ParameterSlider'
import { HelpButton, HelpModal } from './HelpModal'
import { StationaryInfoPanel } from './StationaryInfoPanel'
import { iswEnergy, iswSigmaX } from '../physics/isw'
import { hoEnergy, hoSigmaX, hoTurningPoint } from '../physics/harmonic'

type Potential = 'isw' | 'ho'

const N_MAX_ISW = 8
const N_MAX_HO  = 7   // 0-indexed, so n = 0..7

export function StationaryExplorer() {
  const [potential, setPotential] = useState<Potential>('isw')
  const [nISW, setNISW] = useState(1)
  const [nHO,  setNHO]  = useState(0)
  const [L,    setL]    = useState(10)
  const [omega, setOmega] = useState(1.0)
  const [showPsi2, setShowPsi2] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  const n = potential === 'isw' ? nISW : nHO

  // Exact observables for selected state
  const energy   = potential === 'isw' ? iswEnergy(nISW, L) : hoEnergy(nHO, omega)
  const sigmaX   = potential === 'isw' ? iswSigmaX(nISW, L) : hoSigmaX(nHO, omega)
  const xTurn    = potential === 'ho' ? hoTurningPoint(nHO, omega) : null

  return (
    <>
      {showHelp && (
        <HelpModal title="Stationary States — Physics Reference" onClose={() => setShowHelp(false)}>
          <StationaryInfoPanel />
        </HelpModal>
      )}

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        {/* Controls */}
        <div style={{ flex: '0 0 240px', minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Stationary States</h3>
            <HelpButton onClick={() => setShowHelp(true)} />
          </div>

          {/* Potential selector */}
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.2rem' }}>
            {(['isw', 'ho'] as Potential[]).map(p => (
              <button
                key={p}
                onClick={() => setPotential(p)}
                style={{
                  ...potBtnStyle,
                  background: potential === p ? '#4361ee' : '#1a1a1a',
                  color:      potential === p ? '#fff'    : '#aaa',
                  borderColor: potential === p ? '#4361ee' : '#333',
                }}
              >
                {p === 'isw' ? 'Infinite Well' : 'Harmonic Osc.'}
              </button>
            ))}
          </div>

          {/* Quantum number */}
          {potential === 'isw' ? (
            <ParameterSlider
              label="Quantum number n"
              value={nISW} min={1} max={N_MAX_ISW} step={1}
              description="n = 1 is the ground state"
              onChange={v => setNISW(Math.round(v))}
            />
          ) : (
            <ParameterSlider
              label="Quantum number n"
              value={nHO} min={0} max={N_MAX_HO} step={1}
              description="n = 0 is the ground state"
              onChange={v => setNHO(Math.round(v))}
            />
          )}

          {/* Potential parameters */}
          {potential === 'isw' && (
            <ParameterSlider
              label="Well width L"
              value={L} min={2} max={20} step={0.5} unit="a.u."
              description="Energies scale as 1/L²"
              onChange={setL}
            />
          )}
          {potential === 'ho' && (
            <ParameterSlider
              label="Frequency ω"
              value={omega} min={0.2} max={3.0} step={0.05} unit="a.u."
              description="Level spacing = ω"
              onChange={setOmega}
            />
          )}

          {/* ψ / |ψ|² toggle */}
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.2rem' }}>
            {[false, true].map(p2 => (
              <button
                key={String(p2)}
                onClick={() => setShowPsi2(p2)}
                style={{
                  ...potBtnStyle,
                  background: showPsi2 === p2 ? '#2a2a2a' : '#1a1a1a',
                  color:      showPsi2 === p2 ? '#fff'    : '#888',
                  borderColor: showPsi2 === p2 ? '#555'   : '#333',
                }}
              >
                {p2 ? '|ψ|²' : 'ψ'}
              </button>
            ))}
          </div>

          {/* Exact observables */}
          <h3 style={{ fontSize: '0.9rem', color: '#aaa', fontWeight: 500, marginBottom: '0.5rem' }}>
            Exact values  (n = {n})
          </h3>
          <table style={{ fontSize: '0.82rem', fontVariantNumeric: 'tabular-nums', width: '100%' }}>
            <tbody>
              <tr>
                <td style={tdL}>E_n</td>
                <td style={tdR}>{energy.toFixed(4)} a.u.</td>
              </tr>
              <tr>
                <td style={tdL}>σ_x</td>
                <td style={tdR}>{sigmaX.toFixed(4)} a.u.</td>
              </tr>
              {xTurn !== null && (
                <tr>
                  <td style={tdL}>x_classical</td>
                  <td style={tdR}>±{xTurn.toFixed(4)} a.u.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Plot */}
        <div style={{ flex: '1 1 400px', minWidth: 320 }}>
          <WavefunctionPlot
            potential={potential}
            n={n}
            L={L}
            omega={omega}
            showPsi2={showPsi2}
          />
        </div>
      </div>
    </>
  )
}

const potBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: '0.3rem 0.5rem',
  border: '1px solid #333',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: '0.78rem',
}

const tdL: React.CSSProperties = { color: '#aaa', paddingBottom: '0.25rem' }
const tdR: React.CSSProperties = { color: '#4361ee', textAlign: 'right', paddingBottom: '0.25rem' }
