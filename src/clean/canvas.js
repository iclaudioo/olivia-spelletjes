// Hart van het spel: getypeerd vuil tekenen in losse lagen (één canvas per
// vuilsoort), met de vinger wegvegen — maar alleen met het JUISTE gereedschap —
// sparkles, het meten van het schoon-percentage, en een vriendelijke hint als
// het verkeerde gereedschap wordt gebruikt.

import { sparkleGeluid } from "../audio/sfx.js";

// Alle bekende vuilsoorten (sleutels gelijk aan tools.js `verwijdert`).
export const VUIL_SOORTEN = ["stof", "vlek", "modder", "aangekoekt", "spinnenweb", "kruimel"];

// Drempel waarboven we ál het vuil als "weg" beschouwen. Gedeeld met clean.js
// zodat het sparkle-feest (hier) en de kamer-klaar-check (daar) gelijk lopen.
export const VUIL_KLAAR_DREMPEL = 0.985;

export function maakSchoonmaak({
  wrap,
  vuilSoorten = ["stof", "vlek", "modder"],
  onProgress,
  onVuilKlaar,
  onSchrob,
  onVerkeerdGereedschap,
}) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  // Alleen geldige, unieke soorten gebruiken.
  const soorten = [...new Set(vuilSoorten)].filter((s) => VUIL_SOORTEN.includes(s));

  // Eén vuil-laag per soort. Elke laag heeft een eigen <canvas> + context.
  // lagen[soort] = { canvas, ctx, beginPixels }
  const lagen = {};
  for (const soort of soorten) {
    const c = document.createElement("canvas");
    c.className = "vuil-canvas";
    c.dataset.soort = soort;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    lagen[soort] = { canvas: c, ctx, beginPixels: 1 };
    wrap.appendChild(c);
  }

  // Effect-laag (sparkles) — staat bovenop en vangt geen aanrakingen.
  const fx = document.createElement("canvas");
  fx.className = "fx-canvas";
  const fctx = fx.getContext("2d");
  wrap.appendChild(fx);

  // Sampling-canvas om snel het schoon-percentage per laag te meten.
  const sample = document.createElement("canvas");
  const sctx = sample.getContext("2d", { willReadFrequently: true });

  let breedte = 0, hoogte = 0;
  let beginTotaal = 1;
  let klaarGemeld = false;
  // Alleen de ALLEReerste keer verspreiden we vers vuil. Bij een latere resize
  // (iPad draaien / Safari split-view) zou opnieuw tekenen de voortgang wissen,
  // dus dán schalen we de bestaande (deels gepoetste) bitmaps mee i.p.v. te
  // hertekenen.
  let eersteKeer = true;

  function passendMaken() {
    const r = wrap.getBoundingClientRect();
    const nieuweBreedte = Math.max(1, Math.round(r.width * dpr));
    const nieuweHoogte = Math.max(1, Math.round(r.height * dpr));

    if (eersteKeer) {
      breedte = nieuweBreedte;
      hoogte = nieuweHoogte;
      for (const soort of soorten) {
        const c = lagen[soort].canvas;
        c.width = breedte; c.height = hoogte;
      }
      fx.width = breedte; fx.height = hoogte;
      sample.width = 90;
      sample.height = Math.max(1, Math.round(90 * (hoogte / breedte)));
      tekenVuil();
      eersteKeer = false;
      return;
    }

    // Echte resize: niets verandert aan de afmetingen → niets te doen.
    if (nieuweBreedte === breedte && nieuweHoogte === hoogte) return;

    // Echte resize: bewaar de huidige (deels gepoetste) bitmap van elke vuil-laag
    // en schaal hem mee naar de nieuwe canvas-grootte. Zo blijven gepoetste/
    // weggeveegde plekken behouden — de voortgang reset NIET naar 0.
    for (const soort of soorten) {
      const c = lagen[soort].canvas;
      // Snapshot op de OUDE grootte.
      const tmp = document.createElement("canvas");
      tmp.width = c.width;
      tmp.height = c.height;
      tmp.getContext("2d").drawImage(c, 0, 0);
      // Canvas naar de nieuwe grootte (dit wist de inhoud) en de snapshot er
      // weer geschaald op tekenen.
      c.width = nieuweBreedte;
      c.height = nieuweHoogte;
      const ctx = lagen[soort].ctx;
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.drawImage(tmp, 0, 0, tmp.width, tmp.height, 0, 0, nieuweBreedte, nieuweHoogte);
    }

    breedte = nieuweBreedte;
    hoogte = nieuweHoogte;

    // fx + sample meeschalen. Sparkles zijn vluchtig, dus die hoeven we niet te
    // bewaren. beginTotaal wordt via het 90px sample-canvas gemeten en blijft
    // dus vergelijkbaar over resoluties heen — niet opnieuw zetten.
    fx.width = breedte; fx.height = hoogte;
    sample.width = 90;
    sample.height = Math.max(1, Math.round(90 * (hoogte / breedte)));
  }

  // ---- Vuil schilderen ----
  function rnd(a, b) { return a + Math.random() * (b - a); }

  function blob(ctx, x, y, r, kleur, alpha) {
    ctx.globalAlpha = alpha;
    const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r);
    g.addColorStop(0, kleur);
    g.addColorStop(1, kleur + "00");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Per-soort schilders. Elk maakt zijn eigen, visueel herkenbare vuil.
  const schilders = {
    // Licht grijze, zachte stofwolken — vooral in de bovenste helft.
    stof(ctx, S) {
      for (let i = 0; i < 28; i++) {
        blob(ctx, rnd(0, breedte), rnd(0, hoogte * 0.7), rnd(45, 95) * S, "#c8c2b6", rnd(0.3, 0.55));
      }
    },
    // Gekleurde/bruine vlekken (spetters).
    vlek(ctx, S) {
      const kleuren = ["#7a5a30", "#8a6a3a", "#9c6f44", "#6f5a2e"];
      for (let i = 0; i < 30; i++) {
        const k = kleuren[(Math.random() * kleuren.length) | 0];
        blob(ctx, rnd(0, breedte), rnd(hoogte * 0.15, hoogte), rnd(28, 64) * S, k, rnd(0.55, 0.85));
      }
    },
    // Donkerbruine modderklodders, dik en stevig.
    modder(ctx, S) {
      ctx.globalCompositeOperation = "source-over";
      for (let i = 0; i < 24; i++) {
        const x = rnd(0, breedte), y = rnd(hoogte * 0.4, hoogte);
        const r = rnd(26, 58) * S;
        ctx.globalAlpha = rnd(0.7, 0.95);
        ctx.fillStyle = "#4a3318";
        ctx.beginPath();
        // grillige klodder
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
          const rr = r * rnd(0.7, 1.1);
          const px = x + Math.cos(a) * rr;
          const py = y + Math.sin(a) * rr;
          a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      }
    },
    // Donkere, knapperige aangekoekte spetters (klein + hard).
    aangekoekt(ctx, S) {
      ctx.globalCompositeOperation = "source-over";
      for (let i = 0; i < 46; i++) {
        ctx.globalAlpha = rnd(0.6, 0.9);
        ctx.fillStyle = i % 3 === 0 ? "#2e1f10" : "#3f2d18";
        ctx.beginPath();
        ctx.arc(rnd(0, breedte), rnd(hoogte * 0.2, hoogte), rnd(5, 16) * S, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    // Witte spinnenwebben, vooral in de hoeken.
    spinnenweb(ctx, S) {
      tekenWeb(ctx, 0, 0, 165 * S, 1);
      tekenWeb(ctx, breedte, 0, 165 * S, -1);
      tekenWeb(ctx, 0, hoogte, 120 * S, 1, -1);
    },
    // Kleine verspreide kruimels (stipjes).
    kruimel(ctx, S) {
      ctx.globalCompositeOperation = "source-over";
      const kleuren = ["#b48a4e", "#caa066", "#8a6a3a"];
      for (let i = 0; i < 70; i++) {
        ctx.globalAlpha = rnd(0.6, 0.95);
        ctx.fillStyle = kleuren[(Math.random() * kleuren.length) | 0];
        ctx.beginPath();
        ctx.arc(rnd(0, breedte), rnd(hoogte * 0.35, hoogte), rnd(3, 8) * S, 0, Math.PI * 2);
        ctx.fill();
      }
    },
  };

  function tekenVuil() {
    const S = breedte / 800; // schaal t.o.v. ontwerpgrootte
    beginTotaal = 0;
    for (const soort of soorten) {
      const { ctx } = lagen[soort];
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, breedte, hoogte);
      ctx.globalAlpha = 1;
      schilders[soort]?.(ctx, S);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "destination-out";
      const n = Math.max(1, telLaag(soort));
      lagen[soort].beginPixels = n;
      beginTotaal += n;
    }
    beginTotaal = Math.max(1, beginTotaal);
    klaarGemeld = false;
  }

  function tekenWeb(ctx, cx, cy, r, richtingX, richtingY = 1) {
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = "#f4f1ea";
    ctx.lineWidth = Math.max(1.8, r * 0.014);
    const lijnen = 6;
    for (let i = 0; i <= lijnen; i++) {
      const a = (Math.PI / 2) * (i / lijnen);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + richtingX * Math.cos(a) * r, cy + richtingY * Math.sin(a) * r);
      ctx.stroke();
    }
    for (let ring = 1; ring <= 4; ring++) {
      const rr = (r / 4) * ring;
      ctx.beginPath();
      for (let i = 0; i <= lijnen; i++) {
        const a = (Math.PI / 2) * (i / lijnen);
        const px = cx + richtingX * Math.cos(a) * rr;
        const py = cy + richtingY * Math.sin(a) * rr;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  // ---- Vegen ----
  let huidigeTool = null;
  let laatst = null;
  let veegt = false;

  function setTool(tool) { huidigeTool = tool; }

  // De lagen die het huidige gereedschap mag wegvegen.
  function actieveLagen() {
    const t = huidigeTool;
    if (!t) return [];
    return (t.verwijdert || []).filter((s) => lagen[s]).map((s) => lagen[s]);
  }

  // De positie binnen het canvas (alle lagen liggen exact op elkaar).
  function pos(e) {
    const r = fx.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) / r.width * breedte,
      y: (e.clientY - r.top) / r.height * hoogte,
    };
  }

  function veeg(x, y) {
    const t = huidigeTool;
    const straal = (t ? t.straal : 46) * (breedte / 800);
    const zacht = t ? t.zachtheid : 0.6;
    for (const laag of actieveLagen()) {
      const ctx = laag.ctx;
      ctx.globalCompositeOperation = "destination-out";
      const g = ctx.createRadialGradient(x, y, straal * (1 - zacht), x, y, straal);
      g.addColorStop(0, "rgba(0,0,0,1)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, straal, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function lijnVeeg(a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const dist = Math.hypot(dx, dy);
    const stap = Math.max(4, (huidigeTool ? huidigeTool.straal : 46) * 0.4);
    const n = Math.max(1, Math.floor(dist / stap));
    for (let i = 0; i <= n; i++) {
      veeg(a.x + (dx * i) / n, a.y + (dy * i) / n);
    }
  }

  // De "vanger": een onzichtbaar canvas bovenop de vuil-lagen (maar onder fx)
  // dat alle aanrakingen voor het vegen opvangt. Zo hoeven de losse vuil-lagen
  // geen pointer-events te hebben en blokkeren ze de rommel-emoji niet.
  const vanger = document.createElement("canvas");
  vanger.className = "veeg-vanger";
  wrap.insertBefore(vanger, fx);

  function vangerPassend() {
    vanger.width = Math.max(1, breedte);
    vanger.height = Math.max(1, hoogte);
  }

  let pixelsVoorStreek = 0;

  function omlaag(e) {
    // Pointer-capture is fijn op de iPad (vinger blijft "vasthouden"), maar mag
    // het vegen nooit blokkeren als de browser 'm weigert.
    try { vanger.setPointerCapture?.(e.pointerId); } catch { /* negeren */ }
    veegt = true;
    laatst = pos(e);
    pixelsVoorStreek = telActieveResterend();
    veeg(laatst.x, laatst.y);
    spawnSparkles(laatst.x, laatst.y, 2);
    onSchrob?.();
    meetThrottled();
  }
  function beweeg(e) {
    if (!veegt) return;
    const p = pos(e);
    lijnVeeg(laatst, p);
    if (Math.random() < 0.5) spawnSparkles(p.x, p.y, 2);
    laatst = p;
    onSchrob?.();
    meetThrottled();
  }
  function omhoog() {
    if (!veegt) return;
    veegt = false;
    laatst = null;
    controleerVerkeerd();
    meet();
  }

  vanger.addEventListener("pointerdown", omlaag);
  vanger.addEventListener("pointermove", beweeg);
  vanger.addEventListener("pointerup", omhoog);
  vanger.addEventListener("pointercancel", omhoog);
  vanger.addEventListener("pointerleave", () => { if (veegt) { controleerVerkeerd(); meet(); } });

  // ---- Voortgang meten ----
  function telLaag(soort) {
    const c = lagen[soort].canvas;
    sctx.clearRect(0, 0, sample.width, sample.height);
    sctx.drawImage(c, 0, 0, sample.width, sample.height);
    const data = sctx.getImageData(0, 0, sample.width, sample.height).data;
    let n = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] > 25) n++;
    return n;
  }

  // Resterend vuil over ALLE lagen samen.
  function telTotaalResterend() {
    let n = 0;
    for (const soort of soorten) n += telLaag(soort);
    return n;
  }

  // Resterend vuil in alleen de lagen die het huidige gereedschap kan weghalen.
  function telActieveResterend() {
    let n = 0;
    const t = huidigeTool;
    if (!t) return 0;
    for (const s of t.verwijdert || []) if (lagen[s]) n += telLaag(s);
    return n;
  }

  // Resterend vuil in lagen die GEEN enkel gereedschap... -> hier: alle lagen
  // die het huidige gereedschap NIET kan weghalen maar die nog wel vuil hebben.
  function telVerkeerdeResterend() {
    let n = 0;
    const t = huidigeTool;
    const kan = new Set((t && t.verwijdert) || []);
    for (const s of soorten) if (!kan.has(s)) n += telLaag(s);
    return n;
  }

  // Na een streek: als er ~0 verwijderbaar vuil weg is, terwijl er nog wél
  // vuil ligt dat dit gereedschap NIET aankan, dan poetste het kind met het
  // verkeerde gereedschap → vriendelijke hint.
  function controleerVerkeerd() {
    const naStreek = telActieveResterend();
    const verwijderd = pixelsVoorStreek - naStreek;
    if (verwijderd <= 2) {
      const verkeerdAanwezig = telVerkeerdeResterend();
      if (verkeerdAanwezig > 4) onVerkeerdGereedschap?.();
    }
  }

  let meetTimer = 0;
  function meetThrottled() {
    if (meetTimer) return;
    meetTimer = setTimeout(() => { meetTimer = 0; meet(); }, 140);
  }

  // De vuil-voortgang als fractie 0..1 over alle lagen samen.
  function vuilFractie() {
    const over = telTotaalResterend();
    let pct = 1 - over / beginTotaal;
    return Math.max(0, Math.min(1, pct));
  }

  function meet() {
    const pct = vuilFractie();
    onProgress?.(pct);
    // De viering/"klaar" wordt door clean.js bepaald (vuil + rommel samen),
    // maar we vuren onVuilKlaar zodra ALLE vuil weg is. Het sparkle-feest doen
    // we hier intern (één keer), zodat clean.js het niet hoeft te herhalen.
    if (pct >= VUIL_KLAAR_DREMPEL && !klaarGemeld) {
      klaarGemeld = true;
      feestSparkles();
      onVuilKlaar?.();
    }
  }

  // ---- Sparkles ----
  const deeltjes = [];
  function spawnSparkles(x, y, n) {
    for (let i = 0; i < n; i++) {
      deeltjes.push({
        x: x + rnd(-12, 12) * (breedte / 800),
        y: y + rnd(-12, 12) * (breedte / 800),
        vy: rnd(-0.6, -1.6),
        vx: rnd(-0.6, 0.6),
        leven: 1,
        grootte: rnd(6, 14) * (breedte / 800),
        rot: rnd(0, Math.PI),
      });
    }
  }
  function feestSparkles() {
    for (let i = 0; i < 60; i++) {
      spawnSparkles(rnd(0, breedte), rnd(0, hoogte), 1);
    }
    sparkleGeluid();
  }

  // Sparkle-uitbarsting op een willekeurige plek (gebruikt door rommel→prullenbak).
  function sparkleBij(clientX, clientY) {
    const r = fx.getBoundingClientRect();
    const x = (clientX - r.left) / r.width * breedte;
    const y = (clientY - r.top) / r.height * hoogte;
    spawnSparkles(x, y, 10);
  }

  function tekenSter(x, y, r, rot) {
    fctx.save();
    fctx.translate(x, y);
    fctx.rotate(rot);
    fctx.fillStyle = "#fff7c2";
    fctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = (Math.PI / 2) * i;
      fctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      fctx.lineTo(Math.cos(a + Math.PI / 4) * r * 0.32, Math.sin(a + Math.PI / 4) * r * 0.32);
    }
    fctx.closePath();
    fctx.fill();
    fctx.restore();
  }

  let raf = 0;
  function lus() {
    fctx.clearRect(0, 0, breedte, hoogte);
    for (let i = deeltjes.length - 1; i >= 0; i--) {
      const p = deeltjes[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.03; p.leven -= 0.02; p.rot += 0.1;
      if (p.leven <= 0) { deeltjes.splice(i, 1); continue; }
      fctx.globalAlpha = Math.max(0, p.leven);
      tekenSter(p.x, p.y, p.grootte * p.leven, p.rot);
    }
    fctx.globalAlpha = 1;
    raf = requestAnimationFrame(lus);
  }
  raf = requestAnimationFrame(lus);

  const onResize = () => { passendMaken(); vangerPassend(); };
  window.addEventListener("resize", onResize);
  window.addEventListener("orientationchange", onResize);

  passendMaken();
  vangerPassend();

  return {
    setTool,
    // Voor de combinatie-voortgang in clean.js.
    vuilFractie,
    // Sparkle-feestje (bv. wanneer rommel + vuil samen klaar zijn).
    feestSparkles,
    sparkleBij,
    destroy() {
      cancelAnimationFrame(raf);
      if (meetTimer) { clearTimeout(meetTimer); meetTimer = 0; }
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      vanger.removeEventListener("pointerdown", omlaag);
      vanger.removeEventListener("pointermove", beweeg);
      vanger.removeEventListener("pointerup", omhoog);
      vanger.removeEventListener("pointercancel", omhoog);
      for (const soort of soorten) lagen[soort].canvas.remove();
      vanger.remove();
      fx.remove();
    },
  };
}
