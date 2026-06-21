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

const STATUS_SET = new Set(['owned', 'missing', 'check']);
const STATUS_RANK = { missing: 0, check: 1, owned: 2 };

export function normaliseExtraCode(value) {
  const text = String(value || '').trim().toUpperCase().replace(/\s+/g, ' ');
  if (text === '00') return '00';

  const match = text.match(/^FWC\s*(\d{1,2})$/);
  if (!match) return null;

  const number = Number(match[1]);
  const code = `FWC ${number}`;
  return number >= 1 && number <= 19 ? code : null;
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

export function extraTotals(extras) {
  const clean = normaliseExtras(extras);
  return {
    owned: EXTRA_CODES.filter((code) => clean[code] === 'owned').length,
    check: EXTRA_CODES.filter((code) => clean[code] === 'check').length,
    total: EXTRA_CODES.length,
  };
}

export function missingExtraLabels(extras) {
  const clean = normaliseExtras(extras);
  return EXTRA_CODES.filter((code) => clean[code] !== 'owned');
}
