// Automatische update voor nieuwe losse stickers en dubbele stickers.
// Draait vóór main.js zodat bestaande toestellen de nieuwste batches éénmalig meekrijgen.
(() => {
  const STORE = 'olivia-panini-v3';
  const BASE = {
    MEX:[7,9,11,15,18,19,20], RSA:[1,4,5,8,11,15,17,19], KOR:[1,2,8,9,18,19], CZE:[6,11,12,17,20],
    CAN:[3,4,16,20], BIH:[1,4,5,10,15,16,17], QAT:[1,2,7,12,18,19], SUI:[2,3,4,5,6,7,9,11,13,16,17,18,19,20],
    BRA:[1,2,6,10,17,18,20], MAR:[3,7,8,9,10,18,19], HAI:[1,7,9,13,14,15,16,17,19], SCO:[1,6,15,18,20],
    USA:[2,4,12,15,17], PAR:[3,4,5,13,20], AUS:[4,5,9,10,11,13,19], TUR:[5,6,16,18],
    GER:[10,13,19,20], CUW:[2,7,9,10,11,12,13,15,16,17,18,19], CIV:[1,7,11,18], ECU:[7],
    NED:[1,2,5,10,11,13,18,19,20], JPN:[1,2,4,7,8,9,19], SWE:[1,2,3,4,6,16], TUN:[3,12,15,18,20],
    BEL:[3,7,13,19,20], EGY:[1,2,4,6,7,10,12,13,14,17], IRN:[3,6,9,11,12,20], NZL:[2,6,7,11,14,16],
    ESP:[1,4,6,7,8,12,13,19,20], CPV:[12,16,19,20], KSA:[1,2,6,8,11,12,13,16,19], URU:[3,10,11,12,15,16,17],
    FRA:[2,6,8,9,14], SEN:[4,9,12,13], IRQ:[2,3,5,10,13,16,17,20], NOR:[1,3,4,6,13,14,16,19],
    ARG:[3,4,7,16,19,20], ALG:[3,4,6,11,12,14,16], AUT:[4,13,16], JOR:[1,3,4,6,7,8,12,17,19,20],
    POR:[3,4,5,6,7,15], COD:[2,7,10,11,13,16], UZB:[8,18,19,20], COL:[5,8,13,15],
    ENG:[8,11,12,17], CRO:[1,2,10,11,12,13,14,16,17,19], GHA:[1,2,4,5,6,9,10,15,17], PAN:[1,2,5,12,13,18]
  };
  const BATCHES = [
    {
      id: 'loose-stickers-2026-06-20-01',
      stickers: ['JOR 3','NED 5','FRA 6','MEX 7','CRO 14','IRQ 2','IRN 9','RSA 15'],
      trades: []
    },
    {
      id: 'duplicate-stickers-2026-06-20-01',
      stickers: [],
      trades: ['CRO 13','SCO 1','CRO 10','JPN 4','ESP 4','CPV 16','SUI 20','FRA 14','TUN 3','CZE 17','CUW 12']
    }
  ];
  function parse() {
    try { return JSON.parse(localStorage.getItem(STORE) || '{}'); }
    catch { return {}; }
  }
  function unique(arr) { return [...new Set((arr || []).map(Number))].filter(Boolean).sort((a,b)=>a-b); }
  const state = parse();
  if (!state.teams) {
    state.teams = Object.fromEntries(Object.entries(BASE).map(([k,v]) => [k, unique(v)]));
    state.trades = state.trades || {};
    state.newOnes = state.newOnes || [];
  }
  state.trades = state.trades || {};
  state.appliedBatches = state.appliedBatches || [];
  for (const batch of BATCHES) {
    if (state.appliedBatches.includes(batch.id)) continue;
    for (const sticker of batch.stickers || []) {
      const [code, raw] = sticker.split(' ');
      const num = Number(raw);
      state.teams[code] = unique([...(state.teams[code] || []), num]);
      state.newOnes = state.newOnes || [];
      state.newOnes.push(sticker);
    }
    for (const trade of batch.trades || []) {
      state.trades[trade] = (state.trades[trade] || 0) + 1;
    }
    state.appliedBatches.push(batch.id);
  }
  localStorage.setItem(STORE, JSON.stringify(state));
})();
