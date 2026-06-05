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
