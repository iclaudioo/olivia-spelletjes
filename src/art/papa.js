// Papa — een platte Toca-Boca-stijl SVG (heel lichaam) voor het vriendelijke
// Papa-figuur op het beginscherm + het dansfeestje. Zelfstandig: geen externe
// resources. Gradient-id's zijn uniek geprefixt met "papa" zodat ze niet botsen
// met Mama (mama…) of Olivia (olivia…) op dezelfde pagina.
//
// Stijlconventies sluiten aan op src/art/mama.js en src/art/olivia.js (platte
// vormen, ronde hoeken, vrolijke kleuren). Papa is een vriendelijke volwassene:
// KORT BRUIN haar, blije ogen met lichtjes, een vrolijke glimlach, roze wangen,
// en een casual BLAUW shirt (met groene mouwen-/zoom-accenten). GEEN microfoon —
// hij staat er gewoon blij bij met zijn armen een beetje open (klaar voor een
// knuffel). De viewBox blijft "0 0 120 200" net als Mama/Olivia.

export const papaSVG = `<svg viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg" class="papa-svg" aria-hidden="true">
  <defs>
    <linearGradient id="papaShirt" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5fa8ff"/>
      <stop offset="1" stop-color="#357fe0"/>
    </linearGradient>
    <linearGradient id="papaHaar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#7a4a25"/>
      <stop offset="1" stop-color="#5a3416"/>
    </linearGradient>
  </defs>

  <!-- zachte schaduw onder de voeten -->
  <ellipse cx="60" cy="193" rx="31" ry="6" fill="rgba(43,58,85,.18)"/>

  <!-- benen (lange broek) -->
  <rect x="47" y="150" width="12" height="40" rx="5.5" fill="#3a4a66"/>
  <rect x="61" y="150" width="12" height="40" rx="5.5" fill="#3a4a66"/>
  <!-- schoenen -->
  <path d="M43 186 h18 a5 5 0 0 1 5 5 v3 h-23 Z" fill="#6b4a2e"/>
  <path d="M59 186 h18 a5 5 0 0 1 5 5 v3 h-23 Z" fill="#6b4a2e"/>

  <!-- casual shirt (blauw, met groene zoom) -->
  <path d="M60 80 C44 82 38 96 36 148 C46 156 74 156 84 148 C82 96 76 82 60 80 Z" fill="url(#papaShirt)"/>
  <!-- groene zoom-accent onderaan het shirt -->
  <path d="M36 148 C46 156 74 156 84 148 C83 143 82 140 82 140 C73 148 47 148 38 140 C38 140 37 143 36 148 Z" fill="#7bd88f"/>
  <!-- vrolijk sterretje op het shirt -->
  <path d="M60 100 l1.6 3.4 3.7 .4 -2.8 2.5 .8 3.7 -3.3 -1.9 -3.3 1.9 .8 -3.7 -2.8 -2.5 3.7 -.4 Z" fill="#ffe066"/>

  <!-- linkerarm een beetje open (klaar voor een knuffel), groene mouw -->
  <path d="M40 94 C28 100 24 116 26 130 C28 134 33 134 34 130 C33 118 37 106 46 100 Z" fill="url(#papaShirt)"/>
  <path d="M28 124 C27 130 27 134 28 137 C32 136 34 132 34 129 Z" fill="#f0b48a"/>
  <circle cx="30" cy="135" r="5.2" fill="#f0b48a"/>

  <!-- rechterarm een beetje open, groene mouw -->
  <path d="M80 94 C92 100 96 116 94 130 C92 134 87 134 86 130 C87 118 83 106 74 100 Z" fill="url(#papaShirt)"/>
  <path d="M92 124 C93 130 93 134 92 137 C88 136 86 132 86 129 Z" fill="#f0b48a"/>
  <circle cx="90" cy="135" r="5.2" fill="#f0b48a"/>

  <!-- hals -->
  <rect x="55" y="68" width="10" height="14" rx="5" fill="#f0b48a"/>

  <!-- hoofd -->
  <circle cx="60" cy="50" r="26" fill="#f7c39c"/>

  <!-- KORT BRUIN haar: nette kuif bovenop het hoofd (geen lange lokken) -->
  <path d="M35 48 C33 26 50 18 60 18 C70 18 87 26 85 48 C82 41 78 37 78 37 C76 31 64 30 60 30 C56 30 44 31 42 37 C42 37 38 41 35 48 Z" fill="url(#papaHaar)"/>
  <!-- lichter haar-accent (glans) -->
  <path d="M48 26 C54 21 66 21 72 26 C66 24 54 24 48 26 Z" fill="#9c6a3a"/>

  <!-- blije ogen met lichtjes -->
  <circle cx="51" cy="49" r="3.6" fill="#2b3a55"/>
  <circle cx="69" cy="49" r="3.6" fill="#2b3a55"/>
  <circle cx="52.3" cy="47.7" r="1.2" fill="#ffffff"/>
  <circle cx="70.3" cy="47.7" r="1.2" fill="#ffffff"/>
  <!-- vrolijke wenkbrauwen (omhoog) -->
  <path d="M46 42 q5 -3 10 0" stroke="#4a2d16" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M64 42 q5 -3 10 0" stroke="#4a2d16" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- roze wangen -->
  <circle cx="44" cy="57" r="4.5" fill="#ff9ec2" opacity="0.7"/>
  <circle cx="76" cy="57" r="4.5" fill="#ff9ec2" opacity="0.7"/>

  <!-- vrolijke glimlach -->
  <path d="M50 60 Q60 70 70 60 Q60 67 50 60 Z" fill="#9c3a52"/>
  <path d="M54 62 Q60 66 66 62 Q60 65 54 62 Z" fill="#ff7d99"/>
</svg>`;
