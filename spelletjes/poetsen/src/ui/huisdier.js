// Herbruikbaar huisdier-figuur (Feature G3). Bouwt het GEKOZEN huisdier
// (getGekozenHuisdier()) als element met een rustige zit/stuiter-animatie. Is het
// figuur `aaibaar`, dan laat een tik hartjes 💕 omhoog zweven en speelt het een
// schattig aai-geluidje. De helper geeft een opruim-functie terug die de
// listener én alle lopende hartjes-timers weghaalt (geen leaks). Is er GEEN
// gekozen dier, dan geeft de helper `null` terug (de aanroeper toont dan niets).
//
// iPad: groot tikdoel (de hele figuur), geen page-scroll/zoom (touch-action +
// tap-highlight in CSS). Onder prefers-reduced-motion staat het dier stil maar
// blijft het zichtbaar én aaibaar (geen stuiter, geen zwevende hartjes) — dat
// regelen we via CSS én door hier de hartjes onder reduced-motion over te slaan.

import { maak } from "./dom.js";
import { getGekozenHuisdier, meldQuestGebeurtenis } from "../state.js";
import { huisdierById, huisdierSVG } from "../data/huisdieren.js";
import { aaiGeluid, ontgrendelAudio } from "../audio/sfx.js";

// Hoe lang een hartje zweeft voordat we het uit de DOM halen (matcht de
// CSS-animatie `huisdierHartje`).
const HARTJE_MS = 1100;

// Of de gebruiker bewegingen wil beperken (dan: geen zwevende hartjes).
function rustigeBeweging() {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Maakt het huisdier-figuur. Opties:
//   aaibaar (default true) — of tikken hartjes + geluid geeft.
// Retourneert { el, opruim } als er een gekozen dier is, anders null.
export function maakHuisdierFiguur({ aaibaar = true } = {}) {
  const id = getGekozenHuisdier();
  if (!id) return null;

  const def = huisdierById(id);
  if (!def) return null;

  // Buitenste wrap (positioneert de hartjes-laag) + het stuiterende figuur.
  const wrap = maak("div", "huisdier-figuur");
  wrap.dataset.dier = id;

  const dier = maak("div", "huisdier-dier");
  const svg = huisdierSVG(id);
  if (svg) {
    dier.innerHTML = svg;
  } else {
    dier.classList.add("huisdier-emoji");
    dier.textContent = def.emoji;
  }
  wrap.append(dier);

  // Laag waarin de hartjes zweven (boven het dier, vangt geen tikken).
  const hartjesLaag = maak("div", "huisdier-hartjes");
  hartjesLaag.setAttribute("aria-hidden", "true");
  wrap.append(hartjesLaag);

  // Bijhouden van lopende hartjes-timers zodat we ze bij opruimen kunnen wissen.
  const timers = new Set();
  let aaiHandler = null;

  if (aaibaar) {
    wrap.classList.add("aaibaar");
    wrap.setAttribute("role", "button");
    wrap.setAttribute("tabindex", "0");
    wrap.setAttribute("aria-label", `Aai ${def.naam}`);

    aaiHandler = () => {
      ontgrendelAudio();
      aaiGeluid();
      // Dagelijkse opdrachten (G5): elke aai telt mee.
      meldQuestGebeurtenis("aai");
      // Onder reduced-motion geen zwevende hartjes (rustig), maar wel het geluid.
      if (!rustigeBeweging()) toonHartjes();
      // Kleine knuffel-knik op het dier zelf (CSS class, zelf-opruimend).
      dier.classList.remove("knuffel");
      // reflow forceren zodat de animatie opnieuw start bij snel achter elkaar aaien
      void dier.offsetWidth;
      dier.classList.add("knuffel");
    };

    // Eén pointer-listener dekt muis + touch + pen op de iPad.
    wrap.addEventListener("pointerdown", aaiHandler);
  } else {
    wrap.setAttribute("aria-hidden", "true");
  }

  // Een paar hartjes laten opborrelen op willekeurige horizontale posities.
  function toonHartjes() {
    const aantal = 3 + Math.floor(Math.random() * 2); // 3 of 4
    for (let i = 0; i < aantal; i++) {
      const hartje = maak("span", "huisdier-hartje", "💕");
      // Spreid horizontaal rond het midden + lichte rotatie/vertraging.
      hartje.style.left = `${30 + Math.random() * 40}%`;
      hartje.style.animationDelay = `${Math.random() * 0.18}s`;
      hartjesLaag.append(hartje);
      const timer = setTimeout(() => {
        hartje.remove();
        timers.delete(timer);
      }, HARTJE_MS);
      timers.add(timer);
    }
  }

  // Opruimen: listener weg, alle timers wissen, resterende hartjes verwijderen.
  function opruim() {
    if (aaiHandler) wrap.removeEventListener("pointerdown", aaiHandler);
    for (const t of timers) clearTimeout(t);
    timers.clear();
    hartjesLaag.innerHTML = "";
  }

  return { el: wrap, opruim };
}
