// Confetti-helper (Feature G4 "juice"). `vuurConfetti(opties)` toont een korte,
// vrolijke confetti-burst: kleurige stukjes die vanaf een oorsprong uitwaaieren,
// omlaag vallen en daarna verdwijnen. Puur DOM/CSS — geen canvas, geen externe
// dependencies. De helper is LEK-VRIJ: alle stukjes-elementen, de laag én alle
// timers worden na afloop opgeruimd (niets blijft in de DOM of als timer hangen).
//
// iPad: de hele laag heeft pointer-events:none, dus confetti blokkeert nooit een
// tik. Onder prefers-reduced-motion tonen we GEEN regen van bewegende stukjes maar
// één zacht ✨-sterretje dat rustig opdoemt en vervaagt (geen veel beweging,
// epilepsie-veilig). De laag staat met een hoge z-index boven de toast-laag (100).

import { maak } from "./dom.js";

// Hoe lang een confetti-stukje valt voordat we het uit de DOM halen (matcht de
// CSS-animatie `confettiVal`). Iets ruimer dan de animatie zodat hij netjes klaar is.
const STUK_MS = 1500;
// Levensduur van het zachte ✨ onder reduced-motion (matcht `confettiZacht`).
const ZACHT_MS = 900;
// De vrolijke confetti-kleuren (sluiten aan op het palet in styles.css).
const KLEUREN = ["#ff8fb6", "#6ec8ff", "#ffd24a", "#7bd88f", "#b98cff", "#ffffff"];

// Of de gebruiker bewegingen wil beperken.
function rustigeBeweging() {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Eén gedeelde, lazily aangemaakte confetti-laag (boven alles). Wordt hergebruikt
// zolang er bursts lopen en verdwijnt vanzelf zodra de laatste burst leeg is.
let laag = null;
function getLaag() {
  if (laag && document.body.contains(laag)) return laag;
  laag = maak("div", "confetti-laag");
  laag.setAttribute("aria-hidden", "true");
  document.body.append(laag);
  return laag;
}
// Ruim de laag op zodra hij leeg is (geen leeg element laten hangen).
function ruimLaagOpIndienLeeg() {
  if (laag && laag.childElementCount === 0 && document.body.contains(laag)) {
    laag.remove();
    laag = null;
  }
}

// vuurConfetti(opties) — een korte confetti-burst.
//   x, y   : oorsprong in px (default: boven-midden van het venster).
//   aantal : aantal stukjes (default 28; onder reduced-motion genegeerd).
// Retourneert niets; de burst ruimt zichzelf volledig op.
export function vuurConfetti({ x, y, aantal = 28 } = {}) {
  const oorsprongX = typeof x === "number" ? x : window.innerWidth / 2;
  const oorsprongY = typeof y === "number" ? y : window.innerHeight * 0.22;

  const laagEl = getLaag();

  // Reduced-motion: geen vallende regen, alleen één zacht ✨ dat opdoemt/vervaagt.
  if (rustigeBeweging()) {
    const ster = maak("span", "confetti-zacht", "✨");
    ster.style.left = `${oorsprongX}px`;
    ster.style.top = `${oorsprongY}px`;
    laagEl.append(ster);
    const t = setTimeout(() => {
      ster.remove();
      ruimLaagOpIndienLeeg();
    }, ZACHT_MS);
    void t;
    return;
  }

  // Bursttimers verzamelen zodat we ze bij een vroege opruim kunnen wissen. Elke
  // timer verwijdert zijn eigen stukje; de laatste ruimt de (lege) laag op.
  let resterend = aantal;
  for (let i = 0; i < aantal; i++) {
    const stuk = maak("span", "confetti-stuk");
    const kleur = KLEUREN[i % KLEUREN.length];
    stuk.style.background = kleur;
    // Sommige stukjes rond maken voor variatie (de helft blijft een vierkantje).
    if (i % 3 === 0) stuk.style.borderRadius = "50%";

    // Spreiding rond de oorsprong: een willekeurige horizontale uitwaaiering en
    // val-afstand via CSS-custom-properties die de keyframe gebruikt.
    const spreidX = (Math.random() * 2 - 1) * Math.min(220, window.innerWidth * 0.4);
    const valY = 160 + Math.random() * 220;
    const draai = `${(Math.random() * 2 - 1) * 540}deg`;
    stuk.style.setProperty("--dx", `${spreidX.toFixed(0)}px`);
    stuk.style.setProperty("--dy", `${valY.toFixed(0)}px`);
    stuk.style.setProperty("--rot", draai);
    stuk.style.left = `${oorsprongX}px`;
    stuk.style.top = `${oorsprongY}px`;
    stuk.style.animationDelay = `${(Math.random() * 0.12).toFixed(2)}s`;

    laagEl.append(stuk);

    const t = setTimeout(() => {
      stuk.remove();
      resterend--;
      if (resterend <= 0) ruimLaagOpIndienLeeg();
    }, STUK_MS);
    void t;
  }
}
