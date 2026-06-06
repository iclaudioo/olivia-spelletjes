// Toast: een vriendelijke pop-up boven-midden in het scherm. Wordt gebruikt voor
// nieuwe-sticker-meldingen ("Nieuwe sticker! 🧼 Eerste kamer schoon!") én voor
// losse meldingen zoals de Mama-feature ("Oei! Mama heeft de ... vies gemaakt!").
// De toast verschijnt, blijft ~2,5s staan en verdwijnt dan weer via een CSS-
// animatie. Worden er meerdere toasts tegelijk getriggerd, dan worden ze netjes
// achter elkaar in een rij getoond (queue) zodat ze elkaar niet overlappen.
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

// De wachtrij van nog-te-tonen toasts + of er nu eentje actief is. Elk item is
// een "opbouw"-functie die de inhoud van de toast vult (zodat sticker- en
// generieke toasts dezelfde queue/levenscyclus delen maar eigen opmaak hebben).
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

// Generieke toast: een eenvoudige boven-midden pop-up met een emoji + tekst.
// Voorbeeld: toonToast({ emoji: "🙈", tekst: "Oei! Mama heeft ..." }).
export function toonToast({ emoji, tekst } = {}) {
  if (!tekst && !emoji) return;
  wachtrij.push((toast) => {
    toast.classList.add("toast-bericht");

    const lijf = document.createElement("div");
    lijf.className = "sticker-toast-lijf";

    if (emoji) {
      const e = document.createElement("span");
      e.className = "sticker-toast-emoji";
      e.textContent = emoji;
      lijf.append(e);
    }

    const t = document.createElement("span");
    t.className = "sticker-toast-tekst";
    t.textContent = tekst || "";
    lijf.append(t);

    toast.append(lijf);
  });
  if (!bezig) volgende();
}

// Toon een toast voor een sticker (definitie uit de catalogus: { emoji, naam }).
// Meerdere snel-achter-elkaar aanroepen worden in de rij gezet. Hergebruikt
// dezelfde queue/levenscyclus als toonToast (alleen de opmaak verschilt).
export function toonStickerToast(sticker) {
  if (!sticker) return;
  // Vrolijk sparkle-deuntje hoort specifiek bij een sticker-beloning. Generieke
  // toasts (zoals de plagende Mama-melding) hebben hun eigen geluid in de
  // aanroeper en mogen hier dus NIET ook nog sparkelen.
  sparkleGeluid();
  wachtrij.push((toast) => {
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
  });
  if (!bezig) volgende();
}

// Gedeelde helper: ken nieuw-verdiende stickers toe (via de staat, met dedup) en
// vier elke nieuwe met een toast. Vervangt het vroegere, per-scherm gedupliceerde
// `for (const id of verdienStickers()) toonStickerToast(stickerById(id))`.
export function vierVerdiendeStickers() {
  for (const id of verdienStickers()) toonStickerToast(stickerById(id));
}

function volgende() {
  const vul = wachtrij.shift();
  if (!vul) {
    bezig = false;
    return;
  }
  bezig = true;

  const laag = getLaag();
  const toast = document.createElement("div");
  toast.className = "sticker-toast";
  toast.setAttribute("role", "status");

  // De opbouw-functie vult de inhoud (sticker- of generieke opmaak).
  vul(toast);
  laag.append(toast);

  // Géén geluid in de gedeelde levenscyclus: een sticker-toast speelt zelf het
  // sparkle-deuntje (zie toonStickerToast) en een generieke toast laat het geluid
  // over aan de aanroeper (bijv. Mama's eigen whoops in house.js). Zo klinkt er
  // nooit een dubbel/verkeerd geluidje.

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
