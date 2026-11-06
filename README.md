# Tablekeep — Player & Homebrew Studio v0.4.0

A hosted static D&D companion designed around **Player Studio** and **Homebrew Studio**, with a searchable rules/content library and a separate DM workspace. The intended runtime is GitHub Pages; users open the deployed website directly. No local server or local run script is required.

## What's included

- Player-first home/dashboard, character vault, 10-step character builder, and character sheet view.
- Homebrew editor for classes, subclasses, species/races, backgrounds, feats, spells, equipment, magic items, and weapon masteries.
- Searchable Content Library that renders full nested JSON records rather than a name-only index.
- Separate 2014 and 2024 data directories. The application reads the supplied JSON files directly; no manual conversion or editing of each content record is required.
- A 351-entry scraped monster name/URL index retained from the earlier Tablekeep prototype.
- Local browser storage for characters, homebrew, combatants, and dice history, with workspace export/import.
- All application JavaScript and CSS are in `assets/`.

## GitHub Pages

1. Create or use a **public** repository if you want GitHub Pages on GitHub Free.
2. Upload the contents of this folder to the repository root (including `.github/workflows/pages.yml`).
3. In **Settings → Pages**, set Source to **GitHub Actions**.
4. Push to `main` (or run the workflow manually from Actions). GitHub Actions publishes `index.html`, `assets/`, and `data/` and rewrites the Owlbear manifest URL automatically.
5. Open the Pages URL shown in **Actions → Deploy Tablekeep to GitHub Pages → deploy job**. Use that hosted URL every time; do not open the files from your PC.

## Owlbear Rodeo

After GitHub Pages deploys, use the deployed `manifest.json` URL as the extension manifest URL. The app detects `?mode=owlbear` and attempts to load the Owlbear SDK. The current build establishes the extension shell and standalone fallback; room/token synchronisation and fully rules-aware character automation remain separate implementation steps.

## Folder map

```text
index.html                 UI shell
assets/app.css             visual theme and responsive layout
assets/app.js              app logic, data loading, navigation and interactions
manifest.json              Owlbear extension manifest (URLs rewritten by Pages workflow)
data/2014/*.json            original 2014 content files
data/2024/*.json           original 2024 content files
data/catalogs/monsters.json earlier monster name/URL index
.github/workflows/pages.yml GitHub Pages deployment
```

## Hosting and processing model

GitHub Pages hosts the application files and JSON database. GitHub Actions only packages and deploys those static files; the app JavaScript runs in the visitor’s browser after the Pages site is opened. Character data and Homebrew entries are stored in that browser’s local storage unless the user exports them. There is no Python server, local HTTP server, or backend database in this build.

## Data loading

The JSON records are preserved as delivered in the uploaded archive. The app fetches files from `data/2014/` or `data/2024/` based on the edition switch. The Content Library shows all fields, including nested traits, progression tables, features, prerequisites, spell details, equipment properties and descriptions. `masteries.json` is available in the 2024 ruleset only.

Homebrew records are stored separately in browser local storage and can be exported. They do not overwrite the imported reference JSON files.

## Important data/licensing note

The JSON files were supplied by the user in `P5e.7z` and are included unchanged in this working package. Their inclusion here is not a representation that every record is cleared for public redistribution. Before making a public repository or distributing the content, verify the applicable source-site terms and content licences. Keep the repository private until those rights are confirmed if you are unsure.

This build uses an original Tablekeep UI and application script. It does not bundle the source site's compiled application JavaScript or CSS.

## v0.4.1 hosting change

- Removed `run-local.bat` and all instructions to run a local server.
- GitHub Pages via GitHub Actions is the only supported deployment path.
- Kept relative asset and data URLs so the project works under the repository Pages subpath.

## v0.4.0 startup fix

- Fixed startup failure caused by binding the workspace-import file input before the Settings page creates it. The change listener now uses event delegation.
- Wrapped initial event binding in the startup error handler.
- Added a 30-second timeout to JSON fetches and per-file loading diagnostics so one stalled request cannot leave the interface loading forever.


## v0.4.0 rebuild

See `REBUILD-NOTES-v0.4.0.md` and `P5E-ARCHIVE-ANALYSIS.md` for the P5e-based builder improvements and archive inspection.
