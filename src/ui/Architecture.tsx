// ===========================================================================
// Architecture.tsx — "WHERE DOES THIS FIT IN BDH?" A compact, beginner-level
// orientation schematic: Transformer → BDH → THIS EXPLAINER → RED → LEMON.
// It is explicitly a *conceptual* view: the terminology (synaptic state on
// edges, Hebbian plasticity during inference) follows the Dragon Hatchling
// paper, but the drawing is a teaching simplification, and it says so.
//
// The one mechanism this explainer isolates is marked "YOU ARE HERE" — it
// points at the synaptic-state/plasticity level, NOT at the whole BDH
// architecture. A tiny comparison below establishes where recent context
// lives in each design. No performance claims are made.
// ===========================================================================
import { useState } from 'react'

type NodeId = 'transformer' | 'bdh' | 'mech' | 'redlemon'

interface ArchNode {
  id: NodeId
  title: string
  sub: string
  detail: string
  here?: boolean
}

const NODES: ArchNode[] = [
  {
    id: 'transformer',
    title: 'Transformer',
    sub: 'activations + KV cache',
    detail:
      'A conventional language model keeps recent context in its activations and a growing key–value (KV) cache, while its parameters stay fixed. This is one way to make temporary information available to later computation.',
  },
  {
    id: 'bdh',
    title: 'BDH',
    sub: 'synaptic plasticity → inference-time working memory',
    detail:
      'Dragon Hatchling (BDH) is a published language-model architecture built from local neuron–synapse interactions. Its working memory during inference relies on synaptic plasticity: connections carry activity-dependent state, written by correlated activity and damped over time. BDH is the research system this explainer borrows one idea from.',
  },
  {
    id: 'mech',
    title: 'This explainer',
    sub: 'temporary synaptic state F (the mechanism, isolated)',
    detail:
      'This is the mechanism we zoom into, isolated so you can watch it happen: correlated activity writes a temporary state F onto a synapse, and every quiet step decays it (rate λ). The network reads the effective strength G = W + F, so while F lives, the computation changes — with no permanent weight change. One synapse, uniform parameters, none of BDH’s trained machinery.',
    here: true,
  },
  {
    id: 'redlemon',
    title: 'RED → LEMON',
    sub: 'write → use → decay',
    detail:
      'The live lesson below: teach RED together with LEMON (write into F), probe RED (the prediction now reads G = W + F), then let quiet ticks pass (F decays) and probe again — the temporary prediction disappears while W never moved.',
  },
]

// ---------------------------------------------------------------------------
// BdhComparison — the conceptual distinction, nothing more: where does recent
// context live? Deliberately lightweight (no dashboards, no performance claim).
// ---------------------------------------------------------------------------
export function BdhComparison() {
  return (
    <div className="bdh-cmp" aria-label="Conceptual comparison: where recent context lives">
      <div className="bdh-cmp-k">Where does recent context live?</div>
      <div className="bdh-cmp-cols">
        <div className="bdh-cmp-col">
          <span className="bdh-cmp-t">Transformer</span>
          <span className="bdh-cmp-flow">
            tokens <i aria-hidden>↓</i> activations <i aria-hidden>↓</i> KV cache
          </span>
        </div>
        <div className="bdh-cmp-col">
          <span className="bdh-cmp-t">This mechanism</span>
          <span className="bdh-cmp-flow">
            activity <i aria-hidden>↓</i> synaptic state <b className="mgreen">F</b> <i aria-hidden>↓</i> later computation
          </span>
        </div>
      </div>
      <p className="bdh-cmp-note">The difference is where temporary information lives.</p>
    </div>
  )
}

export default function Architecture() {
  const [sel, setSel] = useState<NodeId>('mech')
  const node = NODES.find((n) => n.id === sel)!
  const idx = NODES.findIndex((n) => n.id === sel)

  return (
    <section className="arch" aria-label="How this explainer relates to BDH — conceptual view">
      <div className="arch-grid">
        <div className="arch-flow" role="list">
          {NODES.map((n, i) => (
            <div role="listitem" key={n.id} className="arch-step-wrap">
              <button
                type="button"
                role="button"
                className={`arch-step${sel === n.id ? ' on' : ''}${n.here ? ' here' : ''}`}
                aria-pressed={sel === n.id}
                onClick={() => setSel(n.id)}
                onMouseEnter={() => setSel(n.id)}
                onFocus={() => setSel(n.id)}
              >
                <span className="arch-step-t">
                  {n.title}
                  {n.here && <span className="arch-here-badge">you are here</span>}
                </span>
                <span className="arch-step-s">{n.sub}</span>
              </button>
              {i < NODES.length - 1 && (
                <span className="arch-arrow" aria-hidden>
                  ↓
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="arch-detail" aria-live="polite">
          <span className="arch-detail-kicker">
            {idx + 1} / {NODES.length} · conceptual view
          </span>
          <h3 className="arch-detail-title">{node.title}</h3>
          <p className="arch-detail-body">{node.detail}</p>
          {node.here && (
            <p className="arch-detail-focus">
              <b>You are here.</b> This explainer isolates one mechanism used in BDH: activity-dependent synaptic state contributing to working
              memory during inference. The schematic points at this level — not at the whole BDH architecture.
            </p>
          )}
        </div>
      </div>

      <BdhComparison />

      <p className="arch-qualifier">
        Educational reduction — not the complete BDH architecture. BDH is the research system; this page is a teaching model of one idea from it.
      </p>
      <p className="arch-disclaimer">
        Conceptual view of where this mechanism fits in BDH — simplified for teaching, following the Dragon Hatchling paper’s own terminology (neuron
        sites, synaptic state on edges, Hebbian-style plasticity during inference, damped decay). The toy below is not an implementation of BDH.
      </p>
    </section>
  )
}
