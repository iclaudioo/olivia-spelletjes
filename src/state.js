// Spelstaat — wordt bewaard in localStorage zodat de voortgang op de iPad blijft.
//
// Sinds v3 bewaart de staat ALLEEN bezit + voortgang. Alle metadata (naam, art,
// emoji, thema, prijs, welke kamers) komt uit de catalogus (src/data/huizen.js).
// Vorm:
//   huizen: { [huisId]: { gekocht: bool,
//                         kamers: { [kamerId]: { schoonPct, klaar, decor } } } }
//
// Sinds v4 is `decor` een object i.p.v. een lege array (M4 — inrichten):
//   decor: { meubels: [ { id, x, y } ], behang: null, vloer: null }
//     meubels — geplaatste meubels (id = sleutel uit src/art/meubels.js;
//               x,y = genormaliseerde positie 0..1 binnen de kamer)
//     behang/vloer — gekozen kleur-sleutel (of null = geen tint)
// De sleutel is bewust naar v4 gebumpt omdat de vorm wijzigde; v3 wordt NIET
// veld-voor-veld gemigreerd — een verse v4-standaard is prima.

import { HUIS_CATALOGUS, getHuisDef } from "./data/huizen.js";
import { MEUBEL_GRATIS, meubelPrijs } from "./art/meubels.js";
import { GRATIS_SKINS, STANDAARD_SKIN, skinPrijs } from "./data/skins.js";
import { STICKERS } from "./data/stickers.js";
import {
  GRATIS_STYLING,
  STANDAARD_LOOK,
  stylingById,
  stylingPrijs,
} from "./data/styling.js";

const SLEUTEL = "olivia-schoonmaak-v4";

// Verse voortgang voor één kamer.
//   ooitKlaar — of de kamer OOIT (een keer) helemaal schoon is geweest. Bepaalt
//   de beloning: de allereerste keer levert de volle beloning op, elke latere
//   keer (via "Nog een keer" óf nadat Mama de kamer vies maakte) de kleinere
//   herhaal-beloning. `klaar` zegt alleen iets over de HUIDIGE staat (en wordt
//   door Mama weer op false gezet); `ooitKlaar` blijft daarna staan.
function nieuweKamer() {
  return { schoonPct: 0, klaar: false, ooitKlaar: false, decor: nieuwDecor() };
}

// Verse, lege decor voor één kamer.
function nieuwDecor() {
  return { meubels: [], behang: null, vloer: null };
}

// Bouwt het voortgangs-object voor alle kamers van een huis uit de catalogus,
// zodat staat en catalogus altijd in sync blijven.
function zaaiKamers(huisDef) {
  const kamers = {};
  for (const k of huisDef.kamers) kamers[k.id] = nieuweKamer();
  return kamers;
}

// Standaard-staat: huizen met `startbezit` heb je vanaf het begin in bezit
// (het starthuis "thuis"), de rest koop je in de winkel.
function maakStandaard() {
  const huizen = {};
  for (const huisDef of HUIS_CATALOGUS) {
    if (huisDef.startbezit) {
      huizen[huisDef.id] = { gekocht: true, kamers: zaaiKamers(huisDef) };
    }
  }
  return {
    munten: 0,
    instellingen: { geluid: true, muziek: false },
    huizen,
    // De gratis startset-meubels bezit je vanaf het begin (afgeleid uit de
    // registry's prijs===0 set). De rest koop je in de winkel. Idem voor de
    // gratis gereedschap-skin(s): die bezit je altijd, de rest koop je.
    inventaris: { meubels: [...MEUBEL_GRATIS], skins: [...GRATIS_SKINS] },
    // De gekozen gereedschap-skin (markeerkleur van de toolbar).
    gekozenSkin: STANDAARD_SKIN,
    stickers: [],
    // Of er ooit een foto van een kamer is gemaakt (voor de "fotograaf"-sticker).
    fotoGemaakt: false,
    // Of Mama ooit langs is geweest om een kamer vies te maken (voor de "mama"-
    // sticker). Bestaande v4-saves krijgen dit veld vanzelf via diepSamenvoegen,
    // dus er is GEEN key-bump nodig.
    mamaGeweest: false,
    // Of er ooit een dansfeestje met Mama & Olivia is gehouden (voor de
    // "dansfeest"-sticker). Bestaande v4-saves krijgen dit veld vanzelf via
    // diepSamenvoegen — GEEN key-bump nodig.
    dansGeweest: false,
    // Of de dans-minigame ("Volg de moves!") ooit is gespeeld (voor de
    // "danskampioen"-sticker), plus de hoogste behaalde score. Bestaande
    // v4-saves krijgen deze velden vanzelf via diepSamenvoegen — GEEN key-bump.
    dansGespeeld: false,
    dansTopScore: 0,
    // Dans-minigame v2: beste resultaat per (lied, niveau), gekeyd op
    // `${liedId}:${niveau}` (bv. "sterrendans:gewoon"). Elke entry is een object
    // `{ score, sterren }`: de hoogste behaalde score én het hoogste aantal sterren
    // (0–3) dat ooit op dit lied+niveau is gehaald. We bewaren de ECHT behaalde
    // sterren (de in-ronde-meting) zodat het keuze-scherm exact dezelfde sterren
    // toont als de ronde — geen schatting meer. Vervangt het enkele
    // dansTopScore-getal (dat we voor de bestaande danskampioen-sticker behouden).
    // Bestaande v4-saves krijgen dit lege object vanzelf via diepSamenvoegen —
    // GEEN key-bump nodig. De catalogus (src/data/liedjes.js) is de bron van
    // waarheid voor liedjes; de staat bewaart hier alleen de scores.
    dansScores: {},
    // Of er ooit een ronde met 3 sterren is gehaald (voor de "sterdanser"-
    // sticker). Een aparte, defensieve vlag i.p.v. een afgeleid predicaat zodat
    // de sticker crash-vrij is. Bestaande saves krijgen dit veld via
    // diepSamenvoegen — GEEN key-bump nodig.
    driesterDans: false,
    // Olivia's gekozen look (Styling Studio, Feature G1). Bewaart ALLEEN de
    // keuze-id's per categorie; alle kleuren/SVG komen uit src/data/styling.js.
    // De standaard-look is de KLASSIEKE Olivia (geen visuele regressie).
    // Bestaande v4-saves krijgen dit veld vanzelf via diepSamenvoegen — GEEN
    // key-bump nodig.
    oliviaLook: { ...STANDAARD_LOOK },
    // De gekochte styling-items. De gratis items (prijs 0) bezit je vanaf het
    // begin; betaalde K-pop-looks koop je in de Styling Studio.
    gekochteStyling: [...GRATIS_STYLING],
  };
}

const standaard = maakStandaard();

let staat = laden();

function laden() {
  try {
    const ruw = localStorage.getItem(SLEUTEL);
    if (!ruw) return structuredClone(standaard);
    const data = JSON.parse(ruw);
    // Samenvoegen met standaard zodat nieuwe velden niet ontbreken (migratie-veilig).
    const samengevoegd = diepSamenvoegen(structuredClone(standaard), data);
    zaaiOntbrekendeKamers(samengevoegd);
    return samengevoegd;
  } catch {
    return structuredClone(standaard);
  }
}

// Zorgt dat élk BEZETEN huis voor iedere kamer uit de catalogus een voortgangs-
// entry heeft. Zo blijven later-toegevoegde kamers ook in bestaande saves
// speelbaar (anders zou getKamerStaat undefined geven en de kamer onmaakbaar).
// Migreert tegelijk het nieuwe `ooitKlaar`-veld: een kamer die al `klaar` was
// (uit een oudere save) is per definitie ooit schoon geweest, dus krijgt die
// `ooitKlaar=true`. Zo betaalt een bestaande save bij herhaald poetsen meteen de
// juiste (herhaal-)beloning i.p.v. opnieuw de volle eerste-keer-beloning.
function zaaiOntbrekendeKamers(s) {
  if (!isObject(s.huizen)) return;
  for (const huisId of Object.keys(s.huizen)) {
    const huis = s.huizen[huisId];
    if (!huis || huis.gekocht !== true) continue;
    const def = getHuisDef(huisId);
    if (!def) continue;
    if (!isObject(huis.kamers)) huis.kamers = {};
    for (const k of def.kamers) {
      if (!huis.kamers[k.id]) huis.kamers[k.id] = nieuweKamer();
      const kamer = huis.kamers[k.id];
      // Migratie/invariant: een kamer die NU schoon is (`klaar`), is per definitie
      // ooit schoon geweest. Oudere saves misten `ooitKlaar` (diepSamenvoegen vult
      // die met de standaard `false`), dus leiden we hem hier af uit `klaar`. Voor
      // verse/nieuwe staat is dit een no-op (klaar:false → blijft false).
      if (kamer.klaar === true) kamer.ooitKlaar = true;
    }
  }
}

// Voegt `bron` diep over `doel` heen: bestaande standaard-velden blijven bestaan,
// opgeslagen waarden overschrijven ze. Arrays worden in z'n geheel overgenomen.
function diepSamenvoegen(doel, bron) {
  if (!isObject(doel) || !isObject(bron)) return bron;
  for (const sleutel of Object.keys(bron)) {
    const b = bron[sleutel];
    const d = doel[sleutel];
    if (isObject(b) && isObject(d)) {
      doel[sleutel] = diepSamenvoegen(d, b);
    } else {
      doel[sleutel] = b;
    }
  }
  return doel;
}

function isObject(v) {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

export function bewaren() {
  try {
    localStorage.setItem(SLEUTEL, JSON.stringify(staat));
  } catch {
    /* opslag vol of geblokkeerd — spel werkt verder, alleen niet bewaard */
  }
}

export function getStaat() {
  return staat;
}

export function voegMuntenToe(aantal) {
  staat.munten += aantal;
  bewaren();
  return staat.munten;
}

// ---- Bezit ----

// Of een huis in bezit is.
export function bezitHuis(id) {
  return staat.huizen?.[id]?.gekocht === true;
}

// Een huis kopen: kijkt naar de prijs in de catalogus. Lukt alleen als je het
// nog niet hebt én genoeg munten hebt. Trekt dan munten af, maakt verse
// voortgang aan en bewaart. Geeft true terug bij succes, anders false.
export function koopHuis(id) {
  if (bezitHuis(id)) return false;
  const huisDef = getHuisDef(id);
  if (!huisDef) return false;
  if (staat.munten < huisDef.prijs) return false;

  staat.munten -= huisDef.prijs;
  staat.huizen[id] = { gekocht: true, kamers: zaaiKamers(huisDef) };
  bewaren();
  return true;
}

// ---- Meubel-bezit (inventaris) ----

// Of een meubel beschikbaar is om te plaatsen: gratis meubels (prijs 0) bezit je
// altijd; gekochte meubels staan in inventaris.meubels.
export function bezitMeubel(id) {
  if (meubelPrijs(id) === 0) return true;
  return staat.inventaris?.meubels?.includes(id) === true;
}

// Een meubel kopen: kijkt naar de prijs in de registry. Lukt alleen als je het
// nog niet hebt én genoeg munten hebt. Trekt dan munten af, zet het in de
// inventaris en bewaart. Geeft true terug bij succes, anders false.
export function koopMeubel(id) {
  if (bezitMeubel(id)) return false;
  const prijs = meubelPrijs(id);
  if (staat.munten < prijs) return false;

  staat.munten -= prijs;
  if (!Array.isArray(staat.inventaris.meubels)) staat.inventaris.meubels = [];
  staat.inventaris.meubels.push(id);
  bewaren();
  return true;
}

// ---- Gereedschap-skins (inventaris + gekozen) ----

// Of een skin in bezit is: gratis skins (prijs 0) bezit je altijd; gekochte
// skins staan in inventaris.skins.
export function bezitSkin(id) {
  if (skinPrijs(id) === 0) return true;
  return staat.inventaris?.skins?.includes(id) === true;
}

// Een skin kopen: kijkt naar de prijs in de registry. Lukt alleen als je hem
// nog niet hebt én genoeg munten hebt. Trekt dan munten af, zet hem in de
// inventaris en bewaart. Geeft true terug bij succes, anders false.
export function koopSkin(id) {
  if (bezitSkin(id)) return false;
  const prijs = skinPrijs(id);
  if (staat.munten < prijs) return false;

  staat.munten -= prijs;
  if (!Array.isArray(staat.inventaris.skins)) staat.inventaris.skins = [];
  staat.inventaris.skins.push(id);
  bewaren();
  return true;
}

// Een skin kiezen (alleen als je hem bezit): zet gekozenSkin + bewaart. Geeft
// true terug bij succes, anders false (onbekend of niet in bezit).
export function kiesSkin(id) {
  if (!bezitSkin(id)) return false;
  staat.gekozenSkin = id;
  bewaren();
  return true;
}

// De gekozen skin-id. Valt terug op de standaard-skin als er niets gekozen is,
// of als de gekozen skin niet (meer) in bezit is (corrupte/bewerkte save of een
// uit de catalogus verwijderde skin) — zo tonen we nooit een niet-bezeten skin.
export function getGekozenSkin() {
  const id = staat.gekozenSkin;
  return id && bezitSkin(id) ? id : STANDAARD_SKIN;
}

// ---- Styling Studio (Olivia's look) ----

// De gekozen look { haar, outfit, accessoire }. Valt per categorie veilig terug
// op de standaard-look als een sleutel ontbreekt (corrupte/bewerkte save), zodat
// de Olivia-SVG nooit een onbekende keuze hoeft te tekenen.
export function getOliviaLook() {
  const l = staat.oliviaLook || {};
  return {
    haar: l.haar || STANDAARD_LOOK.haar,
    outfit: l.outfit || STANDAARD_LOOK.outfit,
    accessoire: l.accessoire || STANDAARD_LOOK.accessoire,
  };
}

// Of een styling-item beschikbaar is: gratis items (prijs 0) bezit je altijd;
// gekochte items staan in gekochteStyling.
export function bezitStyling(id) {
  if (stylingPrijs(id) === 0) return true;
  return staat.gekochteStyling?.includes(id) === true;
}

// Een look-keuze aantrekken (alleen als je het item bezit én het bij de gegeven
// categorie hoort). Zet de juiste look-sleutel + bewaart. Geeft true bij succes,
// anders false (onbekend item, verkeerde categorie of niet in bezit).
export function setOliviaLook(categorie, id) {
  const def = stylingById(id);
  if (!def || def.categorie !== categorie) return false;
  if (!bezitStyling(id)) return false;
  if (!isObject(staat.oliviaLook)) staat.oliviaLook = { ...STANDAARD_LOOK };
  staat.oliviaLook[categorie] = id;
  bewaren();
  return true;
}

// Een styling-item kopen: kijkt naar de prijs in de catalogus. Lukt alleen als je
// het nog niet hebt én genoeg munten hebt. Trekt dan munten af, zet het in
// gekochteStyling en bewaart. Geeft true terug bij succes, anders false.
export function koopStyling(id) {
  if (bezitStyling(id)) return false;
  const prijs = stylingPrijs(id);
  if (staat.munten < prijs) return false;

  staat.munten -= prijs;
  if (!Array.isArray(staat.gekochteStyling)) staat.gekochteStyling = [];
  staat.gekochteStyling.push(id);
  bewaren();
  return true;
}

// ---- Kamer-voortgang ----

// De voortgang van een kamer opzoeken (of undefined als die niet bestaat).
export function getKamerStaat(huisId, kamerId) {
  return staat.huizen?.[huisId]?.kamers?.[kamerId];
}

// Het schoon-percentage van een kamer bijwerken (0–100).
export function setKamerSchoon(huisId, kamerId, pct) {
  const k = getKamerStaat(huisId, kamerId);
  if (!k) return;
  k.schoonPct = Math.max(0, Math.min(100, Math.round(pct)));
  bewaren();
}

// Een kamer als helemaal schoon markeren. Naast de huidige `klaar`-vlag zetten
// we ook `ooitKlaar` (blijft daarna voorgoed true), zodat de beloning bij latere
// poetsbeurten klopt — ook nadat Mama de kamer weer vies heeft gemaakt.
export function markeerKamerKlaar(huisId, kamerId) {
  const k = getKamerStaat(huisId, kamerId);
  if (!k) return;
  k.schoonPct = 100;
  k.klaar = true;
  k.ooitKlaar = true;
  bewaren();
}

// Een kamer weer vies maken (voor de "Mama"-feature, herspeelbaarheid). Zet de
// voortgang terug naar vuil (klaar=false, schoonPct=0) zodat de kamer opnieuw
// schoon te maken is. Het DECOR (meubels/behang/vloer) blijft bewust bewaard, en
// `ooitKlaar` blijft true — zo levert de volgende poetsbeurt de herhaal-beloning
// op (niet opnieuw de volle eerste-keer-beloning).
// Geeft true terug als de kamer bestond (en is aangepast), anders false.
export function maakKamerVies(huisId, kamerId) {
  const k = getKamerStaat(huisId, kamerId);
  if (!k) return false;
  k.klaar = false;
  k.schoonPct = 0;
  bewaren();
  return true;
}

// Markeert dat Mama langs is geweest (ontgrendelt de "mama"-sticker). Idempotent:
// nogmaals aanroepen verandert niets.
export function markeerMama() {
  if (staat.mamaGeweest === true) return;
  staat.mamaGeweest = true;
  bewaren();
}

// Markeert dat er een dansfeestje is gehouden (ontgrendelt de "dansfeest"-
// sticker). Idempotent: nogmaals aanroepen verandert niets.
export function markeerDans() {
  if (staat.dansGeweest === true) return;
  staat.dansGeweest = true;
  bewaren();
}

// Markeert dat de dans-minigame is gespeeld (ontgrendelt de "danskampioen"-
// sticker) en werkt de topscore bij (alleen omhoog). Bewaart altijd.
export function markeerDansGespeeld(score) {
  staat.dansGespeeld = true;
  const huidig = staat.dansTopScore || 0;
  const nieuw = Number.isFinite(score) ? score : 0;
  if (nieuw > huidig) staat.dansTopScore = nieuw;
  bewaren();
}

// De hoogste dans-minigame-score (of 0 als er nog niet is gespeeld). Behouden
// voor terugwaartse compatibiliteit; v2 gebruikt getDansScore(lied, niveau).
export function getDansTopScore() {
  return staat.dansTopScore || 0;
}

// ---- Dans-minigame v2: scores per (lied, niveau) ----

// Bouwt de samengestelde sleutel `${liedId}:${niveau}` (defensief: lege strings
// als er iets ontbreekt, zodat we nooit "undefined:undefined" krijgen).
function dansSleutel(liedId, niveau) {
  return `${liedId || ""}:${niveau || ""}`;
}

// Het beste resultaat voor een lied+niveau als `{ score, sterren }` (of
// `{ score: 0, sterren: 0 }` als er nog niet op is gespeeld). Defensief: een oude/
// vreemde bare-number-waarde wordt als `{ score: dat, sterren: 0 }` behandeld zodat
// een raar gevormde save het keuze-scherm nooit breekt.
export function getDansScore(liedId, niveau) {
  const scores = staat.dansScores;
  if (!isObject(scores)) return { score: 0, sterren: 0 };
  const w = scores[dansSleutel(liedId, niveau)];
  if (Number.isFinite(w)) return { score: w, sterren: 0 }; // oude bare-number-vorm
  if (!isObject(w)) return { score: 0, sterren: 0 };
  const score = Number.isFinite(w.score) ? w.score : 0;
  const sterren = Number.isFinite(w.sterren) ? Math.max(0, Math.min(3, w.sterren)) : 0;
  return { score, sterren };
}

// Een nieuw resultaat (score + behaalde sterren) voor lied+niveau bewaren. Score
// én sterren gaan elk ALLEEN omhoog (we houden de hoogste score ooit én de hoogste
// sterren ooit, ook als die in verschillende rondes zijn behaald). Werkt tegelijk de
// algemene topscore + de "gespeeld"-vlag bij (voor de danskampioen-sticker), en
// geeft het (mogelijk bijgewerkte) beste resultaat `{ score, sterren }` terug.
export function markeerDansScore(liedId, niveau, score, sterren) {
  if (!isObject(staat.dansScores)) staat.dansScores = {};
  const sleutel = dansSleutel(liedId, niveau);
  // Bestaande entry defensief uitlezen (object, oude bare-number, of niets).
  const vorig = getDansScore(liedId, niveau);
  const nieuwScore = Number.isFinite(score) ? score : 0;
  const nieuwSterren = Number.isFinite(sterren) ? Math.max(0, Math.min(3, sterren)) : 0;
  const beste = {
    score: Math.max(vorig.score, nieuwScore),
    sterren: Math.max(vorig.sterren, nieuwSterren),
  };
  staat.dansScores[sleutel] = beste;
  // Algemene "gespeeld"-vlag + topscore bijwerken (voor de bestaande sticker).
  staat.dansGespeeld = true;
  const topNu = staat.dansTopScore || 0;
  if (nieuwScore > topNu) staat.dansTopScore = nieuwScore;
  bewaren();
  return beste;
}

// Markeert dat er ooit een ronde met 3 sterren is gehaald (ontgrendelt de
// "sterdanser"-sticker). Idempotent: nogmaals aanroepen verandert niets.
export function markeerDriesterDans() {
  if (staat.driesterDans === true) return;
  staat.driesterDans = true;
  bewaren();
}

// ---- Inrichten (decor) ----

// De hele decor van een kamer overschrijven en bewaren. Het inricht-scherm
// beheert de decor lokaal en geeft het hele object door bij elke wijziging.
export function setKamerDecor(huisId, kamerId, decor) {
  const k = getKamerStaat(huisId, kamerId);
  if (!k) return;
  k.decor = decor;
  bewaren();
}

// ---- Foto (inricht-scherm) ----

// Markeert dat er een foto van een kamer is gemaakt en bewaart. Dit ontgrendelt
// de "fotograaf"-sticker. Idempotent: nogmaals fotograferen verandert niets.
export function markeerFotoGemaakt() {
  if (staat.fotoGemaakt === true) return;
  staat.fotoGemaakt = true;
  bewaren();
}

// ---- Stickers (Verzamelboek) ----

// Of een sticker al verdiend (en bewaard) is.
export function heeftSticker(id) {
  return Array.isArray(staat.stickers) && staat.stickers.includes(id);
}

// Evalueert élke sticker uit de catalogus tegen de huidige staat en voegt de
// nieuw-verdiende id's toe aan staat.stickers (gededupliceerd). Bewaart als er
// iets bijkwam en geeft de array van NIEUW verdiende id's terug, zodat de
// aanroeper ze kan vieren (toast). Niets nieuw → lege array, geen save.
export function verdienStickers() {
  if (!Array.isArray(staat.stickers)) staat.stickers = [];
  const nieuw = [];
  for (const st of STICKERS) {
    if (staat.stickers.includes(st.id)) continue; // al verdiend → niet dubbel
    let verdiend = false;
    try {
      verdiend = !!st.verdiend(staat);
    } catch {
      verdiend = false; // een kapot predicaat mag het spel nooit breken
    }
    if (verdiend) {
      staat.stickers.push(st.id);
      nieuw.push(st.id);
    }
  }
  if (nieuw.length) bewaren();
  return nieuw;
}

export function resetAlles() {
  staat = structuredClone(standaard);
  bewaren();
}
