// Platte SVG-illustratie van een schone woonkamer (Toca-Boca-stijl).
// viewBox 800x600 — schaalt haarscherp mee op elke iPad.

export const woonkamerSVG = `
<svg class="kamer-svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <!-- muur -->
  <rect x="0" y="0" width="800" height="600" fill="#ffe8c7"/>
  <rect x="0" y="0" width="800" height="380" fill="#ffd9a0"/>
  <!-- muurstrepen -->
  <g opacity="0.35">
    <rect x="0" y="120" width="800" height="6" fill="#f6c989"/>
    <rect x="0" y="250" width="800" height="6" fill="#f6c989"/>
  </g>

  <!-- vloer -->
  <rect x="0" y="380" width="800" height="220" fill="#e3b07a"/>
  <g stroke="#d49a5e" stroke-width="4" opacity="0.6">
    <line x1="0" y1="440" x2="800" y2="440"/>
    <line x1="0" y1="510" x2="800" y2="510"/>
    <line x1="140" y1="380" x2="120" y2="600"/>
    <line x1="320" y1="380" x2="320" y2="600"/>
    <line x1="500" y1="380" x2="520" y2="600"/>
    <line x1="680" y1="380" x2="700" y2="600"/>
  </g>
  <rect x="0" y="372" width="800" height="14" fill="#c98a4f"/>

  <!-- raam -->
  <g>
    <rect x="80" y="70" width="220" height="180" rx="14" fill="#9bdcff"/>
    <rect x="80" y="70" width="220" height="180" rx="14" fill="url(#woonLucht)"/>
    <circle cx="250" cy="120" r="26" fill="#fff3b0"/>
    <path d="M120 250 q40 -60 90 -30 q40 -50 90 0 v30 z" fill="#bff0d0"/>
    <rect x="80" y="70" width="220" height="180" rx="14" fill="none" stroke="#fff" stroke-width="10"/>
    <line x1="190" y1="70" x2="190" y2="250" stroke="#fff" stroke-width="10"/>
    <line x1="80" y1="160" x2="300" y2="160" stroke="#fff" stroke-width="10"/>
    <rect x="68" y="248" width="244" height="14" rx="6" fill="#fff"/>
  </g>

  <!-- schilderij -->
  <g>
    <rect x="500" y="90" width="140" height="110" rx="10" fill="#fff"/>
    <rect x="512" y="102" width="116" height="86" rx="6" fill="#ffd9e6"/>
    <circle cx="545" cy="135" r="16" fill="#ffd24a"/>
    <path d="M512 188 l40 -45 l30 25 l34 -38 l12 12 v46 z" fill="#7bd88f"/>
    <rect x="500" y="90" width="140" height="110" rx="10" fill="none" stroke="#caa46e" stroke-width="8"/>
  </g>

  <!-- staande lamp -->
  <g>
    <rect x="700" y="150" width="14" height="240" rx="7" fill="#9a7b56"/>
    <path d="M672 150 l70 0 l-18 -70 l-34 0 z" fill="#ffd24a"/>
    <ellipse cx="707" cy="392" rx="40" ry="12" fill="#9a7b56"/>
  </g>

  <!-- tapijt -->
  <ellipse cx="400" cy="500" rx="250" ry="70" fill="#ff8fb6"/>
  <ellipse cx="400" cy="500" rx="250" ry="70" fill="none" stroke="#ffb3cd" stroke-width="14" stroke-dasharray="2 26"/>
  <ellipse cx="400" cy="500" rx="160" ry="42" fill="#ffa9c6"/>

  <!-- bank -->
  <g>
    <rect x="250" y="330" width="300" height="120" rx="26" fill="#7bb0e8"/>
    <rect x="262" y="300" width="84" height="110" rx="22" fill="#8fc0f4"/>
    <rect x="454" y="300" width="84" height="110" rx="22" fill="#8fc0f4"/>
    <rect x="300" y="320" width="200" height="60" rx="18" fill="#a9d3ff"/>
    <rect x="330" y="332" width="60" height="44" rx="12" fill="#ffd24a"/>
    <rect x="410" y="332" width="60" height="44" rx="12" fill="#ff8fb6"/>
    <rect x="280" y="440" width="20" height="34" rx="8" fill="#5b87bd"/>
    <rect x="500" y="440" width="20" height="34" rx="8" fill="#5b87bd"/>
  </g>

  <!-- plant -->
  <g>
    <path d="M120 560 l16 -80 l40 0 l16 80 z" fill="#e8743b"/>
    <path d="M158 480 q-50 -90 -10 -150 q20 50 10 150" fill="#7bd88f"/>
    <path d="M158 480 q60 -70 40 -150 q-40 40 -40 150" fill="#67c87b"/>
    <path d="M158 480 q-10 -120 6 -150 q26 60 -6 150" fill="#8fe39f"/>
  </g>

  <defs>
    <linearGradient id="woonLucht" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#bdeaff"/>
      <stop offset="1" stop-color="#e9f8ff"/>
    </linearGradient>
  </defs>
</svg>
`;
