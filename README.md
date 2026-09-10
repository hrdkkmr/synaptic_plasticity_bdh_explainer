# Synaptic Plasticity as Short-Term Memory

> An interactive educational explainer showing how recent neural activity can be stored as temporary synaptic state, influence a later prediction, and fade with inactivity.

**Live Demo:** [synaptic-plasticity-bdh-explainer.vercel.app](https://synaptic-plasticity-bdh-explainer.vercel.app/?utm_source=chatgpt.com)

---

## 1. The Core Idea

### Synaptic plasticity can turn recent activity into temporary computational state.

In this project, a small deterministic toy network demonstrates a simple write–read–forget cycle:

```text
Recent activity
      ↓
Synaptic state changes
      ↓
Temporary trace is stored in F
      ↓
The trace changes the effective connection G
      ↓
A later probe produces a different prediction
      ↓
Inactivity causes F to decay
      ↓
The temporary memory fades
```

The experiment uses a simple **RED → LEMON** association to make this process directly observable.

The learner can:

1. Teach the network the RED → LEMON association.
2. Observe the temporary synaptic state `F` increase.
3. Probe the network and compare the expected answer with its prediction.
4. Let the network remain idle.
5. Observe `F` decay.
6. Probe again and see the prediction change.

The goal is not to simulate a biological brain. The goal is to make one computational idea concrete and reproducible.

---

# 2. What This Project Teaches

The experiment focuses on four ideas:

### 1. Activity can modify synaptic state

Recent activity temporarily changes the strength of a connection.

### 2. The memory can live in the connection

In the toy model, the temporary state `F` stores information about recent activity.

### 3. The state can affect later computation

The temporary trace contributes to the effective connection used by the model and can therefore change its prediction.

### 4. Temporary state can decay

When the activity stops, the temporary trace fades. The association therefore does not behave like permanent learning.

---

# 3. The RED → LEMON Experiment

The central experiment uses three concepts:

```text
RED      →      LEMON
                 ↑
             temporary
             synaptic trace
```

Initially, the model has no temporary RED → LEMON memory.

When RED and LEMON are repeatedly activated together:

```text
RED + LEMON
     ↓
plasticity update
     ↓
F increases
```

The resulting temporary state influences the effective connection:

```text
G = W + F
```

The model can then use this changed state when RED is probed.

If the network remains idle:

```text
F → 0
```

and the temporary association weakens.

---

# 4. The Toy Model

The simulation deliberately uses a small and interpretable model.

It contains:

- 6 cue units
- 6 item units
- a relatively stable connection state `W`
- a temporary synaptic state `F`
- an effective connection state `G`

The model represents the effective connection as:

```text
G = W + F
```

where:

- `W` represents relatively stable connection state;
- `F` represents temporary activity-dependent synaptic state;
- `G` represents the effective connection used by the toy model.

The temporary state starts at:

```text
F(0) = 0
```

and is updated using:

```text
F(t+1) = γ · (x ⊗ h) + (1 − λ) · F(t)
```

where:

- `x` = current cue/activity pattern;
- `h` = current item/activity pattern;
- `x ⊗ h` = activity-dependent outer product;
- `γ` = strength of the plasticity write;
- `λ` = decay/forgetting parameter;
- `F` = temporary synaptic state.

### Important

These equations are an **educational abstraction created for this project**.

They are not presented as the complete equations of BDH or as a complete biological model of synapses.

---

# 5. Why Separate `W` and `F`?

The separation makes the distinction between stable knowledge and temporary memory visible.

```text
W = relatively stable state

F = temporary activity-dependent state

G = W + F
```

The experiment keeps `W` fixed while allowing `F` to change.

This means that after the temporary trace decays, the underlying stable state has not been rewritten.

The learner can therefore see the difference between:

**learning something permanently**

and

**temporarily changing the state of a connection.**

---

# 6. The Write → Read → Forget Cycle

The entire experiment can be understood as three stages.

## WRITE

Teach the association:

```text
RED + LEMON
```

Repeated co-activation increases the temporary synaptic trace.

```text
F ↑
```

---

## READ

Probe the network with:

```text
RED
```

The temporary trace now contributes to the effective connection.

```text
G = W + F
```

The model therefore predicts:

```text
EXPECTED: LEMON
MODEL:    LEMON ✓
```

---

## FORGET

Stop the activity and allow the temporary state to decay.

```text
F ↓
```

Eventually the temporary contribution becomes small enough that the model can return to its previous prediction.

```text
EXPECTED: LEMON
MODEL:    APPLE ✕
```

The expected association has not changed.

The temporary memory has.

---

# 7. Understanding `γ` and `λ`

The experiment exposes two meaningful parameters.

## `γ` — How strongly do we write?

`γ` controls how strongly recent activity modifies the temporary synaptic state.

Higher `γ`:

```text
activity → larger update to F
```

Lower `γ`:

```text
activity → smaller update to F
```

---

## `λ` — How quickly do we forget?

`λ` controls the decay of the temporary state.

Higher `λ`:

```text
faster decay
```

Lower `λ`:

```text
slower decay
```

This gives the learner a direct way to investigate the trade-off between writing a temporary memory and retaining it.

---

# 8. Expected vs Model

The experiment deliberately places the expected result beside the model's actual prediction.

### Before decay

```text
EXPECTED LEMON
MODEL    LEMON ✓
```

The temporary synaptic trace successfully supports the learned association.

### After sufficient decay

```text
EXPECTED LEMON
MODEL    APPLE ✕
```

This is intentional.

The mismatch demonstrates that the temporary memory has faded.

The experiment therefore distinguishes:

- what the experiment expects;
- what the current synaptic state produces.

---

# 9. Where Does This Fit in BDH?

The Dragon Hatchling (BDH) is a biologically inspired neural architecture in which synaptic plasticity plays a role in working memory during inference. The original BDH work describes synaptic changes associated with processed concepts. [1]

This project isolates that **general computational idea** into a much smaller educational experiment.

```text
                 BDH / biologically inspired
                 computational architecture
                           │
                           │
                           ▼
                 Synaptic plasticity
                           │
                           │
                           ▼
              Temporary synaptic state
                           │
                           │
                    ┌──────┴──────┐
                    │             │
                  WRITE          READ
                    │             │
                    └──────┬──────┘
                           │
                           ▼
                      PREDICTION
                           │
                           ▼
                         DECAY
```

### YOU ARE HERE

The interactive project focuses specifically on:

> **activity → temporary synaptic state → changed computation → decay**

### Important scope distinction

This diagram is **conceptual and schematic**.

The project does not implement the full BDH architecture.

It does not reproduce the complete BDH neuron system, training procedure, inference mechanism, scale, or parameterization.

The toy should therefore be understood as an **educational reduction inspired by the synaptic-plasticity concept**, not as BDH itself.

---

# 10. Why This Matters

Transformers commonly expose temporary context through mechanisms such as attention and key-value caching.

Recurrent systems can maintain information through changing hidden states.

This project explores another computational perspective:

> **The state of the connection itself can temporarily carry information about recent activity.**

The important conceptual distinction is:

```text
Permanent parameter
       vs
Temporary synaptic state
```

The toy makes the latter visible.

Instead of asking the learner to accept that a connection has memory, the experiment lets them:

1. change it;
2. inspect it;
3. use it;
4. wait;
5. inspect it again.

---

# 11. What This Toy Does — and Does Not — Show

This project intentionally keeps the model small.

## 01 · One rule, not a brain

Real synapses involve many mechanisms and timescales.

This toy keeps one activity-dependent write rule and one decay process so that the mechanism remains visible and understandable.

---

## 02 · Short-term, not permanent

The temporary state `F` decays toward zero.

Nothing in this experiment represents durable learning.

`W` is simply a frozen stand-in for information learned earlier.

---

## 03 · Small and lossy

The toy network has limited capacity.

Multiple associations can interfere with one another, and the behavior of this small system should not be interpreted as a claim about memory capacity in large BDH-scale systems.

---

## 04 · A conceptual cousin of BDH

The toy follows the broad idea of activity-dependent synaptic state associated with the BDH research direction.

It is **not an implementation of BDH**.

It does not reproduce the complete BDH architecture and does not prove anything about biological brains.

---

# 12. Scientific Scope

The project demonstrates a computational mechanism, not a biological conclusion.

Specifically, the experiment demonstrates:

- temporary activity-dependent state;
- a simple plasticity update;
- an effective connection influenced by temporary state;
- memory-dependent prediction;
- decay of temporary state;
- interference in a small stateful system.

The project does **not** demonstrate:

- human memory;
- complete biological synaptic plasticity;
- a complete model of the brain;
- the complete BDH architecture;
- large-scale BDH performance;
- that the toy equations reproduce biological synapses.

---

# 13. Research Basis

The project is grounded in recent primary research.

### [1] Kosowski et al. (2025)

**The Dragon Hatchling: The Missing Link between the Transformer and Models of the Brain**

arXiv:2509.26507

https://arxiv.org/abs/2509.26507

Primary source for the project's connection to BDH and its use of synaptic plasticity as part of working memory during inference.

---

### [2] Mehta et al. (2024)

**Model-based inference of synaptic plasticity rules**

Advances in Neural Information Processing Systems 37, 48519–48540.

DOI: 10.52202/079017-1537

Primary computational research on modeling and inferring synaptic plasticity rules.

---

### [3] Zheng et al. (2024)

**Rapid context inference in a thalamocortical model using recurrent neural networks**

Nature Communications 15, 8275.

DOI: 10.1038/s41467-024-52289-3

Primary computational research demonstrating how Hebbian plasticity can contribute to rapid context inference.

---

### [4] Engdahl et al. (2026)

**BDH-CQ: In-Context Learning with Recurrent Latent Reasoning**

arXiv:2608.09888

https://arxiv.org/abs/2608.09888

Related work from the BDH research direction. BDH-CQ is treated as a distinct mechanism and is not presented as an implementation of the toy model.

---

Full source descriptions and evidence mapping are available in:

- [`REFERENCES.md`](REFERENCES.md)
- [`PROVENANCE.md`](PROVENANCE.md)
- [`DISCLOSURES.md`](DISCLOSURES.md)

---

# 14. Features

### Interactive Synaptic Experiment

- RED → LEMON association
- Activity-dependent synaptic updates
- Visible temporary state `F`
- Effective connection `G`
- Prediction changes
- Controlled decay
- Replayable experiment

### Parameter Exploration

- Adjustable `γ`
- Adjustable `λ`
- Immediate feedback from parameter changes

### Educational Visualization

- Visible active pathway
- Synaptic-strength changes
- Temporary-state visualization
- Prediction feedback
- Expected vs model comparison
- Guided explanation of the mechanism

### BDH Context

- Conceptual BDH placement
- Explicit "YOU ARE HERE" marker
- Clear distinction between the toy and official BDH
- Research-backed explanation

### Accessibility

- Keyboard-accessible controls
- Visible focus states
- Screen-reader-friendly labels
- `aria-live` feedback where appropriate
- Reduced-motion support

### Responsive Design

The interface is designed to work across:

- desktop
- laptop
- tablet
- mobile

---

# 15. Technology Stack

| Technology | Purpose |
|---|---|
| React | Interactive UI |
| TypeScript | Application logic and type safety |
| Vite | Development and production build |
| CSS | Layout, styling, animation, responsive design |
| SVG / CSS visualization | Educational visualizations |
| Vercel | Public deployment |

The project does not require a backend or external model service for the core experiment.

---

# 16. Project Structure

A simplified project structure is:

```text
synaptic-memory-lab/
│
├── README.md
├── REFERENCES.md
├── PROVENANCE.md
├── DISCLOSURES.md
├── LICENSE
├── package.json
├── package-lock.json
│
├── src/
│   ├── ...
│   └── ...
│
└── docs/
    └── concept-summary.md
```

The exact source structure may vary with subsequent implementation changes.

---

# 17. Running Locally

## Requirements

- Node.js
- npm

Check your installation:

```bash
node --version
npm --version
```

---

## Install dependencies

```bash
npm install
```

---

## Start the development server

```bash
npm run dev
```

Vite will provide a local development URL, typically:

```text
http://localhost:5173
```

Open the URL in a browser.

---

## Build for production

```bash
npm run build
```

---

## Preview the production build

```bash
npm run preview
```

---

# 18. Deployment

The public submission is deployed on Vercel:

**Live Demo:** [Synaptic Plasticity as Short-Term Memory — Live Demo](https://synaptic-plasticity-bdh-explainer.vercel.app/?utm_source=chatgpt.com)

The application is a client-side React/Vite project and does not require a backend service for the core experiment.

---

# 19. How to Reproduce the Main Learning Outcome

A learner can reproduce the central claim through the following sequence:

### Step 1 — Start with the prepared experiment

Observe the initial state of the synaptic network.

### Step 2 — Teach RED → LEMON

Activate the association repeatedly.

Observe:

```text
F ↑
```

### Step 3 — Probe RED

Observe the model's prediction.

Expected:

```text
LEMON
```

### Step 4 — Let the system decay

Stop the activity and allow the temporary state to weaken.

Observe:

```text
F ↓
```

### Step 5 — Probe again

The model may now return to its previous prediction.

The key observation is:

> The temporary memory changed the computation without changing the stable state.

---

# 20. Design Principles

The project was designed around a small number of educational principles.

### One precise claim

The experiment focuses on one idea rather than attempting to explain all of neuroscience or BDH.

### Visible state

The learner can see the temporary state that changes during the experiment.

### Truth beside estimate

Expected output and model output are shown together.

### Manipulable variable

The learner can change parameters such as `λ` and `γ`.

### Fast feedback

Changes should be visible immediately after meaningful interactions.

### Honest abstraction

The project explicitly distinguishes the toy model from biological systems and the complete BDH architecture.

### Progressive disclosure

The explanation moves from:

```text
intuition
   ↓
visual state
   ↓
F
   ↓
G = W + F
   ↓
full update rule
```

rather than introducing the complete mathematical model immediately.

---

# 21. Limitations

This project is intentionally a toy model.

Its main limitations are:

- very small network size;
- simplified plasticity rule;
- simplified decay mechanism;
- fixed stable state `W`;
- no biological synaptic mechanisms;
- no spiking-neuron simulation;
- no complete BDH implementation;
- limited memory capacity;
- possible interference between associations;
- no claim about human cognition.

These limitations are part of the educational design rather than hidden implementation details.

---

# 22. AI Assistance Disclosure

AI tools were used during development for activities including:

- conceptual exploration;
- UI and interaction design;
- documentation drafting;
- explanatory copy;
- implementation/refactoring guidance;
- debugging assistance;
- discussion of research concepts.

All final technical claims, implementation decisions, citations, and project materials were reviewed by the project team.

AI-generated material is not treated as scientific evidence.

Full disclosure is available in:

[`DISCLOSURES.md`](DISCLOSURES.md)

---

# 23. Provenance and Licensing

Information about:

- source code;
- research sources;
- data;
- model weights;
- graphics;
- fonts;
- third-party dependencies;
- BDH attribution;
- licenses

is documented in:

[`PROVENANCE.md`](PROVENANCE.md)

The project license is provided in:

[`LICENSE`](LICENSE)

---

# 24. Documentation

| Document | Purpose |
|---|---|
| `README.md` | Project overview and usage |
| `REFERENCES.md` | Research sources and evidence mapping |
| `PROVENANCE.md` | Code, data, asset, font, and license provenance |
| `DISCLOSURES.md` | AI assistance and external-material disclosure |
| `LICENSE` | Project licensing |

---

# 25. Project Takeaway

The experiment reduces a complex idea to one observable mechanism:

```text
ACTIVITY
   ↓
WRITE
   ↓
TEMPORARY SYNAPTIC STATE
   ↓
READ
   ↓
CHANGED PREDICTION
   ↓
DECAY
   ↓
FORGET
```

The central lesson is:

> **Synaptic plasticity can turn recent activity into temporary computational state: activity writes the trace, the network reads it, and inactivity lets it fade.**

The project deliberately stops there.

It does not claim to have built a brain.

It does not claim to have rebuilt BDH.

It provides a small, inspectable substrate through which a learner can see one important computational idea happen.