// Bouwt Olivia's site in één gecombineerde dist/:
//   1) homepage  → dist/            (leegt dist eerst)
//   2) poetsen   → dist/spelletjes/poetsen/  (relatieve base)
//   3) panini    → dist/spelletjes/panini/   (relatieve base)
// Volgorde is belangrijk: de homepage-build leegt dist/, daarna vullen de spel-builds
// hun submappen. Vite draait per app met de submap als cwd (root = cwd, public = ./public).
import { execSync } from "node:child_process";

function bouw(label, cmd, cwd) {
  console.log(`\n▶ ${label}`);
  try {
    execSync(cmd, { cwd, stdio: "inherit" });
  } catch {
    console.error(`\n✗ ${label} build mislukt (cwd: ${cwd})`);
    process.exit(1);
  }
}

bouw("Homepage", "npx vite build --outDir ../dist --emptyOutDir", "homepage");
bouw(
  "Poetsen",
  "npx vite build --base=./ --outDir ../../dist/spelletjes/poetsen --emptyOutDir",
  "spelletjes/poetsen"
);
bouw(
  "Panini",
  "npx vite build --base=./ --outDir ../../dist/spelletjes/panini --emptyOutDir",
  "spelletjes/panini"
);

console.log("\n✓ Klaar: dist/ bevat de homepage + spelletjes/poetsen/ + spelletjes/panini/");
