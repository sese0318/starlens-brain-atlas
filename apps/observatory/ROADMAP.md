# From pattern comparison to an inspectable workflow

The four parcels follow the dependency order of one workflow. Each adds a capability that can be exercised at that stage. The source was largely prepared locally before these releases; the timeline records staged publication and actual corrections.

## 01: Establish the calculation

**Question:** Which reference patterns resemble a regional observation?

**Capability:** rank signed Spearman associations by their absolute magnitude and inspect sensitivity to omitting a region. Use the deterministic fixture as the baseline.

**Evidence:** `npm run demo` returns 82 regions, 30 maps and five leading associations. Numerical tests check known ranks, signs and hand worked sensitivity cases.

**Remaining limitation:** an association alone does not tell us whether useful function is preserved. This motivates parcel 02.

## 02: Test the interpretation

**Question:** Does an unchanged structural pattern necessarily imply the same functional output?

**Capability:** construct two states under a stated observation model, compare their useful outputs and examine a hypothetical additional measurement.

**Evidence:** `npm run states` gives default outputs 1.008 and 0.576 with identical structural observations. `npm run reference` independently checks the state arithmetic in Python. Equal gain is a negative control; noise changes and threshold substitution test the model's behavior. Missing parameters and unrepresentable results must fail clearly.

**Remaining limitation:** the example is synthetic and fixed. Parcel 03 makes the regional comparison reusable with validated local inputs. It does not estimate the toy state parameters from those inputs.

## 03: Make the input path usable

**Question:** Can another researcher run the same regional comparison on an aligned bundle?

**Capability:** validate the bundle, select a profile and run the existing comparison from the command line. An optional local converter handles the two precisely audited aggregate CSVs.

**Evidence:** `npm run compare` must reproduce the parcel 01 ranking on the same fixture. Loading that fixture from JSON must preserve the result. Misaligned arrays, unknown profiles, nonfinite values, changed source hashes and reordered regions must fail before producing a result. Tests use temporary invented files.

**Remaining limitation:** commands are inspectable but require familiarity with the files. Parcel 04 exposes the same functions through a local interface.

## 04: Assemble the complete local prototype

**Question:** Can a teammate inspect the full workflow without editing source code?

**Capability:** show molecular comparisons, competing model states, measurement comparison, local input selection and evidence export through one interface. The interface uses the already released numerical functions and validator.

**Evidence:** a clean install builds; the earlier tests still pass; the local interface reproduces the default outputs. The equal gain control removes functional separation. Importing an invalid file is rejected, restoring the synthetic example works, and exported evidence describes the current parameters and provenance.

**Completion:** all files in the final source manifest are present, setup commands work and the README matches the release.

## Publication schedule

All times use Boston local time.

| Parcel | Publication target |
| --- | --- |
| 01 | Published 12 September |
| 02 | Published 13 September; numerical review recorded in CHANGELOG.md |
| 03 | Published 13 September, 19:46 |
| 04 | 14 September, 02:14 |
| Final verification | 14 September, 21:59 |

The final verification checks the complete version and applies `checkpoint-final`; it is not a fifth code parcel. Do not describe a repeated snapshot as new functionality. Preserve tags and commit history, including the earlier documentation snapshot identified by `checkpoint-24h`.

## Evidence boundaries

The state model is an illustration under explicit assumptions, not a measured biological state or a treatment recommendation. The local importer uses a pinned research revision and grants no access or redistribution rights. Publication order does not change the origin of prior research or previously written code.

The [Life Sciences brief](https://docs.google.com/document/d/1NhHbo8ccaufwQraju_mApEUghlrkpl5V/edit) asks for inspectable evidence, assumptions, sources and a useful next test. This repository progression follows those goals. The [organizer's Discord clarification](https://discord.com/channels/1547616640559218718/1547628793982885990) accepts the public repository link alongside the checkpoint video; folder delivery is handled separately from this GitHub workflow.
