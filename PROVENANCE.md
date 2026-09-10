# Provenance

This document records the provenance of the scientific sources, code, data, models, visual assets, dependencies, and project-created educational material used in **Synaptic Plasticity as Short-Term Memory**.

## 1. Project

**Project:** Synaptic Plasticity as Short-Term Memory  
**Repository:** `hrdkkmr/synaptic_plasticity_bdh_explainer`  
**License:** MIT License — Copyright (c) 2026 Hardik Kumar

The project is an independent educational interactive explainer. It isolates one computational idea—activity-dependent synaptic state contributing to short-term/working-memory-like behavior—and makes that mechanism observable through a small deterministic simulation.

## 2. Research sources

The scientific basis for the explainer is documented in `REFERENCES.md`.

The project uses the following primary research sources:

1. **Kosowski et al. (2025)** — Dragon Hatchling (BDH), including inference-time working memory through activity-dependent synaptic plasticity.
2. **Mehta et al. (2024)** — research relevant to learning, memory, and neural computation.
3. **Zheng et al. (2024)** — research relevant to synaptic plasticity and memory.
4. **Engdahl et al. (2026)** — BDH-CQ and related BDH research.
5. **Rodriguez, Guo & Moraitis (2022)** — short-term plasticity and synaptic state.

These papers provide scientific context and evidence for claims made in the explainer. They are not source code, datasets, or model weights used by the project.

Full bibliographic information and evidence mapping are provided in `REFERENCES.md`.

## 3. Project-created educational model

The following components were created specifically for this project:

- the RED → LEMON teaching/probing experiment;
- the APPLE baseline used for the post-decay comparison;
- the deterministic simulation engine;
- the `W`, `F`, and `G` state representation;
- the effective connection definition `G = W + F`;
- the update rule:

  `F(t+1) = γ·(x ⊗ h) + (1 − λ)·F(t)`

- the decay/idle mechanism;
- the expected-vs-model comparison;
- the interactive visualization;
- the guided educational tour and progressive explanation.

`W`, `F`, and `G = W + F` are an educational abstraction created for this project. They are **not presented as official BDH notation or as a complete mathematical description of BDH**.

The RED → LEMON experiment is an independent deterministic educational reduction. It does not reproduce the complete BDH architecture, training procedure, or experimental results.

## 4. Data

No external or proprietary dataset is used by the core simulation.

The RED → LEMON and APPLE examples are deterministic, project-defined inputs. The simulation does not require user-provided data and does not use personal data as part of its learning mechanism.

## 5. Model weights

The project does not contain or distribute pretrained model weights.

The interactive experiment is a deterministic educational simulation rather than a trained neural network.

No claim is made that the toy simulation has the capabilities, scale, or behavior of a trained BDH system.

## 6. Graphics and visual assets

The interface and simulation visuals are generated using the project's React, CSS, SVG, and programmatic rendering.

No external stock photographs or third-party illustration assets are required for the core explainer.

The visual design, diagrams, synapse visualization, state bars, network representation, and interaction states are project-created.

## 7. Fonts

The interface uses the system font stack specified by the project:

`Calibri, Segoe UI, Arial, sans-serif`

No font files are bundled with the project.

## 8. Software dependencies

Software dependencies are declared in `package.json` and locked in `package-lock.json`.

The project uses:

- React
- Vite
- TypeScript
- Vitest
- Playwright

Third-party packages retain their respective licenses as specified by their package metadata.

## 9. BDH relationship

This project is an independent educational reduction of one mechanism discussed in the BDH research: activity-dependent synaptic state contributing to working memory during inference.

The project is **not an implementation of BDH**.

Specifically:

- it does not reproduce the full BDH architecture;
- it does not reproduce the complete BDH learning or inference procedure;
- its equations and variables are educational abstractions;
- its RED → LEMON experiment is independently designed;
- it is not affiliated with, sponsored by, or endorsed by the BDH authors.

The project uses BDH as scientific and conceptual context, while keeping the distinction between published research and project-created educational mechanics explicit.

## 10. AI assistance

AI tools were used during development for conceptual exploration, implementation and refactoring guidance, debugging, UI/interaction design, accessibility wording, and documentation drafting.

AI tools were not treated as primary scientific sources. Scientific claims were checked against the research sources listed in `REFERENCES.md`.

Final decisions concerning the project's scientific scope, educational abstraction, implementation, experiments, and claims were reviewed by the project team.

Additional details are provided in `DISCLOSURES.md`.

## 11. Licensing and attribution

Project source code is released under the MIT License. See `LICENSE`.

Third-party software dependencies retain their respective licenses.

Research papers remain the property of their respective authors and publishers. They are cited as scientific references and are not redistributed as project assets.

The project does not claim ownership of the BDH research, terminology, or underlying scientific work.

## 12. Reproducibility

The project is intended to be reproducible from the public source repository.

The repository contains:

- application source code;
- simulation logic;
- tests;
- build configuration;
- dependency lockfile;
- README and educational documentation;
- research references;
- provenance and disclosure records.

The core experiment is deterministic: repeated teaching, probing, and decay under the same parameters produce the same simulation behavior.

## 13. Scope of provenance

This provenance record describes the origin and role of the principal scientific, computational, and visual components of the project. It should be read together with:

- `README.md` — project overview and setup;
- `REFERENCES.md` — detailed scientific references and evidence mapping;
- `DISCLOSURES.md` — AI assistance, data, asset, and development disclosures;
- `LICENSE` — project software license.
