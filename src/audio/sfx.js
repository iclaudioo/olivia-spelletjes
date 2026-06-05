// Geluidjes — volledig met de Web Audio API gemaakt (geen losse bestanden nodig).

import { getStaat } from "../state.js";

let ctx = null;
let ruisBuffer = null;

// De ENE gedeelde AudioContext voor alle geluid (sfx én muziek). De muziek-
// module importeert deze i.p.v. een eigen context te maken — anders krijg je
// concurrerende contexten (op iOS vaak een hard limiet).
export function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
  }
  // iOS/Safari: context start "suspended" tot de eerste aanraking.
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function aanGeluid() {
  return getStaat().instellingen?.geluid !== false;
}

// Eenmalig opwekken bij eerste aanraking (vereist door iOS).
export function ontgrendelAudio() {
  audio();
}

function maakRuis() {
  const a = audio();
  if (ruisBuffer) return ruisBuffer;
  const lengte = a.sampleRate * 1.0;
  const buffer = a.createBuffer(1, lengte, a.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < lengte; i++) data[i] = Math.random() * 2 - 1;
  ruisBuffer = buffer;
  return buffer;
}

// Korte "schrob" ruis tijdens het vegen.
let laatsteSchrob = 0;
export function schrobGeluid() {
  if (!aanGeluid()) return;
  const nu = performance.now();
  if (nu - laatsteSchrob < 90) return; // niet te vaak
  laatsteSchrob = nu;

  const a = audio();
  const bron = a.createBufferSource();
  bron.buffer = maakRuis();
  const filter = a.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1400 + Math.random() * 800;
  filter.Q.value = 0.8;
  const gain = a.createGain();
  gain.gain.value = 0.0;
  gain.gain.linearRampToValueAtTime(0.08, a.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 0.16);
  bron.connect(filter).connect(gain).connect(a.destination);
  bron.start();
  bron.stop(a.currentTime + 0.18);
}

// Vrolijk "ding" als iets schoon is.
export function sparkleGeluid() {
  if (!aanGeluid()) return;
  const a = audio();
  const tonen = [880, 1175, 1568];
  tonen.forEach((f, i) => {
    const osc = a.createOscillator();
    const g = a.createGain();
    osc.type = "triangle";
    osc.frequency.value = f;
    const t = a.currentTime + i * 0.07;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    osc.connect(g).connect(a.destination);
    osc.start(t);
    osc.stop(t + 0.4);
  });
}

// Munt-geluid bij beloning.
export function muntGeluid() {
  if (!aanGeluid()) return;
  const a = audio();
  [1318, 1760].forEach((f, i) => {
    const osc = a.createOscillator();
    const g = a.createGain();
    osc.type = "square";
    osc.frequency.value = f;
    const t = a.currentTime + i * 0.08;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    osc.connect(g).connect(a.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  });
}

// Groot feest-deuntje bij "klaar!".
export function vieringGeluid() {
  if (!aanGeluid()) return;
  const a = audio();
  const melodie = [523, 659, 784, 1047, 1319];
  melodie.forEach((f, i) => {
    const osc = a.createOscillator();
    const g = a.createGain();
    osc.type = "triangle";
    osc.frequency.value = f;
    const t = a.currentTime + i * 0.12;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.2, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    osc.connect(g).connect(a.destination);
    osc.start(t);
    osc.stop(t + 0.45);
  });
}
