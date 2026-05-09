import { describe, it, expect } from 'vitest';
import {
  fpSigma,
  fpSpreadingTime,
  fpProb,
  fpExpectX,
  fpExpectP,
  fpDeltaX,
  fpDeltaP,
  fpMomentumDist,
  fpRePsi,
  fpImPsi,
} from '../physics/freeParticle';

describe('fpSigma / fpSpreadingTime', () => {
  it('fpSigma(0, σ₀) = σ₀', () => {
    expect(fpSigma(0, 1.0)).toBeCloseTo(1.0, 10);
    expect(fpSigma(0, 0.5)).toBeCloseTo(0.5, 10);
    expect(fpSigma(0, 2.0)).toBeCloseTo(2.0, 10);
  });

  it('fpSigma(t₀, σ₀) = σ₀√2 — width doubles at spreading time', () => {
    const sigma0 = 1.0;
    const t0 = fpSpreadingTime(sigma0);
    expect(fpSigma(t0, sigma0)).toBeCloseTo(sigma0 * Math.sqrt(2), 10);
  });

  it('fpSpreadingTime(σ₀) = 2σ₀²', () => {
    expect(fpSpreadingTime(1.0)).toBeCloseTo(2.0, 10);
    expect(fpSpreadingTime(0.5)).toBeCloseTo(0.5, 10);
    expect(fpSpreadingTime(2.0)).toBeCloseTo(8.0, 10);
  });
});

describe('fpProb', () => {
  const integrate = (
    f: (x: number) => number,
    xMin: number,
    xMax: number,
    n = 4000
  ): number => {
    const dx = (xMax - xMin) / n;
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += f(xMin + (i + 0.5) * dx);
    }
    return sum * dx;
  };

  it('integrates to 1 at t=0', () => {
    const x0 = 0, k0 = 1.0, sigma0 = 1.0;
    const norm = integrate(x => fpProb(x, 0, x0, k0, sigma0), -20, 20);
    expect(norm).toBeCloseTo(1.0, 3);
  });

  it('integrates to 1 at t=t₀', () => {
    const x0 = 0, k0 = 1.0, sigma0 = 1.0;
    const t0 = fpSpreadingTime(sigma0);
    const norm = integrate(x => fpProb(x, t0, x0, k0, sigma0), -20, 20);
    expect(norm).toBeCloseTo(1.0, 3);
  });

  it('peak at x₀ when t=0 and k₀=0', () => {
    const x0 = 2.0, k0 = 0, sigma0 = 1.0;
    const peakVal = fpProb(x0, 0, x0, k0, sigma0);
    expect(fpProb(x0 - 0.5, 0, x0, k0, sigma0)).toBeLessThan(peakVal);
    expect(fpProb(x0 + 0.5, 0, x0, k0, sigma0)).toBeLessThan(peakVal);
  });

  it('peak at x₀+k₀t at time t', () => {
    const x0 = 0, k0 = 2.0, sigma0 = 1.0;
    for (const t of [1.0, 2.0, 3.0]) {
      const peakX = fpExpectX(t, x0, k0);
      const peakVal = fpProb(peakX, t, x0, k0, sigma0);
      expect(fpProb(peakX - 0.3, t, x0, k0, sigma0)).toBeLessThan(peakVal);
      expect(fpProb(peakX + 0.3, t, x0, k0, sigma0)).toBeLessThan(peakVal);
    }
  });

  it('width (half-max) consistent with σ(t) at t=0', () => {
    const x0 = 0, k0 = 0, sigma0 = 1.0, t = 0;
    const sigma = fpSigma(t, sigma0);
    const peak = fpProb(x0, t, x0, k0, sigma0);
    // half-max occurs at x = x₀ ± σ(t)√(2 ln 2)
    const halfMaxX = x0 + sigma * Math.sqrt(2 * Math.log(2));
    expect(fpProb(halfMaxX, t, x0, k0, sigma0)).toBeCloseTo(peak / 2, 4);
  });

  it('width (half-max) consistent with σ(t) at t=t₀', () => {
    const x0 = 0, k0 = 0, sigma0 = 1.0;
    const t0 = fpSpreadingTime(sigma0);
    const sigma = fpSigma(t0, sigma0);
    const peakX = fpExpectX(t0, x0, k0);
    const peak = fpProb(peakX, t0, x0, k0, sigma0);
    const halfMaxX = peakX + sigma * Math.sqrt(2 * Math.log(2));
    expect(fpProb(halfMaxX, t0, x0, k0, sigma0)).toBeCloseTo(peak / 2, 4);
  });
});

describe('fpExpectX / fpExpectP', () => {
  it('fpExpectX(0, x₀, k₀) = x₀', () => {
    expect(fpExpectX(0, 3.0, 1.5)).toBeCloseTo(3.0, 10);
    expect(fpExpectX(0, -2.0, -1.0)).toBeCloseTo(-2.0, 10);
  });

  it('fpExpectX(t, x₀, k₀) = x₀ + k₀t', () => {
    expect(fpExpectX(2.0, 1.0, 3.0)).toBeCloseTo(7.0, 10);
    expect(fpExpectX(5.0, -1.0, 2.0)).toBeCloseTo(9.0, 10);
  });

  it('fpExpectP(k₀) = k₀', () => {
    expect(fpExpectP(1.5)).toBeCloseTo(1.5, 10);
    expect(fpExpectP(-2.0)).toBeCloseTo(-2.0, 10);
    expect(fpExpectP(0)).toBeCloseTo(0, 10);
  });
});

describe('fpDeltaX / fpDeltaP / uncertainty', () => {
  it('fpDeltaX(0, σ₀) = σ₀', () => {
    expect(fpDeltaX(0, 1.0)).toBeCloseTo(1.0, 10);
    expect(fpDeltaX(0, 0.5)).toBeCloseTo(0.5, 10);
  });

  it('fpDeltaX(t₀, σ₀) = σ₀√2', () => {
    const sigma0 = 1.0;
    const t0 = fpSpreadingTime(sigma0);
    expect(fpDeltaX(t0, sigma0)).toBeCloseTo(sigma0 * Math.sqrt(2), 10);
  });

  it('fpDeltaP(σ₀) = 1/(2σ₀)', () => {
    expect(fpDeltaP(1.0)).toBeCloseTo(0.5, 10);
    expect(fpDeltaP(2.0)).toBeCloseTo(0.25, 10);
    expect(fpDeltaP(0.5)).toBeCloseTo(1.0, 10);
  });

  it('fpDeltaX(0)·fpDeltaP = 0.5 — minimum uncertainty at t=0', () => {
    const sigma0 = 1.5;
    expect(fpDeltaX(0, sigma0) * fpDeltaP(sigma0)).toBeCloseTo(0.5, 10);
  });

  it('fpDeltaX(t₀)·fpDeltaP = √2/2 > 0.5 — grows after t=0', () => {
    const sigma0 = 1.0;
    const t0 = fpSpreadingTime(sigma0);
    const product = fpDeltaX(t0, sigma0) * fpDeltaP(sigma0);
    expect(product).toBeCloseTo(Math.sqrt(2) / 2, 10);
    expect(product).toBeGreaterThan(0.5);
  });
});

describe('fpMomentumDist', () => {
  const integrate = (
    f: (k: number) => number,
    kMin: number,
    kMax: number,
    n = 4000
  ): number => {
    const dk = (kMax - kMin) / n;
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += f(kMin + (i + 0.5) * dk);
    }
    return sum * dk;
  };

  it('integrates to 1', () => {
    const k0 = 1.0, sigma0 = 1.0;
    const norm = integrate(k => fpMomentumDist(k, k0, sigma0), k0 - 10, k0 + 10);
    expect(norm).toBeCloseTo(1.0, 3);
  });

  it('peak at k₀', () => {
    const k0 = 2.0, sigma0 = 1.0;
    const peakVal = fpMomentumDist(k0, k0, sigma0);
    expect(fpMomentumDist(k0 - 0.3, k0, sigma0)).toBeLessThan(peakVal);
    expect(fpMomentumDist(k0 + 0.3, k0, sigma0)).toBeLessThan(peakVal);
  });

  it('value at k₀ + σ_p is e^{−1/2} × peak — width = σ_p = 1/(2σ₀)', () => {
    const k0 = 1.0, sigma0 = 1.0;
    const sigmaP = fpDeltaP(sigma0); // 1/(2σ₀)
    const peak = fpMomentumDist(k0, k0, sigma0);
    expect(fpMomentumDist(k0 + sigmaP, k0, sigma0)).toBeCloseTo(
      peak * Math.exp(-0.5),
      6
    );
  });

  it('time-independent: fpMomentumDist has no t parameter', () => {
    // The function signature has no t — this test documents that intent.
    const k0 = 1.0, sigma0 = 1.0;
    const val = fpMomentumDist(k0, k0, sigma0);
    expect(val).toBeGreaterThan(0);
  });
});

describe('fpRePsi / fpImPsi — exact phase', () => {
  it('Re²+Im² = |ψ|² = fpProb·(normalisation) at t=0', () => {
    const x0 = 0, k0 = 1.5, sigma0 = 1.0, t = 0;
    for (const x of [-2, -1, 0, 1, 2]) {
      const reSq = fpRePsi(x, t, x0, k0, sigma0) ** 2;
      const imSq = fpImPsi(x, t, x0, k0, sigma0) ** 2;
      expect(reSq + imSq).toBeCloseTo(fpProb(x, t, x0, k0, sigma0), 10);
    }
  });

  it('Re²+Im² = fpProb at arbitrary t (chirp phase does not affect modulus)', () => {
    const x0 = 1, k0 = 2, sigma0 = 1.0;
    const t0 = 2 * sigma0 * sigma0;
    for (const t of [0, t0 / 2, t0, 3 * t0]) {
      for (const x of [-3, 0, 3, 6]) {
        const reSq = fpRePsi(x, t, x0, k0, sigma0) ** 2;
        const imSq = fpImPsi(x, t, x0, k0, sigma0) ** 2;
        expect(reSq + imSq).toBeCloseTo(fpProb(x, t, x0, k0, sigma0), 10);
      }
    }
  });

  it('at t=0, Gouy=0 and chirp=0 — phase is exactly k₀(x−x₀)', () => {
    const x0 = 0, k0 = 2.0, sigma0 = 1.0, t = 0;
    const x = 1.5;
    const dx = x - x0;
    const env = Math.pow(2 * Math.PI * sigma0 * sigma0, -0.25) * Math.exp(-dx * dx / (4 * sigma0 * sigma0));
    expect(fpRePsi(x, t, x0, k0, sigma0)).toBeCloseTo(env * Math.cos(k0 * (x - x0)), 10);
    expect(fpImPsi(x, t, x0, k0, sigma0)).toBeCloseTo(env * Math.sin(k0 * (x - x0)), 10);
  });

  it('chirp: Re/Im at t=t₀ differ from the carrier-only approximation', () => {
    const x0 = 0, k0 = 1.0, sigma0 = 1.0;
    const t0 = 2 * sigma0 * sigma0;
    const x = 3.0;
    const sigma = fpSigma(t0, sigma0);
    const xi = x - x0 - k0 * t0;
    const env = Math.pow(2 * Math.PI * sigma * sigma, -0.25) * Math.exp(-xi * xi / (4 * sigma * sigma));
    // Carrier-only (approximate) phase — no chirp, no Gouy
    const approxPhase = k0 * (x - x0) - k0 * k0 * t0 / 2;
    const approxRe = env * Math.cos(approxPhase);
    const exactRe  = fpRePsi(x, t0, x0, k0, sigma0);
    // They differ because chirp = ξ²t/(8σ₀²σ²) ≠ 0 and Gouy ≠ 0 at t=t₀
    expect(Math.abs(exactRe - approxRe)).toBeGreaterThan(1e-3);
  });

  it('norm ∫|ψ|²dx = 1 at large t (spread packet) — via Re/Im', () => {
    const x0 = 0, k0 = 0.5, sigma0 = 1.0;
    const t0 = 2 * sigma0 * sigma0;
    const t = 3 * t0;
    const sigma = fpSigma(t, sigma0);
    const center = x0 + k0 * t;
    const dx = 0.05;
    let norm = 0;
    for (let x = center - 10 * sigma; x <= center + 10 * sigma; x += dx) {
      const re = fpRePsi(x, t, x0, k0, sigma0);
      const im = fpImPsi(x, t, x0, k0, sigma0);
      norm += (re * re + im * im) * dx;
    }
    expect(norm).toBeCloseTo(1.0, 2);
  });
});
