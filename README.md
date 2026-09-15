# StarLens 3D apps

## Choose the 3D app

| App | Vercel URL | Source |
| --- | --- | --- |
| Original Neural Observatory, the first 3D app | https://starlens-brain-atlas.vercel.app/observatory | apps/observatory |
| Later Anatomy Studio with decomposition | https://starlens-brain-atlas.vercel.app/ | src |

The original Observatory is the same version 5 source published at https://starlens-brain-atlas.sese16180.chatgpt.site/observatory, commit 25c9d10b449edf017f7ab84923aeab2a32496276. Both apps now live in this repository. The later unpublished Workbench redesign is a separate task and is not included. See apps/observatory/SOURCE.md for the exact origin and build integration.

Root npm ci installs both applications. Root npm test runs 25 Anatomy checks and 38 original Observatory checks, including a Python standard-library reference. Root npm run build produces both apps in dist. Configure Vercel at the repository root, not apps/observatory. The original snapshot's deployment docs, vercel.json and .vercelignore are historical, and the root configuration is authoritative.

## Anatomy Studio guide

A separate interactive brain explorer combining anatomical decomposition with StarLens regional data comparison. Existing StarLens sites remain independent.

## Start

Use Node.js 22.12 or newer.

```powershell
npm ci
npm run dev
```

Open the local URL printed by Vite. The default port is 5196. Build with `npm run build`, run the production build locally with `npm run preview`, and run automated checks with `npm test`.

## Explore

Drag to orbit, scroll or pinch to zoom. Search the structure library and select a part. Focus moves the camera closer. Isolate shows the selection, Hide removes it, and Restore all restores visibility.

Separate the structures controls rigid decomposition. Explore in parts separates the cortex and adds categorical lobe colors. Reveal deep structures makes the cortex transparent. Reassemble returns the source geometry to its original arrangement. Reset view resets presentation settings while retaining imported data.

On a phone, the Anatomy and Inspect & data buttons open their respective panels below the canvas.

## Compare data

Load synthetic demo uses the existing approximately 9 KB atlas file. It contains three fictional regional profiles and three artificial reference maps. Choose a profile and reference, then switch the displayed layer. Select a scatterplot point to select the same cortical region in 3D.

Blue through orange represents the selected layer's values, gray means no value, and cyan outlines a selected structure. Visibility and decomposition never change the data order, numeric scale or paired Spearman correlation. The correlation is descriptive and has no spatial null test.

Import atlas JSON accepts the existing `starlens-atlas-v1` contract with `fsaverage5-dk68`, all 68 explicit cortical IDs, declared `synthetic` or `research-aggregate` kind, source information, units and finite values or null. Inputs are reordered by ID, never by guessed row position. Get template generates a blank aggregate template. Files remain in the browser. Save data exports the validated dataset.

## Scientific boundaries

Geometry consists of 68 cortical parcels from the Desikan–Killiany atlas and 14 deep structures from FreeSurfer template data. Cortical parcels are open surface patches, not solid dissected tissue. Decomposition is a visualization transform, not patient tissue loss. Numeric inputs apply to the 68 cortical parcels only.

Deep and cortical sources come from different template revisions, with approximately 0.91 mm median surface difference. They are illustrative standard anatomy, not patient registration. No cerebellum, brainstem, vessels or tracts are present. Navigation groups are browsing conveniences, not a new atlas.

No measured atrophy, neurotransmitter receptor density or gene-expression data is bundled. Imported IDs and numeric formats are validated, but measurement accuracy and image registration are not verified. A reference pattern is not an individual's neurotransmitter amount. The app makes no diagnostic or treatment efficacy claim.

## Credits

The geometry and numeric contract derive from the existing StarLens atlas at commit `25c9d10b449edf017f7ab84923aeab2a32496276`. DopaTeam's numerical functions are retained. See the [upstream repository](https://github.com/Rifelimo/DopaTeam), [asset provenance](public/atlas/PROVENANCE.md) and [FreeSurfer license](public/atlas/LICENSE-FreeSurfer.txt). Converted templates are modified assets and must retain their notices.

Pierce B.'s educational brain tool, described by the user, inspired the decomposition concept. Its page could not be inspected in this environment and its code, meshes and BodyParts3D assets are not included. This app contains 82 selectable structures, not the reference's stated 263 meshes.

## Vercel deployment

The primary production deployment is https://starlens-brain-atlas.vercel.app/ . The dedicated Vercel project uses Vite, build command `npm run build`, and output directory `dist`. The combined build contains 26 files. See VERIFICATION.md for verification scope and check the latest Vercel deployment before treating new routes as live. GitHub source publication is complete. The Vercel GitHub App is connected to this repository and the production branch is `main`. Pushing to `main` starts an automatic Vercel production deployment. Check its deployment status before treating a change as live. Manual publication is also available from this linked directory with `vercel deploy --prod --yes`.

## GitHub source and secondary Pages deployment

Repository https://github.com/sese0318/starlens-brain-atlas

Primary site https://starlens-brain-atlas.vercel.app/

The main branch runs .github/workflows/pages.yml. GitHub Actions installs the locked dependencies, runs the 63 automated checks, builds Vite and deploys dist to GitHub Pages. A successful deployment is required before the site reflects a new commit. Relative asset paths support the repository subdirectory.

To publish a reviewed local commit from this independent checkout, run the tests and build, then push it to the repository's main branch. Review the Publish StarLens run in the repository Actions tab. Workflow dispatch supports a manual redeployment of a selected ref. Repository Settings > Pages controls publication, including unpublishing the site. Disabling the workflow stops future automatic updates but does not remove the existing site.

The original StarLens Sites app, Vercel websites and separate workbench are independent. This repository publishes both the original Neural Observatory and the later Anatomy Studio. No patient data is bundled and uploaded files remain in the browser.
