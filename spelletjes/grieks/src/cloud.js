// Cloud-sync zoals bij panini: de voortgang staat ook in Supabase, zodat
// sterren en medailles op elk gekoppeld toestel gelijk lopen. Het familie-token
// wordt gedeeld met panini: een toestel dat daar al gekoppeld is, synct hier vanzelf.
// De merge is grow-only (sterren en prijzen kunnen alleen bijkomen), dus twee
// toestellen tegelijk gebruiken kan geen voortgang wissen.
import { state, bewaar } from "./state.js";

const OWNER_TOKEN_STORE = "olivia-panini-owner-token";
const SUPABASE_URL = "https://eblgjinuakxdiikscjpe.supabase.co";
const SUPABASE_KEY = "sb_publishable_88Vk4S3kmsA4uxiA_e5Mqg_01vPFNRd";
const RPC_ENDPOINT = `${SUPABASE_URL}/rest/v1/rpc`;

let pushTimer = null;
let aanHetToepassen = false;
let paneel = null;

function token() {
  return localStorage.getItem(OWNER_TOKEN_STORE) || "";
}

function badge(tekst, soort = "idle") {
  let el = document.getElementById("cloudbadge");
  if (!el) {
    el = document.createElement("button");
    el.id = "cloudbadge";
    el.className = "cloudbadge";
    el.addEventListener("click", () => toonKoppelPaneel());
    document.body.appendChild(el);
  }
  const bol = soort === "ok" ? "🟢" : soort === "error" ? "🔴" : "🟡";
  el.textContent = `${bol} ${tekst}`;
}

async function rpc(naam, body) {
  const response = await fetch(`${RPC_ENDPOINT}/${naam}`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error("forbidden");
    throw new Error("cloud request failed");
  }
  return response.json();
}

// Grow-only samenvoegen: van elk veld de hoogste stand houden.
function merge(cloud, lokaal) {
  const c = cloud && typeof cloud === "object" ? cloud : {};
  const maxGetal = (a, b) => Math.max(Number(a) || 0, Number(b) || 0);
  const unie = (a, b) => ({ ...(a || {}), ...(b || {}) });
  const groepGoed = {};
  for (const groep of new Set([...Object.keys(c.groepGoed || {}), ...Object.keys(lokaal.groepGoed || {})])) {
    groepGoed[groep] = maxGetal(c.groepGoed?.[groep], lokaal.groepGoed?.[groep]);
  }
  return {
    sterren: maxGetal(c.sterren, lokaal.sterren),
    geschreven: unie(c.geschreven, lokaal.geschreven),
    groepGoed,
    memoryKlaar: unie(c.memoryKlaar, lokaal.memoryKlaar),
    oefenrondes: maxGetal(c.oefenrondes, lokaal.oefenrondes),
    oefenrondeLaatst: [c.oefenrondeLaatst || "", lokaal.oefenrondeLaatst || ""].sort().pop(),
  };
}

function pasToe(samengevoegd) {
  const veranderd = JSON.stringify(samengevoegd) !== JSON.stringify({ ...state });
  aanHetToepassen = true;
  Object.assign(state, samengevoegd);
  bewaar();
  aanHetToepassen = false;
  if (veranderd) window.dispatchEvent(new CustomEvent("olivia-grieks-cloud-updated"));
}

async function sync() {
  if (!token()) throw new Error("owner token required");
  badge("cloud sync...", "sync");
  const cloud = await rpc("olivia_grieks_read_state", { p_owner_token: token() });
  const samengevoegd = merge(cloud, state);
  if (JSON.stringify(samengevoegd) !== JSON.stringify(cloud)) {
    await rpc("olivia_grieks_write_state", { p_owner_token: token(), p_state: samengevoegd });
  }
  pasToe(samengevoegd);
  badge("cloud actief", "ok");
}

function planPush(vertraging = 800) {
  if (aanHetToepassen || !token()) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    sync().catch((error) => {
      if (error.message === "forbidden") {
        localStorage.removeItem(OWNER_TOKEN_STORE);
        badge("koppel toestel", "error");
      } else {
        badge("offline bewaard", "error");
      }
    });
  }, vertraging);
}

function sluitKoppelPaneel() {
  paneel?.remove();
  paneel = null;
}

function toonKoppelPaneel(melding = "Open de panini koppel-link op dit toestel, of plak de koppelcode.") {
  sluitKoppelPaneel();
  paneel = document.createElement("div");
  paneel.className = "koppelpaneel";
  paneel.innerHTML =
    '<div class="koppelkaart" role="dialog" aria-modal="true">' +
    '<button class="koppelsluit" aria-label="Sluit">×</button>' +
    "<h2>Koppel dit toestel</h2>" +
    '<p class="koppelmelding"></p>' +
    '<input class="koppelinput" autocomplete="off" placeholder="Plak de koppelcode hier">' +
    '<div class="koppelknoppen"><button class="knop koppelbewaar">Bewaar en sync</button>' +
    '<button class="knop knop-grijs koppelvergeet">Vergeet code</button></div></div>';
  document.body.append(paneel);
  paneel.querySelector(".koppelmelding").textContent = melding;
  const input = paneel.querySelector(".koppelinput");
  paneel.querySelector(".koppelsluit").addEventListener("click", sluitKoppelPaneel);
  paneel.addEventListener("click", (e) => { if (e.target === paneel) sluitKoppelPaneel(); });
  paneel.querySelector(".koppelvergeet").addEventListener("click", () => {
    localStorage.removeItem(OWNER_TOKEN_STORE);
    input.value = "";
    badge("koppel toestel", "error");
  });
  paneel.querySelector(".koppelbewaar").addEventListener("click", async () => {
    const code = input.value.trim();
    if (!code) { input.focus(); return; }
    localStorage.setItem(OWNER_TOKEN_STORE, code);
    paneel.querySelector(".koppelmelding").textContent = "Code controleren en synchroniseren...";
    try {
      await sync();
      sluitKoppelPaneel();
    } catch (error) {
      if (error.message === "forbidden") localStorage.removeItem(OWNER_TOKEN_STORE);
      paneel.querySelector(".koppelmelding").textContent = error.message === "forbidden"
        ? "Deze code klopt niet. Open de koppel-link opnieuw of plak de juiste koppelcode."
        : "Sync lukte niet. Controleer je internet en probeer opnieuw.";
    }
  });
  setTimeout(() => input.focus(), 0);
}

// Koppelen via de URL: ?koppel=<code> zet de code direct, ?familie=1 haalt ze
// op via hetzelfde beveiligde endpoint als panini.
async function koppelUitUrl() {
  const url = new URL(location.href);
  const code = url.searchParams.get("koppel")?.trim();
  const familie = url.searchParams.get("familie") === "1";
  if (!code && !familie) return "";
  url.searchParams.delete("koppel");
  url.searchParams.delete("familie");
  history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  if (code) {
    localStorage.setItem(OWNER_TOKEN_STORE, code);
    return code;
  }
  const response = await fetch("/api/panini-owner-token", { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("owner token required");
  const data = await response.json();
  const opgehaald = String(data?.ownerToken || "").trim();
  if (!opgehaald) throw new Error("owner token required");
  localStorage.setItem(OWNER_TOKEN_STORE, opgehaald);
  return opgehaald;
}

export function initCloud() {
  window.addEventListener("olivia-grieks-bewaard", () => planPush());
  window.addEventListener("online", () => planPush(0));
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") planPush(0);
  });

  (async () => {
    try {
      badge("cloud laden...", "sync");
      await koppelUitUrl();
      if (!token()) {
        badge("koppel toestel", "error");
        return;
      }
      await sync();
    } catch (error) {
      if (error.message === "forbidden") {
        localStorage.removeItem(OWNER_TOKEN_STORE);
        badge("koppel toestel", "error");
      } else {
        badge("offline bewaard", "error");
      }
    }
  })();
}
