// Opstart: schermen aanmelden bij de router en het beginscherm tonen.

import { registreer, navigeer } from "./router.js";
import { toon as toonHome } from "./screens/home.js";
import { toon as toonHuis } from "./screens/house.js";
import { toon as toonSchoonmaak } from "./screens/clean.js";
import { ontgrendelAudio } from "./audio/sfx.js";

// Schermen aanmelden.
registreer("home", toonHome);
registreer("huis", toonHuis);
registreer("schoonmaak", toonSchoonmaak);

// Audio ontgrendelen bij de allereerste aanraking (vereist door iOS Safari).
window.addEventListener("pointerdown", () => ontgrendelAudio(), { once: true });

// Voorkom dubbel-tik-zoom en slepen van de pagina op de iPad.
document.addEventListener("gesturestart", (e) => e.preventDefault());
document.addEventListener("touchmove", (e) => {
  if (e.touches.length > 1) e.preventDefault();
}, { passive: false });

// Beginscherm tonen.
navigeer("home");

// Service worker registreren (voor offline / op beginscherm) — alleen in productie.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
