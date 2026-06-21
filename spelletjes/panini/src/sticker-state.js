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

export function normalisePaniniState(state) {
  const source = state && typeof state === 'object' ? state : {};
  const teams = {};
  for (const [code, stickers] of Object.entries(source.teams || {})) {
    if (TEAM_CODES.has(code)) teams[code] = uniqueNumbers(stickers);
  }

  const trades = {};
  for (const [rawCode, amount] of Object.entries(source.trades || {})) {
    const sticker = normaliseStickerCode(rawCode);
    const count = Math.floor(Number(amount));
    if (sticker && count > 0) trades[sticker.label] = (trades[sticker.label] || 0) + count;
  }

  return {
    ...source,
    cloudSchema: 1,
    teams,
    trades,
    newOnes: uniqueStickerLabels(source.newOnes).slice(-100),
    appliedBatches: Array.isArray(source.appliedBatches) ? [...new Set(source.appliedBatches.map(String).filter(Boolean))] : [],
    lastSyncedAt: source.lastSyncedAt || null,
  };
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
