# Compare an aligned local bundle

Start with the portable demonstration:

```sh
npm run compare
```

It validates 82 regions, selects the synthetic profile and returns the same five leading map associations as `npm run demo`. This checks the full path without access to research files.

## Use an authorized local bundle

```sh
npm run compare -- --input /path/to/bundle.json --profile AD_vs_CN
```

The input is a JSON bundle smaller than 1 MB. The profile ID must exist in the bundle. Invalid shapes, repeated identifiers and nonfinite values are rejected before any result is printed. The output contains descriptive correlations and sensitivity summaries, not raw input arrays. Derived results can still be research material; this command prints locally and never uploads them.

## Convert the audited aggregate CSVs

For a researcher who already has authorized access to the specific source files:

```sh
python3 scripts/import_research_aggregates.py --source /path/to/authorized/minnt/data
npm run compare -- --input ../research/local_aggregates.json --profile AD_vs_CN
```

The importer reads only `outputs/atrophy_data.csv` and `parcellated_petfiles.csv`. It verifies file hashes, the exact 82 region identities and order, four contrasts and 30 map names. It validates and excludes the brainstem column. The generated bundle remains outside this repository.

The importer targets the previously audited `master_2` commit `64a0ac7151dad1b380cbcd524b905de56fc8d5e3`. It does not silently substitute the newer `master` revision. A file whose hash differs is rejected. Saved aggregates are not independently regenerated study results.

The public code contains no original CSV, participant record or research value array. All importer tests create temporary invented files. The interface released in parcel 04 uses the same bundle validator and comparison functions.
