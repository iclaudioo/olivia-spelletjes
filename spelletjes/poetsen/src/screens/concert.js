// Concert-show op het Popster-podium — de grote finale (Feature G6). Olivia geeft
// (in haar gekozen styling-look) een spetterend concert op het podium: spotlights
// die TRAAG en ZACHT bewegen, een juichend publiek dat meedeint, zwevende lichtjes/
// noten/hartjes, periodieke confetti-bursts en vrolijke K-pop-muziek. Mama zingt
// backup; het gekozen huisdier (indien aanwezig) danst mee.
//
// Hergebruik (geen duplicatie): kamerArt('podium') als toneel-achtergrond,
// oliviaSVG(getOliviaLook()) + mamaSVG + huisdierSVG voor de figuren,
// startDansMuziek/stopDansMuziek voor de muziek, vuurConfetti + vliegMunten voor de
// juice, en de bestaande dans-stuiter-keyframes (dansStuiter/B/C) uit styles.css.
//
// INTERACTIE: tikken op het podium laat Olivia een extra-grote pose/sprong maken
// en geeft een confetti-burst (kindvriendelijk, speels). EINDE: de "Klaar ✨"-knop
// of de auto-stop na ~15s beloont met munten (+ vliegMunten), markeert het concert
// (markeerConcert → "superster"-sticker) en gaat terug naar het huis.
//
// LEK-VRIJ (cruciaal): toon() geeft een opruim-functie terug die de router bij
// weg-navigeren aanroept. Die STOPT de muziek, cancelt ALLE timers (auto-stop +
// confetti-interval + pose-timer), verwijdert de DOM/listeners en is idempotent —
// ook als je midden in de show wegnavigeert blijft er niets hangen. De muziek-API
// (startDansMuziek/stopDansMuziek) wordt niet aangeraakt of veranderd, dus het
// dansfeest én de dans-minigame blijven gewoon werken.
//
// VEILIGHEID/iPad: de spotlights bewegen traag + zacht (geen snelle flikkering/
// strobe i.v.m. fotosensitiviteit). Onder prefers-reduced-motion staan spotlights
// en dansers stil, flikkert er niets en blijft de show kijkbaar + de knop werken
// (de CSS regelt het, en de periodieke confetti valt onder reduced-motion terug op
// één zacht ✨). Grote tikdoelen, geen page-scroll/zoom (touch-action in CSS).

import { maak } from "../ui/dom.js";
import { maakTopbar } from "../ui/topbar.js";
import { terug } from "../router.js";
import { getStaat, voegMuntenToe, getOliviaLook, getGekozenHuisdier, markeerConcert } from "../state.js";
import { startDansMuziek, stopDansMuziek } from "../audio/muziek.js";
import { vuurConfetti } from "../ui/confetti.js";
import { vliegMunten } from "../ui/muntvlieg.js";
import { vierVerdiendeStickers } from "../ui/toast.js";
import { ontgrendelAudio } from "../audio/sfx.js";
import { kamerArt } from "../art/kamers.js";
import { oliviaSVG } from "../art/olivia.js";
import { mamaSVG } from "../art/mama.js";
import { huisdierById, huisdierSVG } from "../data/huisdieren.js";
import { liedById } from "../data/liedjes.js";

// Hoe lang het concert automatisch duurt voor het vanzelf eindigt (ms).
const CONCERT_DUUR_MS = 15000;
// Hoe vaak er tijdens de show een kleine confetti-burst boven het podium komt (ms).
const CONFETTI_INTERVAL_MS = 2600;
// Beloning in munten voor een gegeven concert (de grote finale = royaal).
const CONCERT_BELONING = 30;
// Het lied waarop Olivia optreedt: het energieke "Superster" uit de catalogus
// (valt veilig terug op undefined → standaard-deuntje als de id ooit verdwijnt).
const CONCERT_LIED = "superster";

// Of de gebruiker bewegingen wil beperken. We slaan dan de periodieke confetti-
// regen + de pose-burst-spam over (vuurConfetti toont onder reduced-motion zelf al
// een zacht ✨); de CSS zet spotlights/dansers stil. De show blijft kijkbaar en de
// knop blijft werken.
function minderBeweging() {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function toon(app) {
  app.innerHTML = "";
  const staat = getStaat();
  const rustig = minderBeweging();

  // Audio mag pas na een gebaar; de tik die hierheen navigeerde telt al, maar we
  // ontgrendelen voor de zekerheid nog eens (idempotent, kan niet crashen).
  ontgrendelAudio();

  let afgesloten = false; // of de show al is beëindigd/afgebroken (idempotent)
  let autoTimer = 0; // auto-stop na ~15s
  let confettiTimer = 0; // periodieke confetti-burst-interval
  let poseTimer = 0; // timer die de pose-klasse weer weghaalt na een tik

  // ---- Topbalk (terug + munten). Terug breekt de show netjes af (geen beloning,
  // de router roept onze opruim-functie aan). ----
  const { el: top, updateMunten } = maakTopbar({
    titel: "🎤 Concert",
    opTerug: () => terug(),
    toonMunten: true,
  });
  updateMunten(staat.munten);

  // ---- Scherm-opbouw ----
  const scherm = maak("div", "concert-scherm");
  scherm.setAttribute("role", "region");
  scherm.setAttribute("aria-label", "Olivia's concert op het podium");

  // Het podium als toneel-achtergrond (hergebruikt de bestaande podium-SVG).
  const toneel = maak("div", "concert-toneel");
  toneel.setAttribute("aria-hidden", "true");
  toneel.innerHTML = kamerArt("podium");

  // SPOTLIGHTS: drie zachte, TRAAG bewegende gekleurde lichtbundels van boven
  // (lage opacity + blur, geen strobe). Puur CSS (zie styles.css).
  const spots = maak("div", "concert-spots");
  spots.setAttribute("aria-hidden", "true");
  for (const klas of ["a", "b", "c"]) spots.append(maak("div", `concert-spot ${klas}`));

  // ZWEVENDE lichtjes/noten/hartjes die langzaam omhoog drijven (puur CSS).
  const zwevers = maak("div", "concert-zwevers");
  zwevers.setAttribute("aria-hidden", "true");
  const emojis = ["✨", "🎵", "💖", "⭐", "🎶", "💫", "🎵", "💗"];
  emojis.forEach((e, i) => {
    zwevers.append(maak("span", `concert-zwever z${i % 8}`, e));
  });

  // DE DANSERS op het podium (Mama backup links, Olivia centraal, huisdier rechts).
  const dansers = maak("div", "concert-dansers");
  dansers.setAttribute("aria-hidden", "true");

  const mamaWrap = maak("div", "concert-danser-wrap backup");
  const mama = maak("div", "concert-danser mama");
  mama.innerHTML = mamaSVG;
  mamaWrap.append(mama, maak("div", "concert-naam", "Mama"));

  const oliviaWrap = maak("div", "concert-danser-wrap ster");
  const olivia = maak("div", "concert-danser olivia");
  // Olivia treedt op in haar GEKOZEN look (Styling Studio).
  olivia.innerHTML = oliviaSVG(getOliviaLook());
  oliviaWrap.append(olivia, maak("div", "concert-naam", "Olivia 🎤"));

  dansers.append(mamaWrap, oliviaWrap);

  // Gekozen huisdier (indien aanwezig) danst mee op het podium.
  const huisdierId = getGekozenHuisdier();
  if (huisdierId) {
    const def = huisdierById(huisdierId);
    const dier = maak("div", "concert-danser huisdier");
    const svg = huisdierSVG(huisdierId);
    if (svg) {
      dier.innerHTML = svg;
    } else if (def) {
      dier.classList.add("concert-huisdier-emoji");
      dier.textContent = def.emoji;
    }
    const dierWrap = maak("div", "concert-danser-wrap huisdier");
    dierWrap.append(dier, maak("div", "concert-naam", def ? def.naam : "Huisdier"));
    dansers.append(dierWrap);
  }

  // PUBLIEK: een rij juichende silhouet-hoofdjes onderaan die meedeinen, met een
  // paar zwaaiende 🎉/💖 en een vrolijk tekstje "Olivia! 🎤".
  const publiek = maak("div", "concert-publiek");
  publiek.setAttribute("aria-hidden", "true");
  const koppen = ["🧒", "👧", "🧑", "🎉", "👦", "👩", "💖", "🧒", "👧", "🙌"];
  koppen.forEach((k, i) => {
    publiek.append(maak("span", `concert-hoofd h${i % 8}`, k));
  });
  const roep = maak("div", "concert-roep", "Olivia! 🎤");
  roep.setAttribute("aria-hidden", "true");

  // De grote "Klaar"-knop (eindigt de show met beloning).
  const klaarKnop = maak("button", "concert-klaar", "Klaar ✨");
  klaarKnop.type = "button";
  klaarKnop.setAttribute("aria-label", "Stop het concert");

  scherm.append(toneel, spots, zwevers, dansers, publiek, roep, klaarKnop);
  app.append(top, scherm);

  // ---- Interactie: tik op het podium → Olivia maakt een extra pose/sprong +
  // een vrolijke confetti-burst. We luisteren op het toneel (de achtergrond) en
  // op de dansers; de Klaar-knop heeft een eigen handler en mag NIET als
  // "podium-tik" tellen, dus die laten we het event niet doorgeven. ----
  function podiumGetikt(e) {
    if (afgesloten) return;
    // Tikken op de Klaar-knop telt niet als podium-tik.
    if (e.target && e.target.closest && e.target.closest(".concert-klaar")) return;
    ontgrendelAudio();
    // Olivia springt extra hoog (kort): een klasse die we na de animatie weer
    // weghalen zodat herhaald tikken hem opnieuw triggert.
    olivia.classList.remove("pose");
    void olivia.offsetWidth; // reflow forceren → animatie herstart
    olivia.classList.add("pose");
    clearTimeout(poseTimer);
    poseTimer = setTimeout(() => {
      olivia.classList.remove("pose");
      poseTimer = 0;
    }, 700);
    // Een vrolijke confetti-burst rond de tikplek (binnen het venster). Onder
    // reduced-motion toont vuurConfetti zelf een zacht ✨ i.p.v. een regen.
    const x = typeof e.clientX === "number" ? e.clientX : window.innerWidth / 2;
    const y = typeof e.clientY === "number" ? e.clientY : window.innerHeight * 0.35;
    vuurConfetti({ x, y, aantal: 20 });
  }
  // Eén pointer-listener op het scherm dekt muis + touch + pen op de iPad.
  scherm.addEventListener("pointerdown", podiumGetikt);

  // ---- Einde + opruimen ----
  // Normaal einde (Klaar-knop / auto-stop): opruimen + beloning + sticker, dan
  // terug. Afbreken (weg-navigeren via Terug/router): opruimen ZONDER beloning.
  function stopAlles() {
    clearTimeout(autoTimer);
    autoTimer = 0;
    clearInterval(confettiTimer);
    confettiTimer = 0;
    clearTimeout(poseTimer);
    poseTimer = 0;
    scherm.removeEventListener("pointerdown", podiumGetikt);
    klaarKnop.removeEventListener("click", opKlaar);
    stopDansMuziek();
    if (import.meta.env && import.meta.env.DEV && window.__concert) {
      delete window.__concert;
    }
  }

  // De show normaal beëindigen (met beloning). Idempotent.
  function eindig() {
    if (afgesloten) return;
    afgesloten = true;
    stopAlles();

    // Beloning: munten erbij + munten-vlucht naar de teller + concert-markering +
    // "superster"-sticker vieren. (markeerConcert is idempotent: een tweede
    // concert geeft nog steeds munten, maar de sticker maar één keer.)
    const nieuwTotaal = voegMuntenToe(CONCERT_BELONING);
    updateMunten(nieuwTotaal, true);
    vliegMunten({ van: klaarKnop, aantal: Math.max(1, Math.round(CONCERT_BELONING / 6)) });
    markeerConcert();
    vierVerdiendeStickers();

    // Terug naar het huis-overzicht.
    terug();
  }

  function opKlaar() {
    eindig();
  }
  klaarKnop.addEventListener("click", opKlaar);

  // Auto-stop na ~15s (geeft ook netjes de beloning).
  autoTimer = setTimeout(eindig, CONCERT_DUUR_MS);

  // ---- Muziek + periodieke confetti starten ----
  // Vrolijk K-pop-nummer ("Superster"); valt terug op het standaard-deuntje als de
  // id ooit ontbreekt. startDansMuziek faalt stil als de audio nog niet klaar is.
  startDansMuziek(liedById(CONCERT_LIED));

  // Periodieke kleine confetti-bursts boven het podium tijdens de show. Onder
  // reduced-motion slaan we de eindeloze regen over (geen flikkering); de show
  // blijft kijkbaar. We bewaren de interval-id en clearen hem bij opruimen.
  if (!rustig) {
    confettiTimer = setInterval(() => {
      if (afgesloten) return;
      vuurConfetti({
        x: window.innerWidth * (0.3 + Math.random() * 0.4),
        y: window.innerHeight * 0.3,
        aantal: 14,
      });
    }, CONFETTI_INTERVAL_MS);
  }

  // ---- Diagnose-hook (ALLEEN dev) — voor de headless verificatie: einde forceren
  // en de muziek-/timer-status uitlezen. Vite snoeit deze tak weg in de productie-
  // build (import.meta.env.DEV is dan false). ----
  if (import.meta.env && import.meta.env.DEV) {
    window.__concert = {
      eindig,
      tikPodium() {
        podiumGetikt({ clientX: window.innerWidth / 2, clientY: window.innerHeight / 2, target: scherm });
      },
      get info() {
        return {
          afgesloten,
          heeftAutoTimer: autoTimer !== 0,
          heeftConfettiTimer: confettiTimer !== 0,
          heeftPoseTimer: poseTimer !== 0,
          beloning: CONCERT_BELONING,
          lied: CONCERT_LIED,
        };
      },
    };
  }

  // ---- De opruim-functie voor de router (lek-vrij bij weg-navigeren) ----
  // Breekt de show direct af ZONDER beloning: muziek stop, alle timers clear, DOM/
  // listeners weg. Idempotent (de afgesloten-vlag + de idempotente stop/clear-
  // helpers maken dubbele aanroep onschadelijk).
  return () => {
    if (afgesloten) return;
    afgesloten = true;
    stopAlles();
  };
}
