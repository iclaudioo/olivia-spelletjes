// Olivia's homepage (Speeltuin): vrolijke kop met Olivia + een rooster met
// spel-tegels. Spellen staan in SPELLETJES; een nieuw spel = één regel erbij.
import { oliviaSVG } from "./art/olivia.js";

const SPELLETJES = [
  { naam: "Poetsen", emoji: "🧹", kleur: "#bfe9ff", url: "/spelletjes/poetsen/", klaar: true },
  { naam: "Binnenkort", emoji: "✨", kleur: "#ffe3f1", klaar: false },
];

function maak(tag, klasse, tekst) {
  const el = document.createElement(tag);
  if (klasse) el.className = klasse;
  if (tekst != null) el.textContent = tekst;
  return el;
}

function render() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  const ambiance = maak("div", "ambiance");
  ambiance.setAttribute("aria-hidden", "true");
  ["✨", "🎵", "💖", "⭐", "🌟", "💕"].forEach((t, i) => {
    const z = maak("span", "zwever", t);
    z.style.left = `${8 + i * 15}%`;
    z.style.animationDuration = `${11 + i * 2}s`;
    z.style.animationDelay = `${-i * 2}s`;
    ambiance.append(z);
  });
  app.append(ambiance);

  const hero = maak("header", "hero");
  const fig = maak("div", "hero-olivia");
  fig.innerHTML = oliviaSVG;
  fig.setAttribute("aria-hidden", "true");
  const titel = maak("h1", "hero-titel", "Olivia's Spelletjes");
  const sub = maak("p", "hero-sub", "Kies een spel om te spelen! ✨");
  hero.append(fig, titel, sub);
  app.append(hero);

  const rooster = maak("div", "rooster");
  for (const spel of SPELLETJES) {
    const tegel = spel.klaar ? maak("a", "tegel") : maak("div", "tegel uit");
    tegel.style.setProperty("--tegel-kleur", spel.kleur);
    if (spel.klaar) {
      tegel.href = spel.url;
      tegel.setAttribute("aria-label", `Speel ${spel.naam}`);
    } else {
      tegel.setAttribute("aria-disabled", "true");
    }
    tegel.append(maak("div", "tegel-emoji", spel.emoji), maak("div", "tegel-naam", spel.naam));
    rooster.append(tegel);
  }
  app.append(rooster);
}

render();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
