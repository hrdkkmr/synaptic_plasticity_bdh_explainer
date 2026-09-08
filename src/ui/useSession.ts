// ===========================================================================
// useSession.ts — React binding around the engine + script runner.
// One session per lab (tour & sandbox get their own, both stay mounted so
// state survives tab switches). All UI updates flow through snapshots.
// ===========================================================================
import { useCallback, useEffect, useRef, useState } from 'react'
import { AssociativeNet, defaultWeights, type Level, type Params, type Snapshot } from '../sim/engine'
import { ScriptRunner } from '../sim/runner'
import { type Preset } from '../sim/presets'

export type LabMode = 'teach' | 'query'

export interface LabSession {
  preset: Preset | null
  runner: ScriptRunner | null
  net: AssociativeNet | null
  snap: Snapshot | null
  /** script ops still pending (the auto-narration owns the run right now) */
  busy: boolean
  playing: boolean
  togglePlay: () => void
  play: () => void
  pause: () => void
  step: () => void
  speed: number
  setSpeed: (s: number) => void
  replay: () => void
  applyPreset: (p: Preset, autoPlay?: boolean) => void
  teach: (cue: number, item: number) => void
  probe: (cue: number) => void
  /** stop the auto-narration and hand the wires to the learner (keeps state) */
  takeOver: () => void
  /** let real engine time pass: n spaced idle ticks (true decay, no short-cuts) */
  passTime: (n: number) => void
  mode: LabMode
  setMode: (m: LabMode) => void
  level: Level
  setLevel: (l: Level) => void
  gamma: number
  lambda: number
  noise: number
  setGamma: (v: number) => void
  setLambda: (v: number) => void
  setNoise: (v: number) => void
  selected: { cue: number; item: number }
  setSelected: (s: { cue: number; item: number }) => void
  expectedFor: (cue: number) => number | null
  exportJSON: () => void
  /** re-render after imperative engine pokes */
  commit: () => void
}

export function useSession(initial: Preset | null): LabSession {
  const runnerRef = useRef<ScriptRunner | null>(null)
  const [snap, setSnap] = useState<Snapshot | null>(() => (initial ? new ScriptRunner(initial).net.snapshot() : null))
  const [preset, setPreset] = useState<Preset | null>(initial)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeedState] = useState(1.5)
  const [mode, setMode] = useState<LabMode>('teach')
  const [level, setLevelState] = useState<Level>(initial?.level ?? 'plastic')
  const [gamma, setGammaState] = useState(initial?.params.gamma ?? 0.55)
  const [lambda, setLambdaState] = useState(initial?.params.lambda ?? 0.08)
  const [noise, setNoiseState] = useState(initial?.params.cueNoise ?? 0)
  const [selected, setSelectedState] = useState<{ cue: number; item: number }>(initial?.watch ?? { cue: 0, item: 3 })
  const speedRef = useRef(speed)
  speedRef.current = speed

  const commit = useCallback(() => {
    const r = runnerRef.current
    if (r) setSnap(r.net.snapshot())
  }, [])

  const build = useCallback(
    (p: Preset | null, autoPlay: boolean, keep: { gamma: number; lambda: number; noise: number } | null) => {
      if (!p) {
        runnerRef.current = null
        setPreset(null)
        setSnap(null)
        setPlaying(false)
        return
      }
      const runner = new ScriptRunner(p)
      if (keep) {
        runner.net.params.gamma = keep.gamma
        runner.net.params.lambda = keep.lambda
        runner.net.params.cueNoise = keep.noise
      }
      runnerRef.current = runner
      setPreset(p)
      setLevelState(runner.net.level)
      setGammaState(runner.net.params.gamma)
      setLambdaState(runner.net.params.lambda)
      setNoiseState(runner.net.params.cueNoise)
      setSelectedState(runner.net.watchedSyn)
      setSnap(runner.net.snapshot())
      setPlaying(autoPlay)
    },
    [],
  )

  useEffect(() => {
    build(initial, true, null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [build])

  // the play clock — ticks the runner while a script is pending, then keeps
  // time flowing (pure decay) when the plastic net is idle. A narration stops
  // the moment its script completes; extra decay runs on a visible budget.
  const decayBudget = useRef(0)
  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => {
      const r = runnerRef.current
      if (!r) {
        setPlaying(false)
        return
      }
      if (!r.done) {
        r.tick()
        if (r.done) {
          // narration finished exactly now → pause on the closing frame
          setPlaying(false)
        }
      } else if (r.net.level === 'plastic') {
        const energy = r.net.F.reduce((a, row) => a + row.reduce((x, v) => x + v, 0), 0)
        decayBudget.current -= 1
        if (decayBudget.current <= 0 || energy < 0.02) {
          setPlaying(false)
        } else {
          r.net.idle()
        }
      } else {
        setPlaying(false) // fixed net, script over: nothing more to watch
      }
      setSnap(r.net.snapshot())
    }, 1000 / speedRef.current)
    return () => window.clearInterval(id)
  }, [playing, speed])

  const applyPreset = useCallback((p: Preset, autoPlay = true) => build(p, autoPlay, null), [build])
  const replay = useCallback(() => {
    if (!preset) return
    build(preset, true, { gamma, lambda, noise })
  }, [build, preset, gamma, lambda, noise])

  // learner manual ops take over from any running script (keeping the state)
  const takeOver = useCallback(() => {
    const r = runnerRef.current
    if (r && !r.done) r.abort()
    setPlaying(false)
  }, [])

  const teach = useCallback(
    (cue: number, item: number) => {
      const r = runnerRef.current
      if (!r) return
      takeOver()
      r.net.teach(cue, item)
      commit()
    },
    [commit, takeOver],
  )
  const probe = useCallback(
    (cue: number) => {
      const r = runnerRef.current
      if (!r) return
      takeOver()
      r.net.query(cue)
      commit()
    },
    [commit, takeOver],
  )
  /**
   * Real quiet time, paced so the learner can watch F decay tick by tick.
   * Each tick is a genuine engine idle() step — no interpolation, no fakes —
   * spaced ~460 ms apart (doubled the classic 230 ms refresh cadence).
   */
  const passTime = useCallback(
    (n: number) => {
      const r = runnerRef.current
      if (!r || n <= 0) return
      takeOver()
      let done = 0
      const iv = window.setInterval(() => {
        r.net.idle()
        commit()
        done += 1
        if (done >= n) window.clearInterval(iv)
      }, 460)
    },
    [commit, takeOver],
  )
  const step = useCallback(() => {
    const r = runnerRef.current
    if (!r) return
    if (!r.done) r.tick()
    else if (r.net.level === 'plastic') r.net.idle()
    commit()
  }, [commit])

  const togglePlay = useCallback(() => {
    const r = runnerRef.current
    if (!r) return
    if (playing) {
      setPlaying(false)
      return
    }
    if (r.done && r.net.level === 'fixed') {
      replay() // nothing else can happen in a fixed net → restart the preset
      return
    }
    decayBudget.current = 26 // each play press in the idle phase grants a decay window
    setPlaying(true)
  }, [playing, replay])
  const play = useCallback(() => {
    decayBudget.current = 26
    setPlaying(true)
  }, [])
  const pause = useCallback(() => setPlaying(false), [])

  const setLevel = useCallback(
    (l: Level) => {
      const r = runnerRef.current
      if (!r) return
      r.net.level = l
      setLevelState(l)
      commit()
    },
    [commit],
  )
  const setGamma = useCallback(
    (v: number) => {
      const r = runnerRef.current
      if (!r) return
      r.net.params.gamma = v
      setGammaState(v)
      commit()
    },
    [commit],
  )
  const setLambda = useCallback(
    (v: number) => {
      const r = runnerRef.current
      if (!r) return
      r.net.params.lambda = v
      setLambdaState(v)
      commit()
    },
    [commit],
  )
  const setNoise = useCallback(
    (v: number) => {
      const r = runnerRef.current
      if (!r) return
      r.net.params.cueNoise = v
      setNoiseState(v)
      commit()
    },
    [commit],
  )
  const setSelected = useCallback(
    (s: { cue: number; item: number }) => {
      const r = runnerRef.current
      if (r) {
        r.net.setWatched(s.cue, s.item)
        commit()
      }
      setSelectedState(s)
    },
    [commit],
  )
  const expectedFor = useCallback(
    (cue: number): number | null => (preset && preset.target.cue === cue ? preset.target.item : null),
    [preset],
  )
  const exportJSON = useCallback(() => {
    const r = runnerRef.current
    if (!r) return
    const blob = new Blob([r.net.exportTrace()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `synaptic-memory-trace-${preset?.id ?? 'lab'}-t${r.net.t}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [preset])

  return {
    preset,
    runner: runnerRef.current,
    net: runnerRef.current?.net ?? null,
    snap,
    busy: runnerRef.current ? !runnerRef.current.done : false,
    playing,
    togglePlay,
    play,
    pause,
    step,
    speed,
    setSpeed: setSpeedState,
    replay,
    applyPreset,
    teach,
    probe,
    takeOver,
    passTime,
    mode,
    setMode,
    level,
    setLevel,
    gamma,
    lambda,
    noise,
    setGamma,
    setLambda,
    setNoise,
    selected,
    setSelected,
    expectedFor,
    exportJSON,
    commit,
  }
}

// (re-export for convenience so components can build engines for derived plots)
export { AssociativeNet, defaultWeights }
export type { Params }
