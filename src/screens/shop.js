// Winkel: koop nieuwe huizen én meubels met je gespaarde munten. Toont de huizen
// uit de catalogus die je nog NIET bezit en de meubels die je nog niet hebt.
// Kun je het betalen, dan koop je het met de "Koop"-knop; anders zie je hoeveel
// je nog moet sparen.

import {
  getStaat,
  bezitHuis,
  koopHuis,
  bezitMeubel,
  koopMeubel,
} from "../state.js";
import { HUIS_CATALOGUS } from "../data/huizen.js";
import { MEUBELS, MEUBEL_LIJST, meubelPrijs } from "../art/meubels.js";
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

  // Sectie: Huizen
  scherm.append(maak("div", "winkel-sectie-titel", "Huizen"));
  const rooster = maak("div", "huis-rooster");
  scherm.append(rooster);

  // Sectie: Meubels
  scherm.append(maak("div", "winkel-sectie-titel", "Meubels"));
  const meubelRooster = maak("div", "huis-rooster");
  scherm.append(meubelRooster);

  app.append(top, scherm);

  tekenRooster();
  tekenMeubels();

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

  // Tekent (of hertekent) de meubel-kaarten die je nog niet bezit.
  function tekenMeubels() {
    meubelRooster.innerHTML = "";

    const teKoop = MEUBEL_LIJST.filter((id) => !bezitMeubel(id));

    if (teKoop.length === 0) {
      const leeg = maak("div", "winkel-leeg", "Alle meubels in huis! 🎉");
      meubelRooster.append(leeg);
      return;
    }

    for (const id of teKoop) {
      meubelRooster.append(maakMeubelKaart(id));
    }
  }

  // Eén te-koop-kaart voor een meubel (sprite + naam + prijs + koop-knop).
  function maakMeubelKaart(id) {
    const def = MEUBELS[id];
    const prijs = meubelPrijs(id);
    const munten = getStaat().munten;
    const betaalbaar = munten >= prijs;

    const kaart = maak("div", "huis-kaart winkel-kaart-koop");
    const sprite = maak("div", "winkel-meubel-sprite");
    sprite.innerHTML = def.svg;
    kaart.append(sprite, maak("div", "huis-naam", def.naam));

    const prijsEl = maak("div", "winkel-prijs", `★${prijs}`);
    if (!betaalbaar) prijsEl.classList.add("te-duur");
    kaart.append(prijsEl);

    if (betaalbaar) {
      const knop = maak("button", "knop primair koop-knop", "Koop");
      knop.addEventListener("click", () => koopMeubelKaart(id, kaart));
      kaart.append(knop);
    } else {
      const tekort = prijs - munten;
      kaart.append(maak("div", "winkel-sparen", `Nog ★${tekort} sparen`));
    }

    return kaart;
  }

  // Een meubel kopen: trekt munten af, viert kort, werkt de teller bij en
  // hertekent de meubel-sectie (zodat het gekochte meubel verdwijnt).
  function koopMeubelKaart(id, kaart) {
    ontgrendelAudio();
    const gelukt = koopMeubel(id);
    if (!gelukt) return;

    muntGeluid();
    updateMunten(getStaat().munten, true);

    kaart.classList.add("gekocht");
    kaart.innerHTML = "";
    const sprite = maak("div", "winkel-meubel-sprite");
    sprite.innerHTML = MEUBELS[id].svg;
    kaart.append(
      sprite,
      maak("div", "huis-naam", MEUBELS[id].naam),
      maak("div", "winkel-gekocht", "Gekocht! ✨"),
    );

    // De munten zijn veranderd, dus ook andere meubels kunnen nu (on)betaalbaar
    // zijn: hele meubel-sectie hertekenen na de korte viering.
    setTimeout(tekenMeubels, GEKOCHT_FEEST_MS);
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

    // De munten zakken, dus meubel-betaalbaarheid kan veranderen: beide secties
    // hertekenen na de korte viering.
    setTimeout(() => {
      tekenRooster();
      tekenMeubels();
    }, GEKOCHT_FEEST_MS);
  }
}
