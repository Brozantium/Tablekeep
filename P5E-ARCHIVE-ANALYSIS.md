# P5e.7z archive inspection

The supplied archive contains a built web application, not editable React source: `index.html`, compiled JavaScript chunks under `assets/`, and CSS bundles. The HTML refers to several hashed assets that are not present in the archive (for example `assets/index-LPPEBOoe.js`, `assets/jsx-runtime-BeV9_fra.js`, `assets/state-BrIavbbF.js`, plus `/theme.js` and image paths). The included bundle names differ, so the archive is not a complete drop-in runnable website as supplied.

The archive also contains the source data catalogues: 2014 (7 JSON files) and 2024 (8 JSON files). All 15 catalogue JSON files in the Tablekeep v0.3.1 package were compared against the P5e archive and their SHA-256 hashes match exactly. Tablekeep additionally contains the separately indexed 351-monster catalogue.

The v0.5.0 rebuild continues to use the P5e archive as a behavioral and schema reference for its guided builder sequence and content model, while keeping a distinct Tablekeep implementation and its own visual identity.