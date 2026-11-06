# Tablekeep v0.5.0 — P5e-aligned maker & compact UI

## Main changes
- Character Maker follows the Play5e sequence: Class, Race, Subclass, Ability Scores, Background, Skills, Feats, Equipment, Spells, Details.
- No class or species is silently auto-selected. Continue and step navigation validate required choices.
- Class, species, background and subclass changes clear only dependent choices; background skill picks are not silently marked as class picks.
- Class-level ASI/Feat choices are derived from the selected class progression, with both +2 to one score and +1 to two scores. 2024 Epic Boon choices are separated at level 19.
- Feat options are filtered by level, ability prerequisites, spellcasting/fighting-style requirements and the correct 2024 feat category.
- Flexible species/background ability increases support +2/+1 or three +1 where the imported schema indicates it.
- Equipment option groups no longer pre-check a choice group before the player chooses; required choices are validated.
- Homebrew now has type-specific field layouts for classes, subclasses, species, backgrounds, feats, spells, equipment, magic items and weapon masteries. Nested P5e-shaped data is accepted as validated JSON fields. Homebrew records can be edited and are merged into the relevant in-app catalogue; subclasses can be linked to their parent class.
- Sidebar can be collapsed on desktop and opens as a drawer on narrow screens. Builder navigation and controls are compact at 400×625.

## Validation
- JavaScript syntax checked with Node.js.
- Imported 2014/2024 catalogue JSON retained unchanged.
- Responsive CSS and builder states require final hands-on testing in browser/Owlbear at 400×625.

## Known limitations to test
- Complex multiclass progression, full language/tool-choice flows, and every nested homebrew advancement are not yet complete.
- Prerequisite filtering handles common level, ability-score, spellcasting, fighting-style and feat dependencies; campaign/source prerequisites still need user/source selection support.
- This is a static browser app; local homebrew and characters remain in browser storage and must be exported for backup.