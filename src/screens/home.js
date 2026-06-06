// Beginscherm: toont de huizen die je hebt als grote, aantikbare kaarten,
// plus een "Winkel"-kaart om nieuwe huizen te kopen. Metadata (naam, emoji)
// komt uit de catalogus; bezit komt uit de staat.

import { getStaat, bezitHuis } from "../state.js";
import { HUIS_CATALOGUS } from "../data/huizen.js";
import { navigeer } from "../router.js";
import { maakTopbar } from "../ui/topbar.js";
import { maak, maakHuisKaart } from "../ui/dom.js";
import { maakHuisdierFiguur } from "../ui/huisdier.js";
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
    const kaart = maakHuisKaart({ emoji: huis.emoji, naam: huis.naam });
    kaart.addEventListener("click", () => {
      ontgrendelAudio();
      navigeer("huis", { huisId: huis.id });
    });
    rooster.append(kaart);
  }

  // ---- Winkel-kaart ----
  const winkelKaart = maakHuisKaart({
    emoji: "🛒",
    naam: "Winkel",
    extraKlasse: "winkel-kaart",
  });
  winkelKaart.addEventListener("click", () => {
    ontgrendelAudio();
    navigeer("winkel");
  });
  rooster.append(winkelKaart);

  // ---- Dansen-kaart (dans-minigame "Volg de moves!") ----
  const dansenKaart = maakHuisKaart({
    emoji: "💃",
    naam: "Dansen",
    extraKlasse: "dansen-kaart",
  });
  dansenKaart.addEventListener("click", () => {
    ontgrendelAudio();
    navigeer("dansen");
  });
  rooster.append(dansenKaart);

  // ---- Styling-kaart (Styling Studio — Olivia aankleden) ----
  const stylingKaart = maakHuisKaart({
    emoji: "💇‍♀️",
    naam: "Styling",
    extraKlasse: "styling-kaart",
  });
  stylingKaart.addEventListener("click", () => {
    ontgrendelAudio();
    navigeer("styling");
  });
  rooster.append(stylingKaart);

  // ---- Verzamelboek-kaart (sticker-album) ----
  const verzamelKaart = maakHuisKaart({
    emoji: "📖",
    naam: "Verzamelboek",
    extraKlasse: "verzamel-kaart",
  });
  verzamelKaart.addEventListener("click", () => {
    ontgrendelAudio();
    navigeer("verzamelboek");
  });
  rooster.append(verzamelKaart);

  // ---- Instellingen-kaart (geluid/muziek + skins) ----
  const instellingenKaart = maakHuisKaart({
    emoji: "⚙️",
    naam: "Instellingen",
    extraKlasse: "instellingen-kaart",
  });
  instellingenKaart.addEventListener("click", () => {
    ontgrendelAudio();
    navigeer("instellingen");
  });
  rooster.append(instellingenKaart);

  scherm.append(rooster);

  // ---- Huisdier-vriendje (Feature G3) ----
  // Toon (indien geadopteerd) het gekozen huisdier onder de kaarten, aaibaar.
  // Geen gekozen dier → maakHuisdierFiguur geeft null en we tonen niets.
  const huisdier = maakHuisdierFiguur({ aaibaar: true });
  if (huisdier) scherm.append(huisdier.el);

  app.append(top, scherm);

  // Opruimen bij weg-navigeren: de huisdier-listener + hartjes-timers wegruimen
  // zodat er niets lekt (de router roept deze functie aan).
  return () => {
    if (huisdier) huisdier.opruim();
  };
}
