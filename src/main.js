// Opstart: schermen aanmelden bij de router en het beginscherm tonen.

import { registreer, navigeer } from "./router.js";
import { toon as toonHome } from "./screens/home.js";
import { toon as toonHuis } from "./screens/house.js";
import { toon as toonSchoonmaak } from "./screens/clean.js";
import { toon as toonInrichten } from "./screens/decorate.js";
import { toon as toonWinkel } from "./screens/shop.js";
import { toon as toonVerzamelboek } from "./screens/collection.js";
import { toon as toonInstellingen } from "./screens/settings.js";
import { toon as toonDansen } from "./screens/dansen.js";
import { toon as toonStyling } from "./screens/styling.js";
import { toon as toonOpdrachten } from "./screens/quests.js";
import { ontgrendelAudio } from "./audio/sfx.js";
import { startMuziekIndienAan } from "./audio/muziek.js";

// Schermen aanmelden.
registreer("home", toonHome);
registreer("huis", toonHuis);
registreer("schoonmaak", toonSchoonmaak);
registreer("inrichten", toonInrichten);
registreer("winkel", toonWinkel);
registreer("verzamelboek", toonVerzamelboek);
registreer("instellingen", toonInstellingen);
registreer("dansen", toonDansen);
registreer("styling", toonStyling);
registreer("opdrachten", toonOpdrachten);

// Audio ontgrendelen bij de allereerste aanraking (vereist door iOS Safari).
// Datzelfde gebaar telt ook om de achtergrondmuziek te mogen starten — dus als
// de instelling "muziek" aan staat, starten we hem hier (anders blijft hij uit).
window.addEventListener(
  "pointerdown",
  () => {
    ontgrendelAudio();
    startMuziekIndienAan();
  },
  { once: true }
);

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
