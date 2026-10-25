# Third-party data notice

The source code and documentation in this repository written by the copyright holder are released under the MIT License (see `LICENSE`).

**FreeSurfer-derived brain data is not covered by the MIT License.** The standard brain
geometry in `public/atlas/` is derived from FreeSurfer template data (fsaverage5 cortical
pial surfaces with Desikan–Killiany labels, and 14 deep structures extracted from the
fsaverage aseg segmentation), obtained under license from The General Hospital Corporation
("MGH"). These files remain subject to the FreeSurfer Software License Agreement, whose full
text and required notices are retained in `public/atlas/LICENSE-FreeSurfer.txt`. They were
converted to JSON and modified (rounding, smoothing, mesh extraction) as described in
`public/atlas/PROVENANCE.md`; this modified format is not endorsed by MGH.

Files that remain under the FreeSurfer license:

- `public/atlas/lh.json`
- `public/atlas/rh.json`
- `public/atlas/subcortex.json`
- `public/atlas/provenance.json`, `public/atlas/validation.json`,
  `public/atlas/subcortex-provenance.json`, `public/atlas/subcortex-validation.json`
  (metadata describing the above)
- any 3D export (GLB) produced by the app that contains this geometry

FreeSurfer data is provided for research purposes only; clinical applications are neither
recommended nor advised. No patient data is included.
