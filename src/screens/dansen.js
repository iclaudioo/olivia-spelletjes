// Dans-minigame "Volg de moves!" — een vrolijk, kindvriendelijk ritme-/dansspel
// (DDR-achtig, maar simpel en heel vergevingsgezind). Pijl-cues vallen op de
// K-pop-beat van boven naar een gemarkeerde DOELZONE net boven vier grote baan-
// knoppen. Olivia tikt de juiste baan-knop terwijl er een pijl in de zone zit:
//   - RAAK  → pijl weg, +score, combo +1, sparkle/hartje + geluidje
//   - MIS   → pijl valt voorbij de zone zonder tik → combo reset (geen straf)
//   - tik zonder pijl in de zone → genegeerd (geen straf — kindvriendelijk)
// Mama + Olivia dansen op de achtergrond mee op de dansmuziek.
//
// Bij het einde (vaste reeks pijlen op) verschijnt een resultaat-overlay met
// score, sterren-rating, verdiende munten + knoppen "Nog een keer" / "Terug".
//
// GEEN LEAKS (cruciaal): toon() geeft een opruim-functie terug die de router bij
// weg-navigeren aanroept. Die stopt de requestAnimationFrame-loop, cleart álle
// timers, stopt de dansmuziek, verwijdert pijl-DOM/overlay en haalt pointer-
// listeners weg. Datzelfde opruimen gebeurt ook bij "Terug" en aan het einde.

import { maak } from "../ui/dom.js";
import { maakTopbar } from "../ui/topbar.js";
import { terug, vervang } from "../router.js";
import { getStaat, voegMuntenToe, markeerDansGespeeld, getDansTopScore } from "../state.js";
import { startDansMuziek, stopDansMuziek } from "../audio/muziek.js";
import { sparkleGeluid } from "../audio/sfx.js";
import { vierVerdiendeStickers } from "../ui/toast.js";
import { mamaSVG } from "../art/mama.js";
import { oliviaSVG } from "../art/olivia.js";

// De vier banen (links/onder/boven/rechts), in deze volgorde van links→rechts.
const BANEN = [
  { id: "links", pijl: "⬅️" },
  { id: "onder", pijl: "⬇️" },
  { id: "boven", pijl: "⬆️" },
  { id: "rechts", pijl: "➡️" },
];

// Spelinstellingen — rustig tempo, ruime/vergevingsgezinde timing.
const AANTAL_PIJLEN = 26; // een ronde = vaste reeks pijlen
const SPAWN_INTERVAL_MS = 820; // tijd tussen twee nieuwe pijlen
const VALTIJD_MS = 2000; // hoe lang een pijl erover doet om te vallen
const EERSTE_SPAWN_MS = 700; // korte aanloop voor de eerste pijl
const MUNTEN_PER_RAAK = 1; // +1 munt per geslaagde tik

// Of de gebruiker "minder beweging" wil. We laten de gameplay (vallende pijlen)
// dan iets rustiger lopen en zetten de decoratieve sparkles uit; de CSS regelt
// de stilstaande dansers/achtergrond.
function minderBeweging() {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function toon(app, _params = {}) {
  const staat = getStaat();
  app.innerHTML = "";
  const rustig = minderBeweging();

  // ---- Topbalk met terug-knop ----
  const { el: top, updateMunten } = maakTopbar({
    titel: "💃 Dansen",
    opTerug: () => terug(), // de router roept dan onze opruim-functie aan
    toonMunten: true,
  });
  updateMunten(staat.munten);

  // ---- Scherm-opbouw ----
  const scherm = maak("div", "dansen-scherm");

  // Dansende achtergrond (Mama + Olivia aan de zijkanten, achter het speelveld).
  const dansers = maak("div", "dansen-dansers");
  dansers.setAttribute("aria-hidden", "true");
  const mama = maak("div", "dansen-danser mama");
  mama.innerHTML = mamaSVG;
  const olivia = maak("div", "dansen-danser olivia");
  olivia.innerHTML = oliviaSVG;
  dansers.append(mama, olivia);

  // Live score + combo.
  const scorebalk = maak("div", "dansen-scorebalk");
  const scoreEl = maak("div", "dansen-score", "Score: 0");
  const comboEl = maak("div", "dansen-combo", "");
  const besteEl = maak("div", "dansen-beste", `Beste: ${getDansTopScore()}`);
  scorebalk.append(scoreEl, comboEl, besteEl);

  // Het speelveld: een vallaag (waar pijlen in vallen), de doelzone-band en
  // onderaan de vier grote baan-knoppen.
  const veld = maak("div", "dansen-veld");

  const vallaag = maak("div", "dansen-vallaag");
  const doelzone = maak("div", "dansen-doelzone");
  doelzone.setAttribute("aria-hidden", "true");
  vallaag.append(doelzone);

  const knoppenrij = maak("div", "dansen-knoppen");
  const knopPerBaan = {}; // baan-id → knop-element
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
  scherm.append(dansers, scorebalk, veld);
  app.append(top, scherm);

  // =========================================================================
  // Speel-logica
  // =========================================================================

  // Levende pijlen: { el, baan, startKlok } — el-positie wordt per frame gezet.
  // We werken met een EIGEN spel-klok (`klok`, in ms) die alleen oploopt via de
  // requestAnimationFrame-delta's — NIET via performance.now(). Zo blijven het
  // laten-vallen én het inplannen van nieuwe pijlen altijd in lockstep: pauzeert
  // de browser de RAF-lus (bv. tab op de achtergrond), dan staan ALLE timings
  // stil en stapelen er geen pijlen op. Geen losse setTimeout-spawner meer.
  const pijlen = [];
  let score = 0;
  let combo = 0;
  let besteCombo = 0;
  let geslaagdeTikken = 0;
  let gespawnd = 0;
  let afgelopen = false; // ronde klaar (resultaat getoond)?
  let opgeruimd = false; // alles afgebroken (geen verdere acties)?

  // Spel-klok (ms) + afgeleide planning. `klok` loopt op via RAF-delta's.
  let klok = 0;
  let vorigeTs = 0; // vorige RAF-timestamp (om de delta te bepalen)
  let volgendeSpawnKlok = EERSTE_SPAWN_MS; // klok-tijd voor de volgende spawn

  // Loop-id + sparkle-opruimers zodat we ze gegarandeerd kunnen opruimen.
  let rafId = 0;
  const sparkleTimers = new Set(); // korte sparkle-element-opruimers

  // De doelzone-band als verticale fractie (0 = boven, 1 = onder) van de vallaag.
  // Ruim/vergevingsgezind: een brede band zodat tikken makkelijk lukt.
  const ZONE_MIN = 0.66; // bovenkant van de raakbare band
  const ZONE_MAX = 0.92; // onderkant (waar de knop zit)

  // ---- Een nieuwe pijl laten vallen in een willekeurige baan ----
  function spawnPijl() {
    if (opgeruimd || afgelopen) return;
    const baan = Math.floor(Math.random() * BANEN.length);
    const el = maak("div", `dansen-pijl baan-${BANEN[baan].id}`, BANEN[baan].pijl);
    el.style.left = `${(baan + 0.5) * (100 / BANEN.length)}%`;
    el.style.top = "0%";
    vallaag.append(el);
    // startKlok = de spel-klok bij spawnen; voortgang = (klok - startKlok)/valtijd.
    pijlen.push({ el, baan, startKlok: klok });
    gespawnd += 1;
  }

  // ---- Eén tik werk op basis van de huidige spel-klok: spawnen, pijlen laten
  // zakken, missers afhandelen en kijken of de ronde klaar is. Gescheiden van de
  // RAF-aansturing zodat de logica los te testen is (zie diagnose-hook onderaan).
  // Geeft true terug als de ronde hierdoor eindigde.
  function verwerkFrame() {
    // Nieuwe pijlen inplannen op basis van de spel-klok (NIET via setTimeout):
    // zo blijft spawnen exact in lockstep met het vallen, ook na een pauze.
    while (gespawnd < AANTAL_PIJLEN && klok >= volgendeSpawnKlok) {
      spawnPijl();
      volgendeSpawnKlok += SPAWN_INTERVAL_MS;
    }

    for (let i = pijlen.length - 1; i >= 0; i--) {
      const p = pijlen[i];
      const voortgang = (klok - p.startKlok) / VALTIJD_MS; // 0..1 (en verder)
      if (voortgang >= 1.08) {
        // Pijl is voorbij de zone/knop gevallen zonder tik → MIS (combo reset).
        p.el.remove();
        pijlen.splice(i, 1);
        combo = 0;
        tekenScore();
        continue;
      }
      // Positie: van boven (0%) naar net onder de knop. clamp visueel.
      const top = Math.min(voortgang, 1.05) * 100;
      p.el.style.top = `${top}%`;
      // Markeer "in de zone" (voor een subtiel oplicht-randje).
      const inZone = voortgang >= ZONE_MIN && voortgang <= ZONE_MAX;
      p.el.classList.toggle("in-zone", inZone);
    }
    // Ronde voorbij? Alle pijlen gespawnd én weg → resultaat.
    if (gespawnd >= AANTAL_PIJLEN && pijlen.length === 0) {
      eindigRonde();
      return true;
    }
    return false;
  }

  // ---- De animatie-lus: spel-klok ophogen + één frame verwerken + herplannen ----
  function frame(ts) {
    if (opgeruimd || afgelopen) return;
    // Spel-klok ophogen met de echte frame-delta (begrensd zodat één lange hapering
    // — bv. terugkeren van een achtergrond-tab — niet ineens alles vooruitspoelt).
    if (vorigeTs) klok += Math.min(ts - vorigeTs, 100);
    vorigeTs = ts;
    if (verwerkFrame()) return; // ronde eindigde
    rafId = requestAnimationFrame(frame);
  }

  // ---- Een baan-knop getikt: kijk of er een pijl in de doelzone zit ----
  function tikBaan(baan) {
    if (opgeruimd || afgelopen) return;
    // Zoek de pijl in deze baan die het dichtst bij het zone-midden zit en
    // raakbaar is. Vergevingsgezind: hele brede band telt als raak. We meten
    // tegen dezelfde spel-klok als de animatie-lus zodat het exact klopt.
    let beste = -1;
    let besteAfstand = Infinity;
    for (let i = 0; i < pijlen.length; i++) {
      const p = pijlen[i];
      if (p.baan !== baan) continue;
      const voortgang = (klok - p.startKlok) / VALTIJD_MS;
      if (voortgang < ZONE_MIN || voortgang > ZONE_MAX) continue; // niet in de band
      const afstand = Math.abs(voortgang - (ZONE_MIN + ZONE_MAX) / 2);
      if (afstand < besteAfstand) {
        besteAfstand = afstand;
        beste = i;
      }
    }
    if (beste === -1) {
      // Geen pijl in de zone → genegeerd (geen straf, geen combo-reset).
      return;
    }
    // RAAK!
    const p = pijlen[beste];
    p.el.remove();
    pijlen.splice(beste, 1);
    score += 1;
    combo += 1;
    geslaagdeTikken += 1;
    if (combo > besteCombo) besteCombo = combo;
    tekenScore();
    sparkleGeluid(); // respecteert aanGeluid()
    toonSparkle(baan);
  }

  // ---- Score/combo-tekst bijwerken ----
  function tekenScore() {
    scoreEl.textContent = `Score: ${score}`;
    comboEl.textContent = combo >= 2 ? `Combo x${combo} 🔥` : "";
  }

  // ---- Klein sparkle/hartje bij een raak (decoratief; uit bij minder-beweging) ----
  function toonSparkle(baan) {
    if (rustig) return; // geen extra beweging onder prefers-reduced-motion
    const knop = knopPerBaan[baan];
    if (!knop) return;
    const vonk = maak("span", "dansen-vonk", Math.random() < 0.5 ? "✨" : "💖");
    knop.append(vonk);
    const t = setTimeout(() => {
      vonk.remove();
      sparkleTimers.delete(t);
    }, 700);
    sparkleTimers.add(t);
  }

  // =========================================================================
  // Pointer-afhandeling (pointerdown op de baan-knoppen)
  // =========================================================================
  function opPointerDown(e) {
    const knop = e.currentTarget;
    const baan = Number(knop.dataset.baan);
    if (Number.isNaN(baan)) return;
    e.preventDefault();
    knop.classList.remove("druk");
    void knop.offsetWidth; // reflow zodat de druk-animatie opnieuw start
    knop.classList.add("druk");
    tikBaan(baan);
  }
  for (const knop of Object.values(knopPerBaan)) {
    knop.addEventListener("pointerdown", opPointerDown);
  }

  // =========================================================================
  // Ronde starten / eindigen / opruimen
  // =========================================================================

  function startRonde() {
    startDansMuziek(); // respecteert geluid-instelling
    // De RAF-lus regelt zowel het spawnen (via de spel-klok) als het vallen.
    rafId = requestAnimationFrame(frame);
  }

  // Alle lopende dingen stoppen (loop, sparkle-timers, muziek). Verwijdert NIET
  // het scherm-DOM (de router wist #app), maar wel de losse pijlen voor de
  // zekerheid. Idempotent.
  function stopAlles() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
    for (const t of sparkleTimers) clearTimeout(t);
    sparkleTimers.clear();
    stopDansMuziek();
    for (const p of pijlen) p.el.remove();
    pijlen.length = 0;
  }

  // Resultaat tonen aan het einde van een ronde: stop de loop, ken munten +
  // sticker toe, werk topscore bij, en toon de overlay met sterren.
  function eindigRonde() {
    if (afgelopen || opgeruimd) return;
    afgelopen = true;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
    stopDansMuziek();

    // Beloning: +1 munt per geslaagde tik.
    const verdiend = geslaagdeTikken * MUNTEN_PER_RAAK;
    const nieuwTotaal = voegMuntenToe(verdiend);
    updateMunten(nieuwTotaal, true);

    // Topscore + "gespeeld"-vlag bewaren, daarna sticker(s) vieren.
    markeerDansGespeeld(score);
    vierVerdiendeStickers();

    toonResultaat(verdiend);
  }

  // De sterren-rating: 1–3 sterren naar verhouding van geslaagde tikken.
  function sterrenVoor(geslaagd) {
    const ratio = AANTAL_PIJLEN > 0 ? geslaagd / AANTAL_PIJLEN : 0;
    if (ratio >= 0.8) return 3;
    if (ratio >= 0.5) return 2;
    return 1;
  }

  function toonResultaat(verdiendMunten) {
    const sterren = sterrenVoor(geslaagdeTikken);
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
    const muntRegel = maak(
      "div",
      "dansen-resultaat-munten",
      `Je verdiende ${verdiendMunten} ★`
    );

    const knoppen = maak("div", "dansen-resultaat-knoppen");
    const nogKnop = maak("button", "knop primair", "Nog een keer 💃");
    nogKnop.type = "button";
    nogKnop.addEventListener("click", () => {
      // Herstart het scherm zonder de geschiedenis te laten groeien. De router
      // roept eerst onze opruim-functie aan, dus alles wordt netjes herbouwd.
      vervang("dansen");
    });
    const terugKnop = maak("button", "knop", "Terug");
    terugKnop.type = "button";
    terugKnop.addEventListener("click", () => terug());
    knoppen.append(nogKnop, terugKnop);

    kaart.append(kop, sterrenEl, scoreRegel, muntRegel, knoppen);
    overlay.append(kaart);
    scherm.append(overlay);
  }

  // Start de ronde.
  startRonde();

  // ---- Diagnose-hook (ALLEEN in dev) ------------------------------------
  // De headless preview houdt het tabblad "hidden", waardoor de browser de
  // requestAnimationFrame-lus pauzeert — dan valt/spawnt er niets en is de
  // gameplay daar niet live te observeren. Daarom stellen we, UITSLUITEND in de
  // dev-build (import.meta.env.DEV), een klein hookje bloot waarmee de
  // verificatie de spel-klok deterministisch vooruit kan zetten en één tik kan
  // verwerken. Dit zit NIET in de productie-build (Vite snoeit de tak weg) en
  // raakt de echte gameplay niet. In dezelfde geest als dansMuziekSpeelt().
  if (import.meta.env && import.meta.env.DEV) {
    window.__dans = {
      stap(ms = 16) {
        if (opgeruimd || afgelopen) return false;
        klok += ms;
        return verwerkFrame();
      },
      get klok() { return klok; },
      get info() {
        return { score, combo, besteCombo, geslaagdeTikken, gespawnd, pijlen: pijlen.length, afgelopen, opgeruimd };
      },
    };
  }

  // =========================================================================
  // Opruim-functie voor de router (cruciaal tegen leaks). Wordt aangeroepen bij
  // weg-navigeren én bij "Terug"/"Nog een keer" (via terug()/vervang()).
  // =========================================================================
  return () => {
    if (opgeruimd) return;
    opgeruimd = true;
    stopAlles();
    for (const knop of Object.values(knopPerBaan)) {
      knop.removeEventListener("pointerdown", opPointerDown);
    }
    if (import.meta.env && import.meta.env.DEV && window.__dans) {
      delete window.__dans;
    }
  };
}
