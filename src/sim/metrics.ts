// ===========================================================================
// metrics.ts — derived metrics, each with an honest definition. The UI never
// shows an invented percentage; every number here is computed from engine
// state and labelled.
// ===========================================================================
import { AssociativeNet } from './engine'

export interface Metrics {
  /** F of the watched synapse (the transient memory trace itself). */
  fTrace: number
  /** retrieval margin of the last probe: s_winner − s_second (raw score gap). */
  lastMargin: number | null
  /** softmax probability the model attached to its own pick at the last probe. */
  lastConfidence: number | null
  /** F value at which the taught synapse stops beating the row's other content. */
  boundary: number
  /** steps until decay pushes F below boundary (0 = already lost). */
  stepsToForget: number
  /** exponential half-life of F in ticks (ln 2 / ln (1/(1−λ))). */
  halfLife: number
  /** writes the learner has performed since the last reset. */
  teachCount: number
}

export function computeMetrics(net: AssociativeNet, watch: { cue: number; item: number }): Metrics {
  const { cue, item } = watch
  const fTrace = net.F[cue][item]
  const boundary = net.boundary(cue, item)
  const ro = net.readout
  let lastMargin: number | null = null
  let lastConfidence: number | null = null
  if (ro) {
    lastMargin = ro.margin
    lastConfidence = ro.probs[ro.winner]
  }
  return {
    fTrace,
    lastMargin,
    lastConfidence,
    boundary,
    stepsToForget: net.stepsUntilBoundary(cue, item),
    halfLife: net.halfLife(),
    teachCount: net.teachCount,
  }
}

/**
 * Reproduction of the curve shown in the "limits" section: how many distinct
 * cue→item associations one cue row can hold before a noisy probe starts
 * confusing them. This is computed live from the actual toy model (a tiny
 * Monte-Carlo with a fixed seed) — it is a property of the toy, and it is
 * labelled as such (it is NOT a general theory of biological memory).
 */
export function interferenceFailureRate(teachesPerItem: number, gamma: number, lambda: number, noise: number, seed = 7): number {
  return interferenceFailureRateN(3, teachesPerItem, gamma, lambda, noise, seed)
}

export function interferenceFailureRateN(
  nItemsInRow: number,
  teachesPerItem: number,
  gamma: number,
  lambda: number,
  noise: number,
  seed: number,
): number {
  // deterministic pseudo rng
  let a = seed >>> 0
  const rnd = () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const trials = 240
  let fails = 0
  for (let tr = 0; tr < trials; tr++) {
    // single cue row, nItems candidates, teach each association same count
    const F = new Array<number>(nItemsInRow + 1).fill(0)
    for (let r = 0; r < teachesPerItem; r++) {
      for (let k = 0; k < nItemsInRow; k++) {
        for (let i = 0; i < F.length; i++) F[i] *= 1 - lambda
        F[k] += gamma
      }
    }
    // probe item 0 with noise on the others
    const target = 0
    const scores = F.map((f, k) => (k === target ? f : f + rnd() * noise))
    const winner = scores.indexOf(Math.max(...scores))
    if (winner !== target) fails += 1
  }
  return fails / trials
}
