// Mama de zangeres — een platte Toca-Boca-stijl SVG (heel lichaam) voor het
// rondlopende, zingende Mama-figuur op het huis-overzicht. Zelfstandig: geen
// externe resources. Gradient-/clip-id's zijn uniek geprefixt met "mama" zodat
// ze niet botsen met andere SVG's op de pagina.
//
// Stijlconventies sluiten aan op src/art/meubels.js (platte vormen, ronde hoeken,
// vrolijke kleuren). Mama heeft expliciet DONKERBRUIN haar (#3a2310 met lichter
// accent #6e4626), een vrolijk gezicht met roze wangen en een OPEN ZINGENDE mond, een
// kleurrijke sterrenjurk (ze is een artiest), en ze houdt een microfoon vast bij
// haar mond — één arm omhoog in een duidelijke zang-pose.

export const mamaSVG = `<svg viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg" class="mama-svg" aria-hidden="true">
  <defs>
    <linearGradient id="mamaJurk" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#b98cff"/>
      <stop offset="1" stop-color="#8f5cff"/>
    </linearGradient>
    <linearGradient id="mamaHaar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5e3a1e"/>
      <stop offset="1" stop-color="#3a2310"/>
    </linearGradient>
  </defs>

  <!-- zachte schaduw onder de voeten -->
  <ellipse cx="60" cy="193" rx="30" ry="6" fill="rgba(43,58,85,.18)"/>

  <!-- benen -->
  <rect x="48" y="150" width="11" height="38" rx="5.5" fill="#f0b48a"/>
  <rect x="61" y="150" width="11" height="38" rx="5.5" fill="#f0b48a"/>
  <!-- schoentjes -->
  <path d="M44 186 h17 a5 5 0 0 1 5 5 v2 h-22 Z" fill="#ff5c8a"/>
  <path d="M59 186 h17 a5 5 0 0 1 5 5 v2 h-22 Z" fill="#ff5c8a"/>

  <!-- jurk (kleurrijk, met zwierige zoom) -->
  <path d="M60 78 C42 80 36 96 33 150 C44 160 76 160 87 150 C84 96 78 80 60 78 Z" fill="url(#mamaJurk)"/>
  <!-- vrolijke sterren + stippen op de jurk -->
  <circle cx="48" cy="106" r="3.4" fill="#ffe066"/>
  <circle cx="72" cy="118" r="3.4" fill="#7bd88f"/>
  <circle cx="55" cy="134" r="3.4" fill="#ff8fb6"/>
  <path d="M70 96 l1.6 3.4 3.7 .4 -2.8 2.5 .8 3.7 -3.3 -1.9 -3.3 1.9 .8 -3.7 -2.8 -2.5 3.7 -.4 Z" fill="#ffe066"/>
  <path d="M46 124 l1.3 2.8 3 .3 -2.3 2 .7 3 -2.7 -1.5 -2.7 1.5 .7 -3 -2.3 -2 3 -.3 Z" fill="#ffffff"/>
  <!-- jurk-zoom accent -->
  <path d="M33 150 C44 160 76 160 87 150 C86 145 84 142 84 142 C74 151 46 151 36 142 C36 142 34 145 33 150 Z" fill="#6fd0ff"/>

  <!-- rechterarm omlaag langs het lichaam -->
  <path d="M40 92 C30 100 28 116 31 128 C33 132 38 132 39 128 C37 116 40 104 46 98 Z" fill="#f0b48a"/>

  <!-- linkerarm omhoog naar de microfoon (zang-pose) -->
  <path d="M78 90 C90 86 96 74 96 64 C96 60 90 60 88 63 C86 72 80 80 72 84 Z" fill="#f0b48a"/>

  <!-- hals -->
  <rect x="55" y="66" width="10" height="14" rx="5" fill="#f0b48a"/>

  <!-- hoofd -->
  <circle cx="60" cy="48" r="26" fill="#f7c39c"/>

  <!-- BRUIN haar: bol bovenop + losse lokken langs het gezicht -->
  <path d="M34 48 C32 24 50 16 60 16 C70 16 88 24 86 48 C82 40 78 36 78 36 C76 30 64 28 60 28 C56 28 44 30 42 36 C42 36 38 40 34 48 Z" fill="url(#mamaHaar)"/>
  <path d="M34 46 C30 58 31 70 35 80 C38 70 36 58 38 50 Z" fill="url(#mamaHaar)"/>
  <path d="M86 46 C90 58 89 70 85 80 C82 70 84 58 82 50 Z" fill="url(#mamaHaar)"/>
  <!-- lichter haar-accent (glans) -->
  <path d="M48 24 C54 19 66 19 72 24 C66 22 54 22 48 24 Z" fill="#6e4626"/>

  <!-- ogen -->
  <circle cx="51" cy="47" r="3.4" fill="#2b3a55"/>
  <circle cx="69" cy="47" r="3.4" fill="#2b3a55"/>
  <circle cx="52.2" cy="45.8" r="1.1" fill="#ffffff"/>
  <circle cx="70.2" cy="45.8" r="1.1" fill="#ffffff"/>
  <!-- wenkbrauwen (vrolijk omhoog) -->
  <path d="M46 40 q5 -3 10 0" stroke="#4a2d16" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M64 40 q5 -3 10 0" stroke="#4a2d16" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- roze wangen -->
  <circle cx="44" cy="55" r="4.5" fill="#ff9ec2" opacity="0.7"/>
  <circle cx="76" cy="55" r="4.5" fill="#ff9ec2" opacity="0.7"/>

  <!-- OPEN ZINGENDE mond ("aaah") -->
  <ellipse cx="60" cy="60" rx="6" ry="8" fill="#9c3a52"/>
  <ellipse cx="60" cy="63" rx="3.4" ry="4" fill="#ff7d99"/>

  <!-- microfoon bij de mond -->
  <g>
    <rect x="83" y="58" width="6" height="22" rx="3" transform="rotate(-32 86 69)" fill="#3a4a66"/>
    <circle cx="73" cy="60" r="8" fill="#5a6b88"/>
    <circle cx="73" cy="60" r="5.5" fill="#8fa0bd"/>
    <line x1="69" y1="58" x2="77" y2="62" stroke="#3a4a66" stroke-width="1.4"/>
    <line x1="70" y1="61" x2="76" y2="58" stroke="#3a4a66" stroke-width="1.4"/>
  </g>
</svg>`;
