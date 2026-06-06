// Huis-overzicht: toont de kamers van één huis als aantikbare kaarten,
// elk met de schoon-status. Tikken op een kamer opent het schoonmaak-scherm.
// Kamers + metadata komen uit de catalogus; de status uit de staat.
//
// Over het rooster wandelt continu het zingende Mama-figuur (een SVG-zangeres
// met bruin haar en een microfoon). Tik op Mama en ze maakt een willekeurige
// schone kamer weer vies, zodat je hem opnieuw kunt poetsen (en opnieuw munten
// verdient). Het decor van die kamer blijft bewaard. De loop-, flip-, wiebel- en
// muzieknoot-animaties zijn puur CSS (zie styles.css) — er lopen dus geen JS-
// timers/listeners die kunnen lekken na navigeren.

import {
  getStaat,
  getKamerStaat,
  maakKamerVies,
  markeerMama,
} from "../state.js";
import { getHuisDef } from "../data/huizen.js";
import { navigeer, terug } from "../router.js";
import { maakTopbar } from "../ui/topbar.js";
import { maak } from "../ui/dom.js";
import { ontgrendelAudio, mamaGeluid } from "../audio/sfx.js";
import { toonToast, vierVerdiendeStickers } from "../ui/toast.js";
import { kamerEmoji } from "../art/kamers.js";
import { mamaSVG } from "../art/mama.js";

export function toon(app, { huisId } = {}) {
  const staat = getStaat();
  const huisDef = getHuisDef(huisId);
  app.innerHTML = "";

  // ---- Topbalk met terug-knop naar het beginscherm ----
  const { el: top, updateMunten } = maakTopbar({
    titel: huisDef ? huisDef.naam : "Huis",
    opTerug: () => terug(),
    toonMunten: true,
  });
  updateMunten(staat.munten);

  // ---- Scherm + Mama-knop + kamer-rooster ----
  const scherm = maak("div", "huis-scherm");
  const rooster = maak("div", "kamer-rooster");

  // Het rondlopende Mama-figuur alleen tonen als er kamers zijn (dus een geldig,
  // bezeten huis). Mama wandelt continu heen en weer over de breedte van het
  // overzicht; tikken op haar maakt een willekeurige schone kamer weer vies.
  const kamers = huisDef ? huisDef.kamers : [];
  if (kamers.length > 0) {
    scherm.append(maakMamaFiguur(huisId, rooster));
  }

  // Het rooster wordt door tekenRooster gevuld; zo kan roepMama het opnieuw
  // tekenen nadat Mama een kamer vies heeft gemaakt.
  tekenRooster(rooster, huisId);

  scherm.append(rooster);
  app.append(top, scherm);
}

// Bouwt het rondlopende, zingende Mama-figuur. De structuur is met opzet in
// lagen verdeeld zodat de CSS-animaties elkaar niet in de weg zitten:
//   .mama-laan      → vaste, volle-breedte laan (bewegingsgebied)
//     .mama-loper   → translateX heen-en-weer (de wandeling)
//       .mama-flip  → scaleX-flip zodat Mama altijd de loop-richting op kijkt
//         .mama-svg-wrap → zachte op-en-neer "loop"-wiebel + het SVG-figuur
//         .mama-noot*    → zwevende muzieknoten die omhoog faden (puur CSS)
//       .mama-wolkje → af-en-toe "Tik me!"-spraakwolkje (ontdekbaarheid). Zit
//                      BUITEN .mama-flip zodat de hint-tekst nooit gespiegeld
//                      rendert (alleen .mama-loper transleert, flipt nooit).
// Het HELE figuur is één groot, kindvriendelijk tikdoel (roept roepMama aan).
function maakMamaFiguur(huisId, rooster) {
  const laan = maak("div", "mama-laan");

  const loper = maak("button", "mama-loper");
  loper.type = "button";
  loper.setAttribute("aria-label", "Tik op Mama om een kamer vies te maken");

  const flip = maak("div", "mama-flip");

  // Het figuur zelf (op-en-neer wiebel zit op de wrap).
  const svgWrap = maak("div", "mama-svg-wrap");
  svgWrap.innerHTML = mamaSVG;

  // Zwevende muzieknoten vanaf de microfoon — puur CSS-animatie, geen timers.
  const noten = maak("div", "mama-noten");
  noten.setAttribute("aria-hidden", "true");
  for (const [n, klas] of [
    ["🎵", "mama-noot a"],
    ["🎶", "mama-noot b"],
    ["🎵", "mama-noot c"],
  ]) {
    noten.append(maak("span", klas, n));
  }

  // Subtiel, af-en-toe spraakwolkje zodat duidelijk is dat je kunt tikken.
  const wolkje = maak("div", "mama-wolkje", "🎶 Tik me! 🎶");
  wolkje.setAttribute("aria-hidden", "true");

  // De noten mogen mee-flippen (cosmetisch onschuldig), maar het tekstwolkje
  // NIET: het hoort in .mama-loper (alleen translateX, nooit scaleX) zodat de
  // "Tik me!"-hint altijd leesbaar blijft i.p.v. spiegelbeeldig tijdens het
  // naar-rechts-lopen.
  flip.append(svgWrap, noten);
  loper.append(flip, wolkje);
  loper.addEventListener("click", () => roepMama(huisId, rooster));

  laan.append(loper);
  return laan;
}

// (Her)tekent het kamer-rooster op basis van de huidige staat. Geeft per kamer
// een kaart met de juiste status + actie. Schone kamers → inrichten; vuile
// kamers → schoonmaken.
function tekenRooster(rooster, huisId) {
  rooster.innerHTML = "";
  const huisDef = getHuisDef(huisId);
  const kamers = huisDef ? huisDef.kamers : [];

  for (const kamerDef of kamers) {
    const voortgang = getKamerStaat(huisId, kamerDef.id);
    const schoon = voortgang?.klaar === true;
    // Schone kamers krijgen een eigen accent + andere actie-tekst zodat
    // duidelijk is dat je ze kunt inrichten i.p.v. (nog eens) schoonmaken.
    const kaart = maak("button", schoon ? "kamer-kaart schoon" : "kamer-kaart");
    kaart.dataset.kamerId = kamerDef.id;
    kaart.append(
      maak("div", "kamer-emoji", kamerEmoji(kamerDef.art)),
      maak("div", "kamer-naam", kamerDef.naam),
      maak("div", "kamer-status", statusTekst(voortgang)),
      maak("div", "kamer-actie", schoon ? "🛋️ Inrichten" : "🧹 Schoonmaken"),
    );
    kaart.addEventListener("click", () => {
      ontgrendelAudio();
      // Schone kamer → inrichten; nog vuile kamer → schoonmaken.
      if (schoon) {
        navigeer("inrichten", { huisId, kamerId: kamerDef.id });
      } else {
        navigeer("schoonmaak", { huisId, kamerId: kamerDef.id });
      }
    });
    rooster.append(kaart);
  }
}

// Mama roepen: kies een willekeurige SCHONE kamer van dít huis en maak die weer
// vies. Geen schone kamer? Dan een vriendelijke melding en niets destructiefs.
function roepMama(huisId, rooster) {
  ontgrendelAudio();
  const huisDef = getHuisDef(huisId);
  if (!huisDef) return;

  // De schoongemaakte (klaar) kamers van dit huis.
  const schone = huisDef.kamers.filter(
    (k) => getKamerStaat(huisId, k.id)?.klaar === true,
  );

  if (schone.length === 0) {
    toonToast({ emoji: "😄", tekst: "Alles is al lekker vies! Maak eerst schoon." });
    return;
  }

  // Kies er een willekeurige uit en maak die weer vies (decor blijft bewaard).
  const keuze = schone[Math.floor(Math.random() * schone.length)];
  maakKamerVies(huisId, keuze.id);
  markeerMama();

  // Plagerig geluidje + toast met de kamernaam.
  mamaGeluid();
  toonToast({
    emoji: "🙈",
    tekst: `Oei! Mama heeft de ${keuze.naam} weer vies gemaakt!`,
  });

  // Opnieuw tekenen zodat die kamer weer "vuil"/"🧹 Schoonmaken" toont, en de
  // betreffende kaart een korte schud-animatie geven.
  tekenRooster(rooster, huisId);
  const kaart = rooster.querySelector(`[data-kamer-id="${keuze.id}"]`);
  if (kaart) kaart.classList.add("schud");

  // Eventueel verdiende "mama"-sticker toekennen en vieren.
  vierVerdiendeStickers();
}

// Korte status-tekst per kamer (op basis van de voortgang in de staat).
function statusTekst(voortgang) {
  if (!voortgang) return "vuil";
  if (voortgang.klaar) return "✨ schoon";
  if (voortgang.schoonPct > 0) return `${voortgang.schoonPct}% schoon`;
  return "vuil";
}
