// Herbruikbaar Papa-figuur (Feature H1) voor de parade op het beginscherm. Bouwt
// Papa als tikbaar element: bij een tik verschijnt een klein keuze-bubbeltje met
// twee grote, kindvriendelijke knoppen — Knuffel 🤗 en Kusje 😘.
//   - Knuffel → +5 munten (vliegMunten), een paar zwevende hartjes 💕, een lief
//     knuffel-geluidje en een blije knuffel-knik op Papa.
//   - Kusje  → +10 munten, meer/grotere hartjes 💛, een kus-geluidje (mwah) en
//     Papa straalt (een grotere straal-animatie).
//   - Na een knuffel/kusje "geniet Papa na" (~6s cooldown) waarin de knoppen niet
//     werken; we tonen dan een klein "Papa geniet na!"-tekstje. De cooldown is
//     in-memory (per scherm-instantie).
//
// De eerste knuffel/kusje markeert de staat (papaGeknuffeld) + kent de
// "papas-lieveling"-sticker toe via vierVerdiendeStickers().
//
// Hergebruikt het tikbaar-figuur-met-hartjes-patroon uit ui/huisdier.js: een
// hartjes-laag boven het figuur + een Set van timers die in opruim() worden
// gewist. De helper geeft { el, opruim } terug; opruim() haalt de listeners weg,
// wist ALLE timers (hartjes + cooldown) en verwijdert resterende hartjes/het
// bubbeltje — geen leaks bij weg-navigeren.
//
// iPad: grote tikdoelen, geen page-scroll/zoom (touch-action + tap-highlight in
// CSS). Onder prefers-reduced-motion: geen zwevende hartjes en geen blije-/straal-
// animatie (rustig), maar de interactie + munten + geluid + sticker werken gewoon.

import { maak } from "./dom.js";
import { markeerPapaGeknuffeld, voegMuntenToe } from "../state.js";
import { papaSVG } from "../art/papa.js";
import { knuffelGeluid, kusGeluid, ontgrendelAudio } from "../audio/sfx.js";
import { vliegMunten } from "./muntvlieg.js";
import { vierVerdiendeStickers } from "./toast.js";

// Hoe lang een hartje zweeft (matcht de CSS-animatie `papaHartje`).
const HARTJE_MS = 1200;
// Hoe lang Papa "na geniet" na een knuffel/kusje (cooldown, ms).
const COOLDOWN_MS = 6000;
// Munten per interactie.
const KNUFFEL_MUNTEN = 5;
const KUS_MUNTEN = 10;

// Of de gebruiker bewegingen wil beperken (dan: geen zwevende hartjes/animatie).
function rustigeBeweging() {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Maakt het tikbare Papa-figuur. Opties:
//   opMunten(nieuwTotaal) — optionele callback die het nieuwe munten-totaal krijgt
//     na een knuffel/kusje, zodat de aanroeper de topbar-teller kan bijwerken.
// Retourneert { el, opruim }.
export function maakPapaFiguur({ opMunten } = {}) {
  // Buitenste wrap (positioneert de hartjes-laag + het bubbeltje) + het figuur.
  const wrap = maak("div", "papa-figuur");

  const papa = maak("div", "papa-man");
  papa.innerHTML = papaSVG;
  wrap.append(papa);

  // Laag waarin de hartjes zweven (boven Papa, vangt geen tikken).
  const hartjesLaag = maak("div", "papa-hartjes");
  hartjesLaag.setAttribute("aria-hidden", "true");
  wrap.append(hartjesLaag);

  // Het keuze-bubbeltje (Knuffel / Kusje), aanvankelijk verborgen. We bouwen het
  // één keer en tonen/verbergen het via een class.
  const bubbel = maak("div", "papa-bubbel");
  bubbel.setAttribute("role", "group");
  bubbel.setAttribute("aria-label", "Wat wil je Papa geven?");
  const knuffelKnop = maak("button", "papa-keuze-knop knuffel", "🤗 Knuffel");
  knuffelKnop.type = "button";
  const kusKnop = maak("button", "papa-keuze-knop kus", "😘 Kusje");
  kusKnop.type = "button";
  // Klein "geniet na"-tekstje (tijdens de cooldown getoond i.p.v. de knoppen).
  const genietTekst = maak("div", "papa-geniet", "Papa geniet na! 💤");
  bubbel.append(knuffelKnop, kusKnop, genietTekst);
  wrap.append(bubbel);

  // ---- Toestand (in-memory, per figuur-instantie) ----
  const timers = new Set(); // alle hartjes-timers (voor opruim)
  let cooldownTimer = 0; // de actieve cooldown-timer (of 0)
  let bubbelOpen = false;
  let inCooldown = false;

  // ---- Papa tikbaar maken (toggle het keuze-bubbeltje) ----
  wrap.classList.add("tikbaar");
  papa.setAttribute("role", "button");
  papa.setAttribute("tabindex", "0");
  papa.setAttribute("aria-label", "Tik op Papa");

  function toonBubbel() {
    bubbelOpen = true;
    wrap.classList.add("bubbel-open");
    // Tijdens de cooldown tonen we het "geniet na"-tekstje i.p.v. de knoppen.
    wrap.classList.toggle("cooldown", inCooldown);
  }
  function verbergBubbel() {
    bubbelOpen = false;
    wrap.classList.remove("bubbel-open");
  }

  const papaHandler = () => {
    ontgrendelAudio();
    if (bubbelOpen) verbergBubbel();
    else toonBubbel();
  };
  papa.addEventListener("pointerdown", papaHandler);

  // ---- Een knuffel of kusje verwerken ----
  // soort: "knuffel" | "kus". Tijdens de cooldown doen de knoppen niets.
  function geef(soort) {
    if (inCooldown) return;
    ontgrendelAudio();

    const isKus = soort === "kus";
    const munten = isKus ? KUS_MUNTEN : KNUFFEL_MUNTEN;

    // Munten in de staat bijtellen (+ bewaren) en naar de teller laten vliegen
    // vanaf Papa. vliegMunten laat de teller poppen; de aanroeper werkt de
    // getoonde waarde bij via opMunten (zo blijft de teller in sync).
    const nieuwTotaal = voegMuntenToe(munten);
    if (typeof opMunten === "function") opMunten(nieuwTotaal);
    vliegMunten({ van: papa, aantal: Math.max(1, Math.round(munten / 5)) });

    // Geluid: warm voor de knuffel, mwah voor de kus.
    if (isKus) kusGeluid();
    else knuffelGeluid();

    // Hartjes (onder reduced-motion overgeslagen — rustig).
    if (!rustigeBeweging()) toonHartjes(isKus);

    // Blije Papa-animatie: knuffel = knik, kusje = stralen (groter).
    papa.classList.remove("knuffel-blij", "kus-straal");
    void papa.offsetWidth; // reflow zodat de animatie opnieuw start
    papa.classList.add(isKus ? "kus-straal" : "knuffel-blij");

    // Eerste keer: staat markeren + sticker toekennen (idempotent).
    markeerPapaGeknuffeld();
    vierVerdiendeStickers();
    // (Bewust GEEN quest-gebeurtenis: een knuffel/kusje aan Papa hoort niet mee te
    // tellen voor de huisdier-aai-opdracht — dat is voor het huisdier.)

    // Cooldown starten: knoppen werken even niet, toon "Papa geniet na!".
    startCooldown();
  }

  knuffelKnop.addEventListener("click", () => geef("knuffel"));
  kusKnop.addEventListener("click", () => geef("kus"));

  // ---- Cooldown ----
  function startCooldown() {
    inCooldown = true;
    wrap.classList.add("cooldown"); // toont het "geniet na"-tekstje
    if (cooldownTimer) clearTimeout(cooldownTimer);
    cooldownTimer = setTimeout(() => {
      inCooldown = false;
      cooldownTimer = 0;
      wrap.classList.remove("cooldown");
    }, COOLDOWN_MS);
  }

  // ---- Hartjes laten opborrelen (meer/groter bij een kusje) ----
  function toonHartjes(isKus) {
    const teken = isKus ? "💛" : "💕";
    const aantal = isKus ? 6 + Math.floor(Math.random() * 2) : 3 + Math.floor(Math.random() * 2);
    for (let i = 0; i < aantal; i++) {
      const hartje = maak("span", "papa-hartje", teken);
      if (isKus) hartje.classList.add("groot");
      hartje.style.left = `${28 + Math.random() * 44}%`;
      hartje.style.animationDelay = `${Math.random() * 0.2}s`;
      hartjesLaag.append(hartje);
      const timer = setTimeout(() => {
        hartje.remove();
        timers.delete(timer);
      }, HARTJE_MS);
      timers.add(timer);
    }
  }

  // ---- Opruimen: listeners weg, ALLE timers wissen, hartjes/bubbel weg ----
  function opruim() {
    papa.removeEventListener("pointerdown", papaHandler);
    knuffelKnop.replaceWith(knuffelKnop.cloneNode(true)); // listeners droppen
    kusKnop.replaceWith(kusKnop.cloneNode(true));
    for (const t of timers) clearTimeout(t);
    timers.clear();
    if (cooldownTimer) {
      clearTimeout(cooldownTimer);
      cooldownTimer = 0;
    }
    hartjesLaag.innerHTML = "";
  }

  return { el: wrap, opruim };
}
