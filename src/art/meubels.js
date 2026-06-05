// Meubel-registry voor het inricht-scherm (M4). Elke meubel is een platte,
// vrolijke Toca-Boca-SVG (viewBox 0 0 120 120, zelfstandig — geen externe defs)
// die als sprite in de kamer geplaatst kan worden. Ook de kleur-paletten voor
// behang (muur) en vloer wonen hier, zodat alle inricht-metadata op één plek staat.

// Registry: sleutel -> { naam, emoji, prijs, svg }. De sleutel is de id die in
// de spelstaat (decor.meubels[].id) bewaard wordt. `prijs` is wat het meubel in
// de winkel kost; prijs 0 = gratis startset die je vanaf het begin bezit.
export const MEUBELS = {
  plant: {
    naam: "Plant",
    emoji: "🪴",
    prijs: 0,
    svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="112" rx="30" ry="6" fill="rgba(43,58,85,.18)"/>
      <path d="M60 70 C60 40 40 30 32 18 C52 24 58 40 60 56 Z" fill="#5fc36a"/>
      <path d="M60 70 C60 36 82 28 90 16 C72 24 64 40 60 56 Z" fill="#4eb35a"/>
      <path d="M60 72 C60 48 60 30 60 16 C66 32 64 52 62 72 Z" fill="#6fd47b"/>
      <path d="M40 70 h40 l-6 38 a6 6 0 0 1 -6 5 h-16 a6 6 0 0 1 -6 -5 Z" fill="#e8854c"/>
      <rect x="38" y="66" width="44" height="12" rx="6" fill="#f4a06a"/>
    </svg>`,
  },
  lamp: {
    naam: "Lamp",
    emoji: "💡",
    prijs: 0,
    svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="112" rx="26" ry="6" fill="rgba(43,58,85,.18)"/>
      <rect x="56" y="46" width="8" height="58" rx="4" fill="#b98a5a"/>
      <rect x="40" y="100" width="40" height="10" rx="5" fill="#a9794a"/>
      <path d="M36 46 L84 46 L74 14 L46 14 Z" fill="#ffd24d"/>
      <path d="M36 46 L84 46 L80 38 L40 38 Z" fill="#ffba2e"/>
      <circle cx="60" cy="50" r="5" fill="#fff4c2"/>
    </svg>`,
  },
  fauteuil: {
    naam: "Fauteuil",
    emoji: "🛋️",
    prijs: 40,
    svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="112" rx="42" ry="7" fill="rgba(43,58,85,.18)"/>
      <rect x="20" y="40" width="80" height="46" rx="16" fill="#ff8fa8"/>
      <rect x="14" y="58" width="22" height="42" rx="11" fill="#ff7d99"/>
      <rect x="84" y="58" width="22" height="42" rx="11" fill="#ff7d99"/>
      <rect x="30" y="62" width="60" height="26" rx="12" fill="#ffd0db"/>
      <rect x="28" y="96" width="12" height="14" rx="4" fill="#c95f76"/>
      <rect x="80" y="96" width="12" height="14" rx="4" fill="#c95f76"/>
    </svg>`,
  },
  tafel: {
    naam: "Tafel",
    emoji: "🪑",
    prijs: 30,
    svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="112" rx="40" ry="6" fill="rgba(43,58,85,.18)"/>
      <rect x="18" y="44" width="84" height="16" rx="8" fill="#d9985a"/>
      <rect x="18" y="40" width="84" height="10" rx="5" fill="#eab277"/>
      <rect x="26" y="58" width="12" height="48" rx="5" fill="#b97f44"/>
      <rect x="82" y="58" width="12" height="48" rx="5" fill="#b97f44"/>
    </svg>`,
  },
  schilderij: {
    naam: "Schilderij",
    emoji: "🖼️",
    prijs: 25,
    svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="18" width="80" height="84" rx="8" fill="#caa05a"/>
      <rect x="28" y="26" width="64" height="68" rx="4" fill="#bfe8ff"/>
      <circle cx="78" cy="42" r="9" fill="#ffd24d"/>
      <path d="M28 84 L52 58 L70 76 L84 64 L92 74 L92 94 L28 94 Z" fill="#7bd08a"/>
      <path d="M28 94 L60 78 L92 94 Z" fill="#5fc36a"/>
    </svg>`,
  },
  kleed: {
    naam: "Kleed",
    emoji: "🟣",
    prijs: 0,
    svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="62" rx="52" ry="34" fill="#9b7be0"/>
      <ellipse cx="60" cy="62" rx="40" ry="26" fill="#b89bf0"/>
      <ellipse cx="60" cy="62" rx="28" ry="18" fill="#d3c2f7"/>
      <ellipse cx="60" cy="62" rx="14" ry="9" fill="#efe6ff"/>
    </svg>`,
  },
  boekenkast: {
    naam: "Boekenkast",
    emoji: "📚",
    prijs: 60,
    svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="114" rx="36" ry="5" fill="rgba(43,58,85,.18)"/>
      <rect x="24" y="12" width="72" height="100" rx="8" fill="#b97f44"/>
      <rect x="32" y="20" width="56" height="26" rx="3" fill="#f3e7d2"/>
      <rect x="32" y="50" width="56" height="26" rx="3" fill="#f3e7d2"/>
      <rect x="32" y="80" width="56" height="24" rx="3" fill="#f3e7d2"/>
      <g>
        <rect x="36" y="22" width="8" height="22" rx="2" fill="#ff7d99"/>
        <rect x="46" y="22" width="8" height="22" rx="2" fill="#5fc36a"/>
        <rect x="56" y="22" width="8" height="22" rx="2" fill="#4eaef0"/>
        <rect x="66" y="22" width="8" height="22" rx="2" fill="#ffd24d"/>
        <rect x="76" y="22" width="8" height="22" rx="2" fill="#9b7be0"/>
        <rect x="36" y="52" width="8" height="22" rx="2" fill="#4eaef0"/>
        <rect x="46" y="52" width="8" height="22" rx="2" fill="#ffd24d"/>
        <rect x="56" y="52" width="8" height="22" rx="2" fill="#ff7d99"/>
        <rect x="66" y="52" width="8" height="22" rx="2" fill="#5fc36a"/>
        <rect x="76" y="52" width="8" height="22" rx="2" fill="#f4a06a"/>
      </g>
    </svg>`,
  },
  tv: {
    naam: "Tv",
    emoji: "📺",
    prijs: 50,
    svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="112" rx="40" ry="6" fill="rgba(43,58,85,.18)"/>
      <rect x="18" y="26" width="84" height="58" rx="12" fill="#3b4a63"/>
      <rect x="26" y="34" width="68" height="42" rx="7" fill="#9be0ff"/>
      <path d="M26 76 L48 50 L62 64 L78 46 L94 64 L94 76 Z" fill="#bff0d2"/>
      <circle cx="80" cy="48" r="6" fill="#fff4c2"/>
      <rect x="44" y="84" width="32" height="8" rx="4" fill="#2b3a55"/>
      <rect x="34" y="92" width="52" height="8" rx="4" fill="#566683"/>
    </svg>`,
  },
  bed: {
    naam: "Bed",
    emoji: "🛏️",
    prijs: 70,
    svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="112" rx="48" ry="6" fill="rgba(43,58,85,.18)"/>
      <rect x="10" y="58" width="100" height="34" rx="10" fill="#b97f44"/>
      <rect x="10" y="40" width="20" height="52" rx="8" fill="#caa05a"/>
      <rect x="16" y="56" width="74" height="24" rx="10" fill="#bfe6ff"/>
      <rect x="20" y="50" width="34" height="20" rx="9" fill="#fff"/>
      <rect x="22" y="52" width="30" height="16" rx="8" fill="#ffe0ea"/>
      <rect x="10" y="86" width="14" height="14" rx="4" fill="#8f5f33"/>
      <rect x="96" y="86" width="14" height="14" rx="4" fill="#8f5f33"/>
    </svg>`,
  },
  kast: {
    naam: "Kast",
    emoji: "🗄️",
    prijs: 55,
    svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="114" rx="34" ry="5" fill="rgba(43,58,85,.18)"/>
      <rect x="28" y="14" width="64" height="98" rx="8" fill="#c98b52"/>
      <rect x="34" y="20" width="25" height="86" rx="4" fill="#e3b07a"/>
      <rect x="61" y="20" width="25" height="86" rx="4" fill="#e3b07a"/>
      <circle cx="55" cy="64" r="4" fill="#7a5230"/>
      <circle cx="65" cy="64" r="4" fill="#7a5230"/>
      <rect x="60" y="14" width="2" height="98" fill="#b97f44"/>
    </svg>`,
  },
  bloemen: {
    naam: "Bloemen",
    emoji: "💐",
    prijs: 20,
    svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="112" rx="26" ry="6" fill="rgba(43,58,85,.18)"/>
      <path d="M60 60 C58 50 52 40 48 32" stroke="#5fc36a" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M60 60 C62 48 70 40 76 34" stroke="#5fc36a" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M60 60 L60 30" stroke="#5fc36a" stroke-width="4" fill="none" stroke-linecap="round"/>
      <circle cx="46" cy="28" r="11" fill="#ff8fa8"/>
      <circle cx="46" cy="28" r="4" fill="#ffd24d"/>
      <circle cx="78" cy="30" r="11" fill="#9b7be0"/>
      <circle cx="78" cy="30" r="4" fill="#ffd24d"/>
      <circle cx="60" cy="22" r="12" fill="#ffba2e"/>
      <circle cx="60" cy="22" r="4" fill="#fff4c2"/>
      <path d="M44 64 h32 l-5 40 a6 6 0 0 1 -6 5 h-10 a6 6 0 0 1 -6 -5 Z" fill="#4eaef0"/>
      <rect x="42" y="60" width="36" height="10" rx="5" fill="#6ec8ff"/>
    </svg>`,
  },
};

// De SVG-string van een meubel ophalen (lege string als de id onbekend is).
export function meubelSVG(id) {
  return MEUBELS[id]?.svg || "";
}

// De prijs van een meubel (0 als gratis of als de id onbekend is).
export function meubelPrijs(id) {
  return MEUBELS[id]?.prijs || 0;
}

// Lijst met alle meubel-sleutels (de volgorde in de palet-balk).
export const MEUBEL_LIJST = Object.keys(MEUBELS);

// De gratis startset: meubel-ids met prijs 0. Deze bezit je vanaf het begin.
export const MEUBEL_GRATIS = MEUBEL_LIJST.filter((id) => MEUBELS[id].prijs === 0);

// Kleur-palet voor het behang (muur).
export const BEHANG_KLEUREN = [
  { id: "roze", kleur: "#ffd9e6" },
  { id: "blauw", kleur: "#cfeaff" },
  { id: "geel", kleur: "#fff1c2" },
  { id: "groen", kleur: "#d6f3d8" },
  { id: "paars", kleur: "#e7dcff" },
];

// Kleur-palet voor de vloer.
export const VLOER_KLEUREN = [
  { id: "hout", kleur: "#e3b07a" },
  { id: "grijs", kleur: "#d8d8de" },
  { id: "warm", kleur: "#f0c89a" },
  { id: "mint", kleur: "#bfe6cf" },
];

// De hex-kleur bij een behang-sleutel (of null als onbekend/leeg).
export function behangKleur(id) {
  return BEHANG_KLEUREN.find((k) => k.id === id)?.kleur || null;
}

// De hex-kleur bij een vloer-sleutel (of null als onbekend/leeg).
export function vloerKleur(id) {
  return VLOER_KLEUREN.find((k) => k.id === id)?.kleur || null;
}
