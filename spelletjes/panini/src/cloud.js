import { mergeTradeShares, normalisePaniniState } from './sticker-state.js';

(() => {
  const STORE = 'olivia-panini-v3';
  const OWNER_TOKEN_STORE = 'olivia-panini-owner-token';
  const SUPABASE_URL = 'https://eblgjinuakxdiikscjpe.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_88Vk4S3kmsA4uxiA_e5Mqg_01vPFNRd';
  const RPC_ENDPOINT = `${SUPABASE_URL}/rest/v1/rpc`;

  const originalSetItem = localStorage.setItem.bind(localStorage);
  let bootDone = false;
  let pushTimer = null;

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
        el.onclick = () => forceSync(true, true).catch(() => {});
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

  function promptOwnerToken() {
    const value = window.prompt('Geef de Panini beheercode in om met Supabase te synchroniseren.');
    const token = String(value || '').trim();
    if (token) localStorage.setItem(OWNER_TOKEN_STORE, token);
    return token;
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

  function mergeStates(a, b) {
    const left = normalise(a);
    const right = normalise(b);
    const teams = { ...left.teams };
    for (const [code, stickers] of Object.entries(right.teams)) {
      teams[code] = normalisePaniniState({ teams: { [code]: [...(teams[code] || []), ...stickers] } }).teams[code] || [];
    }
    const trades = { ...left.trades };
    for (const [code, amount] of Object.entries(right.trades)) {
      trades[code] = Math.max(Number(trades[code] || 0), Number(amount || 0));
    }
    return normalise({
      cloudSchema: 1,
      teams,
      trades,
      tradeShares: mergeTradeShares(left.tradeShares, right.tradeShares),
      newOnes: [...(left.newOnes || []), ...(right.newOnes || [])].slice(-100),
      appliedBatches: [...new Set([...(left.appliedBatches || []), ...(right.appliedBatches || [])])],
      lastSyncedAt: new Date().toISOString(),
    });
  }

  async function fetchCloud(requireToken = false) {
    let token = ownerToken();
    if (!token && requireToken) token = promptOwnerToken();
    if (!token) throw new Error('owner token required');
    return normalise(await rpc('olivia_panini_read_state', { p_owner_token: token }));
  }

  async function pushCloud(state, requireToken = false) {
    let token = ownerToken();
    if (!token && requireToken) token = promptOwnerToken();
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

  async function submitClaim(shareId, friendName, wanted) {
    const board = await rpc('olivia_panini_submit_claim', {
      p_share_id: shareId,
      p_friend_name: friendName,
      p_wanted: wanted,
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
    const cloud = await fetchCloud(requireToken);
    const merged = mergeStates(cloud, local);
    const saved = await pushCloud(merged, requireToken);
    const savedRaw = JSON.stringify(saved);
    if (savedRaw !== beforeRaw) originalSetItem(STORE, savedRaw);
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
        await pushCloud({ ...local, lastSyncedAt: new Date().toISOString() });
        badge('opgeslagen', 'ok');
      } catch (error) {
        if (error.message === 'owner token required' || error.message === 'forbidden') {
          badge('beheercode nodig', 'error');
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

  window.oliviaPaniniCloud = {
    forceSync,
    fetchCloud,
    fetchShare,
    mergeStates,
    mountBadge,
    normalise,
    promptOwnerToken,
    pushCloud,
    submitClaim,
  };

  (async () => {
    try {
      badge(activeShareId() ? 'ruillijst laden...' : 'cloud laden...', 'sync');
      if (activeShareId()) {
        await fetchShare();
        badge('ruillijst actief', 'ok');
      } else if (ownerToken()) {
        await forceSync(false, false);
      } else {
        badge('beheercode nodig', 'error');
      }
    } catch (error) {
      console.warn('[Panini cloud sync]', error);
      if (error.message === 'forbidden') localStorage.removeItem(OWNER_TOKEN_STORE);
      badge('offline bewaard', 'error');
    } finally {
      bootDone = true;
    }
  })();

  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') schedulePush(0);
  });
  window.addEventListener('online', () => schedulePush(0));
})();
