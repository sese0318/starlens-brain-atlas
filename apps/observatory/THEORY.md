# Same structural observation and different functional states

## Question and conditional model

Can a structural brain observation and fixed molecular reference maps determine whether a cortical cell population is maintaining useful function or has become dysfunctional? DopaTeam demonstrates a specific failure of identification under an explicit observation model. It does not establish a new general theorem about MRI, infer real cell states or forecast a clinical transition.

Let the observed input be `O = (y, R)`, where `y` is an 82 region structural vector and `R` contains fixed reference maps. For this construction the observation is held fixed and does not depend on unobserved response efficacy `C` or future decline rate `k`. Any displayed molecular descriptor is a deterministic function `g(y, R)`, including raw Spearman correlation. Repeating a deterministic transformation of the same input supplies no additional independent information about C or k.

The toy latent model defines useful functional output as

`F = S × C`,

where `S ≥ 0` is available functional substrate and `C ≥ 0` is response efficacy. Both use arbitrary normalized model units. S is not MRI volume or a measured neuronal count. F represents useful output under the stipulated model, not firing rate; excessive activity can coexist with impaired circuit function. In actual biology, volume reflects several tissue components and neither a unique cell population nor its functional output follows directly from volume.

## Constructive counterexample

Fix `S = 0.72`, the same y and R, and a stipulated functional threshold `q = 0.80`.

| Synthetic state | Response efficacy C | Useful output F | Model interpretation |
| --- | ---: | ---: | --- |
| A | 1.40 | 1.008 | Compensation compatible under the toy assumptions |
| B | 0.80 | 0.576 | Below the stipulated useful output threshold |

Both states produce exactly the same O and every g(O), while their useful output and threshold status differ. If a function of O alone identified F for every state in this model class, it would have to return both 1.008 and 0.576 for the same input. This contradiction establishes nonidentification in this model class.

The result follows from the explicit omission of C from the observation model. It does not show that no MRI sequence or multimodal study can contain relevant functional information. “Compensation compatible” is an assumed model interpretation relative to reduced S and preserved output, not experimentally detected compensation. Separating adaptation from compensation requires an appropriate reference or perturbation context.

## Why baseline data do not identify a transition clock

Assume an illustrative trajectory `S(t) = S0 exp(−k t)` with fixed C and `k > 0`. Define the event as first attainment of `F(t) ≤ q`, with `q > 0`. The crossing time is

`tau = max(0, ln(S0 × C / q) / k)`.

For zero initial output the implementation returns zero directly rather than taking its logarithm. With the specified state A and `k = 0.10`, tau is approximately **2.311117 model time units**. At `k = 0.20`, the identical baseline state gives **1.155559 model time units**. State B is already below threshold, so tau is zero for either rate. None of these numbers denotes years, disease duration or treatment timing.

The baseline observation leaves both C and k unidentified. Even an exact baseline F measurement can distinguish the constructed current states without determining k. Identifying a transition time requires longitudinal information, a defined event and a calibrated temporal model in the relevant system.

## Additional measurement and assay selector

For the constructed pair, suppose an additional scalar assay has observation model `Y = F + noise`, with known per measurement noise standard deviation sigma. In the absence of noise, this assay separates the two states because their predicted means differ. With noise, the selector reports

`separation = |mean_A − mean_B| / sigma`.

At sigma 0.10, the synthetic functional difference 0.432 gives separation **4.32**. Structural and molecular descriptors have difference zero and separation zero. Equal C in both states also gives functional separation zero. This is a standardized predicted signal contrast, not a p value, empirical diagnostic accuracy, validated likelihood ratio or proof of biological assay performance. For two independent measurements each with SD sigma, the difference has SD `sqrt(2) × sigma`; the displayed denominator is explicitly the individual measurement SD. Any future cost weighting would be a stated heuristic rather than measured clinical utility.

## Biological boundary and contribution

SST cortical inhibitory interneurons provide a plausible investigated population because João Valério Rocha's prior manuscript links regional atrophy to normative SST transcriptional enrichment. That enrichment is not cell count or function. A 5HT1A receptor map supplies regional context and is not SST specific; VAChT is a cholinergic marker and is not a direct SST functional assay. These prior associations do not parameterize S, C, k or the synthetic measurement noise.

A biological SST state claim requires cell identity and function measured in the same system, with relevant circuit output or performance to interpret activity. A human EEG, MEG or task functional imaging measurement could add network information but does not uniquely attribute function to SST cells. A molecular density measure need not reveal effective output. This prototype offers a reproducible counterexample and a transparent measurement requirement, applying a standard identifiability argument to a concrete research question. Its new contribution is the implementation and explicit experiment comparison, not a validated biomarker or a novel universal theorem.

## Numerical reference

`scripts/reference.py` provides a deterministic JSON CLI using only Python's standard library. The example y and R arrays are generated from elementary functions and contain no anatomical, patient or normative receptor data. Average ranks account for exact ties. Undefined correlations return JSON null; invalid finite values, noise scales and temporal parameters are rejected. Twelve independent tests cover analytic numbers, threshold substitution, tied ranks, invariance, invalid inputs and deterministic output. Source evidence and primary paper links are documented separately in [PROVENANCE.md](PROVENANCE.md).
