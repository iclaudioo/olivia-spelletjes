// Schoonmaakgerei. In Mijlpaal 1 maken alle tools schoon (met een eigen "gevoel").
// Het veld `verwijdert` is voorbereiding op gereedschap-matchen in Mijlpaal 2:
// dan haalt elk gereedschap alleen het juiste soort vuil weg.

export const TOOLS = [
  {
    id: "spons",
    emoji: "🧽",
    naam: "Spons",
    straal: 46,        // grootte van de veeg
    zachtheid: 0.7,    // 0 = harde rand, 1 = heel zacht
    verwijdert: ["vlek", "modder"],
  },
  {
    id: "borstel",
    emoji: "🪥",
    naam: "Borstel",
    straal: 34,
    zachtheid: 0.4,
    verwijdert: ["aangekoekt", "vlek"],
  },
  {
    id: "spray",
    emoji: "🧴",
    naam: "Spray",
    straal: 60,
    zachtheid: 1.0,
    verwijdert: ["vlek", "modder", "aangekoekt"],
  },
  {
    id: "bezem",
    emoji: "🧹",
    naam: "Bezem",
    straal: 56,
    zachtheid: 0.6,
    verwijdert: ["stof", "kruimel"],
  },
  {
    id: "plumeau",
    emoji: "🪶",
    naam: "Plumeau",
    straal: 50,
    zachtheid: 0.9,
    verwijdert: ["spinnenweb", "stof"],
  },
];

export function toolById(id) {
  return TOOLS.find((t) => t.id === id) || TOOLS[0];
}
