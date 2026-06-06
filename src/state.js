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

const SLEUTEL = "olivia-schoonmaak-v4";

// Verse voortgang voor één kamer.
function nieuweKamer() {
  return { schoonPct: 0, klaar: false, decor: nieuwDecor() };
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

// Een kamer als helemaal schoon markeren.
export function markeerKamerKlaar(huisId, kamerId) {
  const k = getKamerStaat(huisId, kamerId);
  if (!k) return;
  k.schoonPct = 100;
  k.klaar = true;
  bewaren();
}

// Een kamer weer vies maken (voor de "Mama"-feature, herspeelbaarheid). Zet de
// voortgang terug naar vuil (klaar=false, schoonPct=0) zodat de kamer opnieuw
// schoon te maken is. Het DECOR (meubels/behang/vloer) blijft bewust bewaard.
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
