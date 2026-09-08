// presetLoader unit tests: the preset JSON interface is public — validation
// must accept every shape documented in the README and reject garbage loudly.
import { describe, expect, it } from 'vitest'
import { loadPreset } from '../src/sim/presetLoader'

describe('loadPreset', () => {
  it('loads a minimal preset with indices', () => {
    const { preset, errors } = loadPreset({
      id: 'mini',
      label: 'Mini',
      script: [{ k: 'teach', cue: 0, item: 3 }, { k: 'query', cue: 0, expected: 3 }],
    })
    expect(errors).toHaveLength(0)
    expect(preset?.id).toBe('mini')
    expect(preset?.script).toHaveLength(2)
  })

  it('accepts human-readable names', () => {
    const { preset, errors } = loadPreset({
      script: [{ k: 'teach', cue: 'RED', item: 'LEMON' }],
    })
    expect(errors).toHaveLength(0)
    expect(preset?.script[0]).toEqual({ k: 'teach', cue: 0, item: 3 })
  })

  it('defaults expected to null and keeps tags', () => {
    const { preset, errors } = loadPreset({ script: [{ k: 'query', cue: 0, tag: 'hello' }] })
    expect(errors).toHaveLength(0)
    expect(preset?.script[0]).toMatchObject({ k: 'query', cue: 0, expected: null, tag: 'hello' })
  })

  it('rejects bad params', () => {
    const { preset, errors } = loadPreset({ params: { gamma: 9 }, script: [{ k: 'idle', n: 1 }] })
    expect(preset).toBeUndefined()
    expect(errors[0].path).toBe('params.gamma')
  })

  it('rejects unknown op kinds and bad indices', () => {
    const { preset, errors } = loadPreset({ script: [{ k: 'dance' }, { k: 'teach', cue: 99, item: 0 }] })
    expect(preset).toBeUndefined()
    expect(errors.some((e) => e.message.includes('unknown op'))).toBe(true)
    expect(errors.some((e) => e.message.includes('cue'))).toBe(true)
  })

  it('round-trips through indices deterministically', () => {
    const src = {
      id: 'rt',
      level: 'fixed',
      params: { gamma: 0.2, lambda: 0.33, cueNoise: 0.1 },
      watch: { cue: 'BLUE', item: 'STONE' },
      target: { cue: 0, item: 5, label: 'blue-stone' },
      script: [{ k: 'teach', cue: 1, item: 5 }, { k: 'idle', n: 4 }, { k: 'query', cue: 'BLUE', expected: 'STONE' }],
    }
    const { preset, errors } = loadPreset(src)
    expect(errors).toHaveLength(0)
    expect(preset).toMatchObject({
      level: 'fixed',
      watch: { cue: 1, item: 5 },
      target: { cue: 0, item: 5, label: 'blue-stone' },
      script: [
        { k: 'teach', cue: 1, item: 5 },
        { k: 'idle', n: 4 },
        { k: 'query', cue: 1, expected: 5 },
      ],
    })
  })

  it('errors on non-object and empty script', () => {
    expect(loadPreset(42).errors.length).toBeGreaterThan(0)
    expect(loadPreset({ script: [] }).errors.length).toBeGreaterThan(0)
  })
})
