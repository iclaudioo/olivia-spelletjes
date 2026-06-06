// Dans-minigame v2 "Volg de moves!" — een echt, kindvriendelijk ritmespel.
//
// Verloop:
//   1) KEUZE-scherm: kies een lied (kaart met emoji/naam + beste score & sterren
//      voor dat lied) en een niveau (makkelijk / gewoon / moeilijk).
//   2) RONDE: tik- én hold-noten vallen op de beat van het gekozen lied naar een
//      doelzone net boven vier grote baan-knoppen. Olivia (in haar gekozen look)
//      + Mama dansen aan de zijkant; een klein juichend publiek deint mee.
//        - TIK-noot: tik de baan-knop terwijl de noot in de zone is → RAAK.
//        - HOLD-noot: houd de baan-knop ingedrukt zolang de staart door de zone
//          loopt; op tijd loslaten = geslaagd (bonus). Te vroeg loslaten = combo
//          reset (geen verdere straf). Vergevingsgezind.
//   3) RESULTAAT-overlay: score, beste combo, 1–3 sterren, verdiende munten en de
//      beste score voor dit lied+niveau, met "Nog een keer" / "Terug".
//
// Eén requestAnimationFrame-gestuurde spel-klok stuurt zowel het spawnen als het
// vallen aan (lockstep). Chart per (lied, niveau) is DETERMINISTISCH (seeded uit
// bpm + niveau), zodat hetzelfde lied steeds dezelfde reeks geeft.
//
// GEEN LEAKS (cruciaal): toon() geeft een opruim-functie terug die de router bij
// weg-navigeren aanroept. Die stopt de RAF-lus, cleart álle timers, stopt de
// dansmuziek, verwijdert noot-DOM/overlay en haalt alle pointer-listeners weg
// (ook de per-baan pointerdown/up/cancel voor de hold-noten). Datzelfde opruimen
// gebeurt ook bij "Terug" en "Nog een keer".

import { maak } from "../ui/dom.js";
import { maakTopbar } from "../ui/topbar.js";
import { terug, vervang } from "../router.js";
import {
  getStaat,
  voegMuntenToe,
  getOliviaLook,
  getDansScore,
  markeerDansScore,
  markeerDriesterDans,
  meldQuestGebeurtenis,
} from "../state.js";
import { startDansMuziek, stopDansMuziek } from "../audio/muziek.js";
import { sparkleGeluid } from "../audio/sfx.js";
import { vierVerdiendeStickers } from "../ui/toast.js";
import { vuurConfetti } from "../ui/confetti.js";
import { vliegMunten } from "../ui/muntvlieg.js";
import { mamaSVG } from "../art/mama.js";
import { oliviaSVG } from "../art/olivia.js";
import { LIEDJES, liedById, STANDAARD_LIED } from "../data/liedjes.js";

// De vier banen (links/onder/boven/rechts), in deze volgorde van links→rechts.
const BANEN = [
  { id: "links", pijl: "⬅️" },
  { id: "onder", pijl: "⬇️" },
  { id: "boven", pijl: "⬆️" },
  { id: "rechts", pijl: "➡️" },
];

// ---- Niveaus ----
// Elk niveau stuurt valsnelheid (VALTIJD: trager = makkelijker), het aantal noten,
// het aandeel hold-noten, de breedte van de raakbare doelzone en de sterren-
// drempels (op basis van de geslaagd-ratio). Makkelijk = trager, minder noten,
// brede zone, lage drempels; moeilijk = sneller, meer noten/holds, smallere zone.
const NIVEAUS = {
  makkelijk: {
    naam: "Makkelijk",
    emoji: "🐢",
    valtijd: 2600, // ms dat een noot erover doet om te vallen (trager = makkelijker)
    aantal: 28, // aantal noten in de ronde
    holdKans: 0.12, // aandeel hold-noten
    zoneMin: 0.6, // brede, vergevingsgezinde band
    zoneMax: 0.95,
    sterDrempels: [0.4, 0.65, 0.85], // ratio voor 1 / 2 / 3 sterren
  },
  gewoon: {
    naam: "Gewoon",
    emoji: "✨",
    valtijd: 2100,
    aantal: 36,
    holdKans: 0.22,
    zoneMin: 0.64,
    zoneMax: 0.93,
    sterDrempels: [0.45, 0.7, 0.88],
  },
  moeilijk: {
    naam: "Moeilijk",
    emoji: "🔥",
    valtijd: 1650,
    aantal: 44,
    holdKans: 0.34,
    zoneMin: 0.68,
    zoneMax: 0.9,
    sterDrempels: [0.5, 0.75, 0.9],
  },
};
const NIVEAU_VOLGORDE = ["makkelijk", "gewoon", "moeilijk"];

const MUNTEN_PER_RAAK = 1; // +1 munt per geslaagde tik/hold

// Of de gebruiker "minder beweging" wil. We zetten dan de decoratieve sparkles/
// zwevers uit; de CSS regelt de stilstaande dansers/publiek. De gameplay (door JS
// gestuurde vallende noten) blijft volledig speelbaar.
function minderBeweging() {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// ---- Kleine, deterministische pseudo-random (mulberry32) ----
// Zo geeft hetzelfde (lied, niveau) altijd dezelfde chart (reproduceerbaar).
function maakRng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Een seed-getal uit een tekst (lied-id + niveau) — simpele string-hash.
function seedUit(tekst) {
  let h = 2166136261;
  for (let i = 0; i < tekst.length; i++) {
    h ^= tekst.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// ---- Chart-generatie (deterministisch uit lied + niveau) ----
// Geeft een array noten: { tijd, baan, soort: "tik"|"hold", duur } waarbij `tijd`
// het beat-tijdstip (ms) is waarop de noot de doelzone hoort te raken, en `duur`
// (alleen bij hold) hoe lang de staart is (ms). De noten staan op de beat (bpm).
function bouwChart(lied, niveauKey) {
  const niveau = NIVEAUS[niveauKey];
  const rng = maakRng(seedUit(`${lied.id}:${niveauKey}`));
  const beatMs = 60000 / lied.bpm; // ms per beat
  const noten = [];
  let vorigeBaan = -1;
  let t = beatMs * 2; // korte aanloop (twee tellen)
  for (let i = 0; i < niveau.aantal; i++) {
    // Kies een baan die niet exact dezelfde is als de vorige (afwisseling).
    let baan = Math.floor(rng() * BANEN.length);
    if (baan === vorigeBaan) baan = (baan + 1) % BANEN.length;
    vorigeBaan = baan;

    const isHold = rng() < niveau.holdKans;
    if (isHold) {
      // Hold-noot: staart van 2–3 tellen lang.
      const tellen = rng() < 0.5 ? 2 : 3;
      noten.push({ tijd: t, baan, soort: "hold", duur: tellen * beatMs });
      // Na een hold een hele tel rust extra zodat het ademt.
      t += (tellen + 1) * beatMs;
    } else {
      noten.push({ tijd: t, baan, soort: "tik", duur: 0 });
      // Tik-afstand: meestal 1 tel, soms een halve (op moeilijk vaker).
      const half = rng() < (niveauKey === "moeilijk" ? 0.45 : 0.2);
      t += (half ? 0.5 : 1) * beatMs;
    }
  }
  return noten;
}

export function toon(app, params = {}) {
  app.innerHTML = "";
  const rustig = minderBeweging();

  // De actieve fase-opruimer. toon() geeft een opruimer terug die hiernaartoe
  // delegeert; bij faseovergang ruimen we de vorige fase eerst netjes op.
  let faseOpruim = null;
  function wisselFase(opruimNieuw) {
    if (faseOpruim) {
      faseOpruim();
      faseOpruim = null;
    }
    faseOpruim = opruimNieuw || null;
  }

  // Vooraf gekozen lied/niveau (bv. bij "Nog een keer") → meteen naar de ronde.
  if (params && params.liedId && params.niveau && liedById(params.liedId) && NIVEAUS[params.niveau]) {
    startKeuze(params.liedId, params.niveau);
  } else {
    toonKeuze();
  }

  // =========================================================================
  // FASE 1 — Liedkeuze + niveau
  // =========================================================================
  function toonKeuze() {
    app.innerHTML = "";

    const { el: top } = maakTopbar({
      titel: "💃 Dansen",
      opTerug: () => terug(),
      toonMunten: true,
    });

    const scherm = maak("div", "dans-keuze-scherm");

    const uitleg = maak("div", "dans-keuze-uitleg", "Kies een lied en hoe moeilijk je wilt dansen!");

    // ---- Niveau-keuze (knoppen; één is actief) ----
    let gekozenNiveau = "gewoon";
    const niveauRij = maak("div", "dans-niveau-rij");
    niveauRij.setAttribute("role", "group");
    niveauRij.setAttribute("aria-label", "Niveau");
    const niveauKnoppen = {};
    for (const key of NIVEAU_VOLGORDE) {
      const n = NIVEAUS[key];
      const knop = maak("button", "dans-niveau-knop", `${n.emoji} ${n.naam}`);
      knop.type = "button";
      knop.setAttribute("aria-pressed", key === gekozenNiveau ? "true" : "false");
      if (key === gekozenNiveau) knop.classList.add("actief");
      knop.addEventListener("click", () => {
        gekozenNiveau = key;
        for (const k of NIVEAU_VOLGORDE) {
          const knop2 = niveauKnoppen[k];
          const aan = k === key;
          knop2.classList.toggle("actief", aan);
          knop2.setAttribute("aria-pressed", aan ? "true" : "false");
        }
        tekenLiedScores();
      });
      niveauKnoppen[key] = knop;
      niveauRij.append(knop);
    }

    // ---- Lied-kaarten ----
    const rooster = maak("div", "dans-lied-rooster");
    const scoreEls = {}; // liedId → score-element (om bij niveauwissel te updaten)
    for (const lied of LIEDJES) {
      const kaart = maak("button", "dans-lied-kaart");
      kaart.type = "button";
      kaart.style.setProperty("--lied-kleur", lied.kleur);
      const emoji = maak("div", "dans-lied-emoji", lied.emoji);
      const naam = maak("div", "dans-lied-naam", lied.naam);
      const bpm = maak("div", "dans-lied-bpm", `${lied.bpm} bpm`);
      const score = maak("div", "dans-lied-score", "");
      scoreEls[lied.id] = score;
      kaart.append(emoji, naam, bpm, score);
      kaart.addEventListener("click", () => startKeuze(lied.id, gekozenNiveau));
      rooster.append(kaart);
    }

    function tekenLiedScores() {
      for (const lied of LIEDJES) {
        // We tonen exact het OPGESLAGEN resultaat: dezelfde score én sterren die
        // de ronde berekende en bewaarde — zo komt de kaart altijd overeen met wat
        // het kind in de ronde zag. Sterren zijn 0–3; ongespeeld = 0 (leeg).
        const { score, sterren } = getDansScore(lied.id, gekozenNiveau);
        const veiligeSterren = Math.max(0, Math.min(3, sterren));
        const el = scoreEls[lied.id];
        if (!el) continue;
        if (score > 0) {
          el.textContent = `Beste: ${score}  ${"⭐".repeat(veiligeSterren)}${"☆".repeat(3 - veiligeSterren)}`;
        } else {
          el.textContent = "Nog niet gespeeld";
        }
      }
    }
    tekenLiedScores();

    scherm.append(uitleg, niveauRij, rooster);
    app.append(top, scherm);

    // Het keuze-scherm heeft geen timers/rAF/audio; opruimen = niets bijzonders
    // (de router wist #app sowieso). We registreren toch een no-op fase zodat de
    // teardown-keten consistent is.
    wisselFase(() => {});
  }

  // =========================================================================
  // FASE 2 — De ronde (gameplay)
  // =========================================================================
  function startKeuze(liedId, niveauKey) {
    const lied = liedById(liedId) || liedById(STANDAARD_LIED);
    const niveauKeyVeilig = NIVEAUS[niveauKey] ? niveauKey : "gewoon";
    speelRonde(lied, niveauKeyVeilig);
  }

  function speelRonde(lied, niveauKey) {
    app.innerHTML = "";
    const staat = getStaat();
    const niveau = NIVEAUS[niveauKey];
    const VALTIJD_MS = niveau.valtijd;
    const ZONE_MIN = niveau.zoneMin;
    const ZONE_MAX = niveau.zoneMax;
    const ZONE_MIDDEN = (ZONE_MIN + ZONE_MAX) / 2;

    // ---- Topbalk ----
    const { el: top, updateMunten } = maakTopbar({
      titel: `${lied.emoji} ${lied.naam}`,
      opTerug: () => terug(),
      toonMunten: true,
    });
    updateMunten(staat.munten);

    // ---- Scherm-opbouw ----
    const scherm = maak("div", "dansen-scherm");
    scherm.style.setProperty("--lied-kleur", lied.kleur);

    // Zachte lichten (geen strobe) achter alles.
    const lichten = maak("div", "dansen-lichten");
    lichten.setAttribute("aria-hidden", "true");
    for (const klas of ["a", "b", "c"]) lichten.append(maak("div", `dansen-licht ${klas}`));

    // Dansers (Mama links, Olivia rechts in haar gekozen look).
    const dansers = maak("div", "dansen-dansers");
    dansers.setAttribute("aria-hidden", "true");
    const mama = maak("div", "dansen-danser mama");
    mama.innerHTML = mamaSVG;
    const olivia = maak("div", "dansen-danser olivia");
    olivia.innerHTML = oliviaSVG(getOliviaLook());
    dansers.append(mama, olivia);

    // Klein juichend publiek onderaan (rijtje hoofdjes die meedeinen).
    const publiek = maak("div", "dansen-publiek");
    publiek.setAttribute("aria-hidden", "true");
    const koppen = ["🧒", "👧", "🧑", "👦", "👩", "🧒", "👧", "🧑"];
    koppen.forEach((k, i) => {
      const hoofd = maak("span", `dansen-hoofd h${i % 8}`, k);
      publiek.append(hoofd);
    });

    // Live score + combo + multiplier + beste.
    const scorebalk = maak("div", "dansen-scorebalk");
    const scoreEl = maak("div", "dansen-score", "Score: 0");
    const comboEl = maak("div", "dansen-combo", "");
    const besteEl = maak(
      "div",
      "dansen-beste",
      `Beste: ${getDansScore(lied.id, niveauKey).score}`
    );
    scorebalk.append(scoreEl, comboEl, besteEl);

    // Speelveld: vallaag + doelzone + vier baan-knoppen.
    const veld = maak("div", "dansen-veld");
    const vallaag = maak("div", "dansen-vallaag");
    const doelzone = maak("div", "dansen-doelzone");
    doelzone.setAttribute("aria-hidden", "true");
    doelzone.style.top = `${ZONE_MIN * 100}%`;
    doelzone.style.height = `${(ZONE_MAX - ZONE_MIN) * 100}%`;
    vallaag.append(doelzone);

    const knoppenrij = maak("div", "dansen-knoppen");
    const knopPerBaan = {};
    for (let i = 0; i < BANEN.length; i++) {
      const baan = BANEN[i];
      const knop = maak("button", `dansen-knop baan-${baan.id}`, baan.pijl);
      knop.type = "button";
      knop.setAttribute("aria-label", `Baan ${baan.id}`);
      knop.dataset.baan = String(i);
      knoppenrij.append(knop);
      knopPerBaan[i] = knop;
    }

    veld.append(vallaag, knoppenrij);
    scherm.append(lichten, dansers, publiek, scorebalk, veld);
    app.append(top, scherm);

    // =======================================================================
    // Speel-logica
    // =======================================================================

    // Deterministische chart voor dit lied+niveau.
    const chart = bouwChart(lied, niveauKey);
    const totaalNoten = chart.length;

    // Levende noten op het veld. Elke heeft: { def, el, staartEl?, baan, soort,
    // raakKlok (klok-tijd dat de kop de zone-midden raakt), staartEindKlok (hold),
    // status }. status: "vallend" | "vastgehouden" (hold actief) | "klaar".
    const noten = [];
    let volgendeIndex = 0; // hoeveelste chart-noot nog gespawnd moet worden

    let score = 0;
    let combo = 0;
    let besteCombo = 0;
    let geslaagd = 0; // aantal geslaagde noten (tik + hold) — voor sterren
    let afgelopen = false;
    let opgeruimd = false;

    // Spel-klok (ms) — loopt op via RAF-delta's (lockstep spawnen + vallen).
    let klok = 0;
    let vorigeTs = 0;
    let rafId = 0;
    const sparkleTimers = new Set();

    // Welke baan wordt nu ingedrukt gehouden (voor hold-noten). pointerId per baan
    // zodat we per-pointer netjes loslaten herkennen (multi-touch op de iPad).
    const ingedrukt = {}; // baan-index → pointerId (of undefined)

    // Multiplier op basis van combo: x1 (start) → x2 (combo ≥ 5) → x3 (combo ≥ 10).
    function multiplierNu() {
      if (combo >= 10) return 3;
      if (combo >= 5) return 2;
      return 1;
    }

    // Basispunten per geslaagde noot + hold-bonus.
    const TIK_PUNT = 10;
    const HOLD_PUNT = 10; // basispunt voor het pakken van de hold-kop
    const HOLD_BONUS = 15; // extra bij een net-op-tijd losgelaten hold

    // ---- Eén noot spawnen (DOM aanmaken) ----
    function spawnNoot(def) {
      const baanInfo = BANEN[def.baan];
      const el = maak("div", `dansen-noot baan-${baanInfo.id} ${def.soort}`);
      const kop = maak("div", "dansen-noot-kop", baanInfo.pijl);
      el.append(kop);
      el.style.left = `${(def.baan + 0.5) * (100 / BANEN.length)}%`;
      let staartHoogtePct = 0;
      if (def.soort === "hold") {
        // De staart is een balk boven de kop; lengte = duur/valtijd als fractie
        // van de vallaag-hoogte.
        staartHoogtePct = (def.duur / VALTIJD_MS) * 100;
        const staart = maak("div", "dansen-noot-staart");
        staart.style.height = `${staartHoogtePct}%`;
        el.prepend(staart);
      }
      vallaag.append(el);
      // raakKlok = tijdstip (klok-ms) waarop de KOP het zone-midden bereikt. De
      // noot start te spawnen op (raakKlok - VALTIJD_MS * ZONE_MIDDEN) zodat hij
      // op `tijd` precies in het midden van de zone valt.
      noten.push({
        def,
        el,
        baan: def.baan,
        soort: def.soort,
        raakKlok: def.tijd,
        eindKlok: def.tijd + def.duur, // wanneer het EINDE van de hold de zone-midden raakt
        status: "vallend",
        staartHoogtePct,
      });
    }

    // Voortgang (0..1+) van een gegeven raak-tijd: 0 = net gespawnd (boven), 1 =
    // in het zone-midden, >1 = voorbij. We mappen raakKlok → ZONE_MIDDEN.
    function voortgangVan(raakKlok) {
      // Op klok==raakKlok moet voortgang == ZONE_MIDDEN. Lineair: per VALTIJD_MS
      // verstrijkt voortgang 1.0. Dus voortgang = ZONE_MIDDEN + (klok-raak)/VALTIJD.
      return ZONE_MIDDEN + (klok - raakKlok) / VALTIJD_MS;
    }

    // ---- Eén frame verwerken (spawnen, vallen, missers, einde) ----
    function verwerkFrame() {
      // Spawnen: een noot verschijnt zodra zijn raak-tijd binnen één VALTIJD komt
      // (zodat hij van boven naar de zone valt). spawn-klok = raakKlok - VALTIJD*ZONE_MIDDEN.
      while (volgendeIndex < chart.length) {
        const def = chart[volgendeIndex];
        const spawnKlok = def.tijd - VALTIJD_MS * ZONE_MIDDEN;
        if (klok >= spawnKlok) {
          spawnNoot(def);
          volgendeIndex += 1;
        } else break;
      }

      for (let i = noten.length - 1; i >= 0; i--) {
        const n = noten[i];

        if (n.status === "vastgehouden") {
          // Hold is bezig: de kop is al gepakt; de noot zakt verder tot het EINDE
          // van de staart de zone-midden voorbij is → dan is de hold volbracht.
          const eindVoortgang = voortgangVan(n.eindKlok);
          // De DOM-kop volgt het einde van de staart visueel mee.
          plaatsNoot(n, voortgangVan(n.raakKlok));
          if (eindVoortgang >= ZONE_MIDDEN) {
            // Staart-einde heeft de zone-midden bereikt terwijl nog vastgehouden →
            // geslaagde hold (de speler hield 'm tot het einde vast). Bonus.
            voltooiHold(n, i, true);
          }
          continue;
        }

        // Vallende noot (tik of nog-niet-gepakte hold-kop).
        const voortgang = voortgangVan(n.raakKlok);
        plaatsNoot(n, voortgang);
        const inZone = voortgang >= ZONE_MIN && voortgang <= ZONE_MAX;
        n.el.classList.toggle("in-zone", inZone);

        if (voortgang > ZONE_MAX + 0.12) {
          // Voorbij de zone zonder (begonnen) tik/hold → MIS (combo reset).
          n.el.remove();
          noten.splice(i, 1);
          combo = 0;
          tekenScore();
        }
      }

      if (volgendeIndex >= chart.length && noten.length === 0) {
        eindigRonde();
        return true;
      }
      return false;
    }

    // De DOM-positie van een noot zetten op basis van de KOP-voortgang. De kop
    // staat op `voortgang` (0..1 van de vallaag-hoogte); de staart hangt erboven.
    function plaatsNoot(n, kopVoortgang) {
      const top = Math.min(kopVoortgang, 1.1) * 100;
      n.el.style.top = `${top}%`;
    }

    // ---- De animatie-lus ----
    function frame(ts) {
      if (opgeruimd || afgelopen) return;
      if (vorigeTs) klok += Math.min(ts - vorigeTs, 100);
      vorigeTs = ts;
      if (verwerkFrame()) return;
      rafId = requestAnimationFrame(frame);
    }

    // ---- Een baan ingedrukt (pointerdown): tik-noot raken of hold-kop pakken ----
    function drukBaan(baan) {
      if (opgeruimd || afgelopen) return;
      // Zoek de raakbare noot in deze baan die het dichtst bij het zone-midden zit.
      let beste = -1;
      let besteAfstand = Infinity;
      for (let i = 0; i < noten.length; i++) {
        const n = noten[i];
        if (n.baan !== baan) continue;
        if (n.status !== "vallend") continue;
        const voortgang = voortgangVan(n.raakKlok);
        if (voortgang < ZONE_MIN || voortgang > ZONE_MAX) continue;
        const afstand = Math.abs(voortgang - ZONE_MIDDEN);
        if (afstand < besteAfstand) {
          besteAfstand = afstand;
          beste = i;
        }
      }
      if (beste === -1) return; // niets in de zone → genegeerd (geen straf)

      const n = noten[beste];
      if (n.soort === "tik") {
        // RAAK (tik-noot).
        n.el.remove();
        noten.splice(beste, 1);
        scoorRaak(TIK_PUNT, baan);
      } else {
        // Hold-kop gepakt → de noot wordt nu vastgehouden tot loslaten/einde.
        n.status = "vastgehouden";
        n.el.classList.add("vastgehouden");
        scoorRaak(HOLD_PUNT, baan, true);
      }
    }

    // ---- Een baan losgelaten (pointerup/cancel): hold afsluiten ----
    function laatLosBaan(baan) {
      if (opgeruimd || afgelopen) return;
      // Is er een hold actief in deze baan? Zo ja: kijk of het einde van de staart
      // al (bijna) in de zone is → geslaagd; anders te vroeg losgelaten (combo
      // reset, géén verdere straf).
      for (let i = noten.length - 1; i >= 0; i--) {
        const n = noten[i];
        if (n.baan !== baan || n.status !== "vastgehouden") continue;
        const eindVoortgang = voortgangVan(n.eindKlok);
        // Vergevingsgezind: als het staart-einde al bijna bij de zone is, telt het
        // als geslaagd losgelaten (bonus). Anders: te vroeg → combo reset.
        if (eindVoortgang >= ZONE_MIN) {
          voltooiHold(n, i, true);
        } else {
          // Te vroeg losgelaten → combo reset, geen straf. Noot verdwijnt.
          n.el.remove();
          noten.splice(i, 1);
          combo = 0;
          tekenScore();
        }
        return; // hooguit één hold per baan
      }
    }

    // Een hold volbrengen: noot weg, punten + (optioneel) bonus, combo door.
    function voltooiHold(n, index, metBonus) {
      n.el.remove();
      const idx = noten.indexOf(n);
      const echteIndex = idx >= 0 ? idx : index;
      if (echteIndex >= 0) noten.splice(echteIndex, 1);
      if (metBonus) {
        // Bonus voor het netjes vasthouden tot het einde.
        score += HOLD_BONUS * multiplierNu();
        tekenScore();
        toonZwever(n.baan);
      }
    }

    // Een raak verwerken (tik of hold-kop): punten * multiplier, combo +1, fx.
    function scoorRaak(basisPunt, baan, isHoldKop) {
      combo += 1;
      if (combo > besteCombo) besteCombo = combo;
      score += basisPunt * multiplierNu();
      geslaagd += 1;
      tekenScore();
      sparkleGeluid();
      toonZwever(baan);
      void isHoldKop;
    }

    // ---- Score/combo/multiplier-tekst bijwerken ----
    function tekenScore() {
      scoreEl.textContent = `Score: ${score}`;
      const m = multiplierNu();
      if (combo >= 2) {
        comboEl.textContent = `Combo x${combo}${m > 1 ? ` · ${m}× punten` : ""} 🔥`;
      } else {
        comboEl.textContent = "";
      }
    }

    // ---- Klein zwevend sparkle/hartje bij goede combo's (decoratief) ----
    function toonZwever(baan) {
      if (rustig) return;
      const knop = knopPerBaan[baan];
      if (!knop) return;
      const m = multiplierNu();
      const teken = m >= 3 ? "🌟" : m >= 2 ? "💖" : Math.random() < 0.5 ? "✨" : "🎵";
      const vonk = maak("span", "dansen-vonk", teken);
      knop.append(vonk);
      const t = setTimeout(() => {
        vonk.remove();
        sparkleTimers.delete(t);
      }, 750);
      sparkleTimers.add(t);
    }

    // =======================================================================
    // Pointer-afhandeling per baan-knop (pointerdown = drukken, up/cancel = los).
    // We bewaren de handlers zodat we ze gegarandeerd kunnen verwijderen.
    // =======================================================================
    const handlers = []; // { knop, type, fn } voor opruimen
    function bindBaan(knop, baan) {
      const onDown = (e) => {
        e.preventDefault();
        ingedrukt[baan] = e.pointerId;
        // Vang verdere events van deze pointer op de knop op (ook buiten beweeg).
        try {
          knop.setPointerCapture(e.pointerId);
        } catch {
          /* niet alle omgevingen ondersteunen capture — geen probleem */
        }
        knop.classList.remove("druk");
        void knop.offsetWidth;
        knop.classList.add("druk");
        drukBaan(baan);
      };
      const onUp = (e) => {
        e.preventDefault();
        if (ingedrukt[baan] === e.pointerId) ingedrukt[baan] = undefined;
        knop.classList.remove("druk");
        laatLosBaan(baan);
      };
      const onCancel = (e) => {
        if (ingedrukt[baan] === e.pointerId) ingedrukt[baan] = undefined;
        knop.classList.remove("druk");
        laatLosBaan(baan);
      };
      knop.addEventListener("pointerdown", onDown);
      knop.addEventListener("pointerup", onUp);
      knop.addEventListener("pointercancel", onCancel);
      handlers.push(
        { knop, type: "pointerdown", fn: onDown },
        { knop, type: "pointerup", fn: onUp },
        { knop, type: "pointercancel", fn: onCancel }
      );
    }
    for (const [i, knop] of Object.entries(knopPerBaan)) bindBaan(knop, Number(i));

    // =======================================================================
    // Ronde starten / eindigen / opruimen
    // =======================================================================
    function stopAlles() {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      for (const t of sparkleTimers) clearTimeout(t);
      sparkleTimers.clear();
      stopDansMuziek();
      for (const n of noten) n.el.remove();
      noten.length = 0;
    }

    // Sterren-rating op basis van de geslaagd-ratio en de niveau-drempels.
    function sterrenVoor(geslaagdAantal) {
      const ratio = totaalNoten > 0 ? geslaagdAantal / totaalNoten : 0;
      const [d1, d2, d3] = niveau.sterDrempels;
      if (ratio >= d3) return 3;
      if (ratio >= d2) return 2;
      if (ratio >= d1) return 1;
      return 1;
    }

    function eindigRonde() {
      if (afgelopen || opgeruimd) return;
      afgelopen = true;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      stopDansMuziek();

      const sterren = sterrenVoor(geslaagd);

      // Beloning: +1 munt per geslaagde noot.
      const verdiend = geslaagd * MUNTEN_PER_RAAK;
      const nieuwTotaal = voegMuntenToe(verdiend);
      updateMunten(nieuwTotaal, true);

      // Score ÉN behaalde sterren per lied+niveau bewaren (elk alleen omhoog) +
      // topscore/gespeeld-vlag. Zo toont het keuze-scherm later exact deze sterren.
      const beste = markeerDansScore(lied.id, niveauKey, score, sterren);
      // Dagelijkse opdrachten (G5): een afgeronde dans-ronde telt mee.
      meldQuestGebeurtenis("dansen");
      // 3 sterren? Zet de defensieve vlag voor de "sterdanser"-sticker.
      if (sterren >= 3) markeerDriesterDans();
      vierVerdiendeStickers();

      // Het resultaat-overlay toont de ZOJUIST behaalde sterren (de in-ronde-meting)
      // en de beste score ooit op dit lied+niveau.
      toonResultaat(sterren, verdiend, beste.score);
    }

    function toonResultaat(sterren, verdiendMunten, besteScore) {
      const overlay = maak("div", "dansen-resultaat-overlay");
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      overlay.setAttribute("aria-label", "Resultaat van de dans");

      const kaart = maak("div", "dansen-resultaat-kaart");
      const kop = maak("div", "dansen-resultaat-kop", "Klaar! 💃");
      const sterrenEl = maak(
        "div",
        "dansen-sterren",
        "⭐".repeat(sterren) + "☆".repeat(3 - sterren)
      );
      const scoreRegel = maak(
        "div",
        "dansen-resultaat-score",
        `Je score: ${score} (beste combo: ${besteCombo})`
      );
      const besteRegel = maak(
        "div",
        "dansen-resultaat-beste",
        `Beste op ${lied.naam} (${niveau.naam.toLowerCase()}): ${besteScore}`
      );
      const muntRegel = maak(
        "div",
        "dansen-resultaat-munten",
        `Je verdiende ${verdiendMunten} ★`
      );

      const knoppen = maak("div", "dansen-resultaat-knoppen");
      const nogKnop = maak("button", "knop primair", "Nog een keer 💃");
      nogKnop.type = "button";
      nogKnop.addEventListener("click", () => {
        // Herstart dezelfde ronde via de router (geschiedenis groeit niet). De
        // router roept eerst onze opruim-functie aan → alles netjes herbouwd.
        vervang("dansen", { liedId: lied.id, niveau: niveauKey });
      });
      const kiesKnop = maak("button", "knop", "Ander lied");
      kiesKnop.type = "button";
      kiesKnop.addEventListener("click", () => {
        // Terug naar het keuze-scherm binnen ditzelfde dansen-scherm (geen
        // router-navigatie): ruim de ronde op en toon de keuze opnieuw.
        toonKeuze();
      });
      const terugKnop = maak("button", "knop", "Terug");
      terugKnop.type = "button";
      terugKnop.addEventListener("click", () => terug());
      knoppen.append(nogKnop, kiesKnop, terugKnop);

      kaart.append(kop, sterrenEl, scoreRegel, besteRegel, muntRegel, knoppen);
      overlay.append(kaart);
      scherm.append(overlay);

      // ---- Juice (Feature G4): bij een goed resultaat (≥2 sterren) confetti in
      // de overlay + muntjes die vanaf de resultaat-kaart naar de teller vliegen.
      // Beide helpers ruimen zichzelf op en zijn reduced-motion-veilig. Even na
      // het verschijnen vuren zodat de kaart al in beeld is.
      if (sterren >= 2) {
        const juiceTimer = setTimeout(() => {
          sparkleTimers.delete(juiceTimer);
          vuurConfetti();
          if (verdiendMunten > 0) {
            vliegMunten({
              van: kaart,
              aantal: Math.max(1, Math.round(verdiendMunten / 5)),
            });
          }
        }, 120);
        // Bijhouden zodat opruimRonde() → stopAlles() hem wist als de speler
        // binnen 120ms wegnavigeert (geen late confetti op het volgende scherm).
        sparkleTimers.add(juiceTimer);
      }
    }

    // ---- De ronde-opruimer (cruciaal tegen leaks) ----
    function opruimRonde() {
      if (opgeruimd) return;
      opgeruimd = true;
      stopAlles();
      for (const h of handlers) h.knop.removeEventListener(h.type, h.fn);
      handlers.length = 0;
      if (import.meta.env && import.meta.env.DEV && window.__dans) {
        delete window.__dans;
      }
    }

    // ---- Diagnose-hook (ALLEEN dev) — zoals voorheen, voor de headless preview
    // die de RAF-lus pauzeert. Laat de spel-klok deterministisch vooruit zetten en
    // banen drukken/loslaten. NIET in de productie-build (Vite snoeit de tak weg).
    if (import.meta.env && import.meta.env.DEV) {
      window.__dans = {
        stap(ms = 16) {
          if (opgeruimd || afgelopen) return false;
          klok += ms;
          return verwerkFrame();
        },
        druk(baan) {
          drukBaan(Number(baan));
        },
        los(baan) {
          laatLosBaan(Number(baan));
        },
        get klok() {
          return klok;
        },
        get info() {
          return {
            lied: lied.id,
            niveau: niveauKey,
            bpm: lied.bpm,
            score,
            combo,
            besteCombo,
            multiplier: multiplierNu(),
            geslaagd,
            totaalNoten,
            gespawnd: volgendeIndex,
            levend: noten.length,
            afgelopen,
            opgeruimd,
          };
        },
      };
    }

    // Start de ronde: muziek met dit lied + RAF-lus.
    startDansMuziek(lied);
    rafId = requestAnimationFrame(frame);

    // Deze fase opruimen bij faseovergang/weg-navigeren.
    wisselFase(opruimRonde);
  }

  // =========================================================================
  // De opruim-functie voor de router: delegeert naar de actieve fase. Zo lekt er
  // niets, ongeacht in welke fase (keuze/ronde/resultaat) we zitten.
  // =========================================================================
  return () => {
    if (faseOpruim) {
      faseOpruim();
      faseOpruim = null;
    }
  };
}
