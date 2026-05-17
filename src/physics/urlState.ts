// ── Pure parsing utilities ────────────────────────────────────────────────────

export function parseHash(hash: string): { moduleId: string; params: URLSearchParams } {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash
  const qIdx = raw.indexOf('?')
  if (qIdx === -1) {
    return { moduleId: raw, params: new URLSearchParams() }
  }
  return {
    moduleId: raw.slice(0, qIdx),
    params: new URLSearchParams(raw.slice(qIdx + 1)),
  }
}

export function buildHash(moduleId: string, params: URLSearchParams): string {
  const qs = params.toString()
  return qs ? `#${moduleId}?${qs}` : `#${moduleId}`
}

export function getNumericParam(
  params: URLSearchParams,
  key: string,
  defaultVal: number,
  min = -Infinity,
  max = Infinity,
): number {
  const raw = params.get(key)
  if (raw === null) return defaultVal
  const n = Number(raw)
  if (!isFinite(n)) return defaultVal
  return Math.min(max, Math.max(min, n))
}

export function getIntParam(
  params: URLSearchParams,
  key: string,
  defaultVal: number,
  min = -Infinity,
  max = Infinity,
): number {
  return Math.round(getNumericParam(params, key, defaultVal, min, max))
}

export function getStringParam(
  params: URLSearchParams,
  key: string,
  defaultVal: string,
  allowed?: readonly string[],
): string {
  const raw = params.get(key)
  if (raw === null) return defaultVal
  if (allowed && !allowed.includes(raw)) return defaultVal
  return raw
}

// ── DOM helpers ───────────────────────────────────────────────────────────────
// These touch window.location / window.history; not unit-tested.

export function setUrlParam(key: string, value: string | number): void {
  const { moduleId, params } = parseHash(window.location.hash)
  if (String(value) === params.get(key)) return
  params.set(key, String(value))
  window.history.replaceState(null, '', buildHash(moduleId, params))
}

export function setUrlParams(pairs: Record<string, string | number>): void {
  const { moduleId, params } = parseHash(window.location.hash)
  let changed = false
  for (const [k, v] of Object.entries(pairs)) {
    if (String(v) !== params.get(k)) { params.set(k, String(v)); changed = true }
  }
  if (changed) window.history.replaceState(null, '', buildHash(moduleId, params))
}

export function clearUrlParams(): void {
  const { moduleId } = parseHash(window.location.hash)
  window.history.replaceState(null, '', `#${moduleId}`)
}
