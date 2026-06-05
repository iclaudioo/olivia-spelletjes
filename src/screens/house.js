// Huis-overzicht: toont de kamers van één huis als aantikbare kaarten,
// elk met de schoon-status. Tikken op een kamer opent het schoonmaak-scherm.

import { getStaat } from "../state.js";
import { navigeer, terug } from "../router.js";
import { maakTopbar } from "../ui/topbar.js";
import { ontgrendelAudio } from "../audio/sfx.js";
import { kamerEmoji } from "../art/kamers.js";

export function toon(app, { huisId } = {}) {
  const staat = getStaat();
  const huis = staat.huizen?.[huisId];
  app.innerHTML = "";

  // ---- Topbalk met terug-knop naar het beginscherm ----
  const { el: top, updateMunten } = maakTopbar({
    titel: huis ? huis.naam : "Huis",
    opTerug: () => terug(),
    toonMunten: true,
  });
  updateMunten(staat.munten);

  // ---- Kamer-rooster ----
  const scherm = maak("div", "huis-scherm");
  const rooster = maak("div", "kamer-rooster");

  const kamers = huis ? Object.entries(huis.kamers || {}) : [];

  for (const [kamerId, kamer] of kamers) {
    const kaart = maak("button", "kamer-kaart");
    kaart.append(
      maak("div", "kamer-emoji", kamerEmoji(kamer.art)),
      maak("div", "kamer-naam", kamer.naam),
      maak("div", "kamer-status", statusTekst(kamer)),
    );
    kaart.addEventListener("click", () => {
      ontgrendelAudio();
      navigeer("schoonmaak", { huisId, kamerId });
    });
    rooster.append(kaart);
  }

  scherm.append(rooster);
  app.append(top, scherm);
}

// Korte status-tekst per kamer.
function statusTekst(kamer) {
  if (kamer.klaar) return "✨ schoon";
  if (kamer.schoonPct > 0) return `${kamer.schoonPct}% schoon`;
  return "vuil";
}

// kleine helper
function maak(tag, klasse, tekst) {
  const e = document.createElement(tag);
  if (klasse) e.className = klasse;
  if (tekst != null) e.textContent = tekst;
  return e;
}
