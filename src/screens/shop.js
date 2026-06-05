// Winkel: koop nieuwe huizen met je gespaarde munten. Toont de huizen uit de
// catalogus die je nog NIET bezit. Kun je het betalen, dan koop je het met de
// "Koop"-knop; anders zie je hoeveel je nog moet sparen.

import { getStaat, bezitHuis, koopHuis } from "../state.js";
import { HUIS_CATALOGUS } from "../data/huizen.js";
import { terug } from "../router.js";
import { maakTopbar } from "../ui/topbar.js";
import { maak, maakHuisKaart } from "../ui/dom.js";
import { muntGeluid, ontgrendelAudio } from "../audio/sfx.js";

// Hoe lang de "Gekocht! ✨"-bevestiging op de kaart blijft staan vóór het
// rooster opnieuw wordt getekend (en het gekochte huis verdwijnt).
const GEKOCHT_FEEST_MS = 900;

export function toon(app, _params = {}) {
  app.innerHTML = "";

  // ---- Topbalk met terug-knop naar het beginscherm ----
  const { el: top, updateMunten } = maakTopbar({
    titel: "🛒 Winkel",
    opTerug: () => terug(),
    toonMunten: true,
  });
  updateMunten(getStaat().munten);

  const scherm = maak("div", "winkel-scherm");
  const rooster = maak("div", "huis-rooster");
  scherm.append(rooster);
  app.append(top, scherm);

  tekenRooster();

  // Tekent (of hertekent) de te-koop-kaarten op basis van de huidige staat.
  function tekenRooster() {
    rooster.innerHTML = "";

    const teKoop = HUIS_CATALOGUS.filter((h) => !bezitHuis(h.id));

    // Alles al in bezit? Vriendelijke melding.
    if (teKoop.length === 0) {
      const leeg = maak("div", "winkel-leeg", "Je hebt alle huizen al! 🎉");
      rooster.append(leeg);
      return;
    }

    for (const huis of teKoop) {
      rooster.append(maakKaart(huis));
    }
  }

  // Eén te-koop-kaart voor een huis.
  function maakKaart(huis) {
    const munten = getStaat().munten;
    const betaalbaar = munten >= huis.prijs;

    const kaart = maakHuisKaart({
      emoji: huis.emoji,
      naam: huis.naam,
      tag: "div",
      extraKlasse: "winkel-kaart-koop",
    });

    const prijsEl = maak("div", "winkel-prijs", `★${huis.prijs}`);
    if (!betaalbaar) prijsEl.classList.add("te-duur");
    kaart.append(prijsEl);

    if (betaalbaar) {
      const knop = maak("button", "knop primair koop-knop", "Koop");
      knop.addEventListener("click", () => kopen(huis, kaart));
      kaart.append(knop);
    } else {
      const tekort = huis.prijs - munten;
      kaart.append(maak("div", "winkel-sparen", `Nog ★${tekort} sparen`));
    }

    return kaart;
  }

  // Een huis kopen: trekt munten af, viert kort, werkt de teller bij en
  // hertekent het rooster (zodat het gekochte huis verdwijnt).
  function kopen(huis, kaart) {
    ontgrendelAudio();
    const gelukt = koopHuis(huis.id);
    if (!gelukt) return;

    muntGeluid();
    updateMunten(getStaat().munten, true);

    // Korte bevestiging op de kaart vóór het hertekenen.
    kaart.classList.add("gekocht");
    kaart.innerHTML = "";
    kaart.append(
      maak("div", "huis-emoji", huis.emoji),
      maak("div", "huis-naam", huis.naam),
      maak("div", "winkel-gekocht", "Gekocht! ✨"),
    );

    setTimeout(tekenRooster, GEKOCHT_FEEST_MS);
  }
}
