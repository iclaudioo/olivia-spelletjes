import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

test('Panini production build includes all runtime scripts', () => {
  execFileSync('npm', ['run', 'build'], { stdio: 'pipe' });

  const indexPath = join(process.cwd(), 'dist/spelletjes/panini/index.html');
  const html = readFileSync(indexPath, 'utf8');

  assert.equal(html.includes('./src/batches.js'), false);
  assert.equal(html.includes('./src/cloud.js'), false);
  assert.equal(existsSync(join(process.cwd(), 'dist/spelletjes/panini/assets')), true);
  assert.equal(existsSync(join(process.cwd(), 'dist/spelletjes/panini/sync.html')), true);
});
