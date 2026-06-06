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

// Mama is een ZANGERES: in plaats van de oude whoops/boing zingt ze nu een kort,
// vrolijk frasetje ("la-la-laa") — een paar op- en aflopende noten, gespeeld met
// oscillators alsof ze even uitschiet in een liedje terwijl ze de kamer vies
// maakt. Elke noot krijgt een lichte triangel-toon + zacht "ah"-vibrato, en een
// kwint erboven voor een warme, gezongen klank. Respecteert aanGeluid().
export function mamaGeluid() {
  if (!aanGeluid()) return;
  const a = audio();
  const t0 = a.currentTime;

  // Vrolijk "la-la-laa"-frasetje: omhoog en weer terug (C–E–G–E–C-achtig).
  const frase = [
    { f: 523.25, dur: 0.16 }, // C5  "la"
    { f: 659.25, dur: 0.16 }, // E5  "la"
    { f: 783.99, dur: 0.22 }, // G5  "laa" (langer gehouden)
    { f: 659.25, dur: 0.16 }, // E5  "la"
    { f: 587.33, dur: 0.26 }, // D5  "laa" (zachte afsluiting)
  ];

  let t = t0;
  for (const { f, dur } of frase) {
    // Grondtoon (warme triangel — klinkt "gezongen", niet scherp).
    const osc = a.createOscillator();
    const g = a.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(f, t);
    // Klein "ah"-vibrato voor een levendige stem.
    const vib = a.createOscillator();
    const vibG = a.createGain();
    vib.type = "sine";
    vib.frequency.value = 6;
    vibG.gain.value = f * 0.012;
    vib.connect(vibG).connect(osc.frequency);
    vib.start(t);
    vib.stop(t + dur + 0.05);

    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(a.destination);
    osc.start(t);
    osc.stop(t + dur + 0.05);

    // Zachte kwint erboven voor een vollere, blijere klank.
    const boven = a.createOscillator();
    const bg = a.createGain();
    boven.type = "sine";
    boven.frequency.setValueAtTime(f * 1.5, t);
    bg.gain.setValueAtTime(0.0001, t);
    bg.gain.exponentialRampToValueAtTime(0.05, t + 0.03);
    bg.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    boven.connect(bg).connect(a.destination);
    boven.start(t);
    boven.stop(t + dur + 0.05);

    t += dur * 0.92; // noten lichtjes laten overlappen → vloeiend "legato"
  }
}

// Aai-geluidje voor het huisdier (Feature G3): een kort, schattig "boop"/chirp —
// een snel omhoog glijdend sinus-toontje met een klein staartje, zoals een blij
// piepje. Bewust zacht en kort zodat herhaald aaien niet vervelend wordt.
// Respecteert aanGeluid().
export function aaiGeluid() {
  if (!aanGeluid()) return;
  const a = audio();
  const t = a.currentTime;

  // Hoofdtoon: snel van ~520 naar ~880 Hz glijden ("boo-p").
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(520, t);
  osc.frequency.exponentialRampToValueAtTime(880, t + 0.09);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.14, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  osc.connect(g).connect(a.destination);
  osc.start(t);
  osc.stop(t + 0.2);

  // Klein blij "chirp"-tikje erbovenop voor de schattige afronding.
  const chirp = a.createOscillator();
  const cg = a.createGain();
  chirp.type = "triangle";
  chirp.frequency.setValueAtTime(1320, t + 0.08);
  chirp.frequency.exponentialRampToValueAtTime(1760, t + 0.15);
  cg.gain.setValueAtTime(0.0001, t + 0.08);
  cg.gain.exponentialRampToValueAtTime(0.07, t + 0.1);
  cg.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
  chirp.connect(cg).connect(a.destination);
  chirp.start(t + 0.08);
  chirp.stop(t + 0.24);
}

// Knuffel-geluidje voor Papa (Feature H1): een warm, zacht "awww"-toontje — twee
// lage sinus-noten die zacht omhoog glijden en samen een warme terts vormen, met
// een heel zachte aanzet zodat het knus en lief klinkt (geen scherpe randen).
// Respecteert aanGeluid().
export function knuffelGeluid() {
  if (!aanGeluid()) return;
  const a = audio();
  const t = a.currentTime;

  // Twee warme sinus-noten (een terts) die samen een knus akkoord vormen en
  // zachtjes een beetje omhoog glijden ("mmm-aah").
  [
    { f0: 330, f1: 392 }, // E4 → G4
    { f0: 415, f1: 494 }, // G#4 → B4 (zachte boventoon)
  ].forEach(({ f0, f1 }, i) => {
    const osc = a.createOscillator();
    const g = a.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(f0, t);
    osc.frequency.linearRampToValueAtTime(f1, t + 0.28);
    const piek = i === 0 ? 0.16 : 0.07; // de boventoon zachter
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(piek, t + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    osc.connect(g).connect(a.destination);
    osc.start(t);
    osc.stop(t + 0.55);
  });
}

// Kus-geluidje voor Papa (Feature H1): een kort, vrolijk "mwah" — een snel
// omhoog-en-weer-omlaag glijdend toontje (de "smak") gevolgd door een klein blij
// tikje. Bewust kort en grappig zodat een kusje extra leuk voelt.
// Respecteert aanGeluid().
export function kusGeluid() {
  if (!aanGeluid()) return;
  const a = audio();
  const t = a.currentTime;

  // De "smak": snel omhoog (mwa) en weer omlaag (h) — een puckerend toontje.
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(520, t);
  osc.frequency.exponentialRampToValueAtTime(1100, t + 0.05);
  osc.frequency.exponentialRampToValueAtTime(660, t + 0.13);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  osc.connect(g).connect(a.destination);
  osc.start(t);
  osc.stop(t + 0.2);

  // Klein blij "tikje" als vrolijke afronding van de kus.
  const tik = a.createOscillator();
  const tg = a.createGain();
  tik.type = "triangle";
  tik.frequency.setValueAtTime(1568, t + 0.12);
  tg.gain.setValueAtTime(0.0001, t + 0.12);
  tg.gain.exponentialRampToValueAtTime(0.1, t + 0.14);
  tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
  tik.connect(tg).connect(a.destination);
  tik.start(t + 0.12);
  tik.stop(t + 0.28);
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
