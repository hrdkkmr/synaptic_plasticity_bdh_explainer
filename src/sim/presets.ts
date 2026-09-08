// ===========================================================================
// presets.ts — scenario definitions for the toy AssociativeNet.
//
// A preset is pure DATA (no engine logic): which default weights to load,
// which synapse to "watch", initial parameters, and a script of operations
// to replay. Adding a new experiment = adding one object here (or in a new
// data file) — the engine and UI need no changes.
//
// Script op semantics (each op consumes exactly one timestep tick except
// 'query', which is instantaneous and does not advance t):
//   { k:'teach', cue, item }  co-activate cue+item (write γ·x⊗h + decay all F)
//   { k:'idle', n }           n ticks of pure forgetting
//   { k:'query', cue, expected, tag }  probe; expected = ground truth to show
// ===========================================================================
import { type Level, type Params } from './engine'

export type ScriptOp =
  | { k: 'teach'; cue: number; item: number }
  | { k: 'idle'; n: number }
  | { k: 'query'; cue: number; expected: number | null; tag?: string }

export interface Preset {
  id: string
  label: string
  short: string
  level: Level
  params: Partial<Params>
  /** index of the synapse the charts watch by default */
  watch: { cue: number; item: number }
  /** the association this scenario treats as "the memory to test" */
  target: { cue: number; item: number; label: string }
  script: ScriptOp[]
  /** speed in ticks/sec used for auto replay of this preset */
  autoHz: number
}

// cue / item indices
// CUES  = [RED, BLUE, GREEN, GOLD, VIOLET, CYAN]
// ITEMS = [APPLE, BERRY, LEAF, LEMON, GRAPE, STONE]
// pre-trained static default: RED→APPLE, BLUE→BERRY, GREEN→LEAF,
//                             GOLD→LEMON, VIOLET→GRAPE, CYAN→STONE

export const HERO: Preset = {
  id: 'hero',
  label: 'The RED → LEMON lesson',
  short: 'Teach a brand-new pair. Watch it stick. Watch it fade.',
  level: 'plastic',
  params: { gamma: 0.55, lambda: 0.08, cueNoise: 0 },
  watch: { cue: 0, item: 3 }, // RED → LEMON
  target: { cue: 0, item: 3, label: 'RED → LEMON (taught in-session)' },
  script: [
    { k: 'teach', cue: 0, item: 3 },
    { k: 'teach', cue: 0, item: 3 },
    { k: 'teach', cue: 0, item: 3 },
    { k: 'idle', n: 4 },
    { k: 'query', cue: 0, expected: 3, tag: 'still remembered?' },
    { k: 'idle', n: 8 },
    { k: 'query', cue: 0, expected: 3, tag: 'memory faded?' },
    { k: 'idle', n: 4 },
  ],
  autoHz: 1.1,
}

export const OVERWRITE: Preset = {
  id: 'overwrite',
  label: 'Interference lab',
  short: 'Two memories collide in the same row of synapses.',
  level: 'plastic',
  params: { gamma: 0.55, lambda: 0.05, cueNoise: 0.06 },
  watch: { cue: 0, item: 3 },
  target: { cue: 0, item: 3, label: 'last taught' },
  script: [
    { k: 'teach', cue: 0, item: 3 }, // RED → LEMON
    { k: 'teach', cue: 0, item: 3 },
    { k: 'teach', cue: 0, item: 3 },
    { k: 'teach', cue: 0, item: 5 }, // RED → STONE (collides with LEMON)
    { k: 'teach', cue: 0, item: 5 },
    { k: 'teach', cue: 0, item: 5 },
    { k: 'query', cue: 0, expected: 5, tag: 'newest memory wins?' },
    { k: 'idle', n: 8 },
    { k: 'query', cue: 0, expected: 5, tag: 'still newest after waiting' },
  ],
  autoHz: 1.2,
}

export const STATIC_NET: Preset = {
  id: 'static',
  label: 'Fixed-weight net',
  short: 'Same wires, plastic part switched off.',
  level: 'fixed',
  params: { gamma: 0.55, lambda: 0.08, cueNoise: 0 },
  watch: { cue: 0, item: 0 },
  target: { cue: 0, item: 3, label: 'RED → LEMON (would-be lesson)' },
  script: [
    { k: 'teach', cue: 0, item: 3 },
    { k: 'teach', cue: 0, item: 3 },
    { k: 'teach', cue: 0, item: 3 },
    { k: 'query', cue: 0, expected: 0, tag: 'W-only answer' },
  ],
  autoHz: 1.2,
}

export const FAST_FORGET: Preset = {
  id: 'fastforget',
  label: 'Fast-forgetting synapse',
  short: 'High λ: the same lesson evaporates in seconds.',
  level: 'plastic',
  params: { gamma: 0.55, lambda: 0.33, cueNoise: 0 },
  watch: { cue: 0, item: 3 },
  target: { cue: 0, item: 3, label: 'RED → LEMON (taught in-session)' },
  script: [
    { k: 'teach', cue: 0, item: 3 },
    { k: 'teach', cue: 0, item: 3 },
    { k: 'teach', cue: 0, item: 3 },
    { k: 'query', cue: 0, expected: 3, tag: 'right after teaching' },
    { k: 'idle', n: 5 },
    { k: 'query', cue: 0, expected: 3, tag: '5 idle steps later' },
    { k: 'idle', n: 3 },
  ],
  autoHz: 1.4,
}

export const SLOW_LEARNER: Preset = {
  id: 'slowlearner',
  label: 'Weak learning lab',
  short: 'Small γ: one glimpse is not enough to store.',
  level: 'plastic',
  params: { gamma: 0.2, lambda: 0.08, cueNoise: 0 },
  watch: { cue: 0, item: 3 },
  target: { cue: 0, item: 3, label: 'RED → LEMON (taught once)' },
  script: [
    { k: 'teach', cue: 0, item: 3 },
    { k: 'query', cue: 0, expected: 3, tag: 'after a single glimpse' },
    { k: 'idle', n: 3 },
  ],
  autoHz: 1.3,
}

/** clean plastic net, no script — the learner gets the wires */
export const CLEAN: Preset = {
  id: 'clean',
  label: 'Clean plastic net',
  short: 'Empty synapses, write gate open.',
  level: 'plastic',
  params: { gamma: 0.55, lambda: 0.08, cueNoise: 0 },
  watch: { cue: 0, item: 3 },
  target: { cue: 0, item: 3, label: 'RED → LEMON (the lesson pair)' },
  script: [],
  autoHz: 1.2,
}

/** re-teach the lesson on fresh wires and probe immediately */
export const RELEARN: Preset = {
  id: 'relearn',
  label: 'Re-teach & test',
  short: 'Fresh wires, three co-activations, immediate probe.',
  level: 'plastic',
  params: { gamma: 0.55, lambda: 0.08, cueNoise: 0 },
  watch: { cue: 0, item: 3 },
  target: { cue: 0, item: 3, label: 'RED → LEMON (taught in-session)' },
  script: [
    { k: 'teach', cue: 0, item: 3 },
    { k: 'teach', cue: 0, item: 3 },
    { k: 'teach', cue: 0, item: 3 },
    { k: 'query', cue: 0, expected: 3, tag: 'memory restored' },
  ],
  autoHz: 1.4,
}

/** B7 challenge A: same lesson under a brutal decay rate */
export const CHALL_FASTFORGET: Preset = {
  id: 'chall-fade',
  label: 'Crank λ → fast forgetting',
  short: 'λ = 0.33. Same 3 teachings. Watch it vanish in ~2 ticks.',
  level: 'plastic',
  params: { gamma: 0.55, lambda: 0.33, cueNoise: 0 },
  watch: { cue: 0, item: 3 },
  target: { cue: 0, item: 3, label: 'RED → LEMON' },
  script: [
    { k: 'teach', cue: 0, item: 3 },
    { k: 'teach', cue: 0, item: 3 },
    { k: 'teach', cue: 0, item: 3 },
    { k: 'query', cue: 0, expected: 3, tag: 'right after teaching' },
    { k: 'idle', n: 3 },
    { k: 'query', cue: 0, expected: 3, tag: 'after 3 idle ticks' },
  ],
  autoHz: 1.4,
}

/** B7 challenge B: blurry cue noise makes a thin margin flip */
export const CHALL_NOISE: Preset = {
  id: 'chall-noise',
  label: 'Noise → fragile retrieval',
  short: 'Clean cue: reliable. Noise 0.30: the same probe starts slipping.',
  level: 'plastic',
  params: { gamma: 0.55, lambda: 0.08, cueNoise: 0.3 },
  watch: { cue: 0, item: 3 },
  target: { cue: 0, item: 3, label: 'RED → LEMON' },
  script: [
    { k: 'teach', cue: 0, item: 3 },
    { k: 'teach', cue: 0, item: 3 },
    { k: 'query', cue: 0, expected: 3, tag: 'clean cue (noise 0)' },
    { k: 'query', cue: 0, expected: 3, tag: 'noise 0.30' },
    { k: 'query', cue: 0, expected: 3, tag: 'noise 0.30' },
    { k: 'query', cue: 0, expected: 3, tag: 'noise 0.30' },
  ],
  autoHz: 1.3,
}

/** B7 challenge C: small γ never writes enough */
export const CHALL_WEAK: Preset = {
  id: 'chall-weak',
  label: 'Weak learning → never sticks',
  short: 'γ = 0.20: even three repetitions cannot outrank the default.',
  level: 'plastic',
  params: { gamma: 0.2, lambda: 0.08, cueNoise: 0 },
  watch: { cue: 0, item: 3 },
  target: { cue: 0, item: 3, label: 'RED → LEMON' },
  script: [
    { k: 'teach', cue: 0, item: 3 },
    { k: 'teach', cue: 0, item: 3 },
    { k: 'teach', cue: 0, item: 3 },
    { k: 'query', cue: 0, expected: 3, tag: 'after 3 weak writes' },
  ],
  autoHz: 1.4,
}

/** B7 challenge D: interference — two memories share the RED row */
export const CHALL_OVERWRITE: Preset = {
  id: 'chall-overwrite',
  label: 'Overwrite → interference',
  short: 'Teach RED→LEMON, then RED→STONE. One row, two memories.',
  level: 'plastic',
  params: { gamma: 0.55, lambda: 0.05, cueNoise: 0 },
  watch: { cue: 0, item: 3 },
  target: { cue: 0, item: 3, label: 'RED → LEMON (first taught)' },
  script: [
    { k: 'teach', cue: 0, item: 3 },
    { k: 'teach', cue: 0, item: 3 },
    { k: 'teach', cue: 0, item: 5 },
    { k: 'teach', cue: 0, item: 5 },
    { k: 'teach', cue: 0, item: 5 },
    { k: 'query', cue: 0, expected: 3, tag: 'after both teachings' },
    { k: 'idle', n: 6 },
    { k: 'query', cue: 0, expected: 3, tag: 'later' },
  ],
  autoHz: 1.4,
}

// --- guided-lesson presets (Learn tab) ---------------------------------------
// LESSON_WATCH: three co-activations, then two quiet ticks — the learner sees F
// form before anything is read back.
export const LESSON_WATCH: Preset = {
  id: 'lesson-watch',
  label: 'The RED → LEMON lesson',
  short: 'Watch three co-activations write temporary state F.',
  level: 'plastic',
  params: { gamma: 0.55, lambda: 0.08, cueNoise: 0 },
  watch: { cue: 0, item: 3 },
  target: { cue: 0, item: 3, label: 'RED → LEMON (taught in-session)' },
  script: [
    { k: 'teach', cue: 0, item: 3 },
    { k: 'teach', cue: 0, item: 3 },
    { k: 'teach', cue: 0, item: 3 },
    { k: 'idle', n: 2 },
  ],
  autoHz: 1.6,
}

// LESSON_PROBE: the same lesson followed by a read-back, so replaying at a new λ
// immediately shows whether the memory survived (✓) or faded (✕).
export const LESSON_PROBE: Preset = {
  id: 'lesson-probe',
  label: 'Lesson + read-back',
  short: 'Teach RED→LEMON three times, then probe RED.',
  level: 'plastic',
  params: { gamma: 0.55, lambda: 0.08, cueNoise: 0 },
  watch: { cue: 0, item: 3 },
  target: { cue: 0, item: 3, label: 'RED → LEMON (taught in-session)' },
  script: [
    { k: 'teach', cue: 0, item: 3 },
    { k: 'teach', cue: 0, item: 3 },
    { k: 'teach', cue: 0, item: 3 },
    { k: 'idle', n: 2 },
    { k: 'query', cue: 0, expected: 3, tag: 'right after the lesson' },
  ],
  autoHz: 1.6,
}

export const ALL_PRESETS: Preset[] = [
  HERO,
  LESSON_WATCH,
  LESSON_PROBE,
  OVERWRITE,
  STATIC_NET,
  FAST_FORGET,
  SLOW_LEARNER,
  CLEAN,
  RELEARN,
  CHALL_FASTFORGET,
  CHALL_NOISE,
  CHALL_WEAK,
  CHALL_OVERWRITE,
]
