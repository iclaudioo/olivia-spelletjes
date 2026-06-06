// Liedjes-catalogus voor de dans-minigame v2 — de ENIGE bron van waarheid voor
// de nummers waarop je danst. Olivia is dol op K-pop, dus dit zijn vrolijke,
// kindvriendelijke "K-pop-achtige" deuntjes. Elk lied heeft een eigen tempo
// (bpm) en een eigen melodie, zodat ze duidelijk anders klinken én anders voelen
// (sneller tempo = meer energie + snellere noten in de gameplay).
//
// De spelstaat bewaart ALLEEN scores/voortgang (dansScores, gekeyd op
// `${liedId}:${niveau}`); naam, emoji, kleur, bpm en melodie komen hier vandaan.
//
// `melodie` is een array van toonhoogtes als SCALE-DEGREES (geen Hz): een geheel
// getal is een trap binnen een vrolijke majeur-toonladder (0 = grondtoon, 7 = een
// octaaf hoger), en `null` betekent stilte op die stap. De synth in
// src/audio/muziek.js zet die degrees om naar Hz t.o.v. de grondtoon van het lied.
// Zo blijft de melodie compact, leesbaar en makkelijk te variëren per lied. De
// melodie loopt in stappen van een achtste noot (twee stappen per beat).

// Een vrolijke majeur-toonladder als verhoudingen t.o.v. de grondtoon. Index =
// scale-degree (0..7 = één octaaf), daarboven gaat het door in het volgende
// octaaf (we verdubbelen netjes). Gebruikt door de synth om een degree → Hz om
// te rekenen: hz = grondHz * SCALE_RATIO(degree).
export const MAJEUR_LADDER = [
  1.0, // 0  do
  9 / 8, // 1  re
  5 / 4, // 2  mi
  4 / 3, // 3  fa
  3 / 2, // 4  sol
  5 / 3, // 5  la
  15 / 8, // 6  ti
  2.0, // 7  do (octaaf)
];

// Reken een scale-degree (mag > 7 of < 0) om naar een frequentie-verhouding
// t.o.v. de grondtoon. Octaven worden netjes verdubbeld/gehalveerd, zodat een
// melodie meerdere octaven mag bestrijken.
export function degreeRatio(degree) {
  const len = MAJEUR_LADDER.length - 1; // 7 stappen per octaaf (0..6 + octaaf 7)
  let d = degree;
  let octaaf = 0;
  while (d >= len) {
    d -= len;
    octaaf += 1;
  }
  while (d < 0) {
    d += len;
    octaaf -= 1;
  }
  return MAJEUR_LADDER[d] * Math.pow(2, octaaf);
}

// De liedjes. `grond` is de grond-frequentie (Hz) waar de melodie-degrees vanaf
// gerekend worden — een lager getal = donkerder/voller, hoger = lichter/blijer.
// `melodie` loopt in achtste noten (2 stappen per beat).
export const LIEDJES = [
  {
    id: "sterrendans",
    naam: "Sterrendans",
    emoji: "🌟",
    kleur: "#ffd24a",
    bpm: 100,
    grond: 392.0, // G4 — warm en vrolijk
    melodie: [
      0, null, 2, null, 4, null, 2, null,
      4, null, 5, 4, 2, null, 0, null,
      4, null, 5, null, 7, null, 5, null,
      4, 2, 4, null, 2, null, 0, null,
    ],
  },
  {
    id: "bubbelpop",
    naam: "Bubbelpop",
    emoji: "🫧",
    kleur: "#7ec8ff",
    bpm: 110,
    grond: 440.0, // A4 — luchtig en poppy
    melodie: [
      4, 4, 2, null, 0, null, 2, null,
      4, null, 4, 5, 7, null, 5, null,
      4, 2, 0, null, 2, 4, 2, null,
      0, null, null, 2, 0, null, null, null,
    ],
  },
  {
    id: "neonnacht",
    naam: "Neon Nacht",
    emoji: "🌈",
    kleur: "#b98cff",
    bpm: 120,
    grond: 415.3, // G#4 — net iets neon-roziger
    melodie: [
      0, 2, 4, 2, 5, 4, 2, null,
      7, null, 6, 5, 4, null, 2, null,
      5, 4, 5, 7, 9, null, 7, null,
      5, 4, 2, 4, 0, null, null, null,
    ],
  },
  {
    id: "superster",
    naam: "Superster",
    emoji: "⭐",
    kleur: "#ff5fa2",
    bpm: 132,
    grond: 466.16, // A#4 — fel en energiek
    melodie: [
      0, 4, 7, 4, 2, 4, 0, null,
      4, 7, 9, 7, 5, 4, 2, null,
      7, 5, 4, 2, 0, 2, 4, null,
      7, 9, 7, 4, 0, null, 0, null,
    ],
  },
  {
    id: "glitterbeat",
    naam: "Glitterbeat",
    emoji: "🌠",
    kleur: "#ffb3ec",
    bpm: 116,
    grond: 392.0, // G4 — sprankelend en vrolijk
    melodie: [
      0, null, 2, 4, 5, null, 4, 2,
      7, null, 5, 4, 2, null, 4, null,
      5, 7, 9, null, 7, 5, 4, null,
      2, 4, 5, 4, 0, null, null, null,
    ],
  },
  {
    id: "maandisco",
    naam: "Maandisco",
    emoji: "🌙",
    kleur: "#9ad0ff",
    bpm: 124,
    grond: 440.0, // A4 — koel en dromerig-disco
    melodie: [
      4, null, 2, null, 0, 2, 4, null,
      5, null, 7, 5, 4, 2, 0, null,
      7, 5, 7, 9, 7, null, 5, 4,
      2, 0, 2, 4, 0, null, 0, null,
    ],
  },
  {
    id: "snoephart",
    naam: "Snoephart",
    emoji: "🍬",
    kleur: "#ff8fb6",
    bpm: 138,
    grond: 523.25, // C5 — extra zoet en hoog
    melodie: [
      0, 2, 4, 5, 7, 5, 4, 2,
      4, 5, 7, 9, 7, null, 5, null,
      0, 2, 4, null, 5, 4, 2, 0,
      7, 5, 4, 2, 0, null, null, null,
    ],
  },
];

// Snelle opzoek-map id → definitie.
const PER_ID = Object.fromEntries(LIEDJES.map((l) => [l.id, l]));

// Een lied-definitie opzoeken (of undefined als de id onbekend is).
export function liedById(id) {
  return PER_ID[id];
}

// Het eerste lied (veilige terugval als er een onbekende id binnenkomt).
export const STANDAARD_LIED = LIEDJES[0].id;
