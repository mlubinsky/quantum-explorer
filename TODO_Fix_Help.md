# TODO: Missing help ("?") icons — RESOLVED 2026-08-10

Audit performed 2026-08-10 across every `*Explorer.tsx`, every `<details>`/collapsible
sub-section, and every `*InfoPanel.tsx`. The app follows two consistent conventions —
either one "?" next to the module's page title, or one "?" per visualization section —
and almost every module follows one of them thoroughly. Four places broke the pattern
(three missing icons, one placement inconsistency). All four have been implemented;
see the ✅ notes under each item and the `[Unreleased]` entry in `CHANGELOG.md`.

While implementing item 4, `FreeParticleExplorer.tsx` was also found using the same
`justifyContent: 'space-between'` corner-placement pattern (4 section headers: Main,
Momentum, Expectation values, Norm) — not in the original audit, but the same bug
class, so it was fixed too (see item 4 below).

## 1. ✅ `StationaryExplorer.tsx:87` — main "Stationary States" title has no "?"

Every sibling module's page title has a HelpButton right next to it:
- Spin `SpinExplorer.tsx:167-168`
- Time Evolution `TimeEvolutionExplorer.tsx:327-328`
- Two-Particle `TwoParticleExplorer.tsx:212-213`
- Wigner `WignerExplorer.tsx:297-298`
- legacy Tunnelling `TunnellingExplorer.tsx:252-253`

Stationary's `<h3>Stationary States</h3>` (line 87) is the only one that doesn't.

Evidence this is an accidental omission, not a deliberate design choice: a `showHelp`
state (line 40) and its `<HelpModal>` (lines 72-76, title "Stationary States — Physics
Reference", rendering `<StationaryInfoPanel />`) are fully wired and rendered — but no
button anywhere ever calls `setShowHelp(true)`. It's dead code, orphaned by a missing
button.

**Fix:** add `<HelpButton onClick={() => setShowHelp(true)} />` next to the h3 at line 87.

**Done:** button added, wired to the existing orphaned `showHelp` state/modal.

## 2. ✅ `StationaryExplorer.tsx:217-226` — "Matrix representation (Heisenberg picture)" section has no "?"

The two sibling `<details>` sections right above it — "Momentum distribution" and
"Energy levels diagram" — each embed their own HelpButton internally:
- `MomentumPlot.tsx:51`
- `EnergyLevelsDiagram.tsx:51`

`MatrixPanel.tsx` (renders the H/X/P matrix heatmaps and Heisenberg-picture animation)
has zero `HelpButton`/`HelpModal` — confirmed via grep, no match in the file. This is
arguably the most conceptually advanced visualization in the whole app (operator
matrices, time evolution in the Heisenberg picture), and it's the one part of this
module with no explanation reachable at all.

**Fix:** add a `HelpButton` + `HelpModal` to `MatrixPanel.tsx` (matching the pattern in
`MomentumPlot.tsx`/`EnergyLevelsDiagram.tsx`), with new content explaining the matrix
representation and Heisenberg picture. Consider whether this belongs in a new
`MatrixInfoPanel.tsx` or as a section appended to `StationaryInfoPanel.tsx`.

**Done:** added new `MatrixInfoPanel.tsx` (matrix representation, parity selection
rules, Heisenberg picture, "what to explore") and wired a local `showHelp` state +
header row + `HelpButton`/`HelpModal` into `MatrixPanel.tsx`, matching the
`MomentumPlot.tsx` pattern.

## 3. ✅ `GatesPanel.tsx` (Spin ½ → "Gates" tab) — no "?" anywhere

The file has no `HelpButton`/`HelpModal` import at all. The module's shared
`SpinInfoPanel.tsx` (opened via the main title's "?") covers State space, Pauli
matrices, Robertson uncertainty, Larmor precession, and Stern-Gerlach measurement — but
has no section on quantum gates (verified: the only "gate" substring match in that file
is inside the word "negate", unrelated). So the entire Gates tab (added later, per git
history: "single-qubit gates on Bloch sphere — 4th tab") has no explanatory content
reachable from the UI at all, not even indirectly.

**Fix:** add a `HelpButton` to `GatesPanel.tsx` plus either a new topic in
`SpinInfoPanel.tsx` or a dedicated modal covering single-qubit gates (X/Y/Z/H/S/T,
matrix forms, action on the Bloch sphere).

**Done:** added new `GatesInfoPanel.tsx` (gates as 2×2 unitaries, Pauli gates,
Hadamard, phase gates S/T, parametric rotations Rx/Ry/Rz, "what to explore") and wired
a local `showHelp` state + header row + `HelpButton`/`HelpModal` into `GatesPanel.tsx`.

## 4. ✅ Inconsistent "?" placement — inline after title vs. pushed to top-right corner

**User preference: the "?" should always sit immediately after the title text (Pattern
A below), never pushed to the container's right edge.**

There's no shared "section header" component — each `*Explorer.tsx` defines its own
local `sectionHeaderStyle` constant, and they don't all use the same layout rule, so
placement varies file to file with no content-based reason:

- **Pattern A — button right after the title (desired):**
  `StationaryExplorer`, `SpinExplorer`, `TwoParticleExplorer`, `WignerExplorer`,
  `RingExplorer`, `BellDemo`.
  ```ts
  sectionHeaderStyle = { display: 'flex', alignItems: 'center', gap: '0.5rem' }
  ```
  No `justifyContent`, and the title `<span>` has no `flex: 1`, so the flex row only
  stretches as wide as its content and the button sits snug against the title text.

- **Pattern B — button pushed to the container's right edge via `justify-content`:**
  `TimeEvolutionExplorer` (`sectionHeaderStyle` at line 716-718), `FourierExplorer`'s
  "Controls" header.
  ```ts
  sectionHeaderStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
  ```

- **Pattern B′ — same "corner" look, different mechanism (`flex: 1` on the title):**
  `HydrogenExplorer` (`sectionStyle`/`sectionHeaderStyle`/`sectionTitleStyle` at
  line 1691-1699), `BarrierExplorer` and its Scattering siblings
  (`Step`/`Delta`/`PoschlTeller`/`KronigPenney`/`Morse`Explorer, all copy roughly the
  same `sectionStyle`/`sectionHeaderStyle`/`sectionTitleStyle` block, e.g.
  `BarrierExplorer.tsx:271-282`).
  ```ts
  sectionHeaderStyle = { display: 'flex', alignItems: 'center', gap: '0.5rem' }
  sectionTitleStyle  = { fontWeight: 600, fontSize: '0.9rem', flex: 1 }
  ```
  No `justify-content` here, but the title's `flex: 1` expands it to fill the row,
  shoving the button (the next flex sibling) out to the far edge anyway.

**Fix:** standardize on Pattern A everywhere.
- `TimeEvolutionExplorer.tsx:716-718` — drop `justifyContent: 'space-between'` from
  `sectionHeaderStyle`.
- `FourierExplorer.tsx` — drop `justifyContent: 'space-between'` from the "Controls"
  header's inline style.
- `HydrogenExplorer.tsx:1694-1699`, `BarrierExplorer.tsx:271-282`, and the same block in
  `StepExplorer.tsx`/`DeltaExplorer.tsx`/`PoschlTellerExplorer.tsx`/
  `KronigPenneyExplorer.tsx`/`MorseExplorer.tsx` — drop `flex: 1` from
  `sectionTitleStyle` (or wrap the title in a non-growing span) so the button sits next
  to the text instead of at the row's far edge.
- Longer-term: consider extracting a shared `SectionHeader` component
  (title + collapse toggle + HelpButton) so this can't drift again across ~10 files
  that currently each hand-roll their own header-row CSS.

**Done:** `justifyContent: 'space-between'` removed from `TimeEvolutionExplorer.tsx`,
`FourierExplorer.tsx`, and (found during implementation, not in the original audit)
`FreeParticleExplorer.tsx`'s four section headers (Main, Momentum, Expectation values,
Norm). `flex: 1` removed from `sectionTitleStyle`/`titleStyle`/`collapseStyle` in
`HydrogenExplorer.tsx` and all 6 Scattering sub-tabs (`Barrier`/`Step`/`Delta`/
`PoschlTeller`/`KronigPenney`/`Morse`Explorer), with a `gap: '0.5rem'` added where
needed to keep the title and button from touching. The longer-term `SectionHeader`
extraction was not done — left as a follow-up if this drifts again.

Verified with Playwright screenshots (dev server, `#stationary`, `#spin` Gates tab,
`#free-particle`): "?" sits directly after each title in every case, all three new
help modals open with correct content and no console errors.

## Checked and NOT flagged (false positives ruled out)

- Fourier Explorer "Uncertainty" readout — plain numeric readout, consistent with the
  app-wide convention that data readouts (e.g. Stationary's "Exact values" table,
  Ring's "Readout" panel) don't get individual buttons.
- Two-Particle marginal/diagonal density labels — already covered by the main "?" and
  by inline explanatory text (Pauli exclusion paragraph) on the page itself.
- Wigner/Time Evolution inline plot-title labels — chart titles, not conceptual
  sections; covered by each module's existing HelpButtons.
- Hydrogen Atom — 10 topics covered (radialDensity, radialWavefunction, orbital2D,
  angularShape, isosurface, grotrian, emissionSpectra, zeeman, anomalousZeeman, stark).
  No gaps found.
- Ring & A-B — 4 independently-scoped HelpButtons (energy, wavefunction, current,
  wavepacket), each with its own local `showHelp` state and correct `RingInfoPanel`
  topic. No gaps found.
- Free Particle, Scattering's 6 sub-tabs (Barrier/Step/Delta/Pöschl-Teller/
  Kronig-Penney/Morse) — each has 3-5 section-scoped HelpButtons; thorough, no gaps.
- `ScatteringExplorer.tsx` itself has 0 HelpButton usages, but it's just the tab
  container — each sub-tab component handles its own help. Not a gap.
