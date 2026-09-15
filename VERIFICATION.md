# Verification record

## Vercel production publication on 15 September 2026

The dedicated starlens-brain-atlas Vercel project deployed successfully with status READY. The primary URL is https://starlens-brain-atlas.vercel.app/ and deployment ID is dpl_3i65fx6mkh6CSFVV1gtGzWEoM8UQ. All 15 anonymous HTTPS requests returned 200 and every file matched the local dist SHA256 hash, including the Windows line endings in the license. Vercel's error-log query returned no matching logs. No browser interaction was tested.

The application source is unchanged from 0cb14fc81e8433ee00e3a8f52269392cc5b595d0. The Vercel CLI added local project metadata and an ignored environment file. No credentials are committed. After the repository owner granted the Vercel GitHub App access, native GitHub connection succeeded. The Vercel project reports sese0318/starlens-brain-atlas with productionBranch main. Deployment results for subsequent commits are available on the repository and Vercel dashboard.


## Publication continuation on 15 September 2026

The existing 25 automated checks and a fresh production build passed. The working tree began clean at 55d31a5053199b8f6600c36708599b420d73bb60. Publication changes add a GitHub Pages workflow and documentation only; application code and anatomy assets are unchanged. Elevated GitHub reads now succeed. No browser connection is available in this session, so interactive desktop, mobile and WebGL verification remains incomplete. Earlier policy failures below describe the preceding session, not the current GitHub permission state. Check the repository Actions run for deployment status.

## Original implementation verification

## Passed

The production Vite build succeeds after integration and review fixes. Its entry contains the React mount, application module, CSS and Three.js renderer. The final build contains 25 transformed modules.

`npm test` passes 25 checks across imported numerical fixtures, source anatomy integrity, ID-aware import ordering, null handling, malformed input rejection, preserved source evidence, synthetic CLI determinism, anatomical grouping, visibility composition, compact parcel bounds, per-part borders, preserved source triangles and exact decomposition restoration.

Independent review confirmed that region inspector indexes, mesh color indexes and source vectors share the same explicit cortical order. Deep structures have no numeric binding. Visibility does not alter scales or correlation inputs.

Review fixes include camera fitting after isolation, showing structures hidden by other filters, recovering cortical visibility when loading data from a deep-only view, suppressing invented bounds on all-null layers, and including a categorical anatomy legend. Numeric surfaces remain opaque to keep displayed colors aligned with the legend.

## Not verified

Browser security policy denied access to the reference site and to the local application at port 5196. No alternate browser or rendering mechanism was used to bypass those denials. The application was not visually inspected, and desktop, mobile, touch, picking, file chooser and live WebGL behavior remain unverified. Geometry and source-code checks do not replace that verification.

Vercel deployment and GitHub blob creation were rejected because the current approval policy cannot grant required approvals. No GitHub push, new GitHub repository or public deployment was completed by this task. Existing remote repositories and websites were preserved.

The approximately 819 KB uncompressed application JavaScript bundle triggers Vite's advisory 500 KB chunk warning. It compresses to about 220 KB. Geometry assets total about 3.35 MB of JSON. Actual mobile frame rate and loading experience remain unmeasured.

## Clinical scope

No patient MRI, measured atrophy, study receptor values, image registration or clinical validation has been connected. The demo values are synthetic. Imported values are checked for structure and identifier alignment only.
