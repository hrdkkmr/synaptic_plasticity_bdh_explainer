// ===========================================================================
// engine.ts — the reusable simulation substrate of Synaptic Memory Lab.
//
// This module is pure TypeScript with ZERO knowledge of the page layout.
// It implements one small, deterministic computational model of a synapse
// with a long-term part W and a short-term dynamic state F:
//
//     G(t) = W + F(t)                                 (effective strength)
//     F(t+1) = Γ ⊙ (x(t) ⊗ h(t)) + (1 − Λ) ⊙ F(t)     (toy STP update)
//
// This is the scalar/vector toy used for teaching. It is deliberately shaped
// like the discrete-time Hebbian short-term plasticity model of García
// Rodríguez et al. 2022 (STPN, arXiv:2206.14048, Eqs. 1–7), but it is NOT a
// re-implementation of their trained architecture, and it is NOT a biological
// synapse model. See README + Research page for honest labelling.
//
// The class `AssociativeNet` below is the reusable piece: a small
// cue→item bipartite network (nCues × nItems synapses) that can
//   • run with synapses in "fixed" mode (W only, F frozen at 0) or
//   • run with synapses in "plastic" mode (F live),
//   • teach associations by correlated pre/post activity (teacher-clamped
//     postsynaptic activity, i.e. the write is driven by the pattern the
//     learner SHOWS the network),
//   • idle (pure exponential forgetting), probe (retrieval with optional
//     deterministic cue noise), rewind, replay, and export full traces.
//
// A future experiment (different topology, different task) can import
// AssociativeNet, or copy the ~200 lines of update logic, without touching
// any UI code.
// ===========================================================================

export type Level = 'fixed' | 'plastic'

export type Params = {
  /** Hebbian learning strength γ — how strongly correlated activity writes F. */
  gamma: number
  /** Forgetting rate λ per step — F ← (1−λ)·F when nothing writes. */
  lambda: number
  /** Query-time cue noise ε ∈ [0,1): uniform noise added to non-cue inputs. 0 = clean cue. */
  cueNoise: number
  /** Softmax temperature for the retrieval read-out (smaller = sharper). */
  tau: number
}

export type Readout = {
  cue: number
  /** raw scores s_j = Σ_i G_ij x_i (G = W + F) */
  scores: number[]
  /** softmax probabilities over items */
  probs: number[]
  winner: number
  /** s_winner − s_second (a real margin of the model, shown honestly) */
  margin: number
  /** what the W-only ("fixed" twin of the same net) would answer */
  staticWinner: number
  /** cue input actually fed to the net (one-hot + noise) */
  x: number[]
}

export type TracePoint = {
  t: number
  kind: 'teach' | 'idle' | 'query' | 'gate'
  cue: number | null
  item: number | null
  /** identity of the synapse this point refers to (fSel/fRow) */
  wc: number
  wi: number
  /** F of the "watched" synapse right after this step */
  fSel: number
  /** energies (F) of the whole watched cue row (interference visible here) */
  fRow: number[]
  /** if a query happened on this step: winner / expected / margin, else null */
  q: { winner: number; expected: number | null; margin: number } | null
  write: number
  decayed: number
}

export type WatchDelta = {
  kind: 'teach' | 'idle' | 'gate'
  /** watched synapse values around this step: old F, decayed amount, write amount, new F */
  before: number
  decay: number
  write: number
  after: number
}

export type JournalEntry = {
  t: number
  kind: 'teach' | 'idle' | 'query' | 'gate'
  cueName: string | null
  itemName: string | null
  text: string
}

export type Snapshot = {
  t: number
  level: Level
  params: Params
  /** flat copy of F, row-major over cues */
  F: number[]
  /** flat copy of W, row-major over cues */
  W: number[]
  lastTeach: { cue: number; item: number; write: number } | null
  lastDelta: WatchDelta | null
  lastInput: { x: number[]; teacher: number[] | null } | null
  readout: Readout | null
  teachCount: number
  queryCount: number
  journal: JournalEntry[]
  seed: number
}

export const N_CUES = 6
export const N_ITEMS = 6

/** Softmax temperature used for the retrieval read-out. */
export const DEFAULT_TAU = 0.28

export const DEFAULT_PARAMS: Params = {
  gamma: 0.55,
  lambda: 0.08,
  cueNoise: 0,
  tau: DEFAULT_TAU,
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v))
}

export class AssociativeNet {
  readonly nCues: number
  readonly nItems: number
  /** Long-term component W — stable, treated as fixed during the experiment. */
  W: number[][]
  /** Short-term dynamic state F. */
  F: number[][]
  level: Level
  params: Params
  t = 0
  seed: number
  private rng: () => number
  private watched: { cue: number; item: number } | null = null
  trace: TracePoint[] = []
  journal: JournalEntry[] = []
  lastTeach: { cue: number; item: number; write: number } | null = null
  lastInput: { x: number[]; teacher: number[] | null } | null = null
  readout: Readout | null = null
  teachCount = 0
  queryCount = 0
  lastDelta: WatchDelta | null = null
  private maxTrace = 900

  constructor(opts: {
    nCues?: number
    nItems?: number
    W?: number[][]
    params?: Partial<Params>
    level?: Level
    seed?: number
    watched?: { cue: number; item: number }
  }) {
    const { nCues = N_CUES, nItems = N_ITEMS } = opts
    this.nCues = nCues
    this.nItems = nItems
    this.W =
      opts.W ??
      Array.from({ length: nCues }, () => Array.from({ length: nItems }, () => 0))
    this.F = zeros(nCues, nItems)
    this.level = opts.level ?? 'plastic'
    this.params = { ...DEFAULT_PARAMS, ...opts.params }
    this.seed = opts.seed ?? 20260908
    this.rng = mulberry32Local(this.seed)
    this.watched = opts.watched ?? { cue: 0, item: 3 }
  }

  // ----- public API ------------------------------------------------------

  /** The watched synapse is the one the UI charts by default. */
  setWatched(cue: number, item: number) {
    this.watched = { cue: clamp(cue, 0, this.nCues - 1), item: clamp(item, 0, this.nItems - 1) }
  }
  get watchedSyn() {
    return this.watched!
  }

  reset(level?: Level, params?: Partial<Params>, seed?: number) {
    this.F = zeros(this.nCues, this.nItems)
    this.t = 0
    if (level) this.level = level
    if (params) this.params = { ...this.params, ...params }
    if (seed !== undefined) {
      this.seed = seed
      this.rng = mulberry32Local(seed)
    }
    this.trace = []
    this.journal = []
    this.lastTeach = null
    this.lastInput = null
    this.readout = null
    this.lastDelta = null
    this.teachCount = 0
    this.queryCount = 0
  }

  /**
   * Teaching step — correlated pre/postsynaptic activity:
   *   x  = one-hot cue (presynaptic)
   *   hᵀ = one-hot item, CLAMPED to the pattern the learner shows
   *        (teacher forcing — this is the "expected" signal, see UI)
   *   F ← (1−λ)·F + γ·(x ⊗ hᵀ)
   * In `fixed` level the write gate is closed: F stays 0. The step is still
   * journaled so the learner sees that a normal weight does not move.
   */
  teach(cue: number, item: number): void {
    const c = clamp(cue, 0, this.nCues - 1)
    const j = clamp(item, 0, this.nItems - 1)
    const x = oneHot(c, this.nCues)
    const teacher = oneHot(j, this.nItems)
    const { gamma, lambda } = this.params

    this.t += 1
    const { cue: wc, item: wi } = this.watched!
    const wBefore = this.F[wc][wi]
    const isWatch = c === wc && j === wi
    let decayed = 0
    let write = 0

    if (this.level === 'plastic') {
      // decay applies to the whole matrix first, then the Hebbian write lands
      for (let i = 0; i < this.nCues; i++) {
        for (let k = 0; k < this.nItems; k++) {
          this.F[i][k] *= 1 - lambda
        }
      }
      decayed = wBefore * lambda
      write = gamma * 1 * 1 // γ·x_c·h_j = γ (scalar toy, single unit each)
      this.F[c][j] += write
      this.teachCount += 1
      this.lastTeach = { cue: c, item: j, write }
      this.lastInput = { x, teacher }
      this.lastDelta = {
        kind: 'teach',
        before: isWatch ? wBefore : wBefore,
        decay: wBefore * lambda,
        write: isWatch ? write : 0,
        after: wBefore * (1 - lambda) + (isWatch ? write : 0),
      }
      this.pushTrace('teach', c, j, { write, decayed })
      this.journal.push({
        t: this.t,
        kind: 'teach',
        cueName: cueNameOf(c),
        itemName: itemNameOf(j),
        text: `${cueNameOf(c)} + ${itemNameOf(j)} co-activate → write ΔF = γ·x·h = ${fmt(write)} on synapse ${cueNameOf(c)}→${itemNameOf(j)}; everything decays ×(1−λ)`,
      })
    } else {
      this.lastTeach = null
      this.lastInput = { x, teacher: null }
      this.lastDelta = { kind: 'gate', before: wBefore, decay: 0, write: 0, after: wBefore }
      this.pushTrace('gate', c, j, { write: 0, decayed: 0 })
      this.journal.push({
        t: this.t,
        kind: 'gate',
        cueName: cueNameOf(c),
        itemName: itemNameOf(j),
        text: `write gate CLOSED (fixed level): ${cueNameOf(c)}→${itemNameOf(j)} does not change. W is a frozen parameter.`,
      })
    }
  }

  /** Idle step — no new correlated activity: F ← (1−λ)·F (pure decay). */
  idle(): void {
    if (this.level === 'plastic') {
      const { lambda } = this.params
      this.t += 1
      const { cue, item } = this.watched!
      const before = this.F[cue][item]
      for (let i = 0; i < this.nCues; i++)
        for (let k = 0; k < this.nItems; k++) this.F[i][k] *= 1 - lambda
      const decayed = before * lambda
      this.lastDelta = {
        kind: 'idle',
        before,
        decay: decayed,
        write: 0,
        after: before - decayed,
      }
      this.lastInput = { x: new Array<number>(this.nCues).fill(0), teacher: null }
      this.pushTrace('idle', null, null, { write: 0, decayed })
      this.journal.push({
        t: this.t,
        kind: 'idle',
        cueName: null,
        itemName: null,
        text: `no new activity → F ← (1−λ)·F on every synapse (watched: −${fmt(decayed)})`,
      })
    } else {
      this.t += 1
      this.lastDelta = null
      this.lastInput = { x: new Array<number>(this.nCues).fill(0), teacher: null }
      this.pushTrace('gate', null, null, { write: 0, decayed: 0 })
      this.journal.push({
        t: this.t,
        kind: 'gate',
        cueName: null,
        itemName: null,
        text: `tick (fixed level): nothing changes — there is no dynamic state to decay.`,
      })
    }
  }

  /**
   * Probe (retrieval) step — instantaneous, no write, no decay:
   *   x = one-hot cue (+ optional deterministic noise)
   *   s_j = Σ_i G_ij x_i,  G = W + F    p = softmax(s / τ)
   */
  query(cue: number): Readout {
    const c = clamp(cue, 0, this.nCues - 1)
    const x = oneHot(c, this.nCues)
    const eps = this.params.cueNoise
    if (eps > 0) {
      for (let i = 0; i < this.nCues; i++) if (i !== c) x[i] = this.rng() * eps
    }
    const scores: number[] = []
    const probs: number[] = []
    for (let k = 0; k < this.nItems; k++) {
      let s = 0
      for (let i = 0; i < this.nCues; i++) s += (this.W[i][k] + this.F[i][k]) * x[i]
      scores.push(s)
    }
    const mx = Math.max(...scores)
    let z = 0
    for (let k = 0; k < this.nItems; k++) {
      probs.push(Math.exp((scores[k] - mx) / this.params.tau))
      z += probs[k]
    }
    for (let k = 0; k < this.nItems; k++) probs[k] /= z
    const order = scores.map((_, k) => k).sort((a, b) => scores[b] - scores[a])
    const winner = order[0]
    const margin = scores[order[0]] - scores[order[1]]
    // W-only twin
    let sw = 0
    for (let k = 1; k < this.nItems; k++) if (this.W[c][k] > this.W[c][sw]) sw = k
    const ro: Readout = { cue: c, scores, probs, winner, margin, staticWinner: sw, x }
    this.readout = ro
    this.queryCount += 1
    this.lastInput = { x, teacher: null }
    this.pushTrace('query', c, null, { write: 0, decayed: 0 })
    this.journal.push({
      t: this.t,
      kind: 'query',
      cueName: cueNameOf(c),
      itemName: null,
      text: `probe ${cueNameOf(c)} → model: ${itemNameOf(winner)}  (margin ${fmt(margin)})`,
    })
    return ro
  }

  /** Probe with an explicit expected answer attached (used by the UI). */
  queryWithExpected(cue: number, expected: number | null): Readout & { expected: number | null } {
    const ro = this.query(cue)
    return { ...ro, expected }
  }

  // ----- derived quantities (shown live in the UI) -------------------------

  /** Current G = W + F for one synapse. */
  g(cue: number, item: number): number {
    return this.W[cue][item] + this.F[cue][item]
  }
  /** Current F for one synapse. */
  f(cue: number, item: number): number {
    return this.F[cue][item]
  }
  /** Total F energy stored in one cue row (how much transient memory this cue owns). */
  rowEnergy(cue: number): number {
    let s = 0
    for (let k = 0; k < this.nItems; k++) s += this.F[cue][k]
    return s
  }
  /**
   * "Recall boundary" B of cue c for a given target item m:
   * target still leads iff F(c,m) > max_{k≠m}(W(c,k)+F(c,k)) − W(c,m).
   * With a single clean write and W=1 on the default pair, B ≈ 0.96.
   */
  boundary(cue: number, target: number): number {
    let best = -Infinity
    for (let k = 0; k < this.nItems; k++) {
      if (k === target) continue
      const v = this.W[cue][k] + this.F[cue][k]
      if (v > best) best = v
    }
    return best - this.W[cue][target]
  }
  /** Predicted remaining steps until the watched synapse loses its lead. */
  stepsUntilBoundary(cue: number, target: number): number {
    const f = this.F[cue][target]
    const b = this.boundary(cue, target)
    if (f <= b) return 0
    const lam = this.params.lambda
    if (lam <= 0) return Infinity
    return Math.ceil(Math.log(b / f) / Math.log(1 - lam))
  }
  /** Half-life of F in steps: (1−λ)^k = 0.5. */
  halfLife(): number {
    const lam = this.params.lambda
    if (lam <= 0) return Infinity
    if (lam >= 1) return 0
    return Math.log(0.5) / Math.log(1 - lam)
  }

  /** Full state snapshot for the UI (values only — the UI must never mutate engine state). */
  snapshot(): Snapshot {
    const nC = this.nCues
    const nI = this.nItems
    const F = new Array<number>(nC * nI)
    const W = new Array<number>(nC * nI)
    for (let i = 0; i < nC; i++)
      for (let k = 0; k < nI; k++) {
        F[i * nI + k] = this.F[i][k]
        W[i * nI + k] = this.W[i][k]
      }
    return {
      t: this.t,
      level: this.level,
      params: { ...this.params },
      F,
      W,
      lastTeach: this.lastTeach ? { ...this.lastTeach } : null,
      lastDelta: this.lastDelta ? { ...this.lastDelta } : null,
      lastInput: this.lastInput ? { x: [...this.lastInput.x], teacher: this.lastInput.teacher ? [...this.lastInput.teacher] : null } : null,
      readout: this.readout
        ? { ...this.readout, scores: [...this.readout.scores], probs: [...this.readout.probs], x: [...this.readout.x] }
        : null,
      teachCount: this.teachCount,
      queryCount: this.queryCount,
      journal: this.journal.slice(-90),
      seed: this.seed,
    }
  }

  /** Export every recorded step as JSON (reproducibility / replay / analysis). */
  exportTrace(): string {
    return JSON.stringify(
      {
        model: 'AssociativeNet (educational toy, G = W + F; STPN-shaped update)',
        version: 1,
        level: this.level,
        params: this.params,
        W: this.W,
        seed: this.seed,
        cues: CUES,
        items: ITEMS,
        trace: this.trace,
        journal: this.journal,
      },
      null,
      2,
    )
  }

  // ----- internals ----------------------------------------------------------

  private pushTrace(
    kind: TracePoint['kind'],
    cue: number | null,
    item: number | null,
    d: { write: number; decayed: number },
  ) {
    const { cue: wc, item: wi } = this.watched!
    const point: TracePoint = {
      t: this.t,
      kind,
      cue,
      item,
      wc,
      wi,
      fSel: this.F[wc][wi],
      fRow: this.F[wc].slice(),
      q: this.readout
        ? { winner: this.readout.winner, expected: null, margin: this.readout.margin }
        : null,
      write: d.write,
      decayed: d.decayed,
    }
    this.trace.push(point)
    if (this.trace.length > this.maxTrace) this.trace.shift()
  }
}

// ----- module-level helpers ------------------------------------------------

function mulberry32Local(seed: number) {
  // re-export wrapper so engine.ts has no import cycle concerns
  return (() => {
    let a = seed >>> 0
    return function () {
      a |= 0
      a = (a + 0x6d2b79f5) | 0
      let t = Math.imul(a ^ (a >>> 15), 1 | a)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  })()
}
function zeros(r: number, c: number): number[][] {
  return Array.from({ length: r }, () => Array.from({ length: c }, () => 0))
}
function oneHot(i: number, n: number): number[] {
  const v = new Array<number>(n).fill(0)
  v[i] = 1
  return v
}
export function clampIdx(i: number, n: number): number {
  return clamp(i, 0, n - 1)
}

// ----- vocabularies (names live in the engine so traces stay self-contained) --

export const CUES = ['RED', 'BLUE', 'GREEN', 'GOLD', 'VIOLET', 'CYAN'] as const
export const ITEMS = ['APPLE', 'BERRY', 'LEAF', 'LEMON', 'GRAPE', 'STONE'] as const

/** The net's pre-trained default static mapping (used only as the W baseline). */
export const DEFAULT_W_MAP: number[] = [0, 1, 2, 3, 4, 5] // cue i → item DEFAULT_W_MAP[i]
export function defaultWeights(): number[][] {
  const w: number[][] = []
  for (let i = 0; i < N_CUES; i++) {
    const row = new Array<number>(N_ITEMS).fill(0.04)
    row[DEFAULT_W_MAP[i]] = 1.0
    w.push(row)
  }
  return w
}

export function cueNameOf(i: number): string {
  return CUES[clampIdx(i, CUES.length)] ?? '?'
}
export function itemNameOf(j: number): string {
  return ITEMS[clampIdx(j, ITEMS.length)] ?? '?'
}

/** fmt: fixed-width numbers used in the read-outs. */
export function fmt(v: number, d = 2): string {
  if (!Number.isFinite(v)) return '∞'
  if (Math.abs(v) < 5e-10) return (0).toFixed(d)
  return v.toFixed(d)
}
export function sub(i: number, j: number): string {
  return `(${cueNameOf(i)}→${itemNameOf(j)})`
}
