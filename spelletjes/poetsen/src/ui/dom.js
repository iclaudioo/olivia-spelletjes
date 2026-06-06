// Gedeelde, kleine DOM-helpers. Voorheen had elk scherm een eigen kopie van
// `maak`/`el`; nu staat die op één plek zodat het gedrag overal hetzelfde is.

// Maakt een element met optionele class en tekst (textContent — veilig, geen HTML).
export function maak(tag, klasse, tekst) {
  const e = document.createElement(tag);
  if (klasse) e.className = klasse;
  if (tekst != null) e.textContent = tekst;
  return e;
}

// Bouwt een standaard huis-kaart (.huis-kaart met .huis-emoji + .huis-naam).
// Gebruikt door zowel het beginscherm als de winkel, zodat huis-kaarten er
// overal identiek uitzien. De aanroeper voegt zelf gedrag/extra's toe.
export function maakHuisKaart({ emoji, naam, tag = "button", extraKlasse = "" } = {}) {
  const klasse = extraKlasse ? `huis-kaart ${extraKlasse}` : "huis-kaart";
  const kaart = maak(tag, klasse);
  kaart.append(maak("div", "huis-emoji", emoji), maak("div", "huis-naam", naam));
  return kaart;
}
