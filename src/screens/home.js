// Beginscherm: een LEVEND beginscherm (Feature G4). Toont de huizen die je hebt
// als grote, aantikbare kaarten, plus kaarten voor Winkel, Dansen, Styling,
// Verzamelboek en Instellingen. Daaromheen maakt "juice" het scherm levendig:
//   - een vrolijke ambiance-laag met langzaam zwevende muzieknoten/hartjes/sterren;
//   - een rustige "parade"-rij onderaan met Mama + Olivia (in haar gekozen look)
//     + (indien geadopteerd) het gekozen huisdier — die zachtjes wiebelen;
//   - een klein welkom-titeltje met een vrolijke binnenkomst-animatie.
//
// Het HERGEBRUIKTE huisdier-figuur (maakHuisdierFiguur, aaibaar) staat nu IN de
// parade i.p.v. los onder de kaarten — zo staat het dier nooit dubbel op home.
//
// Alles (ambiance-zwevers, parade, het huisdier-figuur en zijn listeners) wordt
// in de scherm-cleanup opgeruimd zodat er niets lekt. Onder prefers-reduced-motion
// staat alles stil maar zichtbaar (de CSS bevriest de animaties; de hartjes worden
// in het huisdier-figuur al overgeslagen).

import {
  getStaat,
  bezitHuis,
  getOliviaLook,
  zorgVoorQuestsVandaag,
  getQuestsVandaag,
  kanRadDraaien,
} from "../state.js";
import { questById } from "../data/quests.js";
import { HUIS_CATALOGUS } from "../data/huizen.js";
import { navigeer } from "../router.js";
import { maakTopbar } from "../ui/topbar.js";
import { maak, maakHuisKaart } from "../ui/dom.js";
import { maakHuisdierFiguur } from "../ui/huisdier.js";
import { mamaSVG } from "../art/mama.js";
import { oliviaSVG } from "../art/olivia.js";
import { ontgrendelAudio } from "../audio/sfx.js";

// De emoji's die rustig in de achtergrond zweven (vrolijk, weinig, langzaam).
const AMBIANCE_TEKENS = ["🎵", "🎶", "💕", "⭐", "✨", "💖", "🌟", "🎵"];

export function toon(app, _params = {}) {
  const staat = getStaat();
  app.innerHTML = "";

  // ---- Topbalk (geen terug-knop op het beginscherm) ----
  const { el: top, updateMunten } = maakTopbar({
    titel: "🏠 Olivia's Huizen",
    toonMunten: true,
  });
  updateMunten(staat.munten);

  // ---- Scherm + ambiance-laag (zwevers achter de inhoud) ----
  const scherm = maak("div", "home-scherm");
  const ambiance = maak("div", "home-ambiance");
  ambiance.setAttribute("aria-hidden", "true");
  // Een handvol langzaam opdrijvende tekens op willekeurige posities/snelheden.
  // Puur decoratief (pointer-events:none in CSS), zelf-herhalend, geen flikkering.
  for (let i = 0; i < AMBIANCE_TEKENS.length; i++) {
    const z = maak("span", "home-zwever", AMBIANCE_TEKENS[i]);
    z.style.left = `${6 + (i / AMBIANCE_TEKENS.length) * 88 + Math.random() * 6}%`;
    z.style.animationDuration = `${10 + Math.random() * 8}s`;
    z.style.animationDelay = `${-Math.random() * 10}s`;
    z.style.fontSize = `${18 + Math.random() * 16}px`;
    ambiance.append(z);
  }
  scherm.append(ambiance);

  // ---- Klein welkom (vrolijke binnenkomst-animatie) ----
  const welkom = maak("div", "home-welkom", "Hoi! Wat wil je doen? ✨");
  scherm.append(welkom);

  // ---- Huizen-rooster ----
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

  // ---- Opdrachten-kaart (dagelijkse quests + Rad van Fortuin) ----
  // Een klein badge/stipje als er vandaag nog iets te doen is: het rad nog niet
  // gedraaid, of een voltooide-maar-nog-niet-opgehaalde opdracht. We zorgen eerst
  // dat de quests van vandaag bestaan zodat de badge klopt (dit kiest ze de eerste
  // keer vandaag en is daarna een no-op).
  const opdrachtenKaart = maakHuisKaart({
    emoji: "🎯",
    naam: "Opdrachten",
    extraKlasse: "opdrachten-kaart",
  });
  zorgVoorQuestsVandaag();
  const claimbaar = getQuestsVandaag().some((t) => {
    const def = questById(t.id);
    return def && !t.beloond && t.voortgang >= t.doel;
  });
  if (kanRadDraaien() || claimbaar) {
    const badge = maak("span", "kaart-badge", "•");
    badge.setAttribute("aria-hidden", "true");
    opdrachtenKaart.append(badge);
  }
  opdrachtenKaart.addEventListener("click", () => {
    ontgrendelAudio();
    navigeer("opdrachten");
  });
  rooster.append(opdrachtenKaart);

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

  // ---- Parade-rij onderaan: Mama + Olivia + (indien geadopteerd) huisdier ----
  // Mama en Olivia zijn decoratief (zachte op-en-neer wiebel). Het huisdier komt
  // uit het HERGEBRUIKTE figuur (aaibaar) en staat nu IN de parade — niet ook nog
  // los onder de kaarten, zodat het dier nooit dubbel verschijnt.
  const parade = maak("div", "home-parade");
  parade.setAttribute("aria-label", "Mama en Olivia");

  const mama = maak("div", "home-parade-figuur mama");
  mama.innerHTML = mamaSVG;
  parade.append(mama);

  const olivia = maak("div", "home-parade-figuur olivia");
  olivia.innerHTML = oliviaSVG(getOliviaLook());
  parade.append(olivia);

  // Het gekozen huisdier (of null) — als geadopteerd, aaibaar in de parade.
  const huisdier = maakHuisdierFiguur({ aaibaar: true });
  if (huisdier) {
    const dierWrap = maak("div", "home-parade-figuur huisdier");
    dierWrap.append(huisdier.el);
    parade.append(dierWrap);
  }

  scherm.append(parade);

  app.append(top, scherm);

  // Opruimen bij weg-navigeren: de huisdier-listener + hartjes-timers wegruimen
  // (de ambiance-zwevers en parade-figuren verdwijnen vanzelf met #app's innerHTML,
  // maar het huisdier-figuur moet zijn pointer-listener netjes loskoppelen). De
  // router roept deze functie aan.
  return () => {
    if (huisdier) huisdier.opruim();
  };
}
