# Original Neural Observatory

This directory contains the source of the first StarLens 3D Neural Observatory requested by the owner, independently from the later Anatomy Studio at the repository root.

Original live page https://starlens-brain-atlas.sese16180.chatgpt.site/observatory

New live page https://starlens-brain-atlas.vercel.app/observatory

The Sites API confirms version 5 was built from commit 25c9d10b449edf017f7ab84923aeab2a32496276. The application files were exported from that commit. The later unpublished workbench ca245175 is not included. The original Sites deployment identity was omitted from this portable source directory. Third-party licenses and provenance are preserved.

Root npm ci installs both applications. Root npm test runs both suites. Root npm run build builds Anatomy Studio and this original app, then combines their outputs. The merge refuses to overwrite unequal shared assets and preserves Anatomy Studio's root index.html. The original app remains at observatory.html, with Vercel cleanUrls exposing /observatory. Its linked analysis page remains at /prototype. Do not add a trailing slash to the Observatory URL because the unchanged application uses relative paths.

The root vercel.json governs deployment. The vercel.json in this snapshot is historical upstream configuration and must not be used to deploy the combined project. The legacy landing-page source in this directory is retained for provenance but is not in the app's Vite build inputs.

To develop this app independently, run npm run dev from this directory. No patient data is bundled. The original synthetic JSON, explicit anatomical ID mapping, 3D stage and English guidance are unchanged.
