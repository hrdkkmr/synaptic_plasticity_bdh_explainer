# Synaptic Plasticity as Short-Term Memory

> An interactive explainer showing how **temporary synaptic plasticity can act as short-term memory**, inspired by the neuron–synapse formulation of Dragon Hatchling (BDH).

---

## 🔗 Links

| Resource | Link |
|---|---|
| 🚀 **Live Demo** | **[ADD LIVE DEMO LINK HERE]** |
| 💻 **Source Code** | https://github.com/hrdkkmr/synaptic_plasticity_bdh_explainer |
| 📄 **Concept Summary** | `[ADD PDF LINK HERE]` |
| 🎥 **Demo Video** | `[ADD VIDEO LINK HERE]` |

---

## 🧠 What is this?

Neural networks need mechanisms for retaining information while processing a sequence of inputs.

This project explores one specific idea:

> **Recent correlated activity can temporarily modify synaptic state, allowing the network's connections themselves to carry short-term memory.**

The interactive explainer makes this mechanism visible through a simple **RED → LEMON** experiment.

Instead of only showing a final prediction, the learner can observe:

```text
Input activity
      ↓
Synaptic strengthening
      ↓
Temporary state F increases
      ↓
Effective connection G changes
      ↓
Prediction changes
      ↓
Activity stops
      ↓
F decays
      ↓
Memory fades
```

The goal is to make the causal chain between **activity, synaptic state, computation, and forgetting** directly observable.

---

# 🎯 Central Claim

The project demonstrates the following computational claim:

> **Recent correlated activity can be stored as a temporary synaptic state `F`, changing the effective connection `G = W + F` and influencing later computation until `F` decays.**

The model separates the effective connection into:

```text
G = W + F
```

where:

- `W` = relatively stable connection component
- `F` = temporary activity-dependent synaptic state
- `G` = effective connection used by the computation

The temporary state evolves according to a simplified Hebbian-style update:

```text
F(t+1) = γ · (x ⊗ h) + (1 − λ) · F(t)
```

where:

- `x` = current input activity
- `h` = interacting neuron activity
- `γ` = write / learning strength
- `λ` = decay / forgetting rate

Repeated activity writes information into `F`.

When activity stops, `F` decays.

This gives the system a temporary memory trace without requiring the stable component `W` to be permanently rewritten.

---

# 🔴 → 🍋 The Experiment

The entire learning experience is centered around a simple association:

```text
RED  →  LEMON
```

## 1. Teach

The learner activates the RED pattern.

Repeated correlated activity strengthens the relevant temporary synaptic state.

```text
RED activation
      ↓
Hebbian update
      ↓
F increases
      ↓
RED → LEMON connection strengthens
```

---

## 2. Probe

The learner asks the system to retrieve the associated concept.

The explainer compares the expected answer with the model's output:

```text
EXPECTED: LEMON
MODEL:    LEMON ✓
```

The important part is that the learner can see **why** the prediction changed rather than simply receiving a new output.

---

## 3. Let the memory decay

The learner stops activating the network.

The temporary synaptic state begins to decay according to `λ`.

```text
F ↓
```

The visual representation of the relevant connection weakens as the temporary memory trace disappears.

---

## 4. Probe again

After sufficient decay:

```text
EXPECTED: LEMON
MODEL:    APPLE ✕
```

The expected association has not changed.

What changed is the temporary state that was helping the model retrieve it.

This creates a visible distinction between:

**stable knowledge** and **temporary computational state**.

---

# 🧮 The Mathematics

The explainer introduces the mathematics progressively.

### Step 1 — Temporary synaptic state

```text
F
```

`F` represents the activity-dependent state written into the connections.

### Step 2 — Effective connection

```text
G = W + F
```

The temporary state modifies the effective connection used by the computation.

### Step 3 — Update and decay

```text
F(t+1) = γ · (x ⊗ h) + (1 − λ) · F(t)
```

The two key parameters are:

| Parameter | Role |
|---|---|
| `γ` | Controls how strongly activity writes into `F` |
| `λ` | Controls how quickly the temporary trace decays |

The learner can manipulate these parameters and observe their effect on memory formation and forgetting.

---

# 🧬 Where This Fits in BDH

The project is inspired by the **Dragon Hatchling (BDH)** architecture.

BDH is a biologically inspired neural architecture based on a network of locally interacting neuron particles. The BDH paper describes working memory during inference as relying on synaptic plasticity with Hebbian learning and reports that specific synapses can strengthen when the model processes particular concepts.

A simplified conceptual view is:

```text
┌─────────────────────────┐
│     Neuron Activity     │
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│ Synaptic Interaction    │
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│ Temporary Synaptic      │
│ State F                 │
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│ Effective Connection G  │
│        G = W + F        │
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│ Changed Computation     │
└─────────────────────────┘
```

### ⚠️ Important distinction

**This project is not the official BDH implementation.**

It is an independent educational reduction of one mechanism associated with BDH.

The official BDH implementation contains substantially more structure, including its scale-free network organization, locally interacting neuron particles, training procedure, and full computational formulation.

This project intentionally reduces the problem to a tiny, inspectable system so that learners can manipulate the mechanism and observe its state directly.

---

# 🔬 Why a Toy Model?

The purpose of the project is **understanding, not scale**.

A full neural architecture can contain millions or billions of parameters and many interacting components. That makes it difficult to isolate one mechanism.

Our small simulation instead exposes:

- the input activity
- the relevant synapse
- the temporary state `F`
- the effective connection `G`
- the decay process
- the resulting prediction

This creates a direct causal relationship:

```text
Change a variable
      ↓
Observe the state change
      ↓
Observe the prediction change
```

The simulation is therefore designed as an educational substrate rather than a reproduction of the full BDH architecture.

---

# 🎮 Interactive Controls

The interface intentionally exposes only a small number of meaningful controls.

| Control | What it does |
|---|---|
| **Teach / Activate** | Applies the actual learning/update mechanism |
| **Probe** | Runs the current state and produces a prediction |
| **Step / Idle** | Advances the simulation and allows temporary state to decay |
| **Replay** | Resets/replays the experiment |
| **γ** | Controls synaptic write strength |
| **λ** | Controls synaptic decay |

Every control is connected to an actual simulation variable or state transition.

---

# 👀 What the Learner Sees

The explainer focuses attention on the causal sequence:

### Activity

```text
RED activates
```

↓

### Synaptic update

```text
RED → LEMON
```

↓

### Temporary memory

```text
F ↑
```

↓

### Effective connection

```text
G = W + F
```

↓

### Prediction

```text
LEMON ✓
```

↓

### Decay

```text
F ↓
```

↓

### Prediction after forgetting

```text
APPLE ✕
```

This makes the memory mechanism visible at the level of the connection rather than hiding it behind an opaque output.

---

# 🧪 Reproducible Learning Sequence

A learner can reproduce the central claim in a few steps:

1. Open the explainer.
2. Activate **RED → LEMON**.
3. Repeat the activation and observe `F` increasing.
4. Probe the network.
5. Confirm:

   ```text
   EXPECTED LEMON
   MODEL LEMON ✓
   ```

6. Stop activity and let the simulation decay.
7. Observe the relevant synapse weaken.
8. Probe again.
9. Observe the model eventually lose the temporary association.
10. Change `γ` and `λ` and repeat the experiment.

The learner therefore interacts with the mechanism instead of only reading about it.

---

# 🏗️ Architecture of This Project

The application separates the simulation from the learner-facing interface.

```text
src/
│
├── sim/
│   ├── engine.ts
│   ├── runner.ts
│   ├── metrics.ts
│   └── presets.ts
│
├── ui/
│   ├── Tour.tsx
│   ├── Lab.tsx
│   ├── Sandbox.tsx
│   ├── Research.tsx
│   └── useSession.ts
│
└── App.tsx
```

### Simulation layer

Responsible for:

- state updates
- synaptic plasticity
- decay
- predictions
- experiment state
- deterministic behavior

### UI layer

Responsible for:

- interactive visualization
- learner guidance
- controls
- equations
- expected-vs-model comparison
- accessibility

Keeping these layers separate helps ensure that the visualization represents actual simulation state rather than manually fabricated animations.

---

# 🛠️ Tech Stack

- **React**
- **TypeScript**
- **Vite**
- **CSS**
- Custom deterministic simulation engine

The educational simulation does not require a large ML framework to run.

---

# 💻 Running Locally

## Prerequisites

Make sure you have:

- Node.js
- npm
- Git

## Clone the repository

```bash
git clone https://github.com/hrdkkmr/synaptic_plasticity_bdh_explainer.git
cd synaptic_plasticity_bdh_explainer
```

## Install dependencies

```bash
npm install
```

## Start the development server

```bash
npm run dev
```

Open the local URL provided by Vite.

---

## Production Build

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```

---

# ♿ Accessibility

The interface is designed to remain usable across different interaction modes.

The project includes:

- keyboard-accessible controls
- visible focus states
- semantic interface elements
- explanatory labels
- accessible status updates
- reduced-motion support
- responsive layouts

Animations are intended to communicate simulation state rather than exist purely for decoration.

---

# 📱 Responsive Design

The explainer is designed for both desktop and smaller screens.

On smaller screens:

- the educational guide becomes a bottom-sheet style interface
- controls remain accessible
- the experiment remains centered on the RED → LEMON relationship
- technical explanations remain available without requiring desktop-only interaction

---

# 🔍 Scientific Scope and Limitations

This project demonstrates a simplified computational mechanism.

It does **not** claim to reproduce:

- the complete BDH architecture
- the full BDH training procedure
- biological human short-term memory
- all forms of synaptic plasticity
- the performance characteristics of the official BDH model
- the complete dynamics of biological neurons or synapses

The RED → LEMON task and simplified equations are intentionally designed for educational transparency.

The correct interpretation is:

> **This is a small interactive model for understanding a synaptic-plasticity mechanism, not a replacement for the full BDH architecture or a biological model of memory.**

---

# 📚 Related Research

## Dragon Hatchling / BDH

Kosowski et al. introduce Dragon Hatchling (BDH), a biologically inspired architecture based on locally interacting neuron particles. The paper describes working memory during inference as relying on synaptic plasticity with Hebbian learning and reports strengthening of individual synapses associated with concepts processed by the model.

**Paper:**  
https://arxiv.org/abs/2509.26507

**Official implementation:**  
https://github.com/pathwaycom/bdh

---

## BDH-CQ

BDH-CQ explores recurrent latent reasoning and in-context learning through recurrent memory. It is relevant as an architectural comparison, but it should not be treated as identical to the specific synaptic-plasticity mechanism demonstrated by this project.

**Paper:**  
https://arxiv.org/abs/2608.09888

---

## Synaptic Plasticity Research

Mehta et al. (NeurIPS 2024) study computational inference of synaptic plasticity rules from neural and behavioral data, providing broader evidence for treating plasticity rules as explicit computational mechanisms.

**Paper:**  
https://doi.org/10.52202/079017-1537

---

# 📖 References

1. Kosowski, A., Uznański, P., Chorowski, J., Stamirowska, Z., & Bartoszkiewicz, M. (2025). **The Dragon Hatchling: The Missing Link between the Transformer and Models of the Brain.** arXiv:2509.26507.  
   https://arxiv.org/abs/2509.26507

2. Engdahl et al. (2026). **BDH-CQ: In-Context Learning with Recurrent Latent Reasoning.** arXiv:2608.09888.

3. Mehta, Y. et al. (2024). **Model-based inference of synaptic plasticity rules.** NeurIPS 2024, 48519–48540.  
   https://doi.org/10.52202/079017-1537

---

# 📄 Project Documentation

Additional project documentation can include:

- concept summary / submission blog
- research notes
- architecture explanation
- experiment design
- implementation notes
- screenshots
- demo video

These materials should distinguish clearly between:

**research-backed claims → simplified educational model → observations produced by this implementation.**

---

# 🤖 AI Assistance Disclosure

AI tools were used during development for selected development and documentation tasks, including:

- brainstorming and interaction design
- code assistance
- debugging
- documentation drafting
- wording and presentation refinement

The project team reviewed the resulting implementation and is responsible for understanding and defending the final code, technical claims, equations, citations, and behavior of the artifact.

---

# 📜 License

Add the project's chosen license here.

For example:

```text
MIT License
```

If the project uses a different license, replace this section with the exact license and attribution requirements.

---

# 👤 Project

**Repository:**  
https://github.com/hrdkkmr/synaptic_plasticity_bdh_explainer

**Live Demo:**  

> 🚀 **[ADD LIVE DEMO LINK HERE]**

---

## ⭐ The Takeaway

A connection does not necessarily need to be permanently rewritten to influence what happens next.

Recent activity can leave a temporary trace in the connection itself.

```text
Activity writes the trace.
        ↓
The network reads the trace.
        ↓
Inactivity lets the trace fade.
```

**Synaptic plasticity can therefore provide a mechanism for short-term computational memory.**