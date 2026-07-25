import test from 'node:test';
import assert from 'node:assert/strict';

import { merge, kanoniek } from '../spelletjes/grieks/src/merge.js';

const LEEG = {
  sterren: 0,
  geschreven: {},
  groepGoed: {},
  memoryKlaar: {},
  oefenrondes: 0,
  oefenrondeLaatst: '',
};

test('merge is grow-only: van elk veld blijft de hoogste stand staan', () => {
  const cloud = {
    sterren: 12,
    geschreven: { 'Α': true },
    groepGoed: { '🐾 Dieren': 4, '🎨 Kleuren': 10 },
    memoryKlaar: { '🐾 Dieren': true },
    oefenrondes: 2,
    oefenrondeLaatst: '2026-07-24',
  };
  const lokaal = {
    sterren: 9,
    geschreven: { 'Β': true },
    groepGoed: { '🐾 Dieren': 7 },
    memoryKlaar: { '🎨 Kleuren': true },
    oefenrondes: 3,
    oefenrondeLaatst: '2026-07-25',
  };
  const uit = merge(cloud, lokaal);
  assert.equal(uit.sterren, 12);
  assert.deepEqual(uit.geschreven, { 'Α': true, 'Β': true });
  assert.equal(uit.groepGoed['🐾 Dieren'], 7);
  assert.equal(uit.groepGoed['🎨 Kleuren'], 10);
  assert.deepEqual(uit.memoryKlaar, { '🎨 Kleuren': true, '🐾 Dieren': true });
  assert.equal(uit.oefenrondes, 3);
  assert.equal(uit.oefenrondeLaatst, '2026-07-25');
});

test('lege of ontbrekende cloud laat lokale voortgang intact', () => {
  const lokaal = { ...LEEG, sterren: 5, geschreven: { 'Δ': true } };
  assert.equal(merge({}, lokaal).sterren, 5);
  assert.equal(merge(null, lokaal).sterren, 5);
  assert.deepEqual(merge(undefined, lokaal).geschreven, { 'Δ': true });
});

test('vreemde types uit de cloud worden genormaliseerd', () => {
  const cloud = {
    sterren: '<script>',
    geschreven: { 'Α': '<img onerror=x>', 'Β': 0 },
    groepGoed: { '🐾 Dieren': 'veel' },
    memoryKlaar: null,
    oefenrondes: 'nee',
    oefenrondeLaatst: 42,
  };
  const uit = merge(cloud, LEEG);
  assert.equal(uit.sterren, 0);
  assert.deepEqual(uit.geschreven, { 'Α': true });
  assert.equal(uit.groepGoed['🐾 Dieren'], 0);
  assert.deepEqual(uit.memoryKlaar, {});
  assert.equal(uit.oefenrondes, 0);
  assert.equal(typeof uit.oefenrondeLaatst, 'string');
});

test('kanoniek maakt gelijke standen ook als string gelijk, los van sleutelvolgorde', () => {
  const a = { ...LEEG, geschreven: { 'Β': true, 'Α': true }, groepGoed: { 'b': 1, 'a': 2 } };
  const b = { ...LEEG, geschreven: { 'Α': true, 'Β': true }, groepGoed: { 'a': 2, 'b': 1 } };
  assert.equal(JSON.stringify(kanoniek(a)), JSON.stringify(kanoniek(b)));
  // Tweemaal samenvoegen verandert niets meer (idempotent).
  const uit = merge(a, b);
  assert.equal(JSON.stringify(merge(uit, uit)), JSON.stringify(uit));
});
