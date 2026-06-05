// Inricht-scherm (M4 — decoreren): een SCHONE kamer aankleden.
// Je plaatst meubels (sleepbaar), kiest een behang- en vloer-kleur, en alles
// wordt direct bewaard zodat het bij terugkomst nog precies zo staat.
//
// Belangrijk:
//  - Geen vuil/rommel hier; we tonen de schone kamer-SVG.
//  - Muur/vloer worden getint met twee overlay-lagen (mix-blend-mode: multiply)
//    in de GERESERVEERDE z-index-band 8–9, zodat ze boven de kamer-SVG maar
//    onder de meubels/bediening zitten. De tint-lagen zijn pointer-events:none
//    zodat ze het slepen van meubels niet blokkeren.
//  - Slepen met Pointer Events (touch-action:none, setPointerCapture in try,
//    pointercancel afgehandeld). Het scherm geeft een opruim-functie terug die
//    alle meubel-listeners netjes loskoppelt — net als clean.js/rommel.js.

import { kamerArt, vloerGrens } from "../art/kamers.js";
import {
  MEUBELS,
  MEUBEL_LIJST,
  meubelSVG,
  meubelPrijs,
  BEHANG_KLEUREN,
  VLOER_KLEUREN,
  behangKleur,
  vloerKleur,
} from "../art/meubels.js";
import {
  getStaat,
  getKamerStaat,
  setKamerDecor,
  bezitMeubel,
  verdienStickers,
} from "../state.js";
import { getKamerDef } from "../data/huizen.js";
import { stickerById } from "../data/stickers.js";
import { maakTopbar } from "../ui/topbar.js";
import { maak as el } from "../ui/dom.js";
import { toonStickerToast } from "../ui/toast.js";
import { maakSleepbaar } from "../ui/sleep.js";
import { terug } from "../router.js";
import { sparkleGeluid, ontgrendelAudio } from "../audio/sfx.js";

// Standaard-hint onderaan het inricht-scherm. Eén bron zodat de begin-hint en
// het herstel na een koop-tip exact dezelfde tekst tonen.
const STANDAARD_HINT =
  "Tik een meubel en sleep het op z'n plek. Sleep naar 🗑️ om het weg te halen.";

export function toon(app, { huisId = "thuis", kamerId = "woonkamer" } = {}) {
  const staat = getStaat();
  app.innerHTML = "";

  const kamerDef = getKamerDef(huisId, kamerId);
  const art = kamerDef?.art;

  // ---- Decor laden (diep gekopieerd; we bewaren bij elke wijziging) ----
  const opgeslagen = getKamerStaat(huisId, kamerId)?.decor;
  const decor = normaliseerDecor(opgeslagen);

  // ---- Topbalk ----
  const { el: top, updateMunten } = maakTopbar({
    titel: "🛋️ Richt in",
    opTerug: () => terug(),
    toonMunten: true,
  });
  updateMunten(staat.munten);

  // ---- Kamer ----
  const scherm = el("div", "clean-scherm");
  const wrap = el("div", "kamer-wrap");
  wrap.innerHTML = kamerArt(art);

  // ---- Tint-lagen voor muur (boven de naad) en vloer (onder de naad) ----
  // mix-blend-mode: multiply hertint de bestaande kamer-kunst i.p.v. dekken.
  // De muur/vloer-naad verschilt per kamer; daarom zetten we de grens als CSS-
  // custom-property zodat de tint-band precies op de echte naad stopt i.p.v. een
  // vaste 62/38-verdeling. Standaard 0.62 voor onbekende sleutels.
  const grens = vloerGrens(art);
  wrap.style.setProperty("--vloer-grens", grens * 100 + "%");
  const behangLaag = el("div", "tint-laag tint-behang");
  const vloerLaag = el("div", "tint-laag tint-vloer");
  wrap.append(behangLaag, vloerLaag);

  // ---- Meubel-laag (geplaatste sprites) ----
  const meubelLaag = el("div", "meubel-laag");
  wrap.append(meubelLaag);

  // ---- Prullenbak-hoek om meubels te verwijderen ----
  const prullenbak = el("div", "inricht-bin", "🗑️");
  wrap.append(prullenbak);

  scherm.append(wrap);

  // ---- Palet-balk (meubels + kleuren) ----
  const palet = el("div", "palet");

  // Sectie: Meubels
  const meubelSectie = el("div", "palet-sectie");
  meubelSectie.append(el("div", "palet-titel", "Meubels"));
  const meubelRij = el("div", "palet-rij");
  for (const id of MEUBEL_LIJST) {
    const def = MEUBELS[id];
    const bezit = bezitMeubel(id);
    const knop = el("button", bezit ? "palet-item" : "palet-item op-slot");
    knop.innerHTML = def.svg;
    knop.setAttribute("aria-label", def.naam);
    if (bezit) {
      knop.addEventListener("click", () => voegMeubelToe(id));
    } else {
      // Slot-overlay: hangslot + prijs. Tikken plaatst niet, maar geeft een hint.
      const slot = el("div", "palet-slot");
      slot.append(el("span", "palet-slot-emoji", "🔒"), el("span", "palet-slot-prijs", `★${meubelPrijs(id)}`));
      knop.append(slot);
      knop.addEventListener("click", () => toonKoopHint());
    }
    meubelRij.append(knop);
  }
  meubelSectie.append(meubelRij);

  // Sectie: Behang
  const behangSectie = el("div", "palet-sectie");
  behangSectie.append(el("div", "palet-titel", "Behang"));
  const behangRij = el("div", "palet-rij");
  const behangSwatches = maakSwatches(BEHANG_KLEUREN, (id) => kiesBehang(id));
  for (const s of behangSwatches) behangRij.append(s.el);
  behangSectie.append(behangRij);

  // Sectie: Vloer
  const vloerSectie = el("div", "palet-sectie");
  vloerSectie.append(el("div", "palet-titel", "Vloer"));
  const vloerRij = el("div", "palet-rij");
  const vloerSwatches = maakSwatches(VLOER_KLEUREN, (id) => kiesVloer(id));
  for (const s of vloerSwatches) vloerRij.append(s.el);
  vloerSectie.append(vloerRij);

  palet.append(meubelSectie, behangSectie, vloerSectie);

  const hint = el("div", "cursief-hint", STANDAARD_HINT);

  app.append(top, scherm, palet, hint);

  // ---- Beheer van geplaatste meubels ----
  // Elke sleepbare sprite onthoudt zijn grip (van maakSleepbaar) zodat we de
  // pointer-listeners netjes kunnen loskoppelen bij opruimen.
  const sprites = []; // { el, data, grip }

  // Tint + swatch-selectie eerst tonen op basis van geladen decor.
  pasBehangToe();
  pasVloerToe();
  // Bestaande meubels renderen.
  for (const m of decor.meubels) maakSprite(m);

  // ---- Persist-helper ----
  function bewaarDecor() {
    setKamerDecor(huisId, kamerId, decor);
  }

  // Eventueel verdiende stickers toekennen en vieren (bv. "inrichter" zodra je
  // een meubel neerzet, of "kleurexpert" bij behang + vloer). Dedup zit in de
  // staat, dus herhaalde acties leveren niets dubbels op.
  function vierStickers() {
    for (const id of verdienStickers()) toonStickerToast(stickerById(id));
  }

  // ---- Hint tonen bij een tik op een meubel-op-slot (gesloten meubel) ----
  // Vervangt kort de standaard-hint door een vriendelijke koop-tip en flitst hem.
  let hintTimer = null;
  function toonKoopHint() {
    ontgrendelAudio();
    hint.textContent = "Koop dit eerst in de winkel! 🛒";
    hint.classList.remove("flits");
    void hint.offsetWidth; // reflow zodat de animatie opnieuw start
    hint.classList.add("flits");
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => {
      hint.textContent = STANDAARD_HINT;
      hint.classList.remove("flits");
    }, 1800);
  }

  // ---- Meubel toevoegen (verschijnt bij het midden; kind sleept het dan) ----
  function voegMeubelToe(id) {
    ontgrendelAudio();
    const m = { id, x: 0.5, y: 0.55 };
    decor.meubels.push(m);
    maakSprite(m);
    bewaarDecor();
    sparkleGeluid();
    vierStickers();
  }

  // ---- Eén sleepbare sprite maken voor een decor-meubel ----
  function maakSprite(m) {
    const sprite = el("div", "meubel");
    sprite.innerHTML = meubelSVG(m.id);
    plaats(sprite, m);
    meubelLaag.append(sprite);

    // De gedeelde sleep-controller doet pointerdown/move/up/cancel + capture.
    // Wij schrijven de genormaliseerde positie terug in het decor-model en
    // beslissen bij loslaten of het meubel in de prullenbak belandt.
    const grip = maakSleepbaar(sprite, {
      onStart() {
        ontgrendelAudio();
        sprite.classList.add("sleept");
      },
      onBeweeg({ clientX, clientY, dx, dy }) {
        const wrapR = wrap.getBoundingClientRect();
        let nx = (clientX - dx - wrapR.left) / wrapR.width;
        let ny = (clientY - dy - wrapR.top) / wrapR.height;
        nx = Math.max(0, Math.min(1, nx));
        ny = Math.max(0, Math.min(1, ny));
        m.x = nx;
        m.y = ny;
        plaats(sprite, m, true);
        // Boven de prullenbak? Visueel hint geven.
        sprite.classList.toggle("boven-bin", bovenBin(sprite));
      },
      onLos() {
        sprite.classList.remove("sleept");
        plaats(sprite, m);
        if (bovenBin(sprite)) {
          verwijderSprite(sprite, m);
          return;
        }
        sprite.classList.remove("boven-bin");
        bewaarDecor();
      },
    });

    sprites.push({ el: sprite, data: m, grip });
  }

  // Sprite positioneren uit genormaliseerde x,y. `groot` = lichte vergroting tijdens slepen.
  function plaats(sprite, m, groot = false) {
    sprite.style.left = m.x * 100 + "%";
    sprite.style.top = m.y * 100 + "%";
    sprite.style.transform = groot
      ? "translate(-50%, -50%) scale(1.12)"
      : "translate(-50%, -50%)";
  }

  // Raakt het midden van de sprite de prullenbak-hoek?
  function bovenBin(sprite) {
    const ir = sprite.getBoundingClientRect();
    const pr = prullenbak.getBoundingClientRect();
    const cx = ir.left + ir.width / 2;
    const cy = ir.top + ir.height / 2;
    return cx >= pr.left && cx <= pr.right && cy >= pr.top && cy <= pr.bottom;
  }

  // Een geplaatst meubel weghalen (uit DOM, data en listeners) en bewaren.
  function verwijderSprite(sprite, m) {
    prullenbak.classList.add("hap");
    setTimeout(() => prullenbak.classList.remove("hap"), 220);

    const idx = sprites.findIndex((s) => s.el === sprite);
    if (idx >= 0) {
      sprites[idx].grip.los(); // pointer-listeners loskoppelen
      sprites.splice(idx, 1);
    }
    sprite.classList.add("weg");
    setTimeout(() => sprite.remove(), 200);

    const di = decor.meubels.indexOf(m);
    if (di >= 0) decor.meubels.splice(di, 1);
    bewaarDecor();
    sparkleGeluid();
  }

  // ---- Kleur-keuze ----
  function kiesBehang(id) {
    ontgrendelAudio();
    decor.behang = decor.behang === id ? null : id; // nogmaals tikken = uit
    pasBehangToe();
    bewaarDecor();
    vierStickers();
  }
  function kiesVloer(id) {
    ontgrendelAudio();
    decor.vloer = decor.vloer === id ? null : id;
    pasVloerToe();
    bewaarDecor();
    vierStickers();
  }

  function pasBehangToe() {
    const kleur = behangKleur(decor.behang);
    if (kleur) {
      behangLaag.style.background = kleur;
      behangLaag.style.display = "block";
    } else {
      behangLaag.style.display = "none";
    }
    behangSwatches.forEach((s) => s.el.classList.toggle("gekozen", s.id === decor.behang));
  }
  function pasVloerToe() {
    const kleur = vloerKleur(decor.vloer);
    if (kleur) {
      vloerLaag.style.background = kleur;
      vloerLaag.style.display = "block";
    } else {
      vloerLaag.style.display = "none";
    }
    vloerSwatches.forEach((s) => s.el.classList.toggle("gekozen", s.id === decor.vloer));
  }

  // ---- Opruimen: alle meubel-pointer-listeners loskoppelen (geen lekken) ----
  return () => {
    clearTimeout(hintTimer);
    for (const s of sprites) {
      s.grip.los();
      s.el.remove();
    }
    sprites.length = 0;
  };
}

// Kleur-swatches bouwen; geeft [{ id, el }] terug. opKies(id) bij een tik.
function maakSwatches(kleuren, opKies) {
  return kleuren.map(({ id, kleur }) => {
    const knop = el("button", "swatch");
    knop.style.background = kleur;
    knop.setAttribute("aria-label", id);
    knop.addEventListener("click", () => opKies(id));
    return { id, el: knop };
  });
}

// Maakt van (mogelijk oude/onvolledige) opgeslagen decor een veilige kopie met
// de volledige v4-vorm. We werken op een kopie zodat de staat alleen via
// setKamerDecor wordt aangeraakt.
function normaliseerDecor(d) {
  const bron = d && typeof d === "object" && !Array.isArray(d) ? d : {};
  const meubels = Array.isArray(bron.meubels)
    ? bron.meubels
        .filter((m) => m && MEUBELS[m.id])
        .map((m) => ({
          id: m.id,
          x: klem(m.x, 0.5),
          y: klem(m.y, 0.55),
        }))
    : [];
  return {
    meubels,
    behang: typeof bron.behang === "string" ? bron.behang : null,
    vloer: typeof bron.vloer === "string" ? bron.vloer : null,
  };
}

function klem(v, terugval) {
  const n = Number(v);
  if (!Number.isFinite(n)) return terugval;
  return Math.max(0, Math.min(1, n));
}
