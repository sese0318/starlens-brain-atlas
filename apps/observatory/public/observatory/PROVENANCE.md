# StarLens Neural Observatory

The presentation stage was authored for this project with Higgsfield 3D Jutsu using Blender 5.2. It contains a machined display plinth, index rings, an illuminated arch, a floor, and presentation lights. The stage contains no brain geometry, biological pathways, or research measurements.

Higgsfield project 781140a3-9a19-4c74-b872-3f374bf09232, committed revision 1. The final successful authoring operation was starlens-observatory-stage-02 on 2026-09-14. This asset is stage.glb, 382968 bytes.

The interactive application separately loads the existing fsaverage5 cortical atlas and the 14 fsaverage deep structures. Their source positions, labels, provenance and redistribution license are unchanged. See ../atlas/PROVENANCE.md and ../atlas/LICENSE-FreeSurfer.txt. The renderer applies a display transform to combine the standard anatomy and presentation stage; the stage is not a scanner or a measurement device.

The anatomical presentation adds curvature-based shading without moving any atlas vertices. Quantitative layers use unlit materials with fog, tone mapping, and bloom disabled for the data colors. A narrow boundary indicates the selected cortical region. Procedural demo values remain explicitly identified as synthetic.

The browser's Download 3D model action exports the visible scene to a metre-scale GLB with context and the complete FreeSurfer license embedded in the root object's extras. It retains display separation and material state. For quantitative source arrays use Save atlas data JSON instead.
