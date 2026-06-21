import test from 'node:test';
import assert from 'node:assert/strict';

import {
  addOwnedSticker,
  addTradeSticker,
  normaliseStickerCode,
} from '../spelletjes/panini/src/sticker-state.js';

test('normaliseStickerCode accepts loose typing and validates known sticker ranges', () => {
  assert.deepEqual(normaliseStickerCode(' bel 15 '), { code: 'BEL', number: 15, label: 'BEL 15' });
  assert.deepEqual(normaliseStickerCode('bel15'), { code: 'BEL', number: 15, label: 'BEL 15' });
  assert.equal(normaliseStickerCode('BEL 21'), null);
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
});
