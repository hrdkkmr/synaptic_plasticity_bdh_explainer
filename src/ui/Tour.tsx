// ===========================================================================
// Tour.tsx — the floating guided-tour modal. Bottom-right by default; it
// slides to a smarter anchor (near the λ/γ controls, near the verdict) when
// the step targets one. Every "Next" gate reads REAL engine state — the tour
// never advances just because time passed. All copy teaches in full
// sentences for a learner who has never seen a neural network.
// ===========================================================================
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { LabSession } from './useSession'

export type TourAnchor = 'bottom-right' | 'controls' | 'verdict' | 'syncard'

export interface TourStep {
  id: string
  title: string
  body: string
  /** which region the modal should sit near */
  anchor: TourAnchor
  /**
   * Returns true when the learner has genuinely done the step.
   * Must read live engine state — never a timer.
   */
  done: (s: LabSession) => boolean
  /** the real control the learner should reach for (displayed as a pointer, not a duplicate) */
  action?: string
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'look',
    title: 'What are we looking at?',
    anchor: 'bottom-right',
    done: () => true,
    body: 'This is a tiny network. On the left are inputs — colors like RED. On the right are outputs — objects like LEMON. The lines between them are synapses: connections that carry signals. The network’s whole job is to answer one question: when it sees a color, which object should it pick? Its frozen wiring currently answers RED → APPLE. We are going to teach it something else.',
  },
  {
    id: 'plasticity',
    title: 'What is synaptic plasticity?',
    anchor: 'syncard',
    done: () => true,
    body: 'A synapse does not have to behave as if its strength were completely fixed. Recent activity can temporarily modify its effective state. In this model every synapse has two parts: W, a long-term weight that stays frozen for the whole experiment, and F, a temporary state that activity can write into. Look at the synapse card: W is the gray bar that never moves; F is the green one that can.',
  },
  {
    id: 'teach',
    title: 'Teach the connection',
    anchor: 'controls',
    done: (s) => (s.net?.F[0][3] ?? 0) > 0.9,
    action: 'use “Teach RED → LEMON” below',
    body: 'Time to act. Press “Teach RED → LEMON”: RED and LEMON become active together, and that correlated activity writes temporary state F onto their synapse. Watch the green line strengthen and the F bar climb — each press is one real co-activation, and a couple of presses are enough for the memory to matter.',
  },
  {
    id: 'what-is-f',
    title: 'What is F?',
    anchor: 'syncard',
    done: () => true,
    body: 'F is the part of the synapse that can change during the experiment. Unlike W, it is not treated as permanent: it stores the recent effect of activity, and it decays when activity stops. The network reads the effective strength G = W + F. So even though W has not moved, the taught connection is now effectively stronger — and the computation it performs is different.',
  },
  {
    id: 'probe1',
    title: 'Read the memory',
    anchor: 'verdict',
    done: (s) => {
      const ro = s.net?.readout
      return !!ro && ro.cue === 0 && ro.winner === 3
    },
    action: 'use “Probe RED” below',
    body: 'Now test the memory. Press “Probe RED”: the network answers from its current wiring G = W + F, and the verdict panel compares expectation with reality side by side. Expected LEMON, model LEMON ✓. This only worked because recent activity raised F, which raised G, which changed the readout.',
  },
  {
    id: 'fade',
    title: 'Stop the activity',
    anchor: 'controls',
    done: (s) => (s.net?.F[0][3] ?? 0) < 1.1,
    action: 'use “+4 quiet ticks” below',
    body: 'Now stop teaching. Every quiet tick multiplies F by (1 − λ) — that decay is the memory quietly leaking away. Press “+4 quiet ticks” (more if you like) and watch the F bar shrink while the green synapse thins out. Nothing writes anymore; time alone does the work.',
  },
  {
    id: 'lost',
    title: 'The memory is gone',
    anchor: 'verdict',
    done: (s) => {
      const ro = s.net?.readout
      return !!ro && ro.cue === 0 && ro.winner === 0
    },
    action: 'use “Probe RED” below',
    body: 'Probe RED again. Same input, same frozen W — but now the model answers APPLE ✕, the old default. If it still says LEMON, let a few more ticks pass and probe again. That is the central lesson: the input never changed and W never changed. What changed was the temporary state F. As F decayed, the temporary advantage disappeared and the network fell back to what its frozen weights prefer.',
  },
  {
    id: 'lambda',
    title: 'You set the decay rate',
    anchor: 'controls',
    done: () => true,
    body: 'λ controls how quickly F decays. Slide λ up — say from 0.08 to 0.20 — then replay the lesson: the same teaching now fades noticeably sooner, and the half-life on the synapse card tells you exactly how much. γ works the other way: it sets how much each co-activation writes. Both sliders drive real parameters of the simulation.',
  },
]

// ---------------------------------------------------------------------------
export default function Tour({ session, open, onClose }: { session: LabSession; open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0)
  const [pos, setPos] = useState<{ bottom: number; right: number } | null>(null)
  const boxRef = useRef<HTMLDivElement | null>(null)
  const s = TOUR_STEPS[step]
  const done = s.done(session)

  // anchor positioning — computed from the real DOM regions of the page
  useLayoutEffect(() => {
    if (!open) return
    const place = () => {
      if (window.innerWidth < 900) {
        setPos(null) // CSS turns the modal into a bottom sheet on small screens
        return
      }
      const box = boxRef.current
      if (!box) return
      let anchorSel = '.experiment-band'
      if (s.anchor === 'controls') anchorSel = '[data-testid="controls"]'
      else if (s.anchor === 'verdict') anchorSel = '[data-testid="verdict"]'
      else if (s.anchor === 'syncard') anchorSel = '[data-testid="synapse-card"]'
      const anchor = document.querySelector(anchorSel)
      if (!anchor) {
        setPos({ bottom: 24, right: 24 })
        return
      }
      const a = anchor.getBoundingClientRect()
      const b = box.getBoundingClientRect()
      let top: number
      if (a.bottom + 18 + b.height < window.innerHeight) top = a.bottom + 18
      else if (a.top - 18 - b.height > 0) top = a.top - 18 - b.height
      else top = window.innerHeight - b.height - 24
      let left = a.right - b.width
      left = Math.max(16, Math.min(left, window.innerWidth - b.width - 16))
      setPos({ bottom: window.innerHeight - top - b.height, right: window.innerWidth - left - b.width })
    }
    place()
    const raf = window.requestAnimationFrame(place)
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, { passive: true })
    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place)
    }
  }, [open, step, s.anchor, session.snap])

  useEffect(() => {
    if (open) setStep(0)
  }, [open])

  if (!open) return null

  const next = () => setStep((v) => Math.min(TOUR_STEPS.length - 1, v + 1))
  const prev = () => setStep((v) => Math.max(0, v - 1))
  const isLast = step === TOUR_STEPS.length - 1
  const style = pos ? { bottom: pos.bottom, right: pos.right } : undefined

  return (
    <div
      ref={boxRef}
      className={`tour-pop${pos ? '' : ' as-sheet'}`}
      style={style}
      role="dialog"
      aria-label="Guided tour"
      data-testid="tour"
      data-step={s.id}
    >
      <button type="button" className="tour-x" aria-label="Close guided tour" onClick={onClose}>
        ×
      </button>
      <div className="tour-kicker">
        Step {step + 1} of {TOUR_STEPS.length}
        <span className="tour-progress" aria-hidden>
          {TOUR_STEPS.map((t, i) => (
            <i key={t.id} className={i <= step ? 'on' : ''} />
          ))}
        </span>
      </div>
      <div aria-live="polite">
        <h3 className="tour-title">{s.title}</h3>
        <p className="tour-body">{s.body}</p>
      </div>
      {s.action && (
        <div className={`tour-cta${done ? ' ok' : ''}`}>{done ? '✓ done — you really did it' : `↓ ${s.action}`}</div>
      )}
      <div className="tour-foot">
        <button type="button" className="btn btn-quiet" onClick={prev} disabled={step === 0}>
          ← Back
        </button>
        {isLast ? (
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Finish
          </button>
        ) : (
          <button type="button" className={`btn ${done ? 'btn-primary' : 'btn-ghost'}`} onClick={next}>
            {done ? 'Next →' : 'Skip ahead →'}
          </button>
        )}
      </div>
      {!done && s.action && <div className="tour-hint">This step completes when the action has really happened in the simulation.</div>}
    </div>
  )
}
