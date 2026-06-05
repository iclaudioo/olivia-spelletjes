// Beginscherm: toont de huizen die je hebt als grote, aantikbare kaarten,
// plus een "Winkel"-kaart om nieuwe huizen te kopen. Metadata (naam, emoji)
// komt uit de catalogus; bezit komt uit de staat.

import { getStaat, bezitHuis } from "../state.js";
import { HUIS_CATALOGUS } from "../data/huizen.js";
import { navigeer } from "../router.js";
import { maakTopbar } from "../ui/topbar.js";
import { ontgrendelAudio } from "../audio/sfx.js";

export function toon(app, _params = {}) {
  const staat = getStaat();
  app.innerHTML = "";

  // ---- Topbalk (geen terug-knop op het beginscherm) ----
  const { el: top, updateMunten } = maakTopbar({
    titel: "🏠 Olivia's Huizen",
    toonMunten: true,
  });
  updateMunten(staat.munten);

  // ---- Huizen-rooster ----
  const scherm = maak("div", "home-scherm");
  const rooster = maak("div", "huis-rooster");

  // Eigen huizen uit de catalogus (alleen die je bezit), in catalogus-volgorde.
  const eigenHuizen = HUIS_CATALOGUS.filter((h) => bezitHuis(h.id));

  for (const huis of eigenHuizen) {
    const kaart = maak("button", "huis-kaart");
    kaart.append(
      maak("div", "huis-emoji", huis.emoji),
      maak("div", "huis-naam", huis.naam),
    );
    kaart.addEventListener("click", () => {
      ontgrendelAudio();
      navigeer("huis", { huisId: huis.id });
    });
    rooster.append(kaart);
  }

  // ---- Winkel-kaart ----
  const winkelKaart = maak("button", "huis-kaart winkel-kaart");
  winkelKaart.append(
    maak("div", "huis-emoji", "🛒"),
    maak("div", "huis-naam", "Winkel"),
  );
  winkelKaart.addEventListener("click", () => {
    ontgrendelAudio();
    navigeer("winkel");
  });
  rooster.append(winkelKaart);

  scherm.append(rooster);
  app.append(top, scherm);
}

// kleine helper
function maak(tag, klasse, tekst) {
  const e = document.createElement(tag);
  if (klasse) e.className = klasse;
  if (tekst != null) e.textContent = tekst;
  return e;
}
