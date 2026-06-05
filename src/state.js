// Spelstaat — wordt bewaard in localStorage zodat de voortgang op de iPad blijft.

const SLEUTEL = "olivia-schoonmaak-v2";

const standaard = {
  munten: 0,
  instellingen: { geluid: true, muziek: false },
  huizen: {
    thuis: {
      naam: "Mijn Huis",
      thema: "standaard",
      gekocht: true,
      kamers: {
        woonkamer: { naam: "Woonkamer", art: "woonkamer", schoonPct: 0, klaar: false, decor: [] },
        keuken: { naam: "Keuken", art: "keuken", schoonPct: 0, klaar: false, decor: [] },
        badkamer: { naam: "Badkamer", art: "badkamer", schoonPct: 0, klaar: false, decor: [] },
        slaapkamer: { naam: "Slaapkamer", art: "slaapkamer", schoonPct: 0, klaar: false, decor: [] },
      },
    },
  },
  inventaris: { meubels: [], skins: [] },
  stickers: [],
};

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

// Een kamer opzoeken (of undefined als die niet bestaat).
export function getKamer(huisId, kamerId) {
  return staat.huizen?.[huisId]?.kamers?.[kamerId];
}

// Het schoon-percentage van een kamer bijwerken (0–100).
export function setKamerSchoon(huisId, kamerId, pct) {
  const k = getKamer(huisId, kamerId);
  if (!k) return;
  k.schoonPct = Math.max(0, Math.min(100, Math.round(pct)));
  bewaren();
}

// Een kamer als helemaal schoon markeren.
export function markeerKamerKlaar(huisId, kamerId) {
  const k = getKamer(huisId, kamerId);
  if (!k) return;
  k.schoonPct = 100;
  k.klaar = true;
  bewaren();
}

export function resetAlles() {
  staat = structuredClone(standaard);
  bewaren();
}
