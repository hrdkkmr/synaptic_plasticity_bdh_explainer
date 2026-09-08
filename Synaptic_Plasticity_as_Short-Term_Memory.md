# Synaptic Plasticity as Short-Term Memory

## The central idea

Neural networks need a way to retain information temporarily while
processing a sequence of inputs. One possible mechanism is **synaptic
plasticity**: recent activity temporarily changes the strength of
connections between neurons, allowing the network's current connectivity
to carry short-lived information.

> **Central claim:** Recent correlated activity can be stored as a
> temporary synaptic state **F**, changing the effective connection **G
> = W + F** and therefore influencing later computation until **F**
> decays.

In this formulation, **W** represents the relatively stable, long-term
component of a connection, while **F** represents an activity-dependent
temporary trace. The learner can therefore see memory being written into
connections, used by the network, and gradually forgotten.

## Why this matters

A central challenge in neural computation is separating information that
should persist from information that should remain temporary.
Transformer models commonly retain context through mechanisms such as
the key-value cache, while other recent architectures explore memory
mechanisms that are more tightly integrated with computation.

The **Dragon Hatchling (BDH)** architecture is particularly relevant
because its formulation describes working memory during inference in
terms of synaptic plasticity and Hebbian learning. The BDH paper
describes a biologically inspired graph of locally interacting neuron
particles in which synaptic strengths can change as the model encounters
concepts. Our explainer isolates this idea in a deliberately small,
inspectable model rather than attempting to reproduce the complete BDH
architecture. \[1\]

## The mechanism

The explainer uses a simple RED → LEMON association to make the
mechanism observable.

The learner first activates the RED pattern. Correlated activity
produces a Hebbian-style write into the temporary synaptic state:

**F(t+1) = γ · (x ⊗ h) + (1 − λ) · F(t)**

where:

-   **F** --- temporary, activity-dependent synaptic state
-   **W** --- stable connection component
-   **G** --- effective connection used for computation, **G = W + F**
-   **γ** --- learning/write strength
-   **λ** --- decay/forgetting rate
-   **x** --- current input activity
-   **h** --- neuron activity involved in the interaction

Repeated RED → LEMON activity therefore increases the temporary
contribution **F**. When the learner probes the network immediately
afterward, the model is expected to produce **LEMON**.

The important part is that the learned association does not need to
become a permanent change to influence the next computation. When
activity stops, **F decays**. After sufficient idle time, the same probe
can return **APPLE**, demonstrating the intended short-term-memory
behavior.

The explainer makes this state visible rather than hiding the
computation behind a single output. The learner can watch the RED
activation propagate, see the RED → LEMON synapse strengthen, observe
**F** increase, and see the effective connection **G** change.

## Where this fits in BDH

The relationship can be viewed schematically as:

**Neuron activity → synaptic interaction → temporary synaptic state →
changed effective computation**

This is a **conceptual reduction of the BDH neuron-synapse idea, not an
implementation of the full BDH model**. The complete BDH architecture
contains substantially more structure, including its graph organization
and neuron-particle formulation. The purpose here is to isolate one
mechanism so that a learner can manipulate it and directly observe its
consequences. \[1\]

BDH-CQ is related but should not be treated as identical to this
mechanism. Its work describes recurrent latent reasoning in which inputs
continuously update recurrent memory during inference. This provides a
useful architectural comparison, while the present explainer focuses
specifically on temporary synaptic state as the memory substrate. \[2\]

## What the learner can reproduce

The experiment is designed around a short causal sequence:

1.  **Teach:** activate RED → LEMON repeatedly.
2.  **Observe:** the relevant synapse strengthens and **F** increases.
3.  **Probe:** the expected output is LEMON and the model predicts
    LEMON.
4.  **Idle:** stop activity and allow **F** to decay.
5.  **Probe again:** the expected output remains LEMON, but the model
    can return APPLE after the temporary trace has faded.
6.  **Adjust:** change **γ** to alter the strength of writing and **λ**
    to alter the rate of forgetting.

This makes the claim testable rather than merely descriptive: the
learner changes a real simulation variable and observes the resulting
change in state and prediction.

## Evidence and limitations

The BDH primary paper provides the direct architectural motivation for
connecting synaptic plasticity, Hebbian learning, and working memory in
BDH. \[1\] Broader computational research also studies how synaptic
plasticity rules can be inferred and represented computationally,
showing that plasticity can be treated as an explicit dynamical
mechanism rather than only as a biological metaphor. \[3\]

However, this explainer is intentionally a **toy model**. It does not
reproduce BDH's full scale, topology, training procedure, or reported
performance. Its equations and RED → LEMON task are an independent
educational reduction designed for transparency and interaction. The
demonstration therefore supports understanding of the mechanism, not a
claim that the toy system is equivalent to biological short-term memory
or the complete BDH implementation.

## Takeaway

A connection does not have to be permanently rewritten to influence what
happens next. Recent activity can leave a temporary trace in the
connection itself. Synaptic plasticity turns that trace into
computational state: **activity writes it, computation reads it, and
inactivity lets it fade**.

That is the core idea this explainer makes visible---and the reason
synaptic plasticity can serve as a short-term memory mechanism.

## References

1.  Kosowski et al. (2025). *The Dragon Hatchling: The Missing Link
    between the Transformer and Models of the Brain*. arXiv:2509.26507.
    https://arxiv.org/abs/2509.26507
2.  Engdahl et al. (2026). *BDH-CQ: In-Context Learning with Recurrent
    Latent Reasoning*. arXiv:2608.09888.
3.  Mehta, Y. et al. (2024). *Model-based inference of synaptic
    plasticity rules*. NeurIPS 2024, 48519--48540. DOI:
    10.52202/079017-1537.
