# URL State Encoding — Spec

## Goal

Encode the active module's key parameters in the URL hash so any configuration
can be bookmarked or shared. The URL updates automatically as the user adjusts
sliders; no extra "copy link" step is needed.

## URL format

```
#<moduleId>?<key1>=<val1>&<key2>=<val2>
```

Examples:
```
#hydrogen?n=3&l=2&m=1&Z=2
#stationary?pot=ho&n=3&omega=1.5
#free-particle?x0=0&k0=2&s0=0.5
#ring?phi=0.5&R=2&n=1
```

The `?` inside the hash is plain text — `URLSearchParams` parses it after
stripping the module prefix.

## Layers

### Layer 1 — Pure parsing utilities (`src/physics/urlState.ts`)

All functions are pure (no DOM access) and unit-tested.

| Function | Signature | Description |
|---|---|---|
| `parseHash` | `(hash: string) → { moduleId, params }` | Split `#mod?k=v` into module ID and URLSearchParams |
| `buildHash` | `(moduleId, params) → string` | Serialize back to `#mod?k=v`; omits `?` when params are empty |
| `getNumericParam` | `(params, key, default, min?, max?) → number` | Extract float; clamp to `[min, max]`; return default on missing/NaN |
| `getIntParam` | `(params, key, default, min?, max?) → number` | Like `getNumericParam` but rounds to integer |
| `getStringParam` | `(params, key, default, allowed?) → string` | Extract string; enforce allowlist; return default on missing/unlisted |

### Layer 2 — DOM helpers (`src/physics/urlState.ts`)

These touch `window.location` / `window.history` and are not unit-tested.

| Function | Description |
|---|---|
| `setUrlParam(key, value)` | Read current hash, update one key, `replaceState` — never `pushState` |
| `setUrlParams(pairs)` | Batch-update multiple keys in one `replaceState` call |
| `clearUrlParams()` | Strip all params, keep module ID (`replaceState`) |

## Per-module parameters

| Module | Key | Type | Range / Values | Default |
|---|---|---|---|---|
| `stationary` | `pot` | string | `isw`, `ho` | `isw` |
| `stationary` | `n` | int | 1–8 (ISW), 0–7 (HO) | `1` |
| `stationary` | `L` | float | 1–20 | `10` |
| `stationary` | `omega` | float | 0.1–5 | `1.0` |
| `time-evolution` | `mode` | string | `isw`, `ho`, `ho-sq` | `isw` |
| `free-particle` | `x0` | float | −20 – 20 | `0` |
| `free-particle` | `k0` | float | −5 – 5 | `1.0` |
| `free-particle` | `s0` | float | 0.1–5 | `1.0` |
| `tunnelling` | `tab` | string | `barrier`, `step`, `delta`, `poschl-teller`, `kronig-penney`, `morse` | `barrier` |
| `hydrogen` | `n` | int | 1–5 | `1` |
| `hydrogen` | `l` | int | 0–4 | `0` |
| `hydrogen` | `m` | int | −4 – 4 | `0` |
| `hydrogen` | `Z` | int | 1–10 | `1` |
| `ring` | `phi` | float | −1 – 3 | `0` |
| `ring` | `R` | float | 0.5–5 | `1.0` |
| `ring` | `n` | int | −4 – 4 | `0` |
| `wigner` | `mode` | string | `fock`, `coherent`, `squeezed`, `cat-even`, `cat-odd`, `fock-super` | `fock` |
| `wigner` | `n` | int | 0–6 | `1` |
| `wigner` | `alpha` | float | 0–3 | `2.0` |
| `wigner` | `r` | float | 0–2 | `0.8` |
| `two-particle` | `m` | int | 1–5 | `1` |
| `two-particle` | `n` | int | 1–5 | `2` |
| `two-particle` | `stat` | string | `dist`, `boson`, `fermion` | `fermion` |
| `spin` | `tab` | string | `precession`, `measurement`, `bell` | `precession` |
| `spin` | `theta` | float | 0 – π | `1.047` (π/3) |
| `spin` | `phi` | float | 0 – 2π | `0` |
| `spin` | `omega` | float | 0.1–5 | `1.0` |

## Behavior rules

1. **Defaults on missing/invalid** — any missing key or value that fails
   validation (NaN, out of range, unknown enum value) silently uses the
   module's default.
2. **replaceState, not pushState** — param changes are written with
   `replaceState` so they don't pollute the browser history stack. Module
   switches still use `pushState` (back-button navigates between modules).
3. **Module switch clears params** — `App.tsx` sets the hash to `#<newModule>`
   (no params) when the active module changes, so old params never bleed into
   a new module.
4. **Backward compat** — bare `#stationary` (no `?`) continues to work; all
   params default.
5. **Physics validity on Hydrogen** — if URL gives `l >= n`, `l` is clamped to
   `n-1`; if `|m| > l`, `m` is clamped to `l`. Enforcement is in the
   component, not in `urlState.ts`.
