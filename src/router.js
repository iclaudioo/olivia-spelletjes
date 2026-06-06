// Eenvoudige scherm-router. Schermen zijn modules met een functie `toon(app, params)`.
// De router wist #app en roept het juiste scherm aan. Een kleine terug-stack
// onthoudt waar je vandaan kwam, zodat een "terug"-knop terug kan springen.
//
// Belangrijk: de router bezit het opruimen per scherm. Een scherm MAG een
// opruim-functie teruggeven; die roepen we aan bij weg-navigeren, zodat
// lopende animatie-lussen en listeners (bv. in het schoonmaak-canvas) niet lekken.

const schermen = new Map();
const stapel = []; // geschiedenis: [{ naam, params }, ...]
let huidigeOpruim = null; // opruim-functie van het actieve scherm

let appEl = null;

function app() {
  if (!appEl) appEl = document.getElementById("app");
  return appEl;
}

// Een scherm aanmelden onder een naam.
export function registreer(naam, toonFunctie) {
  schermen.set(naam, toonFunctie);
}

// Het actieve scherm opruimen (indien nodig), #app wissen en het nieuwe tonen.
function render(entry) {
  if (huidigeOpruim) {
    huidigeOpruim();
    huidigeOpruim = null;
  }
  const toon = schermen.get(entry.naam);
  if (!toon) {
    console.warn(`Onbekend scherm: ${entry.naam}`);
    return;
  }
  const el = app();
  el.innerHTML = "";
  // Een scherm MAG een opruim-functie teruggeven; die roepen we aan bij weg-navigeren.
  huidigeOpruim = toon(el, entry.params) || null;

  // ---- Zachte scherm-overgang (Feature G4) ----
  // Een korte fade/zoom-in bij elk nieuw scherm. We zetten de klasse opnieuw met
  // een geforceerde reflow ertussen, zodat de animatie ook bij hetzelfde scherm
  // (bv. "Nog een keer") opnieuw start. De animatie is eenmalig en kort (~200ms);
  // onder prefers-reduced-motion zet de CSS hem uit. Dit raakt de render-/opruim-
  // logica niet (we manipuleren alleen een klasse op #app).
  el.classList.remove("scherm-in");
  void el.offsetWidth;
  el.classList.add("scherm-in");
}

// Naar een scherm gaan: voegt toe aan de geschiedenis en toont het scherm.
export function navigeer(naam, params = {}) {
  stapel.push({ naam, params });
  render(stapel[stapel.length - 1]);
}

// Terug naar het vorige scherm in de stapel.
export function terug() {
  if (stapel.length <= 1) return; // niets om naar terug te gaan
  stapel.pop();
  render(stapel[stapel.length - 1]);
}

// Vervang het huidige scherm zonder de geschiedenis te laten groeien (bv. "nog een keer").
export function vervang(naam, params = {}) {
  if (stapel.length) stapel.pop();
  navigeer(naam, params);
}
