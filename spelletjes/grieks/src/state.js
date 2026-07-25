// Voortgang van het Grieks-spel, bewaard op de iPad (localStorage).
// sterren: totaal verdiende sterren over alle quizzen.
// geschreven: welke letters al netjes met de vinger geschreven zijn.
// groepGoed: aantal goede quizantwoorden per woordgroep (medaille bij 10).
// memoryKlaar: welke woordgroepen al eens volledig in memory gelegd zijn.
// oefenrondeLaatst/oefenrondes: dagelijkse oefenronde bijhouden.

const SLEUTEL = "olivia-grieks";
const OUD_STERREN = "olivia-grieks-sterren";

const START = {
  sterren: 0,
  geschreven: {},
  groepGoed: {},
  memoryKlaar: {},
  oefenrondeLaatst: "",
  oefenrondes: 0,
};

function laad() {
  let data = {};
  try { data = JSON.parse(localStorage.getItem(SLEUTEL)) || {}; } catch { /* privémodus */ }
  const s = { ...START, ...data };
  // Migratie: sterren van de eerste versie meenemen.
  try {
    const oud = parseInt(localStorage.getItem(OUD_STERREN), 10);
    if (oud > s.sterren) s.sterren = oud;
    localStorage.removeItem(OUD_STERREN);
  } catch { /* privémodus */ }
  return s;
}

export const state = laad();

export function bewaar() {
  try { localStorage.setItem(SLEUTEL, JSON.stringify(state)); } catch { /* privémodus */ }
}

export function vandaag() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
