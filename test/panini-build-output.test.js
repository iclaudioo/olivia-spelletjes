import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

test('Panini production build includes all runtime scripts', () => {
  execFileSync('npm', ['run', 'build'], { stdio: 'pipe' });

  const indexPath = join(process.cwd(), 'dist/spelletjes/panini/index.html');
  const html = readFileSync(indexPath, 'utf8');

  assert.equal(html.includes('./src/batches.js'), false);
  assert.equal(html.includes('./src/cloud.js'), false);
  assert.equal(existsSync(join(process.cwd(), 'dist/spelletjes/panini/assets')), true);
  assert.equal(existsSync(join(process.cwd(), 'dist/spelletjes/panini/sync.html')), false);
});

test('Homepage opens Panini through family entry without exposing owner token', () => {
  execFileSync('npm', ['run', 'build'], { stdio: 'pipe' });

  const assetsDir = join(process.cwd(), 'dist/assets');
  const homepageBundle = readdirSync(assetsDir)
    .filter((name) => name.endsWith('.js'))
    .map((name) => readFileSync(join(assetsDir, name), 'utf8'))
    .join('\n');

  assert.equal(homepageBundle.includes('/spelletjes/panini/?familie=1'), true);
  assert.equal(homepageBundle.includes('/spelletjes/panini/?koppel='), false);
});
