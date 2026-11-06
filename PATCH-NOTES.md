# Tablekeep v0.3.1 — startup/loading fix

## Root cause fixed
The v0.3.0 `bind()` function attached a `change` listener directly to `#importFile`. That input is created only when the Settings page is rendered, so it does not exist during initial startup. Calling `addEventListener` on the missing element threw a TypeError before `loadDatabase()` could run. The visible symptom was that page navigation kept showing “Opening your library…”.

## Changes
- Moved the workspace import listener to delegated `document` change handling, so it works when Settings dynamically creates the input.
- Moved `bind()` inside `init()`'s try/catch so any further startup error appears in the UI.
- Added a 30-second timeout to JSON requests.
- Added per-file load diagnostics. A single missing or failed content file no longer blocks the full application; other libraries still load.
- Added a retry button for genuine startup failures.

The original JSON content files are unchanged.
