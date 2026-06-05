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
};

// Haalt de emoji op bij een art-sleutel; valt veilig terug op een huisje.
export function kamerEmoji(sleutel) {
  return KAMER_EMOJI[sleutel] || "🏠";
}
