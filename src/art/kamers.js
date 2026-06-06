// Centrale kamer-kunst-barrel. Elke kamer heeft een platte Toca-Boca-SVG
// (viewBox 800x600, class "kamer-svg", preserveAspectRatio="xMidYMid slice").
// De thema-SVG's wonen per thema in src/art/themes/*; de woonkamer in ../room.js.
// Dit bestand bundelt ze tot één registry (KAMER_ART / KAMER_EMOJI) en biedt de
// kleine opzoek-helpers (kamerArt / kamerEmoji) met ongewijzigde signatuur, zodat
// bestaande imports gewoon blijven werken.

import { woonkamerSVG } from "./room.js";
import { keukenSVG, badkamerSVG, slaapkamerSVG } from "./themes/standaard.js";
import {
  strandwoonkamerSVG,
  strandkeukenSVG,
  strandslaapkamerSVG,
} from "./themes/strand.js";
import { troonzaalSVG, kasteelkeukenSVG, torenkamerSVG } from "./themes/kasteel.js";
import {
  stuurkamerSVG,
  ruimtekeukenSVG,
  ruimteslaapkamerSVG,
} from "./themes/ruimte.js";
import { podiumSVG, kleedkamerSVG, oefenstudioSVG } from "./themes/popster.js";

// Registry: koppelt een kamer-art-sleutel aan de bijbehorende SVG.
export const KAMER_ART = {
  // standaard (Mijn Huis)
  woonkamer: woonkamerSVG,
  keuken: keukenSVG,
  badkamer: badkamerSVG,
  slaapkamer: slaapkamerSVG,
  // strandhuis
  strandwoonkamer: strandwoonkamerSVG,
  strandkeuken: strandkeukenSVG,
  strandslaapkamer: strandslaapkamerSVG,
  // kasteel
  troonzaal: troonzaalSVG,
  kasteelkeuken: kasteelkeukenSVG,
  torenkamer: torenkamerSVG,
  // ruimteraket
  stuurkamer: stuurkamerSVG,
  ruimtekeuken: ruimtekeukenSVG,
  ruimteslaapkamer: ruimteslaapkamerSVG,
  // popster studio
  podium: podiumSVG,
  kleedkamer: kleedkamerSVG,
  oefenstudio: oefenstudioSVG,
};

// Haalt de SVG op bij een art-sleutel; valt veilig terug op de woonkamer.
export function kamerArt(sleutel) {
  return KAMER_ART[sleutel] || woonkamerSVG;
}

// Een passende emoji per kamer-art-sleutel (zelfde sleutels als KAMER_ART).
export const KAMER_EMOJI = {
  // standaard
  woonkamer: "🛋️",
  keuken: "🍳",
  badkamer: "🛁",
  slaapkamer: "🛏️",
  // strandhuis
  strandwoonkamer: "🏖️",
  strandkeuken: "🍍",
  strandslaapkamer: "🐚",
  // kasteel
  troonzaal: "👑",
  kasteelkeuken: "🍗",
  torenkamer: "🗼",
  // ruimteraket
  stuurkamer: "🛸",
  ruimtekeuken: "🪐",
  ruimteslaapkamer: "🛰️",
  // popster studio
  podium: "🎤",
  kleedkamer: "💄",
  oefenstudio: "🪩",
};

// Haalt de emoji op bij een art-sleutel; valt veilig terug op een huisje.
export function kamerEmoji(sleutel) {
  return KAMER_EMOJI[sleutel] || "🏠";
}

// Per-kamer muur/vloer-grens als fractie 0..1 (de y van de <rect class="vloer">
// gedeeld door de viewBox-hoogte 600). Het inricht-scherm gebruikt dit om de
// behang-tint (muur) en vloer-tint precies op de naad te laten stoppen i.p.v.
// een vaste 62/38-verdeling. Onbekende sleutels vallen terug op 0.62.
//
// Afgeleid uit de SVG's:
//   y=380 → 0.633  (woonkamer, slaapkamer, strandwoonkamer, strandslaapkamer, troonzaal)
//   y=400 → 0.667  (badkamer, kasteelkeuken, torenkamer)
//   y=420 → 0.700  (ruimteslaapkamer)
//   y=430 → 0.717  (keuken, strandkeuken, stuurkamer, ruimtekeuken)
export const VLOER_GRENS = {
  // standaard (Mijn Huis)
  woonkamer: 0.63,
  keuken: 0.7,
  badkamer: 0.67,
  slaapkamer: 0.63,
  // strandhuis
  strandwoonkamer: 0.63,
  strandkeuken: 0.7,
  strandslaapkamer: 0.63,
  // kasteel
  troonzaal: 0.63,
  kasteelkeuken: 0.67,
  torenkamer: 0.67,
  // ruimteraket
  stuurkamer: 0.7,
  ruimtekeuken: 0.7,
  ruimteslaapkamer: 0.7,
  // popster studio (alle drie vloer-rect y=380 → 0.63)
  podium: 0.63,
  kleedkamer: 0.63,
  oefenstudio: 0.63,
};

// Geeft de muur/vloer-grens (0..1) voor een art-sleutel; standaard 0.62.
export function vloerGrens(sleutel) {
  const g = VLOER_GRENS[sleutel];
  return typeof g === "number" ? g : 0.62;
}
