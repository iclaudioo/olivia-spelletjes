// Het schoonmaak-scherm: kamer + voortgangsbalk + toolbar + "klaar!"-viering.

import { woonkamerSVG } from "../art/room.js";
import { TOOLS, toolById } from "../clean/tools.js";
import { maakSchoonmaak } from "../clean/canvas.js";
import { getStaat, voegMuntenToe, markeerKamerKlaar } from "../state.js";
import { muntGeluid, vieringGeluid, ontgrendelAudio } from "../audio/sfx.js";

export function toonSchoonmaak(app, { kamerId = "woonkamer", opnieuw = false } = {}) {
  const staat = getStaat();
  app.innerHTML = "";

  // ---- Topbalk ----
  const top = el("div", "topbar");
  const titel = el("div", "titel", "🧹 Maak de kamer schoon!");
  const spacer = el("div", "spacer");
  const munten = el("div", "munten");
  munten.innerHTML = `<span class="coin">★</span><span class="muntwaarde">${staat.munten}</span>`;
  top.append(titel, spacer, munten);

  // ---- Kamer ----
  const scherm = el("div", "clean-scherm");
  const wrap = el("div", "kamer-wrap");
  wrap.innerHTML = woonkamerSVG;

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
      <div class="beloning">+25 ★</div>
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
    },
    onKlaar() {
      const al = staat.kamers[kamerId]?.klaar;
      markeerKamerKlaar(kamerId);
      if (!al) {
        const nieuw = voegMuntenToe(25);
        munten.querySelector(".muntwaarde").textContent = nieuw;
        munten.querySelector(".coin").classList.add("pop");
      }
      vieringGeluid();
      setTimeout(() => muntGeluid(), 400);
      setTimeout(() => viering.classList.add("aan"), 500);
    },
  });

  kiesTool(actieveTool);

  viering.querySelector(".opnieuw").addEventListener("click", () => {
    toonSchoonmaak(app, { kamerId, opnieuw: true });
  });
}

// kleine helper
function el(tag, klasse, tekst) {
  const e = document.createElement(tag);
  if (klasse) e.className = klasse;
  if (tekst != null) e.textContent = tekst;
  return e;
}
