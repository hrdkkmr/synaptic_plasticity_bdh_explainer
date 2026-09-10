// ===========================================================================
// Architecture.tsx — "WHERE DOES THIS FIT IN BDH?" An honest, beginner-level
// orientation map. It is explicitly a *conceptual* view: the terminology
// (neuron sites, synaptic state on edges, Hebbian plasticity during
// inference, damping) follows the Dragon Hatchling paper, but the drawing
// itself is a teaching simplification, and it says so.
// ===========================================================================
import { useState } from 'react'

type NodeId = 'bdh' | 'neurons' | 'synapses' | 'plasticity' | 'state' | 'readout'

interface ArchNode {
  id: NodeId
  title: string
  sub: string
  detail: string
  here?: boolean
}

const NODES: ArchNode[] = [
  {
    id: 'bdh',
    title: 'BDH — Dragon Hatchling',
    sub: 'a language-model architecture',
    detail:
      'Dragon Hatchling (BDH) is a published LLM architecture that runs as local interactions between neuron sites. Its working memory during inference relies on synaptic plasticity associated with the connections. This is the system our explainer borrows one idea from.',
  },
  {
    id: 'neurons',
    title: 'Neurons',
    sub: 'individual computational units',
    detail:
      'BDH models the network as n individual neuron sites that send signals to each other. In our toy model, the colored inputs (RED…) and the object outputs (LEMON…) play the role of small groups of such units.',
  },
  {
    id: 'synapses',
    title: 'Synapses',
    sub: 'the connections between neurons',
    detail:
      'Every neuron-to-neuron connection carries a weight. In BDH, this connection is not just a frozen number: it also holds state — the same edge stores what recently flowed through it. Our toy keeps this honest at one synapse: RED → LEMON.',
  },
  {
    id: 'plasticity',
    title: 'Synaptic plasticity',
    sub: 'activity changes the connection',
    detail:
      'This is the mechanism we zoom into. When two neurons are active together, the synapse between them is updated — a Hebbian-style write. BDH’s inference-time working memory relies exactly on this kind of plasticity. In the toy: teaching RED together with LEMON writes into F.',
    here: true,
  },
  {
    id: 'state',
    title: 'Temporary state F',
    sub: 'the short-lived memory trace',
    detail:
      'The write leaves a temporary value F on the synapse. It decays with every quiet step (rate λ), so it is memory that fades by itself — not a permanent weight change. BDH’s synaptic state behaves in the same spirit: written by activity, damped over time.',
  },
  {
    id: 'readout',
    title: 'Later computation',
    sub: 'the next prediction reads F',
    detail:
      'Whatever the network computes next — the next prediction, the next token — reads the effective connection strength G = W + F. While F lives, the network behaves as if the taught connection existed. When F fades, behavior falls back to the frozen weights W.',
  },
]

export default function Architecture() {
  const [sel, setSel] = useState<NodeId>('plasticity')
  const node = NODES.find((n) => n.id === sel)!
  const idx = NODES.findIndex((n) => n.id === sel)

  return (
    <section className="arch" aria-label="Where this explainer fits inside the BDH architecture — conceptual view">
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
                  {n.here && <span className="arch-here-badge">this explainer</span>}
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
              <b>This explainer isolates exactly this step</b> — one synapse, one temporary state F — so you can watch the mechanism happen with your
              own eyes in the demo below.
            </p>
          )}
        </div>
      </div>
      <p className="arch-disclaimer">
        Conceptual view of where this mechanism fits in BDH — simplified for teaching, following the Dragon Hatchling paper’s own terminology (neuron
        sites, synaptic state on edges, Hebbian-style plasticity during inference, damped decay). The toy below is not an implementation of BDH.
      </p>
    </section>
  )
}
