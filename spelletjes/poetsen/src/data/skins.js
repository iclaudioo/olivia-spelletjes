// Skin-catalogus voor het schoonmaakgerei — de ENIGE bron van waarheid voor de
// uiterlijken. Een skin verandert vooral het accent (de markeerkleur van het
// actieve gereedschap in de toolbar). Optioneel mag een skin per tool een eigen
// emoji opgeven via `tools` (id → emoji); doet hij dat niet, dan blijven de
// standaard-emoji uit clean/tools.js gewoon staan.
//
// De spelstaat bewaart ALLEEN bezit (inventaris.skins) + de gekozen skin
// (gekozenSkin). Naam, emoji, prijs en accent komen hier vandaan.

export const SKINS = [
  {
    id: "standaard",
    naam: "Gewoon",
    emoji: "🧽",
    prijs: 0,
    accent: "#ffd24a", // het huidige geel (--geel)
  },
  {
    id: "goud",
    naam: "Goud",
    emoji: "🌟",
    prijs: 60,
    accent: "#ffcf3f",
  },
  {
    id: "regenboog",
    naam: "Regenboog",
    emoji: "🌈",
    prijs: 90,
    accent: "#ff5fa2",
  },
  {
    id: "ijs",
    naam: "IJsblauw",
    emoji: "❄️",
    prijs: 75,
    accent: "#7ec8ff",
  },
  {
    id: "roze",
    naam: "Roze",
    emoji: "🌸",
    prijs: 75,
    accent: "#ff8fb6",
  },
];

// Snelle opzoek-map id → definitie.
const PER_ID = Object.fromEntries(SKINS.map((s) => [s.id, s]));

// Een skin-definitie opzoeken (of undefined als de id onbekend is).
export function skinById(id) {
  return PER_ID[id];
}

// De prijs van een skin (0 als gratis of als de id onbekend is).
export function skinPrijs(id) {
  return PER_ID[id]?.prijs || 0;
}

// Het accent (hex-kleur) van een skin; valt terug op het standaard-geel.
export function skinAccent(id) {
  return PER_ID[id]?.accent || "#ffd24a";
}

// Alle skin-ids in catalogus-volgorde.
export const SKIN_LIJST = SKINS.map((s) => s.id);

// De gratis startset: skin-ids met prijs 0. Deze bezit je vanaf het begin.
export const GRATIS_SKINS = SKINS.filter((s) => s.prijs === 0).map((s) => s.id);

// De standaard-skin-id (de eerste gratis skin) — gebruikt als veilige terugval.
export const STANDAARD_SKIN = GRATIS_SKINS[0] || "standaard";
