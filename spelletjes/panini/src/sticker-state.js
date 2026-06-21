const TEAM_CODES = new Set([
  'MEX', 'RSA', 'KOR', 'CZE', 'CAN', 'BIH', 'QAT', 'SUI',
  'BRA', 'MAR', 'HAI', 'SCO', 'USA', 'PAR', 'AUS', 'TUR',
  'GER', 'CUW', 'CIV', 'ECU', 'NED', 'JPN', 'SWE', 'TUN',
  'BEL', 'EGY', 'IRN', 'NZL', 'ESP', 'CPV', 'KSA', 'URU',
  'FRA', 'SEN', 'IRQ', 'NOR', 'ARG', 'ALG', 'AUT', 'JOR',
  'POR', 'COD', 'UZB', 'COL', 'ENG', 'CRO', 'GHA', 'PAN',
]);

export function normaliseStickerCode(input, number) {
  const text = number == null ? String(input || '') : `${input || ''} ${number}`;
  const match = text.trim().toUpperCase().match(/^([A-Z]{3})\s*(\d{1,2})$/);
  if (!match) return null;

  const code = match[1];
  const stickerNumber = Number(match[2]);
  if (!TEAM_CODES.has(code) || stickerNumber < 1 || stickerNumber > 20) return null;

  return { code, number: stickerNumber, label: `${code} ${stickerNumber}` };
}

export function uniqueNumbers(value) {
  return [...new Set((Array.isArray(value) ? value : []).map(Number))]
    .filter((number) => number >= 1 && number <= 20)
    .sort((a, b) => a - b);
}

function uniqueStickerLabels(value) {
  const out = [];
  for (const item of Array.isArray(value) ? value : []) {
    const sticker = normaliseStickerCode(item);
    if (sticker && !out.includes(sticker.label)) out.push(sticker.label);
  }
  return out;
}

function normaliseStickerMap(value, allowedLabels = null) {
  const out = {};
  for (const [rawCode, amount] of Object.entries(value || {})) {
    const sticker = normaliseStickerCode(rawCode);
    const count = Math.floor(Number(amount));
    if (sticker && count > 0 && (!allowedLabels || allowedLabels.has(sticker.label))) {
      out[sticker.label] = (out[sticker.label] || 0) + count;
    }
  }
  return out;
}

function normaliseFriendName(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, 80);
}

function claimKey(friendName) {
  return friendName.toLowerCase();
}

function normaliseTradeShare(rawShare) {
  const share = rawShare && typeof rawShare === 'object' ? rawShare : {};
  const id = String(share.id || '').trim();
  if (!id) return null;

  const items = normaliseStickerMap(share.items);
  const allowedLabels = new Set(Object.keys(items));
  const claims = [];
  const seenClaimKeys = new Set();

  for (const rawClaim of Array.isArray(share.claims) ? share.claims : []) {
    const friendName = normaliseFriendName(rawClaim?.friendName);
    const wanted = uniqueStickerLabels(rawClaim?.wanted).filter((label) => allowedLabels.has(label));
    const key = claimKey(friendName);
    if (!friendName || !wanted.length || seenClaimKeys.has(key)) continue;
    seenClaimKeys.add(key);
    claims.push({
      friendName,
      wanted,
      updatedAt: rawClaim?.updatedAt || null,
    });
  }

  return {
    id,
    ownerName: normaliseFriendName(share.ownerName) || 'Olivia',
    items,
    claims,
    createdAt: share.createdAt || null,
    updatedAt: share.updatedAt || share.createdAt || null,
  };
}

export function normalisePaniniState(state) {
  const source = state && typeof state === 'object' ? state : {};
  const teams = {};
  for (const [code, stickers] of Object.entries(source.teams || {})) {
    if (TEAM_CODES.has(code)) teams[code] = uniqueNumbers(stickers);
  }

  const trades = normaliseStickerMap(source.trades);
  const tradeShares = {};
  for (const rawShare of Object.values(source.tradeShares || {})) {
    const share = normaliseTradeShare(rawShare);
    if (share) tradeShares[share.id] = share;
  }

  return {
    ...source,
    cloudSchema: 1,
    teams,
    trades,
    tradeShares,
    newOnes: uniqueStickerLabels(source.newOnes).slice(-100),
    appliedBatches: Array.isArray(source.appliedBatches) ? [...new Set(source.appliedBatches.map(String).filter(Boolean))] : [],
    lastSyncedAt: source.lastSyncedAt || null,
  };
}

export function mergeTradeShares(leftShares, rightShares) {
  const left = normalisePaniniState({ tradeShares: leftShares }).tradeShares;
  const right = normalisePaniniState({ tradeShares: rightShares }).tradeShares;
  const merged = { ...left };

  for (const [id, share] of Object.entries(right)) {
    const existing = merged[id];
    if (!existing) {
      merged[id] = share;
      continue;
    }

    const claimsByFriend = new Map();
    for (const claim of [...existing.claims, ...share.claims]) {
      const key = claimKey(claim.friendName);
      const current = claimsByFriend.get(key);
      if (!current || String(claim.updatedAt || '') >= String(current.updatedAt || '')) {
        claimsByFriend.set(key, claim);
      }
    }

    merged[id] = normaliseTradeShare({
      ...existing,
      ...share,
      items: Object.keys(share.items).length ? share.items : existing.items,
      claims: [...claimsByFriend.values()],
      createdAt: existing.createdAt || share.createdAt,
      updatedAt: [existing.updatedAt, share.updatedAt].filter(Boolean).sort().at(-1) || null,
    });
  }

  return merged;
}

export function addOwnedSticker(state, codeOrLabel, number) {
  const sticker = normaliseStickerCode(codeOrLabel, number);
  if (!sticker) return null;

  state.teams ??= {};
  state.newOnes ??= [];

  const current = uniqueNumbers(state.teams[sticker.code]);
  const alreadyOwned = current.includes(sticker.number);
  state.teams[sticker.code] = uniqueNumbers([...current, sticker.number]);

  if (!alreadyOwned && !state.newOnes.includes(sticker.label)) {
    state.newOnes.push(sticker.label);
    state.newOnes = state.newOnes.slice(-100);
  }

  return state;
}

export function addTradeSticker(state, codeOrLabel, number) {
  const sticker = normaliseStickerCode(codeOrLabel, number);
  if (!sticker) return null;

  state.trades ??= {};
  state.trades[sticker.label] = Math.floor(Number(state.trades[sticker.label] || 0)) + 1;
  return state;
}

export function createTradeShare(state, options = {}) {
  const id = String(options.id || globalThis.crypto?.randomUUID?.() || `share-${Date.now().toString(36)}`).trim();
  const now = options.now || new Date().toISOString();
  const ownerName = normaliseFriendName(options.ownerName) || 'Olivia';
  const items = normaliseStickerMap(state?.trades);

  state.tradeShares ??= {};
  const existing = state.tradeShares[id];
  const board = {
    id,
    ownerName,
    items,
    claims: Array.isArray(existing?.claims) ? existing.claims : [],
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  state.tradeShares[id] = normaliseTradeShare(board);
  return state.tradeShares[id];
}

export function saveTradeClaim(state, shareId, options = {}) {
  const id = String(shareId || '').trim();
  const share = normaliseTradeShare(state?.tradeShares?.[id]);
  if (!share) return null;

  const friendName = normaliseFriendName(options.friendName);
  const allowedLabels = new Set(Object.keys(share.items));
  const wanted = uniqueStickerLabels(options.wanted).filter((label) => allowedLabels.has(label));
  if (!friendName || !wanted.length) return null;

  const now = options.now || new Date().toISOString();
  const key = claimKey(friendName);
  const claim = { friendName, wanted, updatedAt: now };
  share.claims = share.claims.filter((item) => claimKey(item.friendName) !== key);
  share.claims.push(claim);
  share.updatedAt = now;

  state.tradeShares ??= {};
  state.tradeShares[id] = share;
  return claim;
}
