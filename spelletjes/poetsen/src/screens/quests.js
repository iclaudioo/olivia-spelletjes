// Opdrachten-scherm (Feature G5): het Rad van Fortuin + de 3 dagelijkse
// opdrachten. Elke dag krijgt Olivia hier iets nieuws: een gratis dagelijkse
// draai aan het rad (munten) én drie opdrachten die ze door te spelen vol kan
// maken en ophalen.
//
// RAD VAN FORTUIN: een draaibaar rad met 6 segmenten (munt-bedragen + een
// ster-bonus). Mag je vandaag nog draaien (kanRadDraaien()), dan draait een tik
// op "Draai!" het rad via een CSS-rotatie naar een willekeurig segment; bij
// stilstand keren we de munten uit (voegMuntenToe), markeren we de dag
// (markeerRadGedraaid), vieren we met de G4-juice (vuurConfetti + vliegMunten) en
// kennen we de "geluksvogel"-sticker toe. Daarna: "Kom morgen terug! ⏰".
//
// OPDRACHTEN: de 3 taken van vandaag (zorgVoorQuestsVandaag) met een
// voortgangsbalk; een voltooide taak krijgt een actieve "Ophalen ✨"-knop →
// claimQuest + munten-juice + "doener"-sticker, daarna "Opgehaald ✓".
//
// GEEN LEAKS (cruciaal): toon() geeft een opruim-functie terug die de router bij
// weg-navigeren aanroept. Die wist ALLE timers (ook de rad-spin-timer/-fallback)
// en haalt de transitionend-listener van het rad weg — ook als je wegnavigeert
// terwijl het rad nog draait. Onder prefers-reduced-motion draait het rad NIET
// lang/visueel rond (geen flikkering) maar levert het gewoon meteen een beloning.

import {
  getStaat,
  voegMuntenToe,
  zorgVoorQuestsVandaag,
  getQuestsVandaag,
  claimQuest,
  kanRadDraaien,
  markeerRadGedraaid,
} from "../state.js";
import { questById } from "../data/quests.js";
import { terug } from "../router.js";
import { maakTopbar } from "../ui/topbar.js";
import { maak } from "../ui/dom.js";
import { vierVerdiendeStickers } from "../ui/toast.js";
import { vuurConfetti } from "../ui/confetti.js";
import { vliegMunten } from "../ui/muntvlieg.js";
import { muntGeluid, vieringGeluid, ontgrendelAudio } from "../audio/sfx.js";

// De rad-segmenten (met de klok mee). `ster` markeert de bonus (een extra groot
// bedrag met een vrolijke ster). De volgorde bepaalt ook de visuele kleurband.
const RAD_SEGMENTEN = [
  { bedrag: 10, label: "10", kleur: "#6ec8ff" },
  { bedrag: 20, label: "20", kleur: "#ff8fb6" },
  { bedrag: 30, label: "30", kleur: "#7bd88f" },
  { bedrag: 50, label: "50", kleur: "#b98cff" },
  { bedrag: 100, label: "★100", kleur: "#ffd24a", ster: true },
  { bedrag: 20, label: "20", kleur: "#ffb86e" },
];
const SEG_AANTAL = RAD_SEGMENTEN.length;
const SEG_HOEK = 360 / SEG_AANTAL;

// Hoe lang de rad-spin-animatie duurt (matcht de CSS-transition op .rad-draaier).
const SPIN_MS = 3200;
// Extra marge bovenop SPIN_MS voor de fallback-timer (mocht transitionend niet
// vuren, bv. bij een onderbroken transition) zodat de beloning nooit hangt.
const SPIN_FALLBACK_MS = SPIN_MS + 400;
// Hoeveel hele rondjes het rad minimaal draait vóór het op het doel landt
// (puur cosmetisch; meer = spannender).
const EXTRA_RONDEN = 5;

// Of de gebruiker bewegingen wil beperken.
function rustigeBeweging() {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function toon(app, _params = {}) {
  app.innerHTML = "";

  // Zorg dat er voor vandaag 3 opdrachten klaarstaan (kiest ze de eerste keer
  // vandaag; daarna no-op zodat de voortgang van vandaag bewaard blijft).
  zorgVoorQuestsVandaag();

  // ---- Bookkeeping voor lek-vrije opruim ----
  // Alle lopende timers + de transitionend-listener van het rad. De router roept
  // de teruggegeven opruim-functie aan bij weg-navigeren; die wist alles — ook
  // midden in een draai.
  const timers = new Set();
  let radDraaier = null; // het roterende element (voor de listener-cleanup)
  let radKlaarHandler = null; // transitionend-handler (of null)
  let opgeruimd = false;

  function zetTimer(fn, ms) {
    const t = setTimeout(() => {
      timers.delete(t);
      if (!opgeruimd) fn();
    }, ms);
    timers.add(t);
    return t;
  }

  // ---- Topbalk met terug-knop ----
  const { el: top, updateMunten } = maakTopbar({
    titel: "🎯 Opdrachten",
    opTerug: () => terug(),
    toonMunten: true,
  });
  updateMunten(getStaat().munten);

  const scherm = maak("div", "quests-scherm");

  // =========================================================================
  // RAD VAN FORTUIN
  // =========================================================================
  const radSectie = maak("div", "rad-sectie");
  radSectie.append(maak("div", "quests-sectie-titel", "🎡 Rad van Fortuin"));

  const radWrap = maak("div", "rad-wrap");
  // De wijzer (pijl) bovenaan, wijst naar het winnende segment.
  const wijzer = maak("div", "rad-wijzer", "▼");
  wijzer.setAttribute("aria-hidden", "true");

  // De draaier: een conic-gradient-schijf met de segment-labels eroverheen.
  radDraaier = maak("div", "rad-draaier");
  radDraaier.setAttribute("role", "img");
  radDraaier.setAttribute("aria-label", "Rad van Fortuin");
  // Bouw de conic-gradient uit de segment-kleuren (gelijke parten).
  const stops = RAD_SEGMENTEN.map((seg, i) => {
    const van = i * SEG_HOEK;
    const tot = (i + 1) * SEG_HOEK;
    return `${seg.kleur} ${van}deg ${tot}deg`;
  }).join(", ");
  radDraaier.style.background = `conic-gradient(${stops})`;

  // Labels per segment (in het midden van elk part geplaatst via rotatie).
  for (let i = 0; i < SEG_AANTAL; i++) {
    const seg = RAD_SEGMENTEN[i];
    const lbl = maak("div", "rad-segment-label" + (seg.ster ? " ster" : ""), seg.label);
    // Roteer naar het midden van het segment; het label staat dan langs de straal.
    const midden = i * SEG_HOEK + SEG_HOEK / 2;
    lbl.style.transform = `rotate(${midden}deg)`;
    radDraaier.append(lbl);
  }

  const naaf = maak("div", "rad-naaf", "🎁");
  naaf.setAttribute("aria-hidden", "true");

  radWrap.append(radDraaier, naaf, wijzer);
  radSectie.append(radWrap);

  // Status-regel + Draai-knop.
  const radStatus = maak("div", "rad-status", "");
  const draaiKnop = maak("button", "knop primair rad-knop", "Draai! 🎡");
  draaiKnop.type = "button";

  radSectie.append(draaiKnop, radStatus);
  scherm.append(radSectie);

  // De huidige rotatie (graden), zodat opeenvolgende draaien doorbouwen i.p.v.
  // terug te springen (al draait er per dag maar één).
  let huidigeRotatie = 0;
  let aanHetDraaien = false;

  // De rad-UI in de juiste stand zetten o.b.v. of er vandaag nog gedraaid mag.
  function tekenRadStand() {
    if (kanRadDraaien()) {
      draaiKnop.disabled = false;
      draaiKnop.style.display = "";
      radStatus.textContent = "Draai één keer per dag voor gratis munten!";
    } else {
      draaiKnop.disabled = true;
      draaiKnop.style.display = "none";
      radStatus.textContent = "Kom morgen terug! ⏰";
    }
  }
  tekenRadStand();

  // De beloning uitkeren + vieren nadat het rad op `segIndex` is gestopt.
  function radBeloon(segIndex) {
    const seg = RAD_SEGMENTEN[segIndex];
    const bedrag = seg.bedrag;
    const nieuw = voegMuntenToe(bedrag);
    markeerRadGedraaid();
    updateMunten(nieuw);
    radStatus.textContent = `Je won ${bedrag} ★! Kom morgen terug! ⏰`;
    draaiKnop.disabled = true;
    draaiKnop.style.display = "none";
    aanHetDraaien = false;

    // G4-juice: confetti + munten die vanaf het rad naar de teller vliegen.
    vieringGeluid();
    zetTimer(() => muntGeluid(), 350);
    vuurConfetti();
    vliegMunten({ van: radDraaier, aantal: Math.max(1, Math.round(bedrag / 15)) });

    // "geluksvogel"-sticker (en eventueel andere) toekennen + vieren.
    vierVerdiendeStickers();
  }

  function draai() {
    if (aanHetDraaien) return;
    if (!kanRadDraaien()) return;
    ontgrendelAudio();
    aanHetDraaien = true;
    draaiKnop.disabled = true;

    // Kies een willekeurig winnend segment (de uitkering hangt hiervan af).
    const segIndex = Math.floor(Math.random() * SEG_AANTAL);

    // Reduced-motion: NIET lang/visueel ronddraaien (geen flikkering). We zetten
    // de schijf direct (zonder transition) op het segment en belonen meteen.
    if (rustigeBeweging()) {
      const doelHoek = -(segIndex * SEG_HOEK + SEG_HOEK / 2);
      radDraaier.style.transition = "none";
      radDraaier.style.transform = `rotate(${doelHoek}deg)`;
      huidigeRotatie = doelHoek;
      radStatus.textContent = "Draaien...";
      // Korte, rustige pauze zodat het niet abrupt is, dan belonen.
      zetTimer(() => radBeloon(segIndex), 250);
      return;
    }

    // De doel-rotatie: een paar hele ronden + landen met het midden van het
    // gekozen segment onder de wijzer (boven, 0°/360°). De wijzer staat bovenaan,
    // dus we draaien het segment-midden naar -90°-equivalent boven; omdat de
    // conic-gradient bij 0° bovenaan begint, brengt -(segMidden) het segment naar
    // boven. We tellen door op de huidige rotatie zodat het altijd vooruit draait.
    const segMidden = segIndex * SEG_HOEK + SEG_HOEK / 2;
    // Breng de huidige rotatie terug naar [0,360) en bereken hoeveel extra nodig is.
    const basis = EXTRA_RONDEN * 360;
    const doel = basis - segMidden;
    huidigeRotatie = doel;

    radStatus.textContent = "Draaien...";
    radDraaier.style.transition = `transform ${SPIN_MS}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)`;
    // Reflow forceren zodat de transition zeker (her)start.
    void radDraaier.offsetWidth;
    radDraaier.style.transform = `rotate(${doel}deg)`;

    // Bij het einde van de transition belonen. We gebruiken transitionend met een
    // fallback-timer (mocht het event niet vuren). Beide gaan via dezelfde
    // afhandeling die één keer wint (idempotent).
    let afgehandeld = false;
    const afmaken = () => {
      if (afgehandeld || opgeruimd) return;
      afgehandeld = true;
      // Listener loskoppelen zodra hij zijn werk heeft gedaan.
      if (radKlaarHandler) {
        radDraaier.removeEventListener("transitionend", radKlaarHandler);
        radKlaarHandler = null;
      }
      radBeloon(segIndex);
    };

    radKlaarHandler = (e) => {
      if (e.propertyName && e.propertyName !== "transform") return;
      afmaken();
    };
    radDraaier.addEventListener("transitionend", radKlaarHandler);
    // Vangnet: als transitionend niet komt, alsnog belonen.
    zetTimer(afmaken, SPIN_FALLBACK_MS);
  }

  draaiKnop.addEventListener("click", draai);

  // =========================================================================
  // OPDRACHTEN-LIJST
  // =========================================================================
  const questSectie = maak("div", "quest-sectie");
  questSectie.append(maak("div", "quests-sectie-titel", "🎯 Opdrachten van vandaag"));

  const lijst = maak("div", "quest-lijst");
  questSectie.append(lijst);
  scherm.append(questSectie);

  // Bouwt één opdracht-kaart. Houdt referenties bij zodat we hem na een claim
  // kunnen bijwerken zonder de hele lijst opnieuw te tekenen.
  function maakQuestKaart(taak) {
    const def = questById(taak.id);
    const kaart = maak("div", "quest-kaart");

    const kop = maak("div", "quest-kop");
    const emoji = maak("div", "quest-emoji", def?.emoji || "🎯");
    const naam = maak("div", "quest-naam", def?.naam || "Opdracht");
    kop.append(emoji, naam);

    // Voortgangsbalk (voortgang/doel).
    const balk = maak("div", "quest-balk");
    const vul = maak("div", "quest-vul");
    const balkLbl = maak("div", "quest-balk-label", "");
    balk.append(vul, balkLbl);

    // Beloning-regel + Ophalen-knop.
    const onder = maak("div", "quest-onder");
    const beloningEl = maak("div", "quest-beloning", `+${def?.beloning || 0} ★`);
    const knop = maak("button", "knop primair quest-ophaal", "Ophalen ✨");
    knop.type = "button";
    onder.append(beloningEl, knop);

    kaart.append(kop, balk, onder);

    function tekenKaart() {
      const v = Math.max(0, Math.min(taak.doel, taak.voortgang));
      const pct = taak.doel > 0 ? Math.round((v / taak.doel) * 100) : 0;
      vul.style.width = `${pct}%`;
      balkLbl.textContent = `${v} / ${taak.doel}`;
      const voltooid = taak.voortgang >= taak.doel;
      if (taak.beloond) {
        knop.textContent = "Opgehaald ✓";
        knop.disabled = true;
        knop.classList.add("opgehaald");
        kaart.classList.add("klaar");
      } else if (voltooid) {
        knop.textContent = "Ophalen ✨";
        knop.disabled = false;
        knop.classList.remove("opgehaald");
        kaart.classList.add("voltooid");
      } else {
        knop.textContent = "Ophalen ✨";
        knop.disabled = true;
        knop.classList.remove("opgehaald");
        kaart.classList.remove("voltooid");
      }
    }
    tekenKaart();

    knop.addEventListener("click", () => {
      if (taak.beloond) return;
      if (taak.voortgang < taak.doel) return;
      ontgrendelAudio();
      const beloning = claimQuest(taak.id);
      if (beloning <= 0) {
        // Niets uitgekeerd (al opgehaald of net niet klaar) → veilig hertekenen.
        tekenKaart();
        return;
      }
      updateMunten(getStaat().munten);
      tekenKaart();
      // G4-juice: confetti + muntjes vanaf de kaart naar de teller.
      vieringGeluid();
      zetTimer(() => muntGeluid(), 300);
      const r = kaart.getBoundingClientRect();
      vuurConfetti({ x: r.left + r.width / 2, y: r.top + r.height / 2, aantal: 18 });
      vliegMunten({ van: kaart, aantal: Math.max(1, Math.round(beloning / 8)) });
      // "doener"-sticker (en eventueel andere) toekennen + vieren.
      vierVerdiendeStickers();
    });

    return kaart;
  }

  for (const taak of getQuestsVandaag()) lijst.append(maakQuestKaart(taak));

  app.append(top, scherm);

  // ---- Lek-vrije opruim (router roept dit aan bij weg-navigeren) ----
  // Wist alle timers (ook de rad-spin-fallback) en haalt de transitionend-listener
  // van het rad weg — ook als we wegnavigeren terwijl het rad nog draait.
  return () => {
    opgeruimd = true;
    for (const t of timers) clearTimeout(t);
    timers.clear();
    if (radDraaier && radKlaarHandler) {
      radDraaier.removeEventListener("transitionend", radKlaarHandler);
    }
    radKlaarHandler = null;
  };
}
