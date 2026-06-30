export const EXTRA_ITEMS = [
  {
    code: '00',
    group: 'Intro',
    name: 'FIFA World Cup 2026 hologram / trophy logo',
    status: 'owned',
    confidence: 'verified',
    note: 'Geplakt op de openingspagina rechtsonder.',
  },
  {
    code: 'FWC 1',
    group: 'Intro',
    name: 'Official Emblem',
    status: 'missing',
    confidence: 'verified',
    note: 'Leeg vakje op openingspagina.',
  },
  {
    code: 'FWC 2',
    group: 'Intro',
    name: 'Opening special',
    status: 'missing',
    confidence: 'verified',
    note: 'Leeg vakje op openingspagina.',
  },
  {
    code: 'FWC 3',
    group: 'Intro',
    name: 'Official Mascots',
    status: 'missing',
    confidence: 'verified',
    note: 'Leeg vakje op openingspagina.',
  },
  {
    code: 'FWC 4',
    group: 'Host Countries',
    name: 'TRIONDA Official Match Ball',
    status: 'owned',
    confidence: 'verified_visible',
    note: 'Balsticker is zichtbaar geplakt op Host Countries & Cities pagina.',
  },
  {
    code: 'FWC 5',
    group: 'Host Countries',
    name: 'Host Countries / CAN-MEX-USA',
    status: 'owned',
    confidence: 'verified_visible',
    note: 'Oranje CAN-MEX-USA host-sticker is zichtbaar geplakt.',
  },
  {
    code: 'FWC 6',
    group: 'Host Countries',
    name: 'Canada Host Country Emblem',
    status: 'check',
    confidence: 'needs_check',
    note: 'Exacte status niet 100% zichtbaar op foto. Toon als checken.',
  },
  {
    code: 'FWC 7',
    group: 'Host Countries',
    name: 'Mexico Host Country Emblem',
    status: 'missing',
    confidence: 'verified',
    note: 'Leeg vakje FWC 7.',
  },
  {
    code: 'FWC 8',
    group: 'Host Countries',
    name: 'USA Host Country Emblem',
    status: 'missing',
    confidence: 'verified',
    note: 'Leeg vakje FWC 8.',
  },
  {
    code: 'FWC 9',
    group: 'History',
    name: 'FIFA World Cup Italy 1934',
    status: 'missing',
    confidence: 'verified',
    note: 'Leeg vakje FWC 9.',
  },
  {
    code: 'FWC 10',
    group: 'History',
    name: 'FIFA World Cup Brazil 1950 / Uruguay 1950 sticker',
    status: 'owned',
    confidence: 'verified_visible',
    note: 'Uruguay 1950 holografische history-sticker is zichtbaar geplakt.',
  },
  {
    code: 'FWC 11',
    group: 'History',
    name: 'FIFA World Cup Switzerland 1954',
    status: 'missing',
    confidence: 'verified',
    note: 'Leeg vakje FWC 11.',
  },
  {
    code: 'FWC 12',
    group: 'History',
    name: 'FIFA World Cup Chile 1962',
    status: 'missing',
    confidence: 'verified',
    note: 'Leeg vakje FWC 12.',
  },
  {
    code: 'FWC 13',
    group: 'History',
    name: 'FIFA World Cup Germany 1974',
    status: 'missing',
    confidence: 'verified',
    note: 'Leeg vakje FWC 13.',
  },
  {
    code: 'FWC 14',
    group: 'History',
    name: 'FIFA World Cup Mexico 1986',
    status: 'missing',
    confidence: 'verified',
    note: 'Leeg vakje FWC 14.',
  },
  {
    code: 'FWC 15',
    group: 'History',
    name: 'FIFA World Cup USA 1994',
    status: 'missing',
    confidence: 'verified',
    note: 'Leeg vakje FWC 15.',
  },
  {
    code: 'FWC 16',
    group: 'History',
    name: 'FIFA World Cup Korea/Japan 2002 / Brazil 2002',
    status: 'owned',
    confidence: 'likely_visible',
    note: 'Brazil 2002 holografische history-sticker is zichtbaar geplakt; code is waarschijnlijk FWC 16.',
  },
  {
    code: 'FWC 17',
    group: 'History',
    name: 'FIFA World Cup Germany 2006 / Italy 2006',
    status: 'owned',
    confidence: 'verified_visible',
    note: 'Italy 2006 holografische history-sticker is zichtbaar geplakt.',
  },
  {
    code: 'FWC 18',
    group: 'History',
    name: 'FIFA World Cup Brazil 2014',
    status: 'missing',
    confidence: 'verified',
    note: 'Leeg vakje FWC 18.',
  },
  {
    code: 'FWC 19',
    group: 'History',
    name: 'FIFA World Cup Qatar 2022',
    status: 'missing',
    confidence: 'verified',
    note: 'Leeg vakje FWC 19.',
  },
];

export const EXTRA_GROUPS = ['Intro', 'Host Countries', 'History'];
export const EXTRA_CODES = EXTRA_ITEMS.map((item) => item.code);
export const EXTRA_CODE_SET = new Set(EXTRA_CODES);
export const DEFAULT_EXTRAS = Object.fromEntries(EXTRA_ITEMS.map((item) => [item.code, item.status]));

export const RARE_EXTRA_VARIANTS = [
  { code: 'REGULAR', label: 'Paars', aliases: ['REGULAR', 'NORMAL', 'NORMAAL', 'PAARS', 'PURPLE'] },
  { code: 'BRONZE', label: 'Brons', aliases: ['BRONZE', 'BRONS'] },
  { code: 'SILVER', label: 'Zilver', aliases: ['SILVER', 'ZILVER'] },
  { code: 'GOLD', label: 'Goud', aliases: ['GOLD', 'GOUD'] },
];

export const RARE_EXTRA_PLAYERS = [
  { key: 'MESSI', team: 'ARG', name: 'Lionel Messi', aliases: ['MESSI', 'LIONEL MESSI'] },
  { key: 'DOKU', team: 'BEL', name: 'Jérémy Doku', aliases: ['DOKU', 'JEREMY DOKU'] },
  { key: 'VINICIUS', team: 'BRA', name: 'Vinícius Júnior', aliases: ['VINICIUS', 'VINICIUS JUNIOR'] },
  { key: 'DAVIES', team: 'CAN', name: 'Alphonso Davies', aliases: ['DAVIES', 'ALPHONSO DAVIES'] },
  { key: 'DIAZ', team: 'COL', name: 'Luis Díaz', aliases: ['DIAZ', 'LUIS DIAZ'] },
  { key: 'MODRIC', team: 'CRO', name: 'Luka Modrić', aliases: ['MODRIC', 'LUKA MODRIC'] },
  { key: 'CAICEDO', team: 'ECU', name: 'Moisés Caicedo', aliases: ['CAICEDO', 'MOISES CAICEDO'] },
  { key: 'SALAH', team: 'EGY', name: 'Mohamed Salah', aliases: ['SALAH', 'MOHAMED SALAH'] },
  { key: 'BELLINGHAM', team: 'ENG', name: 'Jude Bellingham', aliases: ['BELLINGHAM', 'JUDE BELLINGHAM'] },
  { key: 'MBAPPE', team: 'FRA', name: 'Kylian Mbappé', aliases: ['MBAPPE', 'KYLIAN MBAPPE'] },
  { key: 'WIRTZ', team: 'GER', name: 'Florian Wirtz', aliases: ['WIRTZ', 'FLORIAN WIRTZ'] },
  { key: 'SON', team: 'KOR', name: 'Heungmin Son', aliases: ['SON', 'HEUNGMIN SON'] },
  { key: 'JIMENEZ', team: 'MEX', name: 'Raúl Jiménez', aliases: ['JIMENEZ', 'RAUL JIMENEZ'] },
  { key: 'HAKIMI', team: 'MAR', name: 'Achraf Hakimi', aliases: ['HAKIMI', 'ACHRAF HAKIMI'] },
  { key: 'GAKPO', team: 'NED', name: 'Cody Gakpo', aliases: ['GAKPO', 'CODY GAKPO'] },
  { key: 'HAALAND', team: 'NOR', name: 'Erling Haaland', aliases: ['HAALAND', 'ERLING HAALAND'] },
  { key: 'RONALDO', team: 'POR', name: 'Cristiano Ronaldo', aliases: ['RONALDO', 'CRISTIANO RONALDO'] },
  { key: 'YAMAL', team: 'ESP', name: 'Lamine Yamal', aliases: ['YAMAL', 'LAMINE YAMAL'] },
  { key: 'VALVERDE', team: 'URU', name: 'Federico Valverde', aliases: ['VALVERDE', 'FEDERICO VALVERDE'] },
  { key: 'PULISIC', team: 'USA', name: 'Christian Pulisic', aliases: ['PULISIC', 'CHRISTIAN PULISIC'] },
];

export const RARE_EXTRA_ITEMS = RARE_EXTRA_PLAYERS.flatMap((player) => RARE_EXTRA_VARIANTS.map((variant) => ({
  code: `${player.key} ${variant.code}`,
  playerKey: player.key,
  team: player.team,
  name: player.name,
  variant: variant.code,
  variantLabel: variant.label,
  status: player.key === 'MESSI' && variant.code === 'GOLD' ? 'owned' : 'missing',
})));
export const RARE_EXTRA_CODES = RARE_EXTRA_ITEMS.map((item) => item.code);
export const RARE_EXTRA_CODE_SET = new Set(RARE_EXTRA_CODES);
export const DEFAULT_RARE_EXTRAS = Object.fromEntries(RARE_EXTRA_ITEMS.map((item) => [item.code, item.status]));

const STATUS_SET = new Set(['owned', 'missing', 'check']);
const STATUS_RANK = { missing: 0, check: 1, owned: 2 };

function canonical(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .replace(/\s+/g, ' ');
}

export function normaliseExtraCode(value) {
  const text = String(value || '').trim().toUpperCase().replace(/\s+/g, ' ');
  if (text === '00') return '00';

  const match = text.match(/^FWC\s*(\d{1,2})$/);
  if (!match) return null;

  const number = Number(match[1]);
  const code = `FWC ${number}`;
  return number >= 1 && number <= 19 ? code : null;
}

export function normaliseRareExtraCode(value) {
  const text = canonical(value);
  if (!text) return null;
  if (RARE_EXTRA_CODE_SET.has(text)) return text;

  const tokens = text.split(' ');
  const variant = RARE_EXTRA_VARIANTS.find((item) => item.aliases.some((alias) => tokens.includes(alias)));
  if (!variant) return null;

  const player = RARE_EXTRA_PLAYERS.find((item) => {
    if (tokens.includes(item.team) || tokens.includes(item.key)) return true;
    return item.aliases.some((alias) => text.includes(canonical(alias)));
  });
  return player ? `${player.key} ${variant.code}` : null;
}

export function normaliseExtraStatus(value) {
  return STATUS_SET.has(value) ? value : 'missing';
}

export function normaliseExtras(value) {
  const source = value && typeof value === 'object' ? value : {};
  const out = {};
  for (const code of EXTRA_CODES) {
    out[code] = normaliseExtraStatus(source[code] || DEFAULT_EXTRAS[code]);
  }
  return out;
}

export function normaliseRareExtras(value) {
  const source = value && typeof value === 'object' ? value : {};
  const out = {};
  for (const code of RARE_EXTRA_CODES) {
    out[code] = normaliseExtraStatus(source[code] || DEFAULT_RARE_EXTRAS[code]);
  }
  return out;
}

export function mergeExtraStatus(a, b) {
  const left = normaliseExtraStatus(a);
  const right = normaliseExtraStatus(b);
  return STATUS_RANK[right] > STATUS_RANK[left] ? right : left;
}

export function mergeExtras(a, b) {
  const left = normaliseExtras(a);
  const right = normaliseExtras(b);
  return Object.fromEntries(EXTRA_CODES.map((code) => [code, mergeExtraStatus(left[code], right[code])]));
}

export function mergeRareExtras(a, b) {
  const left = normaliseRareExtras(a);
  const right = normaliseRareExtras(b);
  return Object.fromEntries(RARE_EXTRA_CODES.map((code) => [code, mergeExtraStatus(left[code], right[code])]));
}

// Three-way merge: when the local status changed relative to the synced base,
// the local change wins (so toggling a sticker off actually syncs). Otherwise the
// cloud value wins, preserving a change made on another device.
function pickExtraStatus(cloud, local, base) {
  const cloudStatus = normaliseExtraStatus(cloud);
  const localStatus = normaliseExtraStatus(local);
  const baseStatus = normaliseExtraStatus(base);
  return localStatus !== baseStatus ? localStatus : cloudStatus;
}

export function mergeExtrasWithBase(cloud, local, base) {
  const cloudExtras = normaliseExtras(cloud);
  const localExtras = normaliseExtras(local);
  const baseExtras = normaliseExtras(base);
  return Object.fromEntries(EXTRA_CODES.map((code) => [code, pickExtraStatus(cloudExtras[code], localExtras[code], baseExtras[code])]));
}

export function mergeRareExtrasWithBase(cloud, local, base) {
  const cloudExtras = normaliseRareExtras(cloud);
  const localExtras = normaliseRareExtras(local);
  const baseExtras = normaliseRareExtras(base);
  return Object.fromEntries(RARE_EXTRA_CODES.map((code) => [code, pickExtraStatus(cloudExtras[code], localExtras[code], baseExtras[code])]));
}

export function extraTotals(extras) {
  const clean = normaliseExtras(extras);
  return {
    owned: EXTRA_CODES.filter((code) => clean[code] === 'owned').length,
    check: EXTRA_CODES.filter((code) => clean[code] === 'check').length,
    total: EXTRA_CODES.length,
  };
}

export function rareExtraTotals(rareExtras) {
  const clean = normaliseRareExtras(rareExtras);
  return {
    owned: RARE_EXTRA_CODES.filter((code) => clean[code] === 'owned').length,
    check: RARE_EXTRA_CODES.filter((code) => clean[code] === 'check').length,
    total: RARE_EXTRA_CODES.length,
  };
}

export function missingExtraLabels(extras) {
  const clean = normaliseExtras(extras);
  return EXTRA_CODES.filter((code) => clean[code] !== 'owned');
}

export function missingRareExtraLabels(rareExtras) {
  const clean = normaliseRareExtras(rareExtras);
  return RARE_EXTRA_CODES.filter((code) => clean[code] !== 'owned');
}
