// Alfabet-tab: alle 24 letters als kaartjes die hun klank voorlezen.
import { LETTERS } from "./data.js";
import { zeg } from "./spraak.js";

export function initAlfabet() {
  const rooster = document.getElementById("letterrooster");
  LETTERS.forEach((l) => {
    const kaart = document.createElement("button");
    kaart.className = "letterkaart";
    kaart.setAttribute("aria-label", `Letter ${l.naam}, klinkt als ${l.klank}`);
    kaart.innerHTML =
      '<div class="groot">' + l.hoofd + " " + l.klein + "</div>" +
      '<div class="naam">' + l.naam + "</div>" +
      '<div class="klank">' + l.klank + "</div>";
    kaart.addEventListener("click", () => zeg(l.grieks));
    rooster.appendChild(kaart);
  });
}
