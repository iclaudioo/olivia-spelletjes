// Olivia het K-pop-kind — een platte Toca-Boca-stijl SVG (heel lichaam) voor het
// dansfeestje. Zelfstandig: geen externe resources. Gradient-/clip-id's zijn
// uniek geprefixt met "olivia" zodat ze niet botsen met Mama of andere SVG's op
// de pagina.
//
// Stijlconventies sluiten aan op src/art/mama.js en src/art/meubels.js (platte
// vormen, ronde hoeken, vrolijke kleuren). Olivia is duidelijk een KIND en geen
// volwassene: kleiner postuur, ronder gezicht, GEEN microfoon. Ze is herkenbaar
// als K-pop-fan: LICHTBRUIN/DONKERBLOND haar in twee hoge knotjes/staartjes met
// kleurige elastiekjes, grote blije ogen, roze wangen, en een vrolijke neon/pastel
// K-pop-outfit (kort topje + rokje + beenwarmers).
//
// AANPASBAAR: haar uiterlijk is makkelijk te wijzigen — pas de kleuren in de
// <defs>-gradients aan (oliviaHaar = haarkleur, oliviaTop/oliviaRok = outfit) of
// verwissel de emoji-loze losse vormen. De viewBox blijft "0 0 120 200" zodat
// Olivia op dezelfde schaal naast Mama danst.

export const oliviaSVG = `<svg viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg" class="olivia-svg" aria-hidden="true">
  <defs>
    <linearGradient id="oliviaTop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ff7fd0"/>
      <stop offset="1" stop-color="#ff4fb0"/>
    </linearGradient>
    <linearGradient id="oliviaRok" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#62e6ff"/>
      <stop offset="1" stop-color="#37c0ff"/>
    </linearGradient>
    <linearGradient id="oliviaHaar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#cda66c"/>
      <stop offset="1" stop-color="#b1854a"/>
    </linearGradient>
  </defs>

  <!-- zachte schaduw onder de voeten -->
  <ellipse cx="60" cy="193" rx="26" ry="6" fill="rgba(43,58,85,.18)"/>

  <!-- benen (kindje: korter) -->
  <rect x="50" y="156" width="9" height="30" rx="4.5" fill="#f7c39c"/>
  <rect x="61" y="156" width="9" height="30" rx="4.5" fill="#f7c39c"/>
  <!-- kleurige beenwarmers (K-pop accent) -->
  <rect x="49" y="168" width="11" height="14" rx="4" fill="#ffe066"/>
  <rect x="60" y="168" width="11" height="14" rx="4" fill="#7bd88f"/>
  <!-- sneakers -->
  <path d="M46 184 h15 a5 5 0 0 1 5 5 v3 h-20 Z" fill="#ffffff"/>
  <path d="M59 184 h15 a5 5 0 0 1 5 5 v3 h-20 Z" fill="#ffffff"/>
  <rect x="46" y="190" width="20" height="3" rx="1.5" fill="#ff4fb0"/>
  <rect x="59" y="190" width="20" height="3" rx="1.5" fill="#37c0ff"/>

  <!-- rokje (zwierig, neon-blauw) -->
  <path d="M60 120 C46 122 42 134 39 158 C48 166 72 166 81 158 C78 134 74 122 60 120 Z" fill="url(#oliviaRok)"/>
  <!-- vrolijke stippen op het rokje -->
  <circle cx="52" cy="142" r="2.8" fill="#fff4c2"/>
  <circle cx="68" cy="148" r="2.8" fill="#ff9ec2"/>

  <!-- kort topje (neon-roze) -->
  <path d="M60 88 C48 89 44 100 44 118 C50 124 70 124 76 118 C76 100 72 89 60 88 Z" fill="url(#oliviaTop)"/>
  <!-- glittersterretje op het topje -->
  <path d="M60 100 l1.5 3.2 3.5 .4 -2.6 2.3 .7 3.5 -3.1 -1.8 -3.1 1.8 .7 -3.5 -2.6 -2.3 3.5 -.4 Z" fill="#fff4c2"/>

  <!-- armen omhoog in een vrolijke dans-pose (twee handen in de lucht) -->
  <path d="M46 96 C36 90 30 78 30 68 C30 64 36 64 38 67 C40 78 48 88 54 92 Z" fill="#f7c39c"/>
  <path d="M74 96 C84 90 90 78 90 68 C90 64 84 64 82 67 C80 78 72 88 66 92 Z" fill="#f7c39c"/>
  <!-- handjes -->
  <circle cx="33" cy="67" r="5" fill="#f7c39c"/>
  <circle cx="87" cy="67" r="5" fill="#f7c39c"/>

  <!-- hals -->
  <rect x="55" y="78" width="10" height="12" rx="5" fill="#f7c39c"/>

  <!-- hoofd (kindje: groot en rond) -->
  <circle cx="60" cy="56" r="25" fill="#ffd3ad"/>

  <!-- twee hoge knotjes/staartjes met kleurige elastiekjes -->
  <circle cx="38" cy="26" r="13" fill="url(#oliviaHaar)"/>
  <circle cx="82" cy="26" r="13" fill="url(#oliviaHaar)"/>
  <!-- kleurige elastiekjes (knot-bandjes) -->
  <rect x="33" y="34" width="10" height="6" rx="3" fill="#ff4fb0"/>
  <rect x="77" y="34" width="10" height="6" rx="3" fill="#37c0ff"/>

  <!-- haar (lichtbruin/donkerblond): pony + bol bovenop het hoofd -->
  <path d="M35 54 C33 30 48 22 60 22 C72 22 87 30 85 54 C81 46 77 42 77 42 C75 36 64 34 60 34 C56 34 45 36 43 42 C43 42 39 46 35 54 Z" fill="url(#oliviaHaar)"/>
  <!-- losse haarlokken langs het gezicht -->
  <path d="M35 52 C31 62 32 72 35 80 C38 72 37 62 39 56 Z" fill="url(#oliviaHaar)"/>
  <path d="M85 52 C89 62 88 72 85 80 C82 72 83 62 81 56 Z" fill="url(#oliviaHaar)"/>

  <!-- grote, blije ogen -->
  <circle cx="51" cy="55" r="4.2" fill="#2b3a55"/>
  <circle cx="69" cy="55" r="4.2" fill="#2b3a55"/>
  <circle cx="52.4" cy="53.4" r="1.5" fill="#ffffff"/>
  <circle cx="70.4" cy="53.4" r="1.5" fill="#ffffff"/>
  <!-- vrolijke wenkbrauwen -->
  <path d="M46 47 q5 -3 10 0" stroke="#9c7338" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M64 47 q5 -3 10 0" stroke="#9c7338" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- roze wangen -->
  <circle cx="44" cy="63" r="4.5" fill="#ff9ec2" opacity="0.75"/>
  <circle cx="76" cy="63" r="4.5" fill="#ff9ec2" opacity="0.75"/>

  <!-- grote blije (zingende) glimlach -->
  <path d="M51 66 Q60 76 69 66 Q60 71 51 66 Z" fill="#9c3a52"/>
  <path d="M54 67 Q60 72 66 67 Q60 70 54 67 Z" fill="#ff7d99"/>

  <!-- klein sterretje-haarspeldje (K-pop accent) -->
  <path d="M72 34 l1.2 2.6 2.8 .3 -2.1 1.8 .6 2.8 -2.5 -1.5 -2.5 1.5 .6 -2.8 -2.1 -1.8 2.8 -.3 Z" fill="#ffe066"/>
</svg>`;
