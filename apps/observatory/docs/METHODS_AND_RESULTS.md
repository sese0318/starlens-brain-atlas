# DopaTeam: methods and results

Version 0.4.0 · Final local code package · Verified 14 September 2026

## What was built

A reproducible research prototype connects three tasks: comparing a regional pattern with reference maps, testing the limits of interpreting that pattern through an explicit model, and exploring the calculations in a local interface.

The result is executable software with documented assumptions, input validation, an independent numerical reference and tests. The numerical results below come from the supplied synthetic example. They are not measurements from patients or findings from a clinical study.

## 1. Create a reproducible input

The portable example contains 82 region identifiers, one structural profile and 30 reference maps. Fixed sine and cosine functions generate the values. Each vector is standardized by subtracting its mean and dividing by its population standard deviation. A constant vector is mapped to zeros by the standardization helper.

The same input is generated on every run. The region identifiers are synthetic labels, not anatomical coordinates. The reference maps are invented numerical patterns, not measured receptor distributions. Some maps deliberately share a component of the structural profile, so relatively strong correlations are expected by construction.

This fixture makes the calculations testable without access to research files. Its correlations should not be interpreted as evidence for a neurotransmitter pathway.

## 2. Calculate regional associations

For each reference map, the program calculates Spearman's rank correlation with the selected profile across the 82 aligned values. Tied values receive their average rank. Pearson correlation is then calculated between the two rank vectors.

Reference maps are sorted by absolute correlation. The signed coefficient is retained: a positive value indicates similar regional ordering, and a negative value indicates opposite ordering. Ties in ranking are resolved by identifier. Undefined correlations, including constant vectors, are represented as null rather than assigned a biological meaning.

The command line report returns the five leading maps. The interface shows six leading maps and allows selection from the full reference library. The local export includes all 30 associations in the default example.

## 3. Measure sensitivity to an individual region

Each reported association is recalculated 82 times, omitting one region on each repetition. The minimum and maximum coefficients form the region omission range.

This checks the influence of removing one observation. It does not account for spatial dependence between regions and is not a confidence interval. No spatial permutation test, corrected p value or multiple comparison inference is implemented in this portable comparison.

The default calculation produced:

| Synthetic map | Spearman correlation | Region omission minimum | Region omission maximum |
| --- | ---: | ---: | ---: |
| reference-17 | 0.818308 | 0.811495 | 0.833853 |
| reference-5 | 0.782458 | 0.774300 | 0.797380 |
| reference-20 | -0.731435 | -0.746703 | -0.721364 |
| reference-13 | 0.622359 | 0.608198 | 0.643767 |
| reference-19 | -0.617331 | -0.644038 | -0.603613 |

The new input command reproduces the earlier comparison exactly when supplied with the same synthetic fixture. This is a software regression result, not an independent biological replication.

## 4. Construct two possible functional states

A separate illustrative model defines functional output as:

`F = S × C`

Here, S is an assumed latent functional substrate and C is an assumed response gain. Neither is estimated from the regional profile. The observed regional vector and its reference maps remain fixed for both states.

The default parameters are S = 0.72, gain A = 1.4, gain B = 0.8 and threshold = 0.8. The calculation gives:

| Quantity | Model A | Model B |
| --- | ---: | ---: |
| Assumed substrate | 0.72 | 0.72 |
| Assumed gain | 1.40 | 0.80 |
| Functional output | 1.008 | 0.576 |
| Output relative to threshold 0.8 | Above | Below |

The functional difference is 0.432. The difference between the observed structural inputs is zero by construction. All reference map associations also remain identical because their inputs have not changed.

This is a constructive example of nonidentifiability within the specified observation model: the same observations are compatible with more than one value of the unobserved function. It is not a general proof that MRI cannot measure function, and it does not establish that either simulated state exists in a patient.

State labels are consequences of chosen thresholds. In the implementation, output at or below the threshold is labelled dysfunction compatible; above threshold with gain greater than 1.1 is labelled compensation compatible. These rules are illustrative, not clinical classifiers.

A control sets both gains to the same value. The functional outputs then coincide, showing that the difference depends on the gain assumption.

## 5. Compare hypothetical measurements

The model compares a repeated structural observation, another descriptor of the same fixed regional inputs and a direct functional readout. The first two are identical between the constructed states. The functional readout differs when the assumed gains differ.

With assumed measurement noise standard deviation 0.10, the functional difference divided by noise is:

`abs(1.008 - 0.576) / 0.10 = 4.32`

Doubling the assumed noise to 0.20 reduces this quantity to 2.16. Equal gains reduce it to zero. The displayed distributions assume equal Gaussian noise. This is an assumed separation measure, not a p value, diagnostic accuracy or measured assay performance.

The exercise explains a practical research question: which additional observation would distinguish competing explanations under a stated model? Choosing and validating an actual biological assay remains separate work.

## 6. Make the time assumption explicit

An optional calculation assumes exponential decay:

`S(t) = S0 × exp(-k × t)`

When the initial output exceeds the threshold, the crossing time is:

`t = (log(S0 × C) - log(threshold)) / k`

Otherwise the returned time is zero. The implementation uses a difference of logarithms to avoid an unnecessary intermediate ratio overflow.

At the default assumed decay rate 0.10, Model A crosses at approximately 2.311117 arbitrary time units. Model B is already below the threshold and returns zero. The data do not estimate the decay rate or define a real time scale. These numbers do not predict years to disease progression.

## 7. Validate and compare local inputs

The JSON comparison command accepts a declared synthetic or research aggregate bundle. It requires exactly 82 unique region identifiers, between 1 and 20 profiles, between 1 and 100 maps, correctly sized vectors, finite numeric values and the expected text fields. The file size is limited to 1,000,000 bytes. A requested profile must exist.

An accepted bundle is passed to the same correlation and sensitivity functions. Invalid input is rejected before a comparison report is printed. The JSON validator checks structure and vector lengths; it cannot independently prove that an arbitrary file's labels and values are anatomically aligned. Correct alignment remains an input requirement.

A separate CSV converter supports two specific previously audited aggregate files. It checks their SHA256 hashes, four contrast identities, 82 matching region identities and their exact order, paired left and right region labels, and 30 map identities. All values are checked, including the brainstem column that is subsequently excluded.

The converter writes a JSON bundle outside the repository. It does not run notebooks, regenerate cohort statistics or reproduce an entire research pipeline. Its tests use temporary invented CSVs. No research arrays or participant records are supplied in this package, and no new cohort analysis was performed for this verification.

## 8. Connect the calculations to an interface

The React interface has three views:

1. Molecular context: choose a profile and reference map, view the regional scatterplot, inspect association rankings and sensitivity, and import an aligned local JSON file.
2. Competing states: hold the regional observations fixed while changing the illustrative substrate, gains and threshold. Inspect the resulting functional outputs and reset the defaults.
3. Next experiment: compare the hypothetical observation types, vary assumed noise and inspect the optional threshold crossing calculation.

Import stores data in browser memory. The export downloads JSON containing parameters, model outputs, profile identifiers, source metadata and association summaries. Raw imported value arrays are excluded. Source metadata and derived results can still contain research information, so the absence of raw arrays is not a guarantee of anonymity.

The export version label was corrected to 0.4.0 for this final package. The interface and calculations run locally. The public presentation website remains a separate static entry; publishing the interface source does not replace that website with the prototype.

## 9. Verify the implementation

Verification on the final candidate completed successfully:

- 26 JavaScript tests passed, covering rankings, correlations, sensitivity, model assumptions, numerical edge cases, input validation and command line integration.
- 16 Python tests passed, covering the independent model calculation and the importer with invented fixtures.
- JavaScript model outputs agreed with the independent Python implementation. The Python regional fixture is different from the JavaScript fixture; their map rankings are not used as a cross language equality check.
- The locked dependency installation and Vite production build succeeded.
- Ten browser workflow checks passed: default outputs, equal gains, parameter reset, displayed correlation, rejected invalid import, accepted invented import, restored example, functional separation, local export and a state view check at a 390 pixel viewport. No browser page errors were observed during these checks.

The export check confirmed version 0.4.0, 30 association summaries, the default separation of 4.32 and the absence of raw value arrays from those summaries. These checks verify the specified software behaviours. They do not establish clinical validity or cover every possible input and browser configuration.

## 10. What was obtained

The final package provides a working local prototype, reproducible command line examples, a controlled input route, inspectable equations, an independent numerical reference and verified software outputs.

It demonstrates two things: regional patterns can be compared reproducibly, and a fixed pattern can remain compatible with different functions when the model includes an unobserved gain. The interface makes both the results and their assumptions easier to inspect.

The potential research use is to organize hypotheses and make the need for an additional measurement explicit. Applying this to a disease or to drug development would require appropriately licensed data, biological validation, suitable spatial statistics, independent replication and experiments showing that an intervention changes a meaningful outcome. No drug was ranked, tested or shown to benefit patients by this code.

## Run it

Use Node.js 22.12 or later and Python 3.10 or later. From the code directory:

```sh
npm ci
npm test
npm run test:python
npm run demo
npm run states
npm run reference
npm run compare
npm run build
npm run dev
```

Open `http://127.0.0.1:5184/prototype.html` for the local interface. To compare an authorized bundle:

```sh
npm run compare -- --input /path/to/bundle.json --profile AD_vs_CN
```

Implementation details can be inspected in `src/core/molecular.mjs`, `src/core/model.mjs`, `src/core/bundle.mjs`, `scripts/compare_bundle.mjs`, `scripts/import_research_aggregates.py` and `src/App.jsx`. All reported numerical values are reproducible from the supplied code; no manuscript text or manuscript result is used as evidence in this report.
