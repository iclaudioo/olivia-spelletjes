# Ontwerp: Olivia's Speeltuin — `olivia.swijsen.eu`

**Datum:** 2026-06-06
**Status:** Goedgekeurd (brainstorm) — klaar voor implementatieplan

## Context & doel

Olivia (8+) krijgt een eigen homepage op het zelfgekochte domein `swijsen.eu`.
De homepage (`olivia.swijsen.eu`) toont haar groeiende collectie spelletjes als
grote tegels. Het eerste spel is "Olivia Poetsen" (het bestaande Toca-Boca-achtige
schoonmaakspel). Er volgen later meer spellen. Het geheel moet vrolijk en
kindvriendelijk zijn, schermvullend werken op de iPad, en als app op het
beginscherm gezet kunnen worden.

## Bevestigde keuzes (uit de brainstorm)

1. **Structuur = subpaden onder één domein (optie A).** Eén webadres
   `olivia.swijsen.eu`; spelletjes onder `/spelletjes/<naam>/`. Het Poetsen-spel
   komt op `/spelletjes/poetsen/`.
   - Reden: past bij "één homepage voor Olivia"; en omdat alles op één *origin*
     staat kunnen spellen later data **delen** (munten, look, één profiel).
2. **DNS blijft bij GoDaddy.** `swijsen.eu` wordt ook voor e-mail/andere diensten
   gebruikt, dus we raken de nameservers niet aan. We voegen alleen een
   subdomein-record toe voor `olivia` dat naar Vercel wijst. E-mail blijft werken.
3. **Homepage-stijl = "Speeltuin".** Vrolijke kop met Olivia's eigen figuurtje +
   grote kleurige speeltegels, in dezelfde stijl als het spel.

## Architectuur

**Eén monorepo + één Vercel-project.** Het huidige spel-repo evolueert tot
"Olivia's site": de bestaande spelbestanden verhuizen naar `spelletjes/poetsen/`,
er komt een `homepage/`, en een build-stap bouwt alles samen tot één `dist/`.

Beoogde mappenstructuur (in dit repo):

```
homepage/                 # Olivia's homepage (kleine Vite-app), hergebruikt Olivia-SVG
spelletjes/
  poetsen/                # het bestaande spel, gebouwd met base=/spelletjes/poetsen/
build (orchestrator)      # bouwt homepage → dist/ en elk spel → dist/spelletjes/<naam>/
vercel.json               # rewrites/headers voor de gecombineerde output
dist/                     # eindresultaat: index.html op /, spel onder /spelletjes/poetsen/
  index.html
  spelletjes/poetsen/...
```

- **Eén origin** (`olivia.swijsen.eu`) → gedeelde localStorage mogelijk. Elk spel
  blijft zijn eigen sleutel gebruiken (Poetsen: `olivia-schoonmaak-v4`) zodat er
  geen botsingen zijn; gedeelde data is een latere, optionele uitbreiding.
- Geen proxy/multi-zone nodig; alles is statisch in één deploy. Minder bewegende
  delen, robuuster, makkelijker te onderhouden.

## Onderdeel 1 — De homepage ("Speeltuin")

De homepage is een **kleine Vite-app** (geen extra framework), zodat ze Olivia's
`oliviaSVG` en dezelfde build-/stijl-tooling als het spel kan hergebruiken.

- **Kop:** Olivia's getekende figuurtje (hergebruik `oliviaSVG`) + een vrolijke
  titel (werktitel: "Olivia's Spelletjes" / "Welkom in Olivia's wereld").
- **Tegelrooster:** grote, ronde, kleurige tegels.
  - **Poetsen 🧹** → linkt naar `/spelletjes/poetsen/` (speelbaar).
  - Eén of meer **"Binnenkort ✨"**-tegels als voorproefje op volgende spellen
    (uitgegrijsd, niet klikbaar).
- **Stijl:** zelfde bright kleuren/lettertype/kaart-stijl als het spel; grote
  tikdoelen; schermvullend; `prefers-reduced-motion` gerespecteerd (geen geflikker).
- **PWA:** eigen manifest + app-icoon, zodat ook de homepage op het beginscherm
  gezet kan worden (start_url = `/`).
- **Latere verfijning (niet in fase 1):** Olivia op de homepage tonen in haar
  gekozen outfit uit het spel (mogelijk dankzij de gedeelde origin).

## Onderdeel 2 — Poetsen klaarmaken voor de submap

- Bouwen met **Vite `base: '/spelletjes/poetsen/'`** zodat alle absolute paden
  (assets, `styles.css`, `main.js`) onder het pad kloppen.
- **Service worker + manifest** afstemmen op het subpad: SW-scope en registratie
  onder `/spelletjes/poetsen/`; manifest `start_url`/`scope` = `/spelletjes/poetsen/`;
  icon-paden relatief/onder het pad; `apple-mobile-web-app-title` blijft
  "Olivia Poetsen".
- **"← Terug naar Olivia's wereld"-knop** in het spel (terug naar `/`).
- **Voortgang:** opslag is per origin/adres. Op het nieuwe adres begint Olivia met
  een schone lei (ze heeft op het live-adres nog geen voortgang opgebouwd). De
  in-spel-opslag blijft verder werken zoals nu.

## Onderdeel 3 — Domein & deploy

- **Vercel:** één project gekoppeld aan `olivia.swijsen.eu`. Build levert de
  gecombineerde `dist/`. `vercel.json` regelt per-app SPA-fallback en de no-cache
  header voor de service worker(s).
- **DNS (GoDaddy):** een `CNAME`-record `olivia` → het door Vercel opgegeven doel
  (bijv. `cname.vercel-dns.com`). Nameservers en MX/e-mail blijven ongemoeid.
- **Legacy:** `olivia-poetsen.vercel.app` blijft voorlopig werken; geen kapotte
  links. Kan later opgeruimd worden.

## Onderdeel 4 — Nieuw spel toevoegen (de vaste routine)

1. Nieuw mapje `spelletjes/<naam>/` (los Vite-spel, base = `/spelletjes/<naam>/`).
2. Tegel toevoegen op de homepage.
3. Deployen. Klein, herhaalbaar klusje.

## Fasering

- **Fase 1 (nu):** homepage (Speeltuin) + Poetsen verhuisd naar
  `/spelletjes/poetsen/` + `olivia.swijsen.eu` live via Vercel + GoDaddy-CNAME.
- **Fase 2 (later):** extra spellen; gedeelde munten/profiel; Olivia-in-outfit op
  de homepage.

## Niet in scope (nu)

- Cloud-opslag/accounts/synchronisatie tussen apparaten (voortgang blijft lokaal).
- Gedeelde munten/profiel tussen spellen (komt in fase 2).
- Extra spellen zelf (alleen de plek/tegels worden voorbereid).

## Verificatie

- `npm run build` (orchestrator) groen; `dist/` bevat `index.html` op `/` én het
  spel onder `dist/spelletjes/poetsen/` met kloppende asset-paden.
- Lokaal: homepage opent; tegel Poetsen opent het spel onder het subpad; assets,
  geluid en service worker laden zonder 404's.
- Live: `olivia.swijsen.eu/` (200), `olivia.swijsen.eu/spelletjes/poetsen/` (200),
  manifest + sw + icons (200, juiste content-types); e-mail op `swijsen.eu` werkt
  nog. Visueel gecontroleerd via Preview/screenshot.
- iPad: schermvullend, grote tikdoelen, homepage en spel los op beginscherm te
  zetten.
