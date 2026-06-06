// Styling-catalogus voor Olivia's "Styling Studio" — de ENIGE bron van waarheid
// voor haarkleuren, outfits en accessoires waarmee je Olivia aankleedt. Olivia is
// dol op K-pop, dus naast de gratis basis-looks zijn er kleurige K-pop-haarkleuren,
// glitter-outfits en accessoires die je met munten koopt.
//
// De spelstaat bewaart ALLEEN de keuzes (oliviaLook) + welke betaalde items je
// bezit (gekochteStyling). Naam, prijs, kleuren en de accessoire-SVG komen hier
// vandaan. Dit bestand importeert NIETS van state/olivia (geen import-cyclus):
// olivia.js mág wel uit styling.js importeren.
//
// Coördinaten/kleuren sluiten aan op de Olivia-SVG (viewBox "0 0 120 200", hoofd
// rond cx60 cy56 r25). Accessoires renderen als losse SVG-snippets bovenop het
// hoofd/haar.

// ---- HAAR ----------------------------------------------------------------
// Elk haar-item levert {top, bottom, brauw}: de twee gradient-stops voor de
// oliviaHaar-gradient (top→bottom) en de (donkerder) wenkbrauw-stroke-kleur.
// "donkerblond" is de HUIDIGE/standaard Olivia — exact ongewijzigd t.o.v. vroeger.
const HAAR = [
  { id: "donkerblond", naam: "Donkerblond", categorie: "haar", prijs: 0,
    emoji: "👱‍♀️", top: "#cda66c", bottom: "#b1854a", brauw: "#9c7338" },
  { id: "bruin", naam: "Bruin", categorie: "haar", prijs: 0,
    emoji: "👩", top: "#7a4a25", bottom: "#5a3416", brauw: "#41260f" },
  { id: "zwart", naam: "Zwart", categorie: "haar", prijs: 0,
    emoji: "🖤", top: "#3a3140", bottom: "#211c26", brauw: "#171318" },
  { id: "roze", naam: "Roze", categorie: "haar", prijs: 40,
    emoji: "🌸", top: "#ff9ed6", bottom: "#ff5fb4", brauw: "#d63f93" },
  { id: "paars", naam: "Paars", categorie: "haar", prijs: 40,
    emoji: "💜", top: "#c79bff", bottom: "#9a5cff", brauw: "#6f3ad1" },
  { id: "blauw", naam: "Blauw", categorie: "haar", prijs: 40,
    emoji: "💙", top: "#8fd8ff", bottom: "#3aa0e6", brauw: "#2076b3" },
  // NB: id's moeten UNIEK zijn over de hele catalogus (PER_ID-map), dus de
  // regenboog-haarkleur heet "haarRegenboog" om niet te botsen met de regenboog-
  // OUTFIT. De default-look-id's (donkerblond/neonroze/geen) blijven bewust kort.
  { id: "haarRegenboog", naam: "Regenboog", categorie: "haar", prijs: 80,
    emoji: "🌈", top: "#ff7fb0", bottom: "#62c8ff", brauw: "#9a5cff" },
];

// ---- OUTFIT --------------------------------------------------------------
// Elk outfit-item levert {topTop, topBottom, rokTop, rokBottom}: de gradient-stops
// voor het topje (oliviaTop) en het rokje (oliviaRok). Optioneel mogen accent-
// kleuren mee (stip1/stip2 voor de rok-stippen; ster voor het glitter-sterretje);
// ontbreken die, dan vallen ze terug op de standaardkleuren in olivia.js.
// "neonroze" is de HUIDIGE/standaard outfit — exact ongewijzigd.
const OUTFIT = [
  { id: "neonroze", naam: "Neonroze", categorie: "outfit", prijs: 0, emoji: "💖",
    topTop: "#ff7fd0", topBottom: "#ff4fb0", rokTop: "#62e6ff", rokBottom: "#37c0ff" },
  { id: "sterren", naam: "Sterren", categorie: "outfit", prijs: 30, emoji: "⭐",
    topTop: "#7da8ff", topBottom: "#4f6fe0", rokTop: "#3a4a80", rokBottom: "#27315a",
    stip1: "#ffe066", stip2: "#fff4c2", ster: "#ffe066" },
  { id: "outfitRegenboog", naam: "Regenboog", categorie: "outfit", prijs: 60, emoji: "🌈",
    topTop: "#ff7fb0", topBottom: "#ff5f8f", rokTop: "#7be0a0", rokBottom: "#4fc8ff",
    stip1: "#ffe066", stip2: "#c79bff", ster: "#fff4c2" },
  { id: "goudglitter", naam: "Goud-glitter", categorie: "outfit", prijs: 60, emoji: "✨",
    topTop: "#ffe27a", topBottom: "#f4b400", rokTop: "#fff0b0", rokBottom: "#ffcf3f",
    stip1: "#fff8d8", stip2: "#e09b00", ster: "#fffbe6" },
  { id: "denim", naam: "Denim", categorie: "outfit", prijs: 30, emoji: "👖",
    topTop: "#8fb8e6", topBottom: "#5a86c0", rokTop: "#4f78b0", rokBottom: "#365a8c",
    stip1: "#ffffff", stip2: "#cfe0f4", ster: "#ffffff" },
  { id: "zeemeermin", naam: "Zeemeermin", categorie: "outfit", prijs: 40, emoji: "🧜‍♀️",
    topTop: "#5fe6c8", topBottom: "#2fb8a0", rokTop: "#4fb0ff", rokBottom: "#2f7fd6",
    stip1: "#d8fff4", stip2: "#aee6ff", ster: "#d8fff4" },
  { id: "vuurvlinder", naam: "Vuurvlinder", categorie: "outfit", prijs: 40, emoji: "🦋",
    topTop: "#ff9a4f", topBottom: "#ff5f3a", rokTop: "#ff7a5f", rokBottom: "#e03a2f",
    stip1: "#ffe066", stip2: "#fff4c2", ster: "#ffe066" },
  { id: "pasteldroom", naam: "Pasteldroom", categorie: "outfit", prijs: 30, emoji: "🌷",
    topTop: "#ffd6ec", topBottom: "#ffb3d9", rokTop: "#cfd6ff", rokBottom: "#b0bcff",
    stip1: "#fff4c2", stip2: "#d8fff4", ster: "#ffffff" },
  { id: "discobal", naam: "Discobal", categorie: "outfit", prijs: 60, emoji: "🪩",
    topTop: "#dfe6f0", topBottom: "#9aa8c0", rokTop: "#c79bff", rokBottom: "#8f5cff",
    stip1: "#ffffff", stip2: "#e6d8ff", ster: "#ffffff" },
];

// ---- ACCESSOIRE ----------------------------------------------------------
// Elk accessoire-item levert een `svg`-snippet (string) dat in de Olivia-SVG net
// vóór de afsluitende </svg> wordt ingevoegd (dus bovenop hoofd/haar). Coördinaten
// zijn t.o.v. de viewBox "0 0 120 200" (hoofd rond cx60 cy56 r25, knotjes op
// y≈26). "geen" levert een lege string → geen extra teken.
const ACCESSOIRE = [
  { id: "geen", naam: "Geen", categorie: "accessoire", prijs: 0, emoji: "🚫", svg: "" },

  // Haarstrik bovenop het hoofd (twee lobben + knoop).
  { id: "haarstrik", naam: "Haarstrik", categorie: "accessoire", prijs: 20, emoji: "🎀",
    svg: `
  <g class="olivia-acc-strik">
    <path d="M60 20 C52 12 40 12 40 20 C40 28 52 28 60 20 Z" fill="#ff4fb0"/>
    <path d="M60 20 C68 12 80 12 80 20 C80 28 68 28 60 20 Z" fill="#ff4fb0"/>
    <circle cx="60" cy="20" r="4.5" fill="#ff7fd0"/>
  </g>` },

  // Zonnebril over de ogen (twee glazen + brug).
  { id: "zonnebril", naam: "Zonnebril", categorie: "accessoire", prijs: 30, emoji: "🕶️",
    svg: `
  <g class="olivia-acc-bril">
    <rect x="44" y="50" width="14" height="10" rx="5" fill="#2b3a55"/>
    <rect x="62" y="50" width="14" height="10" rx="5" fill="#2b3a55"/>
    <rect x="57" y="53" width="6" height="3" rx="1.5" fill="#2b3a55"/>
    <rect x="45.5" y="51.5" width="5" height="3" rx="1.5" fill="#6ec8ff" opacity="0.8"/>
    <rect x="63.5" y="51.5" width="5" height="3" rx="1.5" fill="#6ec8ff" opacity="0.8"/>
  </g>` },

  // Koptelefoon: beugel over het hoofd + twee oorschelpen.
  { id: "koptelefoon", naam: "Koptelefoon", categorie: "accessoire", prijs: 40, emoji: "🎧",
    svg: `
  <g class="olivia-acc-koptelefoon">
    <path d="M36 50 C36 22 84 22 84 50" stroke="#2b3a55" stroke-width="6" fill="none" stroke-linecap="round"/>
    <rect x="30" y="48" width="13" height="20" rx="6" fill="#37c0ff"/>
    <rect x="77" y="48" width="13" height="20" rx="6" fill="#37c0ff"/>
    <rect x="33" y="51" width="7" height="14" rx="3.5" fill="#bfeaff"/>
    <rect x="80" y="51" width="7" height="14" rx="3.5" fill="#bfeaff"/>
  </g>` },

  // Kroon bovenop het hoofd (drie punten met juweeltjes).
  { id: "kroon", naam: "Kroon", categorie: "accessoire", prijs: 60, emoji: "👑",
    svg: `
  <g class="olivia-acc-kroon">
    <path d="M44 26 L48 14 L54 22 L60 11 L66 22 L72 14 L76 26 Z" fill="#ffd24a" stroke="#e09b00" stroke-width="1.5" stroke-linejoin="round"/>
    <rect x="44" y="26" width="32" height="5" rx="2" fill="#ffcf3f" stroke="#e09b00" stroke-width="1"/>
    <circle cx="60" cy="20" r="2.4" fill="#ff5fa2"/>
    <circle cx="50" cy="22" r="1.8" fill="#62e6ff"/>
    <circle cx="70" cy="22" r="1.8" fill="#7bd88f"/>
  </g>` },

  // Sterren-haarband: een band over het haar met een ster aan de zijkant.
  { id: "sterhaarband", naam: "Ster-haarband", categorie: "accessoire", prijs: 30, emoji: "🌟",
    svg: `
  <g class="olivia-acc-haarband">
    <path d="M37 38 C45 26 75 26 83 38 C75 31 45 31 37 38 Z" fill="#ff8fb6"/>
    <path d="M82 30 l1.6 3.4 3.7 .4 -2.8 2.5 .8 3.7 -3.3 -1.9 -3.3 1.9 .8 -3.7 -2.8 -2.5 3.7 -.4 Z" fill="#ffe066"/>
  </g>` },
];

// Alle items in één lijst (haar → outfit → accessoire), bron voor het scherm.
export const STYLING = [...HAAR, ...OUTFIT, ...ACCESSOIRE];

// Snelle opzoek-map id → definitie.
const PER_ID = Object.fromEntries(STYLING.map((s) => [s.id, s]));

// Een styling-item opzoeken (of undefined als de id onbekend is).
export function stylingById(id) {
  return PER_ID[id];
}

// Alle items van één categorie ("haar" | "outfit" | "accessoire"), in volgorde.
export function stylingPerCategorie(categorie) {
  return STYLING.filter((s) => s.categorie === categorie);
}

// De prijs van een item (0 als gratis of als de id onbekend is).
export function stylingPrijs(id) {
  return PER_ID[id]?.prijs || 0;
}

// De gratis startset: alle item-ids met prijs 0. Die bezit je vanaf het begin.
export const GRATIS_STYLING = STYLING.filter((s) => s.prijs === 0).map((s) => s.id);

// De standaard-look (de HUIDIGE Olivia): de eerste gratis optie per categorie.
// Bewust hard de "klassieke" Olivia zodat de default-render geen regressie geeft.
export const STANDAARD_LOOK = {
  haar: "donkerblond",
  outfit: "neonroze",
  accessoire: "geen",
};
