# Tablekeep — Player & Homebrew Studio v0.5.1

Static D&D 5e companion for GitHub Pages and Owlbear Rodeo. This revision focuses on a Play5e-ordered Character Maker, schema-based Homebrew editor, and compact responsive layout for 400×625 popovers.

## Main features
- 10-step Character Maker: Class → Race → Subclass → Ability Scores → Background → Skills → Feats → Equipment → Spells → Details.
- Choice validation and dependency resets; no silent default selection for class/species or choice equipment.
- Class-level ASI/Feat progression and 2024 Epic Boon selection.
- Type-specific Homebrew forms for classes, subclasses, species, backgrounds, feats, spells, equipment, magic items and weapon masteries.
- Homebrew content is merged into matching in-app catalogues and can be edited or exported.
- Responsive navigation: collapsible desktop sidebar, mobile drawer, compact builder progress and sticky actions.
- Original 2014/2024 JSON data files are retained separately and loaded directly.

## Local preview (Windows)

## GitHub Pages
1. Upload the contents of this folder to the repository root.
2. Set **Settings → Pages → Source: GitHub Actions**.
3. Push to `main` and wait for the Pages workflow to finish.
4. Open the deployed Pages URL.

## Owlbear Rodeo
Register the deployed `manifest.json` URL as the extension manifest. The popover starts at 400×625 and the app uses responsive CSS for other host sizes. The SDK connection shell is present; room/token synchronisation is not implemented in this revision.

## Project files
- `index.html`: UI shell and navigation.
- `assets/app.css`: theme and responsive layout.
- `assets/app.js`: application logic, builder, homebrew, library and data loading.
- `data/2014/`, `data/2024/`: imported rules catalogues.
- `manifest.json`: Owlbear extension manifest.
- `.github/workflows/pages.yml`: GitHub Pages deployment.

## Data and storage
Character and Homebrew data are saved in browser localStorage. Export a workspace backup before clearing browser data or moving to another device. Imported catalogue JSON files are not modified.

## Validation status
Node.js syntax check and JSON integrity checks are run on this package. Please complete the manual steps in `TEST-PLAN-v0.5.1.md`, especially the 400×625 layout and Character Maker/Homebrew flows, before replacing the live Pages version.

## Licensing
The app UI and code are an original Tablekeep rebuild. The data files were supplied in `P5e.7z`; verify applicable source and content licences before making a public repository or redistributing the package.