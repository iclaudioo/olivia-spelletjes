// Quiz-tab: vier quizzen die sterren opleveren.
// Letters: hoe heet deze letter? Luisteren: welk woord hoor je?
// Woorden: wat betekent dit Griekse woord? Oefenronde: tien vragen door elkaar.
import { LETTERS, ALLE_WOORDEN } from "./data.js";
import { zeg } from "./spraak.js";
import { schud, kiesUit, confettiBij } from "./util.js";
import { state, bewaar, vandaag } from "./state.js";

const JUICH = ["🎉 Juist! Goed zo, Olivia!", "⭐ Super, dat klopt!", "💪 Knap gedaan!", "🌟 Helemaal goed!"];
const RONDE_LENGTE = 10;
const RONDE_BONUS = 5;

export function initQuizzen() {
  const modesVak = document.getElementById("quizmodes");
  const kaart = document.getElementById("quizkaart");
  const sterrenbalk = document.getElementById("sterrenbalk");

  const MODES = [
    { id: "letters", naam: "🔡 Letters" },
    { id: "luister", naam: "👂 Luisteren" },
    { id: "woorden", naam: "🇬🇷 Woorden" },
    { id: "ronde",   naam: "🌟 Oefenronde" },
  ];
  let mode = "letters";
  let slot = false;
  let generatie = 0; // voorkomt dat een oude setTimeout een nieuwe quiz overschrijft
  let ronde = null;  // { vraagNr, goed } tijdens een oefenronde

  function toonSterren() {
    sterrenbalk.textContent =
      "⭐".repeat(Math.min(state.sterren, 20)) + (state.sterren > 20 ? " +" + (state.sterren - 20) : "");
  }

  function toonModes() {
    modesVak.innerHTML = "";
    MODES.forEach((m) => {
      const knop = document.createElement("button");
      knop.className = "cat-knop" + (m.id === mode ? " actief" : "");
      knop.textContent = m.id === "ronde" && state.oefenrondeLaatst === vandaag()
        ? m.naam + " ✔"
        : m.naam;
      knop.addEventListener("click", () => start(m.id));
      modesVak.appendChild(knop);
    });
  }

  function start(nieuweMode) {
    mode = nieuweMode;
    generatie++;
    ronde = mode === "ronde" ? { vraagNr: 0, goed: 0 } : null;
    toonModes();
    volgendeVraag();
  }

  function volgendeVraag() {
    slot = false;
    if (ronde) {
      ronde.vraagNr++;
      if (ronde.vraagNr > RONDE_LENGTE) return toonRondeKlaar();
    }
    const type = ronde ? kiesUit(["letters", "luister", "woorden"]) : mode;
    if (type === "letters") letterVraag();
    else if (type === "luister") luisterVraag();
    else woordVraag();
  }

  function kop(tekst) {
    const teller = ronde ? `<div class="rondeteller">Vraag ${ronde.vraagNr} van ${RONDE_LENGTE}</div>` : "";
    return teller + `<div>${tekst}</div>`;
  }

  function maakOpties(opties, tekstVan, isGoed, naGoed) {
    const vak = kaart.querySelector(".quizopties");
    opties.forEach((optie) => {
      const knop = document.createElement("button");
      knop.className = "quizoptie";
      knop.innerHTML = tekstVan(optie);
      knop.addEventListener("click", () => antwoord(knop, optie, isGoed, naGoed, tekstVan));
      vak.appendChild(knop);
    });
  }

  function antwoord(knop, optie, isGoed, naGoed, tekstVan) {
    if (slot) return;
    slot = true;
    const feedback = kaart.querySelector(".feedback");
    const goed = isGoed(optie);
    if (goed) {
      knop.classList.add("goed");
      state.sterren++;
      feedback.textContent = kiesUit(JUICH);
      feedback.style.color = "var(--groen)";
      if (ronde) ronde.goed++;
      if (state.sterren % 5 === 0) confettiBij(knop);
    } else {
      knop.classList.add("fout");
      feedback.style.color = "var(--rood)";
      kaart.querySelectorAll(".quizoptie").forEach((k) => {
        if (isGoed(k._optie)) k.classList.add("goed");
      });
    }
    naGoed(goed, feedback);
    bewaar();
    toonSterren();
    const dezeGeneratie = generatie;
    setTimeout(() => { if (dezeGeneratie === generatie) volgendeVraag(); }, 1800);
  }

  // Elke optieknop onthoudt zijn eigen optie zodat we het juiste antwoord kunnen tonen.
  function koppelOpties() {
    const knoppen = kaart.querySelectorAll(".quizoptie");
    return (opties) => knoppen.forEach((k, i) => { k._optie = opties[i]; });
  }

  function letterVraag() {
    const juist = kiesUit(LETTERS);
    const opties = schud([juist, ...schud(LETTERS.filter((l) => l.naam !== juist.naam)).slice(0, 2)]);
    kaart.innerHTML =
      kop("Hoe heet deze letter?") +
      `<div class="quizletter">${juist.hoofd} ${juist.klein}</div>` +
      '<div class="quizopties"></div><div class="feedback"></div>';
    maakOpties(opties, (o) => o.naam, (o) => o.naam === juist.naam, (goed, feedback) => {
      zeg(juist.grieks);
      if (!goed) feedback.textContent = "Bijna! Het was: " + juist.naam;
    });
    koppelOpties()(opties);
  }

  function luisterVraag() {
    const juist = kiesUit(ALLE_WOORDEN);
    const anders = schud(ALLE_WOORDEN.filter((w) => w.nl !== juist.nl)).slice(0, 2);
    const opties = schud([juist, ...anders]);
    kaart.innerHTML =
      kop("Welk woord hoor je?") +
      '<button class="luisterknop" aria-label="Luister nog eens">🔊</button>' +
      '<div class="quizopties"></div><div class="feedback"></div>';
    kaart.querySelector(".luisterknop").addEventListener("click", () => zeg(juist.grieks));
    zeg(juist.grieks);
    maakOpties(
      opties,
      (o) => `<span class="optie-emoji">${o.emoji}</span> ${o.nl}`,
      (o) => o.nl === juist.nl,
      (goed, feedback) => {
        if (goed) {
          state.groepGoed[juist.groep] = (state.groepGoed[juist.groep] || 0) + 1;
        } else {
          feedback.textContent = `Bijna! Het was: ${juist.emoji} ${juist.nl} (${juist.grieks})`;
        }
      }
    );
    koppelOpties()(opties);
  }

  function woordVraag() {
    const juist = kiesUit(ALLE_WOORDEN);
    const anders = schud(ALLE_WOORDEN.filter((w) => w.nl !== juist.nl)).slice(0, 2);
    const opties = schud([juist, ...anders]);
    kaart.innerHTML =
      kop("Wat betekent dit woord?") +
      `<div class="quizwoord">${juist.grieks}</div>` +
      `<div class="quizzegmaar">${juist.zegmaar}</div>` +
      '<div class="quizopties"></div><div class="feedback"></div>';
    zeg(juist.grieks);
    maakOpties(
      opties,
      (o) => `<span class="optie-emoji">${o.emoji}</span> ${o.nl}`,
      (o) => o.nl === juist.nl,
      (goed, feedback) => {
        if (goed) {
          state.groepGoed[juist.groep] = (state.groepGoed[juist.groep] || 0) + 1;
        } else {
          feedback.textContent = `Bijna! Het was: ${juist.emoji} ${juist.nl}`;
        }
      }
    );
    koppelOpties()(opties);
  }

  function toonRondeKlaar() {
    const goed = ronde.goed;
    state.sterren += RONDE_BONUS;
    state.oefenrondes++;
    state.oefenrondeLaatst = vandaag();
    bewaar();
    toonSterren();
    toonModes();
    kaart.innerHTML =
      '<div class="rondeklaar">' +
      `<div class="rondeklaar-emoji">${goed >= 8 ? "🏆" : goed >= 5 ? "🎉" : "💪"}</div>` +
      `<div class="rondeklaar-titel">Oefenronde klaar!</div>` +
      `<div>Je had ${goed} van de ${RONDE_LENGTE} goed.</div>` +
      `<div class="rondeklaar-bonus">Bonus: +${RONDE_BONUS} sterren ⭐</div>` +
      '<button class="knop" id="ronde-opnieuw">Nog een keer</button>' +
      "</div>";
    confettiBij(kaart);
    kaart.querySelector("#ronde-opnieuw").addEventListener("click", () => start("ronde"));
    ronde = null;
  }

  toonSterren();
  start("letters");
}
