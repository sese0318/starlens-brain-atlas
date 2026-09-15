import React from 'react';

export default function AtlasHelp({onClose,onDemo,onRegions,onData}){
  return <aside className="observatory-help" aria-label="How to use the atlas" lang="en">
    <div className="help-heading"><h2>How to use the atlas</h2><button onClick={onClose} aria-label="Close guide">×</button></div>
    <p>This is a standard anatomical viewer with regional overlays. The demo does not identify atrophied tissue in a patient.</p>
    <ol className="help-steps">
      <li><h3>Select a region</h3><p>Drag the brain to rotate and scroll to zoom. Click a region, or choose it from the region list. In Anatomy, cyan marks your selection, not tissue loss. Look inside reveals standard deep structures, including the hippocampus.</p><button onClick={onRegions}>Open region list</button></li>
      <li><h3>Load a ready-to-use dummy file</h3><p>Load dummy data imports a small JSON file with values for all 68 cortical regions. Blue means lower values, orange means higher values, and gray means no value. The white outline marks the selected region.</p><p>These are fictional patterns for software demonstration, not study findings. Values have arbitrary units. A negative number is not a percentage of atrophy or a measured effect size.</p><button className="help-primary" onClick={onDemo}>Load dummy data</button></li>
      <li><h3>Switch patterns and compare</h3><p>Open Data &amp; evidence and change Profile between the temporal, frontal and mixed dummy patterns. Choosing a profile displays its regional values. Choosing a Reference displays that artificial map. Click the same region to compare its numbers in both layers.</p><p>Each layer uses its own minimum and maximum. The panel also shows a descriptive correlation using DopaTeam's existing comparison code. It is an association between fictional inputs, not evidence about disease.</p></li>
    </ol>
    <h3>How this fits StarLens</h3>
    <p>The viewer supports anatomical exploration and regional pattern comparison. A spatial association can suggest a research question, but it cannot establish the cause of atrophy, an individual's neurotransmitter level, cell function or treatment response.</p>
    <p>DopaTeam's separate model illustrates why the same structural pattern can accompany different assumed functional states. This viewer does not determine those states from the colors.</p>
    <h3>What is connected?</h3>
    <p>The shape and labels come from a standard brain atlas. The dummy file and its saved comparison results are generated ahead of time, so the viewer needs no raw scans or long computation. The paper's MRI measurements and PET-derived reference maps are not bundled. The brain shape stays the same when values change.</p>
    <h3>Download and reload the input</h3>
    <p>In Data &amp; evidence, choose Download dummy JSON, then Open atlas JSON and select that file. Save atlas data JSON exports the loaded data with its source and synthetic label. Download dummy comparison results saves the calculated dummy associations. Reloading the page clears unsaved data.</p>
    <h3>Use real research values</h3>
    <p>Open Data &amp; evidence and choose Get data template. Have the researcher confirm the atlas, region names, measurement units, contrast and sign convention. Supply the profile and reference values for the same 68 cortical IDs, retain missing entries as null, and record their sources. Then use Open atlas JSON.</p>
    <p>For a cases-minus-controls volume contrast, negative values can mean lower volume in the case group. That would appear toward blue, not orange. Always use the definition supplied with the data.</p>
    <p>The importer checks IDs and numeric format, not biological accuracy or image registration. A reference receptor map describes its source population, not the scanned individual. The 14 deep structures are anatomical display only.</p>
    <button onClick={onData}>Open data &amp; evidence</button>
    <p><a href="./atlas/SCIENTIFIC_READINESS.md" target="_blank" rel="noreferrer">Read the data and concept audit</a></p>
  </aside>;
}
