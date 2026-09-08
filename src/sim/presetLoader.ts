// ===========================================================================
// presetLoader.ts — validate + load a user-supplied experiment preset (JSON).
// Keeps the preset format a *documented public interface*: any valid preset
// object works, from a file or the console. Validation is shape-only; the
// engine stays the single source of truth for semantics.
// ===========================================================================
import { CUES, ITEMS } from './engine'
import type { Level, Params } from './engine'
import type { Preset, ScriptOp } from './presets'

const isInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v)
const inRange = (v: unknown, lo: number, hi: number): v is number => typeof v === 'number' && v >= lo && v <= hi
const isName = (v: unknown, names: readonly string[]) => typeof v === 'string' && names.includes(v)

/** maps human names ("RED", "LEMON") or indices to indices */
function resolveIndex(v: unknown, names: readonly string[]): number | null {
  if (isInt(v)) return v >= 0 && v < names.length ? v : null
  if (typeof v === 'string') {
    const i = names.indexOf(v.toUpperCase())
    return i >= 0 ? i : null
  }
  return null
}

export type PresetError = { message: string; path: string }

/** validate a raw object as a Preset; returns a normalized preset or errors */
export function loadPreset(raw: unknown): { preset?: Preset; errors: PresetError[] } {
  const errors: PresetError[] = []
  const err = (message: string, path: string) => errors.push({ message, path })
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    err('top level must be a JSON object', '')
    return { errors }
  }
  const o = raw as Record<string, unknown>

  const id = typeof o.id === 'string' && o.id.trim() ? o.id.trim().replace(/[^a-z0-9-]/gi, '-').slice(0, 40) : 'custom'
  const label = typeof o.label === 'string' && o.label.trim() ? o.label.trim().slice(0, 60) : 'Custom experiment'
  const short = typeof o.short === 'string' ? o.short.slice(0, 140) : ''
  const level: Level = o.level === 'plastic' || o.level === 'fixed' ? o.level : 'plastic'

  const params: Partial<Params> = {}
  if (o.params !== undefined) {
    if (typeof o.params !== 'object' || o.params === null) err('params must be an object', 'params')
    else {
      const p = o.params as Record<string, unknown>
      if (p.gamma !== undefined && !inRange(p.gamma, 0, 3)) err('gamma must be a number in [0, 3]', 'params.gamma')
      else if (p.gamma !== undefined) params.gamma = p.gamma
      if (p.lambda !== undefined && !inRange(p.lambda, 0, 0.9)) err('lambda must be a number in [0, 0.9]', 'params.lambda')
      else if (p.lambda !== undefined) params.lambda = p.lambda
      if (p.cueNoise !== undefined && !inRange(p.cueNoise, 0, 1)) err('cueNoise must be a number in [0, 1]', 'params.cueNoise')
      else if (p.cueNoise !== undefined) params.cueNoise = p.cueNoise
    }
  }

  let watch = { cue: 0, item: 3 }
  if (o.watch !== undefined) {
    const w = o.watch as Record<string, unknown>
    const c = resolveIndex(w?.cue, CUES)
    const i = resolveIndex(w?.item, ITEMS)
    if (c !== null && i !== null) watch = { cue: c, item: i }
    else err('watch needs cue + item (name or index)', 'watch')
  }

  let target = { cue: watch.cue, item: watch.item, label: label }
  if (o.target !== undefined) {
    const t = o.target as Record<string, unknown>
    const c = resolveIndex(t?.cue, CUES)
    const i = resolveIndex(t?.item, ITEMS)
    if (c !== null && i !== null) target = { cue: c, item: i, label: typeof t?.label === 'string' ? t.label.slice(0, 60) : label }
    else err('target needs cue + item (name or index)', 'target')
  }

  const autoHz = inRange(o.autoHz, 0.2, 10) ? o.autoHz : 1.2

  const script: ScriptOp[] = []
  if (!Array.isArray(o.script) || o.script.length === 0) err('script must be a non-empty array of ops', 'script')
  else {
    const ops = o.script as unknown[]
    if (ops.length > 300) err('script is capped at 300 ops', 'script')
    ops.slice(0, 300).forEach((opRaw, n) => {
      const op = opRaw as Record<string, unknown>
      const pth = `script[${n}]`
      if (typeof op !== 'object' || op === null) return err('op must be an object', pth)
      const k = op.k
      if (k === 'teach') {
        const c = resolveIndex(op.cue, CUES)
        const i = resolveIndex(op.item, ITEMS)
        if (c === null || i === null) err('teach needs cue + item (name or index)', `${pth}.cue/item`)
        else script.push({ k: 'teach', cue: c, item: i })
      } else if (k === 'idle') {
        const n2 = op.n
        if (!isInt(n2) || n2 < 0 || n2 > 2000) err('idle needs an integer n in [0, 2000]', `${pth}.n`)
        else script.push({ k: 'idle', n: n2 })
      } else if (k === 'query') {
        const c = resolveIndex(op.cue, CUES)
        if (c === null) err('query needs a cue (name or index)', `${pth}.cue`)
        else {
          const exp = op.expected === null || op.expected === undefined ? null : resolveIndex(op.expected, ITEMS)
          if (op.expected !== null && op.expected !== undefined && exp === null) err('expected must be an item name/index or null', `${pth}.expected`)
          else script.push({ k: 'query', cue: c, expected: exp, tag: typeof op.tag === 'string' ? op.tag.slice(0, 60) : undefined })
        }
      } else err(`unknown op kind "${String(k)}" (teach | idle | query)`, `${pth}.k`)
    })
  }
  if (errors.length) return { errors }

  return {
    errors,
    preset: { id, label, short, level, params, watch, target, script, autoHz },
  }
}
