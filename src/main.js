// Opstart + (later) scherm-router. Mijlpaal 1: meteen het schoonmaak-scherm.

import { toonSchoonmaak } from "./screens/clean.js";
import { ontgrendelAudio } from "./audio/sfx.js";

const app = document.getElementById("app");

// Audio ontgrendelen bij de allereerste aanraking (vereist door iOS Safari).
window.addEventListener("pointerdown", () => ontgrendelAudio(), { once: true });

// Voorkom dubbel-tik-zoom en slepen van de pagina op de iPad.
document.addEventListener("gesturestart", (e) => e.preventDefault());
document.addEventListener("touchmove", (e) => {
  if (e.touches.length > 1) e.preventDefault();
}, { passive: false });

toonSchoonmaak(app);

// Service worker registreren (voor offline / op beginscherm) — alleen in productie.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
