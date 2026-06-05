# Olivia's Schoonmaak Huizen 🧹🏠

Een vrolijk spel waarin Olivia vuile huizen helemaal schoon mag maken — met een
toolbar vol borstels en schoonmaakproducten. Gemaakt om op de iPad te spelen.

## Wat werkt nu (Mijlpaal 1)
- Een vuile woonkamer schoonmaken door met je vinger over het vuil te vegen.
- 5 stuks schoonmaakgerei: spons, borstel, spray, bezem, plumeau.
- Sparkles ✨, geluidjes, een voortgangsbalk en een "Helemaal schoon!"-feestje.
- Je verdient munten; die worden op de iPad bewaard.

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
node src/pwa/make-icons.mjs
```

## Wat er nog komt (volgende mijlpalen)
2. Een heel huis met meerdere kamers + juist gereedschap per soort vuil.
3. Huizen kopen & sparen (winkel, thema-huizen: strand, kasteel, raket…).
4. Inrichten: meubels plaatsen, behang en kleuren kiezen.
5. Verzamelen: stickerboek, foto-modus, muziek.
