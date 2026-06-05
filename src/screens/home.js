// Beginscherm: toont de huizen die je hebt als grote, aantikbare kaarten.
// Een winkel komt later (andere mijlpaal) — hier alleen je eigen huizen.

import { getStaat } from "../state.js";
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

  const huizen = Object.entries(staat.huizen || {})
    .filter(([, huis]) => huis.gekocht)
    .map(([huisId, huis]) => ({ huisId, huis }));

  for (const { huisId, huis } of huizen) {
    const kaart = maak("button", "huis-kaart");
    kaart.append(
      maak("div", "huis-emoji", "🏡"),
      maak("div", "huis-naam", huis.naam),
    );
    kaart.addEventListener("click", () => {
      ontgrendelAudio();
      navigeer("huis", { huisId });
    });
    rooster.append(kaart);
  }

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
