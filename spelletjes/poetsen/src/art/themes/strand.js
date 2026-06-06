// STRANDHUIS — drie kamers met een zonnig strand-thema (zandkleuren, zee,
// licht hout, zee-uitzicht-ramen). Platte Toca-Boca-SVG's (viewBox 800x600,
// class "kamer-svg", preserveAspectRatio="xMidYMid slice"). Gradient-ids zijn
// per-SVG geprefixt zodat ze nergens botsen.

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
