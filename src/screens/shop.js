// Winkel: koop nieuwe huizen én meubels met je gespaarde munten. Toont de huizen
// uit de catalogus die je nog NIET bezit en de meubels die je nog niet hebt.
// Kun je het betalen, dan koop je het met de "Koop"-knop; anders zie je hoeveel
// je nog moet sparen.
//
// Alle te-koop-secties (huizen, meubels, en straks tool-skins) draaien op één
// gedeelde renderer `tekenSectie` + koop-afhandeling, gestuurd door een
// "koopbaar item"-beschrijving (descriptor). Zo voegt een nieuwe sectie alleen
// een descriptor + container toe, zonder de kaart-/koop-logica te dupliceren.

import {
  getStaat,
  bezitHuis,
  koopHuis,
  bezitMeubel,
  koopMeubel,
} from "../state.js";
import { HUIS_CATALOGUS, getHuisDef } from "../data/huizen.js";
import { MEUBELS, MEUBEL_LIJST, meubelPrijs } from "../art/meubels.js";
import { terug } from "../router.js";
import { maakTopbar } from "../ui/topbar.js";
import { maak, maakHuisKaart } from "../ui/dom.js";
import { muntGeluid, ontgrendelAudio } from "../audio/sfx.js";

// Hoe lang de "Gekocht! ✨"-bevestiging op de kaart blijft staan vóór het
// rooster opnieuw wordt getekend (en het gekochte item verdwijnt).
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

  // Elke sectie krijgt een eigen container + descriptor. De descriptor vertelt
  // de gedeelde renderer ALLES wat per item nodig is via kleine accessors.
  // Een derde sectie (tool-skins) toevoegen = hier één descriptor + container.
  const secties = [
    {
      container: null,
      titel: "Huizen",
      leegTekst: "Je hebt alle huizen al! 🎉",
      // Ongekochte huis-ids uit de catalogus.
      lijst: () => HUIS_CATALOGUS.filter((h) => !bezitHuis(h.id)).map((h) => h.id),
      naam: (id) => getHuisDef(id).naam,
      prijs: (id) => getHuisDef(id).prijs,
      bezit: (id) => bezitHuis(id),
      koop: (id) => koopHuis(id),
      // Visuele "kop" van de kaart: emoji + naam (gedeelde huis-kaart).
      maakHoofd: (id) => {
        const def = getHuisDef(id);
        return maakHuisKaart({
          emoji: def.emoji,
          naam: def.naam,
          tag: "div",
          extraKlasse: "winkel-kaart-koop",
        });
      },
    },
    {
      container: null,
      titel: "Meubels",
      leegTekst: "Alle meubels in huis! 🎉",
      // Ongekochte meubel-ids in palet-volgorde.
      lijst: () => MEUBEL_LIJST.filter((id) => !bezitMeubel(id)),
      naam: (id) => MEUBELS[id].naam,
      prijs: (id) => meubelPrijs(id),
      bezit: (id) => bezitMeubel(id),
      koop: (id) => koopMeubel(id),
      // Visuele "kop": meubel-sprite + naam binnen een lege huis-kaart-vorm.
      maakHoofd: (id) => {
        const kaart = maak("div", "huis-kaart winkel-kaart-koop");
        const sprite = maak("div", "winkel-meubel-sprite");
        sprite.innerHTML = MEUBELS[id].svg;
        kaart.append(sprite, maak("div", "huis-naam", MEUBELS[id].naam));
        return kaart;
      },
    },
  ];

  // Per sectie de titel + (lege) container in het scherm hangen.
  for (const sectie of secties) {
    scherm.append(maak("div", "winkel-sectie-titel", sectie.titel));
    sectie.container = maak("div", "huis-rooster");
    scherm.append(sectie.container);
  }

  app.append(top, scherm);

  tekenAlles();

  // Alle secties (her)tekenen. Na ELKE aankoop zakken de munten, dus de
  // betaalbaarheid kan in ÁLLE secties veranderen — daarom redraw alles.
  function tekenAlles() {
    for (const sectie of secties) tekenSectie(sectie);
  }

  // Eén sectie (her)tekenen op basis van de huidige staat. Toont de ongekochte
  // items als kaarten; is alles al in bezit, dan een vriendelijke melding.
  function tekenSectie(sectie) {
    const { container, lijst, leegTekst } = sectie;
    container.innerHTML = "";

    const teKoop = lijst();
    if (teKoop.length === 0) {
      container.append(maak("div", "winkel-leeg", leegTekst));
      return;
    }

    for (const id of teKoop) container.append(maakKaart(sectie, id));
  }

  // Eén te-koop-kaart: visuele kop + "★prijs" + Koop-knop (betaalbaar) of
  // grijze "Nog ★X sparen" (te duur).
  function maakKaart(sectie, id) {
    const prijs = sectie.prijs(id);
    const munten = getStaat().munten;
    const betaalbaar = munten >= prijs;

    const kaart = sectie.maakHoofd(id);

    const prijsEl = maak("div", "winkel-prijs", `★${prijs}`);
    if (!betaalbaar) prijsEl.classList.add("te-duur");
    kaart.append(prijsEl);

    if (betaalbaar) {
      const knop = maak("button", "knop primair koop-knop", "Koop");
      knop.addEventListener("click", () => koop(sectie, id, kaart));
      kaart.append(knop);
    } else {
      const tekort = prijs - munten;
      kaart.append(maak("div", "winkel-sparen", `Nog ★${tekort} sparen`));
    }

    return kaart;
  }

  // Een item kopen: trekt munten af via de staat, viert kort op de kaart, werkt
  // de teller bij en hertekent ÁLLE secties (zodat het gekochte item verdwijnt
  // én de betaalbaarheid overal klopt).
  function koop(sectie, id, kaart) {
    ontgrendelAudio();
    const gelukt = sectie.koop(id);
    if (!gelukt) return;

    muntGeluid();
    updateMunten(getStaat().munten, true);

    // Korte bevestiging op de kaart vóór het hertekenen: dezelfde kop + flits.
    kaart.classList.add("gekocht");
    kaart.innerHTML = "";
    const hoofd = sectie.maakHoofd(id);
    // De kop is zelf een kaart; we nemen zijn kinderen over zodat het feest-
    // label binnen DEZE kaart valt (geen geneste kaart in de DOM).
    kaart.append(...hoofd.childNodes, maak("div", "winkel-gekocht", "Gekocht! ✨"));

    setTimeout(tekenAlles, GEKOCHT_FEEST_MS);
  }
}
