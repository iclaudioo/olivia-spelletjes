// Achtergrondmuziek — volledig met de Web Audio API gemaakt (geen bestanden,
// geen dependencies). Een zacht, vrolijk, eindeloos lopend deuntje: een trage
// arpeggio over een simpele akkoord-progressie op laag volume. Kindvriendelijk
// en niet irritant.
//
// Belangrijk:
//  - We DELEN de AudioContext met sfx.js (geen concurrerende contexten — iOS
//    heeft een hard limiet op het aantal contexten).
//  - De muziek mag pas starten na een gebruikersgebaar (iOS). Hij wordt
//    aangezet vanuit de instellingen (een tik) of bij de eerste pointerdown in
//    main.js; beide tellen als gebaar.
//  - De lus wordt met een herhalende timer ("scheduler") opgebouwd i.p.v. één
//    lange buffer, zodat hij oneindig doorloopt tot stopMuziek().
//  - Volume is bewust laag (zie MUZIEK_VOLUME).

import { audio } from "./sfx.js";
import { getStaat } from "../state.js";

// Zacht grondvolume voor de hele muzieklaag.
const MUZIEK_VOLUME = 0.06;

// Tempo: hoeveel seconden één arpeggio-noot duurt.
const NOOT_DUUR = 0.42;

// Een eenvoudige, vrolijke akkoord-progressie in C-majeur (I–vi–IV–V).
// Per akkoord een arpeggio van vier noten (frequenties in Hz).
const PROGRESSIE = [
  [261.63, 329.63, 392.0, 523.25], // C  majeur
  [220.0, 261.63, 329.63, 440.0], // a  mineur
  [174.61, 220.0, 261.63, 349.23], // F  majeur
  [196.0, 246.94, 392.0, 293.66], // G  majeur
];

// Hoeveel noten we vooruit inplannen per scheduler-tik (kleine buffer zodat de
// timing strak blijft, ook als de tab even hapert).
const VOORUIT_NOTEN = 2;

let mainGain = null; // de gedeelde uitgangs-gain (alleen aangemaakt als nodig)
let speelt = false; // draait de lus nu?
let timer = 0; // scheduler-interval-id
let volgendeTijd = 0; // wanneer de volgende noot moet starten (ctx-tijd)
let stap = 0; // hoeveelste noot in de hele progressie

function aanMuziek() {
  return getStaat().instellingen?.muziek === true;
}

// De gedeelde main-gain lazily aanmaken (één keer) en op het grondvolume zetten.
function getMainGain(a) {
  if (mainGain) return mainGain;
  mainGain = a.createGain();
  mainGain.gain.value = MUZIEK_VOLUME;
  mainGain.connect(a.destination);
  return mainGain;
}

// Eén arpeggio-noot inplannen op tijdstip `t` (ctx-tijd). Zacht aan- en
// uitvloeiend zodat er geen klikjes zijn; een tweede octaaf-laag geeft glans.
function plantNoot(a, freq, t) {
  const gain = getMainGain(a);

  const stem = a.createGain();
  stem.connect(gain);
  // Korte ADSR: snel zacht aanzetten, dan langzaam uitsterven binnen de noot.
  stem.gain.setValueAtTime(0.0001, t);
  stem.gain.linearRampToValueAtTime(0.9, t + 0.06);
  stem.gain.exponentialRampToValueAtTime(0.0001, t + NOOT_DUUR * 0.95);

  const osc = a.createOscillator();
  osc.type = "triangle";
  osc.frequency.value = freq;
  osc.connect(stem);
  osc.start(t);
  osc.stop(t + NOOT_DUUR);

  // Zachte octaaf erboven voor een vrolijk, "glinsterend" randje.
  const osc2 = a.createOscillator();
  const stem2 = a.createGain();
  stem2.connect(gain);
  stem2.gain.setValueAtTime(0.0001, t);
  stem2.gain.linearRampToValueAtTime(0.28, t + 0.06);
  stem2.gain.exponentialRampToValueAtTime(0.0001, t + NOOT_DUUR * 0.8);
  osc2.type = "sine";
  osc2.frequency.value = freq * 2;
  osc2.connect(stem2);
  osc2.start(t);
  osc2.stop(t + NOOT_DUUR);
}

// De scheduler: plant steeds een paar noten vooruit en schuift `volgendeTijd`
// op. Loopt eindeloos door (modulo de progressie) tot stopMuziek().
function scheduler() {
  const a = audio();
  while (volgendeTijd < a.currentTime + VOORUIT_NOTEN * NOOT_DUUR) {
    const akkoord = PROGRESSIE[Math.floor(stap / 4) % PROGRESSIE.length];
    const freq = akkoord[stap % 4];
    plantNoot(a, freq, volgendeTijd);
    volgendeTijd += NOOT_DUUR;
    stap = (stap + 1) % (PROGRESSIE.length * 4);
  }
}

// De muziek starten. Idempotent: dubbel starten doet niets (geen dubbele lus).
// Mag alleen na een gebaar worden aangeroepen, anders blijft de context
// suspended (geen crash — er komt dan gewoon geen geluid tot het gebaar).
export function startMuziek() {
  if (speelt) return;
  let a;
  try {
    a = audio();
  } catch {
    return; // geen Web Audio beschikbaar — stil falen
  }
  speelt = true;
  // Vanaf "nu + klein beetje" plannen zodat de eerste noot niet wordt afgekapt.
  volgendeTijd = a.currentTime + 0.08;
  stap = 0;
  scheduler();
  timer = setInterval(scheduler, (VOORUIT_NOTEN * NOOT_DUUR * 1000) / 2);
}

// De muziek stoppen: scheduler uit en de uitgang zacht dichtdraaien zodat
// reeds-ingeplande noten netjes wegvloeien (geen harde knip).
export function stopMuziek() {
  if (!speelt) return;
  speelt = false;
  clearInterval(timer);
  timer = 0;
  if (mainGain) {
    try {
      const a = audio();
      mainGain.gain.cancelScheduledValues(a.currentTime);
      mainGain.gain.setValueAtTime(mainGain.gain.value, a.currentTime);
      mainGain.gain.linearRampToValueAtTime(0.0001, a.currentTime + 0.4);
      // Na het uitvloeien weer op grondvolume zetten voor een volgende start.
      setTimeout(() => {
        if (!speelt && mainGain) mainGain.gain.value = MUZIEK_VOLUME;
      }, 500);
    } catch {
      /* context kapot/suspended — niets te doen */
    }
  }
}

// Muziek aan/uit zetten op basis van een boolean (respecteert de instelling
// die de aanroeper al heeft bijgewerkt + bewaard). Start alleen daadwerkelijk
// als `aan` true is; anders stoppen.
export function zetMuziek(aan) {
  if (aan) startMuziek();
  else stopMuziek();
}

// Op app-load: start de muziek alleen als de instelling aan staat. Bedoeld om
// vanaf het eerste gebaar te worden aangeroepen (main.js).
export function startMuziekIndienAan() {
  if (aanMuziek()) startMuziek();
}

// ===========================================================================
// K-POP DANSMUZIEK (voor het dansfeestje) — een vrolijke, kindvriendelijke beat
// die los staat van de rustige ambient-muziek hierboven. Volledig met de Web
// Audio API (oscillators + ruis), GEEN bestanden/deps.
//
// Opbouw per "stap" (zestiende noten in een four-on-the-floor groove):
//   - kick (sinus-pluk) op elke tel → de "boem boem boem boem"
//   - clap/snare (ruis-burst) op tel 2 en 4
//   - hihat (korte hoge ruis) op de tussenstappen → energie
//   - baslijn (zaagtand) die de akkoorden volgt
//   - pakkend synth-melodietje (vierkant/triangel) erbovenop
//
// Deze laag heeft een EIGEN gain (dansGain) los van de ambient mainGain, zodat
// hij onafhankelijk hard kan spelen en netjes uit kan vloeien. We hergebruiken
// wel dezelfde AudioContext (audio() uit sfx.js).
//
// Respecteert de instellingen: de dansmuziek mag spelen ongeacht de ambient-
// muziekinstelling (het is een feest!), maar NIET als geluid helemaal uit staat.
// ===========================================================================

const DANS_VOLUME = 0.16; // grondvolume van de hele danslaag (vrolijk, niet hard)
const DANS_STAP = 0.14; // seconden per zestiende-stap (~107 BPM in kwartnoten)
const DANS_VOORUIT = 4; // hoeveel stappen we vooruit inplannen per scheduler-tik

// Een pakkende synth-melodie in C-majeur (16 stappen, één maat). null = stilte
// op die stap. Frequenties in Hz (C5–E5–G5-sfeer, vrolijk en simpel).
const DANS_MELODIE = [
  523.25, null, 659.25, null, 783.99, null, 659.25, null,
  587.33, null, 698.46, 587.33, 523.25, null, null, null,
];

// Eenvoudige baslijn (één bas-noot per tel = elke 4 stappen) over een vrolijke
// I–vi–IV–V-achtige beweging (lage octaaf).
const DANS_BAS = [130.81, 110.0, 174.61, 196.0]; // C2, A2, F2, G2

function aanGeluid() {
  return getStaat().instellingen?.geluid !== false;
}

let dansGain = null; // eigen uitgangs-gain voor de danslaag
let dansSpeelt = false; // draait de dansbeat nu?
let dansTimer = 0; // scheduler-interval-id
let dansVolgende = 0; // wanneer de volgende stap moet starten (ctx-tijd)
let dansStap = 0; // hoeveelste zestiende-stap (modulo 16)
let dansMaat = 0; // hoeveelste maat (voor de bas-progressie)

// De danslaag-gain lazily aanmaken (één keer) en op grondvolume zetten.
function getDansGain(a) {
  if (dansGain) return dansGain;
  dansGain = a.createGain();
  dansGain.gain.value = DANS_VOLUME;
  dansGain.connect(a.destination);
  return dansGain;
}

// Eén kick-drum: een sinus die snel in toonhoogte zakt + zacht uitvloeit ("boem").
function plantKick(a, t) {
  const g = a.createGain();
  g.connect(getDansGain(a));
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(1.0, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  const osc = a.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(150, t);
  osc.frequency.exponentialRampToValueAtTime(45, t + 0.16);
  osc.connect(g);
  osc.start(t);
  osc.stop(t + 0.2);
}

// Eén ruis-burst (clap/snare of hihat) via een gefilterde korte ruis.
function plantRuis(a, t, { freq, q, piek, dur }) {
  const bron = a.createBufferSource();
  bron.buffer = getRuisBuffer(a);
  const filter = a.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = freq;
  filter.Q.value = q;
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(piek, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  bron.connect(filter).connect(g).connect(getDansGain(a));
  bron.start(t);
  bron.stop(t + dur + 0.02);
}

// Eén bas-noot (warme zaagtand, kort gehouden).
function plantBas(a, freq, t) {
  const g = a.createGain();
  g.connect(getDansGain(a));
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.5, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + DANS_STAP * 3.6);
  const osc = a.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.value = freq;
  // Zacht laagdoorlaatfilter zodat de bas niet schril klinkt.
  const filter = a.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 600;
  osc.connect(filter).connect(g);
  osc.start(t);
  osc.stop(t + DANS_STAP * 4);
}

// Eén melodie-noot (vrolijk vierkant + zachte triangel-octaaf erboven).
function plantMelodie(a, freq, t) {
  const g = a.createGain();
  g.connect(getDansGain(a));
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.32, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + DANS_STAP * 1.8);
  const osc = a.createOscillator();
  osc.type = "square";
  osc.frequency.value = freq;
  osc.connect(g);
  osc.start(t);
  osc.stop(t + DANS_STAP * 2);

  const g2 = a.createGain();
  g2.connect(getDansGain(a));
  g2.gain.setValueAtTime(0.0001, t);
  g2.gain.linearRampToValueAtTime(0.12, t + 0.02);
  g2.gain.exponentialRampToValueAtTime(0.0001, t + DANS_STAP * 1.4);
  const osc2 = a.createOscillator();
  osc2.type = "triangle";
  osc2.frequency.value = freq * 2;
  osc2.connect(g2);
  osc2.start(t);
  osc2.stop(t + DANS_STAP * 1.6);
}

// Korte ruis-buffer voor clap/hihat (eigen, klein buffertje — los van sfx.js).
let dansRuisBuffer = null;
function getRuisBuffer(a) {
  if (dansRuisBuffer) return dansRuisBuffer;
  const lengte = Math.floor(a.sampleRate * 0.3);
  const buffer = a.createBuffer(1, lengte, a.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < lengte; i++) data[i] = Math.random() * 2 - 1;
  dansRuisBuffer = buffer;
  return buffer;
}

// Eén zestiende-stap inplannen op tijdstip t (alle lagen samen).
function plantDansStap(a, stap, t) {
  // Kick op elke tel (stap 0, 4, 8, 12) → four-on-the-floor.
  if (stap % 4 === 0) plantKick(a, t);
  // Clap/snare op tel 2 en 4 (stap 4 en 12).
  if (stap === 4 || stap === 12) {
    plantRuis(a, t, { freq: 1800, q: 0.6, piek: 0.5, dur: 0.18 });
  }
  // Hihat op de off-beats (oneven stappen) → energie, zacht.
  if (stap % 2 === 1) {
    plantRuis(a, t, { freq: 8000, q: 1.2, piek: 0.12, dur: 0.05 });
  }
  // Bas: één noot per tel (op stap 0, 4, 8, 12), volgt de maat-progressie.
  if (stap % 4 === 0) {
    const basFreq = DANS_BAS[(dansMaat + Math.floor(stap / 4)) % DANS_BAS.length];
    plantBas(a, basFreq, t);
  }
  // Melodie volgens het patroon.
  const m = DANS_MELODIE[stap];
  if (m != null) plantMelodie(a, m, t);
}

// De dans-scheduler: plant steeds een paar stappen vooruit en schuift de tijd op.
function dansScheduler() {
  const a = audio();
  while (dansVolgende < a.currentTime + DANS_VOORUIT * DANS_STAP) {
    plantDansStap(a, dansStap, dansVolgende);
    dansVolgende += DANS_STAP;
    dansStap += 1;
    if (dansStap >= 16) {
      dansStap = 0;
      dansMaat = (dansMaat + 1) % DANS_BAS.length;
    }
  }
}

// De dansmuziek starten (energieke versie voor het feest). Idempotent: dubbel
// starten doet niets. Speelt niet als geluid uit staat (respecteert instelling),
// maar negeert bewust de ambient-muziekinstelling (het feest mag altijd klinken).
// Suspended-safe: bij een suspended context komt er gewoon nog geen geluid tot
// een gebaar — geen crash.
export function startDansMuziek() {
  if (dansSpeelt) return;
  if (!aanGeluid()) return; // geluid uit → geen dansmuziek
  let a;
  try {
    a = audio();
  } catch {
    return; // geen Web Audio beschikbaar — stil falen
  }
  dansSpeelt = true;
  // Gain terug op grondvolume (na een eerdere uitvloei-stop).
  const g = getDansGain(a);
  g.gain.cancelScheduledValues(a.currentTime);
  g.gain.setValueAtTime(DANS_VOLUME, a.currentTime);
  dansVolgende = a.currentTime + 0.08;
  dansStap = 0;
  dansMaat = 0;
  dansScheduler();
  dansTimer = setInterval(dansScheduler, (DANS_VOORUIT * DANS_STAP * 1000) / 2);
}

// De dansmuziek stoppen: scheduler uit en de danslaag zacht dichtdraaien zodat
// reeds-ingeplande stappen netjes wegvloeien (geen harde knip). Idempotent.
export function stopDansMuziek() {
  if (!dansSpeelt) return;
  dansSpeelt = false;
  clearInterval(dansTimer);
  dansTimer = 0;
  if (dansGain) {
    try {
      const a = audio();
      dansGain.gain.cancelScheduledValues(a.currentTime);
      dansGain.gain.setValueAtTime(dansGain.gain.value, a.currentTime);
      dansGain.gain.linearRampToValueAtTime(0.0001, a.currentTime + 0.3);
      // Na het uitvloeien weer op grondvolume voor een volgende start.
      setTimeout(() => {
        if (!dansSpeelt && dansGain) dansGain.gain.value = DANS_VOLUME;
      }, 400);
    } catch {
      /* context kapot/suspended — niets te doen */
    }
  }
}

// Test-/diagnose-helper: draait de dansmuziek nu? (gebruikt door de verificatie
// en eventueel om dubbel-starten elders te voorkomen).
export function dansMuziekSpeelt() {
  return dansSpeelt;
}
