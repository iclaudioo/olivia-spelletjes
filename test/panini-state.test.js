import test from 'node:test';
import assert from 'node:assert/strict';

import {
  addOwnedSticker,
  addTradeSticker,
  createTradeShare,
  mergePaniniExtras,
  mergeTradeShares,
  missingStickerLabels,
  removeOwnedSticker,
  saveTradeClaim,
  normaliseStickerCode,
  normalisePaniniState,
  tradeShareAvailability,
} from '../spelletjes/panini/src/sticker-state.js';

test('normaliseStickerCode accepts loose typing and validates known sticker ranges', () => {
  assert.deepEqual(normaliseStickerCode(' bel 15 '), { code: 'BEL', number: 15, label: 'BEL 15', type: 'team' });
  assert.deepEqual(normaliseStickerCode('bel15'), { code: 'BEL', number: 15, label: 'BEL 15', type: 'team' });
  assert.deepEqual(normaliseStickerCode('00'), { code: '00', number: 0, label: '00', type: 'extra' });
  assert.deepEqual(normaliseStickerCode('fwc10'), { code: 'FWC 10', number: 0, label: 'FWC 10', type: 'extra' });
  assert.equal(normaliseStickerCode('BEL 21'), null);
  assert.equal(normaliseStickerCode('FWC 20'), null);
  assert.equal(normaliseStickerCode('XXX 1'), null);
});

test('addOwnedSticker stores one sorted sticker and records recent new stickers once', () => {
  const state = { teams: { BEL: [3, 20] }, trades: {}, newOnes: ['BEL 3'] };
  const result = addOwnedSticker(state, 'BEL', 15);

  assert.deepEqual(result.teams.BEL, [3, 15, 20]);
  assert.deepEqual(result.newOnes, ['BEL 3', 'BEL 15']);

  addOwnedSticker(state, 'BEL', 15);
  assert.deepEqual(result.teams.BEL, [3, 15, 20]);
  assert.deepEqual(result.newOnes, ['BEL 3', 'BEL 15']);
});

test('addTradeSticker increments normalised duplicate labels', () => {
  const state = { teams: {}, trades: { 'BEL 15': 1 }, newOnes: [] };
  const result = addTradeSticker(state, 'bel15');

  assert.deepEqual(result.trades, { 'BEL 15': 2 });

  addTradeSticker(state, 'fwc10');
  assert.equal(result.trades['FWC 10'], 1);
});

test('removeOwnedSticker removes a mistaken sticker and recent entry', () => {
  const state = { teams: { BEL: [3, 7, 15, 20] }, trades: {}, newOnes: ['BEL 15', 'CRO 10'] };
  const result = removeOwnedSticker(state, 'bel15');

  assert.deepEqual(result.teams.BEL, [3, 7, 20]);
  assert.deepEqual(result.newOnes, ['CRO 10']);
});

test('normalisePaniniState drops unexpected imported fields', () => {
  const state = normalisePaniniState({
    teams: { BEL: [15] },
    trades: {},
    newOnes: ['BEL 15'],
    injected: '<script>alert(1)</script>',
    nested: { unexpected: true },
  });

  assert.deepEqual(Object.keys(state).sort(), [
    'appliedBatches',
    'cloudSchema',
    'extras',
    'lastSyncedAt',
    'newOnes',
    'teams',
    'tradeShares',
    'trades',
  ]);
  assert.equal(state.extras['00'], 'owned');
  assert.equal(state.extras['FWC 6'], 'check');
  assert.equal(state.extras['FWC 19'], 'missing');
});

test('createTradeShare snapshots current duplicate stickers into a share board', () => {
  const state = { teams: { BEL: [15], CRO: [10] }, trades: { 'bel15': 2, 'CRO 10': 1, 'BAD 99': 4 } };
  const board = createTradeShare(state, { id: 'share123', ownerName: 'Olivia', now: '2026-06-21T08:00:00.000Z' });

  assert.equal(board.id, 'share123');
  assert.equal(board.ownerName, 'Olivia');
  assert.deepEqual(board.items, { 'BEL 15': 2, 'CRO 10': 1 });
  assert.equal(board.missing.includes('BEL 15'), false);
  assert.equal(board.missing.includes('BEL 16'), true);
  assert.deepEqual(state.tradeShares.share123, board);
});

test('missingStickerLabels lists stickers Olivia does not own', () => {
  const labels = missingStickerLabels({ teams: { BEL: [1, 2, 3] } });

  assert.equal(labels.includes('BEL 1'), false);
  assert.equal(labels.includes('BEL 4'), true);
  assert.equal(labels.includes('CRO 10'), true);
  assert.equal(labels.includes('00'), false);
  assert.equal(labels.includes('FWC 4'), false);
  assert.equal(labels.includes('FWC 6'), true);
  assert.equal(labels.includes('FWC 19'), true);
});

test('mergePaniniExtras keeps the strongest status', () => {
  const merged = mergePaniniExtras(
    { 'FWC 6': 'missing', 'FWC 7': 'owned', 'FWC 8': 'check' },
    { 'FWC 6': 'check', 'FWC 7': 'missing', 'FWC 8': 'missing', 'FWC 9': 'owned' },
  );

  assert.equal(merged['FWC 6'], 'check');
  assert.equal(merged['FWC 7'], 'owned');
  assert.equal(merged['FWC 8'], 'check');
  assert.equal(merged['FWC 9'], 'owned');
});

test('saveTradeClaim keeps one claim per friend and validates wanted and offered stickers', () => {
  const state = {
    tradeShares: {
      share123: {
        id: 'share123',
        ownerName: 'Olivia',
        items: { 'BEL 15': 2, 'CRO 10': 1 },
        missing: ['SUI 20', 'BEL 16'],
        claims: [],
      },
    },
  };

  const claim = saveTradeClaim(state, 'share123', {
    friendName: 'Emma',
    wanted: ['bel15', 'CRO 10', 'SUI 20'],
    offered: ['SUI 20', 'BEL 15', 'BEL 16'],
    now: '2026-06-21T08:01:00.000Z',
  });

  assert.equal(claim.friendName, 'Emma');
  assert.deepEqual(claim.wanted, ['BEL 15', 'CRO 10']);
  assert.deepEqual(claim.offered, ['SUI 20', 'BEL 16']);

  saveTradeClaim(state, 'share123', {
    friendName: 'Emma',
    wanted: ['CRO 10'],
    offered: ['SUI 20'],
    now: '2026-06-21T08:02:00.000Z',
  });

  assert.equal(state.tradeShares.share123.claims.length, 1);
  assert.deepEqual(state.tradeShares.share123.claims[0].wanted, ['CRO 10']);
  assert.deepEqual(state.tradeShares.share123.claims[0].offered, ['SUI 20']);
});

test('trade claims reserve duplicate availability for other friends', () => {
  const state = {
    tradeShares: {
      share123: {
        id: 'share123',
        ownerName: 'Olivia',
        items: { 'BEL 15': 1, 'CRO 10': 2 },
        missing: ['SUI 20'],
        claims: [{ friendName: 'Emma', wanted: ['BEL 15', 'CRO 10'], offered: [], updatedAt: '2026-06-21T08:00:00.000Z' }],
      },
    },
  };

  assert.deepEqual(tradeShareAvailability(state.tradeShares.share123), { 'BEL 15': 0, 'CRO 10': 1 });
  assert.deepEqual(tradeShareAvailability(state.tradeShares.share123, { excludeFriendName: 'Emma' }), { 'BEL 15': 1, 'CRO 10': 2 });

  const claim = saveTradeClaim(state, 'share123', {
    friendName: 'Noah',
    wanted: ['BEL 15', 'CRO 10'],
    offered: [],
    now: '2026-06-21T08:02:00.000Z',
  });

  assert.deepEqual(claim.wanted, ['CRO 10']);
  assert.equal(state.tradeShares.share123.claims.length, 2);
});

test('normalisePaniniState preserves trade shares and normalises claims', () => {
  const state = normalisePaniniState({
    tradeShares: {
      share123: {
        id: 'share123',
        ownerName: 'Olivia',
        items: { bel15: 2, 'CRO 10': 1 },
        missing: ['SUI 20'],
        claims: [{ friendName: ' Emma ', wanted: ['BEL15', 'XXX 1'], offered: ['SUI20', 'BEL15'] }],
      },
    },
  });

  assert.deepEqual(state.tradeShares.share123.items, { 'BEL 15': 2, 'CRO 10': 1 });
  assert.deepEqual(state.tradeShares.share123.missing, ['SUI 20']);
  assert.deepEqual(state.tradeShares.share123.claims[0].wanted, ['BEL 15']);
  assert.deepEqual(state.tradeShares.share123.claims[0].offered, ['SUI 20']);
});

test('mergeTradeShares keeps owner updates and friend claims together', () => {
  const merged = mergeTradeShares(
    {
      share123: {
        id: 'share123',
        ownerName: 'Olivia',
        items: { 'BEL 15': 1 },
        missing: ['SUI 20'],
        claims: [{ friendName: 'Emma', wanted: ['BEL 15'], offered: ['SUI 20'], updatedAt: '2026-06-21T08:01:00.000Z' }],
      },
    },
    {
      share123: {
        id: 'share123',
        ownerName: 'Olivia',
        items: { 'BEL 15': 2, 'CRO 10': 1 },
        missing: ['SUI 20', 'BEL 16'],
        claims: [{ friendName: 'Noah', wanted: ['CRO 10'], offered: ['BEL 16'], updatedAt: '2026-06-21T08:02:00.000Z' }],
      },
    },
  );

  assert.deepEqual(merged.share123.items, { 'BEL 15': 2, 'CRO 10': 1 });
  assert.deepEqual(merged.share123.missing, ['SUI 20', 'BEL 16']);
  assert.deepEqual(merged.share123.claims.map((claim) => claim.friendName).sort(), ['Emma', 'Noah']);
});
