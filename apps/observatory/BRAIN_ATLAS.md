# StarLens 3D brain atlas

A working 3D view added to the existing DopaTeam React research workspace. The original molecular comparison, competing states and experiment views remain available.

## Run

Use Node 22.12 or newer. Install with `npm ci`, then run `npm run dev` and open `http://127.0.0.1:5184/prototype.html`. The current development session uses `http://127.0.0.1:5187/prototype.html`.

For a production build, run `npm run build`. Serve `dist` over HTTP and open `/` or `/prototype.html`. Both entries open the 3D workspace. Do not open the HTML directly through a filesystem URL.

The standalone public deployment uses Sites, configured in `.openai/hosting.json`. Its final address is https://starlens-brain-atlas.sese16180.chatgpt.site. Publication status is recorded in the parent project's implementation handoff. The historical Vercel configuration is retained for reference and does not publish this standalone build. A separate task confirmed the original three-view prototype at https://dopateam.vercel.app/prototype.html at 11:38 EDT on September 14.

## Neural Observatory

Open `/observatory.html` for the standalone cinematic experience. Higgsfield 3D Jutsu authored the presentation stage. The brain uses the existing atlas meshes and anatomical IDs, with new surface shading, studio lighting, smooth camera transitions, and a responsive full-window interface. The research workspace remains at `/prototype.html` and `/`.

Use Explore the surface, Look inside, and Load a dummy map for a three-step demonstration. The layer badge always identifies the visible layer. Data & evidence exposes import, source metadata, reference selection, and descriptive correlation. Explore regions exposes the region list and layer controls. Full screen is optional. Reduced-motion preferences disable camera tweening; rotation starts only when requested.

Download 3D model saves the currently visible scene as a GLB. The exported coordinates are in metres; display separation and selected materials are preserved. The complete FreeSurfer license and data context are embedded. The scene can open in Blender or another glTF-compatible viewer; post-processing and environment lighting may differ. Keep source data in the separate JSON export. See public/observatory/PROVENANCE.md for the stage provenance.

## What works

- Rotate, zoom and pan a real fsaverage template surface with OrbitControls.
- Select a named anatomical region through the 3D mesh or searchable list.
- Inspect left and right hemispheres, separate them, adjust cortical opacity and focus the camera.
- Show 68 cortical parcels and 14 deep structures, including the hippocampus. Deep structures remain opaque when the cortex becomes transparent.
- Import local JSON with explicit cortical IDs, switch profile and reference overlays, inspect values and reuse DopaTeam Spearman correlation.
- Download a blank data template, generate a clearly labeled synthetic example, and save reloadable data JSON. These files remain local.
- Retain atlas work while visiting the existing research views. Reloading the browser resets unsaved state.
- Export a PNG with the anatomical or synthetic context printed on it.

## Color and onboarding update, 2026-09-14

Anatomical selection in the Observatory is filled bright cyan. It indicates selection only. Numeric layers use an unlit blue, pale-yellow and orange scale shared with the on-screen legend, so stage lighting and selection do not change the mapped color. Missing values are gray and selection has a white boundary. Each layer uses its own finite minimum and maximum; constant layers show a single midpoint color.

The always-visible source card distinguishes unconnected standard anatomy, synthetic values and user-provided aggregates, and reports finite cortical values. How to use opens the English guide. Narrow screens group camera and opacity controls under View controls. Switching to a numeric layer restores full opacity; leaving deep-structure focus returns to a cortical selection.

The current paper-derived measurements remain unconnected. JSON validation checks IDs and data structure, not scientific validity.

## Data format

Use the on-screen data template. Its schema is `starlens-atlas-v1`, atlas is `fsaverage5-dk68`, and kind is `synthetic` or `research-aggregate`. It contains all 68 explicit cortical IDs such as `ctx-lh-entorhinal`, a source title, profiles and reference maps. Each value is finite or null. Null remains missing and is excluded from paired correlations.

Input order can differ because every array is reordered by ID. Unknown or repeated IDs are rejected. Imported source metadata is retained on export. Layer labels, names and units must be text. Files larger than 1 MB are rejected before parsing.

The original DopaTeam bundle uses 82 regions. Only exact anatomical ID matches are accepted by the adapter; synthetic r01 through r82 match none. Fourteen deep structures are anatomical display only and are not silently added to the cortical analysis. An anatomical set of 82 regions does not establish correspondence with the study's 82 regions.

There are no bundled patient, receptor, atrophy or gene-expression study values. The prepared dummy overlay loads only when requested through the interface. The code does not reconstruct patient MRI, register volumes, diagnose disease, infer receptor loss or select medication.

## Geometry and provenance

Read `public/atlas/PROVENANCE.md`, both provenance JSON files, validation JSON files and `LICENSE-FreeSurfer.txt`. The cortex is fsaverage5 with Desikan–Killiany labels. The 14 deep surfaces are extracted from a separate fsaverage aseg segmentation. The two public template revisions differ by approximately 0.91 mm at the median in the white-surface comparison. Their combination is illustrative standard anatomy, not an exact jointly reconstructed patient brain.

Source RAS millimeters are displayed as x, z, -y. Hemisphere separation is a display transform. Triangle selection uses majority vertex labels, with the first vertex resolving a three-way tie. Deep structures are prioritized for ray selection when cortical opacity is below 50%.

## Change boundary

Base commit `befcfd9e5c2e32981e2dbdffda2aae457b2bf073` from `Rifelimo/DopaTeam`, branch `codex/starlens-brain-atlas`.

Added `src/components/BrainView.jsx`, `BrainScene.jsx`, `src/core/atlas.mjs`, `src/brain.css`, atlas assets, and atlas tests. Updated App navigation, prototype metadata and dependencies. The original numerical source files are unchanged. `tests/model.test.mjs` now accepts a `PYTHON` executable override and a Windows default so its existing reference checks can run on this machine.

## Verification

Production build passed. All 34 Node tests passed, including the two independent Python reference checks with the bundled Python executable. Eight new atlas checks cover source mesh structure, explicit-ID reordering, invalid inputs, missing values, the unmapped upstream example, partial matching, metadata validation and JSON round trips.

Browser checks covered model loading, cortical and hippocampal selection, focus, direct mesh clicking, drag rotation, hemisphere selection, separation and opacity by keyboard, layer switching, synthetic values, valid JSON import, invalid JSON rejection, JSON export and reimport, preservation across tabs, and a 390-pixel viewport without horizontal overflow. The browser download event timed out, but the saved JSON was found on disk, validated and reimported successfully.

Neural Observatory was also checked at desktop and 390-pixel mobile sizes. The anatomy, hippocampal focus, synthetic map, reference switch, direct mesh selection and GLB export were exercised. The exported anatomical GLB was loaded with GLTFLoader and checked for all 68 cortical IDs and the embedded source license. Numeric exports remove anatomy-only vertex colors on private geometry copies so glTF readers preserve the displayed numeric colors. Original atlas assets and src/core files are unchanged from the earlier 3D release.

No clinical validation, exact patient registration or original research data replication was performed. Build output includes about 3.35 MB of raw atlas geometry, a 0.38 MB stage and a 0.91 MB shared JavaScript bundle. Production compression reduces network transfer substantially. The bundler reports a large-chunk advisory for Three.js.

## Scientific readiness and English interface, 2026-09-14

The entire supplied interface and help are English. Read public/atlas/SCIENTIFIC_READINESS.md for the distinction between the 2025 study, the 2026 manuscript, the upstream 82-region example and this DK68 viewer. Numeric correctness does not establish measured atrophy or biological validity. The upstream research format also requires a verified anatomical crosswalk before projection. The demo has no patient MRI, significant-atrophy mask or measured receptor values. Original numeric algorithms remain unchanged.

## Ready-to-use dummy input

Load dummy data imports public/atlas/dummy-atlas.json through the same atlas validator used by Open atlas JSON. The prepared file is 9,017 bytes and has 68 explicit cortical IDs, three fictional profiles and three artificial reference maps. Temporal, frontal and mixed patterns use invented weights in arbitrary units. They are not fitted disease patterns. All deep structures remain anatomy only.

In Data & evidence, changing Profile displays that profile's values. Changing Reference displays that reference map. Download dummy JSON saves the prepared input. Download dummy comparison results saves the separate static report for all nine dummy pairs. The report is not an atlas input and does not report a later user-imported dataset. Save atlas data JSON exports the currently loaded dataset.

Run npm run demo:atlas to regenerate both files using scripts/generate_dummy_atlas.mjs. It reads existing atlas labels and reuses the unchanged DopaTeam rankMaps function. No raw MRI, network access or original study data is needed. Generation is deterministic by anatomical ID. The ready files are served statically, and the viewer recalculates the selected 68-pair correlation for interaction.

GitHub's later 48-hour ZIP also contains saved synthetic results, but its r01 through r82 identifiers have no anatomical correspondence. This separate DK68 dummy does not reproduce those numbers. See public/atlas/SCIENTIFIC_READINESS.md for the pinned source link and distinction.

The updated Node suite has 38 passing tests, including nine-result agreement, exact regeneration, anatomical emphasis, reordered-region invariance and validation. The browser confirmed loading all 68 values, profile and reference changes, selected-region values and the dummy labels. File-picker automation is unavailable in the browser tool used for this turn. JSON parsing and export round trips were tested directly, while the new one-click loading route was exercised in the browser.
