import { mergePaniniStates, normalisePaniniState } from './sticker-state.js';

(() => {
  const STORE = 'olivia-panini-v3';
  const BASE_STORE = 'olivia-panini-v3-base';
  const OWNER_TOKEN_STORE = 'olivia-panini-owner-token';
  const OWNER_LINK_PARAMS = ['koppel', 'beheer'];
  const SUPABASE_URL = 'https://eblgjinuakxdiikscjpe.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_88Vk4S3kmsA4uxiA_e5Mqg_01vPFNRd';
  const RPC_ENDPOINT = `${SUPABASE_URL}/rest/v1/rpc`;

  const originalSetItem = localStorage.setItem.bind(localStorage);
  let bootDone = false;
  let pushTimer = null;
  let refreshTimer = null;
  let tokenPanel = null;

  function mountBadge() {
    const el = document.getElementById('cloudSyncBadge');
    const slot = document.getElementById('cloudSyncSlot');
    if (el && slot && el.parentElement !== slot) slot.appendChild(el);
  }

  function badge(message, kind = 'idle') {
    const show = () => {
      let el = document.getElementById('cloudSyncBadge');
      if (!el) {
        el = document.createElement('button');
        el.id = 'cloudSyncBadge';
        el.type = 'button';
        el.className = 'cloud-sync-badge';
        el.onclick = () => showOwnerTokenPanel();
      }
      const dot = kind === 'ok' ? '🟢' : kind === 'error' ? '🔴' : '🟡';
      el.textContent = `${dot} ${message}`;
      const slot = document.getElementById('cloudSyncSlot');
      if (slot && el.parentElement !== slot) slot.appendChild(el);
      else if (!el.parentElement) document.body.appendChild(el);
    };
    if (document.body) show();
    else window.addEventListener('DOMContentLoaded', show, { once: true });
  }

  function parseState(raw) {
    try { return JSON.parse(raw || '{}') || {}; }
    catch { return {}; }
  }

  function normalise(state) {
    return normalisePaniniState(state);
  }

  function ownerToken() {
    return localStorage.getItem(OWNER_TOKEN_STORE) || '';
  }

  function consumeOwnerTokenFromUrl() {
    const url = new URL(location.href);
    const token = OWNER_LINK_PARAMS.map((name) => url.searchParams.get(name)).find(Boolean)?.trim();
    if (!token) return '';

    localStorage.setItem(OWNER_TOKEN_STORE, token);
    for (const name of OWNER_LINK_PARAMS) url.searchParams.delete(name);
    history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    return token;
  }

  async function consumeFamilyEntryFromUrl() {
    const url = new URL(location.href);
    const wantsFamilyEntry = url.searchParams.get('familie') === '1';
    if (!wantsFamilyEntry) return '';

    url.searchParams.delete('familie');
    history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);

    const response = await fetch('/api/panini-owner-token', {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error('owner token required');

    const data = await response.json();
    const token = String(data?.ownerToken || '').trim();
    if (!token) throw new Error('owner token required');
    localStorage.setItem(OWNER_TOKEN_STORE, token);
    return token;
  }

  async function setupOwnerTokenFromUrl() {
    const linkedToken = consumeOwnerTokenFromUrl();
    if (linkedToken) return linkedToken;
    return consumeFamilyEntryFromUrl();
  }

  function closeOwnerTokenPanel() {
    tokenPanel?.remove();
    tokenPanel = null;
  }

  function showOwnerTokenPanel(message = 'Open de privé koppel-link op dit toestel, of plak de koppelcode.') {
    closeOwnerTokenPanel();
    tokenPanel = document.createElement('div');
    tokenPanel.id = 'ownerTokenPanel';
    tokenPanel.className = 'owner-token-panel';
    tokenPanel.innerHTML = `
      <div class="owner-token-card" role="dialog" aria-modal="true" aria-labelledby="ownerTokenTitle">
        <button class="owner-token-close" id="ownerTokenClose" type="button" aria-label="Sluit">×</button>
        <h2 id="ownerTokenTitle">Koppel dit toestel</h2>
        <p id="ownerTokenMessage"></p>
        <label class="mini" for="ownerTokenInput">Koppelcode</label>
        <input class="field" id="ownerTokenInput" autocomplete="off" inputmode="text" placeholder="Plak de koppelcode hier">
        <div class="owner-token-actions">
          <button class="btn primary" id="ownerTokenSave" type="button">Bewaar en sync</button>
          <button class="btn" id="ownerTokenForget" type="button">Vergeet code</button>
        </div>
      </div>`;
    document.body.append(tokenPanel);
    tokenPanel.querySelector('#ownerTokenMessage').textContent = message;
    const input = tokenPanel.querySelector('#ownerTokenInput');
    const saveButton = tokenPanel.querySelector('#ownerTokenSave');
    tokenPanel.querySelector('#ownerTokenClose').onclick = closeOwnerTokenPanel;
    tokenPanel.querySelector('#ownerTokenForget').onclick = () => {
      localStorage.removeItem(OWNER_TOKEN_STORE);
      input.value = '';
      badge('koppel toestel', 'error');
      input.focus();
    };
    tokenPanel.onclick = (event) => {
      if (event.target === tokenPanel) closeOwnerTokenPanel();
    };
    saveButton.onclick = async () => {
      const token = input.value.trim();
      if (!token) {
        tokenPanel.querySelector('#ownerTokenMessage').textContent = 'Plak eerst de koppelcode.';
        input.focus();
        return;
      }
      localStorage.setItem(OWNER_TOKEN_STORE, token);
      saveButton.disabled = true;
      tokenPanel.querySelector('#ownerTokenMessage').textContent = 'Code controleren en synchroniseren...';
      try {
        await forceSync(false, false);
        closeOwnerTokenPanel();
        badge('cloud actief', 'ok');
      } catch (error) {
        if (error.message === 'forbidden') localStorage.removeItem(OWNER_TOKEN_STORE);
        saveButton.disabled = false;
        tokenPanel.querySelector('#ownerTokenMessage').textContent = error.message === 'forbidden'
          ? 'Deze code klopt niet. Open de koppel-link opnieuw of plak de juiste koppelcode.'
          : 'Sync lukte niet. Controleer je internet en probeer opnieuw.';
        badge(error.message === 'forbidden' ? 'code fout' : 'offline bewaard', 'error');
        input.focus();
        input.select();
      }
    };
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') saveButton.click();
      if (event.key === 'Escape') closeOwnerTokenPanel();
    });
    setTimeout(() => input.focus(), 0);
  }

  function activeShareId() {
    return new URLSearchParams(location.search).get('ruil')?.trim() || '';
  }

  function dispatchStateUpdate() {
    window.dispatchEvent(new CustomEvent('olivia-panini-cloud-updated'));
  }

  async function rpc(name, body) {
    const response = await fetch(`${RPC_ENDPOINT}/${name}`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) throw new Error('forbidden');
      throw new Error('cloud request failed');
    }
    return response.json();
  }

  function mergeStates(a, b, base) {
    return mergePaniniStates(a, b, base);
  }

  // The last cloud state this device synced to. Used as the shared ancestor for a
  // three-way merge so that local removals (a deleted sticker, a lowered duplicate
  // count) sync to the cloud instead of bouncing back via a grow-only merge.
  function readBase() {
    const raw = localStorage.getItem(BASE_STORE);
    return raw == null ? undefined : normalise(parseState(raw));
  }

  function writeBase(state) {
    originalSetItem(BASE_STORE, JSON.stringify(normalise(state)));
  }

  async function fetchCloud(requireToken = false) {
    let token = ownerToken();
    if (!token && requireToken) showOwnerTokenPanel();
    if (!token) throw new Error('owner token required');
    return normalise(await rpc('olivia_panini_read_state', { p_owner_token: token }));
  }

  async function pushCloud(state, requireToken = false) {
    let token = ownerToken();
    if (!token && requireToken) showOwnerTokenPanel();
    if (!token) throw new Error('owner token required');
    const clean = normalise(state);
    return normalise(await rpc('olivia_panini_write_state', {
      p_owner_token: token,
      p_state: clean,
    }));
  }

  async function fetchShare(shareId = activeShareId()) {
    if (!shareId) return null;
    const board = await rpc('olivia_panini_read_share', { p_share_id: shareId });
    if (!board?.id) return null;
    const local = normalise(parseState(localStorage.getItem(STORE)));
    local.tradeShares[board.id] = board;
    originalSetItem(STORE, JSON.stringify(normalise(local)));
    dispatchStateUpdate();
    return board;
  }

  async function submitClaim(shareId, friendName, wanted, offered = []) {
    const board = await rpc('olivia_panini_submit_trade_claim', {
      p_share_id: shareId,
      p_friend_name: friendName,
      p_wanted: wanted,
      p_offered: offered,
    });
    if (!board?.id) throw new Error('claim not saved');
    const local = normalise(parseState(localStorage.getItem(STORE)));
    local.tradeShares[board.id] = board;
    originalSetItem(STORE, JSON.stringify(normalise(local)));
    dispatchStateUpdate();
    return board;
  }

  async function forceSync(reloadAfter = false, requireToken = false) {
    badge('cloud sync...', 'sync');
    const beforeRaw = localStorage.getItem(STORE) || '{}';
    const local = normalise(parseState(beforeRaw));
    let cloud;
    try {
      cloud = await fetchCloud(requireToken);
    } catch (error) {
      if (error.message === 'forbidden') {
        localStorage.removeItem(OWNER_TOKEN_STORE);
        if (requireToken) showOwnerTokenPanel('Deze code klopt niet. Open de koppel-link opnieuw of plak de juiste koppelcode.');
      }
      throw error;
    }
    const merged = mergeStates(cloud, local, readBase());
    const saved = await pushCloud(merged, requireToken);
    const savedRaw = JSON.stringify(saved);
    if (savedRaw !== beforeRaw) originalSetItem(STORE, savedRaw);
    writeBase(saved);
    badge('cloud actief', 'ok');
    dispatchStateUpdate();
    if (reloadAfter) location.reload();
    return saved;
  }

  function schedulePush(delay = 650) {
    if (!bootDone || activeShareId()) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(async () => {
      try {
        badge('opslaan...', 'sync');
        const local = normalise(parseState(localStorage.getItem(STORE)));
        const cloud = await fetchCloud(false);
        const merged = mergeStates(cloud, local, readBase());
        const saved = await pushCloud({ ...merged, lastSyncedAt: new Date().toISOString() });
        const savedRaw = JSON.stringify(saved);
        if (savedRaw !== JSON.stringify(local)) originalSetItem(STORE, savedRaw);
        writeBase(saved);
        badge('opgeslagen', 'ok');
        dispatchStateUpdate();
      } catch (error) {
        if (error.message === 'owner token required' || error.message === 'forbidden') {
          if (error.message === 'forbidden') localStorage.removeItem(OWNER_TOKEN_STORE);
          badge('niet opgeslagen', 'error');
          return;
        }
        console.warn('[Panini cloud sync]', error);
        badge('offline bewaard', 'error');
      }
    }, delay);
  }

  localStorage.setItem = function wrappedSetItem(key, value) {
    const result = originalSetItem(key, value);
    if (key === STORE) schedulePush();
    return result;
  };

  function hasLocalTradeShares() {
    const local = normalise(parseState(localStorage.getItem(STORE)));
    return Object.keys(local.tradeShares || {}).length > 0;
  }

  function startOwnerRefresh() {
    if (refreshTimer) return;
    refreshTimer = setInterval(async () => {
      if (activeShareId() || document.hidden || !ownerToken() || !hasLocalTradeShares()) return;
      try {
        await forceSync(false, false);
      } catch (error) {
        if (error.message === 'forbidden') localStorage.removeItem(OWNER_TOKEN_STORE);
      }
    }, 30000);
  }

  window.oliviaPaniniCloud = {
    forceSync,
    fetchCloud,
    fetchShare,
    mergeStates,
    mountBadge,
    normalise,
    showOwnerTokenPanel,
    pushCloud,
    submitClaim,
  };

  (async () => {
    try {
      badge(activeShareId() ? 'ruillijst laden...' : 'cloud laden...', 'sync');
      const linkedToken = await setupOwnerTokenFromUrl();
      if (activeShareId()) {
        await fetchShare();
        badge('ruillijst actief', 'ok');
      } else if (linkedToken || ownerToken()) {
        await forceSync(false, false);
      } else {
        badge('niet opgeslagen', 'error');
      }
    } catch (error) {
      console.warn('[Panini cloud sync]', error);
      if (error.message === 'forbidden') localStorage.removeItem(OWNER_TOKEN_STORE);
      badge(error.message === 'forbidden' ? 'niet opgeslagen' : 'offline bewaard', 'error');
    } finally {
      bootDone = true;
      startOwnerRefresh();
    }
  })();

  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') schedulePush(0);
    else if (ownerToken() && hasLocalTradeShares()) forceSync(false, false).catch(() => {});
  });
  window.addEventListener('online', () => schedulePush(0));
})();
