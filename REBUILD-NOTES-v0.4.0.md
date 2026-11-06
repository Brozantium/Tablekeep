# Tablekeep v0.5.0 — P5e-inspired rebuild

This rebuild uses the supplied P5e.7z archive as a reference for the guided character-creation flow and uses the supplied 2014/2024 JSON catalogues already bundled with Tablekeep. It is an original Tablekeep implementation; it does not redistribute the P5e compiled application bundle. See `P5E-ARCHIVE-ANALYSIS.md` for the archive inspection.

## Changes
- Class subclass options now read `subclassOptions` where available and respect the class unlock level.
- Starting character level can be set before subclass, feat, and spell selection.
- Species selection includes subrace/lineage choices and visible trait previews.
- Ability scores support Standard Array, Point Buy (27-point validation), and Manual methods. Species and 2024 background ability choices are shown and applied separately.
- Background fixed skill proficiencies are locked and identified; background skill choices and class skill choices are separately limited to their source lists and counts.
- Feats granted by a 2024 background or species are identified with their source. Optional feat selection is no longer presented as an unexplained level-1 bonus; it appears from level 4.
- Equipment choices are drawn from selected class `startingEquipmentOptions` and background `equipmentOptions`, and are stored with the character.
- Spell selection is hidden for non-spellcasting classes, filtered by class and available spell level, and applies known/prepared/cantrip counts when the source progression supplies them.
- Character save records subrace, ability bonuses, skill sources, feat sources, equipment choice selections, and derived level-1 HP/AC.
- Builder progress/active step indicators are updated when navigating steps.
- Database startup shows a visible 0/16 progress indicator, uses browser caching, times out stalled requests, and preserves the page selected while loading.

## Validation
- JavaScript syntax checked with Node.
- All 15 imported 2014/2024 catalogue JSON files parse and SHA-256 match the supplied P5e archive.
- ZIP integrity checked.
- A full interactive browser test and Owlbear room-sync test are not claimed in this build. Chromium headless testing stalled in the execution environment, so please test the ZIP in your browser before replacing your live GitHub Pages files.