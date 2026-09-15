#!/usr/bin/env python3
"""Build a local browser import from two pinned, aggregate research CSVs only.

No dependencies, network calls, patient tables, or notebook execution.
The output lives in sibling research/, outside the portable app directory.
"""

import argparse
import csv
import hashlib
import io
import json
import math
from pathlib import Path
import sys


REPOSITORY = "https://gitlab.inesctec.pt/brain-lab/neuroimaging/minnt-mri-nt"
BRANCH = "master_2"
SHA = "64a0ac7151dad1b380cbcd524b905de56fc8d5e3"
EXPECTED = {
    "outputs/atrophy_data.csv": "57d2ffd416b82265324eb91c4649b9c1e36726e4c4cd9597cceeec7149fa9560",
    "parcellated_petfiles.csv": "dcd4752e20bda6e516724a3a03586b327ab8b28d8b6eac14a1e9232947161b93",
}
CONTRASTS = ["AD_vs_CN", "EMCI_vs_CN", "LMCI_vs_CN", "SMC_vs_CN"]
CONTRAST_LABELS = {
    "AD_vs_CN": "Alzheimer disease versus cognitively normal controls",
    "EMCI_vs_CN": "Early mild cognitive impairment versus cognitively normal controls",
    "LMCI_vs_CN": "Late mild cognitive impairment versus cognitively normal controls",
    "SMC_vs_CN": "Subjective memory concern versus cognitively normal controls",
}


def read_pinned(source, relative):
    raw = (source / relative).read_bytes()
    digest = hashlib.sha256(raw).hexdigest()
    if digest != EXPECTED[relative]:
        raise ValueError(f"Source hash differs from audited baseline: {relative}")
    return list(csv.reader(io.StringIO(raw.decode("utf-8-sig"))))


def finite_values(values):
    result = [float(value) for value in values]
    if not all(math.isfinite(value) for value in result):
        raise ValueError("Nonfinite aggregate value")
    return result


def family(name):
    prefix = name.split("_", 1)[0]
    if prefix.startswith("5HT") or prefix == "SERT":
        return "Serotonin"
    return {
        "CB1": "Cannabinoid", "CBF": "Perfusion reference (ASL)",
        "D1": "Dopamine", "D2": "Dopamine", "DAT": "Dopamine",
        "FDOPA": "Dopamine", "GABAa": "GABA", "KappaOp": "Opioid",
        "MU": "Opioid", "NAT": "Noradrenaline", "NMDA": "Glutamate",
        "VAChT": "Acetylcholine", "mGluR5": "Glutamate",
    }.get(prefix, "Unclassified reference")


def build(source):
    atrophy = read_pinned(source, "outputs/atrophy_data.csv")
    templates = read_pinned(source, "parcellated_petfiles.csv")
    if len(atrophy) != 83 or any(len(row) != 5 for row in atrophy):
        raise ValueError("Expected 82 aggregate ROI rows and four contrast columns")
    if atrophy[0][1:] != CONTRASTS:
        raise ValueError("Unexpected contrast identities or order")
    if len(templates) != 31 or any(len(row) != 84 for row in templates):
        raise ValueError("Expected 30 normative maps and 83 ROI columns")
    if templates[0][0] != "File" or templates[0][-1].lower() != "brainstem":
        raise ValueError("Unexpected template label or final brainstem column")
    rois = [row[0] for row in atrophy[1:]]
    if len(set(rois)) != 82 or rois != templates[0][1:-1]:
        raise ValueError("The exact 82 ROI identities and order must match")
    if not all(roi.startswith("l_") for roi in rois[:41]):
        raise ValueError("Expected 41 left hemisphere ROIs first")
    if not all(roi.startswith("r_") for roi in rois[41:]):
        raise ValueError("Expected 41 right hemisphere ROIs last")
    if [roi[2:] for roi in rois[:41]] != [roi[2:] for roi in rois[41:]]:
        raise ValueError("Expected matched bilateral ROI labels")
    names = [row[0] for row in templates[1:]]
    if len(set(names)) != 30:
        raise ValueError("Expected 30 unique tracer/map identities")
    rows = [finite_values(row[1:]) for row in atrophy[1:]]
    # Validate all 83 map values, including the deliberately excluded brainstem.
    map_values = [finite_values(row[1:]) for row in templates[1:]]
    return {
        "kind": "research-aggregate",
        "source": {
            "repo": REPOSITORY, "branch": BRANCH, "sha": SHA,
            "verification": "saved aggregate; not rederived",
            "input_sha256": EXPECTED,
            "license": "No repository license established for the audited baseline",
            "redistribution": "Local research import only; external redistribution rights unresolved",
            "clinical_use": False,
            "interpretation": "Cohen d case minus CN from structural MRI residuals; negative values indicate lower case GMV. Normative templates are reference maps, not patient neurotransmitter measurements.",
        },
        "regions": [
            {"id": roi, "label": ("Left " if roi.startswith("l_") else "Right ") + roi[2:]}
            for roi in rois
        ],
        "profiles": [
            {"id": contrast, "label": CONTRAST_LABELS[contrast] + " (Cohen d)",
             "values": [row[i] for row in rows]}
            for i, contrast in enumerate(CONTRASTS)
        ],
        "maps": [
            {"id": name, "name": name, "family": family(name), "values": values[:-1]}
            for name, values in zip(names, map_values)
        ],
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True,
                        help="Canonical repository data directory; only the two pinned aggregate CSVs are read")
    args = parser.parse_args()
    app_root = Path(__file__).resolve().parents[1]
    destination = app_root.parent / "research" / "local_aggregates.json"
    if app_root in destination.resolve().parents:
        raise ValueError("Research aggregate output must remain outside the app")
    payload = build(args.source)
    raw = (json.dumps(payload, ensure_ascii=False, indent=2, allow_nan=False) + "\n").encode()
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(raw)
    # Report metadata only; never print region values or source records.
    print(json.dumps({"regions": len(payload["regions"]), "profiles": len(payload["profiles"]),
                      "maps": len(payload["maps"]), "sha256": hashlib.sha256(raw).hexdigest()}))


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError) as error:
        print(f"Import failed: {error}", file=sys.stderr)
        sys.exit(1)
