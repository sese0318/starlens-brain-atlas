# Source and contribution record

## Code provenance

DopaTeam is led by Ricardo Félix Morais, with Alex Chen and Seika Karamatsu. Codex assisted with code, documentation and review. Specific contributions will be recorded as the team adds work.

The initial regional comparison functions and deterministic synthetic inputs were extracted from the DopaTeam prototype at local commit `13cf095949fff82240b102c1d9547b140c7df213`, prepared during the hackathon. That implementation was initially named StateLens. This parcel changes the module layout and adds a small command line entry point; it does not reproduce João’s analysis notebooks.

The synthetic generator creates illustrative patterns across 82 labelled regions and 30 reference maps. These are mathematical examples, not participant observations, anatomical coordinates, measured receptor densities or independent neurotransmitter systems. The number of maps does not establish biological coverage.

## Earlier scientific work

João Valério Rocha and collaborators’ MINNT research predates the hackathon and motivates the question about interpreting regional imaging and molecular associations. Its source is the [INESC TEC GitLab MINNT repository](https://gitlab.inesctec.pt/brain-lab/neuroimaging/minnt-mri-nt).

The live default branch `master` was verified on 12 September 2026 at commit `5da8534a24ae0b996be34b995fa2b671040dab92`, dated 22 May 2026. The earlier linked branch `master_2` points to `64a0ac7151dad1b380cbcd524b905de56fc8d5e3`, dated 20 March 2026. The current branch head is a version identifier, not proof of a final scientific release. No release tags were advertised in the verification.

The MINNT source contains research CSVs and notebooks with stored outputs. No LICENSE file was found in the current tracked tree. Access and redistribution conditions must be resolved for any future inclusion. No original MINNT code, research data or stored notebook outputs are included in this parcel.

Ricardo is the first author of a separate [2025 Neurobiology of Disease publication](https://pubmed.ncbi.nlm.nih.gov/40194635/) examining MRI and neurotransmitter reference maps in Alzheimer’s and related conditions. This published study supplies scientific context. It did not evaluate or validate DopaTeam, and is distinct from the MINNT manuscript.

## Evidence and release history

The regional comparison tests check numerical behavior. Neither these checks nor the synthetic results establish biological validity or improved research decisions. Spatial association does not identify causation, cell state or a useful experimental intervention.

The full DopaTeam prototype was prepared before this first staged repository release. Subsequent parcels will state which existing files become public and which new changes were actually made. Original Git authorship and timestamps are retained; publication cadence does not imply that inherited research was created during the event.

The [Life Sciences brief](https://docs.google.com/document/d/1NhHbo8ccaufwQraju_mApEUghlrkpl5V/edit) asks teams to identify external code, models, datasets and prior research. This record supports that requirement. A personal GitHub release is separate from the official hub submission and checkpoint materials.

## Parcel 02

The conditional state functions, numerical Python reference and model tests are published from the existing local DopaTeam prototype. The state command line wrapper and a JavaScript to Python numerical agreement test are added for this release. Shared regional comparison functions remain in the original module and are reexported by the model module. The bundle validator and local aggregate importer remain scheduled for parcel 03; the interactive source remains scheduled for parcel 04. No MINNT notebook or research value arrays are included.

## Parcel 03

The local aggregate importer and bundle validator come from the existing local prototype. New tests exercise them with temporary invented values. The importer retains its audited older source revision and does not include or redistribute the research arrays.

## Parcel 04

The React interface and components are published from the existing local prototype. Branding is updated to DopaTeam and a dedicated prototype.html entry keeps the current presentation separate. All analyses retain their stated model assumptions and simulated defaults.

## Release sequence review

The 13 September review connects the four code parcels through explicit capability checks. It adds input and numeric boundary corrections to the current model. The command line path for validated bundles and its integration tests are prepared for parcel 03. These changes are implementation and release work, not new biological evidence.
