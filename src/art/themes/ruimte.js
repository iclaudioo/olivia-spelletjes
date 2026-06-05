// RUIMTERAKET — drie kamers met een ruimteschip-thema (metalen wanden,
// bedieningspanelen, schermen, patrijspoorten met sterren + planeet, een
// futuristisch bed). Platte Toca-Boca-SVG's (viewBox 800x600, class "kamer-svg",
// preserveAspectRatio="xMidYMid slice"). Gradient-ids zijn per-SVG geprefixt
// zodat ze nergens botsen (stuur*, rkeuken*, rslaap*).

// ---- Stuurkamer: groot uitkijkraam met planeet, bedieningspaneel, stoel ----
export const stuurkamerSVG = `
<svg class="kamer-svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <!-- metalen wand -->
  <rect x="0" y="0" width="800" height="600" fill="url(#stuurWand)"/>
  <!-- panelen-naden -->
  <g stroke="#3a4a66" stroke-width="3" opacity="0.6">
    <line x1="0" y1="120" x2="800" y2="120"/>
    <line x1="200" y1="0" x2="200" y2="120"/>
    <line x1="600" y1="0" x2="600" y2="120"/>
    <line x1="0" y1="370" x2="800" y2="370"/>
  </g>
  <!-- klinknagels -->
  <g fill="#6a7a96">
    <circle cx="40" cy="40" r="5"/>
    <circle cx="760" cy="40" r="5"/>
    <circle cx="40" cy="340" r="5"/>
    <circle cx="760" cy="340" r="5"/>
  </g>

  <!-- groot panoramisch venster met ruimte-uitzicht -->
  <g>
    <path d="M180 60 q220 -50 440 0 v200 h-440 z" fill="url(#stuurRuimte)"/>
    <!-- sterren -->
    <g fill="#ffffff">
      <circle cx="250" cy="110" r="3"/>
      <circle cx="330" cy="90" r="2"/>
      <circle cx="420" cy="120" r="3"/>
      <circle cx="500" cy="95" r="2"/>
      <circle cx="560" cy="140" r="3"/>
      <circle cx="300" cy="170" r="2"/>
      <circle cx="470" cy="180" r="2"/>
      <circle cx="380" cy="150" r="2"/>
    </g>
    <!-- planeet -->
    <circle cx="520" cy="180" r="46" fill="#ff9a57"/>
    <ellipse cx="520" cy="180" rx="70" ry="16" fill="none" stroke="#ffd24a" stroke-width="6" opacity="0.8"/>
    <circle cx="505" cy="168" r="10" fill="#e07f3e" opacity="0.7"/>
    <!-- kleine maan -->
    <circle cx="300" cy="120" r="16" fill="#cdd6e8"/>
    <!-- raamkozijn -->
    <path d="M180 60 q220 -50 440 0 v200 h-440 z" fill="none" stroke="#5a6a86" stroke-width="12"/>
    <line x1="400" y1="44" x2="400" y2="260" stroke="#5a6a86" stroke-width="8"/>
  </g>

  <!-- vloer (metalen rooster) -->
  <rect x="0" y="430" width="800" height="170" fill="#2e3a52"/>
  <g stroke="#465674" stroke-width="3" opacity="0.7">
    <line x1="0" y1="480" x2="800" y2="480"/>
    <line x1="0" y1="540" x2="800" y2="540"/>
    <line x1="120" y1="430" x2="120" y2="600"/>
    <line x1="280" y1="430" x2="280" y2="600"/>
    <line x1="440" y1="430" x2="440" y2="600"/>
    <line x1="600" y1="430" x2="600" y2="600"/>
    <line x1="720" y1="430" x2="720" y2="600"/>
  </g>

  <!-- bedieningspaneel onder het raam -->
  <g>
    <rect x="150" y="300" width="500" height="90" rx="14" fill="#3a4866"/>
    <rect x="150" y="300" width="500" height="90" rx="14" fill="none" stroke="#566a8e" stroke-width="4"/>
    <!-- knoppen-rijen -->
    <g>
      <circle cx="200" cy="330" r="12" fill="#ff5a5a"/>
      <circle cx="240" cy="330" r="12" fill="#ffd24a"/>
      <circle cx="280" cy="330" r="12" fill="#5fe07a"/>
      <circle cx="320" cy="330" r="12" fill="#5ab4ff"/>
    </g>
    <!-- schuifregelaars -->
    <g>
      <rect x="200" y="356" width="120" height="8" rx="4" fill="#1f2738"/>
      <rect x="250" y="352" width="14" height="16" rx="4" fill="#9fb6e0"/>
      <rect x="360" y="356" width="120" height="8" rx="4" fill="#1f2738"/>
      <rect x="420" y="352" width="14" height="16" rx="4" fill="#9fb6e0"/>
    </g>
    <!-- klein scherm met grafiek -->
    <rect x="510" y="316" width="120" height="58" rx="8" fill="#0e1626"/>
    <polyline points="520,360 545,340 570,350 595,326 620,344" fill="none" stroke="#5fe07a" stroke-width="4"/>
  </g>

  <!-- piloten-stoel -->
  <g>
    <rect x="360" y="400" width="80" height="90" rx="16" fill="#566a8e"/>
    <rect x="372" y="380" width="56" height="60" rx="14" fill="#6a80a8"/>
    <rect x="388" y="490" width="24" height="40" rx="6" fill="#3a4866"/>
    <ellipse cx="400" cy="540" rx="44" ry="14" fill="#2e3a52"/>
  </g>

  <!-- stuur/joystick -->
  <g>
    <rect x="300" y="470" width="14" height="50" rx="6" fill="#465674"/>
    <circle cx="307" cy="466" r="14" fill="#ff5a5a"/>
  </g>

  <defs>
    <linearGradient id="stuurWand" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#54627e"/>
      <stop offset="1" stop-color="#43506a"/>
    </linearGradient>
    <linearGradient id="stuurRuimte" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0b1430"/>
      <stop offset="1" stop-color="#23204a"/>
    </linearGradient>
  </defs>
</svg>
`;

// ---- Ruimte-keuken: voedseldispenser, magnetron-luikjes, drijvend eten, scherm ----
export const ruimtekeukenSVG = `
<svg class="kamer-svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <!-- metalen wand -->
  <rect x="0" y="0" width="800" height="600" fill="url(#rkeukenWand)"/>
  <g stroke="#3a4a66" stroke-width="3" opacity="0.6">
    <line x1="0" y1="110" x2="800" y2="110"/>
    <line x1="0" y1="300" x2="800" y2="300"/>
    <line x1="250" y1="0" x2="250" y2="110"/>
    <line x1="550" y1="0" x2="550" y2="110"/>
  </g>
  <g fill="#6a7a96">
    <circle cx="40" cy="40" r="5"/>
    <circle cx="760" cy="40" r="5"/>
  </g>

  <!-- ronde patrijspoort met sterren -->
  <g>
    <circle cx="120" cy="150" r="70" fill="url(#rkeukenRuimte)"/>
    <g fill="#ffffff">
      <circle cx="100" cy="130" r="3"/>
      <circle cx="140" cy="120" r="2"/>
      <circle cx="150" cy="170" r="3"/>
      <circle cx="95" cy="180" r="2"/>
    </g>
    <circle cx="135" cy="165" r="14" fill="#5fe07a"/>
    <circle cx="120" cy="150" r="70" fill="none" stroke="#5a6a86" stroke-width="12"/>
    <g fill="#6a7a96">
      <circle cx="120" cy="84" r="5"/>
      <circle cx="120" cy="216" r="5"/>
      <circle cx="54" cy="150" r="5"/>
      <circle cx="186" cy="150" r="5"/>
    </g>
  </g>

  <!-- vloer (metalen rooster) -->
  <rect x="0" y="430" width="800" height="170" fill="#2e3a52"/>
  <g stroke="#465674" stroke-width="3" opacity="0.7">
    <line x1="0" y1="480" x2="800" y2="480"/>
    <line x1="0" y1="540" x2="800" y2="540"/>
    <line x1="160" y1="430" x2="160" y2="600"/>
    <line x1="380" y1="430" x2="380" y2="600"/>
    <line x1="600" y1="430" x2="600" y2="600"/>
  </g>

  <!-- voedseldispenser-wand met luikjes -->
  <g>
    <rect x="300" y="200" width="440" height="190" rx="14" fill="#3a4866"/>
    <!-- magnetron/dispenser-luikjes -->
    <g fill="#566a8e" stroke="#26324a" stroke-width="4">
      <rect x="320" y="220" width="120" height="80" rx="10"/>
      <rect x="460" y="220" width="120" height="80" rx="10"/>
      <rect x="600" y="220" width="120" height="80" rx="10"/>
    </g>
    <!-- luikjes-ramen -->
    <g fill="#0e1626">
      <rect x="334" y="234" width="92" height="52" rx="6"/>
      <rect x="474" y="234" width="92" height="52" rx="6"/>
      <rect x="614" y="234" width="92" height="52" rx="6"/>
    </g>
    <!-- gloeiend eten in luikjes -->
    <circle cx="380" cy="260" r="16" fill="#ff9a3d"/>
    <circle cx="520" cy="260" r="16" fill="#5fe07a"/>
    <circle cx="660" cy="260" r="16" fill="#5ab4ff"/>
    <!-- bedieningsknopjes -->
    <g>
      <circle cx="340" cy="330" r="9" fill="#ff5a5a"/>
      <circle cx="370" cy="330" r="9" fill="#ffd24a"/>
      <circle cx="500" cy="330" r="9" fill="#5fe07a"/>
      <circle cx="640" cy="330" r="9" fill="#5ab4ff"/>
    </g>
    <!-- info-scherm -->
    <rect x="430" y="320" width="120" height="56" rx="8" fill="#0e1626"/>
    <polyline points="440,360 465,344 490,352 515,330 540,346" fill="none" stroke="#5fe07a" stroke-width="4"/>
  </g>

  <!-- werkblad / aanrecht -->
  <g>
    <rect x="280" y="390" width="480" height="26" rx="8" fill="#7c8aa6"/>
    <rect x="300" y="416" width="440" height="40" rx="8" fill="#465674"/>
  </g>

  <!-- drijvend eten (zwaartekrachtloos) -->
  <g>
    <!-- drijvende appel -->
    <circle cx="220" cy="360" r="18" fill="#ff7a7a"/>
    <path d="M220 342 q4 -10 -2 -14" fill="none" stroke="#5fbf73" stroke-width="4"/>
    <!-- drijvende waterbel -->
    <circle cx="180" cy="320" r="14" fill="#5ab4ff" opacity="0.7"/>
    <circle cx="176" cy="316" r="4" fill="#ffffff" opacity="0.8"/>
    <!-- drijvende kers -->
    <circle cx="250" cy="300" r="10" fill="#ff5a5a"/>
  </g>

  <defs>
    <linearGradient id="rkeukenWand" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#54627e"/>
      <stop offset="1" stop-color="#43506a"/>
    </linearGradient>
    <linearGradient id="rkeukenRuimte" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0b1430"/>
      <stop offset="1" stop-color="#23204a"/>
    </linearGradient>
  </defs>
</svg>
`;

// ---- Ruimte-slaapkamer: slaapcapsule-bed, patrijspoort met planeet, lockers ----
export const ruimteslaapkamerSVG = `
<svg class="kamer-svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <!-- metalen wand -->
  <rect x="0" y="0" width="800" height="600" fill="url(#rslaapWand)"/>
  <g stroke="#3a4a66" stroke-width="3" opacity="0.6">
    <line x1="0" y1="130" x2="800" y2="130"/>
    <line x1="0" y1="300" x2="800" y2="300"/>
    <line x1="300" y1="0" x2="300" y2="130"/>
    <line x1="600" y1="0" x2="600" y2="130"/>
  </g>
  <g fill="#6a7a96">
    <circle cx="40" cy="40" r="5"/>
    <circle cx="760" cy="40" r="5"/>
  </g>

  <!-- grote patrijspoort met planeet + sterren -->
  <g>
    <circle cx="610" cy="180" r="100" fill="url(#rslaapRuimte)"/>
    <g fill="#ffffff">
      <circle cx="560" cy="140" r="3"/>
      <circle cx="650" cy="120" r="2"/>
      <circle cx="680" cy="180" r="3"/>
      <circle cx="560" cy="220" r="2"/>
      <circle cx="640" cy="240" r="2"/>
    </g>
    <!-- planeet met ring -->
    <circle cx="600" cy="200" r="48" fill="#a87fe0"/>
    <ellipse cx="600" cy="200" rx="72" ry="18" fill="none" stroke="#cdb4f5" stroke-width="6" opacity="0.8"/>
    <circle cx="585" cy="186" r="12" fill="#8a5fd0" opacity="0.7"/>
    <!-- kozijn + klinknagels -->
    <circle cx="610" cy="180" r="100" fill="none" stroke="#5a6a86" stroke-width="14"/>
    <g fill="#6a7a96">
      <circle cx="610" cy="86" r="6"/>
      <circle cx="610" cy="274" r="6"/>
      <circle cx="516" cy="180" r="6"/>
      <circle cx="704" cy="180" r="6"/>
    </g>
  </g>

  <!-- vloer (metalen rooster) -->
  <rect x="0" y="420" width="800" height="180" fill="#2e3a52"/>
  <g stroke="#465674" stroke-width="3" opacity="0.7">
    <line x1="0" y1="480" x2="800" y2="480"/>
    <line x1="0" y1="545" x2="800" y2="545"/>
    <line x1="180" y1="420" x2="180" y2="600"/>
    <line x1="420" y1="420" x2="420" y2="600"/>
    <line x1="640" y1="420" x2="640" y2="600"/>
  </g>

  <!-- slaapcapsule (futuristisch bed) -->
  <g>
    <!-- capsule-romp -->
    <rect x="90" y="330" width="380" height="150" rx="70" fill="#566a8e"/>
    <rect x="90" y="330" width="380" height="150" rx="70" fill="none" stroke="#3a4866" stroke-width="6"/>
    <!-- glazen koepel -->
    <path d="M120 360 q160 -60 320 0 v20 q-160 -50 -320 0 z" fill="#9fd0ff" opacity="0.55"/>
    <!-- matras -->
    <rect x="130" y="392" width="300" height="64" rx="24" fill="#e8eefc"/>
    <!-- deken (blauw, met glow-streep) -->
    <path d="M250 392 h180 q14 32 0 64 h-180 z" fill="#3a6ea5"/>
    <path d="M250 392 h180 v14 h-180 z" fill="#5ab4ff"/>
    <!-- kussen -->
    <rect x="150" y="402" width="80" height="42" rx="16" fill="#cdd6e8"/>
    <!-- gloeiende status-lampjes op de capsule -->
    <circle cx="120" cy="420" r="6" fill="#5fe07a"/>
    <circle cx="120" cy="442" r="6" fill="#5ab4ff"/>
  </g>

  <!-- lockers / opbergwand -->
  <g>
    <rect x="120" y="160" width="240" height="120" rx="10" fill="#3a4866"/>
    <g fill="#566a8e" stroke="#26324a" stroke-width="3">
      <rect x="134" y="174" width="100" height="92" rx="8"/>
      <rect x="246" y="174" width="100" height="92" rx="8"/>
    </g>
    <!-- handgrepen -->
    <rect x="216" y="214" width="12" height="14" rx="4" fill="#9fb6e0"/>
    <rect x="328" y="214" width="12" height="14" rx="4" fill="#9fb6e0"/>
    <!-- statuslampje -->
    <circle cx="150" cy="190" r="6" fill="#5fe07a"/>
  </g>

  <!-- drijvende slaap-knuffel (astronaut-beertje) -->
  <g>
    <ellipse cx="500" cy="380" rx="22" ry="26" fill="#cdd6e8"/>
    <circle cx="500" cy="350" r="18" fill="#e8eefc"/>
    <circle cx="500" cy="350" r="12" fill="#9fd0ff" opacity="0.6"/>
    <circle cx="492" cy="344" r="4" fill="#2e3a52"/>
    <circle cx="508" cy="344" r="4" fill="#2e3a52"/>
    <circle cx="486" cy="338" r="6" fill="#cdd6e8"/>
    <circle cx="514" cy="338" r="6" fill="#cdd6e8"/>
  </g>

  <defs>
    <linearGradient id="rslaapWand" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#54627e"/>
      <stop offset="1" stop-color="#43506a"/>
    </linearGradient>
    <linearGradient id="rslaapRuimte" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0b1430"/>
      <stop offset="1" stop-color="#23204a"/>
    </linearGradient>
  </defs>
</svg>
`;
