// Verzamelboek: het sticker-album. Toont ÁLLE stickers uit de catalogus als
// een rooster. Verdiende stickers staan vol in kleur (grote emoji + naam);
// nog-niet-verdiende staan als grijs silhouet met de beschrijving als hint
// (zo zie je hóe je ze kunt verdienen). Bovenaan een teller "X / N stickers".
//
// Metadata (naam, emoji, beschrijving) komt uit de catalogus; welke verdiend
// zijn komt uit de staat (staat.stickers).

import { getStaat } from "../state.js";
import { STICKERS, STICKER_AANTAL } from "../data/stickers.js";
import { terug } from "../router.js";
import { maakTopbar } from "../ui/topbar.js";
import { maak } from "../ui/dom.js";

export function toon(app, _params = {}) {
  const staat = getStaat();
  app.innerHTML = "";

  // ---- Topbalk met terug-knop naar het beginscherm ----
  const { el: top, updateMunten } = maakTopbar({
    titel: "📖 Verzamelboek",
    opTerug: () => terug(),
    toonMunten: true,
  });
  updateMunten(staat.munten);

  const scherm = maak("div", "verzamel-scherm");

  // ---- Teller "X / N stickers" ----
  const verdiend = Array.isArray(staat.stickers) ? staat.stickers : [];
  const aantalVerdiend = STICKERS.filter((st) => verdiend.includes(st.id)).length;
  scherm.append(
    maak("div", "verzamel-teller", `${aantalVerdiend} / ${STICKER_AANTAL} stickers`)
  );

  // ---- Rooster met álle stickers ----
  const rooster = maak("div", "sticker-rooster");
  for (const st of STICKERS) {
    const heeft = verdiend.includes(st.id);
    const kaart = maak("div", heeft ? "sticker-kaart" : "sticker-kaart op-slot");

    const emoji = maak("div", "sticker-emoji", heeft ? st.emoji : "❓");
    const naam = maak("div", "sticker-naam", heeft ? st.naam : "???");
    // De beschrijving staat altijd onder de kaart: bij een verdiende sticker als
    // toelichting, bij een nog-niet-verdiende als hint hoe je hem verdient (de
    // naam blijft dan verborgen als verrassing).
    const onder = maak("div", "sticker-hint", st.beschrijving);

    kaart.append(emoji, naam, onder);
    rooster.append(kaart);
  }
  scherm.append(rooster);

  app.append(top, scherm);
}
