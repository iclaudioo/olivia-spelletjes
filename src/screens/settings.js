// Instellingen-scherm: geluid + muziek aan/uit en de skin-picker voor het
// gereedschap. Audio leest geluid/muziek zelf uit de instellingen; wij werken
// de instelling bij + bewaren, en zetten de muziek meteen aan/uit.
//
// De skin-picker toont alleen de skins die je BEZIT (incl. de gratis standaard).
// Tikken kiest de actieve skin (gekozenSkin). Nieuwe skins koop je in de winkel.

import {
  getStaat,
  bewaren,
  bezitSkin,
  kiesSkin,
  getGekozenSkin,
} from "../state.js";
import { SKIN_LIJST, skinById } from "../data/skins.js";
import { terug } from "../router.js";
import { maakTopbar } from "../ui/topbar.js";
import { maak as el } from "../ui/dom.js";
import { ontgrendelAudio } from "../audio/sfx.js";
import { zetMuziek } from "../audio/muziek.js";

export function toon(app, _params = {}) {
  const staat = getStaat();
  app.innerHTML = "";

  // ---- Topbalk met terug-knop naar het beginscherm ----
  // Geen snelle muziek-knop in de topbalk hier: dit scherm heeft z'n eigen
  // Muziek-toggle. Twee knoppen die elkaar niet bijwerken gaven tegenstrijdige
  // standen, dus op Instellingen bedient alleen de in-pagina toggle de muziek.
  const { el: top, updateMunten } = maakTopbar({
    titel: "⚙️ Instellingen",
    opTerug: () => terug(),
    toonMunten: true,
    toonMuziek: false,
  });
  updateMunten(staat.munten);

  const scherm = el("div", "instellingen-scherm");

  // ---- Vak: audio-knoppen (geluid + muziek) ----
  const audioVak = el("div", "instellingen-vak");

  // Geluid-rij
  const geluidRij = el("div", "instellingen-rij");
  geluidRij.append(el("div", "instellingen-label", "🔊 Geluid"));
  const geluidKnop = maakToggle(
    () => getStaat().instellingen.geluid !== false,
    (aan) => {
      getStaat().instellingen.geluid = aan;
      bewaren();
    }
  );
  geluidRij.append(geluidKnop);

  // Muziek-rij
  const muziekRij = el("div", "instellingen-rij");
  muziekRij.append(el("div", "instellingen-label", "🎵 Muziek"));
  const muziekKnop = maakToggle(
    () => getStaat().instellingen.muziek === true,
    (aan) => {
      getStaat().instellingen.muziek = aan;
      bewaren();
      // Meteen starten/stoppen. Dit gebeurt na een tik (gebaar), dus iOS staat
      // het afspelen toe.
      zetMuziek(aan);
    }
  );
  muziekRij.append(muziekKnop);

  audioVak.append(geluidRij, muziekRij);

  // ---- Vak: skin-picker (alleen bezit) ----
  const skinVak = el("div", "instellingen-vak");
  skinVak.append(el("div", "instellingen-sectie-titel", "🧽 Gereedschap-uiterlijk"));

  const rooster = el("div", "skin-rooster");
  const tegels = []; // { id, el }

  // Alleen skins die je bezit (gratis standaard zit hier altijd bij).
  const eigenSkins = SKIN_LIJST.filter((id) => bezitSkin(id));
  for (const id of eigenSkins) {
    const def = skinById(id);
    const tegel = el("button", "skin-tegel");
    const vlag = el("div", "skin-tegel-vlag", def.emoji);
    vlag.style.background = def.accent;
    tegel.append(vlag, el("div", "skin-tegel-naam", def.naam));
    tegel.addEventListener("click", () => kies(id));
    rooster.append(tegel);
    tegels.push({ id, el: tegel });
  }
  skinVak.append(rooster);

  // Vriendelijke hint: meer skins koop je in de winkel.
  skinVak.append(el("div", "skin-hint", "Koop meer in de winkel 🛒"));

  scherm.append(audioVak, skinVak);
  app.append(top, scherm);

  // Begin-markering van de actieve skin.
  markeerActief();

  function kies(id) {
    ontgrendelAudio();
    if (kiesSkin(id)) markeerActief();
  }

  function markeerActief() {
    const actief = getGekozenSkin();
    for (const t of tegels) t.el.classList.toggle("gekozen", t.id === actief);
  }
}

// Een grote aan/uit-knop. `lees()` geeft de huidige stand; `zet(aan)` schrijft
// de nieuwe stand weg. De knop toont "Aan ✅" of "Uit" en kleurt groen als aan.
function maakToggle(lees, zet) {
  const knop = el("button", "toggle-knop");

  function teken() {
    const aan = lees();
    knop.textContent = aan ? "Aan ✅" : "Uit";
    knop.classList.toggle("aan", aan);
    knop.setAttribute("aria-pressed", aan ? "true" : "false");
  }

  knop.addEventListener("click", () => {
    ontgrendelAudio();
    zet(!lees());
    teken();
  });

  teken();
  return knop;
}
