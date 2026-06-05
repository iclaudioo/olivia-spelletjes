// Huis-overzicht: toont de kamers van één huis als aantikbare kaarten,
// elk met de schoon-status. Tikken op een kamer opent het schoonmaak-scherm.
// Kamers + metadata komen uit de catalogus; de status uit de staat.

import { getStaat, getKamerStaat } from "../state.js";
import { getHuisDef } from "../data/huizen.js";
import { navigeer, terug } from "../router.js";
import { maakTopbar } from "../ui/topbar.js";
import { maak } from "../ui/dom.js";
import { ontgrendelAudio } from "../audio/sfx.js";
import { kamerEmoji } from "../art/kamers.js";

export function toon(app, { huisId } = {}) {
  const staat = getStaat();
  const huisDef = getHuisDef(huisId);
  app.innerHTML = "";

  // ---- Topbalk met terug-knop naar het beginscherm ----
  const { el: top, updateMunten } = maakTopbar({
    titel: huisDef ? huisDef.naam : "Huis",
    opTerug: () => terug(),
    toonMunten: true,
  });
  updateMunten(staat.munten);

  // ---- Kamer-rooster ----
  const scherm = maak("div", "huis-scherm");
  const rooster = maak("div", "kamer-rooster");

  const kamers = huisDef ? huisDef.kamers : [];

  for (const kamerDef of kamers) {
    const voortgang = getKamerStaat(huisId, kamerDef.id);
    const kaart = maak("button", "kamer-kaart");
    kaart.append(
      maak("div", "kamer-emoji", kamerEmoji(kamerDef.art)),
      maak("div", "kamer-naam", kamerDef.naam),
      maak("div", "kamer-status", statusTekst(voortgang)),
    );
    kaart.addEventListener("click", () => {
      ontgrendelAudio();
      navigeer("schoonmaak", { huisId, kamerId: kamerDef.id });
    });
    rooster.append(kaart);
  }

  scherm.append(rooster);
  app.append(top, scherm);
}

// Korte status-tekst per kamer (op basis van de voortgang in de staat).
function statusTekst(voortgang) {
  if (!voortgang) return "vuil";
  if (voortgang.klaar) return "✨ schoon";
  if (voortgang.schoonPct > 0) return `${voortgang.schoonPct}% schoon`;
  return "vuil";
}
