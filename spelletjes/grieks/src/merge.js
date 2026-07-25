// Grow-only samenvoegen van twee Grieks-voortgangen: van elk veld blijft de
// hoogste stand staan, dus samenvoegen kan nooit voortgang wissen.
// De uitkomst is canoniek (vaste veldvolgorde, gesorteerde sleutels, genormaliseerde
// types), zodat twee gelijke standen ook als string identiek zijn en cloud-data
// nooit met vreemde types in de app belandt. `kanoniek(s)` is daarom `merge(s, s)`.

function maxGetal(a, b) {
  return Math.max(Number(a) || 0, Number(b) || 0);
}

// Unie van "verdiend"-vlaggen: alleen sleutels met een waarheidswaarde, altijd true.
function unieWaar(a, b) {
  const sleutels = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
  const uit = {};
  for (const k of [...sleutels].sort()) {
    if (a?.[k] || b?.[k]) uit[k] = true;
  }
  return uit;
}

export function merge(cloud, lokaal) {
  const c = cloud && typeof cloud === "object" ? cloud : {};
  const l = lokaal && typeof lokaal === "object" ? lokaal : {};
  const groepGoed = {};
  for (const groep of [...new Set([...Object.keys(c.groepGoed || {}), ...Object.keys(l.groepGoed || {})])].sort()) {
    groepGoed[groep] = maxGetal(c.groepGoed?.[groep], l.groepGoed?.[groep]);
  }
  return {
    sterren: maxGetal(c.sterren, l.sterren),
    geschreven: unieWaar(c.geschreven, l.geschreven),
    groepGoed,
    memoryKlaar: unieWaar(c.memoryKlaar, l.memoryKlaar),
    oefenrondes: maxGetal(c.oefenrondes, l.oefenrondes),
    oefenrondeLaatst: [String(c.oefenrondeLaatst || ""), String(l.oefenrondeLaatst || "")].sort().pop(),
  };
}

export function kanoniek(s) {
  return merge(s, s);
}
