// ===========================================================================
// App.tsx — Synaptic Memory Lab, rebuilt as ONE continuous explainer page.
//
//   title → overview → THE CLAIM → where this fits in BDH → the live
//   experiment (guided by the floating tour) → what did you just see →
//   limitations → final takeaway. No footer, no dashboards, no tabs.
//
// The simulation engine (src/sim) remains the single source of truth; every
// number and animation on this page reads real engine state.
// ===========================================================================
import { Component, useCallback, useRef, useState, type ReactNode } from 'react'
import { CLEAN } from './sim/presets'
import { fmt } from './sim/engine'
import { useSession } from './ui/useSession'
import Architecture from './ui/Architecture'
import Tour from './ui/Tour'
import { Controls, FocusedNetwork, MemoryTrace, SynapseCard, Verdict } from './ui/Lab'
import { IReplay } from './ui/icons'

// crash shield: a runtime error must never leave the visitor with a dead page
class Boundary extends Component<{ children: ReactNode }, { bad: boolean }> {
  state = { bad: false }
  static getDerivedStateFromError() {
    return { bad: true }
  }
  render() {
    if (this.state.bad) {
      return (
        <div className="boundary">
          <h2>Something crashed.</h2>
          <p>This is a UI fault, not a broken concept — reload to restart the explainer from a clean state.</p>
          <button type="button" className="btn btn-primary" onClick={() => { this.setState({ bad: false }); window.location.reload() }}>
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function Section({ id, kicker, title, children }: { id: string; kicker: string; title: string; children: ReactNode }) {
  return (
    <section className="sec" id={id} aria-labelledby={`${id}-t`}>
      <div className="sec-kicker">{kicker}</div>
      <h2 className="sec-title" id={`${id}-t`}>{title}</h2>
      {children}
    </section>
  )
}

export default function App() {
  const session = useSession(CLEAN)
  const [tourOpen, setTourOpen] = useState(true)
  const expRef = useRef<HTMLDivElement | null>(null)
  const snap = session.snap
  const f = snap ? snap.F[0 * 6 + 3] : 0
  const t = snap?.t ?? 0

  const replayLesson = useCallback(() => {
    session.passTime(0)
    // replay = clean net + three real co-activations with the CURRENT γ/λ
    session.replay()
    const run = () => {
      // replay() rebuilt the runner; teach on the fresh engine
      session.teach(0, 3)
      session.teach(0, 3)
      session.teach(0, 3)
    }
    // teach lands on the freshly built engine inside the same React commit
    setTimeout(run, 0)
  }, [session])

  const scrollToExperiment = () => {
    expRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <Boundary>
      <a className="skip-link" href="#experiment">Skip to the experiment</a>
      <div className="page">
        {/* ================= INTRO ================= */}
        <header className="hero">
          <p className="hero-kicker">An interactive explainer</p>
          <h1 className="hero-title">Synaptic Plasticity as Short-Term Memory</h1>
          <p className="hero-over">
            Recent neural activity can temporarily strengthen a synaptic connection. That temporary state can influence what the network computes
            later — acting as a form of short-term memory. Below, you teach one connection, watch the memory work, and watch it fade.
          </p>
          <div className="claim" role="note">
            <span className="claim-k">The claim</span>
            <p>
              Recent correlated activity can be stored as a temporary change in synaptic state <b className="mgreen">F</b>. That temporary state
              changes the effective strength <b className="mink">G</b> of a connection and can influence later computation — until it decays.
            </p>
          </div>
          <div className="hero-what">
            <div><b>1 · What is plasticity?</b><span>Activity briefly changes a connection’s state.</span></div>
            <div><b>2 · What is remembered?</b><span>The fact that RED and LEMON recently fired together.</span></div>
            <div><b>3 · What holds it?</b><span>A temporary value F living on the synapse itself.</span></div>
            <div><b>4 · What will you see?</b><span>The memory change a prediction — and then fade away.</span></div>
          </div>
          <button type="button" className="btn btn-primary hero-cta" onClick={scrollToExperiment}>
            Start the experiment ↓
          </button>
        </header>

        {/* ================= BDH ORIENTATION ================= */}
        <Section id="bdh" kicker="Context first" title="Where does this fit in BDH?">
          <p className="sec-lede">
            The mechanism you are about to play with is not invented for this demo — it is a scaled-down cousin of how{' '}
            <b>Dragon Hatchling (BDH)</b>, a published language-model architecture, carries its working memory during inference. Click any level of
            the map to zoom in.
          </p>
          <Architecture />
          <p className="bdh-note">
            BDH uses synaptic plasticity during inference as a mechanism for temporary, activity-dependent state. This explainer isolates that idea
            in a much smaller model so the learner can see the mechanism directly. <b>BDH concept ≠ our educational toy</b> — the toy is 6×6
            synapses, uniform parameters, and none of BDH’s trained machinery.
          </p>
        </Section>

        {/* ================= EXPERIMENT ================= */}
        <section className="experiment-band" id="experiment" ref={expRef} aria-label="Live experiment">
          <div className="sec-kicker">Now let’s see this mechanism behave</div>
          <h2 className="sec-title">The experiment</h2>
          <p className="sec-lede">
            Everything below is live. The network starts quiet: F = 0 everywhere, so it answers only from its frozen wiring. Nothing has happened
            yet — the story starts with your first click.
          </p>

          <div className="exp-statebar" role="status" aria-live="polite">
            <span>tick <b className="lnum">{t}</b></span>
            <span>F<sub>RED→LEMON</sub> = <b className="lnum" style={{ color: f > 0 ? 'var(--green)' : undefined }}>{fmt(f, 2)}</b></span>
            <span>state: <b>{f > 0.01 ? 'memory present' : 'resting'}</b></span>
            <span className="exp-replay">
              <button type="button" className="btn btn-quiet btn-sm" onClick={replayLesson} title="Reset and re-run the RED → LEMON lesson with the current γ and λ">
                <IReplay size={14} /> Reset & re-teach
              </button>
            </span>
          </div>

          <div className="exp-grid">
            <div className="exp-viz">
              <FocusedNetwork session={session} />
              <SynapseCard session={session} showEquation={f > 0} />
            </div>
            <div className="exp-side">
              <Verdict session={session} />
              <Controls session={session} onReplay={replayLesson} showReplay />
            </div>
          </div>

          <MemoryTrace session={session} />
        </section>

        {/* ================= RECAP ================= */}
        <Section id="recap" kicker="What did you just see?" title="The mechanism, step by step">
          <ol className="recap">
            <li><b>Recent activity changed F.</b> Each time RED and LEMON fired together, the synapse wrote a little temporary state.</li>
            <li><b>F changed G.</b> The network reads the effective strength G = W + F, so the connection became effectively stronger.</li>
            <li><b>G changed the output.</b> Probing RED returned LEMON — the taught answer — for as long as F led the row.</li>
            <li><b>Activity stopped, F decayed.</b> Every quiet tick multiplied F by (1 − λ). The green bar shrank on its own.</li>
            <li><b>The prediction fell back.</b> With F gone, probing RED returned APPLE again — W had never moved.</li>
          </ol>
        </Section>

        {/* ================= LIMITATIONS ================= */}
        <Section id="limits" kicker="Honest boundaries" title="What this toy does — and does not — show">
          <ul className="limits-list">
            <li><b>One rule, not a brain.</b> Real synapses have many mechanisms and timescales; the toy keeps exactly one write rule and one decay rate.</li>
            <li><b>Short-term, not permanent.</b> F decays to zero. Nothing here is durable learning — W is a stand-in for “trained earlier”, frozen throughout.</li>
            <li><b>Small and lossy.</b> One synapse row can only hold a couple of memories before they interfere; capacity in BDH-scale systems is a different question.</li>
            <li><b>A cousin of BDH, not BDH.</b> The toy follows the same write-and-decay spirit as BDH’s synaptic state; it is not an implementation of it, and it proves nothing about brains.</li>
          </ul>
        </Section>

        {/* ================= TAKEAWAY ================= */}
        <section className="takeaway" id="takeaway">
          <p className="takeaway-k">Final takeaway</p>
          <p className="takeaway-line">
            Synaptic plasticity lets a connection carry a temporary trace of recent activity — changing what the network computes —{' '}
            <b>without permanently changing its long-term weight</b>.
          </p>
          <p className="takeaway-sub">
            In BDH, this same principle operates at scale: connections hold temporary, activity-dependent state during inference. Here, you have
            watched that principle live, at the size of a single synapse.
          </p>
        </section>
        {/* the page intentionally ends here — no footer */}

        <Tour session={session} open={tourOpen} onClose={() => setTourOpen(false)} />
      </div>
    </Boundary>
  )
}
