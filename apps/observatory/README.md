# DopaTeam

Life Sciences · Code parcel 04 of 04 · Complete local prototype

[GitHub](https://github.com/Rifelimo/DopaTeam) · [Project presentation](https://dopateam.vercel.app) · [Release history](CHANGELOG.md)

DopaTeam explores how regional brain patterns can inform a next research question. We start with a descriptive comparison, show why that comparison alone does not determine function in an explicit model, then make the same workflow usable with aligned local inputs and an interactive view.

The portable example uses invented values. It supports inspection of the method and its assumptions; it does not reproduce the research article or identify an effective medicine.

## Results at a glance

- The regional comparison runs on 82 synthetic regions and 30 synthetic reference maps. The strongest example association is 0.818. Loading the same example from a local file gives the same result.
- With identical observed inputs, the model produces functional outputs of 1.008 and 0.576 when the assumed response gains differ. Setting the gains equal removes the difference.
- The local interface brings the comparison, model, input validation and export together. The exported report includes the parameters and results, without the raw imported value arrays.
- Verification passed: 42 automated tests, ten browser workflow checks and the production build.

These are reproducible software and simulation results. The model parameters were not fitted to patients, and no treatment benefit was tested.

## Run the current release

Node.js 22.12 or later and Python 3.10 or later. The command line calculations use built in libraries.

```sh
npm run demo
npm run states
npm run reference
npm run compare
```

What to look for:

- **Map comparison:** 82 invented regions, 30 invented maps and five leading associations. The first map is `reference-17`, with signed correlation about `0.818308`. The sensitivity range is not a confidence interval.
- **State comparison:** the same structural inputs accompany model outputs `1.008` and `0.576`. This happens because the model contains an unobserved response gain. It illustrates a limitation of the stated observation model.
- **Independent reference:** Python reproduces the default state outputs and the `4.32` difference divided by assumed noise. Its regional fixture is separate; do not compare its map rankings with the JavaScript fixture. Model time is arbitrary, not years.

Read [THEORY.md](THEORY.md) for the equations, assumptions and what this example can establish.

## Compare your own aligned inputs

```sh
npm run compare -- --input /path/to/bundle.json --profile AD_vs_CN
```

Use an authorized local bundle with the specified profile. The command checks the input before calculating results. It prints only a local comparison and never uploads the file. The [local import guide](docs/local-import.md) covers the audited CSV converter, required alignment and source revision. Standard tests need no research access.

## Run the interactive prototype

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5184/prototype.html. The three views let you compare maps, vary the hypothetical states and inspect which measurement separates the constructed pair. They use the same numerical functions and input validator as the command line checks.

```sh
npm run build
npm run preview
```

The build writes `prototype-dist/`; preview serves `/prototype.html`. The presentation at `index.html` has a separate purpose and remains unchanged by these code releases.

## Verify the release

```sh
npm test
npm run test:python
```

Checks cover known rank examples, unchanged descriptors under alternate model gains, threshold substitution, controls with equal gains, invalid inputs and agreement between JavaScript and Python. Later releases retain these checks and add tests for their own input and interface paths. Software checks do not establish biological validity.

## How the code grows

| Parcel | Capability | Status in this release |
| --- | --- | --- |
| 01 | Rank regional patterns and inspect sensitivity | Available |
| 02 | Test the limits of interpreting a fixed pattern | Available |
| 03 | Validate and compare local input bundles | Available |
| 04 | Explore the same functions in one interface | Available |

**Next:** perform the final source and reproducibility check before tagging `checkpoint-final`.

[ROADMAP.md](ROADMAP.md) explains why each step follows the previous one, its acceptance criteria and publication time. Each version is cumulative. Existing implementation is published gradually with its origin recorded; publication dates do not imply new experiments or new dates for earlier research.

## Team and scientific basis

Ricardo Félix Morais leads DopaTeam with Alex Chen and Seika Karamatsu. Ricardo is a neuroradiologist, researcher and MIT Sloan Fellows MBA student. Codex assisted with code, documentation and review.

The scientific background includes Ricardo's [2025 Neurobiology of Disease paper](https://pubmed.ncbi.nlm.nih.gov/40194635/) and the separate 2026 manuscript on neurochemical and cellular vulnerability by João Valério Rocha, João Paulo Silva Cunha and Ricardo Félix Morais. These studies motivate the question; they do not validate the illustrative model. [PROVENANCE.md](PROVENANCE.md) identifies the prior research and the source of this implementation.

The public package contains no original MINNT notebook, participant record or research value array. GitHub is this workflow's scope. Checkpoint folder submission and video are handled separately.

## Methods and verified results

Read [the detailed technical report](docs/METHODS_AND_RESULTS.md) for the calculations, numerical results, input checks, interface behaviour and validation of this final code package.
