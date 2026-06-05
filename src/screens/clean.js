// Het schoonmaak-scherm: kamer + getypeerd vuil + rommel-naar-prullenbak +
// voortgangsbalk + toolbar + "klaar!"-viering. Een kamer is pas klaar als ál
// het vuil weg is ÉN alle rommel in de prullenbak zit.

import { kamerArt } from "../art/kamers.js";
import { TOOLS, toolById } from "../clean/tools.js";
import { maakSchoonmaak } from "../clean/canvas.js";
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
    onKlaar() { werkVoortgangBij(); },
    onVerkeerdGereedschap() { toonVerkeerdHint(); },
  });

  // ---- Rommel opruimen ----
  // We tellen hoeveel rommel-items er waren en hoeveel er nog liggen.
  let rommelTotaal = 0;
  let rommelOver = 0;

  function maakRommel() {
    rommelLaag.innerHTML = "";
    const items = config.rommel || [];
    rommelTotaal = items.length;
    rommelOver = items.length;
    items.forEach((emoji, i) => {
      const item = el("div", "rommel", emoji);
      // Verspreid de rommel over de vloer (onderste helft), weg van de hoek
      // met de prullenbak en weg van de voortgangsbalk bovenaan.
      const links = 12 + (i / Math.max(1, items.length - 1 || 1)) * 60 + rnd(-6, 6);
      const top = 52 + rnd(0, 30);
      item.style.left = Math.max(6, Math.min(78, links)) + "%";
      item.style.top = Math.max(40, Math.min(82, top)) + "%";
      maakSleepbaar(item);
      rommelLaag.append(item);
    });
  }

  // Sleeplogica met Pointer Events (werkt op iPad). Elk rommel-item vangt zijn
  // eigen pointer; daardoor blokkeert het de veeg-vanger niet en andersom.
  function maakSleepbaar(item) {
    let sleept = false;
    let dx = 0, dy = 0; // greep-offset

    function omlaag(e) {
      e.preventDefault();
      e.stopPropagation();
      ontgrendelAudio();
      sleept = true;
      try { item.setPointerCapture?.(e.pointerId); } catch { /* negeren */ }
      item.classList.add("sleept");
      const r = item.getBoundingClientRect();
      dx = e.clientX - (r.left + r.width / 2);
      dy = e.clientY - (r.top + r.height / 2);
    }
    function beweeg(e) {
      if (!sleept) return;
      e.preventDefault();
      const wrapR = wrap.getBoundingClientRect();
      const x = e.clientX - dx - wrapR.left;
      const y = e.clientY - dy - wrapR.top;
      item.style.left = (x / wrapR.width) * 100 + "%";
      item.style.top = (y / wrapR.height) * 100 + "%";
      item.style.transform = "translate(-50%, -50%) scale(1.15)";
    }
    function omhoog(e) {
      if (!sleept) return;
      sleept = false;
      item.classList.remove("sleept");
      item.style.transform = "";
      // Raakt het midden van het item de prullenbak?
      const ir = item.getBoundingClientRect();
      const pr = prullenbak.getBoundingClientRect();
      const cx = ir.left + ir.width / 2;
      const cy = ir.top + ir.height / 2;
      const inBak = cx >= pr.left && cx <= pr.right && cy >= pr.top && cy <= pr.bottom;
      if (inBak) {
        gooieWeg(item, cx, cy);
      }
    }

    item.addEventListener("pointerdown", omlaag);
    item.addEventListener("pointermove", beweeg);
    item.addEventListener("pointerup", omhoog);
    item.addEventListener("pointercancel", omhoog);
  }

  function gooieWeg(item, cx, cy) {
    item.classList.add("weg");
    prullenbak.classList.add("hap");
    setTimeout(() => prullenbak.classList.remove("hap"), 220);
    spel.sparkleBij?.(cx, cy);
    sparkleGeluid();
    rommelOver = Math.max(0, rommelOver - 1);
    werkVoortgangBij();
    setTimeout(() => item.remove(), 220);
  }

  function rommelFractie() {
    if (rommelTotaal === 0) return 1;
    return (rommelTotaal - rommelOver) / rommelTotaal;
  }

  // ---- Gecombineerde voortgang (vuil + rommel) ----
  let klaarGevierd = false;
  function werkVoortgangBij() {
    const vuil = spel.vuilFractie ? spel.vuilFractie() : 0;
    const rommel = rommelFractie();
    const totaal = VUIL_GEWICHT * vuil + ROMMEL_GEWICHT * rommel;
    const p = Math.round(totaal * 100);
    vul.style.width = p + "%";
    lbl.textContent = p + "% schoon";
    if (p > 0) hint.style.visibility = "hidden";

    // Voortgang bewaren zolang de kamer nog niet klaar is.
    if (!getKamer(huisId, kamerId)?.klaar) {
      setKamerSchoon(huisId, kamerId, p);
    }

    const helemaalKlaar = vuil >= 0.985 && rommelOver === 0;
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
    spel.feestSparkles?.();
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
  let actieveTool = TOOLS[0].id;
  function kiesTool(id) {
    ontgrendelAudio();
    actieveTool = id;
    knoppen.forEach((k) => k.el.classList.toggle("actief", k.id === id));
    spel.setTool(toolById(id));
  }

  kiesTool(actieveTool);
  maakRommel();
  werkVoortgangBij();

  viering.querySelector(".opnieuw").addEventListener("click", () => {
    // Opnieuw poetsen: via de router opnieuw tonen. De router ruimt eerst het
    // oude canvas op (RAF + listeners) en rendert dan een vers scherm met
    // nieuw verspreid vuil + rommel.
    vervang("schoonmaak", { huisId, kamerId });
  });

  // Geef de router een opruim-functie terug zodat het canvas (RAF + listeners)
  // wordt afgebroken zodra we weg-navigeren.
  return () => {
    clearTimeout(hintTimer);
    spel.destroy();
  };
}

// kleine helpers
function el(tag, klasse, tekst) {
  const e = document.createElement(tag);
  if (klasse) e.className = klasse;
  if (tekst != null) e.textContent = tekst;
  return e;
}
function rnd(a, b) { return a + Math.random() * (b - a); }
