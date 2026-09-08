// ===========================================================================
// Claim reproduction suite. These tests encode the demo's central claim and
// its falsifiable checks:
//   CLAIM: recent correlated activity can be stored as a temporary change in
//   synaptic state F, F influences later computation (retrieval), and F
//   decays back so the influence disappears.
// Running `npm test` after any engine change keeps the demo honest.
// ===========================================================================
import { describe, it, expect } from 'vitest'
import { AssociativeNet, defaultWeights } from '../src/sim/engine'
import { ScriptRunner } from '../src/sim/runner'
import { HERO, OVERWRITE, STATIC_NET, FAST_FORGET } from '../src/sim/presets'

// 1) exact exponential decay during silence
describe('decay mechanics', () => {
  it('F follows (1−λ)^k exactly during idle steps', () => {
    const net = new AssociativeNet({
      W: defaultWeights(),
      params: { gamma: 0.5, lambda: 0.1 },
      level: 'plastic',
      watched: { cue: 0, item: 3 },
    })
    net.teach(0, 3) // F = 0.5
    expect(net.F[0][3]).toBeCloseTo(0.5, 12)
    net.idle()
    expect(net.F[0][3]).toBeCloseTo(0.5 * 0.9, 12)
    net.idle()
    net.idle()
    expect(net.F[0][3]).toBeCloseTo(0.5 * 0.9 ** 3, 12)
    net.idle()
    expect(net.F[0][3]).toBeCloseTo(0.5 * 0.9 ** 4, 12)
  })

  it('teach step = decay-then-write (matches toy equation F ← (1−λ)F + γ·x⊗h)', () => {
    const net = new AssociativeNet({
      W: defaultWeights(),
      params: { gamma: 0.55, lambda: 0.08 },
      level: 'plastic',
      watched: { cue: 0, item: 3 },
    })
    net.teach(0, 3) // 0.55
    net.teach(0, 3) // 0.55*0.92 + 0.55
    expect(net.F[0][3]).toBeCloseTo(0.55 * 0.92 + 0.55, 12)
    // writes only land on the co-active synapse (x and h are one-hot)
    expect(net.F[1][3]).toBeCloseTo(0, 12)
    expect(net.F[0][0]).toBeCloseTo(0, 12)
  })

  it('idle steps also decay the whole matrix (all synapses share the timescale)', () => {
    const net = new AssociativeNet({
      W: defaultWeights(),
      params: { gamma: 0.5, lambda: 0.2 },
      watched: { cue: 0, item: 3 },
    })
    net.teach(0, 3) // F[0][3] = 0.5
    net.teach(1, 0) // whole matrix decays ×0.8 first, then +0.5 lands at (1,0)
    expect(net.F[0][3]).toBeCloseTo(0.4, 12)
    expect(net.F[1][0]).toBeCloseTo(0.5, 12) // (1,0) was 0 → decayed 0 → +0.5
    net.idle()
    expect(net.F[0][3]).toBeCloseTo(0.5 * 0.8 * 0.8, 12)
    expect(net.F[1][0]).toBeCloseTo(0.5 * 0.8, 12)
  })
})

// 2) retrieval is a readout of G = W + F, and F can override the default W mapping
describe('retrieval mechanics', () => {
  it('clean net answers with its W-only default (RED → APPLE)', () => {
    const net = new AssociativeNet({ W: defaultWeights(), level: 'plastic' })
    const ro = net.query(0)
    expect(ro.winner).toBe(0) // APPLE is the default for RED
    expect(ro.staticWinner).toBe(0)
  })

  it('after teaching RED→LEMON 3×, retrieval of RED flips to LEMON', () => {
    const net = new AssociativeNet({
      W: defaultWeights(),
      params: { gamma: 0.55, lambda: 0.08 },
      level: 'plastic',
      watched: { cue: 0, item: 3 },
    })
    net.teach(0, 3)
    net.teach(0, 3)
    net.teach(0, 3)
    const ro = net.query(0)
    expect(ro.winner).toBe(3)
    expect(ro.margin).toBeGreaterThan(0.3)
  })

  it('with W off-diagonals zeroed the same logic still holds (any W is fine)', () => {
    const W = Array.from({ length: 6 }, () => new Array<number>(6).fill(0))
    W[0][0] = 1
    const net = new AssociativeNet({ W, params: { gamma: 0.4, lambda: 0.05 }, watched: { cue: 0, item: 3 } })
    net.teach(0, 3)
    net.teach(0, 3)
    net.teach(0, 3) // F ≈ 1.14 > W default 1.0
    expect(net.query(0).winner).toBe(3)
  })
})

// 3) the boundary (target leads while F(target) > B) is exact
describe('boundary maths', () => {
  it('boundary = max_{k≠m}(W+F)[k] − W[m]', () => {
    const net = new AssociativeNet({ W: defaultWeights(), watched: { cue: 0, item: 3 } })
    // row 0: W = 1.0 on APPLE (idx 0), 0.04 elsewhere
    expect(net.boundary(0, 3)).toBeCloseTo(1.0 - 0.04, 12)
    net.teach(0, 3)
    expect(net.boundary(0, 3)).toBeCloseTo(1.0 - 0.04, 12) // F on other cols stays 0
    net.idle()
    expect(net.boundary(0, 3)).toBeCloseTo(1.0 - 0.04, 12)
  })

  it('stepsUntilBoundary predicts the exact decay step where the memory loses', () => {
    const net = new AssociativeNet({
      W: defaultWeights(),
      params: { gamma: 0.55, lambda: 0.08 },
      watched: { cue: 0, item: 3 },
    })
    net.teach(0, 3)
    net.teach(0, 3)
    net.teach(0, 3)
    const F = net.F[0][3]
    const B = net.boundary(0, 3)
    const predicted = net.stepsUntilBoundary(0, 3)
    // verify against direct simulation
    let sim = F
    let k = 0
    while (sim > B + 1e-12 && k < 1000) {
      sim *= 1 - 0.08
      k++
    }
    expect(predicted).toBe(k)
    expect(predicted).toBeGreaterThan(0)
  })
})

// 4) fixed level: nothing can be written (the "conventional net" view)
describe('fixed level', () => {
  it('teaching with the gate closed leaves F = 0 and answers stay at W defaults', () => {
    const net = new AssociativeNet({ W: defaultWeights(), level: 'fixed' })
    net.teach(0, 3)
    net.teach(0, 3)
    net.teach(0, 3)
    net.idle()
    expect(net.F.every((row) => row.every((v) => v === 0))).toBe(true)
    expect(net.query(0).winner).toBe(0)
    expect(net.query(0).staticWinner).toBe(0)
  })
})

// 5) preset scripts reproduce their documented outcomes (deterministic)
describe('presets reproduce the narrative', () => {
  it('HERO: memory works right after teaching, fails after long silence (the full arc)', () => {
    const run = new ScriptRunner(HERO)
    const winners: { w: number; t: number }[] = []
    let steps = 0
    while (!run.done && steps < 200) {
      const before = run.net.queryCount
      run.tick()
      steps++
      if (run.net.queryCount > before && run.net.readout) winners.push({ w: run.net.readout.winner, t: run.net.t })
    }
    expect(steps).toBeLessThan(60)
    expect(winners.length).toBe(2)
    // query 1 (t=7, right after teaching + 4 idle) → LEMON (memory works)
    expect(winners[0].w).toBe(3)
    // query 2 (after 8 more idle) → back to the W-default APPLE (memory faded)
    expect(winners[1].w).toBe(0)
    expect(winners[1].t - winners[0].t).toBe(8)
    // and the taught trace F collapsed below the boundary
    expect(run.net.F[0][3]).toBeLessThan(run.net.boundary(0, 3))
  })

  it('STATIC_NET: script teaches but answers never move', () => {
    const run = new ScriptRunner(STATIC_NET)
    while (!run.done) run.tick()
    expect(run.net.readout!.winner).toBe(0)
    expect(run.net.F[0][3]).toBe(0)
  })

  it('OVERWRITE: second association dominates a shared cue row', () => {
    const run = new ScriptRunner(OVERWRITE)
    const winners: number[] = []
    while (!run.done) {
      const before = run.net.queryCount
      run.tick()
      if (run.net.queryCount > before) winners.push(run.net.readout!.winner)
    }
    expect(winners.length).toBe(2)
    // the newest taught memory (RED→STONE) wins by recency both times
    expect(winners[0]).toBe(5)
    expect(winners[1]).toBe(5)
    // but the older memory still lives in the same row (interference, not deletion)
    expect(run.net.F[0][3]).toBeGreaterThan(0.5)
    expect(run.net.F[0][5]).toBeGreaterThan(0.5)
  })

  it('FAST_FORGET: memory is gone after 5 idle ticks at λ = 0.33', () => {
    const run = new ScriptRunner(FAST_FORGET)
    const winners: number[] = []
    while (!run.done) {
      const before = run.net.queryCount
      run.tick()
      if (run.net.queryCount > before) winners.push(run.net.readout!.winner)
    }
    expect(winners.length).toBe(2)
    expect(winners[0]).toBe(3) // right after teaching
    expect(winners[1]).toBe(0) // 5 idle ticks later: default APPLE again
  })
})

// 6) determinism: same seed → same everything
describe('determinism', () => {
  it('two runs with the same preset produce identical traces', () => {
    const a = new ScriptRunner({ ...HERO, params: { ...HERO.params, cueNoise: 0.25 } })
    const b = new ScriptRunner({ ...HERO, params: { ...HERO.params, cueNoise: 0.25 } })
    while (!a.done) a.tick()
    while (!b.done) b.tick()
    expect(JSON.stringify(a.net.exportTrace())).toBe(JSON.stringify(b.net.exportTrace()))
  })
})
