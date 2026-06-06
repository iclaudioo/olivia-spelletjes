// Zelfstandige Olivia-figuur voor de homepage (geen afhankelijkheden), in dezelfde
// platte stijl als het spel: lichtbruin/donkerblond haar, vrolijke roze jurk.
// (Bewust een eigen kopie zodat homepage en spel los gebouwd kunnen worden; later
//  kunnen we dit naar een gedeelde art-module tillen — Fase 2.)
export const oliviaSVG = `<svg viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="ohaar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#cda66c"/><stop offset="1" stop-color="#b1854a"/>
    </linearGradient>
    <linearGradient id="ojurk" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ff9ec2"/><stop offset="1" stop-color="#ff6fa5"/>
    </linearGradient>
  </defs>
  <ellipse cx="60" cy="193" rx="26" ry="5" fill="rgba(43,58,85,.16)"/>
  <rect x="51" y="150" width="7" height="34" rx="3.5" fill="#f7c39c"/>
  <rect x="62" y="150" width="7" height="34" rx="3.5" fill="#f7c39c"/>
  <path d="M46 182 h13 v7 h-15 a2 2 0 0 1 2 -7 Z" fill="#ff6fa5"/>
  <path d="M61 182 h13 a2 2 0 0 1 2 7 h-15 Z" fill="#ff6fa5"/>
  <path d="M60 84 C46 86 42 100 38 150 C48 158 72 158 82 150 C78 100 74 86 60 84 Z" fill="url(#ojurk)"/>
  <path d="M42 96 C32 104 28 116 30 126 C33 129 37 128 38 124 C38 114 44 106 50 102 Z" fill="#f7c39c"/>
  <path d="M78 96 C88 104 92 116 90 126 C87 129 83 128 82 124 C82 114 76 106 70 102 Z" fill="#f7c39c"/>
  <rect x="55" y="72" width="10" height="14" rx="5" fill="#f7c39c"/>
  <circle cx="60" cy="52" r="26" fill="#f7c39c"/>
  <path d="M34 54 C32 28 50 20 60 20 C70 20 88 28 86 54 C84 44 80 40 80 40 C80 30 66 30 60 30 C54 30 40 30 40 40 C40 40 36 44 34 54 Z" fill="url(#ohaar)"/>
  <path d="M34 52 C30 60 30 78 33 92 C36 86 36 70 38 60 Z" fill="url(#ohaar)"/>
  <path d="M86 52 C90 60 90 78 87 92 C84 86 84 70 82 60 Z" fill="url(#ohaar)"/>
  <circle cx="51" cy="52" r="3.4" fill="#2b3a55"/>
  <circle cx="69" cy="52" r="3.4" fill="#2b3a55"/>
  <circle cx="52.2" cy="50.8" r="1.1" fill="#fff"/>
  <circle cx="70.2" cy="50.8" r="1.1" fill="#fff"/>
  <circle cx="45" cy="59" r="4" fill="#ff9ec2" opacity=".7"/>
  <circle cx="75" cy="59" r="4" fill="#ff9ec2" opacity=".7"/>
  <path d="M52 62 Q60 70 68 62" stroke="#9c3a52" stroke-width="2.4" fill="none" stroke-linecap="round"/>
</svg>`;
