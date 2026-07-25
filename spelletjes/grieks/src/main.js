// Grieks voor Olivia: alfabet leren, woordjes luisteren, memory en een letterquiz.
// Spraak via de Web Speech API met een Griekse stem als die er is (op iPad: Melina).
import { LETTERS, WOORDEN } from "./data.js";

const beweegOk = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- Spreken ----------
let griekseStem = null;
function kiesStem() {
  const stemmen = window.speechSynthesis ? speechSynthesis.getVoices() : [];
  griekseStem = stemmen.find((s) => s.lang && s.lang.toLowerCase().startsWith("el")) || null;
}
if (window.speechSynthesis) {
  kiesStem();
  speechSynthesis.onvoiceschanged = kiesStem;
}
function zeg(tekst) {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(tekst);
  u.lang = "el-GR";
  if (griekseStem) u.voice = griekseStem;
  u.rate = 0.75;
  speechSynthesis.speak(u);
}

// ---------- Confetti (klein feestje, respecteert reduced motion) ----------
function confetti(x, y) {
  if (!beweegOk) return;
  const stukjes = ["🎉", "⭐", "💛", "✨", "💙"];
  for (let i = 0; i < 10; i++) {
    const s = document.createElement("span");
    s.className = "confetti";
    s.textContent = stukjes[i % stukjes.length];
    s.style.left = x + "px";
    s.style.top = y + "px";
    s.style.setProperty("--dx", (Math.random() * 160 - 80).toFixed(0) + "px");
    s.style.setProperty("--dy", (-40 - Math.random() * 120).toFixed(0) + "px");
    document.body.appendChild(s);
    s.addEventListener("animationend", () => s.remove());
  }
}

function schud(lijst) {
  const kopie = lijst.slice();
  for (let i = kopie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
  }
  return kopie;
}

// ---------- Tabs ----------
document.querySelectorAll(".tab").forEach((knop) => {
  knop.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((k) => k.classList.remove("actief"));
    document.querySelectorAll(".paneel").forEach((p) => p.classList.remove("actief"));
    knop.classList.add("actief");
    document.getElementById(knop.dataset.doel).classList.add("actief");
  });
});

// ---------- Alfabet ----------
const letterrooster = document.getElementById("letterrooster");
LETTERS.forEach((l) => {
  const kaart = document.createElement("button");
  kaart.className = "letterkaart";
  kaart.setAttribute("aria-label", `Letter ${l.naam}, klinkt als ${l.klank}`);
  kaart.innerHTML =
    '<div class="groot">' + l.hoofd + " " + l.klein + "</div>" +
    '<div class="naam">' + l.naam + "</div>" +
    '<div class="klank">' + l.klank + "</div>";
  kaart.addEventListener("click", () => zeg(l.grieks));
  letterrooster.appendChild(kaart);
});

// ---------- Woordjes ----------
const categorieen = document.getElementById("categorieen");
const woordenlijst = document.getElementById("woordenlijst");
function toonCategorie(naam) {
  document.querySelectorAll(".cat-knop").forEach((k) =>
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

// ---------- Memory ----------
// Elk nieuw spel kiest een willekeurige woordgroep, zodat het niet altijd
// dezelfde zes dieren zijn.
const MEM_PAREN = 6;
const memRooster = document.getElementById("memory-rooster");
const memScore = document.getElementById("memory-score");
let memOpen = [];
let memParen = 0;
let memSlot = false;

function nieuwMemory() {
  memRooster.innerHTML = "";
  memOpen = [];
  memParen = 0;
  memSlot = false;
  memScore.textContent = `Paren: 0 van ${MEM_PAREN}`;
  const groepen = Object.keys(WOORDEN);
  const groep = groepen[Math.floor(Math.random() * groepen.length)];
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
    memRooster.appendChild(kaart);
  });
}

function toonKaart(kaart, k) {
  kaart.innerHTML = k.soort === "plaatje"
    ? '<span class="mem-emoji">' + k.tekst + "</span>"
    : '<span class="mem-woord">' + k.tekst + "</span>";
}

function draaiOm(kaart, k) {
  if (memSlot || kaart.classList.contains("open") || kaart.classList.contains("klaar")) return;
  kaart.classList.add("open");
  toonKaart(kaart, k);
  zeg(k.spreek);
  memOpen.push({ kaart, k });
  if (memOpen.length === 2) {
    memSlot = true;
    const [a, b] = memOpen;
    if (a.k.paar === b.k.paar && a.k.soort !== b.k.soort) {
      setTimeout(() => {
        a.kaart.classList.remove("open"); a.kaart.classList.add("klaar");
        b.kaart.classList.remove("open"); b.kaart.classList.add("klaar");
        memParen++;
        memScore.textContent = `Paren: ${memParen} van ${MEM_PAREN}`;
        if (memParen === MEM_PAREN) {
          memScore.textContent = "🎉 Alles gevonden, knap gedaan!";
          const vak = memScore.getBoundingClientRect();
          confetti(vak.left + vak.width / 2, vak.top);
        }
        memOpen = [];
        memSlot = false;
      }, 600);
    } else {
      setTimeout(() => {
        a.kaart.classList.remove("open");
        b.kaart.classList.remove("open");
        a.kaart.innerHTML = '<span class="vraagteken">❓</span>';
        b.kaart.innerHTML = '<span class="vraagteken">❓</span>';
        memOpen = [];
        memSlot = false;
      }, 1100);
    }
  }
}
document.getElementById("memory-opnieuw").addEventListener("click", nieuwMemory);
nieuwMemory();

// ---------- Quiz ----------
// Sterren blijven bewaard op de iPad (localStorage), net als in de andere spellen.
const STERREN_SLEUTEL = "olivia-grieks-sterren";
const JUICH = ["🎉 Juist! Goed zo, Olivia!", "⭐ Super, dat klopt!", "💪 Knap gedaan!", "🌟 Helemaal goed!"];
const quizLetterVak = document.getElementById("quizletter");
const quizOptiesVak = document.getElementById("quizopties");
const quizFeedback = document.getElementById("quizfeedback");
const sterrenbalk = document.getElementById("sterrenbalk");
let sterren = 0;
try { sterren = parseInt(localStorage.getItem(STERREN_SLEUTEL), 10) || 0; } catch { /* privémodus */ }
let quizSlot = false;
let huidigeVraag = null;

function toonSterren() {
  sterrenbalk.textContent = "⭐".repeat(Math.min(sterren, 20)) + (sterren > 20 ? " +" + (sterren - 20) : "");
}

function nieuweVraag() {
  quizSlot = false;
  quizFeedback.textContent = "";
  const juist = LETTERS[Math.floor(Math.random() * LETTERS.length)];
  huidigeVraag = juist;
  quizLetterVak.textContent = juist.hoofd + " " + juist.klein;
  const fouten = schud(LETTERS.filter((l) => l.naam !== juist.naam)).slice(0, 2);
  const opties = schud([juist, ...fouten]);
  quizOptiesVak.innerHTML = "";
  opties.forEach((optie) => {
    const knop = document.createElement("button");
    knop.className = "quizoptie";
    knop.textContent = optie.naam;
    knop.addEventListener("click", () => kies(knop, optie));
    quizOptiesVak.appendChild(knop);
  });
}

function kies(knop, optie) {
  if (quizSlot) return;
  quizSlot = true;
  zeg(huidigeVraag.grieks);
  if (optie.naam === huidigeVraag.naam) {
    knop.classList.add("goed");
    sterren++;
    try { localStorage.setItem(STERREN_SLEUTEL, String(sterren)); } catch { /* privémodus */ }
    quizFeedback.textContent = JUICH[Math.floor(Math.random() * JUICH.length)];
    quizFeedback.style.color = "var(--groen)";
    if (sterren % 5 === 0) {
      const vak = knop.getBoundingClientRect();
      confetti(vak.left + vak.width / 2, vak.top);
    }
  } else {
    knop.classList.add("fout");
    quizFeedback.textContent = "Bijna! Het was: " + huidigeVraag.naam;
    quizFeedback.style.color = "var(--rood)";
    document.querySelectorAll(".quizoptie").forEach((k) => {
      if (k.textContent === huidigeVraag.naam) k.classList.add("goed");
    });
  }
  toonSterren();
  setTimeout(nieuweVraag, 1800);
}
toonSterren();
nieuweVraag();

// ---------- Service worker (offline en snel op de iPad) ----------
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
