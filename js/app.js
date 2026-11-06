const APP_ID = 'com.tablekeep.dnd-toolkit';
const ROOM_KEY = `${APP_ID}/combat`;
const ITEM_KEY = `${APP_ID}/stats`;
const STORAGE_KEY = 'tablekeep.dm-toolkit.v1';
const PAGE_SIZE = 24;

const demoState = {
  round: 2,
  activeId: 'mira',
  combatants: [
    { id: 'mira', name: 'Mira Thornwood', kind: 'Half-elf ranger', initiative: 18, hp: 31, maxHp: 38, ac: 15, conditions: ['Hunter’s Mark'], side: 'player', glyph: '♙' },
    { id: 'ash', name: 'Ash Calder', kind: 'Human paladin', initiative: 15, hp: 42, maxHp: 46, ac: 18, conditions: [], side: 'player', glyph: '♜' },
    { id: 'goblin', name: 'Goblin Scout', kind: 'Small humanoid', initiative: 13, hp: 5, maxHp: 7, ac: 15, conditions: ['Prone'], side: 'enemy', glyph: '♟' },
    { id: 'bryn', name: 'Bryn Ironfoot', kind: 'Mountain dwarf cleric', initiative: 9, hp: 27, maxHp: 34, ac: 17, conditions: [], side: 'player', glyph: '♙' },
  ],
  characters: [
    { id: 'char-mira', name: 'Mira Thornwood', className: 'Half-elf · Ranger', level: 5, hp: 31, maxHp: 38, ac: 15, initials: 'MT', stats: { STR: 10, DEX: 18, CON: 14 } },
    { id: 'char-ash', name: 'Ash Calder', className: 'Human · Paladin', level: 5, hp: 42, maxHp: 46, ac: 18, initials: 'AC', stats: { STR: 16, DEX: 10, CON: 15 } },
    { id: 'char-bryn', name: 'Bryn Ironfoot', className: 'Mountain dwarf · Cleric', level: 5, hp: 27, maxHp: 34, ac: 17, initials: 'BI', stats: { STR: 13, DEX: 10, CON: 16 } },
  ],
  notesTitle: 'Session 04 — The Shattered Coast',
  notesBody: 'The party reaches the old lighthouse.\n\n• The keeper knows more than he admits.\n• A blue flame flickers below the cliffs.\n• Remember to ask about the missing signet.\n\nNext session: follow the smugglers’ trail below the lighthouse.',
  savedEncounters: [{ id: 'enc-1', name: 'Ambush at the Old Road', count: 3, updated: 'Demo encounter' }],
  encounterBuild: [],
  diceHistory: [],
};

let state = loadState();
let catalogs = { monsters: [], spells: [], items: [] };
let pages = { monsters: 1, spells: 1, items: 1 };
let OBR = null;
let obrReady = false;
let sceneTokens = [];
let selectedDetail = null;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const esc = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return saved ? { ...structuredClone(demoState), ...saved } : structuredClone(demoState);
  } catch {
    return structuredClone(demoState);
  }
}
function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { toast('Could not save local data. Browser storage may be full.', 'warn'); }
}
function sortCombatants() {
  state.combatants.sort((a, b) => Number(b.initiative || 0) - Number(a.initiative || 0));
}
function toast(message, type = 'success') {
  const region = $('#toastRegion');
  const node = document.createElement('div');
  node.className = `toast ${type}`;
  node.textContent = message;
  region.append(node);
  window.setTimeout(() => node.remove(), 3000);
}
function pageName(page) {
  return ({ overview: 'Overview', combat: 'Combat tracker', encounters: 'Encounters', characters: 'Characters', bestiary: 'Bestiary', spells: 'Spellbook', items: 'Magic items', notes: 'Session notes', dice: 'Dice roller', settings: 'Settings' })[page] || 'Overview';
}
function navigate(page) {
  if (!$(`[data-view="${page}"]`)) page = 'overview';
  $$('.page-view').forEach((view) => view.classList.toggle('hidden', view.dataset.view !== page));
  $$('.nav-item').forEach((button) => button.classList.toggle('active', button.dataset.page === page));
  $('#breadcrumbCurrent').textContent = pageName(page);
  closeSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (page === 'combat') renderCombat();
  if (page === 'characters') renderCharacters();
  if (page === 'encounters') renderEncounters();
  if (page === 'dice') renderDiceHistory();
}
function openSidebar() {
  $('#sidebar').classList.add('open');
  $('#mobileScrim').classList.add('show');
}
function closeSidebar() {
  $('#sidebar').classList.remove('open');
  $('#mobileScrim').classList.remove('show');
}

async function loadCatalogs() {
  const targets = [
    ['monsters', './data/monsters.json'],
    ['spells', './data/spells.json'],
    ['items', './data/magic_items.json'],
  ];
  const results = await Promise.all(targets.map(async ([key, path]) => {
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const payload = await response.json();
      return [key, Array.isArray(payload.items) ? payload.items : []];
    } catch (error) {
      console.warn(`Unable to load ${path}`, error);
      return [key, []];
    }
  }));
  for (const [key, items] of results) catalogs[key] = items;
  $('#navMonsterCount').textContent = catalogs.monsters.length;
  $('#navSpellCount').textContent = catalogs.spells.length;
  $('#navItemCount').textContent = catalogs.items.length;
  $('#metricMonsters').textContent = catalogs.monsters.length;
  $('#metricSpells').textContent = catalogs.spells.length;
  $('#metricItems').textContent = catalogs.items.length;
  renderCatalog('monsters');
  renderCatalog('spells');
  renderCatalog('items');
}

function renderCatalog(type) {
  const inputId = type === 'monsters' ? 'monsterSearch' : type === 'spells' ? 'spellSearch' : 'itemSearch';
  const rootId = type === 'monsters' ? 'monsterCatalog' : type === 'spells' ? 'spellCatalog' : 'itemCatalog';
  const countId = type === 'monsters' ? 'monsterCountLabel' : type === 'spells' ? 'spellCountLabel' : 'itemCountLabel';
  const paginationId = type === 'monsters' ? 'monsterPagination' : type === 'spells' ? 'spellPagination' : 'itemPagination';
  const query = ($('#' + inputId)?.value || '').trim().toLowerCase();
  const source = catalogs[type];
  const filtered = query ? source.filter((item) => item.name.toLowerCase().includes(query)) : source;
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  pages[type] = clamp(pages[type], 1, pageCount);
  const start = (pages[type] - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);
  $('#' + countId).textContent = `${filtered.length.toLocaleString()} indexed records`;
  const glyph = type === 'monsters' ? '♜' : type === 'spells' ? '✧' : '◇';
  $('#' + rootId).innerHTML = rows.length ? rows.map((item) => `
    <button class="catalog-row" data-catalog-type="${type}" data-catalog-name="${esc(item.name)}" data-catalog-url="${esc(item.url)}">
      <span class="catalog-name"><span class="catalog-glyph">${glyph}</span><strong>${esc(item.name)}</strong></span>
      <span class="catalog-source">SOURCE ↗</span>
    </button>`).join('') : `<div class="empty-state">No matching records. Try a different search.</div>`;
  $('#' + paginationId).innerHTML = `<span>Showing ${filtered.length ? start + 1 : 0}–${Math.min(start + PAGE_SIZE, filtered.length)} of ${filtered.length}</span><div class="pagination-controls"><button data-page-type="${type}" data-page-step="-1" ${pages[type] <= 1 ? 'disabled' : ''}>‹</button><button disabled>${pages[type]} / ${pageCount}</button><button data-page-type="${type}" data-page-step="1" ${pages[type] >= pageCount ? 'disabled' : ''}>›</button></div>`;
}

function renderMiniInitiative() {
  sortCombatants();
  const list = $('#miniInitiativeList');
  const active = state.combatants.find((c) => c.id === state.activeId) || state.combatants[0];
  const next = active ? state.combatants[(state.combatants.indexOf(active) + 1) % Math.max(state.combatants.length, 1)] : null;
  $('#nextTurnName').textContent = next?.name || 'No combatants';
  $('#nextTurnInit').textContent = next?.initiative ?? '—';
  $('#roundSummary').textContent = `Round ${state.round} · ${state.combatants.length} combatants`;
  list.innerHTML = state.combatants.slice(0, 4).map((c) => `
    <div class="mini-initiative-row"><span class="mini-portrait ${c.side === 'player' ? 'player' : ''}">${esc(c.glyph || (c.side === 'player' ? '♙' : '♟'))}</span><div><div class="mini-row-name">${esc(c.name)}</div><div class="mini-row-type">${esc(c.kind || 'Combatant')}</div></div><span class="mini-row-init">${Number(c.initiative || 0)}</span></div>`).join('') || '<div class="empty-state">No active combatants.</div>';
  $('#metricCombatants').textContent = state.combatants.length;
}

function renderCombat() {
  sortCombatants();
  $('#roundNumber').textContent = state.round;
  const root = $('#combatantList');
  root.innerHTML = state.combatants.map((c) => {
    const hasHp = Number.isFinite(Number(c.hp)) && Number.isFinite(Number(c.maxHp)) && c.maxHp > 0;
    const hpPct = hasHp ? clamp((c.hp / c.maxHp) * 100, 0, 100) : 0;
    const isLow = hasHp && hpPct <= 30;
    return `<div class="combatant-row ${c.id === state.activeId ? 'is-active' : ''}" data-combatant-id="${esc(c.id)}">
      <div class="combat-initiative">${c.id === state.activeId ? '<span class="active-arrow">▶</span>' : ''}${Number(c.initiative || 0)}</div>
      <div class="combat-name-cell"><span class="combat-avatar ${c.side === 'player' ? 'player' : 'enemy'}">${esc(c.glyph || (c.side === 'player' ? '♙' : '♟'))}</span><span><strong>${esc(c.name)}</strong><small>${esc(c.kind || 'Combatant')}${c.ac ? ` · AC ${esc(c.ac)}` : ''}</small></span></div>
      <div class="hp-controls"><button data-hp-change="-1" data-id="${esc(c.id)}" aria-label="Reduce HP">−</button><div class="hp-meter"><span class="hp-value ${isLow ? 'low' : ''}">${hasHp ? `${c.hp} / ${c.maxHp}` : '— / —'}</span>${hasHp ? `<div class="hp-track"><span class="${isLow ? 'low' : ''}" style="width:${hpPct}%"></span></div>` : ''}</div><button data-hp-change="1" data-id="${esc(c.id)}" aria-label="Restore HP">＋</button></div>
      <div class="condition-tags">${(c.conditions || []).map((condition) => `<span class="condition-tag">${esc(condition)}</span>`).join('') || '<span class="condition-empty">No conditions</span>'}</div>
      <button class="row-more" data-combat-more="${esc(c.id)}" aria-label="More options">•••</button>
    </div>`;
  }).join('') || '<div class="empty-state" style="margin:14px">No combatants. Add one or sync Owlbear tokens.</div>';
  $('#combatFooterCount').textContent = `${state.combatants.length} combatants in initiative`;
  $('#combatSyncFootnote').textContent = obrReady ? `${sceneTokens.length} scene token${sceneTokens.length === 1 ? '' : 's'} loaded · room sync active` : 'Local demo encounter';
  renderMiniInitiative();
}

function renderCharacters() {
  $('#characterGrid').innerHTML = state.characters.map((character) => `
    <article class="character-card panel"><div class="character-banner"><div class="character-monogram">${esc(character.initials || character.name.slice(0, 2).toUpperCase())}</div><span class="character-level">LEVEL ${character.level}</span></div><div class="character-body"><div class="character-name">${esc(character.name)}</div><div class="character-class">${esc(character.className || 'Adventurer')}</div><div class="character-stat-grid"><div class="character-stat"><strong>${character.hp}/${character.maxHp}</strong><small>HIT POINTS</small></div><div class="character-stat"><strong>${character.ac}</strong><small>ARMOR CLASS</small></div><div class="character-stat"><strong>+3</strong><small>PROFICIENCY</small></div></div><div class="character-card-footer"><span>STR ${character.stats?.STR ?? 10} · DEX ${character.stats?.DEX ?? 10} · CON ${character.stats?.CON ?? 10}</span><button data-character-edit="${esc(character.id)}">Edit sheet ↗</button></div></div></article>`).join('') || '<div class="empty-state">No characters yet. Create your first character.</div>';
}

function renderEncounters() {
  $('#savedEncounterCount').textContent = state.savedEncounters.length;
  $('#encounterBuildList').innerHTML = state.encounterBuild.length ? state.encounterBuild.map((item, index) => `<div class="encounter-entry"><span class="catalog-glyph">♜</span><span>${esc(item.name)}<small> · ${esc(item.kind || 'Creature index')}</small></span><button data-remove-build="${index}">Remove</button></div>`).join('') : '<div class="empty-state">Your encounter is empty. Search for a creature above to begin.</div>';
  $('#savedEncounterList').innerHTML = state.savedEncounters.length ? state.savedEncounters.map((enc) => `<div class="saved-encounter-row"><span class="saved-encounter-icon">✣</span><span class="saved-encounter-copy"><strong>${esc(enc.name)}</strong><small>${enc.count} creatures · ${esc(enc.updated || 'Saved locally')}</small></span><button data-load-encounter="${esc(enc.id)}">Load</button></div>`).join('') : '<div class="empty-state">No saved encounters yet.</div>';
}

function renderDiceHistory() {
  $('#diceHistoryList').innerHTML = state.diceHistory.length ? state.diceHistory.slice(0, 12).map((roll) => `<div class="dice-history-row"><span>${esc(roll.expression)} <small>· ${esc(roll.detail)}</small></span><strong>${roll.total}</strong></div>`).join('') : '<div class="empty-state">Your rolls will appear here.</div>';
}

function openDetail(type, item) {
  selectedDetail = { type, item };
  const title = item.name;
  const kind = type === 'monsters' ? 'BESTIARY INDEX' : type === 'spells' ? 'SPELLBOOK INDEX' : 'MAGIC ITEM INDEX';
  const info = type === 'monsters' ? 'Creature stat blocks have not been imported yet. This record contains the creature name and its source URL only.' : type === 'spells' ? 'Spell mechanics have not been imported yet. This record contains the spell name and its source URL only.' : 'Item properties have not been imported yet. This record contains the item name and its source URL only.';
  $('#detailDialogContent').innerHTML = `<div class="detail-kind">${kind}</div><h2>${esc(title)}</h2><p>${info}</p><p><strong>Source URL</strong><br><span style="color:#c9b58d;word-break:break-all">${esc(item.url)}</span></p><div style="display:flex;gap:8px;flex-wrap:wrap"><a class="button button-outline" href="${esc(item.url)}" target="_blank" rel="noreferrer">Open source ↗</a>${type === 'monsters' ? '<button class="button button-primary" id="detailAddEncounter">＋ Add to encounter</button>' : ''}</div>`;
  $('#detailDialog').showModal();
  $('#detailAddEncounter')?.addEventListener('click', () => {
    state.encounterBuild.push({ name: item.name, url: item.url, kind: 'Monster index' });
    persist(); renderEncounters(); $('#detailDialog').close(); navigate('encounters'); toast(`${item.name} added to encounter.`);
  });
}

function openForm(title, fields, onSubmit, submitLabel = 'Save') {
  const formHtml = `<div class="detail-kind">TABLEKEEP WORKSPACE</div><h2>${esc(title)}</h2><form id="dynamicForm"><div class="form-grid">${fields.map((field) => `<div class="form-field ${field.full ? 'full' : ''}"><label for="field-${field.name}">${esc(field.label.toUpperCase())}</label>${field.options ? `<select id="field-${field.name}" name="${field.name}">${field.options.map((o) => `<option value="${esc(o.value)}">${esc(o.label)}</option>`).join('')}</select>` : `<input id="field-${field.name}" name="${field.name}" type="${field.type || 'text'}" value="${esc(field.value ?? '')}" ${field.required ? 'required' : ''} placeholder="${esc(field.placeholder || '')}" />`}</div>`).join('')}</div><div class="form-actions"><button type="button" class="button button-quiet" id="cancelDynamicForm">Cancel</button><button class="button button-primary" type="submit">${esc(submitLabel)} →</button></div></form>`;
  $('#formDialogContent').innerHTML = formHtml;
  $('#formDialog').showModal();
  $('#cancelDynamicForm').addEventListener('click', () => $('#formDialog').close());
  $('#dynamicForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    onSubmit(values);
    $('#formDialog').close();
  });
}

function nextTurn() {
  if (!state.combatants.length) return toast('Add a combatant first.', 'warn');
  sortCombatants();
  const currentIndex = Math.max(0, state.combatants.findIndex((c) => c.id === state.activeId));
  const nextIndex = (currentIndex + 1) % state.combatants.length;
  if (nextIndex === 0) state.round += 1;
  state.activeId = state.combatants[nextIndex].id;
  persist(); saveRoomCombat(); renderCombat();
  toast(`${state.combatants[nextIndex].name}'s turn.`);
}

async function saveRoomCombat() {
  if (!obrReady || !OBR) { persist(); return; }
  try {
    const payload = {
      round: state.round,
      activeId: state.activeId,
      order: state.combatants.map((c) => ({ id: c.id, tokenId: c.tokenId || null, name: c.name, initiative: Number(c.initiative || 0) })),
      updatedAt: new Date().toISOString(),
    };
    await OBR.room.setMetadata({ [ROOM_KEY]: payload });
  } catch (error) {
    console.warn('Room metadata save failed', error);
    toast('Could not sync initiative to the Owlbear room.', 'warn');
  }
}

async function updateOwlbearToken(combatant) {
  if (!obrReady || !OBR || !combatant.tokenId) return;
  try {
    const item = sceneTokens.find((token) => token.id === combatant.tokenId);
    if (!item) return;
    await OBR.scene.items.updateItems([item], (items) => {
      for (const draft of items) {
        const existing = draft.metadata?.[ITEM_KEY] || {};
        draft.metadata = { ...(draft.metadata || {}), [ITEM_KEY]: {
          ...existing,
          initiative: Number(combatant.initiative || 0),
          hp: combatant.hp,
          maxHp: combatant.maxHp,
          ac: combatant.ac,
          conditions: combatant.conditions || [],
        } };
      }
    });
  } catch (error) {
    console.warn('Token metadata update failed', error);
    toast('Could not update token metadata.', 'warn');
  }
}

async function syncOwlbearTokens() {
  if (!obrReady || !OBR) return toast('Open this toolkit inside an Owlbear room to sync scene tokens.', 'warn');
  try {
    const ready = await OBR.scene.isReady();
    if (!ready) return toast('Open a scene first, then sync tokens.', 'warn');
    const tokens = await OBR.scene.items.getItems((item) => item.layer === 'CHARACTER');
    sceneTokens = tokens;
    if (!tokens.length) return toast('No tokens found on the Character layer.', 'warn');
    const fromScene = tokens.map((item, index) => {
      const stats = item.metadata?.[ITEM_KEY] || {};
      return {
        id: `obr-${item.id}`,
        tokenId: item.id,
        name: item.name || `Character ${index + 1}`,
        kind: stats.kind || 'Owlbear character token',
        initiative: Number(stats.initiative || 0),
        hp: stats.hp ?? null,
        maxHp: stats.maxHp ?? null,
        ac: stats.ac ?? null,
        conditions: Array.isArray(stats.conditions) ? stats.conditions : [],
        side: stats.side || 'player',
        glyph: stats.side === 'enemy' ? '♟' : '♙',
      };
    });
    state.combatants = fromScene;
    state.activeId = fromScene[0]?.id || null;
    const roomMeta = await OBR.room.getMetadata();
    const savedCombat = roomMeta?.[ROOM_KEY];
    if (savedCombat) {
      state.round = Math.max(1, Number(savedCombat.round || 1));
      const savedActive = fromScene.find((c) => c.tokenId === savedCombat.activeId || c.id === savedCombat.activeId);
      if (savedActive) state.activeId = savedActive.id;
      if (Array.isArray(savedCombat.order)) {
        for (const entry of savedCombat.order) {
          const combatant = fromScene.find((c) => c.tokenId === entry.tokenId || c.id === entry.id);
          if (combatant) combatant.initiative = Number(entry.initiative || 0);
        }
      }
    }
    sortCombatants();
    renderCombat();
    await saveRoomCombat();
    persist();
    toast(`Synced ${tokens.length} Character-layer token${tokens.length === 1 ? '' : 's'}.`);
  } catch (error) {
    console.error(error);
    toast('Token sync failed. Check Owlbear permissions and scene state.', 'warn');
  }
}

async function connectOwlbear() {
  const insideFrame = window.parent !== window;
  const requested = new URLSearchParams(window.location.search).get('mode') === 'owlbear';
  if (!insideFrame && !requested) return;
  $('#connectionText').textContent = 'Connecting…';
  try {
    const sdk = await import('https://esm.sh/@owlbear-rodeo/sdk@1');
    OBR = sdk.default || sdk.OBR || sdk;
    if (!OBR.isAvailable) {
      $('#connectionText').textContent = 'Standalone';
      return;
    }
    if (!OBR.isReady) await new Promise((resolve) => {
      let unsubscribe;
      unsubscribe = OBR.onReady(() => { unsubscribe?.(); resolve(); });
    });
    obrReady = true;
    document.body.classList.add('owlbear-mode');
    $('#connectionPill').classList.add('is-obr');
    $('#connectionText').textContent = 'Owlbear connected';
    $('#workspaceLabel').textContent = 'Owlbear room';
    $('#profileMode').textContent = `Room ${String(OBR.room.id || '').slice(0, 8)}`;
    $('#runtimeStatus').textContent = 'OWLBEAR CONNECTED';
    $('#sdkDescription').textContent = 'SDK loaded. This UI is running inside an Owlbear extension frame.';
    $('#roomDescription').textContent = `Room ID: ${OBR.room.id}`;
    $('#sceneDescription').textContent = 'Character-layer tokens can be imported into the initiative tracker.';
    $('#sdkStatusIcon').textContent = '✓';
    const role = await OBR.player.getRole().catch(() => 'PLAYER');
    if (role !== 'GM') $('#syncTokensButton').textContent = '↻ Sync scene tokens';
    const metadata = await OBR.room.getMetadata();
    const remote = metadata?.[ROOM_KEY];
    if (remote) {
      state.round = Math.max(1, Number(remote.round || state.round));
      if (Array.isArray(remote.order)) {
        const ordered = remote.order.map((entry) => ({ ...entry })).filter((entry) => entry.tokenId);
        if (ordered.length) state.remoteOrder = ordered;
      }
    }
    OBR.room.onMetadataChange((nextMetadata) => {
      const data = nextMetadata?.[ROOM_KEY];
      if (!data) return;
      state.round = Math.max(1, Number(data.round || state.round));
      if (Array.isArray(data.order)) {
        for (const entry of data.order) {
          const combatant = state.combatants.find((c) => c.tokenId === entry.tokenId || c.id === entry.id);
          if (combatant) combatant.initiative = Number(entry.initiative || 0);
        }
        const active = state.combatants.find((c) => c.tokenId === data.activeId || c.id === data.activeId);
        if (active) state.activeId = active.id;
        renderCombat();
      }
    });
    OBR.scene.items.onChange((items) => {
      sceneTokens = items.filter((item) => item.layer === 'CHARACTER');
      for (const token of sceneTokens) {
        const combatant = state.combatants.find((c) => c.tokenId === token.id);
        const stats = token.metadata?.[ITEM_KEY];
        if (combatant && stats) {
          combatant.hp = stats.hp ?? combatant.hp;
          combatant.maxHp = stats.maxHp ?? combatant.maxHp;
          combatant.ac = stats.ac ?? combatant.ac;
          combatant.initiative = Number(stats.initiative ?? combatant.initiative);
          combatant.conditions = Array.isArray(stats.conditions) ? stats.conditions : combatant.conditions;
        }
      }
      renderCombat();
    });
    renderCombat();
    if (await OBR.scene.isReady()) syncOwlbearTokens();
    else OBR.scene.onReadyChange((ready) => { if (ready) syncOwlbearTokens(); });
    toast('Owlbear room connected. Welcome to the table.');
  } catch (error) {
    console.warn('Owlbear SDK unavailable', error);
    $('#connectionText').textContent = 'Standalone fallback';
    $('#sdkDescription').textContent = 'The SDK could not load. The app remains usable with local browser storage.';
    $('#runtimeStatus').textContent = 'LOCAL FALLBACK';
  }
}

function rollDice(expression) {
  const match = expression.trim().match(/^(\d*)d(\d+)([+-]\d+)?$/i);
  if (!match) return toast('Use a dice expression like 2d20+3.', 'warn');
  const count = Number(match[1] || 1);
  const sides = Number(match[2]);
  const modifier = Number(match[3] || 0);
  if (!Number.isInteger(count) || count < 1 || count > 100 || !Number.isInteger(sides) || sides < 2 || sides > 10000) return toast('Keep dice between 1–100 and sides between 2–10,000.', 'warn');
  const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
  const total = rolls.reduce((sum, value) => sum + value, modifier);
  const detail = `${rolls.join(' + ')}${modifier ? ` ${modifier > 0 ? '+' : '−'} ${Math.abs(modifier)}` : ''}`;
  $('#diceBigResult').textContent = total;
  $('#diceLastRoll').textContent = `${expression}  →  ${detail}`;
  state.diceHistory.unshift({ expression, detail, total, timestamp: Date.now() });
  state.diceHistory = state.diceHistory.slice(0, 30);
  persist(); renderDiceHistory();
}

function downloadLocalData() {
  const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), app: 'Tablekeep', state }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = 'tablekeep-local-data.json'; anchor.click();
  URL.revokeObjectURL(url);
  toast('Local data export downloaded.');
}

function bindEvents() {
  $$('.nav-item').forEach((button) => button.addEventListener('click', () => navigate(button.dataset.page)));
  $$('[data-page-link]').forEach((button) => button.addEventListener('click', () => navigate(button.dataset.pageLink)));
  $('#menuToggle').addEventListener('click', openSidebar);
  $('#closeSidebar').addEventListener('click', closeSidebar);
  $('#mobileScrim').addEventListener('click', closeSidebar);
  $('#globalSearch').addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    const query = event.currentTarget.value.trim();
    if (!query) return;
    const inMonster = catalogs.monsters.some((entry) => entry.name.toLowerCase().includes(query.toLowerCase()));
    const inSpell = catalogs.spells.some((entry) => entry.name.toLowerCase().includes(query.toLowerCase()));
    const inItem = catalogs.items.some((entry) => entry.name.toLowerCase().includes(query.toLowerCase()));
    if (inMonster) { navigate('bestiary'); $('#monsterSearch').value = query; pages.monsters = 1; renderCatalog('monsters'); }
    else if (inSpell) { navigate('spells'); $('#spellSearch').value = query; pages.spells = 1; renderCatalog('spells'); }
    else if (inItem) { navigate('items'); $('#itemSearch').value = query; pages.items = 1; renderCatalog('items'); }
    else toast('No catalogue match found. Try a creature, spell, or item name.', 'warn');
  });
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); $('#globalSearch').focus(); }
    if (event.key === 'Escape') closeSidebar();
  });
  ['monsters', 'spells', 'items'].forEach((type) => {
    const input = $('#' + (type === 'monsters' ? 'monsterSearch' : type === 'spells' ? 'spellSearch' : 'itemSearch'));
    input.addEventListener('input', () => { pages[type] = 1; renderCatalog(type); });
  });
  document.addEventListener('click', (event) => {
    const catalogButton = event.target.closest('[data-catalog-type]');
    if (catalogButton) openDetail(catalogButton.dataset.catalogType, { name: catalogButton.dataset.catalogName, url: catalogButton.dataset.catalogUrl });
    const pageButton = event.target.closest('[data-page-type]');
    if (pageButton && !pageButton.disabled) { pages[pageButton.dataset.pageType] += Number(pageButton.dataset.pageStep); renderCatalog(pageButton.dataset.pageType); }
    const hpButton = event.target.closest('[data-hp-change]');
    if (hpButton) {
      const c = state.combatants.find((item) => item.id === hpButton.dataset.id);
      if (!c || !Number.isFinite(Number(c.hp)) || !Number.isFinite(Number(c.maxHp))) return toast('Set HP and max HP before changing health.', 'warn');
      c.hp = clamp(Number(c.hp) + Number(hpButton.dataset.hpChange), 0, Number(c.maxHp));
      persist(); renderCombat(); updateOwlbearToken(c); saveRoomCombat();
    }
    const moreButton = event.target.closest('[data-combat-more]');
    if (moreButton) {
      const c = state.combatants.find((item) => item.id === moreButton.dataset.combatMore);
      if (!c) return;
      openForm(`Edit ${c.name}`, [
        { name: 'name', label: 'Name', value: c.name, full: true, required: true },
        { name: 'initiative', label: 'Initiative', value: c.initiative, type: 'number' },
        { name: 'hp', label: 'Current HP', value: c.hp ?? '', type: 'number' },
        { name: 'maxHp', label: 'Maximum HP', value: c.maxHp ?? '', type: 'number' },
        { name: 'ac', label: 'Armor class', value: c.ac ?? '', type: 'number' },
        { name: 'conditions', label: 'Conditions (comma separated)', value: (c.conditions || []).join(', '), full: true },
      ], (values) => {
        c.name = values.name; c.initiative = Number(values.initiative || 0); c.hp = values.hp === '' ? null : Number(values.hp); c.maxHp = values.maxHp === '' ? null : Number(values.maxHp); c.ac = values.ac === '' ? null : Number(values.ac); c.conditions = values.conditions.split(',').map((s) => s.trim()).filter(Boolean);
        persist(); renderCombat(); updateOwlbearToken(c); saveRoomCombat();
      });
    }
    const removeBuild = event.target.closest('[data-remove-build]');
    if (removeBuild) { state.encounterBuild.splice(Number(removeBuild.dataset.removeBuild), 1); persist(); renderEncounters(); }
    const loadEncounter = event.target.closest('[data-load-encounter]');
    if (loadEncounter) {
      const encounter = state.savedEncounters.find((item) => item.id === loadEncounter.dataset.loadEncounter);
      if (encounter) { state.encounterBuild = structuredClone(encounter.creatures || []); $('#currentEncounterName').textContent = encounter.name; persist(); renderEncounters(); toast(`Loaded “${encounter.name}” into the encounter workspace.`); }
    }
    const editCharacter = event.target.closest('[data-character-edit]');
    if (editCharacter) {
      const c = state.characters.find((item) => item.id === editCharacter.dataset.characterEdit);
      if (!c) return;
      openForm('Edit character sheet', [
        { name: 'name', label: 'Character name', value: c.name, full: true, required: true },
        { name: 'className', label: 'Ancestry & class', value: c.className, full: true },
        { name: 'level', label: 'Level', value: c.level, type: 'number' },
        { name: 'hp', label: 'Current HP', value: c.hp, type: 'number' },
        { name: 'maxHp', label: 'Maximum HP', value: c.maxHp, type: 'number' },
        { name: 'ac', label: 'Armor class', value: c.ac, type: 'number' },
      ], (values) => { Object.assign(c, { name: values.name, className: values.className, level: Number(values.level), hp: Number(values.hp), maxHp: Number(values.maxHp), ac: Number(values.ac), initials: values.name.slice(0, 2).toUpperCase() }); persist(); renderCharacters(); });
    }
  });
  $('#nextTurnButton').addEventListener('click', nextTurn);
  $('#roundDown').addEventListener('click', () => { state.round = Math.max(1, state.round - 1); persist(); renderCombat(); saveRoomCombat(); });
  $('#roundUp').addEventListener('click', () => { state.round += 1; persist(); renderCombat(); saveRoomCombat(); });
  $('#addCombatantButton').addEventListener('click', () => openForm('Add combatant', [
    { name: 'name', label: 'Name', required: true, full: true },
    { name: 'kind', label: 'Type', value: 'Creature' },
    { name: 'initiative', label: 'Initiative', value: 10, type: 'number' },
    { name: 'hp', label: 'Current HP', type: 'number' },
    { name: 'maxHp', label: 'Maximum HP', type: 'number' },
    { name: 'ac', label: 'Armor class', type: 'number' },
    { name: 'side', label: 'Side', options: [{ value: 'enemy', label: 'Enemy' }, { value: 'player', label: 'Player / ally' }] },
  ], (values) => {
    const id = `manual-${Date.now()}`;
    state.combatants.push({ id, name: values.name, kind: values.kind, initiative: Number(values.initiative || 0), hp: values.hp === '' ? null : Number(values.hp), maxHp: values.maxHp === '' ? null : Number(values.maxHp), ac: values.ac === '' ? null : Number(values.ac), conditions: [], side: values.side, glyph: values.side === 'enemy' ? '♟' : '♙' });
    if (!state.activeId) state.activeId = id;
    sortCombatants(); persist(); renderCombat(); saveRoomCombat();
  }));
  $('#syncTokensButton').addEventListener('click', syncOwlbearTokens);
  $('#settingsSyncButton').addEventListener('click', syncOwlbearTokens);
  $('#resetCombatButton').addEventListener('click', () => { if (!confirm('Reset the combat tracker to the demo encounter?')) return; state.combatants = structuredClone(demoState.combatants); state.round = 1; state.activeId = state.combatants[0].id; persist(); renderCombat(); saveRoomCombat(); toast('Demo encounter restored.'); });
  $('#addCharacterButton').addEventListener('click', () => openForm('Create character', [
    { name: 'name', label: 'Character name', required: true, full: true },
    { name: 'className', label: 'Ancestry & class', value: 'Human · Fighter', full: true },
    { name: 'level', label: 'Level', value: 1, type: 'number' },
    { name: 'hp', label: 'Current HP', value: 10, type: 'number' },
    { name: 'maxHp', label: 'Maximum HP', value: 10, type: 'number' },
    { name: 'ac', label: 'Armor class', value: 10, type: 'number' },
  ], (values) => { state.characters.push({ id: `char-${Date.now()}`, name: values.name, className: values.className, level: Number(values.level), hp: Number(values.hp), maxHp: Number(values.maxHp), ac: Number(values.ac), initials: values.name.slice(0, 2).toUpperCase(), stats: { STR: 10, DEX: 10, CON: 10 } }); persist(); renderCharacters(); }));
  $('#encounterMonsterSearch').addEventListener('input', (event) => {
    const query = event.target.value.trim().toLowerCase();
    const match = catalogs.monsters.find((item) => item.name.toLowerCase().includes(query));
    $('#addEncounterCreature').dataset.match = match ? match.name : '';
    $('#addEncounterCreature').title = match ? `Add ${match.name}` : 'Search for a monster first';
  });
  $('#addEncounterCreature').addEventListener('click', () => {
    const query = $('#encounterMonsterSearch').value.trim().toLowerCase();
    if (!query) return toast('Enter a monster name first.', 'warn');
    const match = catalogs.monsters.find((item) => item.name.toLowerCase() === query) || catalogs.monsters.find((item) => item.name.toLowerCase().includes(query));
    if (!match) return toast('No monster match. Try a more specific name.', 'warn');
    state.encounterBuild.push({ name: match.name, url: match.url, kind: 'Monster index' });
    $('#encounterMonsterSearch').value = ''; persist(); renderEncounters();
  });
  $('#clearEncounterButton').addEventListener('click', () => { state.encounterBuild = []; persist(); renderEncounters(); });
  $('#saveEncounterButton').addEventListener('click', () => {
    if (!state.encounterBuild.length) return toast('Add at least one creature before saving.', 'warn');
    openForm('Save encounter', [{ name: 'name', label: 'Encounter name', value: 'New encounter', required: true, full: true }], (values) => {
      state.savedEncounters.unshift({ id: `enc-${Date.now()}`, name: values.name, count: state.encounterBuild.length, updated: 'Saved locally', creatures: structuredClone(state.encounterBuild) });
      state.encounterBuild = []; persist(); renderEncounters(); toast('Encounter saved locally.');
    });
  });
  $('#newEncounterButton').addEventListener('click', () => { state.encounterBuild = []; persist(); renderEncounters(); $('#currentEncounterName').textContent = 'Untitled encounter'; });
  $('#notesTitle').value = state.notesTitle;
  $('#notesBody').value = state.notesBody;
  const updateNotes = () => {
    state.notesTitle = $('#notesTitle').value;
    state.notesBody = $('#notesBody').value;
    const words = state.notesBody.trim() ? state.notesBody.trim().split(/\s+/).length : 0;
    $('#notesWordCount').textContent = `${words} words`;
    $('#notesSavedState').innerHTML = '<i></i> SAVED LOCALLY';
    persist();
  };
  $('#notesTitle').addEventListener('input', updateNotes);
  $('#notesBody').addEventListener('input', updateNotes);
  $('#rollDiceButton').addEventListener('click', () => rollDice($('#diceExpression').value));
  $('#diceExpression').addEventListener('keydown', (event) => { if (event.key === 'Enter') rollDice(event.currentTarget.value); });
  $$('.dice-quick-picks button').forEach((button) => button.addEventListener('click', () => { $('#diceExpression').value = button.dataset.roll; rollDice(button.dataset.roll); }));
  $('#clearDiceHistory').addEventListener('click', () => { state.diceHistory = []; persist(); renderDiceHistory(); });
  $('#exportDataButton').addEventListener('click', downloadLocalData);
  $('#resetDataButton').addEventListener('click', () => { if (!confirm('Reset local notes, characters, encounters, and combat data to the demo state?')) return; state = structuredClone(demoState); persist(); renderCombat(); renderCharacters(); renderEncounters(); $('#notesTitle').value = state.notesTitle; $('#notesBody').value = state.notesBody; toast('Local demo data reset.'); });
  $('[data-action="open-notes"]').addEventListener('click', () => navigate('notes'));
}

async function init() {
  bindEvents();
  renderCombat();
  renderCharacters();
  renderEncounters();
  renderDiceHistory();
  const wordCount = state.notesBody.trim() ? state.notesBody.trim().split(/\s+/).length : 0;
  $('#notesWordCount').textContent = `${wordCount} words`;
  await loadCatalogs();
  await connectOwlbear();
  renderMiniInitiative();
}

init();
