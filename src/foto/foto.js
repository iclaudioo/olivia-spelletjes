// Foto-modus: render de HUIDIGE ingerichte kamer (schone kamer-SVG + behang/
// vloer-tint + geplaatste meubels op hun bewaarde posities) naar een PNG. We doen
// de SVG→canvas-rasterisatie met de hand (geen externe library): elke SVG-string
// wordt naar een Blob-URL geschreven, in een <img> geladen en op een offscreen
// <canvas> getekend. De tints reproduceren we met globalCompositeOperation
// "multiply", net als de on-screen mix-blend-mode: multiply overlays.
//
// De SVG's zijn zelfstandige inline-strings zonder externe verwijzingen, dus het
// canvas raakt niet "tainted" en toDataURL("image/png") werkt gewoon.

import { kamerArt, vloerGrens } from "../art/kamers.js";
import { meubelSVG, behangKleur, vloerKleur } from "../art/meubels.js";

// Een SVG-string naar een geladen Image-object rasteriseren via een Blob-URL.
// We zorgen dat de <svg> expliciete width/height heeft (anders rastert Safari
// onbetrouwbaar) en ruimen de object-URL netjes op, ook bij een fout.
function svgNaarImage(svgString, valWidth, valHeight) {
  const metMaat = zorgVoorMaat(svgString, valWidth, valHeight);
  const blob = new Blob([metMaat], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

// Injecteert width/height op de <svg>-openingstag als die nog ontbreken. Heeft de
// SVG al een width/height (of viewBox + onze waarden), dan laten we hem met rust.
function zorgVoorMaat(svgString, breedte, hoogte) {
  return svgString.replace(/<svg\b([^>]*)>/, (heel, attrs) => {
    let nieuw = attrs;
    if (!/\bwidth\s*=/.test(nieuw)) nieuw += ` width="${breedte}"`;
    if (!/\bheight\s*=/.test(nieuw)) nieuw += ` height="${hoogte}"`;
    return `<svg${nieuw}>`;
  });
}

// Maakt een PNG-data-URL van de ingerichte kamer.
//   art    — kamer-art-sleutel (bv. "woonkamer")
//   decor  — { meubels:[{id,x,y}], behang, vloer }
//   breedte — PNG-breedte in px (hoogte = breedte * 0.75, 4:3 zoals de viewBox)
export async function maakKamerFoto({ art, decor, breedte = 1000 }) {
  const W = breedte;
  const H = Math.round(breedte * 0.75);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // 1) De schone kamer-SVG (viewBox 800x600) over het hele canvas tekenen.
  const kamerImg = await svgNaarImage(kamerArt(art), 800, 600);
  ctx.drawImage(kamerImg, 0, 0, W, H);

  // 2) Tints: behang boven de naad, vloer eronder — met "multiply" zodat het de
  //    kamer-kunst hertint i.p.v. dekt (gelijk aan de on-screen overlays).
  const grens = vloerGrens(art);
  const grensY = grens * H;
  ctx.globalCompositeOperation = "multiply";
  const muurKleur = behangKleur(decor?.behang);
  if (muurKleur) {
    ctx.fillStyle = muurKleur;
    ctx.fillRect(0, 0, W, grensY);
  }
  const grondKleur = vloerKleur(decor?.vloer);
  if (grondKleur) {
    ctx.fillStyle = grondKleur;
    ctx.fillRect(0, grensY, W, H - grensY);
  }
  ctx.globalCompositeOperation = "source-over";

  // 3) Meubels in array-volgorde tekenen, gecentreerd op (x*W, y*H). De grootte
  //    sluit aan op de on-screen sprite (~0.16*W vierkant).
  const meubelMaat = 0.16 * W;
  const meubels = Array.isArray(decor?.meubels) ? decor.meubels : [];
  for (const m of meubels) {
    const svg = meubelSVG(m.id);
    if (!svg) continue;
    const img = await svgNaarImage(svg, 120, 120);
    const cx = m.x * W;
    const cy = m.y * H;
    ctx.drawImage(img, cx - meubelMaat / 2, cy - meubelMaat / 2, meubelMaat, meubelMaat);
  }

  // 4) Klaar — als PNG-data-URL teruggeven.
  return canvas.toDataURL("image/png");
}
