// ===========================================================================
// runner.ts — executes a Preset script against an AssociativeNet.
// Pure logic, no timers: the UI asks for one tick at a time so that speed,
// pausing and manual stepping stay entirely in the hands of the learner.
// ===========================================================================
import { AssociativeNet, type Level, type Params } from './engine'
import { type Preset, type ScriptOp } from './presets'
import { defaultWeights } from './engine'

export class ScriptRunner {
  net: AssociativeNet
  preset: Preset
  private queue: ScriptOp[] = []
  private pendingIdle = 0
  done = false
  /** per-op human readable description of what the next tick will do */
  pendingLabel = ''

  constructor(preset: Preset, params?: Partial<Params>) {
    this.preset = preset
    this.net = new AssociativeNet({
      W: defaultWeights(),
      params: { ...preset.params, ...(params ?? {}) },
      level: preset.level,
      watched: preset.watch,
      seed: 20260908,
    })
    this.queue = [...preset.script]
    this.done = this.queue.length === 0
    this.refreshLabel()
  }

  get level(): Level {
    return this.net.level
  }
  setLevel(l: Level) {
    this.net.level = l
  }

  private refreshLabel() {
    const op = this.queue[0]
    if (!op) {
      this.pendingLabel = this.pendingIdle > 0 ? `idle × ${this.pendingIdle}` : 'script complete'
      return
    }
    if (op.k === 'teach') {
      this.pendingLabel = `teach step: co-activate`
    } else if (op.k === 'idle') {
      this.pendingLabel = `idle × ${op.n}`
    } else {
      this.pendingLabel = `probe`
    }
  }

  /** Whether user-driven ops are allowed right now (not scripted). */
  get busy(): boolean {
    return this.queue.length > 0 || this.pendingIdle > 0
  }

  /** Execute one tick of the preset script. Returns the op performed (or null). */
  tick(): ScriptOp | null {
    if (this.pendingIdle > 0) {
      this.pendingIdle -= 1
      this.net.idle()
      this.refreshLabel()
      return { k: 'idle', n: 1 }
    }
    const op = this.queue[0]
    if (!op) {
      this.done = true
      return null
    }
    if (op.k === 'idle') {
      this.queue.shift()
      this.pendingIdle = op.n
      return this.tick()
    }
    if (op.k === 'teach') {
      this.queue.shift()
      this.net.teach(op.cue, op.item)
      this.refreshLabel()
      return op
    }
    // query
    this.queue.shift()
    this.net.query(op.cue)
    this.lastQuery = op
    this.refreshLabel()
    return op
  }

  lastQuery: { cue: number; expected: number | null; tag?: string } | null = null

  /** Peek at next script op without consuming. */
  peek(): ScriptOp | null {
    return this.queue[0] ?? null
  }

  /**
   * Drop the remaining script but keep all engine state: the learner has
   * taken over manually from the auto-narration.
   */
  abort(): void {
    this.queue = []
    this.pendingIdle = 0
    this.done = true
    this.pendingLabel = 'manual'
  }
}
