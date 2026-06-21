import { normalisePaniniState } from './sticker-state.js';

// Supabase cloud sync voor Olivia's Panini-tool.
// Bewaart dezelfde state als localStorage, maar nu ook centraal in Supabase.
// Belangrijk: de nieuwe Supabase publishable key gaat enkel in de apikey-header.
(() => {
  const STORE = 'olivia-panini-v3';
  const ROW_ID = 'olivia';
  const SUPABASE_URL = 'https://eblgjinuakxdiikscjpe.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_88Vk4S3kmsA4uxiA_e5Mqg_01vPFNRd';
  const TABLE = 'olivia_panini_state';
  const ENDPOINT = `${SUPABASE_URL}/rest/v1/${TABLE}`;

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
        el.onclick = () => forceSync(true);
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

  function uniqueStrings(value) {
    const out = [];
    for (const item of Array.isArray(value) ? value : []) {
      const text = String(item || '').trim();
      if (text && !out.includes(text)) out.push(text);
    }
    return out;
  }

  function normalise(state) {
    return normalisePaniniState(state);
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
    return {
      ...left,
      ...right,
      cloudSchema: 1,
      teams,
      trades,
      newOnes: uniqueStrings([...(left.newOnes || []), ...(right.newOnes || [])]).slice(-100),
      appliedBatches: uniqueStrings([...(left.appliedBatches || []), ...(right.appliedBatches || [])]),
      lastSyncedAt: new Date().toISOString(),
    };
  }

  const baseHeaders = {
    apikey: SUPABASE_KEY,
    'Content-Type': 'application/json',
  };

  async function fetchCloud() {
    const response = await fetch(`${ENDPOINT}?id=eq.${encodeURIComponent(ROW_ID)}&select=state,updated_at`, {
      headers: { apikey: SUPABASE_KEY },
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(`Cloud read failed: ${response.status}`);
    const rows = await response.json();
    return rows?.[0]?.state || {};
  }

  async function pushCloud(state) {
    const clean = normalise(state);
    const response = await fetch(`${ENDPOINT}?on_conflict=id`, {
      method: 'POST',
      headers: {
        ...baseHeaders,
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({ id: ROW_ID, state: clean }),
    });
    if (!response.ok) throw new Error(`Cloud write failed: ${response.status}`);
  }

  async function forceSync(reloadAfter = false) {
    badge('cloud sync...', 'sync');
    const beforeRaw = localStorage.getItem(STORE) || '{}';
    const local = normalise(parseState(beforeRaw));
    const cloud = await fetchCloud();
    const merged = mergeStates(cloud, local);
    const mergedRaw = JSON.stringify(merged);
    if (mergedRaw !== beforeRaw) originalSetItem(STORE, mergedRaw);
    await pushCloud(merged);
    badge('cloud actief', 'ok');
    if (reloadAfter) location.reload();
    return merged;
  }

  function schedulePush(delay = 650) {
    if (!bootDone) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(async () => {
      try {
        badge('opslaan...', 'sync');
        const local = normalise(parseState(localStorage.getItem(STORE)));
        await pushCloud({ ...local, lastSyncedAt: new Date().toISOString() });
        badge('opgeslagen', 'ok');
      } catch (error) {
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

  window.oliviaPaniniCloud = { forceSync, fetchCloud, pushCloud, mergeStates, normalise, mountBadge };

  (async () => {
    try {
      const beforeRaw = localStorage.getItem(STORE) || '{}';
      badge('cloud laden...', 'sync');
      const merged = await forceSync(false);
      bootDone = true;
      const afterRaw = JSON.stringify(merged);
      if (afterRaw !== beforeRaw && !sessionStorage.getItem('olivia-panini-cloud-reloaded')) {
        sessionStorage.setItem('olivia-panini-cloud-reloaded', '1');
        location.reload();
      }
    } catch (error) {
      console.warn('[Panini cloud sync]', error);
      bootDone = true;
      badge('offline modus', 'error');
      schedulePush(2500);
    }
  })();

  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') schedulePush(0);
  });
  window.addEventListener('online', () => schedulePush(0));
})();
