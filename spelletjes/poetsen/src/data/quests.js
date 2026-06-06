// Quest-pool — de ENIGE bron van waarheid voor de dagelijkse opdrachten
// (Feature G5). Elke opdracht is metadata + een doel + een munt-beloning; de
// spelstaat (src/state.js) bewaart alléén welke 3 opdrachten vandaag actief zijn
// plus de voortgang/beloond-vlag per opdracht. Naam, emoji, type, doel en
// beloning komen hier vandaan.
//
// `type` koppelt een opdracht aan een gebeurtenis die de bestaande schermen
// melden via meldQuestGebeurtenis(type):
//   "schoonmaak" — een kamer helemaal schoongemaakt (src/screens/clean.js)
//   "dansen"     — een ronde van het dansspel afgerond (src/screens/dansen.js)
//   "koop"       — iets gekocht in de winkel (src/screens/shop.js)
//   "aai"        — het huisdier geaaid (src/ui/huisdier.js)
//   "rommel"     — Mama heeft een kamer vies gemaakt (src/screens/house.js)
//
// `doel` is hoe vaak de gebeurtenis moet gebeuren; `beloning` zijn de munten die
// je bij het ophalen van de voltooide opdracht krijgt (20–40).

export const QUESTS_POOL = [
  {
    id: "poets-drie",
    naam: "Maak 3 kamers schoon",
    emoji: "🧹",
    type: "schoonmaak",
    doel: 3,
    beloning: 30,
  },
  {
    id: "poets-een",
    naam: "Maak 1 kamer schoon",
    emoji: "🧼",
    type: "schoonmaak",
    doel: 1,
    beloning: 20,
  },
  {
    id: "dans-twee",
    naam: "Speel 2 keer het dansspel",
    emoji: "💃",
    type: "dansen",
    doel: 2,
    beloning: 30,
  },
  {
    id: "koop-een",
    naam: "Koop iets in de winkel",
    emoji: "🛒",
    type: "koop",
    doel: 1,
    beloning: 25,
  },
  {
    id: "aai-vijf",
    naam: "Aai je huisdier 5 keer",
    emoji: "🐾",
    type: "aai",
    doel: 5,
    beloning: 25,
  },
  {
    id: "rommel-een",
    naam: "Laat Mama 1 keer een kamer vies maken",
    emoji: "🙈",
    type: "rommel",
    doel: 1,
    beloning: 40,
  },
];

// Snelle opzoek-map id → definitie.
const PER_ID = Object.fromEntries(QUESTS_POOL.map((q) => [q.id, q]));

// Een quest-definitie opzoeken (of undefined als de id onbekend is).
export function questById(id) {
  return PER_ID[id];
}
