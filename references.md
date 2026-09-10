# References & Evidence

This document records the primary research sources used to support the
technical claims made in Synaptic Plasticity as Short-Term Memory.

The interactive experiment is an independent educational toy model. It is
not a reproduction of the full Dragon Hatchling (BDH) architecture.

---

## [1] The Dragon Hatchling — BDH

**Kosowski, A., Uznański, P., Chorowski, J., Stamirowska, Z., & 
Bartoszkiewicz, M. (2025).**

**The Dragon Hatchling: The Missing Link between the Transformer and
Models of the Brain.**

arXiv:2509.26507.

https://arxiv.org/abs/2509.26507

### What this source supports

This is the primary source for the project's connection to Dragon
Hatchling (BDH).

The paper introduces BDH as a biologically inspired architecture based
on locally interacting neuron particles. It describes BDH's working
memory during inference as relying on synaptic plasticity with Hebbian
learning and reports that individual synapses can strengthen when BDH
processes particular concepts.

### Used in this project for

- Explaining why synaptic plasticity is relevant to BDH.
- Introducing the idea of synaptic state as part of working memory.
- The "YOU ARE HERE" placement of this educational experiment within
  the broader BDH concept.
- Distinguishing the toy experiment from the complete BDH architecture.

### Important scope distinction

This project does **not** claim to implement BDH.

The variables `W`, `F`, and `G = W + F` are part of this project's
educational abstraction. They should not be interpreted as a complete
statement of the BDH architecture or as an official BDH equation.


---

## [2] Model-based inference of synaptic plasticity rules

**Mehta, Y., Tyulmankov, D., Rajagopalan, A. E., Turner, G. C.,
Fitzgerald, J. E., & Funke, J. (2024).**

**Model-based inference of synaptic plasticity rules.**

Advances in Neural Information Processing Systems 37 (NeurIPS 2024),
48519–48540.

DOI: 10.52202/079017-1537

https://proceedings.neurips.cc/paper_files/paper/2024/file/571082ea18d30060177dfcaf662ff0e5-Paper-Conference.pdf

### What this source supports

This work studies synaptic plasticity as computational rules that
modify synaptic state in response to neural activity and other
variables.

The authors develop a computational framework for inferring plasticity
rules from neural and behavioral data and show that learned rules can
produce complex temporal dynamics, including forgetting.

### Used in this project for

- Framing plasticity as an activity-dependent computational update.
- Supporting the idea that synaptic state can evolve over time.
- Supporting the educational treatment of plasticity as a dynamic
  process rather than simply a permanently learned parameter.
- Providing scientific context for the write/decay behavior used by
  the toy model.

### Scope distinction

The update rule implemented in this project is intentionally simpler
than biological plasticity rules studied in the literature. It is an
educational reduction, not a fitted biological plasticity rule.


---

## [3] Rapid context inference using Hebbian plasticity

**Zheng, W.-L., Wu, Z., Hummos, A., Yang, G. R., & Halassa, M. M. (2024).**

**Rapid context inference in a thalamocortical model using recurrent
neural networks.**

Nature Communications, 15, 8275.

DOI: 10.1038/s41467-024-52289-3

https://doi.org/10.1038/s41467-024-52289-3

### What this source supports

This work presents a computational PFC-MD neural network model using
Hebbian synaptic plasticity for rapid, online context inference.

The model uses plasticity between neural populations to integrate
recent activity and infer temporal context. The authors also study
how such mechanisms can support continual learning across sequential
tasks.

### Used in this project for

- Providing an independent computational example of Hebbian plasticity.
- Supporting the idea that activity-dependent synaptic changes can
  encode information about recent context.
- Providing context for the relationship between plastic synaptic
  state, recent activity, and subsequent computation.

### Scope distinction

The architecture and plasticity mechanisms in this paper are different
from the simplified RED → LEMON experiment implemented here.


---

## [4] BDH-CQ — Related BDH research

**Engdahl, B., Kosowski, A., Chorowski, J., Stamirowska, Z.,
Uznański, P., Jiang, J., Phadke, R., Kinas, R., & Zhong, R. (2026).**

**BDH-CQ: In-Context Learning with Recurrent Latent Reasoning.**

arXiv:2608.09888.

https://arxiv.org/abs/2608.09888

### What this source supports

BDH-CQ is a related development from the BDH research line. It studies
in-context learning through recurrent latent reasoning and continuously
updated recurrent memory during inference.

### Used in this project for

- Providing current context around the BDH research direction.
- Distinguishing newer recurrent-memory work from the specific
  synaptic-plasticity mechanism demonstrated in this toy.

### Important distinction

BDH-CQ is **not** used as evidence that the RED → LEMON toy model is
an implementation of BDH-CQ.

The two mechanisms should be treated as related but distinct.


---

## [5] Short-Term Plasticity Neurons — Computational synaptic memory

**Rodriguez, H. G., Guo, Q., & Moraitis, T. (2022).
Short-Term Plasticity Neurons Learning to Learn and Forget.**

Proceedings of the 39th International Conference on Machine Learning (ICML),

PMLR 162, 18704–18722.

[https://proceedings.mlr.press/v162/rodriguez22b.html](https://proceedings.mlr.press/v162/rodriguez22b.html)

### What this source supports

This work introduces Short-Term Plasticity Neurons (STPNs), computational
neural units in which synapses maintain a dynamic state that evolves over
time. The resulting synaptic state can support short-term learning and
forgetting, providing a computational example of memory stored in
time-varying synaptic dynamics.

### Used in this project for

- Supporting the computational framing of synaptic state as a form of
  temporary, decaying memory.
- Motivating the use of an explicit activity-dependent synaptic state
  that changes over time and can subsequently decay.
- Providing prior research context for the toy plasticity mechanism
  demonstrated in this explainer.

### Important distinction

STPNs are **not** implemented in this project.
The RED → LEMON experiment is an independently implemented,
deterministic educational reduction using its own simplified write and
decay rule. It is designed to make the idea of temporary synaptic state
observable and should not be interpreted as a reproduction of the STPN
architecture or experiments.

---

# Citation usage in the project

Technical claims in the learner-facing README and concept summary
should use these reference numbers beside the claim they support.

Examples:

> BDH uses synaptic plasticity as part of its working memory during
> inference. [1]

> Computational models have demonstrated that Hebbian plasticity can
> support rapid online context inference. [3]

> Synaptic plasticity can be represented computationally as activity-
> dependent rules that modify synaptic state over time. [2]

The project does not use these papers as evidence that the exact toy
equations are biologically complete.

---

# Evidence policy

The following distinction is maintained throughout the project:

**Research-backed claim**
A claim directly supported by a cited research source.

**Educational abstraction**
A simplification introduced by this project to make a mechanism
observable in an interactive experiment.

**Project result**
A behavior produced by the toy implementation itself.

These categories should not be presented as interchangeable.