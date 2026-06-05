// Herbruikbare top-balk: optionele terug-knop, titel, spacer en munten-teller.
// Gebruikt door alle schermen zodat de koptekst overal hetzelfde aanvoelt.

// maakTopbar({ titel, opTerug, toonMunten }) -> { el, updateMunten(waarde) }
//  - titel:      tekst in het midden-links
//  - opTerug:    functie; als die is meegegeven verschijnt een ronde terug-knop
//  - toonMunten: of de munten-teller rechts wordt getoond (standaard: true)
export function maakTopbar({ titel, opTerug, toonMunten = true } = {}) {
  const el = maak("div", "topbar");

  // Ronde terug-knop (alleen als er een terug-actie is).
  if (typeof opTerug === "function") {
    const terugKnop = maak("button", "knop rond terug", "←");
    terugKnop.setAttribute("aria-label", "Terug");
    terugKnop.addEventListener("click", () => opTerug());
    el.append(terugKnop);
  }

  const titelEl = maak("div", "titel", titel || "");
  const spacer = maak("div", "spacer");
  el.append(titelEl, spacer);

  // Munten-teller rechts.
  let waardeEl = null;
  let coinEl = null;
  if (toonMunten) {
    const munten = maak("div", "munten");
    coinEl = maak("span", "coin", "★");
    waardeEl = maak("span", "muntwaarde", "0");
    munten.append(coinEl, waardeEl);
    el.append(munten);
  }

  function updateMunten(waarde, metPop = false) {
    if (!waardeEl) return;
    waardeEl.textContent = waarde;
    if (metPop && coinEl) {
      coinEl.classList.remove("pop");
      // Reflow forceren zodat de animatie opnieuw start.
      void coinEl.offsetWidth;
      coinEl.classList.add("pop");
    }
  }

  return { el, updateMunten };
}

// kleine helper
function maak(tag, klasse, tekst) {
  const e = document.createElement(tag);
  if (klasse) e.className = klasse;
  if (tekst != null) e.textContent = tekst;
  return e;
}
