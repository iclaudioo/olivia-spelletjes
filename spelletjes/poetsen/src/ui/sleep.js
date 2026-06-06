// Gedeelde sleep-controller met Pointer Events (werkt op iPad). Voorheen hadden
// zowel de rommel-emoji (clean/rommel.js) als de meubels (screens/decorate.js)
// een eigen, bijna identieke kopie van dezelfde sleeplogica. Die zit nu hier op
// één plek: pointerdown/move/up/cancel, setPointerCapture in try/catch, de
// greep-offset berekenen, losse up-events negeren en netjes loskoppelen.
//
// Gebruik:
//   const grip = maakSleepbaar(el, {
//     onStart(info) {},   // bij pointerdown (na capture); info = { e, clientX, clientY }
//     onBeweeg(info) {},  // tijdens slepen; info = { e, clientX, clientY, dx, dy }
//     onLos(info) {},     // bij loslaten/cancel; info = { clientX, clientY, dx, dy }
//   });
//   ...later: grip.los();  // alle listeners loskoppelen (geen lekken)
//
// info-velden:
//   clientX/clientY — de pointerpositie in client-coördinaten
//   dx/dy           — de greep-offset: clientX/Y minus het midden van `el` bij
//                     het oppakken. Zo kan de aanroeper het element exact onder
//                     de vinger houden (positie = client − greep-offset).
export function maakSleepbaar(el, { onStart, onBeweeg, onLos } = {}) {
  let sleept = false;
  let dx = 0, dy = 0; // greep-offset t.o.v. het midden van het element

  function omlaag(e) {
    e.preventDefault();
    e.stopPropagation();
    sleept = true;
    try { el.setPointerCapture?.(e.pointerId); } catch { /* negeren */ }
    const r = el.getBoundingClientRect();
    dx = e.clientX - (r.left + r.width / 2);
    dy = e.clientY - (r.top + r.height / 2);
    onStart?.({ e, clientX: e.clientX, clientY: e.clientY });
  }

  function beweeg(e) {
    if (!sleept) return; // losse move-events negeren
    e.preventDefault();
    onBeweeg?.({ e, clientX: e.clientX, clientY: e.clientY, dx, dy });
  }

  function omhoog(e) {
    if (!sleept) return; // losse/stray up-events negeren
    sleept = false;
    onLos?.({
      e,
      clientX: e?.clientX,
      clientY: e?.clientY,
      dx,
      dy,
    });
  }

  el.addEventListener("pointerdown", omlaag);
  el.addEventListener("pointermove", beweeg);
  el.addEventListener("pointerup", omhoog);
  el.addEventListener("pointercancel", omhoog);

  return {
    los() {
      el.removeEventListener("pointerdown", omlaag);
      el.removeEventListener("pointermove", beweeg);
      el.removeEventListener("pointerup", omhoog);
      el.removeEventListener("pointercancel", omhoog);
    },
  };
}
