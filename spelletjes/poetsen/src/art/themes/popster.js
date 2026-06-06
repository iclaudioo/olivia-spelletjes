// POPSTER STUDIO — drie glamoureuze K-pop-kamers (concertpodium, artiesten-
// kleedkamer met Hollywood-spiegel, en een dansstudio met spiegelwand + barre).
// Platte Toca-Boca-SVG's (viewBox 800x600, class "kamer-svg",
// preserveAspectRatio="xMidYMid slice"). Gradient-ids zijn per-SVG geprefixt
// zodat ze nergens botsen (podium*, kleed*, oefen*).

// ---- Podium: concertpodium met spotlights, luidsprekers, microfoon, banner ----
export const podiumSVG = `
<svg class="kamer-svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <!-- donkere concert-achtergrond met paarse gloed -->
  <rect x="0" y="0" width="800" height="600" fill="url(#podiumLucht)"/>
  <rect x="0" y="0" width="800" height="380" fill="url(#podiumLucht)"/>

  <!-- glittergordijn als achtergrond -->
  <g>
    <rect x="0" y="0" width="800" height="380" fill="url(#podiumGordijn)" opacity="0.85"/>
    <g stroke="#c77ddb" stroke-width="6" opacity="0.4">
      <line x1="80" y1="0" x2="80" y2="380"/>
      <line x1="200" y1="0" x2="200" y2="380"/>
      <line x1="320" y1="0" x2="320" y2="380"/>
      <line x1="480" y1="0" x2="480" y2="380"/>
      <line x1="600" y1="0" x2="600" y2="380"/>
      <line x1="720" y1="0" x2="720" y2="380"/>
    </g>
  </g>

  <!-- gekleurde spotlight-bundels van boven -->
  <g opacity="0.55">
    <polygon points="160,0 110,0 40,360 200,360" fill="url(#podiumSpotRoze)"/>
    <polygon points="400,0 350,0 300,360 500,360" fill="url(#podiumSpotGeel)"/>
    <polygon points="640,0 590,0 600,360 760,360" fill="url(#podiumSpotBlauw)"/>
  </g>

  <!-- concert-banner -->
  <g>
    <rect x="250" y="40" width="300" height="70" rx="14" fill="#ff5fa2"/>
    <rect x="250" y="40" width="300" height="70" rx="14" fill="none" stroke="#ffd24a" stroke-width="6"/>
    <text x="400" y="88" text-anchor="middle" font-size="40" font-family="Arial, sans-serif" font-weight="bold" fill="#fff">POPSTER</text>
  </g>

  <!-- sterren in de lucht -->
  <g fill="#ffe27a">
    <path d="M120 150 l5 14 l15 0 l-12 9 l5 15 l-13 -9 l-13 9 l5 -15 l-12 -9 l15 0 z"/>
    <path d="M680 130 l4 11 l12 0 l-10 7 l4 12 l-10 -7 l-10 7 l4 -12 l-10 -7 l12 0 z"/>
    <path d="M610 220 l3 9 l10 0 l-8 6 l3 10 l-8 -6 l-8 6 l3 -10 l-8 -6 l10 0 z"/>
  </g>

  <!-- podiumvloer (glanzend hout) -->
  <rect x="0" y="380" width="800" height="220" fill="url(#podiumVloer)"/>
  <g stroke="#7a3fa0" stroke-width="4" opacity="0.5">
    <line x1="0" y1="450" x2="800" y2="450"/>
    <line x1="0" y1="520" x2="800" y2="520"/>
    <line x1="180" y1="380" x2="180" y2="600"/>
    <line x1="420" y1="380" x2="420" y2="600"/>
    <line x1="640" y1="380" x2="640" y2="600"/>
  </g>
  <rect x="0" y="372" width="800" height="14" fill="#5f2f86"/>
  <!-- glans-reflectie op de vloer -->
  <ellipse cx="400" cy="470" rx="240" ry="50" fill="#ffffff" opacity="0.08"/>

  <!-- grote luidspreker links -->
  <g>
    <rect x="40" y="330" width="120" height="220" rx="12" fill="#2b2440"/>
    <rect x="40" y="330" width="120" height="220" rx="12" fill="none" stroke="#5f2f86" stroke-width="6"/>
    <circle cx="100" cy="400" r="40" fill="#1a1530"/>
    <circle cx="100" cy="400" r="26" fill="#3a3358"/>
    <circle cx="100" cy="400" r="10" fill="#c77ddb"/>
    <circle cx="100" cy="500" r="24" fill="#1a1530"/>
    <circle cx="100" cy="500" r="10" fill="#c77ddb"/>
  </g>

  <!-- grote luidspreker rechts -->
  <g>
    <rect x="640" y="330" width="120" height="220" rx="12" fill="#2b2440"/>
    <rect x="640" y="330" width="120" height="220" rx="12" fill="none" stroke="#5f2f86" stroke-width="6"/>
    <circle cx="700" cy="400" r="40" fill="#1a1530"/>
    <circle cx="700" cy="400" r="26" fill="#3a3358"/>
    <circle cx="700" cy="400" r="10" fill="#c77ddb"/>
    <circle cx="700" cy="500" r="24" fill="#1a1530"/>
    <circle cx="700" cy="500" r="10" fill="#c77ddb"/>
  </g>

  <!-- microfoon op standaard, centraal -->
  <g>
    <!-- voet -->
    <ellipse cx="400" cy="556" rx="56" ry="14" fill="#2b2440"/>
    <!-- standaard-paal -->
    <rect x="393" y="360" width="14" height="196" rx="6" fill="#3a3358"/>
    <!-- klem -->
    <rect x="386" y="356" width="28" height="16" rx="6" fill="#5f2f86"/>
    <!-- microfoon-kop -->
    <ellipse cx="400" cy="340" rx="22" ry="28" fill="#d9d3e8"/>
    <ellipse cx="400" cy="332" rx="22" ry="20" fill="#8a82a8"/>
    <rect x="390" y="354" width="20" height="22" rx="8" fill="#3a3358"/>
    <!-- gaasje -->
    <g stroke="#5f5878" stroke-width="2" opacity="0.7">
      <line x1="382" y1="328" x2="418" y2="328"/>
      <line x1="384" y1="338" x2="416" y2="338"/>
    </g>
  </g>

  <defs>
    <linearGradient id="podiumLucht" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3a1f52"/>
      <stop offset="1" stop-color="#1f1330"/>
    </linearGradient>
    <linearGradient id="podiumGordijn" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#6a2f8f"/>
      <stop offset="1" stop-color="#3a1f52"/>
    </linearGradient>
    <linearGradient id="podiumVloer" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5f3a86"/>
      <stop offset="1" stop-color="#3a2458"/>
    </linearGradient>
    <linearGradient id="podiumSpotRoze" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ff7ec4"/>
      <stop offset="1" stop-color="#ff7ec4" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="podiumSpotGeel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffe27a"/>
      <stop offset="1" stop-color="#ffe27a" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="podiumSpotBlauw" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#7ad4ff"/>
      <stop offset="1" stop-color="#7ad4ff" stop-opacity="0"/>
    </linearGradient>
  </defs>
</svg>
`;

// ---- Kleedkamer: Hollywood-spiegel met lampjes, make-uptafel, kledingrek, kruk ----
export const kleedkamerSVG = `
<svg class="kamer-svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <!-- muur (zacht glamour-roze) -->
  <rect x="0" y="0" width="800" height="600" fill="#ffeef6"/>
  <rect x="0" y="0" width="800" height="380" fill="url(#kleedMuur)"/>
  <!-- subtiele glitter-stipjes op de muur -->
  <g fill="#ffd24a" opacity="0.5">
    <circle cx="120" cy="90" r="3"/>
    <circle cx="240" cy="140" r="2.5"/>
    <circle cx="540" cy="80" r="3"/>
    <circle cx="680" cy="150" r="2.5"/>
    <circle cx="180" cy="220" r="2.5"/>
    <circle cx="620" cy="220" r="3"/>
  </g>

  <!-- glanzende vloer -->
  <rect x="0" y="380" width="800" height="220" fill="url(#kleedVloer)"/>
  <g stroke="#e0a8c4" stroke-width="4" opacity="0.5">
    <line x1="0" y1="450" x2="800" y2="450"/>
    <line x1="0" y1="520" x2="800" y2="520"/>
    <line x1="200" y1="380" x2="200" y2="600"/>
    <line x1="450" y1="380" x2="450" y2="600"/>
    <line x1="650" y1="380" x2="650" y2="600"/>
  </g>
  <rect x="0" y="372" width="800" height="14" fill="#d98ab4"/>

  <!-- Hollywood-spiegel (vanity) met lampjes eromheen -->
  <g>
    <!-- spiegel-frame -->
    <rect x="120" y="70" width="280" height="240" rx="16" fill="#f7d9e8"/>
    <rect x="120" y="70" width="280" height="240" rx="16" fill="none" stroke="#d98ab4" stroke-width="8"/>
    <!-- spiegelglas -->
    <rect x="148" y="98" width="224" height="184" rx="10" fill="url(#kleedGlas)"/>
    <!-- reflectie-streep -->
    <polygon points="180,98 230,98 160,282 110,282" fill="#ffffff" opacity="0.18"/>
    <!-- lampjes rondom -->
    <g fill="#fff4c2" stroke="#ffd24a" stroke-width="2">
      <circle cx="148" cy="84" r="9"/>
      <circle cx="194" cy="84" r="9"/>
      <circle cx="240" cy="84" r="9"/>
      <circle cx="286" cy="84" r="9"/>
      <circle cx="332" cy="84" r="9"/>
      <circle cx="372" cy="84" r="9"/>
      <circle cx="148" cy="296" r="9"/>
      <circle cx="194" cy="296" r="9"/>
      <circle cx="240" cy="296" r="9"/>
      <circle cx="286" cy="296" r="9"/>
      <circle cx="332" cy="296" r="9"/>
      <circle cx="372" cy="296" r="9"/>
      <circle cx="134" cy="130" r="9"/>
      <circle cx="134" cy="190" r="9"/>
      <circle cx="134" cy="250" r="9"/>
      <circle cx="386" cy="130" r="9"/>
      <circle cx="386" cy="190" r="9"/>
      <circle cx="386" cy="250" r="9"/>
    </g>
  </g>

  <!-- make-uptafel (vanity-tafel) onder de spiegel -->
  <g>
    <rect x="100" y="380" width="320" height="30" rx="8" fill="#e9a7c6"/>
    <rect x="100" y="380" width="320" height="30" rx="8" fill="none" stroke="#d98ab4" stroke-width="4"/>
    <!-- lade -->
    <rect x="120" y="410" width="280" height="90" rx="8" fill="#f3c1da"/>
    <rect x="150" y="440" width="80" height="14" rx="6" fill="#d98ab4"/>
    <rect x="290" y="440" width="80" height="14" rx="6" fill="#d98ab4"/>
    <!-- pootjes -->
    <rect x="120" y="500" width="16" height="40" rx="6" fill="#c777a0"/>
    <rect x="384" y="500" width="16" height="40" rx="6" fill="#c777a0"/>
  </g>

  <!-- make-up spulletjes op de tafel -->
  <g>
    <!-- lippenstift -->
    <rect x="150" y="352" width="14" height="28" rx="4" fill="#ff5fa2"/>
    <rect x="152" y="344" width="10" height="12" rx="3" fill="#ff8fc0"/>
    <!-- nagellak -->
    <rect x="190" y="356" width="20" height="24" rx="4" fill="#c77ddb"/>
    <rect x="196" y="346" width="8" height="12" rx="3" fill="#3a3358"/>
    <!-- poederdoosje -->
    <circle cx="250" cy="366" r="16" fill="#ffd24a"/>
    <circle cx="250" cy="366" r="8" fill="#fff4c2"/>
    <!-- parfumflesje -->
    <rect x="300" y="350" width="26" height="30" rx="6" fill="#ffe27a"/>
    <rect x="308" y="340" width="10" height="12" rx="3" fill="#d98ab4"/>
    <!-- kwastje -->
    <rect x="356" y="350" width="8" height="30" rx="3" fill="#8a82a8"/>
    <path d="M360 350 q-8 -14 0 -22 q8 8 0 22 z" fill="#ff8fc0"/>
  </g>

  <!-- kledingrek met glitter-jurken -->
  <g>
    <!-- stang -->
    <rect x="500" y="170" width="240" height="12" rx="6" fill="#c777a0"/>
    <rect x="510" y="170" width="10" height="330" rx="5" fill="#c777a0"/>
    <rect x="720" y="170" width="10" height="330" rx="5" fill="#c777a0"/>
    <ellipse cx="620" cy="500" rx="130" ry="12" fill="#c777a0" opacity="0.5"/>
    <!-- jurk 1 (roze glitter) -->
    <g>
      <path d="M540 186 q14 -16 28 0" fill="none" stroke="#8a82a8" stroke-width="4"/>
      <path d="M540 196 h28 l22 130 h-72 z" fill="#ff7ec4"/>
      <g fill="#ffe27a" opacity="0.8">
        <circle cx="548" cy="230" r="2.5"/>
        <circle cx="566" cy="260" r="2.5"/>
        <circle cx="540" cy="290" r="2.5"/>
        <circle cx="572" cy="300" r="2.5"/>
      </g>
    </g>
    <!-- jurk 2 (paars glitter) -->
    <g>
      <path d="M612 186 q14 -16 28 0" fill="none" stroke="#8a82a8" stroke-width="4"/>
      <path d="M612 196 h28 l20 140 h-68 z" fill="#c77ddb"/>
      <g fill="#fff4c2" opacity="0.85">
        <circle cx="620" cy="240" r="2.5"/>
        <circle cx="640" cy="270" r="2.5"/>
        <circle cx="616" cy="300" r="2.5"/>
        <circle cx="646" cy="310" r="2.5"/>
      </g>
    </g>
    <!-- jurk 3 (geel) -->
    <g>
      <path d="M684 186 q14 -16 28 0" fill="none" stroke="#8a82a8" stroke-width="4"/>
      <path d="M684 196 h28 l18 120 h-64 z" fill="#ffd24a"/>
    </g>
  </g>

  <!-- krukje voor de make-uptafel -->
  <g>
    <ellipse cx="260" cy="540" rx="46" ry="16" fill="#ff8fc0"/>
    <ellipse cx="260" cy="534" rx="46" ry="16" fill="#ffb3d4"/>
    <rect x="220" y="540" width="12" height="40" rx="5" fill="#c777a0"/>
    <rect x="288" y="540" width="12" height="40" rx="5" fill="#c777a0"/>
  </g>

  <defs>
    <linearGradient id="kleedMuur" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffe0ef"/>
      <stop offset="1" stop-color="#ffd0e6"/>
    </linearGradient>
    <linearGradient id="kleedVloer" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f7c9de"/>
      <stop offset="1" stop-color="#eeb3cf"/>
    </linearGradient>
    <linearGradient id="kleedGlas" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e9f4ff"/>
      <stop offset="1" stop-color="#cfe6f7"/>
    </linearGradient>
  </defs>
</svg>
`;

// ---- Oefenstudio: dansstudio met spiegelwand, ballet-barre, houten vloer, boombox ----
export const oefenstudioSVG = `
<svg class="kamer-svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <!-- muur -->
  <rect x="0" y="0" width="800" height="600" fill="#eef0f7"/>
  <rect x="0" y="0" width="800" height="380" fill="#e3e6f2"/>

  <!-- grote spiegelwand -->
  <g>
    <rect x="40" y="50" width="720" height="300" rx="10" fill="url(#oefenSpiegel)"/>
    <rect x="40" y="50" width="720" height="300" rx="10" fill="none" stroke="#b7bcd6" stroke-width="8"/>
    <!-- naden tussen spiegel-panelen -->
    <g stroke="#cfd3e6" stroke-width="4" opacity="0.8">
      <line x1="280" y1="50" x2="280" y2="350"/>
      <line x1="520" y1="50" x2="520" y2="350"/>
    </g>
    <!-- diagonale reflectie-strepen -->
    <g fill="#ffffff" opacity="0.22">
      <polygon points="90,50 150,50 60,350 0,350" transform="translate(40 0)"/>
      <polygon points="360,50 400,50 320,350 280,350" transform="translate(40 0)"/>
      <polygon points="600,50 640,50 560,350 520,350" transform="translate(40 0)"/>
    </g>
  </g>

  <!-- motiverende poster -->
  <g>
    <rect x="600" y="90" width="120" height="150" rx="8" fill="#ff7ec4"/>
    <rect x="600" y="90" width="120" height="150" rx="8" fill="none" stroke="#ffffff" stroke-width="5"/>
    <path d="M660 130 l8 22 l24 0 l-19 15 l7 23 l-20 -14 l-20 14 l7 -23 l-19 -15 l24 0 z" fill="#fff4c2"/>
    <text x="660" y="220" text-anchor="middle" font-size="20" font-family="Arial, sans-serif" font-weight="bold" fill="#fff">DANS!</text>
  </g>

  <!-- houten dansvloer -->
  <rect x="0" y="380" width="800" height="220" fill="url(#oefenVloer)"/>
  <g stroke="#c79a5e" stroke-width="4" opacity="0.6">
    <line x1="0" y1="450" x2="800" y2="450"/>
    <line x1="0" y1="520" x2="800" y2="520"/>
    <line x1="160" y1="380" x2="160" y2="600"/>
    <line x1="360" y1="380" x2="360" y2="600"/>
    <line x1="540" y1="380" x2="540" y2="600"/>
    <line x1="700" y1="380" x2="700" y2="600"/>
  </g>
  <rect x="0" y="372" width="800" height="14" fill="#b07f3f"/>

  <!-- ballet-/dansbarre langs de muur -->
  <g>
    <!-- horizontale barre -->
    <rect x="60" y="360" width="430" height="14" rx="7" fill="#d9a25e"/>
    <rect x="60" y="360" width="430" height="14" rx="7" fill="none" stroke="#b07f3f" stroke-width="3"/>
    <!-- steunen -->
    <rect x="90" y="366" width="14" height="120" rx="6" fill="#9a9fc0"/>
    <path d="M84 486 h26 v10 h-26 z" fill="#7d83a8"/>
    <rect x="446" y="366" width="14" height="120" rx="6" fill="#9a9fc0"/>
    <path d="M440 486 h26 v10 h-26 z" fill="#7d83a8"/>
    <!-- beugels die de barre aan de steun houden -->
    <rect x="84" y="358" width="26" height="14" rx="6" fill="#7d83a8"/>
    <rect x="440" y="358" width="26" height="14" rx="6" fill="#7d83a8"/>
  </g>

  <!-- boombox/speaker op de vloer -->
  <g>
    <rect x="600" y="450" width="160" height="100" rx="12" fill="#2b2440"/>
    <rect x="600" y="450" width="160" height="100" rx="12" fill="none" stroke="#5f2f86" stroke-width="5"/>
    <circle cx="645" cy="500" r="28" fill="#1a1530"/>
    <circle cx="645" cy="500" r="14" fill="#c77ddb"/>
    <circle cx="715" cy="500" r="28" fill="#1a1530"/>
    <circle cx="715" cy="500" r="14" fill="#c77ddb"/>
    <!-- handvat -->
    <path d="M630 450 q50 -34 100 0" fill="none" stroke="#3a3358" stroke-width="8"/>
    <!-- muziek-noten -->
    <g fill="#ff7ec4">
      <circle cx="580" cy="420" r="7"/>
      <rect x="585" y="396" width="4" height="28" fill="#ff7ec4"/>
      <circle cx="556" cy="440" r="6"/>
      <rect x="560" y="418" width="3.5" height="24" fill="#ff7ec4"/>
    </g>
  </g>

  <defs>
    <linearGradient id="oefenSpiegel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#dfeaf2"/>
      <stop offset="1" stop-color="#c6d4e0"/>
    </linearGradient>
    <linearGradient id="oefenVloer" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e6bd84"/>
      <stop offset="1" stop-color="#d4a868"/>
    </linearGradient>
  </defs>
</svg>
`;
