# Tablekeep v0.5.0 — Test plan

## 400×625 / Owlbear popover
- [ ] Open at 400×625. No horizontal page scroll.
- [ ] Sidebar opens as a drawer, closes after navigation and via scrim.
- [ ] Builder step strip scrolls horizontally; content and bottom actions remain reachable.
- [ ] Dialogs scroll internally and Save/Cancel remain visible.

## Character Maker
- [ ] Continue from Class without choosing a class is blocked.
- [ ] Continue from Race without choosing a species is blocked.
- [ ] Class → Race → Subclass → Ability Scores → Background order is preserved.
- [ ] Changing class clears subclass/class skills/spells/class equipment and keeps unrelated background choices.
- [ ] Changing species clears species lineage, species ASI and species feat selections only.
- [ ] Changing background clears background skills/ASI/feat/equipment only.
- [ ] Subclass is required only when unlocked and options exist.
- [ ] Background/class skill checkboxes only show checked after actual selection or a fixed grant.
- [ ] Species/background flexible ASI supports +2/+1 and three +1.
- [ ] Class ASI/Feat unlocks follow the selected class progression; +2 one / +1 two ASI options work; level 19 Epic Boon is separated in 2024.
- [ ] Feat prerequisites, level, class features and 2024 categories filter the available list.
- [ ] Equipment choice groups start unselected and block Continue until required groups are chosen.
- [ ] Non-spellcasting class can pass the Spells step without a spell selection.
- [ ] Saving without a name or required choices is blocked.
- [ ] Saved character appears in the vault; Edit build restores the saved choices.

## Homebrew
- [ ] Create one entry in each supported type: Spell, Class, Subclass, Species, Background, Feat, Equipment, Magic Item.
- [ ] Changing content type switches the field schema.
- [ ] Invalid nested JSON blocks saving with an error.
- [ ] Spell level and class hit die validation work.
- [ ] Subclass requires parent class ID or name.
- [ ] Saved homebrew appears in the local library and matching builder list.
- [ ] Homebrew subclass appears only for its linked parent class.
- [ ] Edit an entry, save it, and confirm it updates instead of duplicating.
- [ ] Export Homebrew JSON and confirm it contains the saved type-specific fields.
- [ ] Export workspace JSON and import it again to confirm homebrew persists.

## Regression
- [ ] 2014 and 2024 edition switches load correct catalogues.
- [ ] Character sheet opens for saved characters.
- [ ] Export/import workspace works.
- [ ] GitHub Pages workflow deploys; Owlbear manifest loads from the deployed URL.