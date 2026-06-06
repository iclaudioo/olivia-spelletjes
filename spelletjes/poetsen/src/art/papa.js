// Papa — een platte Toca-Boca-stijl SVG (heel lichaam) voor het vriendelijke
// Papa-figuur op het beginscherm + het dansfeestje. Zelfstandig: geen externe
// resources. Gradient-id's zijn uniek geprefixt met "papa" zodat ze niet botsen
// met Mama (mama…) of Olivia (olivia…) op dezelfde pagina.
//
// Stijlconventies sluiten aan op src/art/mama.js en src/art/olivia.js (platte
// vormen, ronde hoeken, vrolijke kleuren). Papa is een vriendelijke volwassene
// zoals Olivia's echte papa: KAAL (glad hoofd met een zachte glans, geen haar),
// een NETTE KORTE BAARD langs de kaaklijn (met klein snorretje), een
// DONKERBLAUWE BRIL, een WITTE POLO (met kraag + knoopjes) en een
// DONKERBLAUWE (lange) BROEK. Blije ogen met lichtjes, een vrolijke glimlach en
// roze wangen. GEEN microfoon — hij staat er gewoon blij bij met zijn armen een
// beetje open (klaar voor een knuffel). De viewBox blijft "0 0 120 200" net als
// Mama/Olivia.

export const papaSVG = `<svg viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg" class="papa-svg" aria-hidden="true">
  <defs>
    <linearGradient id="papaShirt" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#e7ecf3"/>
    </linearGradient>
    <linearGradient id="papaBaard" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#6e4a2c"/>
      <stop offset="1" stop-color="#4e3119"/>
    </linearGradient>
  </defs>

  <!-- zachte schaduw onder de voeten -->
  <ellipse cx="60" cy="193" rx="31" ry="6" fill="rgba(43,58,85,.18)"/>

  <!-- benen (donkerblauwe lange broek) -->
  <rect x="47" y="150" width="12" height="40" rx="5.5" fill="#26386e"/>
  <rect x="61" y="150" width="12" height="40" rx="5.5" fill="#26386e"/>
  <!-- witte sneakers met donkerblauwe zool -->
  <path d="M43 186 h18 a5 5 0 0 1 5 5 v2 h-23 Z" fill="#eef2f8"/>
  <path d="M59 186 h18 a5 5 0 0 1 5 5 v2 h-23 Z" fill="#eef2f8"/>
  <path d="M43 192 h23 v2 h-23 Z" fill="#26386e"/>
  <path d="M59 192 h23 v2 h-23 Z" fill="#26386e"/>

  <!-- witte polo -->
  <path d="M60 80 C44 82 38 96 36 148 C46 156 74 156 84 148 C82 96 76 82 60 80 Z" fill="url(#papaShirt)"/>

  <!-- linker korte mouw (wit) + blote onderarm + hand -->
  <path d="M44 90 C33 93 28 104 31 114 C35 117 41 115 43 110 C44 102 48 96 52 94 Z" fill="url(#papaShirt)"/>
  <path d="M31 112 C29 120 29 128 31 134 C34 137 39 136 39 131 C39 124 40 117 41 111 C38 110 34 110 31 112 Z" fill="#f0b48a"/>
  <circle cx="34" cy="136" r="5.4" fill="#f0b48a"/>

  <!-- rechter korte mouw (wit) + blote onderarm + hand -->
  <path d="M76 90 C87 93 92 104 89 114 C85 117 79 115 77 110 C76 102 72 96 68 94 Z" fill="url(#papaShirt)"/>
  <path d="M89 112 C91 120 91 128 89 134 C86 137 81 136 81 131 C81 124 80 117 79 111 C82 110 86 110 89 112 Z" fill="#f0b48a"/>
  <circle cx="86" cy="136" r="5.4" fill="#f0b48a"/>

  <!-- hals -->
  <rect x="55" y="68" width="10" height="14" rx="5" fill="#f0b48a"/>

  <!-- polo-kraag: een stukje blote hals + twee witte kraagpunten + knoopjes -->
  <path d="M56 80 L60 88 L64 80 Z" fill="#f0b48a"/>
  <path d="M50 79 L52 88 L60 90 L60 83 Z" fill="#ffffff" stroke="#cdd8e8" stroke-width="1.2" stroke-linejoin="round"/>
  <path d="M70 79 L68 88 L60 90 L60 83 Z" fill="#ffffff" stroke="#cdd8e8" stroke-width="1.2" stroke-linejoin="round"/>
  <line x1="60" y1="90" x2="60" y2="104" stroke="#cdd8e8" stroke-width="1.4"/>
  <circle cx="60" cy="95" r="1.3" fill="#cdd8e8"/>
  <circle cx="60" cy="101" r="1.3" fill="#cdd8e8"/>

  <!-- hoofd -->
  <circle cx="60" cy="50" r="26" fill="#f7c39c"/>
  <!-- KAAL: zachte glans bovenop het gladde hoofd (geen haar) -->
  <ellipse cx="53" cy="33" rx="9" ry="5.5" fill="#ffffff" opacity="0.22"/>

  <!-- nette korte baard langs de kaaklijn (de glimlach blijft vrij) -->
  <path d="M38 53 C36 63 41 73 50 76.5 C56.5 79 63.5 79 70 76.5 C79 73 84 63 82 53 C79.5 61 73 66.5 66 67.5 C61 68.2 59 68.2 54 67.5 C47 66.5 40.5 61 38 53 Z" fill="url(#papaBaard)"/>
  <!-- klein snorretje boven de glimlach, sluit aan op de baard -->
  <path d="M50 58 Q60 56 70 58 Q60 61.5 50 58 Z" fill="url(#papaBaard)"/>

  <!-- blije ogen met lichtjes -->
  <circle cx="51" cy="49" r="3.6" fill="#2b3a55"/>
  <circle cx="69" cy="49" r="3.6" fill="#2b3a55"/>
  <circle cx="52.3" cy="47.7" r="1.2" fill="#ffffff"/>
  <circle cx="70.3" cy="47.7" r="1.2" fill="#ffffff"/>
  <!-- vrolijke wenkbrauwen (omhoog) -->
  <path d="M46 41 q5 -3 10 0" stroke="#6b5440" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M64 41 q5 -3 10 0" stroke="#6b5440" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- roze wangen -->
  <circle cx="44" cy="57" r="4.5" fill="#ff9ec2" opacity="0.7"/>
  <circle cx="76" cy="57" r="4.5" fill="#ff9ec2" opacity="0.7"/>

  <!-- donkerblauwe bril: twee glazen + brug + pootjes -->
  <circle cx="51" cy="49" r="6.4" fill="rgba(255,255,255,0.16)" stroke="#21357a" stroke-width="2.4"/>
  <circle cx="69" cy="49" r="6.4" fill="rgba(255,255,255,0.16)" stroke="#21357a" stroke-width="2.4"/>
  <path d="M57.2 48 Q60 46.4 62.8 48" fill="none" stroke="#21357a" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M44.8 47.6 L38 45.6" fill="none" stroke="#21357a" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M75.2 47.6 L82 45.6" fill="none" stroke="#21357a" stroke-width="2.4" stroke-linecap="round"/>

  <!-- vrolijke glimlach -->
  <path d="M50 60 Q60 70 70 60 Q60 67 50 60 Z" fill="#9c3a52"/>
  <path d="M54 62 Q60 66 66 62 Q60 65 54 62 Z" fill="#ff7d99"/>
</svg>`;
