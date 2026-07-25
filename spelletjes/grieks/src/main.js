// Grieks voor Olivia: tabs aansluiten en alle onderdelen starten.
import { initAlfabet } from "./alfabet.js";
import { initWoordjes } from "./woordjes.js";
import { initSchrijven } from "./schrijven.js";
import { initMemory } from "./memory.js";
import { initQuizzen } from "./quizzen.js";
import { renderPrijzen } from "./prijzen.js";

document.querySelectorAll(".tab").forEach((knop) => {
  knop.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((k) => k.classList.remove("actief"));
    document.querySelectorAll(".paneel").forEach((p) => p.classList.remove("actief"));
    knop.classList.add("actief");
    document.getElementById(knop.dataset.doel).classList.add("actief");
    // De prijzenkast telkens vers tonen, zodat nieuwe prijzen meteen zichtbaar zijn.
    if (knop.dataset.doel === "prijzen") renderPrijzen();
  });
});

initAlfabet();
initWoordjes();
initSchrijven();
initMemory();
initQuizzen();
renderPrijzen();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
