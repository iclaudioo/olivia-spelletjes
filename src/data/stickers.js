// Sticker-catalogus — de ENIGE bron van waarheid voor de stickers in het
// Verzamelboek. Elke sticker is metadata (naam, emoji, beschrijving) + een
// `verdiend(staat)`-predicaat dat over de spelstaat kijkt of de sticker
// verdiend is. De spelstaat bewaart alléén de id's van verdiende stickers
// (in staat.stickers); álle teksten/emoji komen hier vandaan.
//
// Dit bestand importeert ALLEEN uit huizen.js (om de kamers van een huis te
// kunnen opsommen) en NIET uit state.js — zo ontstaat er geen import-cyclus.

import { getHuisDef } from "./huizen.js";
import { GRATIS_SKINS } from "./skins.js";

// ---- Kleine helpers over de staat (defensief: alle velden kunnen ontbreken) ----

// De huis-id's die je in bezit hebt.
function eigenHuisIds(s) {
  const huizen = s?.huizen || {};
  return Object.keys(huizen).filter((id) => huizen[id]?.gekocht === true);
}

// Alle kamer-voortgangs-objecten over álle huizen die je bezit.
function alleEigenKamers(s) {
  const kamers = [];
  for (const huisId of eigenHuisIds(s)) {
    const huisKamers = s.huizen[huisId]?.kamers || {};
    for (const kamerId of Object.keys(huisKamers)) kamers.push(huisKamers[kamerId]);
  }
  return kamers;
}

// Aantal schoongemaakte (klaar) kamers over alle eigen huizen.
function aantalSchoneKamers(s) {
  return alleEigenKamers(s).filter((k) => k?.klaar === true).length;
}

// Zijn ÁLLE kamers van een bepaald huis schoon? Telt de kamers uit de catalogus
// (bron van waarheid) zodat een huis zonder kamers niet per ongeluk "klaar" telt.
function huisHelemaalSchoon(s, huisId) {
  const def = getHuisDef(huisId);
  if (!def || def.kamers.length === 0) return false;
  const huisKamers = s?.huizen?.[huisId]?.kamers || {};
  return def.kamers.every((k) => huisKamers[k.id]?.klaar === true);
}

// Heeft één van de eigen kamers minstens één geplaatst meubel?
function ergensMeubelGeplaatst(s) {
  return alleEigenKamers(s).some((k) => (k?.decor?.meubels?.length || 0) > 0);
}

// Heeft één van de eigen kamers zowel een behang- als een vloer-kleur?
function ergensBehangEnVloer(s) {
  return alleEigenKamers(s).some((k) => !!k?.decor?.behang && !!k?.decor?.vloer);
}

export const STICKERS = [
  {
    id: "eerste-kamer",
    naam: "Eerste kamer schoon!",
    emoji: "🧼",
    beschrijving: "Maak je eerste kamer schoon",
    verdiend: (s) => aantalSchoneKamers(s) >= 1,
  },
  {
    id: "schoon-huis",
    naam: "Een heel huis schoon",
    emoji: "🏠",
    beschrijving: "Maak alle kamers van een huis schoon",
    verdiend: (s) => eigenHuisIds(s).some((id) => huisHelemaalSchoon(s, id)),
  },
  {
    id: "inrichter",
    naam: "Stylist",
    emoji: "🛋️",
    beschrijving: "Zet een meubel neer",
    verdiend: (s) => ergensMeubelGeplaatst(s),
  },
  {
    id: "kleurrijk",
    naam: "Kleurexpert",
    emoji: "🎨",
    beschrijving: "Kies behang én vloer",
    verdiend: (s) => ergensBehangEnVloer(s),
  },
  {
    id: "shopper",
    naam: "Shopper",
    emoji: "🛒",
    beschrijving: "Koop een tweede huis",
    verdiend: (s) => eigenHuisIds(s).length > 1,
  },
  {
    id: "strandganger",
    naam: "Strandganger",
    emoji: "🏖️",
    beschrijving: "Koop het strandhuis",
    verdiend: (s) => s?.huizen?.strandhuis?.gekocht === true,
  },
  {
    id: "ridder",
    naam: "Ridder",
    emoji: "🏰",
    beschrijving: "Koop het kasteel",
    verdiend: (s) => s?.huizen?.kasteel?.gekocht === true,
  },
  {
    id: "astronaut",
    naam: "Astronaut",
    emoji: "🚀",
    beschrijving: "Koop de ruimteraket",
    verdiend: (s) => s?.huizen?.raket?.gekocht === true,
  },
  {
    id: "popster",
    naam: "Popster!",
    emoji: "🎤",
    beschrijving: "Koop de Popster Studio",
    verdiend: (s) => !!s?.huizen?.popster?.gekocht,
  },
  {
    id: "poetskampioen",
    naam: "Poetskampioen",
    emoji: "🏆",
    beschrijving: "Maak 8 kamers schoon",
    verdiend: (s) => aantalSchoneKamers(s) >= 8,
  },
  {
    id: "meubelmaniak",
    naam: "Meubelfan",
    emoji: "📦",
    beschrijving: "Bezit 8 meubels",
    verdiend: (s) => (s?.inventaris?.meubels?.length || 0) >= 8,
  },
  {
    id: "rijk",
    naam: "Spaarpot",
    emoji: "💰",
    beschrijving: "Heb 200 munten",
    verdiend: (s) => (s?.munten || 0) >= 200,
  },
  {
    id: "alles-schoon",
    naam: "Superpoetser",
    emoji: "✨",
    beschrijving: "Maak ALLE kamers van ALLE huizen schoon",
    // Elk huis dat je bezit moet helemaal schoon zijn (en je moet er minstens
    // één bezitten, anders zou een leeg .every() altijd true geven).
    verdiend: (s) => {
      const eigen = eigenHuisIds(s);
      return eigen.length > 0 && eigen.every((id) => huisHelemaalSchoon(s, id));
    },
  },
  {
    id: "fotograaf",
    naam: "Fotograaf",
    emoji: "📸",
    beschrijving: "Maak een foto van je kamer",
    verdiend: (s) => !!s.fotoGemaakt,
  },
  {
    id: "gereedschap-fan",
    naam: "Gereedschap-fan",
    emoji: "🛠️",
    beschrijving: "Koop een nieuw gereedschap-uiterlijk",
    // Verdiend zodra je minstens één NIET-gratis skin bezit.
    verdiend: (s) => (s?.inventaris?.skins?.length || 0) > GRATIS_SKINS.length,
  },
  {
    id: "mama",
    naam: "Mama kwam langs!",
    emoji: "👩",
    beschrijving: "Laat Mama een kamer vies maken",
    verdiend: (s) => !!s?.mamaGeweest,
  },
  {
    id: "dansfeest",
    naam: "Dansfeest!",
    emoji: "💃",
    beschrijving: "Hou een dansfeestje met Mama",
    verdiend: (s) => !!s?.dansGeweest,
  },
  {
    id: "danskampioen",
    naam: "Danskampioen",
    emoji: "🏆",
    beschrijving: "Speel de dans-minigame",
    verdiend: (s) => !!s?.dansGespeeld,
  },
  {
    id: "sterdanser",
    naam: "Sterdanser",
    emoji: "🌟",
    beschrijving: "Haal 3 sterren op een lied",
    // Defensief: een aparte vlag (s.driesterDans) die de dans-minigame zet zodra
    // een ronde 3 sterren oplevert. Geen afgeleide berekening over scores → crash-vrij.
    verdiend: (s) => !!s?.driesterDans,
  },
  {
    id: "fashionista",
    naam: "Fashionista",
    emoji: "💇‍♀️",
    beschrijving: "Geef Olivia een nieuwe look",
    verdiend: (s) => {
      const l = s?.oliviaLook || {};
      return (
        (l.haar && l.haar !== "donkerblond") ||
        (l.outfit && l.outfit !== "neonroze") ||
        (l.accessoire && l.accessoire !== "geen")
      );
    },
  },
];

// Het totaal aantal stickers — handig voor "X / N" tellingen.
export const STICKER_AANTAL = STICKERS.length;

// Een sticker-definitie opzoeken in de catalogus (of undefined).
export function stickerById(id) {
  return STICKERS.find((st) => st.id === id);
}
