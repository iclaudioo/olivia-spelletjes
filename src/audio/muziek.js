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
