// Het schoonmaak-scherm: kamer + getypeerd vuil + rommel-naar-prullenbak +
// voortgangsbalk + toolbar + "klaar!"-viering. Een kamer is pas klaar als ál
// het vuil weg is ÉN alle rommel in de prullenbak zit.

import { kamerArt } from "../art/kamers.js";
import { TOOLS, toolById } from "../clean/tools.js";
import { maakSchoonmaak, VUIL_KLAAR_DREMPEL } from "../clean/canvas.js";
import { maakRommel } from "../clean/rommel.js";
import { kamerVuil } from "../clean/kamerVuil.js";
import {
  getStaat,
  getKamer,
  setKamerSchoon,
  markeerKamerKlaar,
  voegMuntenToe,
} from "../state.js";
import { maakTopbar } from "../ui/topbar.js";
import { terug, vervang } from "../router.js";
import { muntGeluid, vieringGeluid, sparkleGeluid, ontgrendelAudio } from "../audio/sfx.js";

// Beloning voor een schoongemaakte kamer.
const BELONING = 25;
// Hoe zwaar telt vuil vs. rommel in de gecombineerde voortgang.
const VUIL_GEWICHT = 0.7;
const ROMMEL_GEWICHT = 0.3;

export function toon(app, { huisId = "thuis", kamerId = "woonkamer" } = {}) {
  const staat = getStaat();
  app.innerHTML = "";

  const kamer = getKamer(huisId, kamerId);
  const config = kamerVuil(kamer?.art);

  // ---- Topbalk met terug-knop naar het huis-overzicht ----
  const { el: top, updateMunten } = maakTopbar({
    titel: "🧹 Maak de kamer schoon!",
    opTerug: () => terug(),
    toonMunten: true,
  });
  updateMunten(staat.munten);

  // ---- Kamer ----
  const scherm = el("div", "clean-scherm");
  const wrap = el("div", "kamer-wrap");
  wrap.innerHTML = kamerArt(kamer?.art);

  // ---- Prullenbak (in een hoek) ----
  const prullenbak = el("div", "prullenbak", "🗑️");
  wrap.append(prullenbak);

  // ---- Rommel-laag (sleepbare emoji boven het vuil, onder de viering) ----
  const rommelLaag = el("div", "rommel-laag");
  wrap.append(rommelLaag);

  const balk = el("div", "voortgang");
  const vul = el("div", "vul");
  const lbl = el("div", "label", "0% schoon");
  balk.append(vul, lbl);
  wrap.append(balk);

  // ---- Viering ----
  const viering = el("div", "viering");
  viering.innerHTML = `
    <div class="kaart">
      <h2>Helemaal schoon! ✨</h2>
      <p>Wat heb jij goed gepoetst!</p>
      <div class="beloning">+${BELONING} ★</div>
      <button class="knop primair opnieuw">Nog een keer 🧽</button>
    </div>`;
  wrap.append(viering);

  scherm.append(wrap);

  // ---- Toolbar ----
  const toolbar = el("div", "toolbar");
  const knoppen = TOOLS.map((t) => {
    const b = el("button", "tool");
    b.innerHTML = `${t.emoji}<span class="naam">${t.naam}</span>`;
    b.addEventListener("pointerdown", () => kiesTool(t.id));
    toolbar.append(b);
    return { id: t.id, el: b };
  });

  const hint = el("div", "cursief-hint", "Veeg het vuil weg en sleep de rommel naar de 🗑️");

  app.append(top, scherm, toolbar, hint);

  // ---- Schoonmaak-canvas (getypeerde vuil-lagen) ----
  const spel = maakSchoonmaak({
    wrap,
    vuilSoorten: config.vuil,
    onProgress() { werkVoortgangBij(); },
    // Vuurt zodra ál het vuil weg is (los van de rommel). Het sparkle-feest
    // doet het canvas zelf; wij werken alleen de voortgang bij.
    onVuilKlaar() { werkVoortgangBij(); },
    onVerkeerdGereedschap() { toonVerkeerdHint(); },
  });

  // ---- Rommel opruimen ----
  // De sleeplogica + prullenbak-hit-test zit in een apart module zodat het
  // scherm netjes kan opruimen. Wij reageren alleen op een gebinde item.
  const rommel = maakRommel({
    wrap,
    rommelLaag,
    prullenbak,
    items: config.rommel || [],
    onWeg(cx, cy) {
      spel.sparkleBij?.(cx, cy);
      sparkleGeluid();
      werkVoortgangBij();
    },
  });

  // ---- Gecombineerde voortgang (vuil + rommel) ----
  let klaarGevierd = false;
  function werkVoortgangBij() {
    const vuil = spel.vuilFractie ? spel.vuilFractie() : 0;
    const rommelF = rommel.fractie();
    const totaal = VUIL_GEWICHT * vuil + ROMMEL_GEWICHT * rommelF;
    const p = Math.round(totaal * 100);
    vul.style.width = p + "%";
    lbl.textContent = p + "% schoon";
    if (p > 0) hint.style.visibility = "hidden";

    // Voortgang bewaren zolang de kamer nog niet klaar is.
    if (!getKamer(huisId, kamerId)?.klaar) {
      setKamerSchoon(huisId, kamerId, p);
    }

    const helemaalKlaar = vuil >= VUIL_KLAAR_DREMPEL && rommel.over() === 0;
    if (helemaalKlaar && !klaarGevierd) {
      klaarGevierd = true;
      vier();
    }
  }

  function vier() {
    const alKlaar = getKamer(huisId, kamerId)?.klaar;
    markeerKamerKlaar(huisId, kamerId);
    if (!alKlaar) {
      const nieuw = voegMuntenToe(BELONING);
      updateMunten(nieuw, true);
    }
    // Het sparkle-feest doet het canvas zelf zodra ál het vuil weg is (in
    // meet()). Hier niet nóg een keer vuren, anders krijg je een dubbel feest.
    vieringGeluid();
    setTimeout(() => muntGeluid(), 400);
    setTimeout(() => viering.classList.add("aan"), 500);
  }

  // ---- Verkeerd-gereedschap-hint (vriendelijk, niet straffend) ----
  let hintTimer = 0;
  function toonVerkeerdHint() {
    hint.textContent = "Hmm, probeer een ander gereedschap! 🧴";
    hint.style.visibility = "visible";
    hint.classList.add("flits");
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => {
      hint.classList.remove("flits");
      hint.style.visibility = "hidden";
    }, 1600);
  }

  // ---- Logica: gereedschap kiezen ----
  function kiesTool(id) {
    ontgrendelAudio();
    knoppen.forEach((k) => k.el.classList.toggle("actief", k.id === id));
    spel.setTool(toolById(id));
  }

  const startTool = TOOLS[0].id;
  kiesTool(startTool);
  werkVoortgangBij();

  viering.querySelector(".opnieuw").addEventListener("click", () => {
    // Opnieuw poetsen: via de router opnieuw tonen. De router ruimt eerst het
    // oude canvas op (RAF + listeners) en rendert dan een vers scherm met
    // nieuw verspreid vuil + rommel.
    vervang("schoonmaak", { huisId, kamerId });
  });

  // Geef de router een opruim-functie terug zodat het canvas (RAF + listeners)
  // én de rommel (pointer-listeners + elementen) worden afgebroken zodra we
  // weg-navigeren. Zo lekt er niets bij heen-en-weer navigeren.
  return () => {
    clearTimeout(hintTimer);
    spel.destroy();
    rommel.destroy();
  };
}

// kleine helpers
function el(tag, klasse, tekst) {
  const e = document.createElement(tag);
  if (klasse) e.className = klasse;
  if (tekst != null) e.textContent = tekst;
  return e;
}
