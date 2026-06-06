// Genereert de app-iconen (PNG) zonder externe pakketten.
// Draai eenmalig:  node src/pwa/make-icons.mjs
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}
function png(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit, RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function tekenIcoon(N) {
  const buf = Buffer.alloc(N * N * 4);
  const set = (x, y, r, g, b, a = 255) => {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= N || y >= N) return;
    const i = (y * N + x) * 4;
    const af = a / 255, ia = 1 - af;
    buf[i] = r * af + buf[i] * ia;
    buf[i + 1] = g * af + buf[i + 1] * ia;
    buf[i + 2] = b * af + buf[i + 2] * ia;
    buf[i + 3] = Math.max(buf[i + 3], a);
  };
  const cirkel = (cx, cy, rad, col, soft = 1.5) => {
    for (let y = cy - rad - 2; y <= cy + rad + 2; y++)
      for (let x = cx - rad - 2; x <= cx + rad + 2; x++) {
        const d = Math.hypot(x - cx, y - cy);
        const a = Math.max(0, Math.min(1, (rad - d) / soft));
        if (a > 0) set(x, y, col[0], col[1], col[2], a * 255);
      }
  };
  const sparkle = (cx, cy, rad, col) => {
    for (let y = cy - rad; y <= cy + rad; y++)
      for (let x = cx - rad; x <= cx + rad; x++) {
        const dx = Math.abs(x - cx) / rad, dy = Math.abs(y - cy) / rad;
        const ster = dx + dy; // ruit
        const a = Math.max(0, Math.min(1, (0.32 - Math.min(ster, Math.abs(dx - dy) + Math.min(dx, dy) * 0.2)) * 6));
        // eenvoudige 4-punts sparkle: smal kruis
        const arm = (Math.abs(x - cx) < rad * 0.12 && Math.abs(y - cy) < rad) ||
                    (Math.abs(y - cy) < rad * 0.12 && Math.abs(x - cx) < rad);
        if (arm) {
          const dd = Math.max(Math.abs(x - cx), Math.abs(y - cy)) / rad;
          set(x, y, col[0], col[1], col[2], (1 - dd) * 255);
        }
      }
  };

  // achtergrond: blauwe verloop
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const t = y / N;
      const r = 0x6e + (0x3a - 0x6e) * t;
      const g = 0xc8 + (0xa0 - 0xc8) * t;
      const b = 0xff + (0xe6 - 0xff) * t;
      const i = (y * N + x) * 4;
      buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = 255;
    }

  // zeepbellen
  cirkel(N * 0.30, N * 0.66, N * 0.10, [255, 255, 255], 2);
  cirkel(N * 0.72, N * 0.30, N * 0.07, [255, 255, 255], 2);
  cirkel(N * 0.30, N * 0.66, N * 0.10, [255, 255, 255, 0], 2);
  // grote gele spons
  cirkel(N * 0.5, N * 0.52, N * 0.26, [255, 210, 74], 2);
  cirkel(N * 0.5, N * 0.52, N * 0.26, [255, 210, 74], 2);
  // sparkle
  sparkle(N * 0.5, N * 0.5, N * 0.20, [255, 255, 255]);
  sparkle(N * 0.74, N * 0.72, N * 0.09, [255, 255, 255]);

  return png(N, N, buf);
}

// Schrijf de iconen in public/ zodat Vite ze 1-op-1 (zelfde naam, geen hash)
// naar dist/ kopieert en de manifest + index.html ze op /icon-*.png vinden.
for (const N of [192, 512, 180]) {
  writeFileSync(new URL(`../../public/icon-${N}.png`, import.meta.url), tekenIcoon(N));
  console.log(`public/icon-${N}.png gemaakt`);
}
