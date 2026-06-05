// Spelstaat — wordt bewaard in localStorage zodat de voortgang op de iPad blijft.

const SLEUTEL = "olivia-schoonmaak-v1";

const standaard = {
  munten: 0,
  instellingen: { geluid: true, muziek: false },
  // In latere mijlpalen: huizen[], inventaris{}, stickers[]
  kamers: {
    woonkamer: { schoonPct: 0, klaar: false },
  },
};

let staat = laden();

function laden() {
  try {
    const ruw = localStorage.getItem(SLEUTEL);
    if (!ruw) return structuredClone(standaard);
    const data = JSON.parse(ruw);
    // Samenvoegen met standaard zodat nieuwe velden niet ontbreken.
    return { ...structuredClone(standaard), ...data };
  } catch {
    return structuredClone(standaard);
  }
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

export function markeerKamerKlaar(kamerId) {
  const k = staat.kamers[kamerId];
  if (k) {
    k.schoonPct = 100;
    k.klaar = true;
    bewaren();
  }
}

export function resetAlles() {
  staat = structuredClone(standaard);
  bewaren();
}
