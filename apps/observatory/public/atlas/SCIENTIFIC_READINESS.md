# StarLens data and concept audit

Reviewed on 14 September 2026 against DopaTeam commit befcfd9e5c2e32981e2dbdffda2aae457b2bf073 and the supplied Morais et al. 2025 paper.

## What the current map establishes

The viewer correctly assigns its input numbers to explicit cortical region IDs and computes a descriptive correlation across paired finite values. Its bundled demonstration uses generated numbers in arbitrary units. It does not identify or display measured atrophy in a patient.

The shape is a standard fsaverage5 brain with Desikan–Killiany labels. Changing a number changes an overlay color, not the brain geometry. Parcel boundaries are approximated from triangle vertex labels. This is not lesion segmentation or an individual MRI reconstruction.

## Values and colors

Load dummy data reads a small prepared JSON file with three fictional regional profiles and three artificial reference patterns. The scenarios emphasize temporal regions, frontal regions or a mixed distribution using explicit cortical IDs. All numbers have arbitrary units and are generated for software demonstration. They are not measured tissue-loss percentages, Cohen's d estimates or receptor levels. The separate comparison JSON contains nine descriptive associations calculated from these same dummy arrays.

Blue means a lower number and orange means a higher number within the displayed layer. Each layer is scaled separately, so the same color in two layers need not mean the same value. Missing values remain gray. White outlines indicate selection.

For the upstream research converter's Cohen's d contrast, defined as cases minus cognitively normal controls, a more negative number means lower gray-matter volume in the case group. Such a reduction lies toward blue on this scale. Orange is not a universal indicator of atrophy. Significance also requires separate statistical evidence.

## Study, prototype and atlas are different

| Source | Regions and meaning |
| --- | --- |
| Supplied Morais et al. 2025 study | 83 DK40 cortical and subcortical areas |
| Upstream research aggregate converter | 82 bilateral regions after excluding a reference brainstem column |
| Supplied 2026 manuscript marked For Peer Review | 82 non-brainstem regions in 1,435 ADNI participants |
| Upstream public demonstration | 82 invented region IDs |
| This viewer | 68 cortical numeric slots, plus 14 deep structures for anatomy only |

The 2025 study analyzed adjusted regional MRI gray-matter volumes in 214 participants from one clinic and compared their regional patterns with PET maps from healthy volunteers. Its Figure 5 shows group-comparison T statistics for changes in correlations when a region is omitted. Those colors are not the amount of atrophy or directly measured neurotransmitter loss. See the paper's methods on pages 2–4, Figure 5 on page 9 and limitations on page 10.

The separate 2026 manuscript must not be confused with the 2025 published paper. Its supplementary notebook filenames appear in the supplied PDF, but the executable notebooks are not embedded. This audit does not claim to have independently reproduced either study.

## Saved GitHub outputs and the lightweight fallback

The [48-hour reproducibility package](https://github.com/Rifelimo/DopaTeam/blob/14a7791e753507215f807637eaed149e362d7118/submissions/48h/DopaTeam_Reproducibility_34c4d158.zip) contains a saved synthetic input, comparison results and illustrative functional-model outputs. It was added after the user's originally specified revision. Its input uses r01 through r82, which have no verified anatomical meaning. Its correlations and functional-model results cannot serve as regional atrophy measurements.

The ready-to-use 3D dummy is a separate dataset created with explicit DK68 cortical IDs. It reuses DopaTeam's unchanged rankMaps and Spearman functions. It does not reproduce the ZIP's numerical results, the MINNT imaging pipeline or a paper's findings. No raw MRI or long-running imaging analysis is required to load this dummy. Temporal, frontal and mixed are fictional demonstrations, not diagnoses or fitted disease models.

Use Data & evidence to download the dummy input and its computed results. Open atlas JSON accepts the input file. The comparison result file is a report and is not an atlas input. Synthetic source metadata stays with exported atlas data.

## Concept alignment

The viewer supports anatomical exploration and descriptive spatial comparison. The repository goes further with an illustrative model showing that fixed structural and reference inputs can coexist with different assumed functional outputs. Its assumptions do not turn an anatomical correlation into a measurement of cell function.

This viewer does not infer SST cell activity, establish why tissue was lost, identify an individual's receptor deficit, predict a clinical transition or select a treatment. It is a research visualization component, not a completed functional diagnostic system.

## What is needed for a measured atrophy map

1. An authorized table of regional MRI-derived values with the source revision, measurement, contrast, units and sign definition.
2. A researcher-verified correspondence between those regions and the displayed atlas. The upstream l_<ROI> and r_<ROI> identifiers are not automatically equivalent to ctx-lh-<name> and ctx-rh-<name>. A prefix substitution or matching array positions is insufficient.
3. For a biological-context comparison, reference PET or expression values on the same verified region system, with their source population and processing documented. These reference maps are not required to quantify MRI atrophy itself.
4. Missing regions kept empty. The current quantitative importer covers cortical regions only. Hippocampal measurements require additional verified support.
5. For a claim about significantly affected regions, the statistical test, corrected significance values and threshold. For an individual patient, MRI processing, segmentation quality checks and an appropriate normative or longitudinal comparison are also needed.

Use Get data template and Open atlas JSON only after the researcher has checked those items. The importer validates IDs and numeric structure, not the scientific accuracy of the file.

## Checks performed

All 68 cortical IDs have corresponding mesh triangles. Reversed input order retained the intended values through ID matching. Known values -2, 0 and 2 mapped to the low, middle and high colors. Null remained missing. Opposite three-region patterns gave Spearman rho -1, and constant patterns gave undefined correlation. These are software checks, not biological validation.

## Sources

- [DopaTeam at the specified revision](https://github.com/Rifelimo/DopaTeam/tree/befcfd9e5c2e32981e2dbdffda2aae457b2bf073)
- [DopaTeam theory and assumptions](https://github.com/Rifelimo/DopaTeam/blob/befcfd9e5c2e32981e2dbdffda2aae457b2bf073/THEORY.md)
- [Research aggregate importer](https://github.com/Rifelimo/DopaTeam/blob/befcfd9e5c2e32981e2dbdffda2aae457b2bf073/scripts/import_research_aggregates.py)
- [Morais et al. 2025, Differential involvement of neurotransmitter pathways in AD, bvFTD and MCI](https://pubmed.ncbi.nlm.nih.gov/40194635/)
- [Atlas geometry and redistribution sources](./PROVENANCE.md)
