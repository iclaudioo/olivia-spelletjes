// Huisdier-catalogus (Feature G3) — de ENIGE bron van waarheid voor de huisdieren
// die Olivia kan adopteren. Elk dier is metadata (naam, emoji, prijs) + een eigen
// platte Toca-Boca-stijl SVG-string (viewBox "0 0 120 120", zelfstandig — geen
// externe resources). De gradient-id's zijn per dier uniek geprefixt (puppy*/
// poes*/konijn*) zodat ze niet botsen met andere SVG's op de pagina.
//
// De spelstaat bewaart ALLEEN bezit (state.huisdieren) + het gekozen dier
// (state.gekozenHuisdier). Naam, emoji, prijs en SVG komen hier vandaan.

export const HUISDIEREN = [
  {
    id: "puppy",
    naam: "Puppy",
    emoji: "🐶",
    prijs: 120,
    svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" class="huisdier-svg" aria-hidden="true">
      <defs>
        <linearGradient id="puppyVacht" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#f3c98a"/>
          <stop offset="1" stop-color="#e0a85f"/>
        </linearGradient>
        <linearGradient id="puppyOor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#b9824a"/>
          <stop offset="1" stop-color="#9c6b39"/>
        </linearGradient>
      </defs>
      <!-- zachte schaduw -->
      <ellipse cx="60" cy="110" rx="30" ry="6" fill="rgba(43,58,85,.16)"/>
      <!-- lijfje -->
      <ellipse cx="60" cy="86" rx="26" ry="22" fill="url(#puppyVacht)"/>
      <!-- pootjes -->
      <rect x="44" y="98" width="12" height="14" rx="6" fill="#e0a85f"/>
      <rect x="64" y="98" width="12" height="14" rx="6" fill="#e0a85f"/>
      <!-- staartje (kwispel) -->
      <path d="M84 84 C96 78 98 66 92 62 C94 72 88 80 80 82 Z" fill="url(#puppyVacht)"/>
      <!-- hoofd -->
      <circle cx="60" cy="50" r="30" fill="url(#puppyVacht)"/>
      <!-- flaporen -->
      <path d="M34 40 C22 38 20 58 28 70 C36 66 38 50 40 44 Z" fill="url(#puppyOor)"/>
      <path d="M86 40 C98 38 100 58 92 70 C84 66 82 50 80 44 Z" fill="url(#puppyOor)"/>
      <!-- lichte snuit -->
      <ellipse cx="60" cy="60" rx="16" ry="13" fill="#fdf0d8"/>
      <!-- ogen -->
      <circle cx="50" cy="46" r="4.4" fill="#3a2a1a"/>
      <circle cx="70" cy="46" r="4.4" fill="#3a2a1a"/>
      <circle cx="51.4" cy="44.4" r="1.4" fill="#fff"/>
      <circle cx="71.4" cy="44.4" r="1.4" fill="#fff"/>
      <!-- neusje -->
      <ellipse cx="60" cy="56" rx="5" ry="4" fill="#3a2a1a"/>
      <!-- blije bek -->
      <path d="M60 60 Q60 68 52 68" stroke="#3a2a1a" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M60 60 Q60 68 68 68" stroke="#3a2a1a" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <!-- tongetje -->
      <path d="M56 67 h8 a4 4 0 0 1 -4 6 a4 4 0 0 1 -4 -6 Z" fill="#ff7d99"/>
      <!-- roze wangetjes -->
      <circle cx="40" cy="56" r="4" fill="#ff9ec2" opacity=".6"/>
      <circle cx="80" cy="56" r="4" fill="#ff9ec2" opacity=".6"/>
    </svg>`,
  },
  {
    id: "poesje",
    naam: "Poesje",
    emoji: "🐱",
    prijs: 120,
    svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" class="huisdier-svg" aria-hidden="true">
      <defs>
        <linearGradient id="poesVacht" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#c9a6e8"/>
          <stop offset="1" stop-color="#a87ddb"/>
        </linearGradient>
        <linearGradient id="poesOor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#b48ee0"/>
          <stop offset="1" stop-color="#9268cf"/>
        </linearGradient>
      </defs>
      <!-- zachte schaduw -->
      <ellipse cx="60" cy="110" rx="30" ry="6" fill="rgba(43,58,85,.16)"/>
      <!-- staart (krul) -->
      <path d="M84 92 C100 92 102 70 90 66 C98 74 90 84 80 84 Z" fill="url(#poesVacht)"/>
      <!-- lijfje (zittend) -->
      <ellipse cx="60" cy="88" rx="24" ry="22" fill="url(#poesVacht)"/>
      <!-- voorpootjes -->
      <rect x="48" y="96" width="10" height="16" rx="5" fill="#a87ddb"/>
      <rect x="62" y="96" width="10" height="16" rx="5" fill="#a87ddb"/>
      <!-- hoofd -->
      <circle cx="60" cy="50" r="28" fill="url(#poesVacht)"/>
      <!-- spitse oren -->
      <path d="M36 30 L34 6 L54 22 Z" fill="url(#poesOor)"/>
      <path d="M84 30 L86 6 L66 22 Z" fill="url(#poesOor)"/>
      <path d="M40 27 L39 14 L49 23 Z" fill="#ffc7e0"/>
      <path d="M80 27 L81 14 L71 23 Z" fill="#ffc7e0"/>
      <!-- ogen (kat: amandel) -->
      <ellipse cx="50" cy="48" rx="4.6" ry="5.6" fill="#3a8f5a"/>
      <ellipse cx="70" cy="48" rx="4.6" ry="5.6" fill="#3a8f5a"/>
      <ellipse cx="50" cy="48" rx="1.6" ry="4.4" fill="#22302a"/>
      <ellipse cx="70" cy="48" rx="1.6" ry="4.4" fill="#22302a"/>
      <circle cx="51.6" cy="45.6" r="1.2" fill="#fff"/>
      <circle cx="71.6" cy="45.6" r="1.2" fill="#fff"/>
      <!-- neusje -->
      <path d="M56 56 h8 l-4 5 Z" fill="#ff7d99"/>
      <!-- mondje -->
      <path d="M60 61 Q60 66 54 66" stroke="#5b3a7a" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M60 61 Q60 66 66 66" stroke="#5b3a7a" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <!-- snorharen -->
      <line x1="36" y1="54" x2="20" y2="50" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>
      <line x1="36" y1="58" x2="20" y2="60" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>
      <line x1="84" y1="54" x2="100" y2="50" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>
      <line x1="84" y1="58" x2="100" y2="60" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>
      <!-- roze wangetjes -->
      <circle cx="42" cy="58" r="4" fill="#ff9ec2" opacity=".55"/>
      <circle cx="78" cy="58" r="4" fill="#ff9ec2" opacity=".55"/>
    </svg>`,
  },
  {
    id: "konijn",
    naam: "Konijn",
    emoji: "🐰",
    prijs: 150,
    svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" class="huisdier-svg" aria-hidden="true">
      <defs>
        <linearGradient id="konijnVacht" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fff6fb"/>
          <stop offset="1" stop-color="#f3d9e8"/>
        </linearGradient>
        <linearGradient id="konijnOor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fbe4f0"/>
          <stop offset="1" stop-color="#efc7dd"/>
        </linearGradient>
      </defs>
      <!-- zachte schaduw -->
      <ellipse cx="60" cy="110" rx="28" ry="6" fill="rgba(43,58,85,.16)"/>
      <!-- staartje (pluizig) -->
      <circle cx="84" cy="92" r="9" fill="#ffffff"/>
      <!-- lijfje -->
      <ellipse cx="60" cy="88" rx="23" ry="21" fill="url(#konijnVacht)"/>
      <!-- voorpootjes -->
      <rect x="49" y="96" width="10" height="16" rx="5" fill="#f3d9e8"/>
      <rect x="61" y="96" width="10" height="16" rx="5" fill="#f3d9e8"/>
      <!-- lange oren -->
      <path d="M48 38 C42 12 44 0 50 0 C56 0 56 20 54 40 Z" fill="url(#konijnOor)"/>
      <path d="M72 38 C78 12 76 0 70 0 C64 0 64 20 66 40 Z" fill="url(#konijnOor)"/>
      <path d="M49 36 C46 16 47 8 50 8 C53 8 52 22 51 38 Z" fill="#ffb6d6"/>
      <path d="M71 36 C74 16 73 8 70 8 C67 8 68 22 69 38 Z" fill="#ffb6d6"/>
      <!-- hoofd -->
      <circle cx="60" cy="54" r="27" fill="url(#konijnVacht)"/>
      <!-- ogen -->
      <circle cx="50" cy="52" r="4.4" fill="#4a2a3a"/>
      <circle cx="70" cy="52" r="4.4" fill="#4a2a3a"/>
      <circle cx="51.4" cy="50.4" r="1.4" fill="#fff"/>
      <circle cx="71.4" cy="50.4" r="1.4" fill="#fff"/>
      <!-- neusje -->
      <path d="M56 60 h8 l-4 4 Z" fill="#ff7d99"/>
      <!-- mondje -->
      <path d="M60 64 Q60 69 55 69" stroke="#a85a78" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M60 64 Q60 69 65 69" stroke="#a85a78" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <!-- voortandjes -->
      <rect x="57" y="67" width="6" height="7" rx="2" fill="#fff"/>
      <line x1="60" y1="67" x2="60" y2="74" stroke="#e3c7d4" stroke-width="1"/>
      <!-- roze wangetjes -->
      <circle cx="42" cy="60" r="4.4" fill="#ff9ec2" opacity=".6"/>
      <circle cx="78" cy="60" r="4.4" fill="#ff9ec2" opacity=".6"/>
    </svg>`,
  },
];

// Snelle opzoek-map id → definitie.
const PER_ID = Object.fromEntries(HUISDIEREN.map((d) => [d.id, d]));

// Een huisdier-definitie opzoeken (of undefined als de id onbekend is).
export function huisdierById(id) {
  return PER_ID[id];
}

// De SVG-string van een huisdier (lege string als de id onbekend is).
export function huisdierSVG(id) {
  return PER_ID[id]?.svg || "";
}

// De prijs van een huisdier (0 als de id onbekend is).
export function huisdierPrijs(id) {
  return PER_ID[id]?.prijs || 0;
}

// Alle huisdier-ids in catalogus-volgorde.
export const HUISDIER_LIJST = HUISDIEREN.map((d) => d.id);
