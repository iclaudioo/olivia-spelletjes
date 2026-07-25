// Memory-tab: paren zoeken van Grieks woord en plaatje. Elk nieuw spel kiest
// een willekeurige woordgroep; een groep uitspelen levert een badge op.
import { WOORDEN } from "./data.js";
import { zeg } from "./spraak.js";
import { schud, kiesUit, confettiBij } from "./util.js";
import { state, bewaar } from "./state.js";

const MEM_PAREN = 6;

export function initMemory() {
  const rooster = document.getElementById("memory-rooster");
  const score = document.getElementById("memory-score");
  const groepVak = document.getElementById("memory-groep");
  let open = [];
  let paren = 0;
  let slot = false;
  let groep = "";

  function nieuwSpel() {
    rooster.innerHTML = "";
    open = [];
    paren = 0;
    slot = false;
    score.textContent = `Paren: 0 van ${MEM_PAREN}`;
    groep = kiesUit(Object.keys(WOORDEN));
    groepVak.textContent = `Groep: ${groep}`;
    const woorden = schud(WOORDEN[groep]).slice(0, MEM_PAREN);
    const kaarten = [];
    woorden.forEach((w, i) => {
      kaarten.push({ paar: i, soort: "woord", tekst: w.grieks, spreek: w.grieks });
      kaarten.push({ paar: i, soort: "plaatje", tekst: w.emoji, spreek: w.grieks });
    });
    schud(kaarten).forEach((k) => {
      const kaart = document.createElement("button");
      kaart.className = "memkaart";
      kaart.innerHTML = '<span class="vraagteken">❓</span>';
      kaart.addEventListener("click", () => draaiOm(kaart, k));
      rooster.appendChild(kaart);
    });
  }

  function toonKaart(kaart, k) {
    kaart.innerHTML = k.soort === "plaatje"
      ? '<span class="mem-emoji">' + k.tekst + "</span>"
      : '<span class="mem-woord">' + k.tekst + "</span>";
  }

  function draaiOm(kaart, k) {
    if (slot || kaart.classList.contains("open") || kaart.classList.contains("klaar")) return;
    kaart.classList.add("open");
    toonKaart(kaart, k);
    zeg(k.spreek);
    open.push({ kaart, k });
    if (open.length !== 2) return;
    slot = true;
    const [a, b] = open;
    if (a.k.paar === b.k.paar && a.k.soort !== b.k.soort) {
      setTimeout(() => {
        a.kaart.classList.remove("open"); a.kaart.classList.add("klaar");
        b.kaart.classList.remove("open"); b.kaart.classList.add("klaar");
        paren++;
        score.textContent = `Paren: ${paren} van ${MEM_PAREN}`;
        if (paren === MEM_PAREN) {
          score.textContent = "🎉 Alles gevonden, knap gedaan!";
          state.memoryKlaar[groep] = true;
          bewaar();
          confettiBij(score);
        }
        open = [];
        slot = false;
      }, 600);
    } else {
      setTimeout(() => {
        a.kaart.classList.remove("open");
        b.kaart.classList.remove("open");
        a.kaart.innerHTML = '<span class="vraagteken">❓</span>';
        b.kaart.innerHTML = '<span class="vraagteken">❓</span>';
        open = [];
        slot = false;
      }, 1100);
    }
  }

  document.getElementById("memory-opnieuw").addEventListener("click", nieuwSpel);
  nieuwSpel();
}
