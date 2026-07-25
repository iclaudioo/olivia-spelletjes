// Kleine hulpjes die meerdere schermen gebruiken.

export const beweegOk = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function schud(lijst) {
  const kopie = lijst.slice();
  for (let i = kopie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
  }
  return kopie;
}

export function kiesUit(lijst) {
  return lijst[Math.floor(Math.random() * lijst.length)];
}

export function confetti(x, y) {
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

export function confettiBij(element) {
  const vak = element.getBoundingClientRect();
  confetti(vak.left + vak.width / 2, vak.top);
}
