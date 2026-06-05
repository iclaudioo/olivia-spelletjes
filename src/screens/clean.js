// Het schoonmaak-scherm: kamer + voortgangsbalk + toolbar + "klaar!"-viering.

import { woonkamerSVG } from "../art/room.js";
import { TOOLS, toolById } from "../clean/tools.js";
import { maakSchoonmaak } from "../clean/canvas.js";
import {
  getStaat,
  getKamer,
  setKamerSchoon,
  markeerKamerKlaar,
  voegMuntenToe,
} from "../state.js";
import { maakTopbar } from "../ui/topbar.js";
import { navigeer, terug } from "../router.js";
import { muntGeluid, vieringGeluid, ontgrendelAudio } from "../audio/sfx.js";

// Beloning voor een schoongemaakte kamer.
const BELONING = 25;

// Kamer-kunst per kamer (later breidt dit uit). Valt terug op de woonkamer.
const KAMER_ART = {
  woonkamer: woonkamerSVG,
};

export function toon(app, { huisId = "thuis", kamerId = "woonkamer" } = {}) {
  const staat = getStaat();
  app.innerHTML = "";

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
  wrap.innerHTML = KAMER_ART[kamerId] || woonkamerSVG;

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

  const hint = el("div", "cursief-hint", "Veeg met je vinger over het vuil 👆");

  app.append(top, scherm, toolbar, hint);

  // ---- Logica ----
  let actieveTool = TOOLS[0].id;
  function kiesTool(id) {
    ontgrendelAudio();
    actieveTool = id;
    knoppen.forEach((k) => k.el.classList.toggle("actief", k.id === id));
    spel.setTool(toolById(id));
  }

  const spel = maakSchoonmaak({
    wrap,
    onProgress(pct) {
      const p = Math.round(pct * 100);
      vul.style.width = p + "%";
      lbl.textContent = p + "% schoon";
      if (p > 0) hint.style.visibility = "hidden";
      // Voortgang bewaren zolang de kamer nog niet klaar is.
      if (!getKamer(huisId, kamerId)?.klaar) {
        setKamerSchoon(huisId, kamerId, p);
      }
    },
    onKlaar() {
      const alKlaar = getKamer(huisId, kamerId)?.klaar;
      markeerKamerKlaar(huisId, kamerId);
      if (!alKlaar) {
        const nieuw = voegMuntenToe(BELONING);
        updateMunten(nieuw, true);
      }
      vieringGeluid();
      setTimeout(() => muntGeluid(), 400);
      setTimeout(() => viering.classList.add("aan"), 500);
    },
  });

  kiesTool(actieveTool);

  viering.querySelector(".opnieuw").addEventListener("click", () => {
    // Opnieuw poetsen: dezelfde kamer opnieuw tonen.
    spel.destroy();
    toon(app, { huisId, kamerId });
  });
}

// kleine helper
function el(tag, klasse, tekst) {
  const e = document.createElement(tag);
  if (klasse) e.className = klasse;
  if (tekst != null) e.textContent = tekst;
  return e;
}
