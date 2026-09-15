# Standard brain model

FreeSurfer fsaverage5 cortical pial surface with Desikan–Killiany aparc labels. The model contains 34 cortical parcels in each hemisphere, 20,484 vertices and 40,960 triangles. Unknown and medial-wall vertices remain neutral. No patient scan is included.

Original FreeSurfer surface RAS coordinates in millimeters are retained in the assets. The renderer maps x, y, z to x, z, -y for an upright 3D view. Hemisphere separation is a display control, not anatomical displacement. Boundary triangles use the majority vertex label, with the first vertex breaking three-way ties.

Geometry and annotations were downloaded through the official netneurotools dataset registry. Pial surfaces were cross-checked against Nilearn fsaverage5. FreeSurfer LUT identifiers, names, and colors were checked before conversion. The data were converted to JSON and rounded to 0.001 mm. This modified format is not endorsed by Massachusetts General Hospital.

The included provenance.json records source URLs and archive hashes. validation.json records the geometric checks. LICENSE-FreeSurfer.txt contains the upstream license and required notices.

Sources

- https://netneurolab.github.io/netneurotools/generated/netneurotools.datasets.fetch_fsaverage.html
- https://netneurolab.github.io/netneurotools/_modules/netneurotools/datasets/fetch_atlas.html
- https://github.com/nilearn/nilearn/tree/main/nilearn/datasets/data/fsaverage5
- https://surfer.nmr.mgh.harvard.edu/fswiki/FreeSurferSoftwareLicense
- Desikan et al., 2006. DOI 10.1016/j.neuroimage.2006.01.021

No receptor, gene-expression, atrophy, or patient values are supplied. The optional overlay is generated synthetic data, clearly labeled in the interface. DopaTeam abstract r01 to r82 values have no verified anatomical correspondence and are not projected onto this model. A partial match imports only exactly equal anatomical IDs and leaves unmatched regions empty. This 68-region cortical view does not reproduce the 83-area analysis in the supplied Morais et al. 2025 paper or the upstream 82-region synthetic demonstration. The counts do not establish anatomical equivalence.

## Deep structures

Fourteen deep structures, including both hippocampi, were extracted from the public FreeSurfer fsaverage aseg segmentation mirrored by MNE. They contain 35,309 vertices and 70,562 triangles. The source voxel size is 1 mm. Gaussian smoothing of 0.6 voxel and Marching Cubes extraction are disclosed modifications. See subcortex-provenance.json and subcortex-validation.json.

The cortical and deep sources share the surface-RAS coordinate frame but are different template revisions. Their white surfaces differ by approximately 0.91 mm at the median. The combined display is an illustrative anatomical reference, not an exact patient registration. Deep structures have no quantitative overlays in this release. The mirror has no separate per-file license; preserve the upstream FreeSurfer license and MGH notice rather than claiming CC0 or the MNE software BSD license.
