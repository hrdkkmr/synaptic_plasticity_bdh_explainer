# Development & AI Assistance Disclosure

## Project

**Synaptic Plasticity as Short-Term Memory**

This document records the use of AI assistance, external research,
code, data, models, and visual assets during development.

---

## 1. AI Assistance

AI tools were used as development and writing assistants during the
creation of this project.

AI assistance was used for:

- exploring and refining the educational framing of synaptic plasticity;
- discussing the relationship between synaptic plasticity and BDH;
- suggesting UI structure and interaction patterns;
- drafting and refining explanatory text;
- drafting README and documentation material;
- implementation and refactoring guidance;
- debugging assistance;
- reviewing wording for clarity and accessibility.

The final project decisions, implementation, scientific scope, and
submission materials were reviewed by the project team.

AI assistance was not treated as a primary scientific source.

Scientific claims are supported by the research sources listed in
`REFERENCES.md`.

---

## 2. AI-Assisted Code

AI assistance may have contributed suggestions or code during
implementation and refactoring of the application.

All AI-assisted code used in the final project was reviewed and
integrated into the project by the team.

The team is responsible for understanding and defending the final
implementation.

The core educational simulation is a deterministic toy model created
for this project.

It is not an AI-generated pretrained model or external neural-network
checkpoint.

---

## AI assistance disclosure

AI tools were used during development for:

- conceptual exploration and discussion of synaptic plasticity, working memory, BDH, and related literature;
- UI and interaction design ideation;
- implementation and refactoring guidance;
- debugging and code-review assistance;
- accessibility and explanatory wording;
- README, concept-summary, provenance, and disclosure drafting.

AI-generated suggestions were reviewed and adapted by the project team. Final decisions about the scientific scope, educational abstraction, implementation, experiments, claims, and presentation were made by the project team.

AI tools were not treated as primary scientific sources. Scientific claims were checked against the cited research papers listed in `references.md`.

The simulation is deterministic and project-created. It does not use proprietary training data, external user data, or pretrained model weights.

All visual elements in the explainer are generated through the project's React/CSS/SVG/programmatic rendering. No third-party copyrighted illustrations or photographs are required by the simulation.

The project is an independent educational implementation and is not an official BDH implementation, publication, or affiliated/endorsed artifact.

---

## 4. External Code

The project uses standard open-source web-development dependencies
declared in `package.json` and the project's dependency lockfile.

No external project is presented as original project code.

Where external source code or components are directly reused in the
application, their source and license are recorded in `PROVENANCE.md`.

---

## Research sources and scientific basis

The project draws on five primary research sources listed in `references.md`:

1. Kosowski et al. (2025) — Dragon Hatchling (BDH), including inference-time working memory through activity-dependent synaptic plasticity.
2. Mehta et al. (2024) — biological and computational perspectives relevant to learning and memory.
3. Zheng et al. (2024) — research relevant to synaptic plasticity and memory mechanisms.
4. Engdahl et al. (2026) — BDH-CQ and related continuation of the BDH research direction.
5. Rodriguez, Guo & Moraitis (2022) — short-term plasticity / synaptic state mechanisms.

Research papers are used as scientific evidence for the concepts and claims stated in the explainer. The project does not claim to reproduce the full models, experiments, or architectures described in these papers.

In particular, the following are educational abstractions created for this project:

- `W` as a relatively stable connection component.
- `F` as a temporary activity-dependent synaptic state.
- `G = W + F` as the effective connection used by the toy model.
- `F(t+1) = γ·(x ⊗ h) + (1 − λ)·F(t)` as the deterministic update rule.
- The RED → LEMON association and APPLE fallback experiment.

These equations and variables should not be interpreted as official BDH equations or as a complete biological model of synaptic plasticity.

Full references and the specific role of each source are documented in
`REFERENCES.md`.

---

## 6. Data Disclosure

The interactive experiment does not use a proprietary or external
training dataset.

The displayed experiment is generated from a small deterministic toy
simulation.

The project does not collect or process personal user data as part of
the synaptic-memory experiment.

No private dataset was used to produce the displayed results.

---

## 7. Model / Weight Disclosure

The project does not include pretrained model weights.

No external LLM checkpoint, image-generation checkpoint, classifier,
or other pretrained model is required to run the interactive demo.

The toy model's `W` and `F` values are computational state variables
defined by the project.

---

## 8. Graphics and Asset Disclosure

The core learner-facing visuals are generated by the project using
web technologies such as React, CSS, SVG, and programmatic rendering.

No external stock photography is required for the core experiment.

Any third-party icons, illustrations, or visual components added to the
submission must be recorded in `PROVENANCE.md` together with their
source and license.

---

## 9. Font Disclosure

The interface uses the system font stack:

    Calibri, Segoe UI, Arial, sans-serif

No font files are redistributed by the project.

---

## 10. BDH Attribution and Scope

The project is inspired by and references the Dragon Hatchling (BDH)
research.

BDH is the work described by the authors cited in `REFERENCES.md`.

This project is not an official BDH implementation and is not affiliated
with or endorsed by the authors of the BDH papers unless explicitly
stated otherwise.

The interactive RED → LEMON experiment is an independent educational
toy model.

In particular, the following equations:

    G = W + F

and:

    F(t+1) = γ · (x ⊗ h) + (1 − λ) · F(t)

are simplified equations introduced by this project.

They should not be interpreted as the complete equations or
implementation of BDH.

---

## 11. Scientific-Claim Disclosure

The project intentionally separates three kinds of statements.

### Literature-backed claims

Claims supported by published research and cited in `REFERENCES.md`.

### Model abstractions

Simplifications introduced by this project to make a mechanism
observable in an interactive experiment.

### Experiment results

Behavior directly produced by the interactive toy simulation.

The project does not present the behavior of the toy simulation as
experimental evidence about human brains.

---

## 12. Human Responsibility

The project team is responsible for:

- the final source code;
- the interactive experiment;
- parameter choices;
- educational claims;
- interpretation of the experiment;
- citations;
- provenance records;
- licensing disclosures;
- final submission materials.

The team understands the distinction between the toy model and the
research systems it references and is prepared to explain the
implementation during evaluation.