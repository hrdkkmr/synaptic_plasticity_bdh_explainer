# Synaptic Plasticity as Short-Term Memory

## Central claim

**A neural network can use temporary changes in connection strength as short-term memory: recent activity modifies synapses, and those modified connections can influence a later prediction without permanently changing the model's learned parameters.**

### From stored tokens to changing connections

A Transformer normally keeps information about earlier tokens in an inference-time key–value (KV) cache. The model parameters remain fixed while the cache grows with the sequence. Synaptic-memory approaches use a different design pressure: instead of treating context only as an external sequence of stored representations, the network can let recent activity modify an internal state associated with its connections.

Synaptic plasticity is the ability of synapses to change their effective strength as a function of neural activity. Computational models show that such rules can support online learning and context adaptation. For example, Zheng et al. constructed a recurrent PFC–MD model in which Hebbian plasticity between regions allowed rapid online context inference and reduced interference when contexts changed. Mehta et al. similarly showed that plasticity rules can be inferred computationally from neural or behavioral trajectories and can contain non-trivial temporal dynamics, including active forgetting.

The important computational distinction is therefore **where temporary information lives**. In a conventional Transformer, the inference state is represented primarily by activations and the growing KV cache. In a plastic network, part of the temporary context can instead be represented by evolving connection state.

### A minimal mechanism

This submission isolates that idea in a deterministic toy network. We separate a relatively stable connection component, **W**, from a temporary activity-dependent component, **F**. The effective connection used by the toy model is:

**G = W + F**

The temporary component is updated after activity:

**F(t+1) = γ · (x ⊗ h) + (1 − λ) · F(t)**

where `x` represents current activity, `h` represents the associated state, `γ` controls the strength of the new write, and `λ` controls decay. Thus, recent co-activity writes information into `F`, while time without reinforcing activity causes that information to fade.

The interactive experiment makes this state visible rather than presenting an animation as evidence. Teaching the association **RED → LEMON** repeatedly strengthens the corresponding temporary connection. A subsequent RED probe therefore predicts LEMON. After repeated idle/decay steps, `F` decreases and the prediction can return to the baseline association. Changing `λ` changes how quickly the temporary memory disappears.

This is an **educational abstraction**, not an equation claimed to reproduce biological synapses or the complete BDH algorithm.

### Where this sits in BDH

The connection to Dragon Hatchling (BDH) is more specific than simply saying that BDH is “brain-inspired.” The BDH paper describes a neuron–synapse architecture in which working memory during inference relies on synaptic plasticity with Hebbian learning, and reports that individual synapses can strengthen when the model processes particular concepts.

Our toy therefore reproduces the **conceptual mechanism**—activity-dependent synaptic state influencing subsequent computation—at a much smaller scale. It does **not** reproduce BDH's neuron graph, training procedure, full inference mechanism, scale, or parameterization. The RED → LEMON system is an independent educational implementation.

BDH-CQ is related but should not be treated as the same mechanism. BDH-CQ extends the family toward **in-context learning with recurrent latent reasoning**: inputs presented during inference continuously update recurrent memory, after which the model performs iterative computation in latent space. Its role here is to show the broader architectural direction—information presented at inference can modify recurrent internal state rather than requiring permanent parameter updates. The specific synaptic-plasticity mechanism demonstrated in this explainer is grounded primarily in BDH, not in BDH-CQ.

### What the evidence does—and does not—show

| System / study | Temporary adaptation mechanism | What the evidence establishes |
|---|---|---|
| **Transformer** | Activations + KV cache | Strong established baseline for sequence-context storage; the cache grows with retained context. |
| **BDH** | Synaptic plasticity / Hebbian state | The authors report Transformer-like performance at matched parameter counts in language/translation experiments and demonstrate synapses strengthening around processed concepts. This is **developer-reported evaluation**, not independent reproduction. |
| **BDH-CQ** | Recurrent latent memory | Demonstrates inference-time memory updates and latent reasoning; its reported ARC-AGI results are evidence for that system, not proof that synaptic plasticity is universally superior. |
| **PFC–MD model** | Hebbian synaptic plasticity | A separate computational study shows rapid context inference and reduced interference in sequential tasks. This supports the computational plausibility of plasticity, not BDH itself. |

The key limitation is therefore **evidence scope**. Existing results do not establish that synaptic memory is categorically better than Transformer KV caching, recurrent state, or other memory mechanisms. BDH's reported scaling and task results are promising, but independent reproduction and systematic comparisons of memory capacity, interference, latency, and inference cost remain important. Our toy is even narrower: it demonstrates the write–use–decay mechanism, not human memory and not BDH-scale performance.

The learner can reproduce the central claim in under a minute: **teach RED → LEMON, probe, apply decay, and probe again.** What changes is not the permanent model knowledge, but the temporary connection state that carries recent experience.

### Primary sources

[1] Kosowski, A. et al. (2025). *The Dragon Hatchling: The Missing Link between the Transformer and Models of the Brain.*

[2] Zheng, W.-L. et al. (2024). *Rapid context inference in a thalamocortical model using recurrent neural networks.* Nature Communications 15, 8275.

[3] Mehta, Y. et al. (2024). *Model-based inference of synaptic plasticity rules.* NeurIPS 37, 48519–48540.

[4] Engdahl, B. et al. (2026). *BDH-CQ: In-Context Learning with Recurrent Latent Reasoning.*