// Sticker-toast: een vriendelijke pop-up boven-midden in het scherm die meldt
// dat er een nieuwe sticker verdiend is ("Nieuwe sticker! 🧼 Eerste kamer
// schoon!"). De toast verschijnt, blijft ~2,5s staan en verdwijnt dan weer via
// een CSS-animatie. Worden er meerdere stickers tegelijk verdiend, dan worden ze
// netjes achter elkaar in een rij getoond (queue) zodat ze elkaar niet overlappen.
//
// Belangrijk: timers en DOM-elementen worden altijd opgeruimd nadat een toast
// weg is, zodat er niets lekt — ook niet als je tussendoor weg-navigeert.

import { sparkleGeluid } from "../audio/sfx.js";
import { verdienStickers } from "../state.js";
import { stickerById } from "../data/stickers.js";

// Hoe lang een toast zichtbaar blijft vóór hij vervaagt (sluit aan op de CSS).
const TOON_MS = 2500;
// Extra tijd voor de uit-animatie voordat we het element echt verwijderen.
const UIT_MS = 350;

// De wachtrij van nog-te-tonen stickers + of er nu eentje actief is.
const wachtrij = [];
let bezig = false;

// Eén losse container voor alle toasts (lazily aangemaakt, daarna hergebruikt).
let laag = null;
function getLaag() {
  if (laag && document.body.contains(laag)) return laag;
  laag = document.createElement("div");
  laag.className = "sticker-toast-laag";
  document.body.append(laag);
  return laag;
}

// Toon een toast voor een sticker (definitie uit de catalogus: { emoji, naam }).
// Meerdere snel-achter-elkaar aanroepen worden in de rij gezet.
export function toonStickerToast(sticker) {
  if (!sticker) return;
  wachtrij.push(sticker);
  if (!bezig) volgende();
}

// Gedeelde helper: ken nieuw-verdiende stickers toe (via de staat, met dedup) en
// vier elke nieuwe met een toast. Vervangt het vroegere, per-scherm gedupliceerde
// `for (const id of verdienStickers()) toonStickerToast(stickerById(id))`.
export function vierVerdiendeStickers() {
  for (const id of verdienStickers()) toonStickerToast(stickerById(id));
}

function volgende() {
  const sticker = wachtrij.shift();
  if (!sticker) {
    bezig = false;
    return;
  }
  bezig = true;

  const laag = getLaag();
  const toast = document.createElement("div");
  toast.className = "sticker-toast";
  toast.setAttribute("role", "status");

  const kop = document.createElement("div");
  kop.className = "sticker-toast-kop";
  kop.textContent = "Nieuwe sticker!";

  const lijf = document.createElement("div");
  lijf.className = "sticker-toast-lijf";

  const emoji = document.createElement("span");
  emoji.className = "sticker-toast-emoji";
  emoji.textContent = sticker.emoji;

  const naam = document.createElement("span");
  naam.className = "sticker-toast-naam";
  naam.textContent = sticker.naam;

  lijf.append(emoji, naam);
  toast.append(kop, lijf);
  laag.append(toast);

  // Vrolijk geluidje bij het verschijnen.
  sparkleGeluid();

  // Na de toon-tijd de uit-animatie starten, daarna het element verwijderen en
  // de volgende uit de rij tonen. Timers worden opgeruimd door het verwijderen.
  const verbergTimer = setTimeout(() => {
    toast.classList.add("weg");
    const wegTimer = setTimeout(() => {
      toast.remove();
      // Lege laag opruimen zodat er geen leeg element blijft hangen.
      if (laag.childElementCount === 0 && document.body.contains(laag)) {
        laag.remove();
      }
      volgende();
    }, UIT_MS);
    // wegTimer hoeft niet bewaard te worden: hij vuurt sowieso en ruimt zichzelf op.
    void wegTimer;
  }, TOON_MS);
  void verbergTimer;
}
