// Prijzen-tab: alles wat Olivia al verdiend heeft, in een prijzenkast.
import { LETTERS, WOORDEN } from "./data.js";
import { state } from "./state.js";

const MEDAILLE_BIJ = 10; // goede quizantwoorden per groep voor een medaille

export function renderPrijzen() {
  const kast = document.getElementById("prijzenkast");
  const geschreven = LETTERS.filter((l) => state.geschreven[l.hoofd]).length;

  const letterchips = LETTERS.map((l) =>
    `<span class="prijsletter${state.geschreven[l.hoofd] ? " verdiend" : ""}">${l.hoofd}</span>`
  ).join("");

  const medailles = Object.keys(WOORDEN).map((groep) => {
    const goed = state.groepGoed[groep] || 0;
    const medaille = goed >= MEDAILLE_BIJ;
    const memory = state.memoryKlaar[groep];
    return (
      '<div class="prijsrij">' +
      `<span class="prijsrij-naam">${groep}</span>` +
      `<span class="prijsrij-badges">` +
      (medaille ? "🥇" : `<span class="prijsrij-tel">${goed}/${MEDAILLE_BIJ}</span>`) +
      (memory ? " 🧠" : "") +
      "</span></div>"
    );
  }).join("");

  kast.innerHTML =
    '<div class="prijsblok prijsblok-sterren">' +
    `<div class="prijs-groot">⭐ ${state.sterren}</div><div>sterren verdiend met quizzen en schrijven</div>` +
    "</div>" +
    '<div class="prijsblok">' +
    `<div class="prijsblok-titel">✍️ Geschreven letters: ${geschreven} van ${LETTERS.length}</div>` +
    `<div class="prijsletters">${letterchips}</div>` +
    "</div>" +
    '<div class="prijsblok">' +
    `<div class="prijsblok-titel">🥇 Medailles per woordgroep (${MEDAILLE_BIJ} goede antwoorden) en 🧠 voor memory</div>` +
    medailles +
    "</div>" +
    '<div class="prijsblok">' +
    `<div class="prijsblok-titel">🌟 Oefenrondes gedaan: ${state.oefenrondes}</div>` +
    "</div>";
}
