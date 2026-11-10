# IT Project Control

[Español](README.md) · **English**

A static, interactive page (Spanish UI) with two project-management tools built from real Systems Engineering coursework:

- **A. Risk board.** A 12-risk register per case, a clickable probability × impact heat map, category and strategy filters, per-risk detail (trigger, response, contingency, owner role, KPI) and a "what if I apply the response?" panel that **does not invent residual risk**: the source does not provide it, so visitors can enter their own hypothesis, clearly labelled as such.
- **B. Earned value (EVM) simulator.** Move each sprint's completed story points and actual cost and watch PV, EV, AC, CV, SV, CPI, SPI, EAC, ETC, VAC and TCPI update live, with a hand-made SVG S-curve chart and a traffic light.

It also ships an **errata** section listing the inconsistencies found in the source documents instead of hiding them.

## Data provenance

- Case 1: risk management plan (PMBOK 7 + ISO 31000) for a regional managed-services and data-center provider (anonymized case study).
- Case 2: risk-matrix workshop for an academic management web system.
- EVM: agile exercise for a logistics company (teaching case): 24 SP, 8 SP/sprint, 3 sprints, USD 5,800 per sprint, BAC USD 17,400; status at Sprint 2: 14 SP done, USD 12,500 spent.

The tests reproduce the source results: PV 11,600 · EV 10,150 · AC 12,500 · CV −2,350 · SV −1,450 · CPI 0.812 · SPI 0.875 · EAC 21,428.57 USD.

## Run locally

```bash
python3 -m http.server 8000   # then open http://localhost:8000
node --test                   # tests (Node 20+)
```

No build step: GitHub Pages can serve `main` from the root.

## Credits

Academic work by Mario Puerta and David Rincón "Kuronoma" (Systems Engineering, Universidad ECCI). [David Rincón "Kuronoma" on LinkedIn](https://www.linkedin.com/in/davidalexanderrinconcorredorkuronoma/).

MIT License © 2026 Mario Alejandro Puerta Alarcón.
