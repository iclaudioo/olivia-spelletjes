// Schrijven-tab: een letter kiezen en met je vinger natekenen over het
// grijze voorbeeld. Genoeg van de letter geraakt = letter verdiend.
import { LETTERS } from "./data.js";
import { zeg } from "./spraak.js";
import { confettiBij } from "./util.js";
import { state, bewaar } from "./state.js";

const MAAT = 340;
const LETTER_FONT = `bold 250px "Trebuchet MS", "Segoe UI", sans-serif`;
const GENOEG = 0.45; // dit deel van de letter moet geraakt zijn

export function initSchrijven() {
  const kiezer = document.getElementById("letterkiezer");
  const voorbeeld = document.getElementById("voorbeeldcanvas");
  const teken = document.getElementById("tekencanvas");
  const feedback = document.getElementById("schrijffeedback");
  const voorbeeldCtx = voorbeeld.getContext("2d");
  const tekenCtx = teken.getContext("2d");
  // Onzichtbaar masker van de letter, om te meten hoeveel ervan geraakt is.
  const masker = document.createElement("canvas");
  masker.width = MAAT;
  masker.height = MAAT;
  const maskerCtx = masker.getContext("2d", { willReadFrequently: true });

  let huidige = LETTERS[0];
  let aanHetTekenen = false;

  function tekenLetter(ctx, kleur) {
    ctx.clearRect(0, 0, MAAT, MAAT);
    ctx.font = LETTER_FONT;
    ctx.fillStyle = kleur;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(huidige.hoofd, MAAT / 2, MAAT / 2 + 10);
  }

  function kies(letter) {
    huidige = letter;
    kiezer.querySelectorAll(".letterchip").forEach((k) =>
      k.classList.toggle("actief", k.dataset.letter === letter.hoofd));
    tekenLetter(voorbeeldCtx, "#d9e6f8");
    tekenLetter(maskerCtx, "#000");
    tekenCtx.clearRect(0, 0, MAAT, MAAT);
    feedback.textContent = "";
    zeg(letter.grieks);
  }

  function positie(e) {
    const rect = teken.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * MAAT,
      y: ((e.clientY - rect.top) / rect.height) * MAAT,
    };
  }

  teken.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    aanHetTekenen = true;
    teken.setPointerCapture(e.pointerId);
    const p = positie(e);
    tekenCtx.strokeStyle = "#1e6fd9";
    tekenCtx.lineWidth = 20;
    tekenCtx.lineCap = "round";
    tekenCtx.lineJoin = "round";
    tekenCtx.beginPath();
    tekenCtx.moveTo(p.x, p.y);
    tekenCtx.lineTo(p.x + 0.1, p.y + 0.1);
    tekenCtx.stroke();
  });
  teken.addEventListener("pointermove", (e) => {
    if (!aanHetTekenen) return;
    const p = positie(e);
    tekenCtx.lineTo(p.x, p.y);
    tekenCtx.stroke();
  });
  ["pointerup", "pointercancel"].forEach((t) =>
    teken.addEventListener(t, () => { aanHetTekenen = false; }));

  function dekking() {
    const maskerData = maskerCtx.getImageData(0, 0, MAAT, MAAT).data;
    const tekenData = tekenCtx.getImageData(0, 0, MAAT, MAAT).data;
    let letterPixels = 0;
    let geraakt = 0;
    for (let i = 3; i < maskerData.length; i += 16) { // elke 4e pixel is genoeg
      if (maskerData[i] > 128) {
        letterPixels++;
        if (tekenData[i] > 0) geraakt++;
      }
    }
    return letterPixels ? geraakt / letterPixels : 0;
  }

  function maakChips() {
    kiezer.innerHTML = "";
    LETTERS.forEach((l) => {
      const chip = document.createElement("button");
      chip.className = "letterchip" +
        (state.geschreven[l.hoofd] ? " geschreven" : "") +
        (l.hoofd === huidige.hoofd ? " actief" : "");
      chip.dataset.letter = l.hoofd;
      chip.textContent = l.hoofd;
      chip.setAttribute("aria-label", `Schrijf de letter ${l.naam}`);
      chip.addEventListener("click", () => kies(l));
      kiezer.appendChild(chip);
    });
  }

  document.getElementById("schrijf-wis").addEventListener("click", () => {
    tekenCtx.clearRect(0, 0, MAAT, MAAT);
    feedback.textContent = "";
  });

  document.getElementById("schrijf-klaar").addEventListener("click", (e) => {
    if (dekking() >= GENOEG) {
      const nieuw = !state.geschreven[huidige.hoofd];
      state.geschreven[huidige.hoofd] = true;
      if (nieuw) {
        state.sterren++;
        bewaar();
        maakChips();
      }
      feedback.textContent = `🎉 Knap geschreven, dat is de ${huidige.naam}!` + (nieuw ? " +1 ster ⭐" : "");
      feedback.style.color = "var(--groen)";
      confettiBij(e.target);
      zeg(huidige.grieks);
    } else {
      feedback.textContent = "Nog niet helemaal. Volg de grijze letter en probeer opnieuw!";
      feedback.style.color = "var(--rood)";
    }
  });

  maakChips();
  // De eerste letter klaarzetten zonder ze meteen voor te lezen.
  huidige = LETTERS[0];
  tekenLetter(voorbeeldCtx, "#d9e6f8");
  tekenLetter(maskerCtx, "#000");
}
