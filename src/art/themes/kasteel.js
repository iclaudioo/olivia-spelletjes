// KASTEEL — drie kamers met een sprookjes-kasteel-thema (stenen muren, gobelins,
// fakkels, vlaggen, een troon, een grote haard en een hoge torenkamer). Platte
// Toca-Boca-SVG's (viewBox 800x600, class "kamer-svg",
// preserveAspectRatio="xMidYMid slice"). Gradient-ids zijn per-SVG geprefixt
// zodat ze nergens botsen (troon*, kkeuken*, toren*).

// ---- Troonzaal: stenen muur, rode loper, troon, vlaggen, fakkels ----
export const troonzaalSVG = `
<svg class="kamer-svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <!-- stenen muur -->
  <rect x="0" y="0" width="800" height="600" fill="url(#troonMuur)"/>
  <!-- bakstenen patroon -->
  <g stroke="#8d8475" stroke-width="3" opacity="0.5">
    <line x1="0" y1="80" x2="800" y2="80"/>
    <line x1="0" y1="160" x2="800" y2="160"/>
    <line x1="0" y1="240" x2="800" y2="240"/>
    <line x1="0" y1="320" x2="800" y2="320"/>
    <line x1="100" y1="0" x2="100" y2="80"/>
    <line x1="300" y1="0" x2="300" y2="80"/>
    <line x1="500" y1="0" x2="500" y2="80"/>
    <line x1="700" y1="0" x2="700" y2="80"/>
    <line x1="0" y1="80" x2="0" y2="160"/>
    <line x1="200" y1="80" x2="200" y2="160"/>
    <line x1="400" y1="80" x2="400" y2="160"/>
    <line x1="600" y1="80" x2="600" y2="160"/>
    <line x1="800" y1="80" x2="800" y2="160"/>
    <line x1="100" y1="160" x2="100" y2="240"/>
    <line x1="300" y1="160" x2="300" y2="240"/>
    <line x1="500" y1="160" x2="500" y2="240"/>
    <line x1="700" y1="160" x2="700" y2="240"/>
    <line x1="200" y1="240" x2="200" y2="320"/>
    <line x1="400" y1="240" x2="400" y2="320"/>
    <line x1="600" y1="240" x2="600" y2="320"/>
  </g>

  <!-- spitsboog-raam achter de troon -->
  <g>
    <path d="M360 110 q40 -70 80 0 v120 h-80 z" fill="url(#troonRaam)"/>
    <path d="M360 110 q40 -70 80 0 v120 h-80 z" fill="none" stroke="#6f6657" stroke-width="10"/>
    <line x1="400" y1="46" x2="400" y2="230" stroke="#6f6657" stroke-width="8"/>
    <line x1="360" y1="160" x2="440" y2="160" stroke="#6f6657" stroke-width="8"/>
  </g>

  <!-- stenen vloer -->
  <rect x="0" y="380" width="800" height="220" fill="#9a917f"/>
  <g stroke="#827a6a" stroke-width="4" opacity="0.6">
    <line x1="0" y1="460" x2="800" y2="460"/>
    <line x1="0" y1="540" x2="800" y2="540"/>
    <line x1="150" y1="380" x2="150" y2="600"/>
    <line x1="350" y1="380" x2="350" y2="600"/>
    <line x1="450" y1="380" x2="450" y2="600"/>
    <line x1="650" y1="380" x2="650" y2="600"/>
  </g>

  <!-- rode loper -->
  <polygon points="320,380 480,380 540,600 260,600" fill="#b5352f"/>
  <polygon points="320,380 480,380 540,600 260,600" fill="none" stroke="#ffd24a" stroke-width="6"/>
  <g stroke="#ffd24a" stroke-width="3" opacity="0.7">
    <line x1="350" y1="380" x2="300" y2="600"/>
    <line x1="450" y1="380" x2="500" y2="600"/>
  </g>

  <!-- troon-podium -->
  <rect x="300" y="350" width="200" height="40" rx="6" fill="#7a715f"/>

  <!-- troon -->
  <g>
    <!-- hoge rugleuning -->
    <rect x="350" y="200" width="100" height="160" rx="10" fill="#9a6b2f"/>
    <rect x="350" y="200" width="100" height="160" rx="10" fill="none" stroke="#c9962f" stroke-width="6"/>
    <!-- gouden punten boven de rugleuning -->
    <path d="M356 200 l14 -34 l14 34 z" fill="#ffd24a"/>
    <path d="M386 200 l14 -42 l14 42 z" fill="#ffd24a"/>
    <path d="M416 200 l14 -34 l14 34 z" fill="#ffd24a"/>
    <!-- zitkussen -->
    <rect x="356" y="300" width="88" height="40" rx="10" fill="#b5352f"/>
    <!-- armleuningen -->
    <rect x="338" y="290" width="20" height="70" rx="8" fill="#c9962f"/>
    <rect x="442" y="290" width="20" height="70" rx="8" fill="#c9962f"/>
  </g>

  <!-- linker vlag (gobelin) -->
  <g>
    <rect x="120" y="90" width="90" height="180" rx="6" fill="#3a6ea5"/>
    <path d="M120 270 l45 26 l45 -26 z" fill="#3a6ea5"/>
    <rect x="120" y="90" width="90" height="180" rx="6" fill="none" stroke="#ffd24a" stroke-width="5"/>
    <!-- wapen: kroon -->
    <path d="M145 170 l8 -22 l12 14 l10 -18 l10 18 l12 -14 l8 22 z" fill="#ffd24a"/>
  </g>

  <!-- rechter vlag (gobelin) -->
  <g>
    <rect x="590" y="90" width="90" height="180" rx="6" fill="#7a2f7a"/>
    <path d="M590 270 l45 26 l45 -26 z" fill="#7a2f7a"/>
    <rect x="590" y="90" width="90" height="180" rx="6" fill="none" stroke="#ffd24a" stroke-width="5"/>
    <!-- wapen: ster -->
    <path d="M635 130 l9 26 l27 0 l-22 16 l8 26 l-22 -16 l-22 16 l8 -26 l-22 -16 l27 0 z" fill="#ffd24a"/>
  </g>

  <!-- fakkel links -->
  <g>
    <rect x="262" y="240" width="14" height="80" rx="6" fill="#6b4a2a"/>
    <path d="M269 240 q-20 -30 0 -54 q20 24 0 54 z" fill="#ff9a3d"/>
    <path d="M269 240 q-10 -18 0 -34 q10 16 0 34 z" fill="#ffd24a"/>
  </g>
  <!-- fakkel rechts -->
  <g>
    <rect x="524" y="240" width="14" height="80" rx="6" fill="#6b4a2a"/>
    <path d="M531 240 q-20 -30 0 -54 q20 24 0 54 z" fill="#ff9a3d"/>
    <path d="M531 240 q-10 -18 0 -34 q10 16 0 34 z" fill="#ffd24a"/>
  </g>

  <defs>
    <linearGradient id="troonMuur" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#b8b0a0"/>
      <stop offset="1" stop-color="#a39a88"/>
    </linearGradient>
    <linearGradient id="troonRaam" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#9ec9ff"/>
      <stop offset="1" stop-color="#dcecff"/>
    </linearGradient>
  </defs>
</svg>
`;

// ---- Kasteel-keuken: grote haard met ketel, houten tafel, hangende worsten ----
export const kasteelkeukenSVG = `
<svg class="kamer-svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <!-- stenen muur -->
  <rect x="0" y="0" width="800" height="600" fill="url(#kkeukenMuur)"/>
  <g stroke="#8d8475" stroke-width="3" opacity="0.5">
    <line x1="0" y1="90" x2="800" y2="90"/>
    <line x1="0" y1="180" x2="800" y2="180"/>
    <line x1="0" y1="270" x2="800" y2="270"/>
    <line x1="120" y1="0" x2="120" y2="90"/>
    <line x1="320" y1="0" x2="320" y2="90"/>
    <line x1="520" y1="0" x2="520" y2="90"/>
    <line x1="720" y1="0" x2="720" y2="90"/>
    <line x1="220" y1="90" x2="220" y2="180"/>
    <line x1="420" y1="90" x2="420" y2="180"/>
    <line x1="620" y1="90" x2="620" y2="180"/>
    <line x1="120" y1="180" x2="120" y2="270"/>
    <line x1="320" y1="180" x2="320" y2="270"/>
    <line x1="520" y1="180" x2="520" y2="270"/>
    <line x1="720" y1="180" x2="720" y2="270"/>
  </g>

  <!-- stenen vloer -->
  <rect x="0" y="400" width="800" height="200" fill="#9a917f"/>
  <g stroke="#827a6a" stroke-width="4" opacity="0.6">
    <line x1="0" y1="480" x2="800" y2="480"/>
    <line x1="0" y1="550" x2="800" y2="550"/>
    <line x1="160" y1="400" x2="160" y2="600"/>
    <line x1="380" y1="400" x2="380" y2="600"/>
    <line x1="600" y1="400" x2="600" y2="600"/>
  </g>

  <!-- grote haard (open vuur met ketel) -->
  <g>
    <!-- stenen omlijsting -->
    <rect x="60" y="200" width="280" height="280" rx="10" fill="#7a715f"/>
    <!-- vuuropening -->
    <path d="M100 480 v-170 q80 -80 160 0 v170 z" fill="#2b211a"/>
    <!-- schoorsteenrand -->
    <rect x="44" y="186" width="312" height="28" rx="8" fill="#8a8170"/>
    <!-- vlammen -->
    <path d="M150 470 q-26 -50 14 -90 q-6 36 26 50 q-10 -40 24 -64 q-2 60 36 104 z" fill="#ff7a2f"/>
    <path d="M170 470 q-14 -36 12 -64 q-2 26 18 38 q-6 -28 16 -46 q0 44 22 72 z" fill="#ffd24a"/>
    <!-- ketel boven het vuur -->
    <ellipse cx="200" cy="356" rx="56" ry="40" fill="#4a4a4a"/>
    <ellipse cx="200" cy="340" rx="50" ry="16" fill="#3a3a3a"/>
    <path d="M156 330 q44 -44 88 0" fill="none" stroke="#2a2a2a" stroke-width="6"/>
    <!-- haak/ketting -->
    <line x1="200" y1="300" x2="200" y2="214" stroke="#5a5a5a" stroke-width="6"/>
  </g>

  <!-- houten werktafel -->
  <g>
    <rect x="430" y="380" width="300" height="30" rx="8" fill="#9a6b2f"/>
    <rect x="450" y="410" width="20" height="110" rx="6" fill="#7a5226"/>
    <rect x="690" y="410" width="20" height="110" rx="6" fill="#7a5226"/>
    <!-- brood + groente op tafel -->
    <ellipse cx="500" cy="372" rx="34" ry="16" fill="#d49a5e"/>
    <circle cx="560" cy="368" r="16" fill="#ff7a7a"/>
    <circle cx="600" cy="370" r="14" fill="#7bd88f"/>
    <!-- kruik -->
    <path d="M650 372 q-10 -34 18 -36 q28 2 18 36 z" fill="#c9962f"/>
  </g>

  <!-- hangende worsten/ham aan een balk -->
  <g>
    <rect x="430" y="120" width="320" height="14" rx="6" fill="#7a5226"/>
    <ellipse cx="490" cy="170" rx="16" ry="34" fill="#b5352f"/>
    <line x1="490" y1="134" x2="490" y2="140" stroke="#3a2a1a" stroke-width="4"/>
    <ellipse cx="560" cy="160" rx="14" ry="28" fill="#c14a3f"/>
    <line x1="560" y1="134" x2="560" y2="138" stroke="#3a2a1a" stroke-width="4"/>
    <ellipse cx="630" cy="172" rx="16" ry="34" fill="#b5352f"/>
    <line x1="630" y1="134" x2="630" y2="142" stroke="#3a2a1a" stroke-width="4"/>
  </g>

  <!-- spitsboog-raampje -->
  <g>
    <path d="M620 230 q26 -44 52 0 v70 h-52 z" fill="url(#kkeukenRaam)"/>
    <path d="M620 230 q26 -44 52 0 v70 h-52 z" fill="none" stroke="#6f6657" stroke-width="8"/>
    <line x1="646" y1="192" x2="646" y2="300" stroke="#6f6657" stroke-width="6"/>
  </g>

  <defs>
    <linearGradient id="kkeukenMuur" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#b8b0a0"/>
      <stop offset="1" stop-color="#a39a88"/>
    </linearGradient>
    <linearGradient id="kkeukenRaam" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#9ec9ff"/>
      <stop offset="1" stop-color="#dcecff"/>
    </linearGradient>
  </defs>
</svg>
`;

// ---- Torenkamer: ronde stenen toren, hemelbed, spitsraam met uitzicht, kandelaar ----
export const torenkamerSVG = `
<svg class="kamer-svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <!-- ronde stenen toren-muur -->
  <rect x="0" y="0" width="800" height="600" fill="url(#torenMuur)"/>
  <!-- gebogen steenlagen (suggereert ronde toren) -->
  <g stroke="#8d8475" stroke-width="3" opacity="0.5" fill="none">
    <path d="M0 70 q400 -40 800 0"/>
    <path d="M0 150 q400 -40 800 0"/>
    <path d="M0 230 q400 -40 800 0"/>
    <path d="M0 310 q400 -40 800 0"/>
  </g>
  <g stroke="#8d8475" stroke-width="3" opacity="0.4">
    <line x1="160" y1="70" x2="158" y2="150"/>
    <line x1="360" y1="62" x2="360" y2="142"/>
    <line x1="560" y1="62" x2="562" y2="142"/>
    <line x1="260" y1="150" x2="258" y2="230"/>
    <line x1="460" y1="142" x2="460" y2="222"/>
    <line x1="640" y1="150" x2="642" y2="230"/>
  </g>

  <!-- houten vloer -->
  <rect x="0" y="400" width="800" height="200" fill="#9a6b2f"/>
  <g stroke="#7a5226" stroke-width="4" opacity="0.6">
    <line x1="0" y1="480" x2="800" y2="480"/>
    <line x1="0" y1="550" x2="800" y2="550"/>
    <line x1="200" y1="400" x2="200" y2="600"/>
    <line x1="450" y1="400" x2="450" y2="600"/>
    <line x1="650" y1="400" x2="650" y2="600"/>
  </g>

  <!-- groot spitsboog-raam met uitzicht -->
  <g>
    <path d="M500 120 q60 -100 120 0 v160 h-120 z" fill="url(#torenRaam)"/>
    <!-- verre heuvels + kasteeltorentje -->
    <path d="M500 240 q40 -30 70 -6 q40 -28 50 14 v32 h-120 z" fill="#7bd88f"/>
    <rect x="556" y="190" width="20" height="40" fill="#a39a88"/>
    <path d="M552 190 l28 0 l-14 -18 z" fill="#b5352f"/>
    <!-- raamkozijn -->
    <path d="M500 120 q60 -100 120 0 v160 h-120 z" fill="none" stroke="#6f6657" stroke-width="10"/>
    <line x1="560" y1="46" x2="560" y2="280" stroke="#6f6657" stroke-width="8"/>
    <line x1="500" y1="200" x2="620" y2="200" stroke="#6f6657" stroke-width="8"/>
  </g>

  <!-- vloerkleed -->
  <ellipse cx="370" cy="520" rx="240" ry="56" fill="#7a2f7a" opacity="0.85"/>
  <ellipse cx="370" cy="520" rx="240" ry="56" fill="none" stroke="#ffd24a" stroke-width="10" stroke-dasharray="2 22"/>
  <ellipse cx="370" cy="520" rx="150" ry="34" fill="#9a3f9a"/>

  <!-- hemelbed -->
  <g>
    <!-- bedpalen -->
    <rect x="150" y="250" width="16" height="230" rx="6" fill="#7a5226"/>
    <rect x="470" y="250" width="16" height="230" rx="6" fill="#7a5226"/>
    <!-- baldakijn -->
    <rect x="140" y="236" width="356" height="30" rx="8" fill="#9a6b2f"/>
    <path d="M140 266 q178 60 356 0 v18 q-178 56 -356 0 z" fill="#b5352f"/>
    <path d="M140 266 q178 60 356 0" fill="none" stroke="#ffd24a" stroke-width="5"/>
    <!-- matras -->
    <rect x="170" y="380" width="300" height="80" rx="16" fill="#ffffff"/>
    <!-- deken (paars, koninklijk) -->
    <path d="M260 380 h210 v80 h-210 q-14 -40 0 -80 z" fill="#7a2f7a"/>
    <path d="M260 380 h210 v18 h-210 z" fill="#a35fa3"/>
    <!-- kussen -->
    <rect x="186" y="368" width="80" height="44" rx="14" fill="#ffd9e6"/>
    <!-- pootjes -->
    <rect x="176" y="454" width="16" height="28" rx="6" fill="#5a3c1c"/>
    <rect x="450" y="454" width="16" height="28" rx="6" fill="#5a3c1c"/>
  </g>

  <!-- kandelaar op de vloer -->
  <g>
    <rect x="690" y="380" width="14" height="120" rx="6" fill="#c9962f"/>
    <ellipse cx="697" cy="500" rx="36" ry="12" fill="#c9962f"/>
    <rect x="668" y="360" width="58" height="14" rx="6" fill="#c9962f"/>
    <!-- kaarsen -->
    <rect x="676" y="334" width="10" height="28" rx="4" fill="#fff4d6"/>
    <rect x="692" y="328" width="10" height="34" rx="4" fill="#fff4d6"/>
    <rect x="708" y="334" width="10" height="28" rx="4" fill="#fff4d6"/>
    <path d="M681 334 q-5 -12 0 -18 q5 6 0 18 z" fill="#ff9a3d"/>
    <path d="M697 328 q-5 -12 0 -18 q5 6 0 18 z" fill="#ff9a3d"/>
    <path d="M713 334 q-5 -12 0 -18 q5 6 0 18 z" fill="#ff9a3d"/>
  </g>

  <defs>
    <linearGradient id="torenMuur" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#bdb5a5"/>
      <stop offset="1" stop-color="#a39a88"/>
    </linearGradient>
    <linearGradient id="torenRaam" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#9ec9ff"/>
      <stop offset="1" stop-color="#dcecff"/>
    </linearGradient>
  </defs>
</svg>
`;
