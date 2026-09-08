# Synaptic Memory Lab — *Can a connection remember?*

**DataForge 2026 · Pathway Track.**  
Built by [shubham-dev](https://github.com/shubhamcore) · public repo: [github.com/shubhamcore/synaptic-memory-lab](https://github.com/shubhamcore/synaptic-memory-lab)

An interactive educational instrument that lets a learner watch a tiny neural network form a **short-term memory in its synapses**, use it, and lose it — and compare every model output against the expected answer.

**The central, falsifiable claim (tested live in the demo):**
> Recent correlated activity can be stored as a temporary change in synaptic state **F**, and that state can influence later computation until it decays.

It is not asserted — it is *demonstrated and then broken* in front of you: teach `RED → LEMON` three times, watch `F` climb past a decision boundary, probe right after the lesson (✓ LEMON), stop the activity, watch `F` leak away exponentially, and probe again (✕ the net falls back to `APPLE`, its frozen prior). You can then change the decay rate `λ` and predict how quickly the memory will fade, compare **EXPECTED vs MODEL** readouts on every probe, and deliberately destroy the memory four different ways in the challenge lab.

---

## Run it

```bash
npm install
npm run dev        # → http://localhost:5173
```

Production build + preview:

```bash
npm run build      # type-check + bundle → dist/
npm run preview    # serve dist/ on your LAN
```

Deploying is a plain static site: publish the `dist/` folder to any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages…). No server, no API, no tracking.

## Verify it

```bash
npm test                       # 14 unit tests on the engine/runner (determinism, decay, gates…)
npm run typecheck
# optional full browser QA (needs a running dev server on :5173):
npx playwright install chromium
npm run e2e                    # walks the whole tour + sandbox + research on a real browser
```

The e2e script asserts behavior through the DOM the way a learner drives it (44 checks: the 5-stage Learn journey + learner quiz, the forgetting crossing with EXPECTED-vs-MODEL verdicts, the λ control with live half-life, sandbox keyboard teaching, matrix/trace views, **loading a custom preset file**, research tabs, a11y surface, and no horizontal overflow at 390 px).

---

## The model (toy, honest, ~100 lines of math)

A tiny associative network: 6 cue units × 6 item units. Each synapse has two parts:

- **W** — long-term weights, **frozen during a run** (the net’s “training”, fixed before the demo starts; in the fixed-level control you can watch the write gate stay closed);
- **F** — *dynamic synaptic state*, the short-term memory. Starts at 0 for every run.

Effective strength **G = W + F**; the readout is a softmax over G (`τ = 0.28`), so F literally changes which answer the network computes.

**The plastic update (each co-activation, and nothing else):**

```
F(t+1) = γ·(x ⊗ h) + (1 − λ)·F(t)      F(0) = 0
```

`x` = input activity, `h` = output activity (teacher = expected), `γ` = write strength, `λ` = per-tick decay. This is the **STPN** form used in *“Short-Term Plasticity Neurons”* (Iyer et al., 2022), used here as the toy’s definition of a plastic synapse — see the Research tab for the paper, and for what is *not* being claimed. Every number in the UI (F values, margins, softmax confidence, half-life `ln 2 / ln(1/(1−λ))`) is computed from this state in real time. There are **no fake animations**: glows, bars, traces and verdicts are all views of engine state.

### The Learn page — one story (≈ 60–90 seconds)

Light, Transformer-Explainer-style layout: a compact title, a *conceptual* BDH orientation strip marked "you are here" (synaptic state), and the live experiment as the dominant visual — it starts running automatically, no setup. Then five stages, one idea each:

1. **Watch a connection learn** — three co-activations write F onto RED → LEMON; W stays frozen the whole time.
2. **Read the memory** — an automatic probe: EXPECTED LEMON / MODEL LEMON ✓.
3. **Stop. Watch it fade.** — quiet ticks leak F until the probe falls back to APPLE ✕ (the frozen default).
4. **You control the decay** — one knob, λ: raise it, replay the same lesson, watch the memory die sooner (live half-life shown).
5. **Explain it yourself** — a 3-option check ("why did the second probe return APPLE?") plus "what you just saw" cards that introduce Sandbox and Research.

The fixed-weight control run still exists — as a Sandbox scenario and in Research — so the honest "W never moves" point is preserved without slowing the story. Old dashboard chrome (giant hero, badges, long footer) is gone; deeper material lives in Sandbox and Research.

Then **Sandbox** (6 scenario cards, full γ/λ/noise control, fixed vs plastic level toggle, graph ↔ 6×6 matrix, JSON trace export, **load-your-own experiment preset file**) and **Research** (5 tabs: BDH + BDH-GPU summary, BDH-CQ as sibling extension, Transformer KV-cache comparison, primary evidence & sources, limits & honesty).

## Design

Light educational-scientific theme (white / #F8FAFC, charcoal text, semantic accents: green = temporary memory F, blue = input activity, amber = expected, red = failure). System fonts only — no external requests, works offline and in sandboxed previews. Keyboard-operable throughout, `prefers-reduced-motion` respected.

## Accessibility

- The whole guided tour and sandbox are **keyboard-operable**: cue/answer nodes in the network view are real focus targets (Enter = pick a cue, Space = confirm the answer), with a visible focus ring — no mouse needed to teach or probe.
- Screen readers get a polite **live region** announcing every write/probe/gate step with its tick number and arithmetic.
- A **skip-to-content link**, semantic landmarks, `aria-live` verdicts, `prefers-reduced-motion` support, and a crash **error boundary** (a UI fault never leaves a dead page) are included.
- Tested for horizontal overflow down to **390 px** (phone width).

## Simplifications — stated, not hidden

- This is a **toy**, not an implementation of any published model, and definitely **not** the brain. W is not trained by backprop in the demo; “fixed W” is a stand-in for “already trained”.
- F is scalar synaptic state on 36 synapses. Real short-term plasticity is vastly richer; the toy keeps exactly the structure needed to make the claim visible.
- BDH (Biological Deterministic Hypothesis, arXiv:2509.26507) is referenced for its *inference-time plasticity* idea and its reported results **as reported** — the demo is not a BDH implementation, and BDH is not claimed to be proven human-brain working memory. BDH is not an SSM.
- The Transformer comparison explains that the KV cache stores **K/V representations, not W matrices**.
- Limits shown in-app: capacity, interference/overwrite, no durable long-term memory in F, decay is exponential leak, retrieval is a single softmax readout.

Primary papers cited beside claims in the Research tab (all 2022–2026): **STPN** (Iyer et al., arXiv:2206.14048), **BDH / BDH-GPU** (arXiv:2509.26507), **BDH-CQ** (as reported by its authors), and the Nature Communications 2024 single-memristor synaptic-mechanism study (Weilenmann et al., *Nat. Commun.* 15, 6898).

## Reusable simulation engine

`src/sim/` is UI-free and deterministic (seeded RNG; byte-identical trace export for the same preset/params). Adding an experiment = adding one **preset object** — and in the sandbox you can also **load one directly as a `.json` file** (validated client-side: cues/items accept names or indices, params are range-checked, unknown ops are rejected with a path). The format below is a public interface:

```ts
{
  id: 'hero', label: 'The RED → LEMON lesson',
  level: 'plastic',
  params: { gamma: 0.55, lambda: 0.08, cueNoise: 0 },
  watch: { cue: 0, item: 3 },          // synapse the charts follow
  target: { cue: 0, item: 3, label: 'RED → LEMON (taught in-session)' },
  script: [                            // each op = one tick, except query (instant)
    { k: 'teach', cue: 0, item: 3 },   //   co-activate → F += γ·x⊗h, all F ×(1−λ)
    { k: 'idle',  n: 4 },              //   n ticks of pure forgetting
    { k: 'query', cue: 0, expected: 3, tag: 'still remembered?' },
  ],
  autoHz: 1.6,
}
```

Cues: `RED, BLUE, GREEN, GOLD, VIOLET, CYAN` · Items: `APPLE, BERRY, LEAF, LEMON, GRAPE, STONE` · Pre-trained default: RED→APPLE, BLUE→BERRY, … — every index maps to the same labels in UI, engine and tests.

**Architecture:** `useSession` (React hook) owns one runner per lab and publishes immutable snapshots; `Lab`/`Tour`/`Sandbox` are pure views over snapshot state; the play clock ticks the runner and pauses at the exact end of narration; learner clicks take over from any running script (state preserved). Tour beats carry explicit gates (script done / N writes / probe-crossing) so the story cannot run ahead of understanding.

## Files

```
src/sim/engine.ts     toy AssociativeNet + determinism + journal + export
src/sim/runner.ts     script runner (preset → timed operations)
src/sim/presets.ts    11 experiment presets (pure data)
src/ui/useSession.ts  React binding, play clock, take-over, knobs
src/ui/Lab.tsx        the instrument (graph, matrix, trace, memory-test panel)
src/ui/Tour.tsx       guided beats, gates, challenges
src/ui/Sandbox.tsx    scenario picker + free control + export
src/ui/Research.tsx   BDH / comparison / evidence / limits module
tests/                21 unit tests (engine + preset-loader validation)
scripts/e2e-verify.mjs 44-check browser QA
```

## Honest-AI disclosure

This project was built in an AI-assisted agentic workflow: architecture, copy, engine math and visual design were produced and iterated with an LLM agent under human direction, with every scientific claim checked against the primary sources cited above (PDFs of arXiv:2206.14048 and arXiv:2509.26507; the Nature Communications article page). Standard practice for this competition: code and text are released as-is under the license below, with this disclosure kept in the repository.

## License

MIT — see [LICENSE](LICENSE). Third-party code: none bundled; React/Vite toolchain under their own licenses.
