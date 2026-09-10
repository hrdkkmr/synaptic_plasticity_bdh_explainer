// ===========================================================================
// Lab.tsx — the interactive instrument, rebuilt around ONE focused phenomenon:
// the RED → LEMON synapse. Every pixel here is a *view* of the simulation:
// line widths, bars and numbers all read live engine state. Nothing is scripted.
// ===========================================================================
import { type CSSProperties } from 'react'
import { CUES, ITEMS, fmt, type Snapshot } from '../sim/engine'
import type { LabSession } from './useSession'
import { InfoTip, Lnum } from './widgets'
import { ICheck, ICross } from './icons'

// the story pair (engine indices: RED = 0, LEMON = 3)
const CUE = 0
const ITEM = 3

// ---------------------------------------------------------------------------
// helpers shared by the views
// ---------------------------------------------------------------------------
function lastEvent(snap: Snapshot): 'teach' | 'idle' | 'query' | 'gate' | null {
  return snap.lastInput ? (snap.lastDelta?.kind ?? (snap.readout ? 'query' : null)) : null
}

// ---------------------------------------------------------------------------
// FocusedNetwork — RED ─────── LEMON dominates; the other 5×6 wires stay on
// stage as quiet context. A probe pulse rides the wire on real query steps.
// ---------------------------------------------------------------------------
export function FocusedNetwork({ session }: { session: LabSession }) {
  const snap = session.snap
  if (!snap) return null
  const { F, W, t } = snap
  const ro = snap.readout
  const sel = session.selected
  const li = snap.lastInput
  const teachPair = snap.lastTeach
  const probeCue = ro ? ro.cue : -1

  // layer geometry
  const cues = [0, 1, 2, 3, 4, 5]
  const items = [0, 1, 2, 3, 4, 5]
  const L = 96
  const R = 560
  const CW = 780
  const H = 348
  const y = (k: number, n: number) => 40 + ((H - 80) * k) / (n - 1)
  const x0 = teachPair && teachPair.cue === CUE
  const xN = li && li.x[CUE] > 0.5
  const storyActive = x0 || xN || probeCue === CUE
  const fSel = F[CUE * 6 + ITEM]
  const wSel = W[CUE * 6 + ITEM]
  const gSel = wSel + fSel

  return (
    <div className="netwrap" data-testid="focused-network">
      <svg viewBox={`0 0 ${CW} ${H}`} className="net" role="img" aria-label="Toy network: six cue inputs, six item outputs, one highlighted synapse from RED to LEMON">
        <defs>
          <marker id="arr-ink" markerWidth="7" markerHeight="7" refX="6.4" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill="#94a3b8" />
          </marker>
          <marker id="arr-green" markerWidth="7" markerHeight="7" refX="6.4" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill="#16a34a" />
          </marker>
        </defs>

        {/* context wires — every non-story synapse, thin and quiet */}
        {cues.map((i) =>
          items.map((j) => {
            if (i === CUE && j === ITEM) return null
            const w = W[i * 6 + j]
            const rowHot = probeCue === i || teachPair?.cue === i
            return (
              <line
                key={`c${i}-${j}`}
                x1={L}
                y1={y(i, 6)}
                x2={R - 14}
                y2={y(j, 6)}
                stroke="#94a3b8"
                strokeOpacity={rowHot ? 0.5 : 0.28}
                strokeWidth={1 + w * 1.6}
                markerEnd={rowHot ? 'url(#arr-ink)' : undefined}
                style={{ transition: 'stroke-opacity .4s, stroke-width .4s' }}
              />
            )
          }),
        )}

        {/* the story synapse — frozen W base plus growing green F overlay */}
        <g>
          <line
            x1={L}
            y1={y(CUE, 6)}
            x2={R - 14}
            y2={y(ITEM, 6)}
            stroke="#64748b"
            strokeOpacity={0.9}
            strokeWidth={3 + wSel * 2.4}
            markerEnd="url(#arr-ink)"
            style={{ transition: 'stroke-width .45s' }}
          />
          {fSel > 1e-4 && (
            <line
              x1={L}
              y1={y(CUE, 6)}
              x2={R - 14}
              y2={y(ITEM, 6)}
              stroke="#16a34a"
              strokeOpacity={0.55 + 0.35 * Math.min(1, fSel)}
              strokeWidth={2 + fSel * 7}
              markerEnd="url(#arr-green)"
              style={{ transition: 'stroke-width .45s, stroke-opacity .45s' }}
            />
          )}
        </g>

        {/* probe pulse — a dot that only exists on real query steps */}
        {ro && (
          <circle
            key={`p${t}`}
            className="probe-pulse"
            cx={L}
            cy={y(CUE, 6)}
            r={4.5}
            fill="#0284c7"
            style={{ ['--dx' as string]: `${R - L}px`, ['--dy' as string]: `${y(ro.winner, 6) - y(CUE, 6)}px` } as CSSProperties}
          />
        )}
        {/* teach pulse — travels along the wire on a real write step */}
        {teachPair && teachPair.cue === CUE && teachPair.item === ITEM && (
          <circle
            key={`w${t}`}
            className="write-pulse"
            cx={L}
            cy={y(CUE, 6)}
            r={5}
            fill="#16a34a"
            style={{ ['--dx' as string]: `${R - L}px`, ['--dy' as string]: `${y(ITEM, 6) - y(CUE, 6)}px` } as CSSProperties}
          />
        )}

        {/* cue nodes */}
        {cues.map((i) => {
          const active = (li && li.x[i] > 0.5) || probeCue === i
          const story = i === CUE
          return (
            <g key={`cue${i}`} className={`node${active ? ' active' : ''}${story ? ' story' : ''}`} aria-hidden>
              {active && <circle cx={L} cy={y(i, 6)} r={19} fill="none" stroke="#0284c7" strokeOpacity={0.5} className="pulse-ring" />}
              <circle cx={L} cy={y(i, 6)} r={13} fill={active ? '#e0f2fe' : '#ffffff'} stroke={active ? '#0284c7' : '#94a3b8'} strokeWidth={2} style={{ transition: 'fill .3s, stroke .3s' }} />
              <text x={L - 24} y={y(i, 6) + 4} textAnchor="end" fontSize={story ? 13 : 10.5} fontWeight={story ? 700 : 500} fill={active ? '#075985' : '#64748b'}>
                {CUES[i]}
              </text>
            </g>
          )
        })}

        {/* item nodes with real softmax probability bars */}
        {items.map((j) => {
          const isWinner = ro ? ro.winner === j : false
          const isExpected = ro ? session.expectedFor(ro.cue) === j : false
          const prob = ro ? ro.probs[j] : 0
          const story = j === ITEM
          return (
            <g key={`item${j}`} className={`node${story ? ' story' : ''}`} aria-hidden>
              {isWinner && <circle cx={R} cy={y(j, 6)} r={19} fill="none" stroke="#16a34a" strokeOpacity={0.45} className="pulse-ring" />}
              <circle
                cx={R}
                cy={y(j, 6)}
                r={13}
                fill={isWinner ? '#dcfce7' : isExpected ? '#fef3c7' : '#ffffff'}
                stroke={isWinner ? '#16a34a' : isExpected ? '#d97706' : '#94a3b8'}
                strokeWidth={isWinner || isExpected ? 2.6 : 2}
                style={{ transition: 'fill .3s, stroke .3s' }}
              />
              <text x={R + 22} y={y(j, 6) + 4} fontSize={story ? 13 : 10.5} fontWeight={story ? 700 : 500} fill={isWinner ? '#15803d' : '#64748b'}>
                {ITEMS[j]}
              </text>
              {ro && (
                <rect x={R + 84} y={y(j, 6) - 2.5} width={Math.max(2, prob * 78)} height={5} rx={2.5} fill={isWinner ? '#16a34a' : '#cbd5e1'} style={{ transition: 'width .4s' }} />
              )}
              {ro && isWinner && (
                <text x={R + 166} y={y(j, 6) + 3.5} fontSize={10} fill="#15803d" className="mono-sm">
                  {(ro.probs[j] * 100).toFixed(0)}%
                </text>
              )}
            </g>
          )
        })}

        {/* layer captions */}
        <text x={L} y={H - 12} textAnchor="middle" fontSize={10} fill="#64748b">
          inputs — colors
        </text>
        <text x={R + 62} y={H - 12} textAnchor="middle" fontSize={10} fill="#64748b">
          outputs — objects
        </text>
        {/* selected-synapse badge: live G above the wire */}
        <g transform={`translate(${(L + R) / 2}, ${(y(CUE, 6) + y(ITEM, 6)) / 2 - 26})`}>
          <rect x={-64} y={-12} width={128} height={20} rx={10} fill="#ffffff" stroke="#e2e8f0" />
          <text textAnchor="middle" dy={3.5} fontSize={11} fill="#334155">
            G = <tspan className="mono-sm">{fmt(gSel, 2)}</tspan> = <tspan className="mono-sm">{fmt(wSel, 2)}</tspan> + <tspan className="mono-sm" fill="#16a34a">{fmt(fSel, 2)}</tspan>
          </text>
        </g>
      </svg>
      {storyActive && <span className="net-flag">{lastEvent(snap) === 'query' ? 'probing RED…' : 'RED is active'}</span>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// SynapseCard — the ONE synapse under study: W, F, G with live bars and the
// update equation revealed once the learner has seen a write happen.
// ---------------------------------------------------------------------------
export function SynapseCard({ session, showEquation }: { session: LabSession; showEquation: boolean }) {
  const snap = session.snap
  if (!snap) return null
  const { cue, item } = session.selected
  const w = snap.W[cue * 6 + item]
  const f = snap.F[cue * 6 + item]
  const g = w + f
  const d = snap.lastDelta
  const lam = snap.params.lambda
  const gam = snap.params.gamma
  const halfLife = lam > 0 ? Math.log(0.5) / Math.log(1 - lam) : Infinity
  // real, per-step state: was this exact synapse just written? is F gone?
  const justWritten = d?.kind === 'teach' && d.write > 0
  const fGone = f <= 0.005

  // W = the permanent component, F = the temporary component, G = W + F the
  // effective connection. Every value reads live snapshot state; the notes
  // under the bars change with the real step that just happened.
  const steps: { sym: string; kind: string; tip: string; v: number; max: number; color: string; note: string; hot?: boolean }[] = [
    { sym: 'W', kind: 'permanent', tip: 'Stable connection component in this toy model.', v: w, max: 1.2, color: '#64748b', note: 'unchanged' },
    {
      sym: 'F',
      kind: 'temporary',
      tip: 'Temporary activity-dependent synaptic state.',
      v: f,
      max: 1.5,
      color: '#16a34a',
      note: justWritten ? 'just written — decays from here' : fGone ? '→ 0 · memory gone' : 'decays every quiet tick',
      hot: justWritten,
    },
    {
      sym: 'G',
      kind: 'effective · W + F',
      tip: 'Effective connection used by the toy model: G = W + F.',
      v: g,
      max: 2.0,
      color: '#334155',
      note: fGone ? '≈ W — no temporary boost' : 'what the net reads: gray W + green F',
    },
  ]

  return (
    <div className="syncard" data-testid="synapse-card">
      <div className="syncard-head">
        <span className="syncard-title">
          Synapse <b>{CUES[cue]} → {ITEMS[item]}</b>
        </span>
        <span className="syncard-hl">
          λ (decay rate) = <Lnum>{fmt(lam, 2)}</Lnum> · memory half-life ≈ <Lnum>{Number.isFinite(halfLife) ? fmt(halfLife, 1) : '∞'}</Lnum> quiet ticks
        </span>
      </div>
      {steps.map((s) => (
        <div key={s.sym} className={`srow${s.sym === 'F' ? ' frow' : ''}`}>
          <div className="srow-head">
            <span className="srow-sym" style={{ color: s.color }}>{s.sym}</span>
            <span className="srow-kind">{s.kind}</span>
            <InfoTip symbol={s.sym} text={s.tip} />
            <span className="srow-val"><Lnum>{fmt(s.v, 2)}</Lnum></span>
          </div>
          <div className={`srow-bar${s.sym === 'G' ? ' gbar' : ''}`}>
            {s.sym === 'G' ? (
              // G drawn as its two real components side by side: frozen W (gray) + temporary F (green)
              <>
                <div className="srow-fill" style={{ width: `${Math.min(100, (w / s.max) * 100)}%`, background: '#64748b' }} />
                <div className="srow-fill" style={{ width: `${Math.min(100, (f / s.max) * 100)}%`, background: '#16a34a' }} />
              </>
            ) : (
              <div className="srow-fill" style={{ width: `${Math.min(100, (s.v / s.max) * 100)}%`, background: s.color }} />
            )}
          </div>
          <div className={`srow-note${s.hot ? ' hot' : ''}`}>{s.note}</div>
        </div>
      ))}
      {showEquation && d && d.kind !== 'gate' && (
        <div className="synceq" data-testid="synapse-equation">
          <b>F(t+1)</b> = (1 − λ)·F(t) + γ·(x ⊗ h) = <Lnum>{fmt(1 - lam, 2)}</Lnum>·<Lnum>{fmt(d.before, 2)}</Lnum> + <Lnum>{fmt(d.write, 2)}</Lnum> = <b><Lnum>{fmt(d.after, 2)}</Lnum></b>
          <span className="synceq-note">last step: {d.kind === 'teach' ? 'a co-activation wrote γ into F' : 'a quiet tick decayed F by λ'}</span>
        </div>
      )}
      {showEquation && d && d.kind === 'gate' && (
        <div className="synceq">
          write gate closed — with no plastic state, activity cannot change this connection.
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Verdict — EXPECTED vs MODEL, the biggest honest number on the page.
// ---------------------------------------------------------------------------
export function Verdict({ session }: { session: LabSession }) {
  const snap = session.snap
  if (!snap) return null
  const ro = snap.readout
  if (!ro) {
    return (
      <div className="verdict verdict-empty" data-testid="verdict">
        <div className="verdict-empty-t">No memory test yet</div>
        <div className="verdict-empty-d">Press “Probe RED” — the network answers from its current wiring, G = W + F.</div>
      </div>
    )
  }
  const exp = session.expectedFor(ro.cue)
  const ok = exp === null || ro.winner === exp
  return (
    <div className={`verdict ${ok ? 'v-ok' : 'v-bad'}`} data-testid="verdict" role="status">
      <div className="verdict-half">
        <span className="verdict-k">Expected</span>
        <span className="verdict-v">{exp !== null ? ITEMS[exp] : '—'}</span>
      </div>
      <div className="verdict-divider" aria-hidden />
      <div className="verdict-half">
        <span className="verdict-k">Model</span>
        <span className="verdict-v">
          {ITEMS[ro.winner]} {ok ? <ICheck size={15} aria-label="correct" /> : <ICross size={15} aria-label="incorrect" />}
        </span>
      </div>
      <div className="verdict-note">
        {ok
          ? exp !== null
            ? `The model answers ${ITEMS[ro.winner]} because F still gives this synapse the lead.`
            : 'Answering from its current wiring G = W + F.'
          : 'W never changed — F decayed, so the synapse lost its temporary advantage.'}{' '}
        <span className="dim">p({ITEMS[ro.winner]}) = {(ro.probs[ro.winner] * 100).toFixed(0)}%</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Controls — six real actions, nothing decorative.
// ---------------------------------------------------------------------------
export function Controls({
  session,
  onReplay,
  showReplay,
}: {
  session: LabSession
  onReplay: () => void
  showReplay: boolean
}) {
  const snap = session.snap
  if (!snap) return null
  const lam = snap.params.lambda
  const gam = snap.params.gamma
  return (
    <div className="controls" data-testid="controls">
      <div className="ctl-actions">
        <button type="button" className="btn btn-primary" onClick={() => session.teach(CUE, ITEM)} disabled={snap.level !== 'plastic'}>
          Teach RED → LEMON
        </button>
        <button type="button" className="btn btn-blue" onClick={() => session.probe(CUE)}>
          Probe RED
        </button>
        <button type="button" className="btn btn-quiet" onClick={() => session.passTime(1)} disabled={snap.level !== 'plastic'}>
          +1 quiet tick
        </button>
        <button type="button" className="btn btn-quiet" onClick={() => session.passTime(4)} disabled={snap.level !== 'plastic'}>
          +4 quiet ticks
        </button>
        {showReplay && (
          <button type="button" className="btn btn-quiet" onClick={onReplay}>
            Replay lesson
          </button>
        )}
      </div>
      <p className="ctl-hint">
        The experiment: <b>Teach</b> → <b>Probe RED</b> → adjust <b>λ</b> → <b>quiet ticks</b> → <b>Probe RED</b> again. Watch F rise, then fade.
      </p>
      <div className="ctl-knobs">
        <label className="ctl-slider">
          <span className="ctl-head">
            <span className="ctl-sym">γ</span>
            <span className="ctl-name">write strength</span>
            <span className="ctl-val"><Lnum>{fmt(gam, 2)}</Lnum></span>
            <InfoTip
              symbol="γ"
              text="Write strength. γ controls the strength of the activity-dependent write: larger γ makes each co-activation write more into F."
            />
          </span>
          <input
            type="range"
            aria-label="γ — write strength"
            min={0.1}
            max={1.0}
            step={0.01}
            value={gam}
            onChange={(e) => session.setGamma(parseFloat(e.target.value))}
            style={{ ['--p' as string]: `${((gam - 0.1) / 0.9) * 100}%` }}
          />
        </label>
        <label className="ctl-slider">
          <span className="ctl-head">
            <span className="ctl-sym">λ</span>
            <span className="ctl-name">decay rate</span>
            <span className="ctl-val"><Lnum>{fmt(lam, 2)}</Lnum></span>
            <InfoTip symbol="λ" text="Decay rate. Larger λ makes temporary memory disappear faster." />
          </span>
          <input
            type="range"
            aria-label="λ — decay rate: larger λ makes temporary memory disappear faster"
            min={0}
            max={0.5}
            step={0.01}
            value={lam}
            onChange={(e) => session.setLambda(parseFloat(e.target.value))}
            style={{ ['--p' as string]: `${(lam / 0.5) * 100}%` }}
          />
          {/* live reading of the same λ the engine uses: low → long memory lifetime, high → short */}
          <span className="ctl-scale" aria-hidden>
            <span className="ctl-scale-row">
              <span>low</span>
              <span>high</span>
            </span>
            <span className="ctl-scale-row ctl-scale-life">
              <span>memory lifetime: long</span>
              <span>short</span>
            </span>
          </span>
        </label>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// MemoryTrace — F over time with the exact per-tick values annotated; the
// learner watches the decay staircase in real numbers, not decoration.
// ---------------------------------------------------------------------------
export function MemoryTrace({ session }: { session: LabSession }) {
  const snap = session.snap
  const net = session.net
  if (!snap || !net) return null
  const { cue: wc, item: wi } = session.selected
  const pts = net.trace.filter((p) => p.wc === wc && p.wi === wi)
  if (pts.length < 2) {
    return <div className="trace-empty dim">The trace draws itself as you interact — teach, probe and let time pass.</div>
  }
  const CW = 700
  const CH = 190
  const PL = 40
  const PR = 14
  const PT = 16
  const PB = 24
  const maxT = pts[pts.length - 1].t
  const yMax = Math.max(1.25, ...pts.map((p) => p.fSel)) * 1.1
  const X = (t: number) => PL + (t / Math.max(1, maxT)) * (CW - PL - PR)
  const Y = (v: number) => PT + (1 - Math.max(0, v) / yMax) * (CH - PT - PB)
  const segs: { a: { t: number; f: number }; b: { t: number; f: number }; lead: boolean }[] = []
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]
    const b = pts[i]
    const boundary = snap.W[wc * 6 + wi] === 0 ? 0.96 : Math.max(0, Math.max(...Array.from({ length: 6 }, (_, k) => (k === wi ? 0 : snap.W[wc * 6 + k] + (a.fRow[k] ?? 0)))) - snap.W[wc * 6 + wi])
    segs.push({ a: { t: a.t, f: a.fSel }, b: { t: b.t, f: b.fSel }, lead: a.fSel > boundary })
  }
  const lam = snap.params.lambda
  const halfLife = lam > 0 ? Math.log(0.5) / Math.log(1 - lam) : Infinity

  return (
    <div className="tracebox" data-testid="memory-trace">
      <svg viewBox={`0 0 ${CW} ${CH}`} className="tracebox-svg" role="img" aria-label={`History of temporary state F on the ${CUES[wc]} → ${ITEMS[wi]} synapse`}>
        {[0, yMax / 2, yMax].map((v) => (
          <g key={v}>
            <line x1={PL} x2={CW - PR} y1={Y(v)} y2={Y(v)} stroke="#f1f5f9" />
            <text x={PL - 6} y={Y(v) + 3} textAnchor="end" fontSize={9} fill="#94a3b8" className="mono-sm">
              {fmt(v, v === 0 ? 0 : 1)}
            </text>
          </g>
        ))}
        {segs.map((s, i) => (
          <line key={`s${i}`} x1={X(s.a.t)} y1={Y(s.a.f)} x2={X(s.b.t)} y2={Y(s.b.f)} stroke="#16a34a" strokeWidth={2.2} strokeLinecap="round" />
        ))}
        {pts.map((p, i) => {
          if (p.kind === 'teach' && p.write > 0) return <circle key={`w${i}`} cx={X(p.t)} cy={Y(p.fSel)} r={3.2} fill="#fff" stroke="#16a34a" strokeWidth={1.8} />
          if (p.kind === 'query') return <circle key={`q${i}`} cx={X(p.t)} cy={Y(p.fSel)} r={3.2} fill="#fff" stroke="#0284c7" strokeWidth={1.8} />
          return null
        })}
        <text x={CW - PR} y={CH - 6} textAnchor="end" fontSize={9} fill="#94a3b8">
          time (ticks) →
        </text>
        <text x={PL} y={11} fontSize={9.5} fill="#64748b">
          F({CUES[wc]} → {ITEMS[wi]}) · dots: writes (green) & probes (blue) · half-life ≈ {Number.isFinite(halfLife) ? `${fmt(halfLife, 1)} ticks` : '∞'}
        </text>
      </svg>
    </div>
  )
}
