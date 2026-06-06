// Huizen-catalogus — de ENIGE bron van waarheid voor huis- en kamer-metadata
// (naam, emoji, thema, prijs, kamers). De spelstaat bewaart alléén bezit +
// voortgang; metadata wordt hier opgehaald. Zo blijft alles op één plek netjes.

export const HUIS_CATALOGUS = [
  {
    id: "thuis",
    naam: "Mijn Huis",
    emoji: "🏡",
    thema: "standaard",
    prijs: 0,
    startbezit: true, // dit huis heb je vanaf het begin gratis in bezit
    kamers: [
      { id: "woonkamer", naam: "Woonkamer", art: "woonkamer" },
      { id: "keuken", naam: "Keuken", art: "keuken" },
      { id: "badkamer", naam: "Badkamer", art: "badkamer" },
      { id: "slaapkamer", naam: "Slaapkamer", art: "slaapkamer" },
    ],
  },
  {
    id: "strandhuis",
    naam: "Strandhuis",
    emoji: "🏖️",
    thema: "strand",
    prijs: 100,
    kamers: [
      { id: "strandwoonkamer", naam: "Strand-woonkamer", art: "strandwoonkamer" },
      { id: "strandkeuken", naam: "Strand-keuken", art: "strandkeuken" },
      { id: "strandslaapkamer", naam: "Strand-slaapkamer", art: "strandslaapkamer" },
    ],
  },
  {
    id: "kasteel",
    naam: "Kasteel",
    emoji: "🏰",
    thema: "kasteel",
    prijs: 150,
    kamers: [
      { id: "troonzaal", naam: "Troonzaal", art: "troonzaal" },
      { id: "kasteelkeuken", naam: "Kasteel-keuken", art: "kasteelkeuken" },
      { id: "torenkamer", naam: "Torenkamer", art: "torenkamer" },
    ],
  },
  {
    id: "raket",
    naam: "Ruimteraket",
    emoji: "🚀",
    thema: "ruimte",
    prijs: 250,
    kamers: [
      { id: "stuurkamer", naam: "Stuurkamer", art: "stuurkamer" },
      { id: "ruimtekeuken", naam: "Ruimte-keuken", art: "ruimtekeuken" },
      { id: "ruimteslaapkamer", naam: "Ruimte-slaapkamer", art: "ruimteslaapkamer" },
    ],
  },
  {
    id: "popster",
    naam: "Popster Studio",
    emoji: "🎤",
    thema: "popster",
    prijs: 300,
    kamers: [
      { id: "podium", naam: "Podium", art: "podium" },
      { id: "kleedkamer", naam: "Kleedkamer", art: "kleedkamer" },
      { id: "oefenstudio", naam: "Oefenstudio", art: "oefenstudio" },
    ],
  },
];

// Een huis-definitie opzoeken in de catalogus (of undefined).
export function getHuisDef(id) {
  return HUIS_CATALOGUS.find((h) => h.id === id);
}

// Een kamer-definitie binnen een huis opzoeken (of undefined).
export function getKamerDef(huisId, kamerId) {
  const huis = getHuisDef(huisId);
  return huis?.kamers.find((k) => k.id === kamerId);
}
