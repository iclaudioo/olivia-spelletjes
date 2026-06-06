// Dansfeestje-overlay — een modal boven alles waarin Mama én Olivia samen K-pop
// dansen op een podium met zachte, langzaam bewegende discolichten en zwevende
// hartjes/sterren/muzieknoten. Olivia is gek op K-pop en dansen, dus dit is haar
// momentje samen met Mama.
//
// Gebruik:
//   startDansfeest({ opEinde })  →  toont de overlay, speelt de dansmuziek, en
//   roept opEinde() precies ÉÉN keer aan zodra het feest klaar is (via de
//   "Klaar"-knop, een tik buiten de kaart, of de auto-stop na ~8s). Geeft een
//   opruim-functie terug die het feest direct kan afbreken (bv. bij weg-
//   navigeren) ZONDER opEinde te triggeren — zo lekt er niets.
//
// Toegankelijkheid/fotosensitiviteit: de discolichten bewegen TRAAG en ZACHT
// (geen felle/snelle strobe). Alle bewegingen staan in styles.css en respecteren
// @media (prefers-reduced-motion: reduce): onder reduced-motion staan de
// bewegingen/lichten stil, maar het feest blijft zichtbaar en de Klaar-knop werkt.
//
// Geen leaks: alle timers worden gecleared, de dansmuziek wordt gestopt en de
// overlay wordt uit de DOM verwijderd bij sluiten/afbreken.

import { maak } from "../ui/dom.js";
import { startDansMuziek, stopDansMuziek } from "../audio/muziek.js";
import { mamaSVG as MAMA_SVG } from "../art/mama.js";
import { papaSVG as PAPA_SVG } from "../art/papa.js";
import { oliviaSVG } from "../art/olivia.js";
import { getOliviaLook, getGekozenHuisdier } from "../state.js";
import { huisdierById, huisdierSVG } from "../data/huisdieren.js";

// Hoe lang het feest automatisch duurt voor het vanzelf eindigt (ms).
const FEEST_DUUR_MS = 8000;

// Start het dansfeest. `opEinde` wordt exact één keer aangeroepen wanneer het
// feest normaal eindigt (Klaar-knop / tik buiten / auto-stop). Geeft een
// opruim-functie terug die het feest direct afbreekt zonder opEinde.
export function startDansfeest({ opEinde } = {}) {
  let afgesloten = false;
  let autoTimer = 0;

  // ---- Overlay-structuur ----
  const overlay = maak("div", "dansfeest-overlay");
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Dansfeestje met Mama en Olivia");

  // Zachte, langzaam draaiende discolicht-bundels (puur CSS, traag — géén strobe).
  const lichten = maak("div", "dansfeest-lichten");
  lichten.setAttribute("aria-hidden", "true");
  for (const klas of ["bundel a", "bundel b", "bundel c", "bundel d"]) {
    lichten.append(maak("div", `dansfeest-${klas}`));
  }

  // Zwevende hartjes, sterren en muzieknoten (puur CSS-animatie).
  const zwevers = maak("div", "dansfeest-zwevers");
  zwevers.setAttribute("aria-hidden", "true");
  const emojis = ["💖", "⭐", "🎵", "💖", "🎶", "⭐", "🎵", "💗"];
  emojis.forEach((e, i) => {
    const z = maak("span", `dansfeest-zwever z${i % 8}`, e);
    zwevers.append(z);
  });

  // De kaart met het podium + de twee dansers + titel + knop. We stoppen de
  // bewegende inhoud in een kaart zodat "tik buiten" (op de donkere overlay)
  // het feest sluit, maar tikken OP de dansers/knop niet per ongeluk sluit.
  const kaart = maak("div", "dansfeest-kaart");

  const titel = maak("div", "dansfeest-titel", "🎶 Dansfeestje! 🎶");

  const podium = maak("div", "dansfeest-podium");
  // De twee dansers. We laden de SVG's lui (dynamische import niet nodig — het
  // zijn kleine modules) maar importeren ze gewoon bovenaan zou een cyclus geven
  // met niets; daarom statische import via een losse helper hieronder.
  const mama = maak("div", "dansfeest-danser mama");
  mama.innerHTML = MAMA_SVG;
  const papa = maak("div", "dansfeest-danser papa");
  papa.innerHTML = PAPA_SVG;
  const olivia = maak("div", "dansfeest-danser olivia");
  // Olivia danst in haar GEKOZEN look (Styling Studio).
  olivia.innerHTML = oliviaSVG(getOliviaLook());
  // Namlabels onder de dansers zodat duidelijk is wie wie is.
  const mamaWrap = maak("div", "dansfeest-danser-wrap");
  mamaWrap.append(mama, maak("div", "dansfeest-naam", "Mama"));
  const papaWrap = maak("div", "dansfeest-danser-wrap");
  papaWrap.append(papa, maak("div", "dansfeest-naam", "Papa"));
  const oliviaWrap = maak("div", "dansfeest-danser-wrap");
  oliviaWrap.append(olivia, maak("div", "dansfeest-naam", "Olivia"));
  // Papa danst tussen Mama en Olivia in (de hele familie samen).
  podium.append(mamaWrap, papaWrap, oliviaWrap);

  // Als er een gekozen huisdier is, danst het mee op het podium (niet aaibaar —
  // het danst gewoon). Het zit in de overlay-DOM, dus het verdwijnt automatisch
  // mee met de overlay bij sluiten/afbreken (geen aparte opruim nodig).
  const huisdierId = getGekozenHuisdier();
  if (huisdierId) {
    const def = huisdierById(huisdierId);
    const dier = maak("div", "dansfeest-danser huisdier");
    const svg = huisdierSVG(huisdierId);
    if (svg) {
      dier.innerHTML = svg;
    } else if (def) {
      dier.classList.add("dansfeest-huisdier-emoji");
      dier.textContent = def.emoji;
    }
    const dierWrap = maak("div", "dansfeest-danser-wrap");
    dierWrap.append(dier, maak("div", "dansfeest-naam", def ? def.naam : "Huisdier"));
    podium.append(dierWrap);
  }

  const knop = maak("button", "dansfeest-klaar", "Klaar ✨");
  knop.type = "button";
  knop.setAttribute("aria-label", "Stop het dansfeest");

  kaart.append(titel, podium, knop);
  overlay.append(lichten, zwevers, kaart);

  // ---- Sluiten ----
  // Normaal einde: opruimen + opEinde aanroepen (rommelmaker). `metEinde=true`.
  // Afbreken (weg-navigeren): opruimen ZONDER opEinde. `metEinde=false`.
  function sluit(metEinde) {
    if (afgesloten) return;
    afgesloten = true;
    clearTimeout(autoTimer);
    autoTimer = 0;
    stopDansMuziek();
    overlay.remove();
    if (metEinde && typeof opEinde === "function") opEinde();
  }

  knop.addEventListener("click", () => sluit(true));
  // Tik buiten de kaart (op de donkere overlay) sluit ook — kindvriendelijk.
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) sluit(true);
  });

  // Auto-stop na ~8s.
  autoTimer = setTimeout(() => sluit(true), FEEST_DUUR_MS);

  // ---- Tonen + muziek ----
  document.body.append(overlay);
  startDansMuziek();

  // Opruim-functie voor de aanroeper/router: breekt het feest direct af zonder
  // de rommelmaker te triggeren (geen leaks bij weg-navigeren).
  return () => sluit(false);
}
