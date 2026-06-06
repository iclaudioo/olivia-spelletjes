// Munten-vlieg-helper (Feature G4 "juice"). `vliegMunten({ van, aantal })` laat
// een paar ★-muntjes van een startpunt naar de munten-teller (.munten in de
// topbar) vliegen; bij aankomst "popt" de teller (.coin krijgt kort de bestaande
// `pop`-animatie). Zo voelt elke beloning tastbaar: je ziet je munten letterlijk
// naar de teller toe vliegen.
//
// `van` mag een Element zijn (we nemen het midden van zijn bounding box) of een
// {x, y}-punt in px. Is er geen munten-teller in beeld (geen topbar), dan doen we
// niets schadelijks (geen vlucht, geen crash).
//
// LEK-VRIJ: elke vliegende munt + de gedeelde laag + alle timers worden na afloop
// opgeruimd. De laag heeft pointer-events:none (blokkeert nooit een tik op de
// iPad). Onder prefers-reduced-motion slaan we de vlucht over en poppen we de
// teller meteen (rustig, geen beweging door het scherm).

import { maak } from "./dom.js";

// Hoe lang een munt-vlucht duurt (matcht de CSS-animatie `muntVlieg`).
const VLIEG_MS = 650;
// Maximaal aantal zichtbare vliegende muntjes (te veel oogt rommelig/duurt lang).
const MAX_MUNTEN = 6;

// Of de gebruiker bewegingen wil beperken.
function rustigeBeweging() {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Eén gedeelde, lazily aangemaakte vlieg-laag (boven alles, vangt geen tikken).
let laag = null;
function getLaag() {
  if (laag && document.body.contains(laag)) return laag;
  laag = maak("div", "muntvlieg-laag");
  laag.setAttribute("aria-hidden", "true");
  document.body.append(laag);
  return laag;
}
function ruimLaagOpIndienLeeg() {
  if (laag && laag.childElementCount === 0 && document.body.contains(laag)) {
    laag.remove();
    laag = null;
  }
}

// Bepaal het middelpunt (in px) van een Element of {x,y}-punt.
function puntVan(van) {
  if (van && typeof van.getBoundingClientRect === "function") {
    const r = van.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  if (van && typeof van.x === "number" && typeof van.y === "number") {
    return { x: van.x, y: van.y };
  }
  // Veilige terugval: scherm-midden.
  return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
}

// Laat de munten-teller "poppen" (hergebruikt de bestaande .coin .pop-animatie).
function popTeller(coin) {
  if (!coin) return;
  coin.classList.remove("pop");
  // Reflow forceren zodat de animatie opnieuw start bij snel achter elkaar verdienen.
  void coin.offsetWidth;
  coin.classList.add("pop");
}

// vliegMunten({ van, aantal }) — laat ★-muntjes naar de teller vliegen.
//   van    : Element of {x, y} — het startpunt van de vlucht.
//   aantal : hoeveel muntjes (geklemd tussen 1 en MAX_MUNTEN).
export function vliegMunten({ van, aantal = 3 } = {}) {
  const munten = document.querySelector(".topbar .munten");
  const coin = munten ? munten.querySelector(".coin") : null;

  // Geen teller in beeld → niets te doen (geen vlucht, geen pop).
  if (!munten) return;

  const n = Math.max(1, Math.min(MAX_MUNTEN, Math.round(aantal) || 1));

  // Reduced-motion: geen vlucht door het scherm, alleen de teller meteen poppen.
  if (rustigeBeweging()) {
    popTeller(coin);
    return;
  }

  const start = puntVan(van);
  const doel = puntVan(munten);
  const laagEl = getLaag();

  let resterend = n;
  let popGedaan = false;
  for (let i = 0; i < n; i++) {
    const munt = maak("span", "muntvlieg-munt", "★");
    // Verschuiving die de keyframe gebruikt om naar de teller te bewegen. We
    // spreiden de starts licht uit zodat de muntjes niet exact op elkaar liggen.
    const jitterX = (Math.random() * 2 - 1) * 16;
    const jitterY = (Math.random() * 2 - 1) * 16;
    munt.style.left = `${start.x + jitterX}px`;
    munt.style.top = `${start.y + jitterY}px`;
    munt.style.setProperty("--dx", `${(doel.x - start.x).toFixed(0)}px`);
    munt.style.setProperty("--dy", `${(doel.y - start.y).toFixed(0)}px`);
    munt.style.animationDelay = `${(i * 0.06).toFixed(2)}s`;

    laagEl.append(munt);

    // Bij aankomst van het EERSTE muntje de teller laten poppen; elk muntje ruimt
    // zichzelf op en het laatste ruimt de (lege) laag op.
    const totaleTijd = VLIEG_MS + i * 60;
    const t = setTimeout(() => {
      munt.remove();
      if (!popGedaan) {
        popGedaan = true;
        popTeller(coin);
      }
      resterend--;
      if (resterend <= 0) ruimLaagOpIndienLeeg();
    }, totaleTijd);
    void t;
  }
}
