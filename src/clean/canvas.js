// Hart van het spel: vuil tekenen, met de vinger wegvegen, sparkles, en meten
// hoeveel % schoon is.

import { schrobGeluid, sparkleGeluid } from "../audio/sfx.js";

export function maakSchoonmaak({ wrap, onProgress, onKlaar, onSchrob }) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  // Vuil-laag
  const vuil = document.createElement("canvas");
  vuil.className = "vuil-canvas";
  const vctx = vuil.getContext("2d", { willReadFrequently: true });

  // Effect-laag (sparkles) — vangt geen aanrakingen.
  const fx = document.createElement("canvas");
  fx.className = "fx-canvas";
  const fctx = fx.getContext("2d");

  wrap.appendChild(vuil);
  wrap.appendChild(fx);

  // Sampling-canvas om snel het schoon-percentage te meten.
  const sample = document.createElement("canvas");
  const sctx = sample.getContext("2d", { willReadFrequently: true });

  let breedte = 0, hoogte = 0;
  let beginVuilPixels = 1;
  let klaarGemeld = false;

  function passendMaken() {
    const r = wrap.getBoundingClientRect();
    breedte = Math.max(1, Math.round(r.width * dpr));
    hoogte = Math.max(1, Math.round(r.height * dpr));
    vuil.width = breedte; vuil.height = hoogte;
    fx.width = breedte; fx.height = hoogte;
    sample.width = 90;
    sample.height = Math.max(1, Math.round(90 * (hoogte / breedte)));
    tekenVuil();
  }

  // ---- Vuil schilderen ----
  function rnd(a, b) { return a + Math.random() * (b - a); }

  function blob(x, y, r, kleur, alpha) {
    vctx.globalAlpha = alpha;
    const g = vctx.createRadialGradient(x, y, r * 0.2, x, y, r);
    g.addColorStop(0, kleur);
    g.addColorStop(1, kleur + "00");
    vctx.fillStyle = g;
    vctx.beginPath();
    vctx.arc(x, y, r, 0, Math.PI * 2);
    vctx.fill();
  }

  function tekenVuil() {
    vctx.globalCompositeOperation = "source-over";
    vctx.clearRect(0, 0, breedte, hoogte);

    // Basis grauwsluier over de hele kamer
    vctx.globalAlpha = 0.5;
    vctx.fillStyle = "#8a6a44";
    vctx.fillRect(0, 0, breedte, hoogte);

    const S = breedte / 800; // schaal t.o.v. ontwerpgrootte

    // Stofwolken bovenaan
    for (let i = 0; i < 26; i++) {
      blob(rnd(0, breedte), rnd(0, hoogte * 0.5), rnd(40, 90) * S, "#b9a98f", rnd(0.25, 0.5));
    }
    // Modder- en groene vlekken
    const vlekkleuren = ["#5e4326", "#6f5a2e", "#4e6b3a", "#735436"];
    for (let i = 0; i < 34; i++) {
      const k = vlekkleuren[(Math.random() * vlekkleuren.length) | 0];
      blob(rnd(0, breedte), rnd(hoogte * 0.2, hoogte), rnd(30, 75) * S, k, rnd(0.55, 0.9));
    }
    // Donkere aangekoekte spetters
    for (let i = 0; i < 40; i++) {
      vctx.globalAlpha = rnd(0.5, 0.85);
      vctx.fillStyle = "#3f2d18";
      vctx.beginPath();
      vctx.arc(rnd(0, breedte), rnd(0, hoogte), rnd(4, 14) * S, 0, Math.PI * 2);
      vctx.fill();
    }
    // Spinnenwebben in de hoeken
    tekenWeb(0, 0, 150 * S, 1);
    tekenWeb(breedte, 0, 150 * S, -1);

    vctx.globalAlpha = 1;
    vctx.globalCompositeOperation = "destination-out";

    beginVuilPixels = Math.max(1, telVuil());
    klaarGemeld = false;
  }

  function tekenWeb(cx, cy, r, richting) {
    vctx.save();
    vctx.globalAlpha = 0.55;
    vctx.strokeStyle = "#efe9dd";
    vctx.lineWidth = Math.max(1.5, r * 0.012);
    const lijnen = 6;
    for (let i = 0; i <= lijnen; i++) {
      const a = (Math.PI / 2) * (i / lijnen);
      vctx.beginPath();
      vctx.moveTo(cx, cy);
      vctx.lineTo(cx + richting * Math.cos(a) * r, cy + Math.sin(a) * r);
      vctx.stroke();
    }
    for (let ring = 1; ring <= 4; ring++) {
      const rr = (r / 4) * ring;
      vctx.beginPath();
      for (let i = 0; i <= lijnen; i++) {
        const a = (Math.PI / 2) * (i / lijnen);
        const px = cx + richting * Math.cos(a) * rr;
        const py = cy + Math.sin(a) * rr;
        i === 0 ? vctx.moveTo(px, py) : vctx.lineTo(px, py);
      }
      vctx.stroke();
    }
    vctx.restore();
  }

  // ---- Vegen ----
  let huidigeTool = null;
  let laatst = null;
  let veegt = false;

  function setTool(tool) { huidigeTool = tool; }

  function pos(e) {
    const r = vuil.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) / r.width * breedte,
      y: (e.clientY - r.top) / r.height * hoogte,
    };
  }

  function veeg(x, y) {
    const t = huidigeTool;
    const straal = (t ? t.straal : 46) * (breedte / 800);
    const zacht = t ? t.zachtheid : 0.6;
    vctx.globalCompositeOperation = "destination-out";
    const g = vctx.createRadialGradient(x, y, straal * (1 - zacht), x, y, straal);
    g.addColorStop(0, "rgba(0,0,0,1)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    vctx.fillStyle = g;
    vctx.beginPath();
    vctx.arc(x, y, straal, 0, Math.PI * 2);
    vctx.fill();
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

  function omlaag(e) {
    vuil.setPointerCapture?.(e.pointerId);
    veegt = true;
    laatst = pos(e);
    veeg(laatst.x, laatst.y);
    spawnSparkles(laatst.x, laatst.y, 2);
    onSchrob?.();
    schrobGeluid();
    meetThrottled();
  }
  function beweeg(e) {
    if (!veegt) return;
    const p = pos(e);
    lijnVeeg(laatst, p);
    if (Math.random() < 0.5) spawnSparkles(p.x, p.y, 2);
    laatst = p;
    onSchrob?.();
    schrobGeluid();
    meetThrottled();
  }
  function omhoog() {
    veegt = false;
    laatst = null;
    meet();
  }

  vuil.addEventListener("pointerdown", omlaag);
  vuil.addEventListener("pointermove", beweeg);
  vuil.addEventListener("pointerup", omhoog);
  vuil.addEventListener("pointercancel", omhoog);
  vuil.addEventListener("pointerleave", () => { if (veegt) meet(); });

  // ---- Voortgang meten ----
  function telVuil() {
    sctx.clearRect(0, 0, sample.width, sample.height);
    sctx.drawImage(vuil, 0, 0, sample.width, sample.height);
    const data = sctx.getImageData(0, 0, sample.width, sample.height).data;
    let n = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] > 25) n++;
    return n;
  }

  let meetTimer = 0;
  function meetThrottled() {
    if (meetTimer) return;
    meetTimer = setTimeout(() => { meetTimer = 0; meet(); }, 140);
  }

  function meet() {
    const over = telVuil();
    let pct = 1 - over / beginVuilPixels;
    pct = Math.max(0, Math.min(1, pct));
    onProgress?.(pct);
    if (pct >= 0.985 && !klaarGemeld) {
      klaarGemeld = true;
      feestSparkles();
      onKlaar?.();
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

  const onResize = () => passendMaken();
  window.addEventListener("resize", onResize);
  window.addEventListener("orientationchange", onResize);

  passendMaken();

  return {
    setTool,
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      vuil.remove();
      fx.remove();
    },
  };
}
