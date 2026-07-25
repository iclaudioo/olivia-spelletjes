// Woordjes-tab: woordgroepen met kaartjes die het Griekse woord voorlezen.
import { WOORDEN } from "./data.js";
import { zeg } from "./spraak.js";

export function initWoordjes() {
  const categorieen = document.getElementById("categorieen");
  const woordenlijst = document.getElementById("woordenlijst");

  function toonCategorie(naam) {
    categorieen.querySelectorAll(".cat-knop").forEach((k) =>
      k.classList.toggle("actief", k.textContent === naam));
    woordenlijst.innerHTML = "";
    WOORDEN[naam].forEach((w) => {
      const kaart = document.createElement("button");
      kaart.className = "woordkaart";
      kaart.setAttribute("aria-label", `${w.nl} in het Grieks`);
      kaart.innerHTML =
        '<div class="emoji">' + w.emoji + "</div>" +
        '<div class="grieks">' + w.grieks + "</div>" +
        '<div class="zegmaar">' + w.zegmaar + "</div>" +
        '<div class="nl">' + w.nl + "</div>";
      kaart.addEventListener("click", () => zeg(w.grieks));
      woordenlijst.appendChild(kaart);
    });
  }

  Object.keys(WOORDEN).forEach((naam, i) => {
    const knop = document.createElement("button");
    knop.className = "cat-knop" + (i === 0 ? " actief" : "");
    knop.textContent = naam;
    knop.addEventListener("click", () => toonCategorie(naam));
    categorieen.appendChild(knop);
  });
  toonCategorie(Object.keys(WOORDEN)[0]);
}
