// Styling Studio — Olivia aankleden (haar / outfit / accessoire). Olivia is dol op
// K-pop; hier kies je haar uiterlijk. Bovenaan staat een grote LIVE preview van
// Olivia die meteen meeverandert bij elke keuze; daaronder drie secties met
// tegels. Bezeten opties tik je aan om ze aan te trekken; betaalde opties tonen
// hun prijs + een Koop-knop (of "Nog ★X sparen" bij te weinig munten).
//
// De gekozen look wordt overal getoond waar Olivia danst (dansfeest + dans-
// minigame) doordat die schermen oliviaSVG(getOliviaLook()) renderen.
//
// Bron van waarheid: de catalogus (src/data/styling.js) levert namen/prijzen/
// kleuren/SVG; de staat bewaart alleen de keuzes (oliviaLook) + bezit
// (gekochteStyling).

import {
  getStaat,
  getOliviaLook,
  bezitStyling,
  setOliviaLook,
  koopStyling,
} from "../state.js";
import {
  stylingPerCategorie,
  stylingPrijs,
} from "../data/styling.js";
import { oliviaSVG } from "../art/olivia.js";
import { terug } from "../router.js";
import { maakTopbar } from "../ui/topbar.js";
import { maak } from "../ui/dom.js";
import { vierVerdiendeStickers } from "../ui/toast.js";
import { muntGeluid, sparkleGeluid, ontgrendelAudio } from "../audio/sfx.js";

// De drie secties in volgorde, met een vriendelijke koptekst per categorie.
const SECTIES = [
  { categorie: "haar", titel: "💇‍♀️ Haar" },
  { categorie: "outfit", titel: "👗 Outfit" },
  { categorie: "accessoire", titel: "🎀 Accessoire" },
];

export function toon(app, _params = {}) {
  app.innerHTML = "";

  // ---- Topbalk met terug-knop + munten ----
  const { el: top, updateMunten } = maakTopbar({
    titel: "💇‍♀️ Styling Studio",
    opTerug: () => terug(),
    toonMunten: true,
  });
  updateMunten(getStaat().munten);

  const scherm = maak("div", "styling-scherm");

  // ---- Grote LIVE preview van Olivia (updatet bij elke keuze) ----
  const previewVak = maak("div", "styling-preview");
  previewVak.setAttribute("aria-hidden", "true");
  const previewFig = maak("div", "styling-preview-fig");
  previewVak.append(previewFig);
  scherm.append(previewVak);

  // Per sectie een rooster van tegels; we onthouden de tegels zodat we de actieve
  // markering en de betaalbaarheid kunnen herrekenen na elke keuze/aankoop.
  // tegels: array van { id, categorie, el, herteken() }
  const tegels = [];

  for (const sectie of SECTIES) {
    scherm.append(maak("div", "styling-sectie-titel", sectie.titel));
    const rooster = maak("div", "styling-rooster");
    for (const item of stylingPerCategorie(sectie.categorie)) {
      const tegel = maakTegel(item);
      rooster.append(tegel.el);
      tegels.push(tegel);
    }
    scherm.append(rooster);
  }

  app.append(top, scherm);

  // Eerste render: preview + alle tegels in de juiste staat.
  tekenPreview();
  hertekenAlles();

  // ---- Een look-keuze aantrekken (alleen bij bezit) ----
  function trekAan(categorie, id) {
    ontgrendelAudio();
    if (!setOliviaLook(categorie, id)) return;
    sparkleGeluid();
    tekenPreview();
    hertekenAlles();
    // Een nieuwe look kan de "fashionista"-sticker ontgrendelen.
    vierVerdiendeStickers();
  }

  // ---- Een betaald item kopen → daarna automatisch aantrekken ----
  function koop(categorie, id) {
    ontgrendelAudio();
    if (!koopStyling(id)) return; // te weinig munten of al in bezit
    muntGeluid();
    updateMunten(getStaat().munten, true);
    // Direct aantrekken (zet de look + preview + persist + sticker-check).
    trekAan(categorie, id);
  }

  // ---- De live preview opnieuw tekenen uit de huidige look ----
  function tekenPreview() {
    previewFig.innerHTML = oliviaSVG(getOliviaLook());
  }

  // ---- Alle tegels opnieuw tekenen (actieve markering + betaalbaarheid) ----
  function hertekenAlles() {
    const look = getOliviaLook();
    for (const t of tegels) t.herteken(look);
  }

  // Bouwt één tegel voor een styling-item. De tegel toont een kleurstaal/emoji +
  // naam, en daaronder afhankelijk van bezit: niets (al van jou), of "★prijs" met
  // een Koop-knop / "Nog ★X sparen". `herteken(look)` werkt de staat van de tegel
  // bij na elke keuze/aankoop (zonder de hele DOM te herbouwen).
  function maakTegel(item) {
    const el = maak("button", "styling-tegel");
    el.type = "button";
    el.setAttribute("aria-label", item.naam);

    // Visuele "vlag": voor haar/outfit een kleurstaal van de hoofdkleur, voor de
    // accessoire de emoji op een neutraal rondje.
    const vlag = maak("div", "styling-tegel-vlag");
    vlag.textContent = item.emoji || "";
    if (item.categorie === "haar") {
      vlag.style.background = `linear-gradient(160deg, ${item.top}, ${item.bottom})`;
    } else if (item.categorie === "outfit") {
      vlag.style.background = `linear-gradient(160deg, ${item.topTop}, ${item.rokBottom})`;
    } else {
      vlag.style.background = "#eef3fb";
    }

    const naam = maak("div", "styling-tegel-naam", item.naam);

    // Onder-regel: wisselt tussen koop-info en niets (eigendom). We hangen één
    // container op die we per herteken vullen.
    const onder = maak("div", "styling-tegel-onder");

    el.append(vlag, naam, onder);

    // Tik op de tegel zelf: aantrekken áls je het bezit (anders doet de tik niets;
    // kopen gaat via de aparte Koop-knop zodat je niet per ongeluk koopt).
    el.addEventListener("click", () => {
      if (bezitStyling(item.id)) trekAan(item.categorie, item.id);
    });

    function herteken(look) {
      const bezit = bezitStyling(item.id);
      const actief = look[item.categorie] === item.id;
      el.classList.toggle("bezit", bezit);
      el.classList.toggle("gekozen", actief);
      // disabled-attribuut zetten we NIET (de hele tegel blijft een knop voor
      // toegankelijkheid); we sturen alleen via klassen + de onder-regel.

      onder.innerHTML = "";
      if (bezit) {
        // Eigendom: toon "Aan ✨" als actief, anders niets extra (de tegel is
        // gewoon tikbaar). Een klein label houdt het duidelijk voor kinderen.
        if (actief) onder.append(maak("div", "styling-actief", "Aan ✨"));
        return;
      }

      // Niet in bezit: prijs + Koop-knop (betaalbaar) of "Nog ★X sparen".
      const prijs = stylingPrijs(item.id);
      const munten = getStaat().munten;
      const betaalbaar = munten >= prijs;

      const prijsEl = maak("div", "styling-prijs", `★${prijs}`);
      if (!betaalbaar) prijsEl.classList.add("te-duur");
      onder.append(prijsEl);

      if (betaalbaar) {
        const knop = maak("button", "knop primair styling-koop-knop", "Koop");
        knop.type = "button";
        knop.addEventListener("click", (e) => {
          // Niet de tegel-klik ook nog laten vuren (zou niets doen, maar netjes).
          e.stopPropagation();
          koop(item.categorie, item.id);
        });
        onder.append(knop);
      } else {
        const tekort = prijs - munten;
        onder.append(maak("div", "styling-sparen", `Nog ★${tekort} sparen`));
      }
    }

    return { id: item.id, categorie: item.categorie, el, herteken };
  }

  // Dit scherm gebruikt geen timers of globale listeners → geen opruim nodig.
  // (We geven bewust niets terug; de router wist #app bij weg-navigeren.)
}
