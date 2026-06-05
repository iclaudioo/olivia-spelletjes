// Centrale kamer-kunst-registry. Elke kamer heeft een platte Toca-Boca-SVG
// (viewBox 800x600, class "kamer-svg", preserveAspectRatio="xMidYMid slice").
// De woonkamer woont in een eigen bestand; de andere drie staan hieronder.

import { woonkamerSVG } from "./room.js";

// ---- Keuken: aanrecht, fornuis/oven, koelkast, gootsteen, raam, pan + waterkoker ----
export const keukenSVG = `
<svg class="kamer-svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <!-- muur -->
  <rect x="0" y="0" width="800" height="600" fill="#fff3d6"/>
  <rect x="0" y="0" width="800" height="360" fill="#d8f0e6"/>
  <!-- tegelstrook achter het aanrecht -->
  <g opacity="0.5">
    <rect x="0" y="300" width="800" height="64" fill="#c4e8da"/>
    <g stroke="#ffffff" stroke-width="4">
      <line x1="0" y1="332" x2="800" y2="332"/>
      <line x1="80" y1="300" x2="80" y2="364"/>
      <line x1="160" y1="300" x2="160" y2="364"/>
      <line x1="240" y1="300" x2="240" y2="364"/>
      <line x1="320" y1="300" x2="320" y2="364"/>
      <line x1="400" y1="300" x2="400" y2="364"/>
      <line x1="480" y1="300" x2="480" y2="364"/>
      <line x1="560" y1="300" x2="560" y2="364"/>
      <line x1="640" y1="300" x2="640" y2="364"/>
      <line x1="720" y1="300" x2="720" y2="364"/>
    </g>
  </g>

  <!-- vloer -->
  <rect x="0" y="430" width="800" height="170" fill="#e8c79a"/>
  <g stroke="#d3aa70" stroke-width="4" opacity="0.6">
    <line x1="0" y1="490" x2="800" y2="490"/>
    <line x1="0" y1="550" x2="800" y2="550"/>
    <line x1="200" y1="430" x2="200" y2="600"/>
    <line x1="430" y1="430" x2="430" y2="600"/>
    <line x1="640" y1="430" x2="640" y2="600"/>
  </g>
  <rect x="0" y="422" width="800" height="14" fill="#c98a4f"/>

  <!-- raam -->
  <g>
    <rect x="560" y="70" width="190" height="160" rx="14" fill="url(#keukenLucht)"/>
    <circle cx="700" cy="120" r="22" fill="#fff3b0"/>
    <path d="M580 230 q40 -50 80 -24 q36 -44 90 0 v24 z" fill="#bff0d0"/>
    <rect x="560" y="70" width="190" height="160" rx="14" fill="none" stroke="#fff" stroke-width="10"/>
    <line x1="655" y1="70" x2="655" y2="230" stroke="#fff" stroke-width="10"/>
    <line x1="560" y1="150" x2="750" y2="150" stroke="#fff" stroke-width="10"/>
  </g>

  <!-- koelkast -->
  <g>
    <rect x="60" y="150" width="150" height="380" rx="22" fill="#7cc6e8"/>
    <rect x="60" y="150" width="150" height="380" rx="22" fill="none" stroke="#5aa9d0" stroke-width="6"/>
    <line x1="60" y1="320" x2="210" y2="320" stroke="#5aa9d0" stroke-width="6"/>
    <rect x="170" y="200" width="14" height="70" rx="7" fill="#eaf6fc"/>
    <rect x="170" y="350" width="14" height="90" rx="7" fill="#eaf6fc"/>
  </g>

  <!-- onderkast + aanrecht -->
  <g>
    <rect x="250" y="370" width="490" height="170" rx="14" fill="#ffb07a"/>
    <rect x="250" y="356" width="490" height="26" rx="10" fill="#f3f3f3"/>
    <g fill="#ff9a57" stroke="#e07f3e" stroke-width="4">
      <rect x="270" y="400" width="120" height="120" rx="10"/>
      <rect x="410" y="400" width="120" height="120" rx="10"/>
      <rect x="550" y="400" width="170" height="120" rx="10"/>
    </g>
    <g fill="#ffd24a">
      <rect x="318" y="412" width="24" height="10" rx="5"/>
      <rect x="458" y="412" width="24" height="10" rx="5"/>
      <rect x="618" y="412" width="24" height="10" rx="5"/>
    </g>
  </g>

  <!-- gootsteen -->
  <g>
    <rect x="280" y="360" width="120" height="30" rx="8" fill="#dfeef2"/>
    <rect x="296" y="364" width="88" height="20" rx="6" fill="#b9d6dd"/>
    <path d="M340 360 q0 -34 36 -34" fill="none" stroke="#9aa7ad" stroke-width="8" stroke-linecap="round"/>
  </g>

  <!-- fornuis met pan -->
  <g>
    <rect x="560" y="356" width="160" height="30" rx="8" fill="#e6e6e6"/>
    <circle cx="600" cy="371" r="11" fill="#bdbdbd"/>
    <circle cx="680" cy="371" r="11" fill="#bdbdbd"/>
    <!-- pan -->
    <ellipse cx="600" cy="356" rx="34" ry="11" fill="#5a5a5a"/>
    <rect x="566" y="346" width="68" height="12" rx="4" fill="#444"/>
    <rect x="630" y="348" width="46" height="8" rx="4" fill="#7a5230"/>
  </g>

  <!-- waterkoker op het aanrecht -->
  <g>
    <path d="M448 356 q-6 -44 28 -46 q34 2 28 46 z" fill="#ff8fb6"/>
    <rect x="452" y="320" width="44" height="10" rx="5" fill="#e76f9a"/>
    <path d="M500 332 q18 6 14 24" fill="none" stroke="#e76f9a" stroke-width="8" stroke-linecap="round"/>
  </g>

  <defs>
    <linearGradient id="keukenLucht" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#bdeaff"/>
      <stop offset="1" stop-color="#e9f8ff"/>
    </linearGradient>
  </defs>
</svg>
`;

// ---- Badkamer: bad, wc, wastafel, spiegel, betegelde muur + vloer ----
export const badkamerSVG = `
<svg class="kamer-svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <!-- betegelde muur -->
  <rect x="0" y="0" width="800" height="600" fill="#cdeefb"/>
  <rect x="0" y="0" width="800" height="400" fill="#bfe6f7"/>
  <g stroke="#a9d8ee" stroke-width="4" opacity="0.7">
    <line x1="0" y1="100" x2="800" y2="100"/>
    <line x1="0" y1="200" x2="800" y2="200"/>
    <line x1="0" y1="300" x2="800" y2="300"/>
    <line x1="120" y1="0" x2="120" y2="400"/>
    <line x1="280" y1="0" x2="280" y2="400"/>
    <line x1="440" y1="0" x2="440" y2="400"/>
    <line x1="600" y1="0" x2="600" y2="400"/>
    <line x1="720" y1="0" x2="720" y2="400"/>
  </g>

  <!-- betegelde vloer -->
  <rect x="0" y="400" width="800" height="200" fill="#9fd6ee"/>
  <g stroke="#7cc1de" stroke-width="4" opacity="0.7">
    <line x1="0" y1="470" x2="800" y2="470"/>
    <line x1="0" y1="540" x2="800" y2="540"/>
    <line x1="140" y1="400" x2="140" y2="600"/>
    <line x1="320" y1="400" x2="320" y2="600"/>
    <line x1="500" y1="400" x2="500" y2="600"/>
    <line x1="680" y1="400" x2="680" y2="600"/>
  </g>
  <rect x="0" y="392" width="800" height="14" fill="#7cc1de"/>

  <!-- bad -->
  <g>
    <rect x="60" y="330" width="360" height="160" rx="60" fill="#ffffff"/>
    <rect x="84" y="346" width="312" height="120" rx="46" fill="#d8f1ff"/>
    <!-- schuimbellen -->
    <g fill="#ffffff" opacity="0.95">
      <circle cx="150" cy="356" r="26"/>
      <circle cx="210" cy="346" r="30"/>
      <circle cx="280" cy="354" r="26"/>
      <circle cx="340" cy="350" r="22"/>
    </g>
    <!-- kraan -->
    <rect x="38" y="300" width="20" height="60" rx="8" fill="#c9d4d9"/>
    <path d="M48 300 q0 -26 40 -26 v18 q-22 0 -22 8 z" fill="#c9d4d9"/>
    <circle cx="48" cy="296" r="9" fill="#aeb9be"/>
  </g>

  <!-- wc -->
  <g>
    <rect x="520" y="430" width="120" height="120" rx="16" fill="#ffffff"/>
    <rect x="520" y="300" width="120" height="120" rx="14" fill="#ffffff"/>
    <rect x="520" y="300" width="120" height="120" rx="14" fill="none" stroke="#dfe7ea" stroke-width="6"/>
    <ellipse cx="580" cy="470" rx="58" ry="40" fill="#ffffff"/>
    <ellipse cx="580" cy="470" rx="40" ry="26" fill="#d8f1ff"/>
    <rect x="526" y="288" width="108" height="22" rx="10" fill="#eef4f6"/>
  </g>

  <!-- wastafel + spiegel -->
  <g>
    <!-- spiegel -->
    <rect x="660" y="80" width="110" height="150" rx="18" fill="#dff4fd"/>
    <rect x="660" y="80" width="110" height="150" rx="18" fill="none" stroke="#ffffff" stroke-width="10"/>
    <path d="M676 200 l30 -50 l24 26 l20 -22 v46 z" fill="#bfe6f7" opacity="0.7"/>
    <!-- wastafel -->
    <rect x="668" y="360" width="100" height="40" rx="10" fill="#ffffff"/>
    <ellipse cx="718" cy="372" rx="40" ry="14" fill="#d8f1ff"/>
    <rect x="700" y="400" width="36" height="90" fill="#eef4f6"/>
    <rect x="714" y="338" width="10" height="26" rx="5" fill="#c9d4d9"/>
  </g>

  <!-- rubber eendje op de rand van het bad -->
  <g>
    <ellipse cx="240" cy="318" rx="26" ry="20" fill="#ffd24a"/>
    <circle cx="262" cy="300" r="16" fill="#ffd24a"/>
    <path d="M276 300 l16 4 l-14 8 z" fill="#ff8a3d"/>
    <circle cx="266" cy="296" r="3" fill="#3a2b12"/>
  </g>
</svg>
`;

// ---- Slaapkamer: bed met kussen + deken, kledingkast, raam, vloerkleed, nachtlamp ----
export const slaapkamerSVG = `
<svg class="kamer-svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <!-- muur -->
  <rect x="0" y="0" width="800" height="600" fill="#efe2ff"/>
  <rect x="0" y="0" width="800" height="380" fill="#e2d0ff"/>
  <!-- sterren-behang -->
  <g fill="#cdb4f5" opacity="0.6">
    <circle cx="120" cy="90" r="6"/>
    <circle cx="260" cy="140" r="5"/>
    <circle cx="400" cy="80" r="6"/>
    <circle cx="520" cy="150" r="5"/>
    <circle cx="180" cy="220" r="5"/>
    <circle cx="340" cy="250" r="6"/>
  </g>

  <!-- vloer -->
  <rect x="0" y="380" width="800" height="220" fill="#e3b07a"/>
  <g stroke="#d49a5e" stroke-width="4" opacity="0.6">
    <line x1="0" y1="450" x2="800" y2="450"/>
    <line x1="0" y1="520" x2="800" y2="520"/>
    <line x1="180" y1="380" x2="180" y2="600"/>
    <line x1="420" y1="380" x2="420" y2="600"/>
    <line x1="640" y1="380" x2="640" y2="600"/>
  </g>
  <rect x="0" y="372" width="800" height="14" fill="#c98a4f"/>

  <!-- raam -->
  <g>
    <rect x="520" y="80" width="200" height="170" rx="14" fill="url(#slaapLucht)"/>
    <circle cx="585" cy="130" r="30" fill="#fff3b0" opacity="0.9"/>
    <circle cx="665" cy="120" r="16" fill="#fffbe0"/>
    <path d="M540 250 q40 -54 84 -26 q40 -46 96 0 v26 z" fill="#bff0d0"/>
    <rect x="520" y="80" width="200" height="170" rx="14" fill="none" stroke="#fff" stroke-width="10"/>
    <line x1="620" y1="80" x2="620" y2="250" stroke="#fff" stroke-width="10"/>
    <line x1="520" y1="165" x2="720" y2="165" stroke="#fff" stroke-width="10"/>
  </g>

  <!-- vloerkleed -->
  <ellipse cx="400" cy="520" rx="240" ry="58" fill="#ffd24a" opacity="0.9"/>
  <ellipse cx="400" cy="520" rx="240" ry="58" fill="none" stroke="#ffe488" stroke-width="12" stroke-dasharray="2 24"/>
  <ellipse cx="400" cy="520" rx="150" ry="36" fill="#ffdd6b"/>

  <!-- kledingkast -->
  <g>
    <rect x="40" y="170" width="170" height="350" rx="16" fill="#b98c63"/>
    <rect x="40" y="170" width="170" height="350" rx="16" fill="none" stroke="#9c7349" stroke-width="6"/>
    <line x1="125" y1="180" x2="125" y2="510" stroke="#9c7349" stroke-width="6"/>
    <circle cx="112" cy="345" r="8" fill="#ffd24a"/>
    <circle cx="138" cy="345" r="8" fill="#ffd24a"/>
  </g>

  <!-- bed -->
  <g>
    <!-- hoofdbord -->
    <rect x="250" y="270" width="34" height="150" rx="12" fill="#9bb7e8"/>
    <!-- matras -->
    <rect x="270" y="350" width="320" height="80" rx="18" fill="#ffffff"/>
    <!-- deken -->
    <path d="M360 350 h230 v80 h-230 q-14 -40 0 -80 z" fill="#7bb0e8"/>
    <path d="M360 350 h230 v18 h-230 z" fill="#a9d3ff"/>
    <!-- kussen -->
    <rect x="286" y="338" width="86" height="48" rx="16" fill="#ffd9e6"/>
    <!-- pootjes -->
    <rect x="276" y="424" width="18" height="30" rx="6" fill="#7a5230"/>
    <rect x="566" y="424" width="18" height="30" rx="6" fill="#7a5230"/>
  </g>

  <!-- nachtkastje + lamp -->
  <g>
    <rect x="610" y="380" width="90" height="120" rx="10" fill="#b98c63"/>
    <rect x="620" y="404" width="70" height="34" rx="6" fill="#a87b53"/>
    <circle cx="655" cy="421" r="6" fill="#ffd24a"/>
    <!-- lamp -->
    <rect x="648" y="330" width="14" height="50" rx="6" fill="#9a7b56"/>
    <path d="M626 330 l58 0 l-16 -44 l-26 0 z" fill="#ffd24a"/>
    <ellipse cx="655" cy="380" rx="26" ry="8" fill="#9a7b56"/>
  </g>

  <defs>
    <linearGradient id="slaapLucht" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#9ec9ff"/>
      <stop offset="1" stop-color="#dcecff"/>
    </linearGradient>
  </defs>
</svg>
`;

// ============================================================================
// STRANDHUIS — drie kamers met een zonnig strand-thema (zandkleuren, zee,
// licht hout, zee-uitzicht-ramen). Zelfde conventies als hierboven.
// ============================================================================

// ---- Strand-woonkamer: rieten bank, zee-raam, surfplank, palmplant ----
export const strandwoonkamerSVG = `
<svg class="kamer-svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <!-- muur (licht zand) -->
  <rect x="0" y="0" width="800" height="600" fill="#fff6e3"/>
  <rect x="0" y="0" width="800" height="380" fill="#fbe9c6"/>
  <!-- houten lambrisering onderaan de muur -->
  <g opacity="0.5">
    <rect x="0" y="320" width="800" height="60" fill="#f0d8a8"/>
    <g stroke="#e2c285" stroke-width="4">
      <line x1="100" y1="320" x2="100" y2="380"/>
      <line x1="240" y1="320" x2="240" y2="380"/>
      <line x1="380" y1="320" x2="380" y2="380"/>
      <line x1="660" y1="320" x2="660" y2="380"/>
    </g>
  </g>

  <!-- houten vloer (licht hout) -->
  <rect x="0" y="380" width="800" height="220" fill="#e9cfa0"/>
  <g stroke="#d8b87f" stroke-width="4" opacity="0.6">
    <line x1="0" y1="450" x2="800" y2="450"/>
    <line x1="0" y1="520" x2="800" y2="520"/>
    <line x1="170" y1="380" x2="170" y2="600"/>
    <line x1="420" y1="380" x2="420" y2="600"/>
    <line x1="650" y1="380" x2="650" y2="600"/>
  </g>
  <rect x="0" y="372" width="800" height="14" fill="#cda767"/>

  <!-- groot zee-uitzicht-raam -->
  <g>
    <rect x="470" y="60" width="280" height="210" rx="16" fill="url(#strandwZee)"/>
    <!-- zon -->
    <circle cx="700" cy="115" r="26" fill="#ffe27a"/>
    <!-- zee + golfjes -->
    <rect x="470" y="190" width="280" height="80" fill="url(#strandwWater)"/>
    <g stroke="#ffffff" stroke-width="5" opacity="0.7" fill="none" stroke-linecap="round">
      <path d="M490 210 q18 -10 36 0 q18 10 36 0"/>
      <path d="M580 232 q18 -10 36 0 q18 10 36 0"/>
      <path d="M500 252 q18 -10 36 0 q18 10 36 0"/>
    </g>
    <!-- zeilbootje -->
    <path d="M548 188 l0 -40 l34 40 z" fill="#ffffff"/>
    <rect x="540" y="186" width="34" height="8" rx="4" fill="#e07f3e"/>
    <rect x="470" y="60" width="280" height="210" rx="16" fill="none" stroke="#fff" stroke-width="10"/>
    <line x1="610" y1="60" x2="610" y2="270" stroke="#fff" stroke-width="10"/>
  </g>

  <!-- rieten bank -->
  <g>
    <rect x="120" y="320" width="320" height="120" rx="26" fill="#e7c489"/>
    <rect x="120" y="320" width="320" height="120" rx="26" fill="none" stroke="#cda35f" stroke-width="6"/>
    <!-- rieten vlechtpatroon -->
    <g stroke="#cda35f" stroke-width="3" opacity="0.6">
      <line x1="150" y1="335" x2="150" y2="425"/>
      <line x1="190" y1="335" x2="190" y2="425"/>
      <line x1="230" y1="335" x2="230" y2="425"/>
      <line x1="270" y1="335" x2="270" y2="425"/>
      <line x1="310" y1="335" x2="310" y2="425"/>
      <line x1="350" y1="335" x2="350" y2="425"/>
      <line x1="390" y1="335" x2="390" y2="425"/>
    </g>
    <!-- zitkussens -->
    <rect x="140" y="386" width="130" height="54" rx="16" fill="#7fd3d0"/>
    <rect x="290" y="386" width="130" height="54" rx="16" fill="#ffb3c7"/>
    <!-- rugkussen -->
    <rect x="150" y="330" width="110" height="58" rx="14" fill="#ffd98a"/>
    <!-- pootjes -->
    <rect x="140" y="438" width="16" height="24" rx="6" fill="#b78a4e"/>
    <rect x="404" y="438" width="16" height="24" rx="6" fill="#b78a4e"/>
  </g>

  <!-- surfplank tegen de muur -->
  <g>
    <ellipse cx="80" cy="300" rx="34" ry="130" fill="#ff8fb6"/>
    <ellipse cx="80" cy="300" rx="34" ry="130" fill="none" stroke="#e76f9a" stroke-width="6"/>
    <line x1="80" y1="180" x2="80" y2="420" stroke="#fff7" stroke-width="6"/>
  </g>

  <!-- palmplant in pot -->
  <g>
    <path d="M700 470 l-40 8 q-30 6 -34 -22" fill="none" stroke="#5fbf73" stroke-width="14" stroke-linecap="round"/>
    <path d="M700 470 q-6 -46 -40 -64" fill="none" stroke="#5fbf73" stroke-width="14" stroke-linecap="round"/>
    <path d="M700 470 q26 -40 64 -40" fill="none" stroke="#7bd88f" stroke-width="14" stroke-linecap="round"/>
    <path d="M700 470 q44 -18 56 -52" fill="none" stroke="#5fbf73" stroke-width="14" stroke-linecap="round"/>
    <path d="M674 470 h52 l-10 70 h-32 z" fill="#e07f3e"/>
    <rect x="668" y="464" width="64" height="16" rx="8" fill="#f0934f"/>
  </g>

  <defs>
    <linearGradient id="strandwZee" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#bdeaff"/>
      <stop offset="1" stop-color="#e9f8ff"/>
    </linearGradient>
    <linearGradient id="strandwWater" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#4fc3e8"/>
      <stop offset="1" stop-color="#2aa7d6"/>
    </linearGradient>
  </defs>
</svg>
`;

// ---- Strand-keuken: licht aanrecht, fruitschaal, zee-raam, schelpdecoratie ----
export const strandkeukenSVG = `
<svg class="kamer-svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <!-- muur -->
  <rect x="0" y="0" width="800" height="600" fill="#fff6e3"/>
  <rect x="0" y="0" width="800" height="360" fill="#d9f2ee"/>
  <!-- zee-blauwe tegelstrook achter het aanrecht -->
  <g opacity="0.55">
    <rect x="0" y="300" width="800" height="64" fill="#bfe8e2"/>
    <g stroke="#ffffff" stroke-width="4">
      <line x1="0" y1="332" x2="800" y2="332"/>
      <line x1="80" y1="300" x2="80" y2="364"/>
      <line x1="160" y1="300" x2="160" y2="364"/>
      <line x1="240" y1="300" x2="240" y2="364"/>
      <line x1="320" y1="300" x2="320" y2="364"/>
      <line x1="400" y1="300" x2="400" y2="364"/>
      <line x1="480" y1="300" x2="480" y2="364"/>
      <line x1="560" y1="300" x2="560" y2="364"/>
      <line x1="640" y1="300" x2="640" y2="364"/>
      <line x1="720" y1="300" x2="720" y2="364"/>
    </g>
  </g>

  <!-- vloer (licht zand) -->
  <rect x="0" y="430" width="800" height="170" fill="#ecd6aa"/>
  <g stroke="#d8b87f" stroke-width="4" opacity="0.6">
    <line x1="0" y1="490" x2="800" y2="490"/>
    <line x1="0" y1="550" x2="800" y2="550"/>
    <line x1="200" y1="430" x2="200" y2="600"/>
    <line x1="430" y1="430" x2="430" y2="600"/>
    <line x1="640" y1="430" x2="640" y2="600"/>
  </g>
  <rect x="0" y="422" width="800" height="14" fill="#cda767"/>

  <!-- zee-raam -->
  <g>
    <rect x="540" y="70" width="210" height="170" rx="14" fill="url(#strandkZee)"/>
    <circle cx="700" cy="120" r="22" fill="#ffe27a"/>
    <rect x="540" y="178" width="210" height="62" fill="url(#strandkWater)"/>
    <g stroke="#ffffff" stroke-width="5" opacity="0.7" fill="none" stroke-linecap="round">
      <path d="M558 198 q16 -8 32 0 q16 8 32 0"/>
      <path d="M640 216 q16 -8 32 0 q16 8 32 0"/>
    </g>
    <rect x="540" y="70" width="210" height="170" rx="14" fill="none" stroke="#fff" stroke-width="10"/>
    <line x1="645" y1="70" x2="645" y2="240" stroke="#fff" stroke-width="10"/>
  </g>

  <!-- onderkast + licht houten aanrecht -->
  <g>
    <rect x="60" y="370" width="680" height="170" rx="14" fill="#e7c489"/>
    <rect x="60" y="356" width="680" height="26" rx="10" fill="#f6efe0"/>
    <g fill="#d9b06f" stroke="#c39a55" stroke-width="4">
      <rect x="84" y="400" width="130" height="120" rx="10"/>
      <rect x="234" y="400" width="130" height="120" rx="10"/>
      <rect x="540" y="400" width="180" height="120" rx="10"/>
    </g>
    <g fill="#7fd3d0">
      <rect x="138" y="412" width="24" height="10" rx="5"/>
      <rect x="288" y="412" width="24" height="10" rx="5"/>
      <rect x="618" y="412" width="24" height="10" rx="5"/>
    </g>
  </g>

  <!-- fruitschaal op het aanrecht -->
  <g>
    <path d="M360 356 q60 40 120 0 z" fill="#ffd98a"/>
    <ellipse cx="420" cy="356" rx="60" ry="10" fill="#ffe9bd"/>
    <!-- sinaasappel -->
    <circle cx="392" cy="344" r="18" fill="#ff9a3d"/>
    <!-- appel -->
    <circle cx="430" cy="340" r="20" fill="#ff7a7a"/>
    <!-- banaan -->
    <path d="M440 330 q34 -8 50 16" fill="none" stroke="#ffd24a" stroke-width="14" stroke-linecap="round"/>
    <!-- ananas-blaadje accent -->
    <path d="M392 326 l4 -16 l4 16 z" fill="#5fbf73"/>
  </g>

  <!-- gootsteen in het aanrecht -->
  <g>
    <rect x="300" y="360" width="120" height="26" rx="8" fill="#dff1ef"/>
    <rect x="316" y="364" width="88" height="16" rx="6" fill="#bfe0db"/>
    <path d="M360 360 q0 -30 34 -30" fill="none" stroke="#9ab3b0" stroke-width="8" stroke-linecap="round"/>
  </g>

  <!-- schelp-decoratie op de muur -->
  <g transform="translate(150 150)">
    <path d="M0 0 q-30 -34 0 -60 q30 26 0 60 z" fill="#ffd6c2"/>
    <g stroke="#f0a98a" stroke-width="3" fill="none">
      <line x1="0" y1="-2" x2="0" y2="-52"/>
      <line x1="0" y1="-2" x2="-14" y2="-44"/>
      <line x1="0" y1="-2" x2="14" y2="-44"/>
    </g>
  </g>

  <defs>
    <linearGradient id="strandkZee" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#bdeaff"/>
      <stop offset="1" stop-color="#e9f8ff"/>
    </linearGradient>
    <linearGradient id="strandkWater" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#4fc3e8"/>
      <stop offset="1" stop-color="#2aa7d6"/>
    </linearGradient>
  </defs>
</svg>
`;

// ---- Strand-slaapkamer: bed, schelpen, zee-raam, licht hout ----
export const strandslaapkamerSVG = `
<svg class="kamer-svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <!-- muur (zacht zeegroen-zand) -->
  <rect x="0" y="0" width="800" height="600" fill="#fff6e3"/>
  <rect x="0" y="0" width="800" height="380" fill="#e3f3ec"/>
  <!-- zacht golf-behang -->
  <g stroke="#c4e6da" stroke-width="4" opacity="0.6" fill="none" stroke-linecap="round">
    <path d="M60 120 q20 -14 40 0 q20 14 40 0"/>
    <path d="M280 90 q20 -14 40 0 q20 14 40 0"/>
    <path d="M120 230 q20 -14 40 0 q20 14 40 0"/>
  </g>

  <!-- houten vloer (licht hout) -->
  <rect x="0" y="380" width="800" height="220" fill="#e9cfa0"/>
  <g stroke="#d8b87f" stroke-width="4" opacity="0.6">
    <line x1="0" y1="450" x2="800" y2="450"/>
    <line x1="0" y1="520" x2="800" y2="520"/>
    <line x1="180" y1="380" x2="180" y2="600"/>
    <line x1="420" y1="380" x2="420" y2="600"/>
    <line x1="640" y1="380" x2="640" y2="600"/>
  </g>
  <rect x="0" y="372" width="800" height="14" fill="#cda767"/>

  <!-- zee-raam -->
  <g>
    <rect x="500" y="80" width="220" height="180" rx="14" fill="url(#strandsZee)"/>
    <circle cx="560" cy="130" r="28" fill="#ffe27a"/>
    <rect x="500" y="196" width="220" height="64" fill="url(#strandsWater)"/>
    <g stroke="#ffffff" stroke-width="5" opacity="0.7" fill="none" stroke-linecap="round">
      <path d="M520 216 q18 -10 36 0 q18 10 36 0"/>
      <path d="M610 236 q18 -10 36 0 q18 10 36 0"/>
    </g>
    <rect x="500" y="80" width="220" height="180" rx="14" fill="none" stroke="#fff" stroke-width="10"/>
    <line x1="610" y1="80" x2="610" y2="260" stroke="#fff" stroke-width="10"/>
    <line x1="500" y1="170" x2="720" y2="170" stroke="#fff" stroke-width="10"/>
  </g>

  <!-- vloerkleed (zacht zandkleur met streep) -->
  <ellipse cx="400" cy="520" rx="240" ry="58" fill="#ffe9bd" opacity="0.95"/>
  <ellipse cx="400" cy="520" rx="240" ry="58" fill="none" stroke="#7fd3d0" stroke-width="12" stroke-dasharray="2 24"/>
  <ellipse cx="400" cy="520" rx="150" ry="36" fill="#ffdca0"/>

  <!-- bed met licht houten frame -->
  <g>
    <!-- hoofdbord (riet) -->
    <rect x="250" y="270" width="34" height="150" rx="12" fill="#e7c489"/>
    <g stroke="#cda35f" stroke-width="3" opacity="0.6">
      <line x1="258" y1="280" x2="258" y2="410"/>
      <line x1="276" y1="280" x2="276" y2="410"/>
    </g>
    <!-- matras -->
    <rect x="270" y="350" width="320" height="80" rx="18" fill="#ffffff"/>
    <!-- deken (zeeblauw) -->
    <path d="M360 350 h230 v80 h-230 q-14 -40 0 -80 z" fill="#4fc3e8"/>
    <path d="M360 350 h230 v18 h-230 z" fill="#9be2f5"/>
    <!-- kussen -->
    <rect x="286" y="338" width="86" height="48" rx="16" fill="#ffd6c2"/>
    <!-- pootjes -->
    <rect x="276" y="424" width="18" height="30" rx="6" fill="#b78a4e"/>
    <rect x="566" y="424" width="18" height="30" rx="6" fill="#b78a4e"/>
  </g>

  <!-- nachtkastje met schelp -->
  <g>
    <rect x="610" y="380" width="90" height="120" rx="10" fill="#e7c489"/>
    <rect x="620" y="404" width="70" height="34" rx="6" fill="#d9b06f"/>
    <circle cx="655" cy="421" r="6" fill="#7fd3d0"/>
    <!-- schelp op het kastje -->
    <path d="M655 372 q-22 -24 0 -42 q22 18 0 42 z" fill="#ffd6c2"/>
    <g stroke="#f0a98a" stroke-width="2" fill="none">
      <line x1="655" y1="370" x2="655" y2="334"/>
      <line x1="655" y1="370" x2="643" y2="338"/>
      <line x1="655" y1="370" x2="667" y2="338"/>
    </g>
  </g>

  <!-- zeester op de vloer -->
  <g transform="translate(150 480)">
    <path d="M0 -24 L7 -6 L26 -6 L11 6 L17 24 L0 13 L-17 24 L-11 6 L-26 -6 L-7 -6 Z" fill="#ffb347"/>
    <circle cx="0" cy="0" r="3" fill="#e09b00"/>
  </g>

  <defs>
    <linearGradient id="strandsZee" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#bdeaff"/>
      <stop offset="1" stop-color="#e9f8ff"/>
    </linearGradient>
    <linearGradient id="strandsWater" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#4fc3e8"/>
      <stop offset="1" stop-color="#2aa7d6"/>
    </linearGradient>
  </defs>
</svg>
`;

// Registry: koppelt een kamer-art-sleutel aan de bijbehorende SVG.
export const KAMER_ART = {
  woonkamer: woonkamerSVG,
  keuken: keukenSVG,
  badkamer: badkamerSVG,
  slaapkamer: slaapkamerSVG,
  strandwoonkamer: strandwoonkamerSVG,
  strandkeuken: strandkeukenSVG,
  strandslaapkamer: strandslaapkamerSVG,
};

// Haalt de SVG op bij een art-sleutel; valt veilig terug op de woonkamer.
export function kamerArt(sleutel) {
  return KAMER_ART[sleutel] || woonkamerSVG;
}

// Een passende emoji per kamer-art-sleutel (zelfde sleutels als KAMER_ART).
export const KAMER_EMOJI = {
  woonkamer: "🛋️",
  keuken: "🍳",
  badkamer: "🛁",
  slaapkamer: "🛏️",
  strandwoonkamer: "🏖️",
  strandkeuken: "🍍",
  strandslaapkamer: "🐚",
};

// Haalt de emoji op bij een art-sleutel; valt veilig terug op een huisje.
export function kamerEmoji(sleutel) {
  return KAMER_EMOJI[sleutel] || "🏠";
}
