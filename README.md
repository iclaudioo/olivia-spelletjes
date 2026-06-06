# Olivia's Speeltuin 🛝 — `olivia.swijsen.eu`

De persoonlijke spelletjes-site van Olivia: een vrolijke **homepage** met al haar
spellen als tegels. Het eerste spel is **Olivia Poetsen** 🧹 — vuile huizen
helemaal schoonmaken én K-popster worden (schoonmaken, inrichten, aankleden,
dansen, optreden). Gemaakt om op de iPad te spelen; er volgen meer spellen.

De code is een mini-monorepo: `homepage/` (de startpagina) + `spelletjes/poetsen/`
(het spel), samengebouwd tot één site (homepage op `/`, spel op
`/spelletjes/poetsen/`).

## Wat het spel kan (compleet)
- **Schoonmaken** — veeg met je vinger het vuil weg. Verschillend vuil (stof,
  vlekken, modder, aangekoekt, spinnenwebben, kruimels) heeft het JUISTE gereedschap
  nodig: 🧽 spons, 🪥 borstel, 🧴 spray, 🧹 bezem, 🪶 plumeau. Ruim ook het
  rondslingerende speelgoed op door het naar de 🗑️ prullenbak te slepen. Met
  sparkles ✨, geluidjes, een voortgangsbalk en een "Helemaal schoon!"-feestje.
- **Vijf huizen** met elk meerdere kamers in eigen stijl: 🏡 Mijn Huis, 🏖️
  Strandhuis, 🏰 Kasteel, 🚀 Ruimteraket en 🎤 Popster Studio (podium/kleedkamer/
  oefenstudio).
- **Winkel** — verdien munten met schoonmaken en koop nieuwe huizen, meubels,
  gereedschap-uiterlijken (skins) en huisdieren.
- **Inrichten** — zet meubels neer en sleep ze op hun plek, en kies behang- en
  vloerkleuren. Alles wordt bewaard.
- **Foto-modus** 📸 — maak een kiekje van je ingerichte kamer om te bewaren.
- **Styling Studio** 💇‍♀️ — kleed Olivia aan: haarkleur (incl. roze/paars/blauw/
  regenboog), outfits en accessoires (strik/zonnebril/koptelefoon/kroon). Haar look
  komt overal terug waar ze danst en optreedt.
- **Dans-minigame** 💃 — volg de pijltjes op de beat: 4 K-pop-liedjes, 3 niveaus,
  hold-noten, combo's en sterren/highscores, met publiek.
- **Mama de zangeres** 👩 loopt rond op het huis-overzicht; tik haar voor een
  **dansfeestje** (Mama + Olivia + huisdier dansen) — daarna maakt ze plagerig een
  kamer weer vies (herspeelbaar!).
- **Huisdier** 🐶🐱🐰 — adopteer een puppy/poesje/konijn, aai het (hartjes) en het
  danst overal mee.
- **Concert-show** 🎤 — geef vanuit de Popster Studio een optreden met spotlights,
  juichend publiek, muziek en confetti.
- **Opdrachten + Rad van Fortuin** 🎯🎡 — dagelijkse opdrachten met beloningen en
  één gratis draai per dag.
- **Verzamelboek** 📖 — verdien tientallen stickers door te spelen.
- **Instellingen** ⚙️ — geluid en achtergrondmuziek aan/uit, skin en huisdier kiezen
  (muziek snel dempen kan ook met de 🔊-knop bovenin).
- Veel "juice": confetti, naar-de-teller-vliegende munten, een levend beginscherm
  met parade. Alle bewegingen respecteren `prefers-reduced-motion` (geen geflikker).
- Alle voortgang wordt op de iPad bewaard (localStorage).

## Spelen op de computer
```bash
cd schoonmaak-spel
npm install          # alleen de eerste keer
npm run dev          # homepage op http://localhost:5173
npm run dev:poetsen  # alleen het Poetsen-spel
npm run build        # bouwt de hele site naar dist/
npm run preview      # serveert de gebouwde site op http://localhost:4173
```
De volledige site (homepage + spel onder `/spelletjes/poetsen/`) test je met
`npm run build && npm run preview`.

## Op Olivia's iPad zetten

**Optie 0 — al online (aanrader): https://olivia.swijsen.eu**
1. Open https://olivia.swijsen.eu in Safari op de iPad (Olivia's homepage). Het
   Poetsen-spel staat onder https://olivia.swijsen.eu/spelletjes/poetsen/.
2. Tik op het deel-icoon → **Zet op beginscherm**. Klaar — schermvullend,
   altijd bereikbaar (je Mac hoeft niet aan te staan), en de voortgang blijft op
   de iPad bewaard.

> DNS: `olivia.swijsen.eu` is bij GoDaddy gekoppeld aan Vercel (subdomein-record
> naar Vercel; de rest van swijsen.eu incl. e-mail blijft ongemoeid). Hetzelfde
> adres werkt ook op https://olivia-poetsen.vercel.app.
>
> Opnieuw uitrollen na wijzigingen: `vercel --prod` in deze map (vereist een
> ingelogde Vercel CLI: `vercel login`). Build-config staat in `vercel.json` +
> `build.mjs`; het Vercel-project heet `olivia-poetsen` en de deployment-
> beveiliging staat uit zodat de URL publiek is.

**Optie A — snel, via wifi (zelfde netwerk):**
1. Start `npm run dev` op je Mac.
2. Er verschijnt ook een "Network"-adres (bv. http://192.168.0.206:5173).
3. Typ dat adres in Safari op de iPad.
4. Tik op het deel-icoon → **Zet op beginscherm**. Nu staat er een app-icoon
   en speelt het schermvullend.

> Let op: bij Optie A moet je Mac aanstaan en `npm run dev` draaien.

**Optie B — altijd beschikbaar (gratis hosting):**
1. `npm run build` maakt een kant-en-klare versie in de map `dist/`.
2. Zet de map `dist/` op een gratis statische host (bv. Netlify Drop:
   sleep de map naar netlify.com/drop, of GitHub Pages).
3. Open de link in Safari op de iPad en zet 'm op het beginscherm.

## De iconen opnieuw maken
```bash
cd spelletjes/poetsen
node src/pwa/make-icons.mjs   # schrijft de PWA-iconen naar public/
```

## Hoe het in elkaar zit (voor wie verder bouwt)
Mini-monorepo, gebouwd met Vite:
- `homepage/` — Olivia's homepage (kleine Vite-app): een rooster met spel-tegels
  (`SPELLETJES` in `homepage/main.js`), eigen manifest/service-worker/icons.
- `spelletjes/poetsen/` — het Poetsen-spel (Vite + vanilla JS, HTML Canvas voor
  het schoonmaken, platte SVG, localStorage, PWA). `src/data/*` is de bron van
  waarheid voor metadata; `src/state.js` bewaart bezit + voortgang; `src/screens/*`
  via `src/router.js`; `src/clean/*` is de schoonmaak-motor; `src/art/*` de SVG's.
  Gebouwd met `base=./` zodat het onder een submap-pad werkt.
- `build.mjs` — bouwt de homepage → `dist/` en elk spel → `dist/spelletjes/<naam>/`.
- `vercel.json` — serveer-regels (SPA-fallback per app, no-cache voor de service
  workers). Eén Vercel-project serveert het geheel op `olivia.swijsen.eu`.

### Nieuw spel toevoegen
1. Maak `spelletjes/<naam>/` als losse Vite-app (eigen `index.html`, gebouwd met
   `base=./`, en relatieve paden naar manifest/icons/sw — zoals bij poetsen).
2. Voeg een regel toe aan `SPELLETJES` in `homepage/main.js`:
   `{ naam, emoji, kleur, url: "/spelletjes/<naam>/", klaar: true }`.
3. Voeg een build-regel toe in `build.mjs` (kopieer de poetsen-regel).
4. Voeg desgewenst een sw-header/rewrite voor het nieuwe pad toe in `vercel.json`.
5. `npm run build` en daarna `vercel --prod`.
