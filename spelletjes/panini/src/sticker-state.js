import {
  EXTRA_CODE_SET,
  mergeExtras,
  mergeRareExtras,
  missingExtraLabels,
  missingRareExtraLabels,
  normaliseExtraCode,
  normaliseExtras,
  normaliseRareExtraCode,
  normaliseRareExtras,
  RARE_EXTRA_CODE_SET,
} from './extras.js';

const TEAM_CODE_LIST = [
  'MEX', 'RSA', 'KOR', 'CZE', 'CAN', 'BIH', 'QAT', 'SUI',
  'BRA', 'MAR', 'HAI', 'SCO', 'USA', 'PAR', 'AUS', 'TUR',
  'GER', 'CUW', 'CIV', 'ECU', 'NED', 'JPN', 'SWE', 'TUN',
  'BEL', 'EGY', 'IRN', 'NZL', 'ESP', 'CPV', 'KSA', 'URU',
  'FRA', 'SEN', 'IRQ', 'NOR', 'ARG', 'ALG', 'AUT', 'JOR',
  'POR', 'COD', 'UZB', 'COL', 'ENG', 'CRO', 'GHA', 'PAN',
];
const TEAM_CODES = new Set(TEAM_CODE_LIST);

export function normaliseStickerCode(input, number) {
  const text = number == null ? String(input || '') : `${input || ''} ${number}`;
  const extraCode = normaliseExtraCode(text);
  if (extraCode) return { code: extraCode, number: 0, label: extraCode, type: 'extra' };
  const rareExtraCode = normaliseRareExtraCode(text);
  if (rareExtraCode) return { code: rareExtraCode, number: 0, label: rareExtraCode, type: 'rareExtra' };

  const match = text.trim().toUpperCase().match(/^([A-Z]{3})\s*(\d{1,2})$/);
  if (!match) return null;

  const code = match[1];
  const stickerNumber = Number(match[2]);
  if (!TEAM_CODES.has(code) || stickerNumber < 1 || stickerNumber > 20) return null;

  return { code, number: stickerNumber, label: `${code} ${stickerNumber}`, type: 'team' };
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

export function missingStickerLabels(state) {
  const source = state && typeof state === 'object' ? state : {};
  const out = [];
  for (const code of TEAM_CODE_LIST) {
    const owned = new Set(uniqueNumbers(source.teams?.[code]));
    for (let number = 1; number <= 20; number++) {
      if (!owned.has(number)) out.push(`${code} ${number}`);
    }
  }
  return [...out, ...missingExtraLabels(source.extras), ...missingRareExtraLabels(source.rareExtras)];
}

function normaliseFriendName(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, 80);
}

function claimKey(friendName) {
  return friendName.toLowerCase();
}

function wantedCounts(claims, excludeFriendName = '') {
  const excludeKey = claimKey(normaliseFriendName(excludeFriendName));
  const counts = {};
  for (const claim of Array.isArray(claims) ? claims : []) {
    if (excludeKey && claimKey(normaliseFriendName(claim?.friendName)) === excludeKey) continue;
    for (const label of uniqueStickerLabels(claim?.wanted)) {
      counts[label] = (counts[label] || 0) + 1;
    }
  }
  return counts;
}

function normaliseTradeShare(rawShare) {
  const share = rawShare && typeof rawShare === 'object' ? rawShare : {};
  const id = String(share.id || '').trim();
  if (!id) return null;

  const items = normaliseStickerMap(share.items);
  const allowedWanted = new Set(Object.keys(items));
  const missing = uniqueStickerLabels(share.missing);
  const allowedOffered = new Set(missing);
  const claims = [];
  const seenClaimKeys = new Set();

  for (const rawClaim of Array.isArray(share.claims) ? share.claims : []) {
    const friendName = normaliseFriendName(rawClaim?.friendName);
    const wanted = uniqueStickerLabels(rawClaim?.wanted).filter((label) => allowedWanted.has(label));
    const offered = uniqueStickerLabels(rawClaim?.offered).filter((label) => allowedOffered.has(label));
    const key = claimKey(friendName);
    if (!friendName || (!wanted.length && !offered.length) || seenClaimKeys.has(key)) continue;
    seenClaimKeys.add(key);
    claims.push({
      friendName,
      wanted,
      offered,
      updatedAt: rawClaim?.updatedAt || null,
    });
  }

  return {
    id,
    ownerName: normaliseFriendName(share.ownerName) || 'Olivia',
    items,
    missing,
    claims,
    createdAt: share.createdAt || null,
    updatedAt: share.updatedAt || share.createdAt || null,
  };
}

export function tradeShareAvailability(rawShare, options = {}) {
  const share = normaliseTradeShare(rawShare);
  if (!share) return {};

  const reserved = wantedCounts(share.claims, options.excludeFriendName);
  return Object.fromEntries(
    Object.entries(share.items).map(([label, count]) => [
      label,
      Math.max(0, Math.floor(Number(count || 0)) - (reserved[label] || 0)),
    ]),
  );
}

export function tradeShareClaimSummaries(rawShare) {
  const share = normaliseTradeShare(rawShare);
  if (!share) return [];

  return share.claims.map((claim) => {
    const availability = tradeShareAvailability(share, { excludeFriendName: claim.friendName });
    const availableWantedCount = claim.wanted.filter((label) => Number(availability[label] || 0) > 0).length;
    return {
      friendName: claim.friendName,
      wantedCount: claim.wanted.length,
      offeredCount: claim.offered.length,
      availableWantedCount,
      unavailableWantedCount: claim.wanted.length - availableWantedCount,
      wanted: [...claim.wanted],
      offered: [...claim.offered],
      updatedAt: claim.updatedAt,
    };
  }).sort((a, b) => (
    (b.availableWantedCount + b.offeredCount) - (a.availableWantedCount + a.offeredCount)
    || a.friendName.localeCompare(b.friendName)
  ));
}

export function normalisePaniniState(state) {
  const source = state && typeof state === 'object' ? state : {};
  const teams = {};
  for (const [code, stickers] of Object.entries(source.teams || {})) {
    if (TEAM_CODES.has(code)) teams[code] = uniqueNumbers(stickers);
  }

  const trades = normaliseStickerMap(source.trades);
  const extras = normaliseExtras(source.extras);
  const rareExtras = normaliseRareExtras(source.rareExtras);
  const tradeShares = {};
  for (const rawShare of Object.values(source.tradeShares || {})) {
    const share = normaliseTradeShare(rawShare);
    if (share) tradeShares[share.id] = share;
  }

  return {
    cloudSchema: 1,
    teams,
    extras,
    rareExtras,
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

export function mergePaniniExtras(leftExtras, rightExtras) {
  return mergeExtras(leftExtras, rightExtras);
}

export function mergePaniniRareExtras(leftExtras, rightExtras) {
  return mergeRareExtras(leftExtras, rightExtras);
}

export function mergePaniniStates(cloudState, localState) {
  const left = normalisePaniniState(cloudState);
  const right = normalisePaniniState(localState);
  const teams = { ...left.teams };
  for (const [code, stickers] of Object.entries(right.teams)) {
    teams[code] = normalisePaniniState({ teams: { [code]: [...(teams[code] || []), ...stickers] } }).teams[code] || [];
  }

  const trades = { ...left.trades };
  for (const [code, amount] of Object.entries(right.trades)) {
    trades[code] = Math.max(Number(trades[code] || 0), Number(amount || 0));
  }

  return normalisePaniniState({
    cloudSchema: 1,
    teams,
    extras: mergePaniniExtras(left.extras, right.extras),
    rareExtras: mergePaniniRareExtras(left.rareExtras, right.rareExtras),
    trades,
    tradeShares: mergeTradeShares(left.tradeShares, right.tradeShares),
    newOnes: [...(left.newOnes || []), ...(right.newOnes || [])].slice(-100),
    appliedBatches: [...new Set([...(left.appliedBatches || []), ...(right.appliedBatches || [])])],
    lastSyncedAt: new Date().toISOString(),
  });
}

export function addOwnedSticker(state, codeOrLabel, number) {
  const sticker = normaliseStickerCode(codeOrLabel, number);
  if (!sticker) return null;

  state.newOnes ??= [];

  if (sticker.type === 'extra' || sticker.type === 'rareExtra') {
    const key = sticker.type === 'extra' ? 'extras' : 'rareExtras';
    const normalise = sticker.type === 'extra' ? normaliseExtras : normaliseRareExtras;
    state[key] = normalise(state[key]);
    state[key][sticker.label] = 'owned';
    if (!state.newOnes.includes(sticker.label)) {
      state.newOnes.push(sticker.label);
      state.newOnes = state.newOnes.slice(-100);
    }
    return state;
  }

  state.teams ??= {};

  const current = uniqueNumbers(state.teams[sticker.code]);
  const alreadyOwned = current.includes(sticker.number);
  state.teams[sticker.code] = uniqueNumbers([...current, sticker.number]);

  if (!alreadyOwned && !state.newOnes.includes(sticker.label)) {
    state.newOnes.push(sticker.label);
    state.newOnes = state.newOnes.slice(-100);
  }

  return state;
}

export function removeOwnedSticker(state, codeOrLabel, number) {
  const sticker = normaliseStickerCode(codeOrLabel, number);
  if (!sticker) return null;

  state.teams ??= {};
  state.newOnes ??= [];

  if (sticker.type === 'extra' || sticker.type === 'rareExtra') {
    const key = sticker.type === 'extra' ? 'extras' : 'rareExtras';
    const normalise = sticker.type === 'extra' ? normaliseExtras : normaliseRareExtras;
    state[key] = normalise(state[key]);
    state[key][sticker.label] = 'missing';
    state.newOnes = uniqueStickerLabels(state.newOnes).filter((label) => label !== sticker.label);
    return state;
  }

  const current = uniqueNumbers(state.teams[sticker.code]);
  state.teams[sticker.code] = current.filter((value) => value !== sticker.number);
  state.newOnes = uniqueStickerLabels(state.newOnes).filter((label) => label !== sticker.label);

  return state;
}

export function addTradeSticker(state, codeOrLabel, number) {
  const sticker = normaliseStickerCode(codeOrLabel, number);
  if (!sticker) return null;

  state.trades ??= {};
  state.trades[sticker.label] = Math.floor(Number(state.trades[sticker.label] || 0)) + 1;
  return state;
}

export function setExtraStatus(state, codeOrLabel, status) {
  const code = normaliseExtraCode(codeOrLabel);
  if (!EXTRA_CODE_SET.has(code)) return null;

  state.extras = normaliseExtras(state.extras);
  state.extras[code] = ['owned', 'missing', 'check'].includes(status) ? status : 'missing';
  return state;
}

export function setRareExtraStatus(state, codeOrLabel, status) {
  const code = normaliseRareExtraCode(codeOrLabel);
  if (!RARE_EXTRA_CODE_SET.has(code)) return null;

  state.rareExtras = normaliseRareExtras(state.rareExtras);
  state.rareExtras[code] = ['owned', 'missing', 'check'].includes(status) ? status : 'missing';
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
    missing: missingStickerLabels(state),
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
  const allowedWanted = new Set(Object.keys(share.items));
  const allowedOffered = new Set(share.missing);
  const availability = tradeShareAvailability(share, { excludeFriendName: friendName });
  const wanted = uniqueStickerLabels(options.wanted).filter((label) => allowedWanted.has(label) && availability[label] > 0);
  const offered = uniqueStickerLabels(options.offered).filter((label) => allowedOffered.has(label));
  if (!friendName || (!wanted.length && !offered.length)) return null;

  const now = options.now || new Date().toISOString();
  const key = claimKey(friendName);
  const claim = { friendName, wanted, offered, updatedAt: now };
  share.claims = share.claims.filter((item) => claimKey(item.friendName) !== key);
  share.claims.push(claim);
  share.updatedAt = now;

  state.tradeShares ??= {};
  state.tradeShares[id] = share;
  return claim;
}
