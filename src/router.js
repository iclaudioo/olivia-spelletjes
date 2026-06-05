// Eenvoudige scherm-router. Schermen zijn modules met een functie `toon(app, params)`.
// De router wist #app en roept het juiste scherm aan. Een kleine terug-stack
// onthoudt waar je vandaan kwam, zodat een "terug"-knop terug kan springen.

const schermen = new Map();
const stapel = []; // geschiedenis: [{ naam, params }, ...]

let appEl = null;

function app() {
  if (!appEl) appEl = document.getElementById("app");
  return appEl;
}

// Een scherm aanmelden onder een naam.
export function registreer(naam, toonFunctie) {
  schermen.set(naam, toonFunctie);
}

// Naar een scherm gaan: wist #app en toont het nieuwe scherm.
export function navigeer(naam, params = {}) {
  const toon = schermen.get(naam);
  if (!toon) {
    console.warn(`Onbekend scherm: ${naam}`);
    return;
  }
  stapel.push({ naam, params });
  const el = app();
  el.innerHTML = "";
  toon(el, params);
}

// Terug naar het vorige scherm in de stapel.
export function terug() {
  if (stapel.length <= 1) return; // niets om naar terug te gaan
  stapel.pop(); // het huidige scherm eraf
  const vorige = stapel.pop(); // het vorige scherm (wordt door navigeer weer toegevoegd)
  navigeer(vorige.naam, vorige.params);
}
