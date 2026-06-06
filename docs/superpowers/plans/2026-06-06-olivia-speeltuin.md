# Olivia's Speeltuin — Implementatieplan (Fase 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eén domein `olivia.swijsen.eu` met een vrolijke homepage (Speeltuin-stijl) die Olivia's spelletjes als tegels toont, en het bestaande Poetsen-spel verplaatst naar `/spelletjes/poetsen/`.

**Architecture:** Het bestaande Vite-repo wordt een mini-monorepo. Het spel verhuist naar `spelletjes/poetsen/` en wordt subpad-portabel gemaakt (relatieve paden + `base=./`). Een nieuwe kleine Vite-app `homepage/` levert de startpagina. Een Node-orchestrator (`build.mjs`) bouwt beide in één gecombineerde `dist/` (homepage op `/`, spel onder `/spelletjes/poetsen/`). Eén Vercel-project serveert het geheel; `olivia.swijsen.eu` wordt via een GoDaddy-CNAME gekoppeld.

**Tech Stack:** Vite 5 (vanilla JS, ES-modules), HTML/CSS/SVG, Vercel (hosting), GoDaddy (DNS). Geen nieuwe npm-afhankelijkheden.

**Verificatie-aanpak (belangrijk):** Dit project heeft GEEN unit-test-framework. Verificatie gebeurt — net als in de rest van de codebase — via `npm run build` (slaagt), inspectie van `dist/` (juiste bestanden/paden via `grep`/`ls`), `vite preview` + `curl` (geen 404's, juiste content-types) en visuele controle via de Preview-MCP (screenshots). De stappen hieronder gebruiken die i.p.v. `pytest`-achtige tests.

**Werkwijze git:** Zoals in dit repo gebruikelijk — per taak een feature-branch, `--no-ff` mergen naar `main`, branch verwijderen. Commits eindigen met de Co-Authored-By-trailer.

---

## Bestandsstructuur (na Fase 1)

```
package.json              # MODIFY: scripts (dev/dev:poetsen/build/preview), vite blijft devDep
build.mjs                 # CREATE: orchestrator die homepage + poetsen in dist/ bouwt
vercel.json              # REWRITE: framework null, buildCommand, rewrites + headers voor beide apps
README.md                # MODIFY: nieuwe structuur + URL's documenteren
docs/                    # blijft (specs/plans)
homepage/                # CREATE: kleine Vite-app (startpagina)
  index.html
  main.js
  styles.css
  art/olivia.js          # zelfstandige Olivia-SVG (geen afhankelijkheden)
  public/
    manifest.webmanifest
    sw.js
    icon-180.png  icon-192.png  icon-512.png
spelletjes/
  poetsen/               # MOVE: het bestaande spel (was repo-root)
    index.html           # MODIFY: absolute paden → relatief
    styles.css
    src/...              # main.js MODIFY: sw-registratie relatief
    public/
      manifest.webmanifest   # MODIFY: icon-paden relatief
      sw.js
      icon-180.png  icon-192.png  icon-512.png
```

**Verantwoordelijkheden:**
- `homepage/` — de startpagina; weet niets van de interne werking van een spel, kent alleen een lijst met `{naam, emoji, kleur, url}`.
- `spelletjes/poetsen/` — het spel, ongewijzigd in gedrag; alleen padverwijzingen subpad-proof.
- `build.mjs` — bouwt de twee apps in de juiste volgorde tot één `dist/`.
- `vercel.json` — serveer-regels voor de gecombineerde output.

---

## Task 1: Spel verhuizen naar `spelletjes/poetsen/` + subpad-portabel maken

**Files:**
- Move: `index.html`, `styles.css`, `src/`, `public/` → `spelletjes/poetsen/`
- Modify: `spelletjes/poetsen/index.html` (absolute → relatieve paden)
- Modify: `spelletjes/poetsen/public/manifest.webmanifest` (icon-paden relatief)
- Modify: `spelletjes/poetsen/src/main.js` (sw-registratie relatief)
- Create: `build.mjs`
- Modify: `package.json` (scripts)

- [ ] **Step 1: Branch maken**

Run:
```bash
git checkout -b olivia-speeltuin-1-verhuizen
```

- [ ] **Step 2: Spelbestanden verplaatsen met `git mv`**

Run:
```bash
mkdir -p spelletjes/poetsen
git mv index.html styles.css src public spelletjes/poetsen/
```
Expected: `git status` toont de vier paden als "renamed" naar `spelletjes/poetsen/...`. `package.json`, `package-lock.json`, `vercel.json`, `README.md`, `docs/` blijven in de root.

- [ ] **Step 3: `spelletjes/poetsen/index.html` — absolute paden relatief maken**

Vervang de vier absolute verwijzingen (zodat ze onder een subpad kloppen, samen met `base=./`):

```html
  <link rel="manifest" href="./manifest.webmanifest" />
  <link rel="apple-touch-icon" href="./icon-180.png" />
  <link rel="stylesheet" href="./styles.css" />
  <title>Olivia Poetsen 🧹</title>
```
en onderaan:
```html
  <script type="module" src="./src/main.js"></script>
```
(Concreet: `href="/manifest.webmanifest"`→`"./manifest.webmanifest"`, `href="/icon-180.png"`→`"./icon-180.png"`, `href="/styles.css"`→`"./styles.css"`, `src="/src/main.js"`→`"./src/main.js"`. De `apple-mobile-web-app-title` blijft `"Olivia Poetsen"`.)

- [ ] **Step 4: `spelletjes/poetsen/public/manifest.webmanifest` — icon-paden relatief**

Wijzig de twee icon-`src`-waarden van absoluut naar relatief (`start_url` en `scope` blijven `"."`):
```json
  "icons": [
    { "src": "icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
```

- [ ] **Step 5: `spelletjes/poetsen/src/main.js` — service worker relatief registreren**

Vervang de registratieregel (zodat de scope het subpad wordt i.p.v. de site-root):
```js
    navigator.serviceWorker.register("sw.js").catch(() => {});
```
(was `register("/sw.js")`)

- [ ] **Step 6: `build.mjs` aanmaken (orchestrator)**

Create `build.mjs`:
```js
// Bouwt Olivia's site in één gecombineerde dist/:
//   1) homepage  → dist/            (leegt dist eerst)
//   2) poetsen   → dist/spelletjes/poetsen/  (relatieve base; leegt alleen die submap)
// Volgorde is belangrijk: de homepage-build leegt dist/, daarna vult de spel-build
// de submap. Vite draait per app met de submap als cwd (root = cwd, public = ./public).
import { execSync } from "node:child_process";

function bouw(label, cmd, cwd) {
  console.log(`\n▶ ${label}`);
  execSync(cmd, { cwd, stdio: "inherit" });
}

bouw("Homepage", "npx vite build --outDir ../dist --emptyOutDir", "homepage");
bouw(
  "Poetsen",
  "npx vite build --base=./ --outDir ../../dist/spelletjes/poetsen --emptyOutDir",
  "spelletjes/poetsen"
);

console.log("\n✓ Klaar: dist/ bevat de homepage + spelletjes/poetsen/");
```
(Let op: in Task 1 bestaat `homepage/` nog niet; we testen daarom in deze taak alleen de spel-build los — zie Step 8. De homepage komt in Task 2; pas daarna draait `node build.mjs` volledig.)

- [ ] **Step 7: `package.json` scripts bijwerken**

Vervang het `"scripts"`-blok door:
```json
  "scripts": {
    "dev": "vite homepage",
    "dev:poetsen": "vite spelletjes/poetsen",
    "build": "node build.mjs",
    "preview": "vite preview --host"
  },
```

- [ ] **Step 8: Spel-build los verifiëren (subpad-output klopt)**

Run:
```bash
npx vite build --base=./ --outDir ../../dist/spelletjes/poetsen --emptyOutDir --root spelletjes/poetsen
ls dist/spelletjes/poetsen
grep -o './assets/[^"]*' dist/spelletjes/poetsen/index.html | head
grep -c '"/' dist/spelletjes/poetsen/index.html || true
```
Expected: build slaagt; `ls` toont `index.html assets manifest.webmanifest sw.js icon-180.png icon-192.png icon-512.png`; de asset-links in `index.html` beginnen met `./assets/` (relatief); er staan GEEN absolute `"/`-verwijzingen meer in `index.html` (de laatste `grep -c` geeft `0`).

- [ ] **Step 9: Spel onder subpad in de browser checken (geen 404's)**

Run (start een statische preview van dist):
```bash
npx vite preview --host --port 4173 &
sleep 2
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:4173/spelletjes/poetsen/"
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:4173/spelletjes/poetsen/manifest.webmanifest"
```
Expected: beide `200`. Stop de preview daarna: `kill %1` (of `pkill -f "vite preview"`).

- [ ] **Step 10: Committen**

Run:
```bash
git add -A
git commit -m "$(cat <<'EOF'
Verhuis Poetsen naar spelletjes/poetsen/ + maak subpad-portabel

Spelbestanden (index.html, styles.css, src/, public/) via git mv naar
spelletjes/poetsen/. Absolute paden in index.html relatief gemaakt, manifest
icon-paden relatief, service worker relatief geregistreerd (scope = subpad).
build.mjs (orchestrator) + package.json-scripts toegevoegd. Spel-build levert
nu dist/spelletjes/poetsen/ met relatieve assets (geverifieerd, geen 404's).

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 11: Mergen naar main**

Run:
```bash
git checkout main && git merge --no-ff olivia-speeltuin-1-verhuizen -m "Merge: Poetsen naar spelletjes/poetsen/ + subpad-portabel" && git branch -d olivia-speeltuin-1-verhuizen
```

---

## Task 2: Homepage-app (Speeltuin) bouwen

**Files:**
- Create: `homepage/index.html`
- Create: `homepage/main.js`
- Create: `homepage/styles.css`
- Create: `homepage/art/olivia.js`
- Create: `homepage/public/manifest.webmanifest`
- Create: `homepage/public/sw.js`
- Create: `homepage/public/icon-180.png`, `icon-192.png`, `icon-512.png` (kopie van het spel)

- [ ] **Step 1: Branch maken**

Run:
```bash
git checkout -b olivia-speeltuin-2-homepage
mkdir -p homepage/art homepage/public
```

- [ ] **Step 2: Icons + service worker kopiëren uit het spel**

Run:
```bash
cp spelletjes/poetsen/public/icon-180.png spelletjes/poetsen/public/icon-192.png spelletjes/poetsen/public/icon-512.png homepage/public/
cp spelletjes/poetsen/public/sw.js homepage/public/sw.js
```
Expected: `ls homepage/public` toont `icon-180.png icon-192.png icon-512.png sw.js`.

- [ ] **Step 3: `homepage/index.html` aanmaken**

Create `homepage/index.html`:
```html
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <meta name="theme-color" content="#6ec8ff" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="Olivia" />
  <link rel="manifest" href="/manifest.webmanifest" />
  <link rel="apple-touch-icon" href="/icon-180.png" />
  <link rel="stylesheet" href="/styles.css" />
  <title>Olivia's Spelletjes ✨</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/main.js"></script>
</body>
</html>
```

- [ ] **Step 4: `homepage/art/olivia.js` aanmaken (zelfstandige Olivia-SVG)**

Create `homepage/art/olivia.js`:
```js
// Zelfstandige Olivia-figuur voor de homepage (geen afhankelijkheden), in dezelfde
// platte stijl als het spel: lichtbruin/donkerblond haar, vrolijke roze jurk.
// (Bewust een eigen kopie zodat homepage en spel los gebouwd kunnen worden; later
//  kunnen we dit naar een gedeelde art-module tillen — Fase 2.)
export const oliviaSVG = `<svg viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="ohaar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#cda66c"/><stop offset="1" stop-color="#b1854a"/>
    </linearGradient>
    <linearGradient id="ojurk" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ff9ec2"/><stop offset="1" stop-color="#ff6fa5"/>
    </linearGradient>
  </defs>
  <ellipse cx="60" cy="193" rx="26" ry="5" fill="rgba(43,58,85,.16)"/>
  <rect x="51" y="150" width="7" height="34" rx="3.5" fill="#f7c39c"/>
  <rect x="62" y="150" width="7" height="34" rx="3.5" fill="#f7c39c"/>
  <path d="M46 182 h13 v7 h-15 a2 2 0 0 1 2 -7 Z" fill="#ff6fa5"/>
  <path d="M61 182 h13 a2 2 0 0 1 2 7 h-15 Z" fill="#ff6fa5"/>
  <path d="M60 84 C46 86 42 100 38 150 C48 158 72 158 82 150 C78 100 74 86 60 84 Z" fill="url(#ojurk)"/>
  <path d="M42 96 C32 104 28 116 30 126 C33 129 37 128 38 124 C38 114 44 106 50 102 Z" fill="#f7c39c"/>
  <path d="M78 96 C88 104 92 116 90 126 C87 129 83 128 82 124 C82 114 76 106 70 102 Z" fill="#f7c39c"/>
  <rect x="55" y="72" width="10" height="14" rx="5" fill="#f7c39c"/>
  <circle cx="60" cy="52" r="26" fill="#f7c39c"/>
  <path d="M34 54 C32 28 50 20 60 20 C70 20 88 28 86 54 C84 44 80 40 80 40 C80 30 66 30 60 30 C54 30 40 30 40 40 C40 40 36 44 34 54 Z" fill="url(#ohaar)"/>
  <path d="M34 52 C30 60 30 78 33 92 C36 86 36 70 38 60 Z" fill="url(#ohaar)"/>
  <path d="M86 52 C90 60 90 78 87 92 C84 86 84 70 82 60 Z" fill="url(#ohaar)"/>
  <circle cx="51" cy="52" r="3.4" fill="#2b3a55"/>
  <circle cx="69" cy="52" r="3.4" fill="#2b3a55"/>
  <circle cx="52.2" cy="50.8" r="1.1" fill="#fff"/>
  <circle cx="70.2" cy="50.8" r="1.1" fill="#fff"/>
  <circle cx="45" cy="59" r="4" fill="#ff9ec2" opacity=".7"/>
  <circle cx="75" cy="59" r="4" fill="#ff9ec2" opacity=".7"/>
  <path d="M52 62 Q60 70 68 62" stroke="#9c3a52" stroke-width="2.4" fill="none" stroke-linecap="round"/>
</svg>`;
```

- [ ] **Step 5: `homepage/main.js` aanmaken**

Create `homepage/main.js`:
```js
// Olivia's homepage (Speeltuin): vrolijke kop met Olivia + een rooster met
// spel-tegels. Spellen staan in SPELLETJES; een nieuw spel = één regel erbij.
import { oliviaSVG } from "./art/olivia.js";

const SPELLETJES = [
  { naam: "Poetsen", emoji: "🧹", kleur: "#bfe9ff", url: "/spelletjes/poetsen/", klaar: true },
  { naam: "Binnenkort", emoji: "✨", kleur: "#ffe3f1", klaar: false },
];

function maak(tag, klasse, tekst) {
  const el = document.createElement(tag);
  if (klasse) el.className = klasse;
  if (tekst != null) el.textContent = tekst;
  return el;
}

function render() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  // Decoratieve zwevers (langzaam, geen flikkering; staan stil onder reduced-motion via CSS)
  const ambiance = maak("div", "ambiance");
  ambiance.setAttribute("aria-hidden", "true");
  ["✨", "🎵", "💖", "⭐", "🌟", "💕"].forEach((t, i) => {
    const z = maak("span", "zwever", t);
    z.style.left = `${8 + i * 15}%`;
    z.style.animationDuration = `${11 + i * 2}s`;
    z.style.animationDelay = `${-i * 2}s`;
    ambiance.append(z);
  });
  app.append(ambiance);

  const hero = maak("header", "hero");
  const fig = maak("div", "hero-olivia");
  fig.innerHTML = oliviaSVG;
  fig.setAttribute("aria-hidden", "true");
  const titel = maak("h1", "hero-titel", "Olivia's Spelletjes");
  const sub = maak("p", "hero-sub", "Kies een spel om te spelen! ✨");
  hero.append(fig, titel, sub);
  app.append(hero);

  const rooster = maak("div", "rooster");
  for (const spel of SPELLETJES) {
    const tegel = spel.klaar ? maak("a", "tegel") : maak("div", "tegel uit");
    tegel.style.setProperty("--tegel-kleur", spel.kleur);
    if (spel.klaar) {
      tegel.href = spel.url;
      tegel.setAttribute("aria-label", `Speel ${spel.naam}`);
    } else {
      tegel.setAttribute("aria-disabled", "true");
    }
    tegel.append(maak("div", "tegel-emoji", spel.emoji), maak("div", "tegel-naam", spel.naam));
    rooster.append(tegel);
  }
  app.append(rooster);
}

render();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
```

- [ ] **Step 6: `homepage/styles.css` aanmaken**

Create `homepage/styles.css`:
```css
:root { --tegel-kleur: #bfe9ff; }
* { box-sizing: border-box; }
html, body { margin: 0; height: 100%; }
body {
  font-family: "Baloo 2", "Comic Sans MS", system-ui, sans-serif;
  background: linear-gradient(160deg, #bfe9ff 0%, #e7d4ff 100%);
  color: #2b3a55;
  -webkit-tap-highlight-color: transparent;
  overflow-x: hidden;
}
#app { position: relative; min-height: 100%; padding: 24px 18px 48px; }

.ambiance { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
.zwever {
  position: absolute; bottom: -40px; font-size: 26px; opacity: .55;
  animation: drijf linear infinite;
}
@keyframes drijf {
  0% { transform: translateY(0) rotate(0); }
  100% { transform: translateY(-115vh) rotate(40deg); }
}

.hero { position: relative; z-index: 1; text-align: center; margin: 6px 0 26px; }
.hero-olivia { width: 130px; margin: 0 auto; animation: wieb 3s ease-in-out infinite; }
.hero-olivia svg { width: 100%; height: auto; display: block; }
@keyframes wieb { 0%,100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }
.hero-titel { font-size: clamp(28px, 7vw, 46px); margin: 8px 0 4px; color: #3a4a7a; }
.hero-sub { font-size: clamp(15px, 4vw, 20px); margin: 0; opacity: .8; }

.rooster {
  position: relative; z-index: 1; display: grid; gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  max-width: 680px; margin: 0 auto;
}
.tegel {
  background: var(--tegel-kleur);
  border-radius: 22px; padding: 22px 14px; min-height: 150px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
  text-decoration: none; color: #2b3a55;
  box-shadow: 0 6px 0 rgba(0,0,0,.10); cursor: pointer;
  transition: transform .12s ease, box-shadow .12s ease;
}
.tegel:active { transform: translateY(3px); box-shadow: 0 3px 0 rgba(0,0,0,.10); }
.tegel.uit { opacity: .5; filter: grayscale(.3); cursor: default; box-shadow: 0 6px 0 rgba(0,0,0,.06); }
.tegel-emoji { font-size: 54px; line-height: 1; }
.tegel-naam { font-size: 20px; font-weight: 700; }

@media (prefers-reduced-motion: reduce) {
  .zwever, .hero-olivia { animation: none !important; }
}
```

- [ ] **Step 7: `homepage/public/manifest.webmanifest` aanmaken**

Create `homepage/public/manifest.webmanifest`:
```json
{
  "name": "Olivia's Spelletjes",
  "short_name": "Olivia",
  "description": "Alle spelletjes van Olivia op één plek!",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#bfe9ff",
  "theme_color": "#6ec8ff",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

- [ ] **Step 8: Volledige build draaien en `dist/` controleren**

Run:
```bash
npm run build
echo "--- dist root ---"; ls dist
echo "--- dist/spelletjes/poetsen ---"; ls dist/spelletjes/poetsen
```
Expected: build slaagt (twee Vite-builds). `dist` bevat o.a. `index.html`, `assets/`, `manifest.webmanifest`, `sw.js`, icons, én een map `spelletjes/`. `dist/spelletjes/poetsen` bevat het spel (`index.html`, `assets/`, `sw.js`, manifest, icons).

- [ ] **Step 9: Homepage + navigatie naar spel visueel checken**

Run:
```bash
npx vite preview --host --port 4173 &
sleep 2
curl -s -o /dev/null -w "home: %{http_code}\n" "http://localhost:4173/"
curl -s -o /dev/null -w "manifest: %{http_code}\n" "http://localhost:4173/manifest.webmanifest"
curl -s -o /dev/null -w "spel: %{http_code}\n" "http://localhost:4173/spelletjes/poetsen/"
curl -s "http://localhost:4173/" | grep -o "<title>[^<]*</title>"
```
Expected: alle `200`; titel `Olivia's Spelletjes ✨`. Maak daarna een screenshot via de Preview-MCP (zie Task 4 voor de launch-config) of open `http://localhost:4173/` in de browser: de homepage toont Olivia + een "Poetsen 🧹"-tegel + een uitgegrijsde "Binnenkort ✨"-tegel; klikken op Poetsen opent het spel. Stop de preview: `pkill -f "vite preview"`.

- [ ] **Step 10: Committen + mergen**

Run:
```bash
git add -A
git commit -m "$(cat <<'EOF'
Homepage (Speeltuin) toegevoegd

Kleine Vite-app homepage/ met vrolijke kop (zelfstandige Olivia-SVG) + tegel-
rooster van spelletjes (Poetsen speelbaar, Binnenkort-tegel). Eigen manifest +
service worker + icons. build.mjs bouwt nu homepage→dist/ en poetsen→
dist/spelletjes/poetsen/. Geverifieerd via build + preview (geen 404's).

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
git checkout main && git merge --no-ff olivia-speeltuin-2-homepage -m "Merge: homepage (Speeltuin)" && git branch -d olivia-speeltuin-2-homepage
```

---

## Task 3: "← Terug naar Olivia's wereld"-knop in het spel

**Files:**
- Modify: `spelletjes/poetsen/src/screens/home.js` (knop toevoegen aan het beginscherm)
- Modify: `spelletjes/poetsen/styles.css` (stijl voor de knop)

- [ ] **Step 1: Branch maken**

Run:
```bash
git checkout -b olivia-speeltuin-3-terugknop
```

- [ ] **Step 2: Terug-link toevoegen in `home.js`**

In `spelletjes/poetsen/src/screens/home.js`, direct ná `scherm.append(ambiance);` (rond regel 64), voeg toe:
```js
  // ---- Terug naar Olivia's homepage (de "wereld" boven dit spel) ----
  // Linkt naar de site-root ("/"); in de gecombineerde site is dat Olivia's
  // Speeltuin. Bewust een gewone link zodat het ook werkt als losse PWA.
  const terug = maak("a", "home-terug", "← Olivia's wereld");
  terug.href = "/";
  terug.setAttribute("aria-label", "Terug naar Olivia's homepage");
  scherm.append(terug);
```
(De helper `maak` is al geïmporteerd in dit bestand.)

- [ ] **Step 3: Stijl toevoegen in het spel-`styles.css`**

Voeg onderaan `spelletjes/poetsen/styles.css` toe:
```css
/* Terug-naar-homepage-knopje op het beginscherm */
.home-terug {
  display: inline-flex; align-items: center; gap: 6px;
  align-self: flex-start;
  margin: 0 0 6px 2px; padding: 8px 14px;
  background: rgba(255,255,255,.85); color: #3a4a7a;
  border-radius: 999px; text-decoration: none; font-weight: 700; font-size: 15px;
  box-shadow: 0 3px 0 rgba(0,0,0,.08);
  -webkit-tap-highlight-color: transparent;
}
.home-terug:active { transform: translateY(2px); box-shadow: 0 1px 0 rgba(0,0,0,.08); }
```

- [ ] **Step 4: Build + visuele check**

Run:
```bash
npm run build
npx vite preview --host --port 4173 &
sleep 2
curl -s -o /dev/null -w "spel: %{http_code}\n" "http://localhost:4173/spelletjes/poetsen/"
pkill -f "vite preview"
```
Expected: build slaagt, `200`. Open `http://localhost:4173/spelletjes/poetsen/` (of screenshot via Preview-MCP): op het beginscherm staat linksboven "← Olivia's wereld"; klikken gaat naar `/` (de homepage).

- [ ] **Step 5: Committen + mergen**

Run:
```bash
git add -A
git commit -m "$(cat <<'EOF'
Terug-naar-Olivia's-wereld-knop op het spel-beginscherm

Kleine pill-link ("← Olivia's wereld") op home.js die naar de site-root linkt
(= de homepage in de gecombineerde site). Stijl in spelletjes/poetsen/styles.css.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
git checkout main && git merge --no-ff olivia-speeltuin-3-terugknop -m "Merge: terug-naar-wereld-knop" && git branch -d olivia-speeltuin-3-terugknop
```

---

## Task 4: Vercel-config voor de gecombineerde site + lokale Preview-config

**Files:**
- Rewrite: `vercel.json`
- Modify: `.claude/launch.json` (Preview-MCP wijst naar de gecombineerde preview; niet in git — `.claude/` is gitignored)

- [ ] **Step 1: Branch maken**

Run:
```bash
git checkout -b olivia-speeltuin-4-vercel
```

- [ ] **Step 2: `vercel.json` herschrijven**

Vervang de inhoud van `vercel.json` door:
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": null,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/spelletjes/poetsen/:path*", "destination": "/spelletjes/poetsen/index.html" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    { "source": "/sw.js", "headers": [ { "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" } ] },
    { "source": "/spelletjes/poetsen/sw.js", "headers": [ { "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" } ] },
    { "source": "/manifest.webmanifest", "headers": [ { "key": "Content-Type", "value": "application/manifest+json" } ] },
    { "source": "/spelletjes/poetsen/manifest.webmanifest", "headers": [ { "key": "Content-Type", "value": "application/manifest+json" } ] }
  ]
}
```
(Belangrijk: statische bestanden hebben voorrang op `rewrites`, dus echte assets onder `/spelletjes/poetsen/...` worden gewoon geserveerd; de rewrites vangen alleen niet-bestaande paden af. `framework: null` voorkomt dat Vercel zelf `vite build` draait i.p.v. onze orchestrator.)

- [ ] **Step 3: JSON valideren + volledige build**

Run:
```bash
cat vercel.json | python3 -m json.tool > /dev/null && echo "vercel.json OK"
npm run build && echo "build OK"
```
Expected: `vercel.json OK` en `build OK`.

- [ ] **Step 4: Preview-MCP-config bijwerken (lokale visuele controle)**

In `.claude/launch.json`: zorg dat er een configuratie is die de gecombineerde site serveert. Werk het bestaande `schoonmaak-spel`-configuratieblok bij (of voeg een nieuw blok toe) zodat het luidt:
```json
{
  "name": "olivia-site",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "preview"],
  "port": 4173
}
```
(Eerst `npm run build` draaien; daarna serveert `npm run preview` de `dist/` op poort 4173.)

- [ ] **Step 5: Integrale visuele controle via Preview-MCP**

Run eerst `npm run build`. Start dan de preview (via Preview-MCP `preview_start` met naam `olivia-site`, of `npx vite preview --host --port 4173 &`) en controleer:
```bash
npx vite preview --host --port 4173 &
sleep 2
for u in "/" "/manifest.webmanifest" "/sw.js" "/spelletjes/poetsen/" "/spelletjes/poetsen/manifest.webmanifest" "/spelletjes/poetsen/sw.js"; do
  echo "$(curl -s -o /dev/null -w '%{http_code} %{content_type}' "http://localhost:4173$u")  <- $u"
done
pkill -f "vite preview"
```
Expected: alle `200`; manifests met `application/manifest+json`; sw met `application/javascript`. Maak via de Preview-MCP twee screenshots: (a) de homepage op `/`, (b) het spel op `/spelletjes/poetsen/` met de terug-knop. Bevestig: homepage rendert Olivia + tegels; spel rendert volledig; geen console-404's.

- [ ] **Step 6: Committen + mergen**

Run:
```bash
git add vercel.json
git commit -m "$(cat <<'EOF'
Vercel-config voor de gecombineerde site

framework:null + buildCommand npm run build (onze orchestrator) → dist/.
SPA-fallback rewrites voor /spelletjes/poetsen/ en /. No-cache headers voor
beide service workers; juiste content-type voor beide manifests. Geverifieerd
via build + preview (alle paden 200, geen 404's).

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
git checkout main && git merge --no-ff olivia-speeltuin-4-vercel -m "Merge: Vercel-config gecombineerde site" && git branch -d olivia-speeltuin-4-vercel
```

---

## Task 5: Deploy naar Vercel + `olivia.swijsen.eu` koppelen (GoDaddy-CNAME)

> Deze taak bevat een handmatige stap voor de gebruiker (DNS bij GoDaddy) en wacht op DNS-propagatie. De productie-deploy vereist expliciete toestemming van de gebruiker.

**Files:** geen codewijzigingen (deploy + DNS + verificatie).

- [ ] **Step 1: Productie-deploy van de gecombineerde site**

Run (vanuit de repo-root; het bestaande Vercel-project `olivia-poetsen` is al gekoppeld via `.vercel/`):
```bash
vercel --prod --yes
```
Expected: deploy slaagt; de site is bereikbaar op de project-URL (bv. `https://olivia-poetsen.vercel.app/` = homepage, `/spelletjes/poetsen/` = spel). Verifieer:
```bash
curl -s -o /dev/null -w "%{http_code}\n" "https://olivia-poetsen.vercel.app/"
curl -s -o /dev/null -w "%{http_code}\n" "https://olivia-poetsen.vercel.app/spelletjes/poetsen/"
```
Expected: beide `200`.

- [ ] **Step 2: Custom domein toevoegen aan het project**

Run:
```bash
vercel domains add olivia.swijsen.eu olivia-poetsen
```
Expected: Vercel meldt dat het domein is toegevoegd en toont de vereiste DNS-instructie (een CNAME naar `cname.vercel-dns.com`). Als de CLI hapert, kan dit ook via het Vercel-dashboard: Project `olivia-poetsen` → Settings → Domains → `olivia.swijsen.eu` toevoegen.

- [ ] **Step 3: GoDaddy-CNAME aanmaken (handmatige stap — gebruiker)**

Instructie voor de gebruiker (GoDaddy → swijsen.eu → DNS → Records → Add):
- **Type:** CNAME
- **Name/Host:** `olivia`
- **Value/Points to:** `cname.vercel-dns.com`
- **TTL:** standaard (1 uur)

Nameservers/MX (e-mail) blijven ongemoeid. Bevestig in de terminal wanneer de record is opgeslagen.

- [ ] **Step 4: Wachten op DNS + SSL, daarna live verifiëren**

Run (herhaal tot 200; CNAME + SSL kan enkele minuten duren):
```bash
dig +short olivia.swijsen.eu
for u in "/" "/spelletjes/poetsen/" "/manifest.webmanifest" "/spelletjes/poetsen/manifest.webmanifest"; do
  echo "$(curl -s -o /dev/null -w '%{http_code}' "https://olivia.swijsen.eu$u")  <- $u"
done
curl -s "https://olivia.swijsen.eu/" | grep -o "<title>[^<]*</title>"
```
Expected: `dig` toont een Vercel-doel; alle paden `200`; titel `Olivia's Spelletjes ✨`. Maak een screenshot via de Preview-MCP/Chrome van `https://olivia.swijsen.eu/` ter bevestiging.

- [ ] **Step 5: E-mail-check (niet stuk)**

Run:
```bash
dig +short MX swijsen.eu
```
Expected: de bestaande MX-records van swijsen.eu staan er nog (we hebben alleen een CNAME voor `olivia` toegevoegd, niets aan de root/MX gewijzigd).

---

## Task 6: Documentatie bijwerken

**Files:**
- Modify: `README.md`
- Modify: geheugenbestand `~/.claude/projects/.../memory/schoonmaak-spel.md`

- [ ] **Step 1: Branch maken**

Run:
```bash
git checkout -b olivia-speeltuin-6-docs
```

- [ ] **Step 2: `README.md` bijwerken**

Werk de README bij met de nieuwe structuur en URL's:
- Titel/intro: vermeld dat dit nu Olivia's site is met de homepage + spelletjes onder `/spelletjes/<naam>/`.
- "Spelen op de computer": `npm run dev` = homepage, `npm run dev:poetsen` = het spel, `npm run build` + `npm run preview` = de gecombineerde site op `http://localhost:4173`.
- "Op Olivia's iPad zetten": primaire URL wordt `https://olivia.swijsen.eu` (open in Safari → Zet op beginscherm). Het Poetsen-spel staat onder `https://olivia.swijsen.eu/spelletjes/poetsen/`.
- "Nieuw spel toevoegen": korte routine — map `spelletjes/<naam>/` (Vite-app, `base=./`), een regel in `homepage/main.js` (`SPELLETJES`), een build-regel in `build.mjs`, deployen.

- [ ] **Step 3: Geheugen bijwerken**

Voeg aan `~/.claude/projects/-Users-claudioswijsen-Library-Mobile-Documents-com-apple-CloudDocs-Downloads-Claude-Code/memory/schoonmaak-spel.md` een notitie toe: repo is nu een mini-monorepo (`homepage/` + `spelletjes/poetsen/`, `build.mjs`), live op `https://olivia.swijsen.eu` (homepage) en `/spelletjes/poetsen/` (spel); DNS via GoDaddy-CNAME `olivia` → `cname.vercel-dns.com`; nieuw-spel-routine; spec/plan in `docs/superpowers/`.

- [ ] **Step 4: Committen + mergen**

Run:
```bash
git add README.md
git commit -m "$(cat <<'EOF'
README: monorepo-structuur + olivia.swijsen.eu

Documenteer homepage + spelletjes/<naam>/, de dev/build/preview-scripts, de
iPad-URL https://olivia.swijsen.eu en de routine om een nieuw spel toe te voegen.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
git checkout main && git merge --no-ff olivia-speeltuin-6-docs -m "Merge: documentatie monorepo + olivia.swijsen.eu" && git branch -d olivia-speeltuin-6-docs
```

---

## Self-review (dekking t.o.v. de spec)

- **Subpaden onder één domein (A):** Task 1 (verhuizing + subpad-portabel) + Task 2 (homepage) + Task 4 (rewrites). ✔
- **DNS bij GoDaddy, alleen `olivia`-subdomein, e-mail ongemoeid:** Task 5 (Steps 2–5, incl. MX-check). ✔
- **Speeltuin-homepage (Olivia + tegels, PWA, reduced-motion):** Task 2. ✔
- **Poetsen klaar voor subpad (assets/SW/manifest) + terug-knop:** Task 1 + Task 3. ✔
- **Eén origin → later data delen:** geborgd door de monorepo/één-domein-aanpak (Fase 2 expliciet buiten scope). ✔
- **Verificatie (build/preview/curl/screenshots, e-mail blijft werken):** in elke taak + Task 5. ✔
- **Legacy:** `olivia-poetsen.vercel.app` blijft bereikbaar; let op: het serveert ná deploy de gecombineerde site (homepage op `/`, spel op `/spelletjes/poetsen/`) i.p.v. enkel het spel — geen kapotte links. (Kleine afwijking van de spec-notitie "spel op root"; bewust, want we hergebruiken hetzelfde Vercel-project.)
- **Geen placeholders / type-consistentie:** klassenamen (`tegel`, `home-terug`), scripts (`dev`/`dev:poetsen`/`build`/`preview`) en padconventies (`base=./`, relatieve public-refs) zijn door alle taken consistent. ✔
