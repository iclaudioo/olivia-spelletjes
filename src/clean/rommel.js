// Rommel-naar-prullenbak: maakt sleepbare rommel-emoji en de prullenbak-logica.
// Apart van clean.js zodat het scherm netjes kan opruimen (geen pointer-lekken)
// en de combinatie-voortgang los blijft van de sleeplogica.
//
// Sleeplogica met Pointer Events (werkt op iPad). Elk rommel-item vangt zijn
// eigen pointer; daardoor blokkeert het de veeg-vanger niet en andersom.

import { ontgrendelAudio } from "../audio/sfx.js";

// maakRommel({ wrap, rommelLaag, prullenbak, items, onWeg })
//   wrap        — de .kamer-wrap (voor coördinaten-omrekening)
//   rommelLaag  — de laag waarin de items komen
//   prullenbak  — het doel-element (hit-test)
//   items       — array van emoji-strings
//   onWeg(cx,cy)— callback wanneer een item in de bak belandt (clientcoördinaten)
//
// Geeft terug: { fractie(), over(), destroy() }
export function maakRommel({ wrap, rommelLaag, prullenbak, items = [], onWeg }) {
  const rommelItems = []; // { el, omlaag, beweeg, omhoog } voor nette teardown
  const totaal = items.length;
  let over = items.length;

  rommelLaag.innerHTML = "";
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
    function omhoog() {
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

    rommelItems.push({ el: item, omlaag, beweeg, omhoog });
  }

  function gooieWeg(item, cx, cy) {
    item.classList.add("weg");
    prullenbak.classList.add("hap");
    setTimeout(() => prullenbak.classList.remove("hap"), 220);
    over = Math.max(0, over - 1);
    onWeg?.(cx, cy);
    setTimeout(() => item.remove(), 220);
  }

  // Fractie opgeruimde rommel (0..1). Geen rommel = volledig "schoon".
  function fractie() {
    if (totaal === 0) return 1;
    return (totaal - over) / totaal;
  }

  return {
    fractie,
    over: () => over,
    destroy() {
      for (const { el: item, omlaag, beweeg, omhoog } of rommelItems) {
        item.removeEventListener("pointerdown", omlaag);
        item.removeEventListener("pointermove", beweeg);
        item.removeEventListener("pointerup", omhoog);
        item.removeEventListener("pointercancel", omhoog);
        item.remove();
      }
      rommelItems.length = 0;
    },
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
