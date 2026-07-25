// Spraak via de Web Speech API, met een Griekse stem als die er is (op iPad: Melina).

let griekseStem = null;

function kiesStem() {
  const stemmen = window.speechSynthesis ? speechSynthesis.getVoices() : [];
  griekseStem = stemmen.find((s) => s.lang && s.lang.toLowerCase().startsWith("el")) || null;
}

if (window.speechSynthesis) {
  kiesStem();
  speechSynthesis.onvoiceschanged = kiesStem;
}

export function zeg(tekst) {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(tekst);
  u.lang = "el-GR";
  if (griekseStem) u.voice = griekseStem;
  u.rate = 0.75;
  speechSynthesis.speak(u);
}
