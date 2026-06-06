// Per-kamer configuratie: welke vuilsoorten er liggen en welke rommel (emoji)
// rondslingert. Zo heeft elke kamer een andere mix en is er ander gereedschap
// nodig. De vuilsleutels MOETEN overeenkomen met `verwijdert` in tools.js:
//   stof, vlek, modder, aangekoekt, spinnenweb, kruimel

export const KAMER_VUIL = {
  woonkamer: {
    vuil: ["stof", "vlek", "spinnenweb"],
    rommel: ["🧦", "🧸", "📚"],
  },
  keuken: {
    vuil: ["vlek", "aangekoekt", "kruimel"],
    rommel: ["🥤", "🍌", "🥫"],
  },
  badkamer: {
    vuil: ["vlek", "aangekoekt", "spinnenweb"],
    rommel: ["🧴", "🧻", "🦆"],
  },
  slaapkamer: {
    vuil: ["stof", "spinnenweb", "vlek"],
    rommel: ["🧦", "🧸", "👕"],
  },

  // ---- Strandhuis (zand, schelpen, strandspullen) ----
  strandwoonkamer: {
    vuil: ["stof", "modder", "vlek"],
    rommel: ["🐚", "🩴", "🏐"],
  },
  strandkeuken: {
    vuil: ["vlek", "aangekoekt", "kruimel"],
    rommel: ["🍍", "🥥", "🥤"],
  },
  strandslaapkamer: {
    vuil: ["stof", "modder", "spinnenweb"],
    rommel: ["🐚", "🪣", "👙"],
  },

  // ---- Kasteel (stof van eeuwen, spinnenwebben, modder van de ridders) ----
  troonzaal: {
    vuil: ["stof", "spinnenweb", "vlek"],
    rommel: ["👑", "🗝️", "🛡️"],
  },
  kasteelkeuken: {
    vuil: ["aangekoekt", "vlek", "kruimel"],
    rommel: ["🍗", "🥖", "🍷"],
  },
  torenkamer: {
    vuil: ["stof", "spinnenweb", "modder"],
    rommel: ["📜", "🕯️", "🪄"],
  },

  // ---- Ruimteraket (sterrenstof, gemorste smeerolie, drijvende kruimels) ----
  stuurkamer: {
    vuil: ["stof", "vlek", "aangekoekt"],
    rommel: ["🛰️", "🔧", "📡"],
  },
  ruimtekeuken: {
    vuil: ["vlek", "aangekoekt", "kruimel"],
    rommel: ["🥫", "🧃", "🍪"],
  },
  ruimteslaapkamer: {
    vuil: ["stof", "spinnenweb", "vlek"],
    rommel: ["🧦", "🎧", "🚀"],
  },

  // ---- Popster Studio (gemorste drankjes, make-up, glitter en zweet) ----
  podium: {
    vuil: ["stof", "vlek", "kruimel"],
    rommel: ["🎤", "🎧", "🥤"],
  },
  kleedkamer: {
    vuil: ["vlek", "stof", "aangekoekt"],
    rommel: ["💄", "👗", "🧴"],
  },
  oefenstudio: {
    vuil: ["modder", "vlek", "spinnenweb"],
    rommel: ["🩰", "🧴", "💧"],
  },
};

// Veilige standaard als een art-sleutel onbekend is.
const STANDAARD = {
  vuil: ["stof", "vlek", "modder"],
  rommel: ["🧦", "🧸", "📚"],
};

// Haalt de vuil/rommel-config op bij een kamer-art-sleutel.
export function kamerVuil(sleutel) {
  return KAMER_VUIL[sleutel] || STANDAARD;
}
