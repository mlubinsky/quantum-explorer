import { useState, useEffect } from 'react'
import { parseHash, getStringParam, setUrlParam } from '../physics/urlState'
import { BarrierExplorer } from './BarrierExplorer'
import { StepExplorer } from './StepExplorer'
import { DeltaExplorer } from './DeltaExplorer'
import { PoschlTellerExplorer } from './PoschlTellerExplorer'
import { KronigPenneyExplorer } from './KronigPenneyExplorer'
import { MorseExplorer } from './MorseExplorer'

type ScatteringTab = 'barrier' | 'step' | 'delta' | 'poschl-teller' | 'kronig-penney' | 'morse'

const TAB_LABELS: Record<ScatteringTab, string> = {
  barrier:         'Barrier',
  step:            'Step',
  delta:           'Delta',
  'poschl-teller': 'Pöschl-Teller',
  'kronig-penney': 'Kronig-Penney',
  'morse':         'Morse',
}

const SCATTERING_TABS = ['barrier', 'step', 'delta', 'poschl-teller', 'kronig-penney', 'morse'] as const

export function ScatteringExplorer() {
  const [tab, setTab] = useState<ScatteringTab>(() =>
    getStringParam(parseHash(window.location.hash).params, 'tab', 'barrier', SCATTERING_TABS) as ScatteringTab
  )

  useEffect(() => { setUrlParam('tab', tab) }, [tab])

  return (
    <div>
      {/* Sub-tab strip */}
      <div style={{ display: 'flex', gap: 0, marginBottom: '1.25rem', borderBottom: '1px solid #222' }}>
        {(['barrier', 'step', 'delta', 'poschl-teller', 'kronig-penney', 'morse'] as ScatteringTab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '0.35rem 0.9rem',
              background: 'none', border: 'none',
              cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
              color: tab === t ? '#e0e0e0' : '#666',
              borderBottom: tab === t ? '2px solid #4361ee' : '2px solid transparent',
              marginBottom: -1,
              transition: 'color 0.15s',
            }}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {tab === 'barrier'        && <BarrierExplorer />}
      {tab === 'step'           && <StepExplorer />}
      {tab === 'delta'          && <DeltaExplorer />}
      {tab === 'poschl-teller'  && <PoschlTellerExplorer />}
      {tab === 'kronig-penney'  && <KronigPenneyExplorer />}
      {tab === 'morse'          && <MorseExplorer />}
    </div>
  )
}
