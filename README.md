# Olivia's Schoonmaak Huizen 🧹🏠

Een vrolijk spel waarin Olivia vuile huizen helemaal schoon mag maken — met een
toolbar vol borstels en schoonmaakproducten. Gemaakt om op de iPad te spelen.

## Wat het spel kan (compleet)
- **Schoonmaken** — veeg met je vinger het vuil weg. Verschillend vuil (stof,
  vlekken, modder, aangekoekt, spinnenwebben, kruimels) heeft het JUISTE gereedschap
  nodig: 🧽 spons, 🪥 borstel, 🧴 spray, 🧹 bezem, 🪶 plumeau. Ruim ook het
  rondslingerende speelgoed op door het naar de 🗑️ prullenbak te slepen. Met
  sparkles ✨, geluidjes, een voortgangsbalk en een "Helemaal schoon!"-feestje.
- **Vier huizen** met elk meerdere kamers in eigen stijl: 🏡 Mijn Huis, 🏖️
  Strandhuis, 🏰 Kasteel en 🚀 Ruimteraket.
- **Winkel** — verdien munten met schoonmaken en koop nieuwe huizen, meubels en
  gereedschap-uiterlijken (skins).
- **Inrichten** — zet meubels neer en sleep ze op hun plek, en kies behang- en
  vloerkleuren. Alles wordt bewaard.
- **Foto-modus** 📸 — maak een kiekje van je ingerichte kamer om te bewaren.
- **Verzamelboek** 📖 — verdien stickers door te spelen.
- **Instellingen** ⚙️ — geluid en achtergrondmuziek aan/uit, en je skin kiezen
  (muziek snel dempen kan ook met de 🔊-knop bovenin).
- Alle voortgang wordt op de iPad bewaard (localStorage).

## Spelen op de computer
```bash
cd schoonmaak-spel
npm install        # alleen de eerste keer
npm run dev        # start het spel
```
Open daarna het adres dat verschijnt (bv. http://localhost:5173) in de browser.

## Op Olivia's iPad zetten

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
node src/pwa/make-icons.mjs   # schrijft de PWA-iconen naar public/
```

## Hoe het in elkaar zit (voor wie verder bouwt)
- **Vite + vanilla JS (ES-modules)**, HTML Canvas voor het schoonmaken, platte
  SVG-illustraties, localStorage voor de spelstaat, PWA voor op het beginscherm.
- `src/data/*` (huizen, meubels, skins, stickers) is de bron van waarheid voor
  alle metadata; `src/state.js` bewaart alleen bezit + voortgang.
- `src/art/` bevat de SVG-illustraties (kamers per thema via `kamers.js`, meubels).
- `src/screens/` zijn de schermen (home, huis, schoonmaak, winkel, inrichten,
  verzamelboek, instellingen), gekoppeld via `src/router.js`.
- `src/clean/` is de schoonmaak-motor (vuil-lagen, gereedschap-matchen, rommel).
