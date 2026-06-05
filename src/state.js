// Spelstaat — wordt bewaard in localStorage zodat de voortgang op de iPad blijft.
//
// Sinds v3 bewaart de staat ALLEEN bezit + voortgang. Alle metadata (naam, art,
// emoji, thema, prijs, welke kamers) komt uit de catalogus (src/data/huizen.js).
// Vorm:
//   huizen: { [huisId]: { gekocht: bool,
//                         kamers: { [kamerId]: { schoonPct, klaar, decor } } } }

import { HUIS_CATALOGUS, getHuisDef } from "./data/huizen.js";

const SLEUTEL = "olivia-schoonmaak-v3";

// Verse voortgang voor één kamer.
function nieuweKamer() {
  return { schoonPct: 0, klaar: false, decor: [] };
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
    inventaris: { meubels: [], skins: [] },
    stickers: [],
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
    return diepSamenvoegen(structuredClone(standaard), data);
  } catch {
    return structuredClone(standaard);
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

export function resetAlles() {
  staat = structuredClone(standaard);
  bewaren();
}
